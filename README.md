# Nexo 3.0 · Tu carrera, tu siguiente paso

## Publicación en internet

El código está preparado para ejecutar el servidor completo en un alojamiento Node.js.
Consulta [PUBLICAR.md](PUBLICAR.md). GitHub Pages no ejecuta el backend ni SQLite.

[Preparar despliegue en Render](https://render.com/deploy?repo=https://github.com/aljnr602-svg/NEXOPORTAL)

El `render.yaml` configura una **demostración gratuita con almacenamiento temporal**.
Para conservar cuentas y pagos entre reinicios hace falta almacenamiento persistente.
La publicación no incluye bases de datos personales ni cuentas precargadas.

Proyecto académico con HTML, CSS y JavaScript, backend Node.js y SQLite. Incluye **12 páginas**, campus, colegiaturas, banca de práctica y **10 cursos en cinco rutas**. No requiere instalar paquetes npm.

## Iniciar

Instala Node.js **24 o superior** si aún no lo tienes. Extrae todo el ZIP y abre **INICIAR.bat** o ejecuta `npm start` desde esta carpeta. Visita **http://localhost:3000** y mantén abierta la consola. Los HTML necesitan el backend; no se abren directamente. Detén el servidor con Ctrl+C. Si el puerto está ocupado, cierra el Nexo anterior antes de iniciar otro.

Para un iPhone en la misma red, abre **INICIAR-WIFI.bat** y escribe en Safari la dirección que muestre la consola. El inicio Wi-Fi escucha en `0.0.0.0` únicamente para ese proceso; el inicio normal solo en `127.0.0.1`. La computadora debe permanecer encendida. Algunas redes públicas aíslan los dispositivos; utiliza una red doméstica o el punto de acceso del iPhone. La dirección puede cambiar al cambiar de red. Los pagos incluyen compatibilidad con Safari en HTTP local.

## Actualizar sin perder datos

1. Cierra el servidor anterior con Ctrl+C.
2. Conserva la carpeta anterior como respaldo.
3. Extrae **NEXO-CARRERAS-3.0-WIFI.zip** en una carpeta nueva.
4. Copia la carpeta **data** completa anterior dentro de la nueva **NEXO-PORTAL**, con el servidor cerrado. Puede contener la base SQLite y archivos auxiliares WAL/SHM.
5. Abre el nuevo INICIAR.bat o INICIAR-WIFI.bat y recarga el navegador; en computadora puedes utilizar Ctrl+F5.

El ZIP no incluye datos personales ni cuentas de prueba. Se conservan usuarios, saldos, pagos y diplomas anteriores. Las antiguas publicaciones pueden permanecer en la base migrada, pero el módulo social y sus API ya no están disponibles. Sus direcciones antiguas redirigen al campus.

## Cursos según la carrera

| Carrera | Cursos |
| --- | --- |
| Ingeniería en Sistemas | Tu primera página web; Lógica para crear |
| Administración de Empresas | El proceso administrativo; Objetivos y seguimiento empresarial |
| Diseño y Comunicación | Color con intención; Tipografía y jerarquía visual |
| Contaduría Pública | Cuentas y ecuación contable; Patrimonio y cambios en el capital |
| Otra carrera | Organiza tu tiempo de estudio; Metas para tu vida universitaria |

Elige la carrera al registrarte. Puedes corregirla desde **Mi perfil → Actualizar carrera**, sin crear otra cuenta. Esto actualiza lecturas, imágenes, videos y preguntas, conservando tus datos bancarios y diplomas previos. Estos últimos mantienen el nombre y área del curso aprobado.

El backend comprueba la carrera al consultar un curso y al calificar. Cambiar la URL a otra ruta no permite acceder ni realizar esa evaluación. Las carreras antiguas reconocibles se vinculan con su área; las desconocidas reciben habilidades universitarias hasta que se corrija el perfil.

Cada curso tiene tres lecturas, un diagrama SVG local, práctica, recurso complementario, video y seis preguntas. Hay radio buttons, checkboxes, listas, texto y números. El servidor calcula la nota; las respuestas correctas no se envían al navegador. Se aprueba con **70/100**. El diploma se imprime o guarda como PDF desde el diálogo de impresión; es una constancia académica de práctica.

## Videos y fuentes

Los videos se reproducen desde YouTube con atribución al autor y enlace directo. No se descargan ni redistribuyen. Se comprobaron los diez títulos y enlaces mediante los metadatos públicos de YouTube el 31/10/2026. La reproducción integrada puede depender del autor, la conexión y la región; si no funciona, utiliza el enlace. Las lecturas y diagramas no dependen de que cargue el video.

- Sistemas/web: [HTML Crash Course · Traversy Media](https://www.youtube.com/watch?v=UB1O30fR-EE), en inglés con lectura y preguntas en español.
- Sistemas/lógica: [Introducción a los algoritmos · TodoCode](https://www.youtube.com/watch?v=F_sYsMxXzkM).
- Administración/procesos: [El proceso administrativo · Universidad Continental](https://www.youtube.com/watch?v=eE78r9an_CA).
- Administración/objetivos: [Objetivos SMART · Udearroba, Universidad de Antioquia](https://www.youtube.com/watch?v=w1fJrQDDJCE).
- Diseño/color: [Teoría del Color · OscarRGB](https://www.youtube.com/watch?v=ybd_lh8cyyM).
- Diseño/tipografía: [Tipos de tipografía · GCFAprendeLibre](https://www.youtube.com/watch?v=EbV3-AJQElQ).
- Contaduría/cuentas: [Cuentas de Balance y Cuentas de Resultados · Contador Contado](https://www.youtube.com/watch?v=ieONSS2bjpI).
- Contaduría/patrimonio: [Estado de Cambios en el Capital Contable · Contador Contado](https://www.youtube.com/watch?v=APObK8ovyf8).
- Habilidades/tiempo: [Técnica Pomodoro · Liderazgo REx](https://www.youtube.com/watch?v=V51bTPmFgRs), también referenciado por [UNAM](https://sites.google.com/pcpuma.acatlan.unam.mx/autogestion/t%C3%A9cnicas-de-autogesti%C3%B3n).
- Habilidades/metas: [Objetivos SMART · Universidad del Pacífico](https://www.youtube.com/watch?v=-F5-7PRq0vM).

## Universidad y banca

Se mantienen la credencial, los semestres, las colegiaturas, transferencias, servicios, recargas y recibos. El plan de ejemplo tiene ocho semestres, con el alumno en el cuarto. Se cargan dos períodos financieros de seis mensualidades de **Q650** cada uno; cuatro cuotas anteriores aparecen como pagos históricos de ejemplo, sin cargo bancario. Las ocho restantes quedan pendientes. El sistema no reinicia las cuotas al arrancar ni abre períodos nuevos automáticamente.

Cada cuota vence el último día de su mes. La mora es de **Q25 por mes calendario de atraso y por cuota**. Una mensualidad de agosto pagada en octubre suma Q50 de mora: total Q700. La fecha de negocio utiliza America/Guatemala. Al pagar una cuota, su mora queda congelada en el recibo y deja de crecer. Se pueden pagar una o varias cuotas completas, incluidas futuras sin mora. Hay filtros por semestre y estado, recibos imprimibles y exportación CSV.

Los pagos universitarios tienen fondos ficticios ilimitados: si falta saldo, se abona la diferencia y después se registra el cargo completo. Ambos movimientos se concilian con el saldo. El botón **Recargar Q10,000** permite practicar otras operaciones repetidamente, con un tope técnico de saldo de Q10,000,000,000 para precisión numérica.

El pago, el recibo, las cuotas liquidadas y los movimientos se guardan en una transacción SQLite; una clave evita duplicados al reintentar. Los recibos solo pueden consultarse desde la cuenta de su propietario. Para pagar la universidad no hace falta otra cuenta destino. Para probar transferencias, registra otro usuario y copia su número NX.

## Diseño y archivos

La portada agrega tarjetas flotantes, órbita, cinta animada, rutas por carrera y pasos de aprendizaje. El botón de pausa detiene las animaciones y se respeta `prefers-reduced-motion`. El diseño es adaptable y conserva etiquetas, foco visible e impresión. Las fuentes de Google Fonts tienen alternativas locales. Los fondos CSS son propios, inspirados en https://animatedbackgrounds.me/.

- `server.js`: autenticación, API y operaciones de banca/universidad.
- `lib/catalog.js`: catálogo único de carreras, contenido, videos, preguntas y claves privadas.
- `lib/university.js`: plan, cuotas y cálculo de mora.
- `public/assets/app.js`: navegación, registro, perfil y banca.
- `public/assets/academy.js`: aulas, evaluaciones, diplomas y cambio de carrera.
- `public/assets/university.js`: campus, colegiaturas y recibos.
- `public/assets/experience.js`: pausa de animaciones y vista previa de carrera.
- `public/assets/styles.css`, `university.css`, `experience.css`: diseño e impresión.
- `public/assets/courses/*.svg`: un diagrama local por curso.
- `generate-pages.js`: genera los HTML desde `learning-pages.js`, `banking-pages.js` y `university-pages.js`; sobrescribe cambios manuales a las páginas.
- `data/nexo.sqlite`: base local creada al iniciar; excluida del ZIP y Git.

## Pruebas y alcance

Ejecuta `npm test`. Las pruebas utilizan una base temporal aislada y verifican las cinco carreras, los diez cursos, sus videos y evaluaciones, autorización entre carreras, diplomas, cambio de perfil, saldos, pagos, mora, recargas, idempotencia, migración y persistencia después de reiniciar.

Es un proyecto educativo local con dinero ficticio, sin conexión a instituciones o proveedores reales. Las contraseñas se derivan con scrypt y sal individual; las sesiones tienen cookies HttpOnly, SameSite=Strict y caducidad de 24 horas. Se utilizan consultas parametrizadas. Para Internet se necesitan HTTPS, cookies Secure, controles adicionales y copias de seguridad. GitHub Pages solo no ejecuta el backend; se requiere Node.js con disco persistente para SQLite.
