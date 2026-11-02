// Páginas nuevas. El generador principal las integra con la misma navegación.
module.exports = {
  'universidad.html': [
    'university',
    'Mi universidad',
    `
    <section class="campus-hero">
      <div class="orb one"></div>
    
      <div class="campus-hero-copy">
        <span class="eyebrow">UNIVERSIDAD NEXO · MI CAMPUS</span>
    
        <h1>
          Tu futuro,<br />
          <em>bien encaminado.</em>
        </h1>
    
        <p>
          Hola, <span data-name></span>. Tu recorrido académico y tus finanzas, conectados en
          un mismo lugar.
        </p>
    
        <div class="row">
          <a class="btn lime" href="/colegiaturas.html"> Consultar mis colegiaturas ↗ </a>
    
          <a class="btn translucent" href="/cursos.html"> Continuar aprendiendo → </a>
        </div>
      </div>
    
      <div class="student-pass">
        <div class="row between">
          <span class="eyebrow">MI CREDENCIAL DIGITAL</span>
          <span class="pass-mark">n.</span>
        </div>
    
        <div class="avatar" id="campus-avatar">N</div>
    
        <h2 id="campus-name">Cargando tu perfil…</h2>
    
        <p id="campus-career"></p>
    
        <div class="row between pass-bottom">
          <span id="student-code" class="account"></span>
          <span class="tag">Estudiante activo</span>
        </div>
      </div>
    </section>
    
    <div class="section-title">
      <div>
        <span class="eyebrow">TODO CLARO, TODO A MANO</span>
        <h2>Tu universidad en un vistazo.</h2>
      </div>
    
      <span class="pill" id="campus-today"></span>
    </div>
    
    <section class="metrics" id="campus-metrics" aria-live="polite"></section>
    
    <section class="campus-layout section-gap">
      <div class="stack">
        <article class="card">
          <div class="row between">
            <div>
              <span class="eyebrow">TESORERÍA / RESUMEN</span>
              <h2>Así van tus semestres.</h2>
            </div>
    
            <a class="text-link" href="/colegiaturas.html"> Ver detalle ↗ </a>
          </div>
    
          <div id="semester-cards" class="two"></div>
    
          <p class="muted fine">
            Semestres con deuda y semestres por cursar son cosas distintas: aquí ves las
            cuotas pendientes de los dos períodos cargados.
          </p>
        </article>
    
        <article class="card">
          <div class="row between">
            <div>
              <span class="eyebrow">TU CAMINO ACADÉMICO</span>
              <h2>Un paso a la vez.</h2>
            </div>
    
            <span class="tag">Plan de demostración</span>
          </div>
    
          <div id="academic-path"></div>
    
          <div class="row section-gap">
            <a class="btn secondary" href="/cursos.html"> Mis cursos y diplomas ↗ </a>
    
            <a class="text-link" href="/perfil.html"> Consultar mi carrera → </a>
          </div>
        </article>
    
        <article class="card">
          <div class="row between">
            <h2>Mis últimos recibos</h2>
    
            <a href="/colegiaturas.html#receipts"> Ver todos ↗ </a>
          </div>
    
          <div id="campus-receipts"></div>
        </article>
      </div>
    
      <aside class="stack">
        <article class="card funding-card">
          <span class="infinity">∞</span>
          <span class="eyebrow">TU BANCA TAMBIÉN ES TUYA</span>
    
          <h2>
            Aprende a pagar.<br />
            Sin quedarte sin saldo.
          </h2>
    
          <p>
            Los pagos de la universidad tienen fondos de práctica ilimitados. Si tu saldo no
            alcanza, Nexo abona la diferencia y registra el pago.
          </p>
    
          <div class="row between">
            <span>Saldo en banca</span>
            <strong id="campus-balance"></strong>
          </div>
    
          <a class="btn lime" href="/banca.html"> Abrir mi banca ↗ </a>
    
          <small>Dinero ficticio. Sin cobros reales.</small>
        </article>
    
        <article class="card">
          <span class="eyebrow">REGLAS TRANSPARENTES</span>
    
          <h3>Sin sorpresas en tu cuenta.</h3>
    
          <ul class="rule-list">
            <li>
              <b>Q650</b>
              <span>por mensualidad de ejemplo.</span>
            </li>
    
            <li>
              <b>Q25</b>
              <span>por cada mes calendario de atraso, por cuota.</span>
            </li>
    
            <li>
              <b>Fin de mes</b>
              <span>es la fecha límite para pagar sin mora.</span>
            </li>
    
            <li>
              <b>Un recibo</b>
              <span>por pago, con el detalle de tus cuotas y multas.</span>
            </li>
          </ul>
    
          <a href="/colegiaturas.html#fee-policy"> ¿Cómo se calcula la mora? ↗ </a>
        </article>
      </aside>
    </section>
    `
  ],

  'colegiaturas.html': [
    'tuition',
    'Colegiaturas y pagos',
    `
    <div class="page-head">
      <div class="row between">
        <span class="eyebrow">MI UNIVERSIDAD / TESORERÍA</span>
    
        <a class="text-link" href="/universidad.html"> ← Mi campus </a>
      </div>
    
      <h1>
        Tus cuentas claras.<br />
        <span class="soft-highlight">Tu próximo paso, libre.</span>
      </h1>
    
      <p>Revisa cada cuota, entiende la mora y paga desde tu cuenta Nexo.</p>
    </div>
    
    <section class="metrics" id="tuition-metrics" aria-live="polite"></section>
    
    <section class="billing-layout section-gap">
      <div class="stack">
        <article class="card">
          <div class="row between">
            <div>
              <span class="eyebrow"> ESTADO DE CUENTA UNIVERSITARIO </span>
    
              <h2>Elige qué quieres pagar.</h2>
            </div>
    
            <button id="tuition-csv" class="secondary">Exportar CSV ↓</button>
          </div>
    
          <div class="billing-toolbar">
            <label>
              Semestre
    
              <select id="semester-filter">
                <option value="">Todos los semestres</option>
              </select>
            </label>
    
            <label>
              Estado
    
              <select id="invoice-filter">
                <option value="unpaid">Pendientes de pago</option>
                <option value="overdue">Vencidas</option>
                <option value="paid">Pagadas</option>
                <option value="all">Todas las cuotas</option>
              </select>
            </label>
          </div>
    
          <div class="row quick-select">
            <button class="secondary" id="select-visible">Seleccionar visibles</button>
    
            <button class="secondary" id="select-overdue">Solo vencidas</button>
    
            <button class="secondary" id="clear-selection">Limpiar selección</button>
          </div>
    
          <p class="muted fine" id="invoice-count" role="status"></p>
    
          <div id="invoice-list"></div>
        </article>
    
        <article class="card" id="receipts">
          <div class="row between">
            <div>
              <span class="eyebrow">TUS PAGOS, EN ORDEN</span>
              <h2>Recibos de la universidad.</h2>
            </div>
    
            <a href="/estado-cuenta.html"> Ver movimientos bancarios ↗ </a>
          </div>
    
          <div id="tuition-receipts"></div>
        </article>
    
        <article class="card" id="fee-policy">
          <span class="eyebrow"> ASÍ CALCULAMOS TU ESTADO DE CUENTA </span>
    
          <h2>Q25 por mes de atraso.</h2>
    
          <p>
            Cada mensualidad vence el último día de su mes. La mora comienza el primer día del
            mes siguiente y suma Q25 por cada mes calendario de atraso, por cuota pendiente.
            No hay interés compuesto.
          </p>
    
          <div class="fee-example">
            <span>Una cuota de agosto, pagada en octubre</span>
            <strong>Q650 + (2 × Q25) = Q700</strong>
          </div>
    
          <p class="muted fine">
            La fecha se calcula en horario de Guatemala. Al pagar una cuota, su importe y su
            mora quedan guardados en el recibo y dejan de acumular cargos. Puedes adelantar
            mensualidades aún no vencidas sin multa. Los pagos son completos por cuota; no se
            realizan abonos parciales.
          </p>
    
          <p class="muted fine">
            Los dos períodos y las cuatro cuotas históricas pagadas son datos precargados de
            la simulación; no representan pagos efectuados desde tu banca.
          </p>
        </article>
      </div>
    
      <aside>
        <section class="card checkout">
          <span class="eyebrow">TU RESUMEN DE PAGO</span>
    
          <h2>Un pendiente menos.</h2>
    
          <div class="checkout-count">
            <span id="selection-count">0</span>
            cuotas seleccionadas
          </div>
    
          <div class="payment-lines">
            <div>
              <span>Mensualidades</span>
              <strong id="selection-principal">Q0.00</strong>
            </div>
    
            <div>
              <span>Mora acumulada</span>
              <strong id="selection-penalty">Q0.00</strong>
            </div>
    
            <div class="payment-total">
              <span>Total a pagar</span>
              <strong id="selection-total">Q0.00</strong>
            </div>
          </div>
    
          <div class="wallet-chip">
            <span class="wallet-icon">◈</span>
    
            <div>
              <strong>Banca Nexo</strong>
              <small id="checkout-account"></small>
            </div>
    
            <span class="tag">∞ Demo</span>
          </div>
    
          <p class="muted fine">
            Saldo actual: <strong id="checkout-balance"></strong>. Si hace falta, recibirás
            automáticamente los fondos ficticios necesarios.
          </p>
    
          <p id="topup-preview" class="topup-note" hidden></p>
    
          <button id="open-payment" class="btn lime full-width" disabled>
            Revisar y pagar ↗
          </button>
    
          <p id="billing-status" class="message" role="status"></p>
    
          <a class="text-link" href="/banca.html"> Consultar mi banca → </a>
        </section>
      </aside>
    </section>
    
    <dialog id="payment-dialog" class="payment-dialog">
      <div class="row between">
        <span class="eyebrow">ANTES DE CONTINUAR</span>
    
        <button id="close-payment" class="secondary" aria-label="Cerrar confirmación">
          ✕
        </button>
      </div>
    
      <h2>Confirma tu pago.</h2>
    
      <div id="payment-review"></div>
    
      <p class="muted fine">
        Se registrará un cargo en tu banca y recibirás un comprobante. Esta es una operación
        con dinero ficticio.
      </p>
    
      <div class="row">
        <button id="confirm-payment" class="lime">Confirmar pago ↗</button>
    
        <button id="cancel-payment" class="secondary">Volver</button>
      </div>
    
      <p id="payment-status" class="message" role="status"></p>
    </dialog>
    `
  ],

  'recibo.html': [
    'receipt',
    'Comprobante universitario',
    `
    <div class="page-head no-print">
      <div class="row between">
        <a class="text-link" href="/colegiaturas.html"> ← Mis colegiaturas </a>
    
        <div class="row">
          <button id="receipt-print">Imprimir / Guardar PDF ↗</button>
    
          <button id="receipt-csv" class="secondary">Exportar CSV ↓</button>
        </div>
      </div>
    </div>
    
    <article class="card university-receipt" id="university-receipt">
      <p>Cargando comprobante…</p>
    </article>
    
    <div class="row no-print receipt-links">
      <a class="btn lime" href="/universidad.html"> Volver a mi campus ↗ </a>
    
      <a class="btn secondary" href="/banca.html"> Ver mi banca → </a>
    </div>
    `
  ]
};
