'use strict';
const $ = (selector) => document.querySelector(selector);
const escapeHTML = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );
const money = (cents) =>
  new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(
    cents / 100
  );
const date = (value) => new Date(value.replace(' ', 'T') + 'Z').toLocaleString('es-GT');
let user;
async function api(url, method = 'GET', data) {
  const res = await fetch('/api/' + url, {
    method,
    headers: data ? { 'Content-Type': 'application/json' } : {},
    body: data ? JSON.stringify(data) : undefined
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'No se pudo completar la operación.');
  return result;
}
function toast(message) {
  let el = $('#toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.append(el);
  }
  el.textContent = message;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.remove(), 5000);
}
function bindForm(selector, action) {
  const form = $(selector);
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('[type=submit]');
    button.disabled = true;
    const status = form.querySelector('.message');
    if (status) status.textContent = 'Procesando…';
    try {
      const result = await action(new FormData(form), form);
      if (status) {
        status.className = 'message ' + (result === false ? '' : 'success');
        status.textContent =
          result === false ? 'Operación cancelada.' : 'Operación completada.';
      }
    } catch (error) {
      if (status) {
        status.className = 'message error';
        status.textContent = error.message;
      } else toast(error.message);
    } finally {
      button.disabled = false;
    }
  });
}
function header() {
  const page = document.body.dataset.page;
  const groups = {
    tuition: 'university',
    receipt: 'university',
    lesson: 'courses',
    exam: 'courses',
    diploma: 'courses',
    statement: 'bank'
  };
  const active = groups[page] || page;
  $('#header').innerHTML =
    `<div class="container topbar"><a href="/" class="brand" aria-label="Nexo, inicio"><b>n</b>nexo<span class="muted">.</span></a><nav aria-label="Navegación principal">${[
      ['index', '/', 'Inicio'],
      ['university', '/universidad.html', 'Mi universidad'],
      ['courses', '/cursos.html', 'Academia'],
      ['bank', '/banca.html', 'Banca']
    ]
      .map(
        ([p, url, label]) =>
          `<a class="${p === active ? 'active' : ''}" ${p === active ? 'aria-current="page"' : ''} href="${url}">${label}</a>`
      )
      .join(
        ''
      )}${user ? '<a href="/perfil.html" class="nav-profile" aria-label="Mi perfil">' + escapeHTML(user.name[0]) + '</a><button id="logout" class="secondary">Salir</button>' : '<a class="btn" href="/registro.html">Comenzar ↗</a>'}</nav></div>`;
  $('#logout')?.addEventListener('click', async () => {
    try {
      await api('logout', 'POST');
      location.href = '/';
    } catch (e) {
      toast(e.message);
    }
  });
}
async function init() {
  try {
    user = (await api('me')).user;
  } catch {}
  header();
  const page = document.body.dataset.page;
  if (!['index', 'register'].includes(page) && !user) {
    location.href =
      '/registro.html?next=' + encodeURIComponent(location.pathname + location.search);
    return;
  }
  if (user)
    document
      .querySelectorAll('[data-name]')
      .forEach((el) => (el.textContent = user.name.split(' ')[0]));
  const actions = {
    register: auth,
    courses: courseList,
    lesson: lesson,
    exam: exam,
    diploma: diploma,
    bank: bank,
    statement: statement,
    university: campusOverview,
    tuition: tuitionPage,
    receipt: universityReceipt
  };
  try {
    await actions[page]?.();
  } catch (e) {
    $('#content').innerHTML =
      `<div class="card"><h2>No pudimos cargar esta página</h2><p>${escapeHTML(e.message)}</p><a class="btn" href="${escapeHTML(location.pathname)}">Intentar de nuevo</a></div>`;
  }
}
function auth() {
  let mode = 'register';
  function render() {
    $('#auth-fields').hidden = mode !== 'register';
    $('#auth-title').textContent =
      mode === 'register' ? 'Crea tu cuenta' : 'Qué gusto verte';
    $('#auth-submit').textContent =
      mode === 'register' ? 'Crear cuenta y continuar ↗' : 'Ingresar ↗';
    for (const el of $('#auth-fields').querySelectorAll('[data-required]'))
      el.required = mode === 'register';
    $('#password').minLength = mode === 'register' ? 8 : 1;
    document
      .querySelectorAll('[data-auth]')
      .forEach((b) => b.classList.toggle('selected', b.dataset.auth === mode));
    $('#auth-status').textContent = '';
  }
  document.querySelectorAll('[data-auth]').forEach((b) =>
    b.addEventListener('click', () => {
      mode = b.dataset.auth;
      render();
    })
  );
  render();
  if (user)
    $('#already').innerHTML =
      `<div class="banner">Ya ingresaste como ${escapeHTML(user.name)}. <a href="/perfil.html">Ver mi registro →</a></div>`;
  bindForm('#auth-form', async (data) => {
    await api(
      mode === 'register' ? 'register' : 'login',
      'POST',
      Object.fromEntries(data)
    );
    const next = new URLSearchParams(location.search).get('next');
    location.href = next && /^\/(?!\/)/.test(next) ? next : '/perfil.html';
  });
}
async function bank() {
  await bankRefresh();
  bindForm('#transfer-form', async (data, form) => {
    if (
      !confirm(
        '¿Confirmas la transferencia de ' +
          money(Math.round(Number(data.get('amount')) * 100)) +
          '?'
      )
    )
      return false;
    await api('bank/operation', 'POST', {
      type: 'transfer',
      ...Object.fromEntries(data)
    });
    form.reset();
    await bankRefresh();
    toast('Transferencia registrada.');
  });
  bindForm('#payment-form', async (data, form) => {
    if (!confirm('¿Confirmas el pago del servicio?')) return false;
    await api('bank/operation', 'POST', { type: 'payment', ...Object.fromEntries(data) });
    form.reset();
    await bankRefresh();
    toast('Pago registrado.');
  });
  $('#topup-button')?.addEventListener('click', async () => {
    const button = $('#topup-button'),
      status = $('#topup-status');
    button.disabled = true;
    try {
      await api('bank/topup', 'POST', {});
      await bankRefresh();
      status.textContent =
        'Q10,000 ficticios abonados. Puedes recargar de nuevo cuando quieras.';
      toast('Recarga gratuita completada.');
    } catch (e) {
      status.textContent = e.message;
    } finally {
      button.disabled = false;
    }
  });
}
const movementTable = (items) =>
  items.length
    ? `<div class="table-wrap"><table><thead><tr><th>Fecha / referencia</th><th>Descripción</th><th>Monto</th><th>Saldo</th></tr></thead><tbody>${items.map((m) => `<tr><td>${date(m.created)}<br><small>NX-${m.id}</small></td><td>${escapeHTML(m.description)}</td><td class="${m.amount > 0 ? 'positive' : 'negative'}">${m.amount > 0 ? '+' : ''}${money(m.amount)}</td><td>${money(m.balance)}</td></tr>`).join('')}</tbody></table></div>`
    : '<div class="empty">Aún no hay movimientos.</div>';
