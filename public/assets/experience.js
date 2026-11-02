'use strict';
document.addEventListener('DOMContentLoaded', () => {
  const motionButton = document.getElementById('toggle-motion');
  function setMotion(paused) {
    document.body.classList.toggle('motion-paused', paused);
    if (motionButton) {
      motionButton.setAttribute('aria-pressed', String(paused));
      motionButton.setAttribute(
        'aria-label',
        paused ? 'Activar animaciones' : 'Pausar animaciones'
      );
      motionButton.textContent = paused ? '▶' : 'Ⅱ';
    }
  }
  let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
  try {
    paused = paused || localStorage.getItem('nexo-motion') === 'paused';
  } catch {}
  setMotion(paused);
  motionButton?.addEventListener('click', () => {
    paused = !paused;
    setMotion(paused);
    try {
      localStorage.setItem('nexo-motion', paused ? 'paused' : 'active');
    } catch {}
  });
  const career = document.getElementById('registration-career');
  const hint = document.getElementById('career-preview');
  const hints = {
    'Ingeniería en Sistemas': 'Tu ruta: desarrollo web y lógica de programación.',
    'Administración de Empresas':
      'Tu ruta: proceso administrativo y objetivos empresariales.',
    'Diseño y Comunicación': 'Tu ruta: teoría del color, tipografía y jerarquía visual.',
    'Contaduría Pública':
      'Tu ruta: cuentas contables, balances y cambios en el patrimonio.',
    'Otra carrera': 'Tu ruta: organización del estudio y metas universitarias.'
  };
  career?.addEventListener('change', () => {
    hint.textContent =
      hints[career.value] ||
      'La carrera elegida determina tus cursos, videos y evaluaciones.';
  });
});
