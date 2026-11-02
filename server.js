'use strict';

// Backend sin dependencias.
// Los importes se almacenan siempre en centavos.

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const { DatabaseSync } = require('node:sqlite');

const university = require('./lib/university');
const learning = require('./lib/catalog');

const root = path.join(__dirname, 'public');
const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
// Render informa su URL HTTPS; PUBLIC_ORIGIN permite usar otro proveedor o dominio.
const publicOriginValue = process.env.PUBLIC_ORIGIN || process.env.RENDER_EXTERNAL_URL;
const publicOrigin = publicOriginValue ? new URL(publicOriginValue).origin : null;
const secureCookie = publicOrigin?.startsWith('https://') ? '; Secure' : '';

fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, 'nexo.sqlite'));

db.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    career TEXT NOT NULL,
    bio TEXT NOT NULL,
    account TEXT UNIQUE NOT NULL,
    balance INTEGER NOT NULL DEFAULT 100000
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    expires INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS movements (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    description TEXT NOT NULL,
    amount INTEGER NOT NULL,
    balance INTEGER NOT NULL,
    created TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS attempts (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    course TEXT NOT NULL,
    answers TEXT NOT NULL,
    score INTEGER NOT NULL,
    created TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migración aditiva:
// conserva usuarios, saldos y registros de la versión anterior.

db.exec(`
  CREATE TABLE IF NOT EXISTS university_students (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    student_code TEXT UNIQUE NOT NULL,
    current_semester INTEGER NOT NULL DEFAULT 4,
    total_semesters INTEGER NOT NULL DEFAULT 8,
    initialized TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS university_invoices (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    semester INTEGER NOT NULL,
    period TEXT NOT NULL,
    month TEXT NOT NULL,
    due_date TEXT NOT NULL,
    amount INTEGER NOT NULL CHECK(amount > 0),
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK(status IN ('pending', 'paid')),
    demo_paid INTEGER NOT NULL DEFAULT 0,
    paid_at TEXT,
    UNIQUE(user_id, period, month)
  );

  CREATE TABLE IF NOT EXISTS university_payments (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    request_key TEXT NOT NULL,
    invoice_ids TEXT NOT NULL,
    principal INTEGER NOT NULL,
    penalty INTEGER NOT NULL,
    total INTEGER NOT NULL,
    topup INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    payer_name TEXT NOT NULL,
    account TEXT NOT NULL,
    student_code TEXT NOT NULL,
    movement_id INTEGER NOT NULL REFERENCES movements(id),
    created TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, request_key)
  );

  CREATE TABLE IF NOT EXISTS university_payment_items (
    id INTEGER PRIMARY KEY,
    payment_id INTEGER NOT NULL REFERENCES university_payments(id),
    invoice_id INTEGER NOT NULL UNIQUE REFERENCES university_invoices(id),
    semester INTEGER NOT NULL,
    period TEXT NOT NULL,
    month TEXT NOT NULL,
    due_date TEXT NOT NULL,
    principal INTEGER NOT NULL,
    late_months INTEGER NOT NULL,
    penalty INTEGER NOT NULL,
    total INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS university_invoices_user
    ON university_invoices(user_id);

  CREATE INDEX IF NOT EXISTS university_payments_user
    ON university_payments(user_id);
`);

const query = (sql, ...args) => db.prepare(sql).all(...args);
const one = (sql, ...args) => db.prepare(sql).get(...args);
const run = (sql, ...args) => db.prepare(sql).run(...args);

const fail = (message, status = 400) => {
  const e = new Error(message);

  e.status = status;

  throw e;
};

const text = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

const required = (v, label, max = 200) => {
  const result = text(v, max);

  if (!result) {
    fail('Completa ' + label + '.');
  }

  return result;
};

const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  career: u.career,
  bio: u.bio,
  account: u.account,
  balance: u.balance
});

