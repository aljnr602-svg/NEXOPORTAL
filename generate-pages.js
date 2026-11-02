'use strict';

// Los HTML ya están incluidos.
// Este generador permite recrearlos al editar plantillas.

const fs = require('node:fs');
const path = require('node:path');

const { catalog } = require('./lib/catalog');

const pages = {
  ...require('./learning-pages'),
  ...require('./banking-pages'),
  ...require('./university-pages')
};

const xml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;'
      })[c]
  );

const diagramDir = path.join(__dirname, 'public', 'assets', 'courses');

fs.mkdirSync(diagramDir, {
  recursive: true
});

for (const c of catalog) {
  const colors = ['#d6f66b', '#d9ccff', '#b8e6db'];

  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 900 340"
      role="img"
      aria-labelledby="title"
    >
      <title id="title">${xml(c.title)}</title>

      <rect
        width="900"
        height="340"
        rx="25"
        fill="#1d2927"
      />

      <g font-family="Arial,sans-serif" text-anchor="middle">
        <text
          x="450"
          y="60"
          fill="#ffffff"
          font-size="24"
        >
          ${xml(c.title)}
        </text>

        ${[0, 1, 2]
          .map(
            (i) => `
              <rect
                x="${45 + i * 280}"
                y="100"
                width="250"
                height="190"
                rx="20"
                fill="${colors[i]}"
              />

              <text
                x="${170 + i * 280}"
                y="178"
                fill="#1d2927"
                font-size="23"
                font-weight="bold"
              >
                ${xml(c.diagram[i * 2])}
              </text>

              <text
                x="${170 + i * 280}"
                y="228"
                fill="#1d2927"
                font-size="17"
              >
                ${xml(c.diagram[i * 2 + 1])}
              </text>
            `
          )
          .join('')}
      </g>
    </svg>
  `;

  fs.writeFileSync(path.join(diagramDir, c.id + '.svg'), svg);
}

for (const [file, [page, title, content]] of Object.entries(pages)) {
  const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">

    <meta
      name="viewport"
      content="width=device-width,initial-scale=1"
    >

    <meta
      name="description"
      content="Nexo: tu universidad, cursos por carrera y banca de práctica conectada."
    >

    <meta name="theme-color" content="#1d2927">

    <title>${title} · Nexo</title>

    <link
      rel="icon"
      href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='10' fill='%231d2927'/%3E%3Ctext x='10' y='29' fill='%23d6f66b' font-size='30'%3En%3C/text%3E%3C/svg%3E"
    >

    <link rel="stylesheet" href="/assets/styles.css">
    <link rel="stylesheet" href="/assets/university.css">
    <link rel="stylesheet" href="/assets/experience.css">

    <script src="/assets/app.js" defer></script>
    <script src="/assets/university.js" defer></script>
    <script src="/assets/academy.js" defer></script>
    <script src="/assets/experience.js" defer></script>
  </head>

  <body data-page="${page}">
    <a class="sr-only" href="#content">
      Saltar al contenido
    </a>

    <header id="header"></header>

    <main id="content" class="container">
      ${content}
    </main>

    <footer class="container footer">
      <span>
        © ${new Date().getFullYear()} Nexo · Tu carrera, tu siguiente paso.
      </span>

      <span>
        Proyecto académico ·
        <a href="/universidad.html">Mi universidad ↗</a>
      </span>
    </footer>

    <noscript>
      Activa JavaScript para utilizar la plataforma.
    </noscript>
  </body>
</html>
`;

  fs.writeFileSync(path.join(__dirname, 'public', file), html);
}

console.log(
  Object.keys(pages).length + ' páginas y ' + catalog.length + ' diagramas generados.'
);
