'use strict';

const campusDate = (value) =>
  new Intl.DateTimeFormat('es-GT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(value + 'T12:00:00Z'));
const invoiceState = (invoice) =>
  ({ paid: 'Pagada', overdue: 'Vencida', pending: 'Por vencer' })[invoice.state];

// Safari no ofrece randomUUID en todas las páginas HTTP de una red local.
// getRandomValues funciona también en ese contexto; conserva claves aleatorias.
function newPaymentKey() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (n) =>
    n.toString(16).padStart(2, '0')
  ).join('');
}

function metric(label, value, detail, kind = '') {
  return `<article class="metric ${kind}"><span class="eyebrow">${label}</span><strong>${value}</strong><small>${detail}</small></article>`;
}

function receiptList(payments, limit = 100) {
  if (!payments.length)
    return '<div class="empty">Tu próximo pago aparecerá aquí con su recibo descargable.</div>';
  return `<ul class="list receipt-list">${payments
    .slice(0, limit)
    .map(
      (p) => `
    <li class="row between"><div class="row"><span class="receipt-icon">↗</span><div>
    <strong>Recibo NXU-${String(p.id).padStart(6, '0')}</strong><br><small>${date(p.created)}</small>
    </div></div><div class="receipt-value"><strong>${money(p.total)}</strong>
    <a href="/recibo.html?id=${p.id}">Ver comprobante ↗</a></div></li>`
    )
    .join('')}</ul>`;
}

async function campusOverview() {
  const data = await api('university');
  user = data.user;
  const s = data.summary,
    student = data.student;
  $('#campus-name').textContent = user.name;
  $('#campus-career').textContent = user.career;
  $('#campus-avatar').textContent = user.name[0];
  $('#student-code').textContent = student.student_code;
  $('#campus-today').textContent = campusDate(data.today);
  $('#campus-balance').textContent = money(user.balance);
  $('#campus-metrics').innerHTML =
    metric('Mensualidad', money(s.monthlyTuition), 'Por cuota · seis por semestre') +
    metric(
      'Semestres con deuda',
      s.semestersOwed,
      `${s.pendingCount} mensualidades pendientes`
    ) +
    metric(
      'Mora acumulada',
      money(s.penalties),
      `${s.overdueCount} cuotas vencidas`,
      'warm'
    ) +
    metric(
      'Total pendiente',
      money(s.total),
      'Incluye cuotas futuras de los períodos cargados',
      'accent'
    );
  $('#semester-cards').innerHTML = data.semesters
    .map((semester) => {
      const completed = semester.paid === semester.count;
      return `<article class="semester-card ${completed ? 'settled' : ''}"><div class="row between">
      <span class="eyebrow">PERÍODO ${semester.period}</span><span class="status-badge ${completed ? 'paid' : semester.overdue ? 'overdue' : 'pending'}">${completed ? 'Al día' : semester.overdue ? 'Con mora' : 'Pendiente'}</span></div>
      <h3>Semestre ${semester.number}</h3><p class="semester-amount">${money(semester.total)}</p>
      <div class="progress-track"><span style="width:${(semester.paid / semester.count) * 100}%"></span></div>
      <p class="muted fine">${semester.paid} de ${semester.count} cuotas pagadas · ${semester.overdue} vencidas</p>
      <div class="row between fine"><span>Mora incluida</span><strong>${money(semester.penalties)}</strong></div>
      <a class="btn ${completed ? 'secondary' : 'lime'} full-width" href="/colegiaturas.html?semestre=${semester.number}${completed ? '&amp;estado=all' : ''}">${completed ? 'Consultar semestre' : 'Revisar y pagar'} ↗</a></article>`;
    })
    .join('');
  const completed = student.current_semester - 1;
  $('#academic-path').innerHTML =
    `<div class="row between"><p><strong>Semestre ${student.current_semester}</strong> de ${student.total_semesters}</p><span class="tag">${Math.round((completed / student.total_semesters) * 100)}% del plan cursado</span></div>
    <div class="academic-steps">${Array.from({ length: student.total_semesters }, (_, i) => `<div class="academic-step ${i < completed ? 'done' : i === completed ? 'current' : ''}"><span>${i < completed ? '✓' : i + 1}</span><small>${i < completed ? 'Cursado' : i === completed ? 'Actual' : 'Próximo'}</small></div>`).join('')}</div>
    <p class="muted fine">${completed} semestres cursados y ${student.total_semesters - completed} por cursar, incluido el actual. Este es un recorrido académico de ejemplo, separado del estado financiero.</p>`;
  $('#campus-receipts').innerHTML = receiptList(data.payments, 3);
}

