'use strict';

function requestedCourse() {
  return new URLSearchParams(location.search).get('curso');
}
async function loadCourse() {
  const id = requestedCourse();
  if (!id) throw new Error('Elige un curso de tu catálogo para continuar.');
  return (await api('courses/' + encodeURIComponent(id))).course;
}
async function courseList() {
  const { courses, attempts, career, track } = await api('courses');
  $('#catalog-career').textContent =
    career === 'Otra carrera' ? 'Habilidades universitarias' : career;
  $('#catalog-description').textContent =
    'Lecturas, videos y evaluaciones de tu ruta. ' +
    (career === 'Otra carrera'
      ? 'Organiza tu estudio y trabaja en tus metas.'
      : 'Dos cursos introductorios relacionados con tu carrera.');
  $('#course-grid').innerHTML = courses
    .map(
      (c, index) =>
        `<article class="card course-card"><div class="course-cover" style="background:${track.color}"><strong>${escapeHTML(c.symbol)}</strong><span class="pill">${escapeHTML(c.duration)}</span></div><span class="eyebrow">${escapeHTML(c.category)} / 0${index + 1}</span><h2>${escapeHTML(c.title)}</h2><p class="muted">${escapeHTML(c.description)}</p><div class="course-meta"><span>▶ Video específico</span><span>✓ 6 preguntas</span></div><a class="btn" href="/curso.html?curso=${c.id}">Entrar al curso ↗</a></article>`
    )
    .join('');
  $('#attempts').innerHTML = attempts.length
    ? attempts
        .map(
          (a) =>
            `<li class="row between"><div><strong>${escapeHTML(a.title)}</strong><br><small>${escapeHTML(a.category)} · ${date(a.created)}${a.currentCareer ? '' : ' · Logro de una ruta anterior'}</small></div><div><span class="pill">${a.score}/100</span> ${a.score >= 70 ? `<a href="/diploma.html?intento=${a.id}">Mi diploma ↗</a>` : '<span class="muted">Sigue practicando</span>'}</div></li>`
        )
        .join('')
    : '<li class="muted">Tu primera evaluación aparecerá aquí. Empieza con uno de los cursos de tu carrera.</li>';
}
async function lesson() {
  const c = await loadCourse();
  $('#lesson-title').textContent = c.title;
  $('#lesson-career').textContent = c.category;
  $('#lesson-intro').textContent = c.description;
  $('#lesson-body').innerHTML =
    c.sections
      .map(
        ([title, body], i) =>
          `<section><h2>0${i + 1}. ${escapeHTML(title)}</h2><p>${escapeHTML(body)}</p>${i === 0 ? `<img src="/assets/courses/${c.id}.svg" alt="${escapeHTML(c.diagram.join(': '))}">` : ''}</section>`
      )
      .join('') +
    `<h3>Para seguir explorando</h3><p><a href="${escapeHTML(c.resource.url)}" target="_blank" rel="noopener">${escapeHTML(c.resource.label)} ↗</a></p>`;
  $('#video-title').textContent = c.video.title;
  $('#video-credit').textContent =
    c.video.author +
    ' · ' +
    c.video.language +
    ' · Recurso externo del tema de este curso.';
  $('#lesson-video').title = c.video.title;
  $('#lesson-video').src = 'https://www.youtube-nocookie.com/embed/' + c.video.id;
  $('#video-link').href = c.video.url;
  $('#lesson-practice').textContent = c.practice;
  $('#exam-link').href = '/evaluacion.html?curso=' + c.id;
}
async function exam() {
  const c = await loadCourse();
  $('#exam-title').textContent = c.title;
  $('#exam-career').textContent = c.category;
  $('#questions').innerHTML = c.questions
    .map(
      ([title, type, options], i) =>
        `<fieldset><legend>${i + 1}. ${escapeHTML(title)}</legend>${type === 'radio' || type === 'checkbox' ? options.map(([value, label]) => `<label class="choice"><input type="${type}" name="q${i}" value="${escapeHTML(value)}" ${type === 'radio' ? 'required' : ''}>${escapeHTML(label)}</label>`).join('') : type === 'select' ? `<label><span class="sr-only">Respuesta ${i + 1}</span><select name="q${i}" required><option value="">Selecciona una respuesta</option>${options.map(([value, label]) => `<option value="${escapeHTML(value)}">${escapeHTML(label)}</option>`).join('')}</select></label>` : `<label><span class="sr-only">Respuesta ${i + 1}</span><input name="q${i}" type="${type}" ${type === 'number' ? 'min="0" step="1"' : ''} required placeholder="Escribe tu respuesta"></label>`}</fieldset>`
    )
    .join('');
  $('#exam-form [type=submit]').disabled = false;
  bindForm('#exam-form', async (data) => {
    const answers = c.questions.map((q, i) =>
      q[1] === 'checkbox' ? data.getAll('q' + i) : data.get('q' + i)
    );
    if (answers.some((answer, i) => c.questions[i][1] === 'checkbox' && !answer.length))
      throw new Error('Responde también la pregunta de selección múltiple.');
    const r = await api('evaluate', 'POST', { course: c.id, answers });
    $('#exam-result').innerHTML =
      `<div class="result" tabindex="-1"><span class="eyebrow">TU EVALUACIÓN ESTÁ GUARDADA</span><div class="stat">${r.score}<small> / 100</small></div><h2>${r.passed ? '¡Un logro que es tuyo!' : 'Tu siguiente intento empieza con lo aprendido'}</h2><p>${r.passed ? 'Aprobaste ' + escapeHTML(c.title) + '. Tu diploma ya está disponible.' : 'Necesitas al menos 70 puntos. Repasa el curso y vuelve a intentarlo.'}</p>${r.passed ? `<a class="btn" href="/diploma.html?intento=${r.id}">Ver mi diploma ↗</a>` : `<a class="btn" href="/curso.html?curso=${c.id}">Repasar mi curso ↗</a>`}</div>`;
    $('#exam-result .result').focus();
  });
}
async function diploma() {
  const id = Number(new URLSearchParams(location.search).get('intento'));
  if (!Number.isSafeInteger(id) || id <= 0)
    throw new Error('Selecciona un diploma desde tu recorrido.');
  const { attempt: a, title, category, user: u } = await api('diplomas/' + id);
  $('#certificate').innerHTML =
    `<div class="eyebrow">NEXO ACADEMIA · ${escapeHTML(category)}</div><h1>Las ideas crecen<br>cuando aprendes.</h1><p>Otorgamos el presente diploma a</p><div class="name">${escapeHTML(u.name)}</div><p>por aprobar satisfactoriamente el curso</p><h2>${escapeHTML(title)}</h2><p>Calificación: <strong>${a.score}/100</strong> · ${date(a.created)}</p><p class="eyebrow">CONSTANCIA ACADÉMICA DE PRÁCTICA · NX-${a.id}</p><hr><p>Equipo de formación Nexo</p>`;
  $('#print').onclick = () => window.print();
}
function setupCareerForm() {
  const select = $('#profile-career-select');
  if (!select) return;
  select.value = [...select.options].some((o) => o.value === user.career)
    ? user.career
    : 'Otra carrera';
  select.disabled = false;
  $('#career-form [type=submit]').disabled = false;
  bindForm('#career-form', async (data) => {
    user = (await api('me/career', 'PATCH', { career: data.get('career') })).user;
    await profile();
    header();
    toast('Carrera actualizada. Tus cursos y videos ya corresponden a tu nueva ruta.');
  });
}
