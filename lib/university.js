'use strict';

// Reglas de la simulación universitaria. Todos los montos están en centavos.
const MONTHLY_TUITION = 65000;
const MONTHLY_PENALTY = 2500;
const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
];

function guatemalaToday() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Guatemala',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function endOfMonth(year, month) {
  return new Date(Date.UTC(year, month + 1, 0)).toISOString().slice(0, 10);
}

// La fecha límite es el último día del mes. Un mes de atraso se cuenta al
// iniciar el siguiente mes calendario. Ejemplo: vence 31/08; 01/10 = 2 × Q25.
function lateMonths(dueDate, today) {
  if (today <= dueDate) return 0;
  const [year, month] = today.split('-').map(Number);
  const [dueYear, dueMonth] = dueDate.split('-').map(Number);
  return Math.max(0, (year - dueYear) * 12 + month - dueMonth);
}

function priceInvoice(invoice, today) {
  if (invoice.status === 'paid') {
    return { ...invoice, lateMonths: 0, penalty: 0, total: 0, state: 'paid' };
  }
  const months = lateMonths(invoice.due_date, today);
  const penalty = months * MONTHLY_PENALTY;
  return {
    ...invoice,
    lateMonths: months,
    penalty,
    total: invoice.amount + penalty,
    state: months > 0 ? 'overdue' : 'pending'
  };
}

function createDemoPlan(today) {
  const [year, month] = today.split('-').map(Number);
  const currentStart = month <= 6 ? 0 : 6;
  const previousStart = currentStart === 0 ? 6 : 0;
  const previousYear = currentStart === 0 ? year - 1 : year;
  const semesters = [
    { number: 3, year: previousYear, start: previousStart },
    { number: 4, year, start: currentStart }
  ];
  return semesters.flatMap((semester) =>
    Array.from({ length: 6 }, (_, index) => {
      const m = semester.start + index;
      return {
        semester: semester.number,
        period: `${semester.year}-${semester.start === 0 ? '1' : '2'}`,
        month: MONTHS[m],
        due_date: endOfMonth(semester.year, m),
        amount: MONTHLY_TUITION,
        status: semester.number === 3 && index < 4 ? 'paid' : 'pending',
        // Cuotas históricas precargadas de la simulación, no movimientos bancarios.
        demo_paid: semester.number === 3 && index < 4 ? 1 : 0
      };
    })
  );
}

function summarize(invoices, today) {
  const priced = invoices.map((invoice) => priceInvoice(invoice, today));
  const pending = priced.filter((invoice) => invoice.state !== 'paid');
  const overdue = pending.filter((invoice) => invoice.state === 'overdue');
  return {
    invoices: priced,
    summary: {
      monthlyTuition: MONTHLY_TUITION,
      monthlyPenalty: MONTHLY_PENALTY,
      pendingCount: pending.length,
      paidCount: priced.length - pending.length,
      overdueCount: overdue.length,
      semestersOwed: new Set(pending.map((invoice) => invoice.semester)).size,
      principal: pending.reduce((sum, invoice) => sum + invoice.amount, 0),
      penalties: pending.reduce((sum, invoice) => sum + invoice.penalty, 0),
      total: pending.reduce((sum, invoice) => sum + invoice.total, 0),
      overdueTotal: overdue.reduce((sum, invoice) => sum + invoice.total, 0)
    }
  };
}

module.exports = {
  MONTHLY_TUITION,
  MONTHLY_PENALTY,
  guatemalaToday,
  lateMonths,
  priceInvoice,
  createDemoPlan,
  summarize
};