async function bankUniversitySummary() {
  if (!$('#bank-university')) return;
  const { summary: s } = await api('university');
  $('#bank-university').innerHTML =
    `<div class="row"><span class="campus-bank-icon">⌂</span><div><span class="eyebrow">UNIVERSIDAD CONECTADA</span><h3>${s.total ? 'Tu siguiente paso empieza con una cuota.' : '¡Tu universidad está al día!'}</h3><p class="muted">${s.semestersOwed} ${s.semestersOwed === 1 ? 'semestre' : 'semestres'} con deuda · ${s.pendingCount} mensualidades pendientes · ${money(s.penalties)} de mora</p></div></div><div class="bank-campus-action"><small>Total pendiente</small><strong>${money(s.total)}</strong><a class="btn lime" href="/colegiaturas.html${s.total ? '' : '#receipts'}">${s.total ? 'Pagar universidad' : 'Ver mis recibos'} ↗</a></div>`;
}

async function tuitionPage() {
  const data = await api('university');
  user = data.user;
  const selected = new Set();
  let submitting = false;
  // Reutiliza la clave si una respuesta se pierde: el backend devuelve el mismo recibo.
  let paymentKey = null;
  const s = data.summary;
  $('#tuition-metrics').innerHTML =
    metric('Mensualidad', money(s.monthlyTuition), 'Importe de cada cuota') +
    metric('Semestres con deuda', s.semestersOwed, `${s.pendingCount} cuotas por pagar`) +
    metric('Mora total', money(s.penalties), 'Q25 por mes de atraso y cuota', 'warm') +
    metric('Pendiente total', money(s.total), 'Capital + mora calculada hoy', 'accent');
  $('#semester-filter').innerHTML += [...data.semesters]
    .map(
      (sem) =>
        `<option value="${sem.number}">Semestre ${sem.number} · ${sem.period}</option>`
    )
    .join('');
  const semester = new URLSearchParams(location.search).get('semestre');
  if (data.semesters.some((s) => String(s.number) === semester))
    $('#semester-filter').value = semester;
  const initialState = new URLSearchParams(location.search).get('estado');
  if (['all', 'unpaid', 'overdue', 'paid'].includes(initialState))
    $('#invoice-filter').value = initialState;
  $('#tuition-receipts').innerHTML = receiptList(data.payments);
  $('#checkout-account').textContent = user.account;
  $('#checkout-balance').textContent = money(user.balance);

  function visibleInvoices() {
    const semester = $('#semester-filter').value,
      state = $('#invoice-filter').value;
    return data.invoices.filter(
      (i) =>
        (!semester || String(i.semester) === semester) &&
        (state === 'all' ||
          (state === 'unpaid' && i.state !== 'paid') ||
          state === i.state)
    );
  }
  function chosenInvoices() {
    return data.invoices.filter((i) => selected.has(i.id));
  }
  function totals() {
    return chosenInvoices().reduce(
      (sum, i) => ({
        principal: sum.principal + i.amount,
        penalty: sum.penalty + i.penalty,
        total: sum.total + i.total
      }),
      { principal: 0, penalty: 0, total: 0 }
    );
  }
  function renderSelection() {
    const sum = totals();
    $('#selection-count').textContent = selected.size;
    $('#selection-principal').textContent = money(sum.principal);
    $('#selection-penalty').textContent = money(sum.penalty);
    $('#selection-total').textContent = money(sum.total);
    $('#open-payment').disabled = !selected.size;
    const topup = Math.max(0, sum.total - user.balance);
    $('#topup-preview').hidden = !topup;
    $('#topup-preview').textContent =
      'Abono automático gratuito: ' + money(topup) + ' de fondos ficticios.';
    $('#invoice-list')
      .querySelectorAll('[data-invoice]')
      .forEach((el) => (el.checked = selected.has(Number(el.dataset.invoice))));
  }
  function renderInvoices() {
    const items = visibleInvoices();
    $('#invoice-count').textContent =
      `${items.length} cuotas visibles · ${selected.size} seleccionadas en todos los filtros`;
    $('#select-visible').disabled = !items.some((i) => i.state !== 'paid');
    $('#select-overdue').disabled = !data.invoices.some((i) => i.state === 'overdue');
    $('#invoice-list').innerHTML = items.length
      ? `<div class="invoice-grid">${items
          .map(
            (i) => `
      <article class="invoice-item ${i.state}"><div class="invoice-top"><label class="invoice-label">
      ${i.state === 'paid' ? '<span class="paid-check" aria-hidden="true">✓</span>' : `<input type="checkbox" data-invoice="${i.id}" aria-label="Seleccionar ${i.month} del semestre ${i.semester}">`}
      <span><strong>${i.month}</strong><small>Semestre ${i.semester} · ${i.period}</small></span></label><span class="status-badge ${i.state}">${invoiceState(i)}</span></div>
      <div class="invoice-detail"><span>Mensualidad</span><strong>${money(i.amount)}</strong></div>
      <div class="invoice-detail"><span>Mora ${i.state === 'overdue' ? `(${i.lateMonths} × Q25)` : ''}</span><strong class="${i.penalty ? 'negative' : ''}">${money(i.penalty)}</strong></div>
      <div class="invoice-bottom"><small>Vence: ${campusDate(i.due_date)}</small><strong>${i.state === 'paid' ? 'Pagada' : money(i.total)}</strong></div>
      ${i.receipt_id ? `<a class="text-link fine" href="/recibo.html?id=${i.receipt_id}">Ver recibo ↗</a>` : i.demo_paid ? '<small class="demo-history">Pago histórico de ejemplo · sin cargo bancario</small>' : ''}</article>`
          )
          .join('')}</div>`
      : '<div class="empty"><h3>Todo despejado por aquí.</h3><p>No hay cuotas con este filtro. Puedes consultar las pagadas o elegir otro semestre.</p></div>';
    renderSelection();
  }
  $('#invoice-list').addEventListener('change', (event) => {
    if (!event.target.matches('[data-invoice]')) return;
    const id = Number(event.target.dataset.invoice);
    if (event.target.checked) selected.add(id);
    else selected.delete(id);
    paymentKey = null;
    renderSelection();
    $('#invoice-count').textContent =
      `${visibleInvoices().length} cuotas visibles · ${selected.size} seleccionadas en todos los filtros`;
  });
  $('#semester-filter').onchange = renderInvoices;
  $('#invoice-filter').onchange = renderInvoices;
  $('#select-visible').onclick = () => {
    visibleInvoices()
      .filter((i) => i.state !== 'paid')
      .forEach((i) => selected.add(i.id));
    paymentKey = null;
    renderInvoices();
  };
  $('#select-overdue').onclick = () => {
    selected.clear();
    data.invoices.filter((i) => i.state === 'overdue').forEach((i) => selected.add(i.id));
    paymentKey = null;
    renderInvoices();
  };
  $('#clear-selection').onclick = () => {
    selected.clear();
    paymentKey = null;
    renderInvoices();
  };
  $('#tuition-csv').onclick = () =>
    downloadCSV('colegiaturas-nexo.csv', [
      [
        'Semestre',
        'Periodo',
        'Mensualidad',
        'Vencimiento',
        'Estado',
        'Capital GTQ',
        'Meses de mora',
        'Mora GTQ',
        'Pendiente GTQ'
      ],
      ...data.invoices.map((i) => [
        i.semester,
        i.period,
        i.month,
        i.due_date,
        invoiceState(i),
        (i.amount / 100).toFixed(2),
        i.lateMonths,
        (i.penalty / 100).toFixed(2),
        (i.total / 100).toFixed(2)
      ])
    ]);
  const dialog = $('#payment-dialog');
  function closeDialog() {
    if (!submitting) dialog.close();
  }
  $('#close-payment').onclick = closeDialog;
  $('#cancel-payment').onclick = closeDialog;
  dialog.addEventListener('cancel', (event) => {
    if (submitting) event.preventDefault();
  });
  $('#open-payment').onclick = () => {
    if (!selected.size) return;
    const sum = totals();
    $('#payment-status').textContent = '';
    $('#payment-review').innerHTML = `<ul class="payment-review-list">${chosenInvoices()
      .map(
        (i) =>
          `<li><span>${i.month} · Semestre ${i.semester}</span><strong>${money(i.total)}</strong></li>`
      )
      .join('')}</ul>
      <div class="payment-lines"><div><span>Mensualidades</span><strong>${money(sum.principal)}</strong></div><div><span>Mora</span><strong>${money(sum.penalty)}</strong></div><div class="payment-total"><span>Total</span><strong>${money(sum.total)}</strong></div></div>
      <small>Desde ${escapeHTML(user.account)} · ${selected.size} cuotas. ${sum.total > user.balance ? 'Se abonará la diferencia de ' + money(sum.total - user.balance) + ' automáticamente.' : ''}</small>`;
    paymentKey = paymentKey || newPaymentKey();
    dialog.showModal();
  };
  $('#confirm-payment').onclick = async () => {
    if (submitting) return;
    submitting = true;
    $('#confirm-payment').disabled = true;
    $('#close-payment').disabled = true;
    $('#cancel-payment').disabled = true;
    $('#payment-status').className = 'message';
    $('#payment-status').textContent = 'Registrando el pago…';
    try {
      const result = await api('university/pay', 'POST', {
        invoiceIds: [...selected],
        requestKey: paymentKey
      });
      location.href = '/recibo.html?id=' + result.payment.id;
    } catch (error) {
      $('#payment-status').className = 'message error';
      $('#payment-status').textContent =
        error.message + ' Puedes reintentar sin duplicar el pago.';
    } finally {
      submitting = false;
      $('#confirm-payment').disabled = false;
      $('#close-payment').disabled = false;
      $('#cancel-payment').disabled = false;
    }
  };
  renderInvoices();
}

