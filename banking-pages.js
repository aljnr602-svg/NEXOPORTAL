module.exports = {
  'banca.html': [
    'bank',
    'Nexo Banca',
    `
    <div class="page-head">
      <span class="eyebrow"> NEXO BANCA / TÚ LLEVAS LAS CUENTAS </span>
    
      <h1>Tu dinero, en perspectiva.</h1>
    
      <p>Consulta, transfiere y organiza tus movimientos en un solo lugar.</p>
    </div>
    
    <div class="banner">
      Fondos de práctica ilimitados. Recarga gratis las veces que quieras; al pagar la
      universidad, Nexo completa automáticamente el saldo que te falte.
    </div>
    
    <section id="bank-university" class="card bank-university section-gap"></section>
    
    <div class="two section-gap">
      <section class="card balance">
        <span class="eyebrow">SALDO DISPONIBLE</span>
    
        <div id="balance" class="stat"></div>
        <div id="holder"></div>
    
        <p id="account" class="account"></p>
    
        <div class="row">
          <button id="copy-account" class="lime">Copiar cuenta ↗</button>
    
          <button id="topup-button" class="translucent">＋ Recargar Q10,000</button>
        </div>
    
        <p id="topup-status" class="message" role="status"></p>
      </section>
    
      <section class="card">
        <span class="eyebrow">A TU ALCANCE</span>
    
        <h2>Tu vida universitaria, conectada.</h2>
    
        <p class="muted">
          Paga tu universidad sin escribir una cuenta destino. Las colegiaturas, la mora y el
          recibo se conectan automáticamente con tus movimientos. También puedes transferir a
          otro usuario o pagar servicios.
        </p>
    
        <p>
          <a class="btn lime" href="/colegiaturas.html"> Pagar mi universidad ↗ </a>
        </p>
    
        <a class="btn secondary" href="/estado-cuenta.html"> Generar estado de cuenta ↗ </a>
    
        <p>
          <small>
            Para probar una transferencia, registra un segundo usuario y copia su número de
            cuenta.
          </small>
        </p>
      </section>
    </div>
    
    <div class="two" style="margin-top: 24px">
      <form id="transfer-form" class="card">
        <h2>Enviar una transferencia</h2>
    
        <label>
          Cuenta destino
    
          <input name="destination" required maxlength="40" placeholder="NX…" />
        </label>
    
        <label>
          Monto en quetzales
    
          <input
            name="amount"
            type="number"
            min="0.01"
            max="1000000"
            step="0.01"
            required
            placeholder="0.00"
          />
        </label>
    
        <button type="submit">Transferir ↗</button>
    
        <p class="message" role="status"></p>
      </form>
    
      <form id="payment-form" class="card">
        <h2>Pagar un servicio</h2>
    
        <label>
          Servicio
    
          <select name="service" required>
            <option>Telefonía</option>
            <option>Agua potable</option>
            <option>Electricidad</option>
            <option>Internet</option>
          </select>
        </label>
    
        <label>
          Referencia del recibo
    
          <input
            name="reference"
            required
            maxlength="60"
            placeholder="Número de contrato o recibo"
          />
        </label>
    
        <label>
          Monto en quetzales
    
          <input
            name="amount"
            type="number"
            min="0.01"
            max="1000000"
            step="0.01"
            required
            placeholder="0.00"
          />
        </label>
    
        <button type="submit">Registrar pago ↗</button>
    
        <p class="message" role="status"></p>
      </form>
    </div>
    
    <section class="card" style="margin-top: 24px">
      <div class="row between">
        <h2>Últimos movimientos</h2>
    
        <a href="/estado-cuenta.html">Ver todos ↗</a>
      </div>
    
      <div id="movements"></div>
    </section>
    `
  ],

  'estado-cuenta.html': [
    'statement',
    'Tu estado de cuenta',
    `
    <div class="page-head">
      <span class="eyebrow"> NEXO BANCA · DINERO FICTICIO </span>
    
      <h1>Estado de cuenta.</h1>
    
      <div class="row no-print">
        <a class="btn secondary" href="/banca.html"> ← Mi cuenta </a>
    
        <button id="print">Imprimir / Guardar PDF</button>
    
        <button id="csv" class="secondary">Descargar CSV ↗</button>
      </div>
    </div>
    
    <section class="card">
      <div class="row between">
        <div>
          <h2 id="statement-name"></h2>
    
          <p id="statement-account" class="account"></p>
    
          <small>
            Emitido:
            <span id="statement-date"></span>
          </small>
        </div>
    
        <div>
          <span class="eyebrow">SALDO ACTUAL</span>
    
          <div id="statement-balance" class="stat"></div>
        </div>
      </div>
    
      <div id="movements"></div>
    </section>
    `
  ]
};
