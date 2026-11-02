# Publicar Nexo en internet

El repositorio contiene el frontend, el servidor Node.js y el esquema SQLite. GitHub
guarda el código. GitHub Pages solo aloja sitios estáticos: no ejecuta este servidor.

## Demostración gratuita en Render

1. Abre https://render.com/deploy?repo=https://github.com/aljnr602-svg/NEXOPORTAL
2. Inicia sesión en Render y revisa el Blueprint `render.yaml`.
3. Comprueba que el servicio use el plan **Free** y crea el servicio.
4. Espera a que Render indique que está en funcionamiento y abre la URL HTTPS que asigne.
5. Prueba registro, ingreso, cursos, evaluación y pago de colegiaturas desde ese enlace.

El servicio ejecuta `npm start`, usa Node.js 24 y escucha en `0.0.0.0` y el puerto
que Render proporcione. `RENDER_EXTERNAL_URL` configura automáticamente el origen
HTTPS permitido y las cookies Secure. No se necesitan paquetes npm.

**Limitación del plan gratuito:** el servidor puede suspenderse por inactividad y
tardar al volver a abrir. Su disco es temporal: usuarios, pagos, diplomas y sesiones
se pierden al reiniciar, suspender o volver a desplegar. No usarlo como registro permanente.
El código sigue conservado en GitHub. Consulta https://render.com/docs/free.

## Mantener SQLite permanentemente

Usa un servicio con disco persistente. En Render esto requiere un plan de pago
compatible y un disco. Antes de contratar revisa el costo. Configura el disco en
`/var/data` y la variable `DATA_DIR=/var/data/nexo`; el servidor crea la carpeta y
la base automáticamente. Mantén una sola instancia para esta base SQLite y realiza
respaldos consistentes. No subas la carpeta `data` al repositorio público.

## Otro proveedor o Docker

Se incluye un Dockerfile con Node.js 24. Variables:

| Variable | Valor |
| --- | --- |
| `HOST` | `0.0.0.0` |
| `PORT` | Puerto indicado por el proveedor (3000 por defecto) |
| `PUBLIC_ORIGIN` | URL pública exacta, por ejemplo `https://mi-nexo.example` |
| `DATA_DIR` | Carpeta en un volumen persistente |

En Docker monta un volumen escribible por el usuario `node` en `/app/data` y coloca
un proxy HTTPS delante del contenedor. Nunca uses una base con datos personales
como parte de la imagen pública.

## Comprobaciones antes de compartir el enlace

- Ejecuta `node --test`.
- Comprueba que puedas registrarte e ingresar desde la URL HTTPS pública.
- Prueba un curso de la carrera elegida, evaluación, diploma y un pago universitario.
- Si contrataste persistencia, reinicia el servicio y comprueba que conserve los datos.
- El proyecto no incluye una cuenta `admin` ni contraseñas reales en el repositorio.

Documentación oficial: https://render.com/docs/web-services y
https://render.com/docs/disks.