async function universityReceipt() {
  const id = Number(new URLSearchParams(location.search).get('id'));
  if (!Number.isSafeInteger(id) || id <= 0)
    throw new Error('Selecciona un recibo desde tus colegiaturas.');
  const { payment: p, items } = await api('university/receipts/' + id);
  $('#university-receipt').innerHTML =
    `<div class="row between receipt-header"><div><span class="brand"><b>n</b>nexo.</span><p class="eyebrow">UNIVERSIDAD / TESORERÍA</p></div><div class="receipt-value"><span class="status-badge paid">✓ Pago completado</span><h2>NXU-${String(p.id).padStart(6, '0')}</h2><small>${date(p.created)}</small></div></div>
    <h1>Un paso más.<br>Un pendiente menos.</h1><div class="receipt-people"><div><span class="eyebrow">ESTUDIANTE</span><h3>${escapeHTML(p.payer_name)}</h3><p>${escapeHTML(p.student_code)}</p></div><div><span class="eyebrow">CUENTA DE ORIGEN</span><h3 class="account">${escapeHTML(p.account)}</h3><p>Movimiento NX-${p.movement_id}</p></div></div>
    <div class="table-wrap"><table><thead><tr><th>Concepto</th><th>Mensualidad</th><th>Meses de atraso</th><th>Mora</th><th>Total</th></tr></thead><tbody>${items.map((i) => `<tr><td><strong>${i.month}</strong><br><small>Semestre ${i.semester} · ${i.period}</small></td><td>${money(i.principal)}</td><td>${i.late_months}</td><td>${money(i.penalty)}</td><td>${money(i.total)}</td></tr>`).join('')}</tbody></table></div>
    <div class="receipt-summary"><div class="payment-lines"><div><span>Mensualidades</span><strong>${money(p.principal)}</strong></div><div><span>Mora liquidada</span><strong>${money(p.penalty)}</strong></div><div class="payment-total"><span>Total pagado</span><strong>${money(p.total)}</strong></div></div></div>
    <div class="receipt-footnote"><p><strong>Saldo después del pago:</strong> ${money(p.balance_after)}</p>${p.topup ? `<p>Abono automático de práctica: ${money(p.topup)}. El cargo completo aparece en tu estado de cuenta bancario.</p>` : ''}<p>Mora: Q25 por mes calendario de atraso y por cuota. Importes congelados al realizar el pago.</p><p class="muted fine">Comprobante de una simulación educativa. No representa pagos a una institución real.</p></div>`;
  $('#receipt-print').onclick = () => window.print();
  $('#receipt-csv').onclick = () =>
    downloadCSV('recibo-NXU-' + p.id + '.csv', [
      [
        'Recibo',
        'Fecha',
        'Semestre',
        'Periodo',
        'Mensualidad',
        'Capital GTQ',
        'Meses de mora',
        'Mora GTQ',
        'Total GTQ'
      ],
      ...items.map((i) => [
        'NXU-' + p.id,
        p.created,
        i.semester,
        i.period,
        i.month,
        (i.principal / 100).toFixed(2),
        i.late_months,
        (i.penalty / 100).toFixed(2),
        (i.total / 100).toFixed(2)
      ])
    ]);
}