function transaction(action) {
  db.exec('BEGIN IMMEDIATE');

  try {
    const result = action();

    db.exec('COMMIT');

    return result;
  } catch (e) {
    db.exec('ROLLBACK');

    throw e;
  }
}

async function body(req) {
  let raw = '';

  for await (const chunk of req) {
    raw += chunk;

    if (Buffer.byteLength(raw) > 20000) {
      fail('Solicitud demasiado grande.', 413);
    }
  }

  try {
    return JSON.parse(raw || '{}');
  } catch {
    fail('JSON inválido.');
  }
}

function send(res, data, status = 200, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers
  });

  res.end(JSON.stringify(data));
}

function authenticate(req) {
  const token = (req.headers.cookie || '')
    .split(';')
    .map((x) => x.trim())
    .find((x) => x.startsWith('nexo='))
    ?.slice(5);

  return token
    ? one(
        'SELECT u.* FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token=? AND s.expires>?',
        token,
        Date.now()
      )
    : null;
}

function courseForUser(user, id) {
  if (!learning.byId[id]) {
    fail('Este curso no existe.', 404);
  }

  if (!learning.accessible(user.career, id)) {
    fail('Este curso corresponde a otra carrera. Consulta tu catálogo actual.', 403);
  }

  return learning.byId[id];
}

