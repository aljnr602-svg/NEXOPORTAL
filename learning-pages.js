module.exports = {
  'index.html': [
    'index',
    'Tu carrera, tu siguiente paso',
    `
    <section class="hero next-hero">
      <div class="orb one"></div>
      <div class="orb two"></div>
    
      <div class="hero-content">
        <span class="pill">Tu universidad. A tu manera.</span>
    
        <h1>
          Aprende.<br />
          Avanza.<br />
          <em>Hazlo tuyo.</em>
        </h1>
    
        <p>
          Un campus que va contigo. Cursos para tu carrera, tus semestres en orden y una banca
          conectada a tu vida universitaria.
        </p>
    
        <div class="row">
          <a class="btn lime" href="/universidad.html"> Entrar a mi campus ↗ </a>
    
          <a class="btn translucent" href="#rutas"> Explorar mi ruta ↓ </a>
        </div>
    
        <div class="hero-foot">
          <span class="status-dot"></span>
          <span>Diseñado para tu computadora y tu teléfono</span>
        </div>
      </div>
    
      <div class="hero-art campus-art" aria-hidden="true">
        <div class="orbit orbit-motion">
          <span class="art-core">n.</span>
        </div>
    
        <div class="floating f1">✦ Aprende a tu ritmo</div>
        <div class="floating f2">Tu próximo logro te espera ↗</div>
    
        <div class="mini-card mini-academy">
          <span>MI RUTA ACADÉMICA</span>
    
          <strong>
            Tu carrera.<br />
            Tu contenido.
          </strong>
    
          <div class="mini-progress">
            <i></i>
          </div>
        </div>
    
        <div class="mini-card mini-pay">
          <span>UNIVERSIDAD + BANCA</span>
          <strong>Todo conectado ◈</strong>
    
          <div class="mini-ticks">
            <b>✓ Cuotas</b>
            <b>✓ Recibos</b>
          </div>
        </div>
      </div>
    </section>
    
    <div class="motion-ribbon" aria-label="Universidad, aprendizaje, banca y metas">
      <div aria-hidden="true">
        TU CARRERA <b>✦</b> TU CAMPUS <b>✦</b> TUS METAS <b>✦</b> TU RITMO <b>✦</b> TU CARRERA
        <b>✦</b> TU CAMPUS <b>✦</b> TUS METAS <b>✦</b> TU RITMO <b>✦</b>
      </div>
    
      <button
        id="toggle-motion"
        class="ribbon-toggle"
        aria-label="Pausar animaciones"
        aria-pressed="false"
      >
        Ⅱ
      </button>
    </div>
    
    <div class="section-title" id="explorar">
      <div>
        <span class="eyebrow">MENOS VUELTAS. MÁS POSIBILIDADES.</span>
        <h2>Todo lo que necesitas, conectado.</h2>
      </div>
    
      <span class="pill">Un solo Nexo</span>
    </div>
    
    <section class="grid portal-grid">
      <article class="card module">
        <div class="symbol">⌂</div>
        <span class="eyebrow">01 / MI UNIVERSIDAD</span>
    
        <h2>
          Tu camino,<br />
          más claro.
        </h2>
    
        <p>
          Consulta tu credencial, tus semestres, mensualidades y recibos desde un mismo lugar.
        </p>
    
        <a href="/universidad.html">Explorar mi campus ↗</a>
      </article>
    
      <article class="card module">
        <div class="symbol">↗</div>
        <span class="eyebrow">02 / MI ACADEMIA</span>
    
        <h2>
          Contenido que<br />
          sí va contigo.
        </h2>
    
        <p>
          Lecturas, videos y evaluaciones relacionados con la carrera de tu perfil. Aprende y
          celebra tus logros.
        </p>
    
        <a href="/cursos.html">Ver mis cursos ↗</a>
      </article>
    
      <article class="card module">
        <div class="symbol">◈</div>
        <span class="eyebrow">03 / MI BANCA</span>
    
        <h2>
          Tus cuentas,<br />
          sin enredos.
        </h2>
    
        <p>
          Paga tu universidad, consulta movimientos y genera comprobantes con dinero de
          práctica.
        </p>
    
        <a href="/banca.html">Abrir mi banca ↗</a>
      </article>
    </section>
    
    <section id="rutas" class="routes-section">
      <div>
        <span class="eyebrow">TUS INTERESES MARCAN LA RUTA</span>
    
        <h2>
          No todos aprendemos<br />
          lo mismo. Y está bien.
        </h2>
    
        <p class="muted">
          Elige tu carrera al registrarte. Nexo conecta tu perfil con una ruta de aprendizaje
          específica, desde el primer video hasta el diploma.
        </p>
    
        <a class="btn" href="/registro.html"> Encontrar mi camino ↗ </a>
      </div>
    
      <div class="route-preview">
        <a href="/cursos.html">
          <span class="route-symbol accounting">Q</span>
    
          <div>
            <strong>Contaduría Pública</strong>
            <small>Cuentas, balances y patrimonio</small>
          </div>
    
          <span>↗</span>
        </a>
    
        <a href="/cursos.html">
          <span class="route-symbol systems">&lt;/&gt;</span>
    
          <div>
            <strong>Ingeniería en Sistemas</strong>
            <small>Desarrollo web y lógica</small>
          </div>
    
          <span>↗</span>
        </a>
    
        <a href="/cursos.html">
          <span class="route-symbol business">↗</span>
    
          <div>
            <strong>Administración de Empresas</strong>
            <small>Procesos y objetivos</small>
          </div>
    
          <span>↗</span>
        </a>
    
        <a href="/cursos.html">
          <span class="route-symbol design">Aa</span>
    
          <div>
            <strong>Diseño y Comunicación</strong>
            <small>Color, tipografía y jerarquía</small>
          </div>
    
          <span>↗</span>
        </a>
    
        <a href="/cursos.html">
          <span class="route-symbol general">✦</span>
    
          <div>
            <strong>Otra carrera</strong>
            <small>Organización y metas universitarias</small>
          </div>
    
          <span>↗</span>
        </a>
      </div>
    </section>
    
    <section class="journey-banner">
      <div>
        <span class="eyebrow">DE LA IDEA AL LOGRO</span>
    
        <h2>
          Tu siguiente paso<br />
          puede empezar hoy.
        </h2>
      </div>
    
      <div class="journey-steps">
        <div>
          <b>01</b>
          <strong>Elige tu carrera</strong>
          <small>Una ruta para tu perfil.</small>
        </div>
    
        <div>
          <b>02</b>
          <strong>Aprende y practica</strong>
          <small>Contenido que tiene sentido.</small>
        </div>
    
        <div>
          <b>03</b>
          <strong>Celebra tu avance</strong>
          <small>Tu evaluación y tu diploma.</small>
        </div>
      </div>
    
      <a class="btn lime" href="/cursos.html"> Dar el siguiente paso ↗ </a>
    </section>
    `
  ],

  'registro.html': [
    'register',
    'Tu cuenta, tu carrera',
    `
    <div id="already"></div>
    
    <section class="auth">
      <div class="auth-intro">
        <span class="pill">BIENVENIDO A NEXO</span>
    
        <h1>
          Tu camino.<br />
          Tu carrera.<br />
          <span style="color: var(--lime)">Tu próximo logro.</span>
        </h1>
    
        <p>Una cuenta para aprender y organizar tu vida universitaria.</p>
    
        <ul class="list">
          <li>↗ Cursos y videos de tu carrera</li>
          <li>⌂ Tus semestres y colegiaturas</li>
          <li>◈ Tu banca universitaria conectada</li>
        </ul>
    
        <small>Plataforma académica · Los saldos son ficticios.</small>
      </div>
    
      <div class="auth-form">
        <div class="tabs">
          <button type="button" data-auth="register">Registrarme</button>
    
          <button type="button" data-auth="login" class="secondary">Ya tengo cuenta</button>
        </div>
    
        <h2 id="auth-title">Crea tu cuenta</h2>
    
        <form id="auth-form">
          <div id="auth-fields">
            <label>
              Nombre completo
    
              <input name="name" autocomplete="name" maxlength="80" data-required />
            </label>
    
            <label>
              Carrera
    
              <select name="career" id="registration-career" data-required>
                <option value="">Selecciona tu carrera</option>
                <option>Ingeniería en Sistemas</option>
                <option>Administración de Empresas</option>
                <option>Diseño y Comunicación</option>
                <option>Contaduría Pública</option>
                <option>Otra carrera</option>
              </select>
            </label>
    
            <p id="career-preview" class="career-hint" role="status">
              La carrera elegida determina tus cursos, videos y evaluaciones.
            </p>
    
            <label>
              Sobre tu formación (opcional)
    
              <textarea
                name="bio"
                maxlength="400"
                placeholder="¿Qué te gustaría aprender?"
              ></textarea>
            </label>
          </div>
    
          <label>
            Correo electrónico
    
            <input name="email" type="email" autocomplete="email" required maxlength="200" />
          </label>
    
          <label>
            Contraseña
    
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              maxlength="128"
              minlength="8"
              placeholder="Al menos 8 caracteres"
            />
          </label>
    
          <button id="auth-submit" type="submit">Crear cuenta y continuar ↗</button>
    
          <p id="auth-status" class="message" role="status"></p>
        </form>
      </div>
    </section>
    `
  ],

  'perfil.html': [
    'profile',
    'Mi perfil y mi carrera',
    `
    <div class="page-head">
      <span class="eyebrow">TU PERFIL / TU RUTA</span>
    
      <h1>El camino empieza contigo.</h1>
    
      <p>Tu carrera conecta tu perfil con los cursos y videos que verás en Academia.</p>
    </div>
    
    <div class="two">
      <section class="card">
        <h2>Mi registro</h2>
        <div id="profile-data"></div>
      </section>
    
      <section class="stack">
        <form id="career-form" class="card">
          <span class="eyebrow">CONTENIDO A TU MEDIDA</span>
    
          <h2>Mi carrera.</h2>
    
          <label>
            Actualizar carrera
    
            <select name="career" id="profile-career-select" required disabled>
              <option>Ingeniería en Sistemas</option>
              <option>Administración de Empresas</option>
              <option>Diseño y Comunicación</option>
              <option>Contaduría Pública</option>
              <option>Otra carrera</option>
            </select>
          </label>
    
          <p class="muted fine">
            Al cambiarla, se actualizan tu catálogo, lecturas, videos y evaluaciones. Tus
            datos bancarios, pagos y diplomas obtenidos se conservan.
          </p>
    
          <button type="submit" disabled>Guardar mi carrera ↗</button>
    
          <p class="message" role="status"></p>
        </form>
    
        <section class="card stack">
          <h2>¿Qué hacemos hoy?</h2>
    
          <p>
            <a class="btn lime" href="/cursos.html"> Aprender en mi carrera ↗ </a>
          </p>
    
          <p>
            <a class="btn secondary" href="/universidad.html"> Entrar a mi universidad ↗ </a>
          </p>
    
          <p>
            <a class="btn secondary" href="/banca.html"> Abrir mi banca ↗ </a>
          </p>
        </section>
      </section>
    </div>
    `
  ],

  'cursos.html': [
    'courses',
    'Mi ruta de aprendizaje',
    `
    <div class="page-head">
      <span class="eyebrow"> NEXO ACADEMIA / APRENDER CON PROPÓSITO </span>
    
      <h1>
        Hola, <span data-name></span>.<br />
        Esto sí va contigo.
      </h1>
    
      <p>Tu ruta de aprendizaje se adapta a la carrera de tu perfil.</p>
    </div>
    
    <section class="career-route-banner">
      <div>
        <span class="eyebrow">MI RUTA ACTUAL</span>
    
        <h2 id="catalog-career">Cargando tu carrera…</h2>
    
        <p id="catalog-description" class="muted"></p>
      </div>
    
      <a class="btn secondary" href="/perfil.html"> Revisar mi carrera ↗ </a>
    </section>
    
    <section class="two" id="course-grid" aria-live="polite"></section>
    
    <section class="card section-gap">
      <div class="row between">
        <h2>Mi recorrido y mis diplomas</h2>
        <span class="pill">Aprobación desde 70/100</span>
      </div>
    
      <p class="muted fine">
        Tus logros anteriores también se conservan si actualizas tu carrera.
      </p>
    
      <ul id="attempts" class="list"></ul>
    </section>
    
    <section class="campus-link-bar section-gap">
      <div>
        <span class="eyebrow">TU CAMPUS SIGUE CONTIGO</span>
        <h3>Tus semestres, en orden.</h3>
        <p>Consulta tus mensualidades y paga desde tu banca.</p>
      </div>
    
      <a class="btn" href="/universidad.html"> Abrir mi campus ↗ </a>
    </section>
    `
  ],

  'curso.html': [
    'lesson',
    'Mi aula',
    `
    <div class="page-head">
      <a href="/cursos.html">← Mis cursos</a>
    
      <p class="eyebrow" id="lesson-career"></p>
    
      <h1 id="lesson-title">Preparando tu aula…</h1>
    
      <p id="lesson-intro"></p>
    </div>
    
    <div class="narrow">
      <article class="card lesson">
        <div id="lesson-body"></div>
    
        <section class="lesson-video-block">
          <span class="eyebrow">TU CLASE EN VIDEO</span>
    
          <h2 id="video-title"></h2>
    
          <p id="video-credit" class="muted fine"></p>
    
          <iframe
            id="lesson-video"
            title="Video del curso"
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin"
          ></iframe>
    
          <p>
            <a id="video-link" target="_blank" rel="noopener">
              Abrir el video en YouTube ↗
            </a>
          </p>
    
          <p class="muted fine">
            El video requiere Internet. Si el autor restringe su reproducción aquí, utiliza el
            enlace para verlo en YouTube.
          </p>
        </section>
    
        <div class="banner">
          <strong>Tu práctica</strong>
          <p id="lesson-practice"></p>
        </div>
    
        <a class="btn" id="exam-link" href="/cursos.html"> Poner a prueba lo aprendido ↗ </a>
      </article>
    </div>
    `
  ],

  'evaluacion.html': [
    'exam',
    'Mi evaluación',
    `
    <div class="page-head">
      <a href="/cursos.html">← Mis cursos</a>
    
      <p class="eyebrow" id="exam-career"></p>
    
      <h1>Pon tus ideas a prueba.</h1>
    
      <p id="exam-title"></p>
    </div>
    
    <div class="narrow">
      <div class="banner">
        6 preguntas sobre tu curso · Nota sobre 100 · Apruebas con 70 o más. Puedes volver a
        intentarlo.
      </div>
    
      <form id="exam-form" class="card">
        <div id="questions"></div>
    
        <button type="submit" disabled>Guardar respuestas y calificar ↗</button>
    
        <p class="message" role="status"></p>
      </form>
    
      <div id="exam-result" aria-live="polite"></div>
    </div>
    `
  ],

  'diploma.html': [
    'diploma',
    'Mi logro',
    `
    <div class="row between no-print page-head">
      <a href="/cursos.html">← Mi aprendizaje</a>
    
      <button id="print">Imprimir / Guardar PDF ↗</button>
    </div>
    
    <article id="certificate" class="diploma"></article>
    `
  ]
};
