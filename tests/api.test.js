'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'nexo-test-'));
let child;
const port = 3397;
const base = 'http://127.0.0.1:' + port;
// Simula una base de la versión 1 para comprobar una actualización real.
const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');
const oldDb = new DatabaseSync(path.join(temp, 'nexo.sqlite'));
oldDb.exec(`CREATE TABLE users(id INTEGER PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,
password TEXT NOT NULL,career TEXT NOT NULL,bio TEXT NOT NULL,account TEXT UNIQUE NOT NULL,balance INTEGER NOT NULL DEFAULT 100000);`);
const legacySalt = 'legacy-test-salt';
oldDb
  .prepare('INSERT INTO users VALUES(?,?,?,?,?,?,?,?)')
  .run(
    1,
    'Usuario Anterior',
    'legacy@example.com',
    legacySalt + ':' + crypto.scryptSync('Clave1234', legacySalt, 64).toString('hex'),
    'Ingeniería',
    'Perfil anterior',
    'NXLEGACY000001',
    123456
  );
oldDb.close();
async function startServer() {
  child = spawn(process.execPath, ['server.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: String(port), DATA_DIR: temp },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Servidor no disponible')), 10000);
    child.stdout.once('data', () => {
      clearTimeout(timeout);
      resolve();
    });
    child.once('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once('exit', (code) => {
      if (code) {
        clearTimeout(timeout);
        reject(new Error('Servidor terminó: ' + code));
      }
    });
  });
}
async function stopServer() {
  if (child && child.exitCode === null) {
    const exited = new Promise((resolve) => child.once('exit', resolve));
    child.kill();
    await exited;
  }
}
before(startServer);
after(async () => {
  await stopServer();
  fs.rmSync(temp, { recursive: true, force: true });
});
async function request(route, method = 'GET', data, cookie) {
  const res = await fetch(base + '/api/' + route, {
    method,
    headers: {
      ...(data ? { 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { Cookie: cookie } : {})
    },
    body: data ? JSON.stringify(data) : undefined
  });
  return {
    status: res.status,
    data: await res.json(),
    cookie: res.headers.get('set-cookie')?.split(';')[0]
  };
}
test('Flujos completos y validaciones del servidor', async () => {
  for (const page of [
    'index.html',
    'registro.html',
    'perfil.html',
    'cursos.html',
    'curso.html',
    'evaluacion.html',
    'diploma.html',
    'banca.html',
    'estado-cuenta.html',
    'universidad.html',
    'colegiaturas.html',
    'recibo.html'
  ])
    assert.equal((await fetch(base + '/' + page)).status, 200, page);
  assert.equal((await request('bank')).status, 401);
  const a = await request('register', 'POST', {
    name: 'Ana Pérez',
    email: 'ana@example.com',
    password: 'Clave1234',
    career: 'Ingeniería',
    bio: 'Aprendo HTML'
  });
  assert.equal(a.status, 200);
  const ac = a.cookie;
  const b = await request('register', 'POST', {
    name: 'Bruno López',
    email: 'bruno@example.com',
    password: 'Clave1234',
    career: 'Diseño'
  });
  assert.equal(b.status, 200);
  const bc = b.cookie;
  assert.equal(
    (
      await request('register', 'POST', {
        name: 'Ana',
        email: 'ana@example.com',
        password: 'Clave1234',
        career: 'Otra'
      })
    ).status,
    409
  );
  assert.equal(
    (await request('login', 'POST', { email: 'ana@example.com', password: 'incorrecta' }))
      .status,
    401
  );
  const login = await request('login', 'POST', {
    email: 'ana@example.com',
    password: 'Clave1234'
  });
  assert.equal(login.status, 200);
  let result = await request(
    'evaluate',
    'POST',
    {
      course: 'web',
      answers: ['html', 'css', ['radio', 'checkbox'], 'const', '1', 'DOMContentLoaded']
    },
    ac
  );
  assert.equal(result.data.score, 100);
  assert.equal(result.data.passed, true);
  result = await request(
    'evaluate',
    'POST',
    {
      course: 'logic',
      answers: ['algoritmo', 'booleano', ['if', 'switch'], 'for', '4', 'funcion']
    },
    ac
  );
  assert.equal(result.data.score, 100);
  result = await request(
    'evaluate',
    'POST',
    { course: 'web', answers: ['x', 'x', ['parrafo'], 'x', 'x', 'x'] },
    ac
  );
  assert.equal(result.data.passed, false);
  assert.equal((await request('courses', 'GET', null, ac)).data.attempts.length, 3);
  assert.equal((await request('courses', 'GET', null, bc)).data.attempts.length, 0);
  result = await request(
    'bank/operation',
    'POST',
    { type: 'transfer', destination: b.data.user.account, amount: 125.35 },
    ac
  );
  assert.equal(result.status, 200);
  assert.equal((await request('bank', 'GET', null, ac)).data.user.balance, 87465);
  assert.equal((await request('bank', 'GET', null, bc)).data.user.balance, 112535);
  for (const amount of [-1, 0, 0.001, 2000])
    assert.equal(
      (
        await request(
          'bank/operation',
          'POST',
          { type: 'transfer', destination: b.data.user.account, amount },
          ac
        )
      ).status,
      400
    );
  assert.equal(
    (
      await request(
        'bank/operation',
        'POST',
        { type: 'transfer', destination: 'INEXISTENTE', amount: 10 },
        ac
      )
    ).status,
    400
  );
  assert.equal(
    (
      await request(
        'bank/operation',
        'POST',
        { type: 'transfer', destination: a.data.user.account, amount: 10 },
        ac
      )
    ).status,
    400
  );
  assert.equal((await request('bank', 'GET', null, ac)).data.user.balance, 87465);
  assert.equal(
    (
      await request(
        'bank/operation',
        'POST',
        { type: 'payment', service: 'Electricidad', reference: 'REF-123', amount: 25.35 },
        ac
      )
    ).status,
    200
  );
  assert.equal((await request('bank', 'GET', null, ac)).data.user.balance, 84930);
  assert.equal((await request('social', 'GET', null, ac)).status, 404);
  assert.equal(
    (await request('social/posts', 'POST', { body: 'Prueba' }, ac)).status,
    404
  );
  const oldPage = await fetch(base + '/comunidad.html', { redirect: 'manual' });
  assert.equal(oldPage.status, 302);
  assert.equal(oldPage.headers.get('location'), '/universidad.html');
  const landing = await (await fetch(base + '/')).text();
  assert.equal(landing.includes('/comunidad.html'), false);
  assert.equal((await request('logout', 'POST', {}, ac)).status, 200);
  assert.equal((await request('me', 'GET', null, ac)).status, 401);
});

test('Las cinco carreras reciben sus videos, lecturas y evaluaciones correspondientes', async (t) => {
  const { byId } = require('../lib/catalog');
  const expected = [
    ['Ingeniería en Sistemas', ['web', 'logic'], ['UB1O30fR-EE', 'F_sYsMxXzkM']],
    [
      'Administración de Empresas',
      ['business-process', 'business-goals'],
      ['eE78r9an_CA', 'w1fJrQDDJCE']
    ],
    [
      'Diseño y Comunicación',
      ['design-color', 'design-type'],
      ['ybd_lh8cyyM', 'EbV3-AJQElQ']
    ],
    [
      'Contaduría Pública',
      ['accounting-accounts', 'accounting-equity'],
      ['ieONSS2bjpI', 'APObK8ovyf8']
    ],
    ['Otra carrera', ['study-time', 'study-goals'], ['V51bTPmFgRs', '-F5-7PRq0vM']]
  ];
  for (const [index, [career, ids, videos]] of expected.entries())
    await t.test(career, async () => {
      const registration = await request('register', 'POST', {
        name: 'Estudiante ' + career,
        email: 'career' + index + '@example.com',
        password: 'Clave1234',
        career
      });
      const cookie = registration.cookie;
      const list = (await request('courses', 'GET', null, cookie)).data;
      assert.equal(list.career, career);
      assert.deepEqual(
        list.courses.map((c) => c.id),
        ids
      );
      assert.deepEqual(
        list.courses.map((c) => c.video.id),
        videos
      );
      for (const id of ids) {
        const detail = await request('courses/' + id, 'GET', null, cookie);
        assert.equal(detail.status, 200);
        assert.equal(Object.hasOwn(detail.data.course, 'answers'), false);
        assert.equal(detail.data.course.questions.length, 6);
        assert.equal(detail.data.course.sections.length, 3);
        assert.equal((await fetch(base + '/assets/courses/' + id + '.svg')).status, 200);
        const evaluation = await request(
          'evaluate',
          'POST',
          { course: id, answers: byId[id].answers },
          cookie
        );
        assert.equal(evaluation.status, 200);
        assert.equal(evaluation.data.score, 100);
        const diploma = await request(
          'diplomas/' + evaluation.data.id,
          'GET',
          null,
          cookie
        );
        assert.equal(diploma.data.title, byId[id].title);
        assert.equal(diploma.data.category, byId[id].category);
      }
      const foreign = ids.includes('web') ? 'accounting-accounts' : 'web';
      assert.equal(
        (await request('courses/' + foreign, 'GET', null, cookie)).status,
        403
      );
      assert.equal(
        (
          await request(
            'evaluate',
            'POST',
            { course: foreign, answers: byId[foreign].answers },
            cookie
          )
        ).status,
        403
      );
    });
});

test('Cambiar carrera actualiza la ruta y conserva saldos, pagos e historial de diplomas', async () => {
  const { byId } = require('../lib/catalog');
  const registered = await request('register', 'POST', {
    name: 'Cambio de Carrera',
    email: 'change@example.com',
    password: 'Clave1234',
    career: 'Contaduría Pública'
  });
  const cookie = registered.cookie;
  const passed = await request(
    'evaluate',
    'POST',
    { course: 'accounting-accounts', answers: byId['accounting-accounts'].answers },
    cookie
  );
  const bankBefore = (await request('bank', 'GET', null, cookie)).data;
  const duesBefore = (await request('university', 'GET', null, cookie)).data;
  assert.equal(
    (await request('me/career', 'PATCH', { career: 'No existe' }, cookie)).status,
    400
  );
  const changed = await request(
    'me/career',
    'PATCH',
    { career: 'Diseño y Comunicación' },
    cookie
  );
  assert.equal(changed.status, 200);
  const list = (await request('courses', 'GET', null, cookie)).data;
  assert.deepEqual(
    list.courses.map((c) => c.id),
    ['design-color', 'design-type']
  );
  assert.equal(list.attempts[0].currentCareer, false);
  assert.equal(
    (await request('diplomas/' + passed.data.id, 'GET', null, cookie)).data.title,
    'Cuentas y ecuación contable'
  );
  const bankAfter = (await request('bank', 'GET', null, cookie)).data;
  assert.equal(bankAfter.user.balance, bankBefore.user.balance);
  assert.equal(bankAfter.user.account, bankBefore.user.account);
  assert.deepEqual(bankAfter.movements, bankBefore.movements);
  assert.deepEqual(
    (await request('university', 'GET', null, cookie)).data.invoices,
    duesBefore.invoices
  );
  const other = await request('login', 'POST', {
    email: 'career0@example.com',
    password: 'Clave1234'
  });
  assert.equal(
    (await request('diplomas/' + passed.data.id, 'GET', null, other.cookie)).status,
    404
  );
  assert.equal(
    (await request('courses/accounting-accounts', 'GET', null, cookie)).status,
    403
  );
});

test('Colegiaturas, fondos ilimitados, pagos atómicos, recibos y protección contra duplicados', async () => {
  assert.equal((await request('university')).status, 401);
  const a = await request('register', 'POST', {
    name: 'Universitaria Demo',
    email: 'campus@example.com',
    password: 'Clave1234',
    career: 'Ingeniería'
  });
  const b = await request('register', 'POST', {
    name: 'Otro Estudiante',
    email: 'other@example.com',
    password: 'Clave1234',
    career: 'Diseño'
  });
  const ac = a.cookie,
    bc = b.cookie;
  let data = (await request('university', 'GET', null, ac)).data;
  assert.equal(data.invoices.length, 12);
  assert.equal(data.summary.pendingCount, 8);
  assert.equal(data.summary.monthlyTuition, 65000);
  assert.equal(data.summary.monthlyPenalty, 2500);
  assert.equal(data.summary.semestersOwed, 2);
  assert.equal(data.payments.length, 0);
  const repeated = (await request('university', 'GET', null, ac)).data;
  assert.deepEqual(
    repeated.invoices.map((i) => i.id),
    data.invoices.map((i) => i.id)
  );
  const other = (await request('university', 'GET', null, bc)).data;
  const pending = data.invoices.filter((i) => i.state !== 'paid');
  const key = 'university-payment-key-0001';
  assert.equal(
    (
      await request(
        'university/pay',
        'POST',
        { invoiceIds: [pending[0].id, other.invoices[5].id], requestKey: key },
        ac
      )
    ).status,
    404
  );
  assert.equal((await request('bank', 'GET', null, ac)).data.movements.length, 1);
  for (const invoiceIds of [[], [pending[0].id, pending[0].id], ['1'], [0]]) {
    assert.equal(
      (await request('university/pay', 'POST', { invoiceIds, requestKey: key }, ac))
        .status,
      400
    );
  }
  const chosen = pending.slice(0, 2),
    ids = chosen.map((i) => i.id);
  const expected = chosen.reduce((sum, i) => sum + i.total, 0);
  const requests = await Promise.all([
    request(
      'university/pay',
      'POST',
      { invoiceIds: ids, requestKey: key, total: 1, penalty: 0 },
      ac
    ),
    request('university/pay', 'POST', { invoiceIds: ids, requestKey: key }, ac)
  ]);
  requests.forEach((r) => assert.equal(r.status, 200));
  assert.equal(requests[0].data.payment.id, requests[1].data.payment.id);
  const p = requests[0].data.payment;
  assert.equal(p.total, expected);
  assert.equal(p.principal, 130000);
  assert.equal(p.topup, expected - 100000);
  assert.equal(p.balance_after, 0);
  assert.equal(requests[0].data.items.length, 2);
  const bank = (await request('bank', 'GET', null, ac)).data;
  assert.equal(bank.user.balance, 0);
  assert.equal(bank.movements.length, 3);
  assert.equal(
    bank.movements.reduce((sum, m) => sum + m.amount, 0),
    bank.user.balance
  );
  data = (await request('university', 'GET', null, ac)).data;
  assert.equal(data.summary.pendingCount, 6);
  assert.equal(data.payments.length, 1);
  assert.equal(data.summary.semestersOwed, 1);
  assert.equal(data.invoices.find((i) => i.id === ids[0]).receipt_id, p.id);
  assert.equal(data.invoices.find((i) => i.id === ids[0]).penalty, 0);
  assert.equal(
    (await request('university/receipts/' + p.id, 'GET', null, bc)).status,
    404
  );
  assert.equal(
    (
      await request(
        'university/pay',
        'POST',
        { invoiceIds: ids, requestKey: 'another-payment-key-0002' },
        ac
      )
    ).status,
    409
  );
  assert.equal(
    (
      await request(
        'university/pay',
        'POST',
        { invoiceIds: [pending[2].id], requestKey: key },
        ac
      )
    ).status,
    409
  );
  // Una cuota ya pagada dentro de un lote provoca rollback del lote entero.
  assert.equal(
    (
      await request(
        'university/pay',
        'POST',
        { invoiceIds: [pending[2].id, ids[0]], requestKey: 'rollback-payment-key-0003' },
        ac
      )
    ).status,
    409
  );
  assert.equal(
    (await request('university', 'GET', null, ac)).data.summary.pendingCount,
    6
  );
  const unpaid = data.invoices.filter((i) => i.state !== 'paid').map((i) => i.id);
  assert.equal(
    (
      await request(
        'university/pay',
        'POST',
        { invoiceIds: unpaid, requestKey: 'remaining-payment-key-0004' },
        ac
      )
    ).status,
    200
  );
  data = (await request('university', 'GET', null, ac)).data;
  assert.equal(data.summary.total, 0);
  assert.equal(data.summary.penalties, 0);
  assert.equal(data.summary.semestersOwed, 0);
  assert.equal(data.summary.paidCount, 12);
  assert.equal(
    (await request('university/receipts/' + p.id, 'GET', null, ac)).data.payment.total,
    p.total
  );
  await request('bank/topup', 'POST', {}, ac);
  await request('bank/topup', 'POST', {}, ac);
  const finalBank = (await request('bank', 'GET', null, ac)).data;
  assert.equal(finalBank.user.balance, 2000000);
  assert.equal(
    finalBank.movements.reduce((sum, m) => sum + m.amount, 0),
    finalBank.user.balance
  );
  // Las cuentas de otros alumnos conservan sus propias deudas.
  assert.equal(
    (await request('university', 'GET', null, bc)).data.summary.pendingCount,
    8
  );
});

test('Actualización desde v1 y persistencia de recibos y saldos después de reiniciar', async () => {
  const legacy = await request('login', 'POST', {
    email: 'legacy@example.com',
    password: 'Clave1234'
  });
  assert.equal(legacy.status, 200);
  assert.equal(legacy.data.user.balance, 123456);
  assert.equal(legacy.data.user.bio, 'Perfil anterior');
  assert.equal(legacy.data.user.account, 'NXLEGACY000001');
  const enrollment = (await request('university', 'GET', null, legacy.cookie)).data;
  assert.equal(enrollment.invoices.length, 12);
  assert.equal(enrollment.user.balance, 123456);
  const current = await request('login', 'POST', {
    email: 'campus@example.com',
    password: 'Clave1234'
  });
  const beforeRestart = (await request('university', 'GET', null, current.cookie)).data;
  await stopServer();
  await startServer();
  const afterRestart = (await request('university', 'GET', null, current.cookie)).data;
  assert.deepEqual(afterRestart.payments, beforeRestart.payments);
  assert.equal(afterRestart.summary.total, 0);
  assert.equal(afterRestart.user.balance, 2000000);
  const receipt = await request(
    'university/receipts/' + afterRestart.payments[0].id,
    'GET',
    null,
    current.cookie
  );
  assert.equal(receipt.status, 200);
  assert.ok(receipt.data.items.length > 0);
  const oldUser = (await request('university', 'GET', null, legacy.cookie)).data;
  assert.equal(oldUser.invoices.length, 12);
  assert.equal(oldUser.user.balance, 123456);
});