async function bankRefresh() {
  const data = await api('bank');
  user = data.user;
  $('#balance').textContent = money(user.balance);
  $('#account').textContent = user.account;
  $('#holder').textContent = user.name;
  $('#movements').innerHTML = movementTable(data.movements.slice(0, 8));
  $('#copy-account').onclick = async () => {
    try {
      await navigator.clipboard.writeText(user.account);
      toast('Cuenta copiada.');
    } catch {
      toast('Tu cuenta: ' + user.account);
    }
  };
  await bankUniversitySummary();
}
async function statement() {
  const { user: u, movements } = await api('bank');
  $('#statement-name').textContent = u.name;
  $('#statement-account').textContent = u.account;
  $('#statement-balance').textContent = money(u.balance);
  $('#statement-date').textContent = new Date().toLocaleString('es-GT');
  $('#movements').innerHTML = movementTable(movements);
  $('#print').onclick = () => window.print();
  $('#csv').onclick = () =>
    downloadCSV('estado-cuenta.csv', [
      ['Referencia', 'Fecha', 'Descripcion', 'Monto GTQ', 'Saldo GTQ'],
      ...movements.map((m) => [
        'NX-' + m.id,
        m.created,
        m.description,
        (m.amount / 100).toFixed(2),
        (m.balance / 100).toFixed(2)
      ])
    ]);
}
function downloadCSV(name, rows) {
  const content =
    '\ufeff' +
    rows
      .map((row) =>
        row
          .map(
            (x) =>
              '"' +
              String(x)
                .replace(/^[=+@-]/, "'")
                .replace(/"/g, '""') +
              '"'
          )
          .join(',')
      )
      .join('\r\n');
  const url = URL.createObjectURL(
    new Blob([content], { type: 'text/csv;charset=utf-8;' })
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function profile() {
  const u = (await api('me')).user;
  $('#profile-data').innerHTML =
    `<dl><dt class="muted">Nombre completo</dt><dd><h3>${escapeHTML(u.name)}</h3></dd><dt class="muted">Correo</dt><dd><p>${escapeHTML(u.email)}</p></dd><dt class="muted">Carrera</dt><dd><p>${escapeHTML(u.career)}</p></dd><dt class="muted">Descripción</dt><dd><p class="post-body">${escapeHTML(u.bio || 'Sin descripción')}</p></dd><dt class="muted">Cuenta de práctica</dt><dd><p class="account">${escapeHTML(u.account)}</p></dd></dl>`;
}
document.addEventListener('DOMContentLoaded', () => {
  init().then(() => {
    if (user && document.body.dataset.page === 'profile')
      profile()
        .then(setupCareerForm)
        .catch((e) => toast(e.message));
  });
});
