'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  lateMonths,
  priceInvoice,
  createDemoPlan,
  summarize,
  guatemalaToday
} = require('../lib/university');

test('Q25 por mes calendario vencido; no hay mora antes ni el día del vencimiento', () => {
  assert.equal(lateMonths('2026-08-31', '2026-08-01'), 0);
  assert.equal(lateMonths('2026-08-31', '2026-08-31'), 0);
  assert.equal(lateMonths('2026-08-31', '2026-09-01'), 1);
  assert.equal(lateMonths('2026-08-31', '2026-09-30'), 1);
  assert.equal(lateMonths('2026-08-31', '2026-10-01'), 2);

  const price = priceInvoice(
    {
      amount: 65000,
      due_date: '2026-08-31',
      status: 'pending'
    },
    '2026-10-30'
  );

  assert.equal(price.penalty, 5000);
  assert.equal(price.total, 70000);
});

test('Mora en cambio de año y febrero bisiesto', () => {
  assert.equal(lateMonths('2025-12-31', '2026-01-01'), 1);
  assert.equal(lateMonths('2024-02-29', '2024-03-01'), 1);
  assert.equal(lateMonths('2025-12-31', '2026-12-30'), 12);
});

test('Las cuotas pagadas no generan nueva deuda ni mora', () => {
  const price = priceInvoice(
    {
      amount: 65000,
      due_date: '2026-01-31',
      status: 'paid'
    },
    '2028-10-30'
  );

  assert.equal(price.total, 0);
  assert.equal(price.penalty, 0);
  assert.equal(price.state, 'paid');
});

test('Dos semestres consecutivos, doce cuotas y cuatro pagos históricos en cada escenario', () => {
  for (const today of [
    '2026-01-01',
    '2026-06-30',
    '2026-07-01',
    '2026-10-30',
    '2028-02-29'
  ]) {
    const plan = createDemoPlan(today);

    assert.equal(plan.length, 12);
    assert.equal(plan.filter((i) => i.status === 'paid').length, 4);
    assert.equal(new Set(plan.map((i) => i.due_date)).size, 12);

    const result = summarize(plan, today);

    assert.equal(result.summary.semestersOwed, 2);
    assert.equal(result.summary.pendingCount, 8);
    assert.equal(result.summary.principal, 520000);
    assert.ok(result.summary.penalties >= 0);
  }

  assert.equal(createDemoPlan('2026-01-01')[0].period, '2025-2');

  assert.equal(createDemoPlan('2026-10-30')[0].due_date, '2026-01-31');
});

test('Ejemplo de octubre de 2026: capital Q5200 y mora Q375', () => {
  const data = summarize(createDemoPlan('2026-10-30'), '2026-10-30');

  assert.equal(data.summary.penalties, 37500);
  assert.equal(data.summary.total, 557500);
  assert.equal(data.summary.overdueCount, 5);
});

test('Fecha de negocio en formato ISO para Guatemala', () => {
  assert.match(guatemalaToday(), /^\d{4}-\d{2}-\d{2}$/);
});