function ensureUniversityStudent(userId) {
  if (one('SELECT user_id FROM university_students WHERE user_id=?', userId)) {
    return;
  }

  const today = university.guatemalaToday();

  transaction(() => {
    // La comprobación dentro de la transacción
    // evita inicializaciones duplicadas.

    if (one('SELECT user_id FROM university_students WHERE user_id=?', userId)) {
      return;
    }

    run(
      'INSERT INTO university_students(user_id,student_code,initialized) VALUES(?,?,?)',
      userId,
      'NXU-' + String(userId).padStart(6, '0'),
      today
    );

    for (const invoice of university.createDemoPlan(today)) {
      run(
        `
          INSERT INTO university_invoices (
            user_id,
            semester,
            period,
            month,
            due_date,
            amount,
            status,
            demo_paid,
            paid_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        userId,
        invoice.semester,
        invoice.period,
        invoice.month,
        invoice.due_date,
        invoice.amount,
        invoice.status,
        invoice.demo_paid,
        invoice.demo_paid ? invoice.due_date + ' 12:00:00' : null
      );
    }
  });
}

function universityData(user) {
  ensureUniversityStudent(user.id);

  const today = university.guatemalaToday();

  const { invoices, summary } = university.summarize(
    query(
      `
        SELECT
          i.*,
          (
            SELECT payment_id
            FROM university_payment_items
            WHERE invoice_id = i.id
          ) AS receipt_id
        FROM university_invoices i
        WHERE i.user_id = ?
        ORDER BY i.due_date
      `,
      user.id
    ),
    today
  );

  const semesters = [...new Set(invoices.map((i) => i.semester))].map((number) => {
    const items = invoices.filter((i) => i.semester === number);

    return {
      number,
      period: items[0].period,
      paid: items.filter((i) => i.state === 'paid').length,
      count: items.length,
      overdue: items.filter((i) => i.state === 'overdue').length,
      total: items.reduce((sum, i) => sum + i.total, 0),
      principal: items
        .filter((i) => i.state !== 'paid')
        .reduce((sum, i) => sum + i.amount, 0),
      penalties: items.reduce((sum, i) => sum + i.penalty, 0)
    };
  });

  return {
    today,
    student: one('SELECT * FROM university_students WHERE user_id=?', user.id),
    user: publicUser(one('SELECT * FROM users WHERE id=?', user.id)),
    invoices,
    summary,
    semesters,
    payments: query(
      'SELECT id,total,principal,penalty,created FROM university_payments WHERE user_id=? ORDER BY id DESC',
      user.id
    )
  };
}

function receipt(userId, id) {
  const payment = one(
    'SELECT * FROM university_payments WHERE id=? AND user_id=?',
    id,
    userId
  );

  if (!payment) {
    fail('No se encontró el recibo en tu cuenta.', 404);
  }

  return {
    payment,
    items: query(
      'SELECT * FROM university_payment_items WHERE payment_id=? ORDER BY due_date',
      id
    )
  };
}

function payUniversity(user, b) {
  ensureUniversityStudent(user.id);

  if (
    !Array.isArray(b.invoiceIds) ||
    b.invoiceIds.length === 0 ||
    b.invoiceIds.length > 100 ||
    b.invoiceIds.some((id) => !Number.isSafeInteger(id) || id <= 0) ||
    new Set(b.invoiceIds).size !== b.invoiceIds.length
  ) {
    fail('Selecciona cuotas válidas sin repetir.');
  }

  if (typeof b.requestKey !== 'string' || !/^[a-zA-Z0-9-]{16,80}$/.test(b.requestKey)) {
    fail('Identificador de pago inválido.');
  }

  const ids = [...b.invoiceIds].sort((a, b) => a - b);

  return transaction(() => {
    const previous = one(
      'SELECT * FROM university_payments WHERE user_id=? AND request_key=?',
      user.id,
      b.requestKey
    );

    if (previous) {
      if (previous.invoice_ids !== JSON.stringify(ids)) {
        fail('Ese identificador ya corresponde a otro pago.', 409);
      }

      return receipt(user.id, previous.id);
    }

    const today = university.guatemalaToday();

    const invoices = ids.map((id) => {
      const invoice = one(
        'SELECT * FROM university_invoices WHERE id=? AND user_id=?',
        id,
        user.id
      );

      if (!invoice) {
        fail('Una de las cuotas no pertenece a tu cuenta.', 404);
      }

      if (invoice.status === 'paid') {
        fail('Una de las cuotas ya fue pagada. Actualiza el estado de cuenta.', 409);
      }

      return university.priceInvoice(invoice, today);
    });

    const principal = invoices.reduce((sum, i) => sum + i.amount, 0);

    const penalty = invoices.reduce((sum, i) => sum + i.penalty, 0);

    const total = principal + penalty;

    const current = one('SELECT * FROM users WHERE id=?', user.id);

    // Fondos ilimitados para la práctica:
    // abonar solo lo necesario, sin Infinity en la base de datos
    // y sin romper la conciliación del estado de cuenta.

    const topup = Math.max(0, total - current.balance);

    if (topup) {
      run('UPDATE users SET balance=balance+? WHERE id=?', topup, user.id);

      run(
        'INSERT INTO movements(user_id,description,amount,balance) VALUES(?,?,?,?)',
        user.id,
        'Fondos de práctica · abono automático para la universidad',
        topup,
        current.balance + topup
      );
    }

    const balanceAfter = current.balance + topup - total;

    const student = one(
      'SELECT student_code FROM university_students WHERE user_id=?',
      user.id
    );

    run('UPDATE users SET balance=? WHERE id=?', balanceAfter, user.id);

    const movement = run(
      'INSERT INTO movements(user_id,description,amount,balance) VALUES(?,?,?,?)',
      user.id,
      'Universidad Nexo · ' + invoices.length + ' cuota(s) · ' + student.student_code,
      -total,
      balanceAfter
    );

    const payment = run(
      `
        INSERT INTO university_payments (
          user_id,
          request_key,
          invoice_ids,
          principal,
          penalty,
          total,
          topup,
          balance_after,
          payer_name,
          account,
          student_code,
          movement_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      user.id,
      b.requestKey,
      JSON.stringify(ids),
      principal,
      penalty,
      total,
      topup,
      balanceAfter,
      current.name,
      current.account,
      student.student_code,
      Number(movement.lastInsertRowid)
    );

    const paymentId = Number(payment.lastInsertRowid);

    for (const i of invoices) {
      run(
        "UPDATE university_invoices SET status='paid',paid_at=CURRENT_TIMESTAMP WHERE id=?",
        i.id
      );

      run(
        `
          INSERT INTO university_payment_items (
            payment_id,
            invoice_id,
            semester,
            period,
            month,
            due_date,
            principal,
            late_months,
            penalty,
            total
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        paymentId,
        i.id,
        i.semester,
        i.period,
        i.month,
        i.due_date,
        i.amount,
        i.lateMonths,
        i.penalty,
        i.total
      );
    }

    return receipt(user.id, paymentId);
  });
}

async function api(req, res, url) {
  const route = url.pathname;
  const method = req.method;

  if (method === 'POST' && ['/api/register', '/api/login'].includes(route)) {
    const b = await body(req);
    const email = required(b.email, 'el correo').toLowerCase();
    const password = required(b.password, 'la contraseña', 128);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fail('Escribe un correo válido.');
    }

    let user;

    if (route === '/api/register') {
      if (password.length < 8) {
        fail('La contraseña debe tener al menos 8 caracteres.');
      }

      if (one('SELECT id FROM users WHERE email=?', email)) {
        fail('Este correo ya está registrado.', 409);
      }

      const name = required(b.name, 'el nombre', 80);
      const career = required(b.career, 'la carrera', 80);
      const bio = text(b.bio, 400);

      const salt = crypto.randomBytes(16).toString('hex');

      const hash = crypto.scryptSync(password, salt, 64).toString('hex');

      const account = 'NX' + crypto.randomBytes(6).toString('hex').toUpperCase();

      const result = transaction(() => {
        const r = run(
          'INSERT INTO users(name,email,password,career,bio,account) VALUES(?,?,?,?,?,?)',
          name,
          email,
          salt + ':' + hash,
          career,
          bio,
          account
        );

        run(
          'INSERT INTO movements(user_id,description,amount,balance) VALUES(?,?,?,?)',
          Number(r.lastInsertRowid),
          'Saldo inicial de práctica',
          100000,
          100000
        );

        return r;
      });

      user = one('SELECT * FROM users WHERE id=?', Number(result.lastInsertRowid));
    } else {
      user = one('SELECT * FROM users WHERE email=?', email);

      if (!user) {
        fail('Correo o contraseña incorrectos.', 401);
      }

      const [salt, hash] = user.password.split(':');

      if (
        !crypto.timingSafeEqual(
          crypto.scryptSync(password, salt, 64),
          Buffer.from(hash, 'hex')
        )
      ) {
        fail('Correo o contraseña incorrectos.', 401);
      }
    }

    const token = crypto.randomBytes(32).toString('hex');

    run('INSERT INTO sessions VALUES(?,?,?)', token, user.id, Date.now() + 86400000);

    return send(res, { user: publicUser(user) }, 200, {
      'Set-Cookie': `nexo=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400${secureCookie}`
    });
  }

  const user = authenticate(req);

  if (!user) {
    fail('Inicia sesión para continuar.', 401);
  }

  if (method === 'GET' && route === '/api/me') {
    return send(res, {
      user: publicUser(user)
    });
  }

  if (method === 'PATCH' && route === '/api/me/career') {
    const b = await body(req);

    if (!learning.CAREERS.includes(b.career)) {
      fail('Selecciona una de las carreras disponibles.');
    }

    run('UPDATE users SET career=? WHERE id=?', b.career, user.id);

    return send(res, {
      user: publicUser(one('SELECT * FROM users WHERE id=?', user.id))
    });
  }

  if (method === 'GET' && route === '/api/university') {
    return send(res, universityData(user));
  }

  if (method === 'POST' && route === '/api/university/pay') {
    return send(res, payUniversity(user, await body(req)));
  }

  const receiptMatch = route.match(/^\/api\/university\/receipts\/(\d+)$/);

  if (method === 'GET' && receiptMatch) {
    return send(res, receipt(user.id, Number(receiptMatch[1])));
  }

  if (method === 'POST' && route === '/api/bank/topup') {
    await body(req);

    transaction(() => {
      const current = one('SELECT balance FROM users WHERE id=?', user.id);

      const amount = 1000000;

      if (current.balance > 1000000000000 - amount) {
        fail('Tienes saldo suficiente para continuar la práctica.');
      }

      run('UPDATE users SET balance=balance+? WHERE id=?', amount, user.id);

      run(
        'INSERT INTO movements(user_id,description,amount,balance) VALUES(?,?,?,?)',
        user.id,
        'Recarga gratuita de fondos de práctica',
        amount,
        current.balance + amount
      );
    });

    return send(res, {
      user: publicUser(one('SELECT * FROM users WHERE id=?', user.id))
    });
  }

  if (method === 'POST' && route === '/api/logout') {
    const token = (req.headers.cookie || '').match(/(?:^|;\s*)nexo=([^;]+)/)?.[1];

    run('DELETE FROM sessions WHERE token=?', token || '');

    return send(res, { ok: true }, 200, {
      'Set-Cookie': `nexo=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secureCookie}`
    });
  }

  if (method === 'GET' && route === '/api/courses') {
    const attempts = query(
      'SELECT id,course,score,created FROM attempts WHERE user_id=? ORDER BY id DESC',
      user.id
    ).map((a) => ({
      ...a,
      title: learning.byId[a.course]?.title || 'Curso anterior',
      category: learning.byId[a.course]?.category || 'Formación anterior',
      currentCareer: learning.accessible(user.career, a.course)
    }));

    return send(res, {
      career: user.career,
      track: learning.GROUPS[learning.careerGroup(user.career)],
      courses: learning.forCareer(user.career).map(learning.publicCourse),
      attempts
    });
  }

  const courseMatch = route.match(/^\/api\/courses\/([a-z-]+)$/);

  if (method === 'GET' && courseMatch) {
    return send(res, {
      course: learning.publicCourse(courseForUser(user, courseMatch[1])),
      career: user.career
    });
  }

  const diplomaMatch = route.match(/^\/api\/diplomas\/(\d+)$/);

  if (method === 'GET' && diplomaMatch) {
    const attempt = one(
      'SELECT id,course,score,created FROM attempts WHERE id=? AND user_id=?',
      Number(diplomaMatch[1]),
      user.id
    );

    if (!attempt || attempt.score < 70) {
      fail('Este diploma no existe o el curso no está aprobado.', 404);
    }

    return send(res, {
      attempt,
      title: learning.byId[attempt.course]?.title || 'Curso anterior',
      category: learning.byId[attempt.course]?.category || 'Formación anterior',
      user: publicUser(user)
    });
  }

  if (method === 'POST' && route === '/api/evaluate') {
    const b = await body(req);

    courseForUser(user, b.course);

    let score;

    try {
      score = learning.grade(b.course, b.answers);
    } catch (e) {
      fail(e.message);
    }

    const r = run(
      'INSERT INTO attempts(user_id,course,answers,score) VALUES(?,?,?,?)',
      user.id,
      b.course,
      JSON.stringify(b.answers),
      score
    );

    return send(res, {
      id: Number(r.lastInsertRowid),
      score,
      passed: score >= 70
    });
  }

  if (method === 'GET' && route === '/api/bank') {
    return send(res, {
      user: publicUser(user),
      movements: query(
        'SELECT * FROM movements WHERE user_id=? ORDER BY id DESC',
        user.id
      )
    });
  }

  if (method === 'POST' && route === '/api/bank/operation') {
    const b = await body(req);
    const amount = Number(b.amount);

    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > 1000000 ||
      Math.abs(amount * 100 - Math.round(amount * 100)) > 0.00001
    ) {
      fail('Ingresa un monto positivo con máximo dos decimales.');
    }

    const cents = Math.round(amount * 100);

    transaction(() => {
      const current = one('SELECT balance FROM users WHERE id=?', user.id);

      if (current.balance < cents) {
        fail('Saldo insuficiente.');
      }

      let description;

      if (b.type === 'transfer') {
        const target = one(
          'SELECT * FROM users WHERE account=?',
          required(b.destination, 'la cuenta destino', 40).toUpperCase()
        );

        if (!target) {
          fail('La cuenta destino no existe. Registra otro usuario para transferir.');
        }

        if (target.id === user.id) {
          fail('Elige una cuenta diferente a la tuya.');
        }

        description = 'Transferencia a ' + target.name + ' · ' + target.account;

        run('UPDATE users SET balance=balance+? WHERE id=?', cents, target.id);

        run(
          'INSERT INTO movements(user_id,description,amount,balance) VALUES(?,?,?,?)',
          target.id,
          'Transferencia recibida de ' + user.name,
          cents,
          target.balance + cents
        );
      } else if (b.type === 'payment') {
        if (
          !['Telefonía', 'Agua potable', 'Electricidad', 'Internet'].includes(b.service)
        ) {
          fail('Servicio inválido.');
        }

        description =
          'Pago de ' + b.service + ' · ' + required(b.reference, 'la referencia', 60);
      } else {
        fail('Operación inválida.');
      }

      run('UPDATE users SET balance=balance-? WHERE id=?', cents, user.id);

      run(
        'INSERT INTO movements(user_id,description,amount,balance) VALUES(?,?,?,?)',
        user.id,
        description,
        -cents,
        current.balance - cents
      );
    });

    return send(res, { ok: true });
  }

  fail('Ruta no encontrada.', 404);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');

    if (
      req.method !== 'GET' &&
      req.headers.origin &&
      req.headers.origin !== (publicOrigin || `http://${req.headers.host}`)
    ) {
      fail('Origen no permitido.', 403);
    }

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    if (['/comunidad.html', '/historial.html'].includes(url.pathname)) {
      res.writeHead(302, {
        Location: '/universidad.html'
      });

      return res.end();
    }

    if (url.pathname.startsWith('/api/')) {
      return await api(req, res, url);
    }

    if (!['GET', 'HEAD'].includes(req.method)) {
      fail('Método no permitido.', 405);
    }

    const relative =
      decodeURIComponent(url.pathname) === '/'
        ? 'index.html'
        : decodeURIComponent(url.pathname).replace(/^\/+/, '');

    const file = path.resolve(root, relative);

    if (!file.startsWith(root + path.sep)) {
      fail('Acceso denegado.', 403);
    }

    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      fail('Página no encontrada.', 404);
    }

    const mime = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.svg': 'image/svg+xml'
    };

    res.writeHead(200, {
      'Content-Type': mime[path.extname(file)] || 'application/octet-stream'
    });

    if (req.method === 'HEAD') {
      return res.end();
    }

    fs.createReadStream(file).pipe(res);
  } catch (e) {
    if (!res.headersSent) {
      send(
        res,
        {
          error: e.status ? e.message : 'Error interno del servidor.'
        },
        e.status || 500
      );
    } else {
      res.end();
    }
  }
});

const listenPort = Number(process.env.PORT) || 3000;
const listenHost = process.env.HOST || '127.0.0.1';

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      'El puerto ' +
        listenPort +
        ' ya está ocupado. Cierra el Nexo anterior con Ctrl+C y vuelve a iniciar.'
    );
  } else {
    console.error('No se pudo iniciar Nexo: ' + error.message);
  }

  process.exitCode = 1;
});

server.listen(listenPort, listenHost, () => {
  console.log('NEXO listo en http://localhost:' + listenPort);

  if (listenHost === '0.0.0.0') {
    const interfaces = require('node:os').networkInterfaces();

    for (const addresses of Object.values(interfaces)) {
      for (const address of addresses || []) {
        if (address.family === 'IPv4' && !address.internal) {
          console.log(
            'iPhone / misma Wi-Fi: http://' + address.address + ':' + listenPort
          );
        }
      }
    }

    console.log('Mantén esta ventana abierta mientras usas Nexo desde otro dispositivo.');
  }
});
