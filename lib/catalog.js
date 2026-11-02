'use strict';
// Un único catálogo alimenta el contenido, los videos y la calificación del servidor.
// Las respuestas correctas nunca se envían en los endpoints del aula.
const CAREERS = [
  'Ingeniería en Sistemas',
  'Administración de Empresas',
  'Diseño y Comunicación',
  'Contaduría Pública',
  'Otra carrera'
];
const normalize = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
function careerGroup(career) {
  const name = normalize(career);
  if (name.includes('sistema') || name === 'ingenieria') return 'systems';
  if (name.includes('administracion')) return 'business';
  if (name.includes('diseno') || name.includes('comunicacion')) return 'design';
  if (name.includes('contadur') || name.includes('contabilidad')) return 'accounting';
  return 'general';
}
const GROUPS = {
  systems: { label: CAREERS[0], symbol: '</>', color: '#d9ccff' },
  business: { label: CAREERS[1], symbol: '↗', color: '#c5e8dc' },
  design: { label: CAREERS[2], symbol: 'Aa', color: '#f3cbb0' },
  accounting: { label: CAREERS[3], symbol: 'Q', color: '#d6f66b' },
  general: { label: 'Habilidades universitarias', symbol: '✦', color: '#cde2f4' }
};
const radio = (title, options) => [title, 'radio', options];
const select = (title, options) => [title, 'select', options];
const multi = (title, options) => [title, 'checkbox', options];
const text = (title) => [title, 'text'];
const number = (title) => [title, 'number'];
const video = (id, title, author, language = 'Español') => ({
  id,
  title,
  author,
  language,
  url: 'https://www.youtube.com/watch?v=' + id
});
function course(
  id,
  group,
  title,
  description,
  symbol,
  video,
  sections,
  diagram,
  practice,
  questions,
  answers,
  resource
) {
  return {
    id,
    group,
    title,
    description,
    symbol,
    category: GROUPS[group].label,
    duration: '25–35 min de estudio',
    video,
    sections,
    diagram,
    practice,
    questions,
    answers,
    resource
  };
}
const catalog = [
  course(
    'web',
    'systems',
    'Tu primera página web',
    'Dale estructura, estilo e interacción a una página desde cero.',
    '</>',
    video(
      'UB1O30fR-EE',
      'HTML Crash Course For Absolute Beginners',
      'Traversy Media',
      'Inglés'
    ),
    [
      [
        'Estructura con HTML',
        'HTML organiza el contenido con encabezados, párrafos, enlaces y formularios. Una página accesible utiliza elementos semánticos como main, section y button. Los radio buttons eligen una sola opción; los checkboxes permiten varias.'
      ],
      [
        'Presentación con CSS',
        'CSS define colores, tipografías y distribución. Grid y Flexbox ayudan a ordenar elementos, y las media queries adaptan la interfaz a teléfonos y computadoras. Un diseño debe mantener texto legible y foco visible.'
      ],
      [
        'Interacción con JavaScript',
        'JavaScript responde a eventos. const declara una referencia que no se reasigna. Los arreglos comienzan en el índice 0, por eso el segundo elemento está en el índice 1. DOMContentLoaded indica que el documento se ha procesado. fetch conecta la interfaz con el servidor.'
      ]
    ],
    ['HTML', 'Estructura', 'CSS', 'Presentación', 'JavaScript', 'Interacción'],
    'Diseña un formulario de matrícula e identifica qué parte resuelve HTML, cuál CSS y cuál JavaScript.',
    [
      radio('¿Qué lenguaje estructura el contenido?', [
        ['html', 'HTML'],
        ['css', 'CSS'],
        ['sql', 'SQL']
      ]),
      select('¿Qué tecnología define colores y diseño?', [
        ['html', 'HTML'],
        ['css', 'CSS'],
        ['sql', 'SQL']
      ]),
      multi('Selecciona los dos controles para elegir opciones.', [
        ['checkbox', 'Checkbox'],
        ['radio', 'Radio button'],
        ['parrafo', 'Párrafo']
      ]),
      text('¿Qué palabra declara una referencia que no se reasigna?'),
      number('¿Cuál es el índice del segundo elemento de un arreglo?'),
      select('¿Qué evento indica que se procesó el documento?', [
        ['click', 'click'],
        ['DOMContentLoaded', 'DOMContentLoaded'],
        ['submit', 'submit']
      ])
    ],
    ['html', 'css', ['checkbox', 'radio'], 'const', '1', 'DOMContentLoaded'],
    {
      label: 'MDN · Aprende desarrollo web',
      url: 'https://developer.mozilla.org/es/docs/Learn_web_development'
    }
  ),
  course(
    'logic',
    'systems',
    'Lógica para crear',
    'Organiza instrucciones y resuelve problemas antes de escribir código.',
    '{ }',
    video('F_sYsMxXzkM', '¿Qué es programar? Introducción a los algoritmos', 'TodoCode'),
    [
      [
        'Resolver con un algoritmo',
        'Un algoritmo es una secuencia finita y ordenada de instrucciones para resolver un problema. En una matrícula: leer los datos, validarlos, calcular las cuotas y guardar el resultado.'
      ],
      [
        'Decidir y repetir',
        'Un valor booleano representa verdadero o falso. if y switch permiten tomar decisiones. for permite repetir instrucciones un número conocido de veces.'
      ],
      [
        'Reutilizar con funciones',
        'Una función agrupa instrucciones reutilizables, puede recibir parámetros y devolver un resultado. Separa las entradas, el procesamiento y las salidas. Si x empieza en 2 y le sumas 2, termina en 4.'
      ]
    ],
    ['Entrada', 'Datos', 'Proceso', 'Instrucciones', 'Salida', 'Resultado'],
    'Escribe en pasos cómo validar el saldo y pagar una mensualidad universitaria.',
    [
      radio('¿Cómo se llama una secuencia para resolver un problema?', [
        ['algoritmo', 'Algoritmo'],
        ['estilo', 'Estilo'],
        ['imagen', 'Imagen']
      ]),
      select('¿Qué tipo representa verdadero o falso?', [
        ['cadena', 'Cadena'],
        ['booleano', 'Booleano'],
        ['arreglo', 'Arreglo']
      ]),
      multi('Selecciona las dos estructuras de decisión.', [
        ['if', 'if'],
        ['switch', 'switch'],
        ['for', 'for']
      ]),
      text('¿Qué ciclo se usa con un número conocido de repeticiones?'),
      number('Si x vale 2 y sumas 2, ¿cuánto vale x?'),
      select('¿Qué agrupa instrucciones reutilizables?', [
        ['color', 'Color'],
        ['funcion', 'Función'],
        ['etiqueta', 'Etiqueta']
      ])
    ],
    ['algoritmo', 'booleano', ['if', 'switch'], 'for', '4', 'funcion'],
    {
      label: 'TodoCode · Introducción a la programación',
      url: 'https://todocodeacademy.com/course/introduccion-a-la-programacion/'
    }
  ),
  course(
    'business-process',
    'business',
    'El proceso administrativo',
    'Planea, organiza, dirige y controla un proyecto con objetivos claros.',
    '↗',
    video(
      'eE78r9an_CA',
      'El proceso administrativo de la empresa',
      'Universidad Continental'
    ),
    [
      [
        'Planear antes de actuar',
        'La planeación define objetivos y las acciones para lograrlos. Una meta necesita un resultado verificable y un plazo. Un presupuesto estima ingresos y gastos; no garantiza que todo ocurra como se espera.'
      ],
      [
        'Organizar y dirigir',
        'Organizar consiste en asignar recursos y responsabilidades. Dirigir implica comunicar, motivar y coordinar al equipo. Recursos humanos y financieros son dos tipos de recursos de una organización.'
      ],
      [
        'Controlar para mejorar',
        'Controlar es comparar resultados con lo planeado y corregir desviaciones. El ciclo tiene cuatro etapas: planeación, organización, dirección y control. Si presupuestas Q1000 y gastas Q800, quedan Q200 disponibles.'
      ]
    ],
    [
      'Planear',
      'Definir objetivos',
      'Organizar',
      'Asignar recursos',
      'Controlar',
      'Medir resultados'
    ],
    'Organiza una feria universitaria: define una meta, un presupuesto, responsables y una forma de medir resultados.',
    [
      radio('¿Qué etapa define objetivos?', [
        ['planeacion', 'Planeación'],
        ['control', 'Control'],
        ['direccion', 'Dirección']
      ]),
      select('¿Qué etapa asigna recursos y responsabilidades?', [
        ['organizacion', 'Organización'],
        ['publicidad', 'Publicidad'],
        ['cierre', 'Cierre']
      ]),
      multi('Selecciona dos recursos organizacionales.', [
        ['humanos', 'Humanos'],
        ['financieros', 'Financieros'],
        ['azar', 'Azar']
      ]),
      text('¿Cómo se llama la etapa que compara resultados con lo planeado?'),
      number('Presupuesto Q1000 y gasto Q800: ¿cuántos quetzales quedan?'),
      select('¿Qué incluye una meta verificable?', [
        ['plazo', 'Un resultado y un plazo'],
        ['suerte', 'Solo suerte'],
        ['improvisar', 'Improvisación']
      ])
    ],
    ['planeacion', 'organizacion', ['humanos', 'financieros'], 'control', '200', 'plazo'],
    {
      label: 'Universidad Continental · Video del proceso administrativo',
      url: 'https://www.youtube.com/watch?v=eE78r9an_CA'
    }
  ),
  course(
    'business-goals',
    'business',
    'Objetivos y seguimiento empresarial',
    'Convierte una intención de negocio en una meta medible.',
    '◎',
    video('w1fJrQDDJCE', 'Objetivos SMART', 'Udearroba · Universidad de Antioquia'),
    [
      [
        'De la intención al objetivo',
        'Un objetivo SMART es específico, medible, alcanzable, relevante y temporal. En lugar de vender más, plantea aumentar las ventas mensuales de Q1000 a Q1200 antes de finalizar el trimestre.'
      ],
      [
        'Indicadores y evidencias',
        'Un indicador mide avances, como ventas, costos o tiempo de entrega. Medible y temporal son dos criterios SMART. Una evidencia es un dato o documento que permite comprobar el resultado.'
      ],
      [
        'Seguimiento y ajustes',
        'Compara la línea base con el resultado obtenido. Pasar de Q1000 a Q1200 representa un incremento de Q200. Si el resultado no coincide con la meta, analiza las causas y ajusta acciones, sin inventar datos.'
      ]
    ],
    ['Meta', 'Resultado deseado', 'Indicador', 'Medición', 'Seguimiento', 'Ajustes'],
    'Formula una meta SMART para reducir el tiempo de atención de un pequeño negocio.',
    [
      radio('¿Qué característica exige una métrica?', [
        ['medible', 'Medible'],
        ['ambiguo', 'Ambiguo'],
        ['secreto', 'Secreto']
      ]),
      select('¿Qué representa la línea base?', [
        ['inicio', 'La situación inicial'],
        ['final', 'El resultado final'],
        ['azar', 'Un dato al azar']
      ]),
      multi('Selecciona dos criterios SMART.', [
        ['medible', 'Medible'],
        ['temporal', 'Temporal'],
        ['imposible', 'Imposible']
      ]),
      text('Escribe la sigla del método de objetivos de cinco criterios.'),
      number('Si las ventas suben de Q1000 a Q1200, ¿cuánto aumentan en quetzales?'),
      select('¿Qué haces si no se logra la meta?', [
        ['ajustar', 'Analizar causas y ajustar acciones'],
        ['inventar', 'Inventar resultados'],
        ['ocultar', 'Ocultar la medición']
      ])
    ],
    ['medible', 'inicio', ['medible', 'temporal'], 'smart', '200', 'ajustar'],
    {
      label: 'Universidad de Antioquia · Objetivos SMART',
      url: 'https://www.youtube.com/watch?v=w1fJrQDDJCE'
    }
  ),
  course(
    'design-color',
    'design',
    'Color con intención',
    'Construye una paleta que comunique y facilite la lectura.',
    '◐',
    video('ybd_lh8cyyM', 'Teoría del Color · Diseño Gráfico', 'OscarRGB'),
    [
      [
        'El color comunica',
        'Una paleta es un conjunto de colores seleccionados para un diseño. El matiz identifica una familia de color; la saturación describe su intensidad y el valor indica qué tan claro u oscuro es.'
      ],
      [
        'Combinar con propósito',
        'El modelo RGB mezcla luz y se utiliza en pantallas. CMYK se usa habitualmente en impresión. Los colores complementarios se encuentran en posiciones opuestas de la rueda de color.'
      ],
      [
        'Diseñar para leer',
        'El contraste ayuda a distinguir el texto del fondo. No comuniques un estado solo por color: acompaña con una etiqueta o símbolo. Una paleta con 2 colores base y 1 de acento tiene 3 colores.'
      ]
    ],
    [
      'Matiz',
      'Familia de color',
      'Contraste',
      'Lectura clara',
      'Paleta',
      'Selección coherente'
    ],
    'Crea una paleta para un afiche universitario y explica cómo garantizarías que el título se lea.',
    [
      radio('¿Qué modelo de color se utiliza en pantallas?', [
        ['rgb', 'RGB'],
        ['cmyk', 'CMYK'],
        ['pdf', 'PDF']
      ]),
      select('¿Qué ayuda a distinguir texto y fondo?', [
        ['contraste', 'Contraste'],
        ['ruido', 'Ruido visual'],
        ['azar', 'Azar']
      ]),
      multi('Selecciona dos propiedades del color.', [
        ['matiz', 'Matiz'],
        ['saturacion', 'Saturación'],
        ['saldo', 'Saldo bancario']
      ]),
      text('Escribe la sigla del modelo de color de pantallas.'),
      number('Una paleta tiene 2 colores base y 1 acento. ¿Cuántos colores tiene?'),
      select('¿Cómo comunicas un error de forma más accesible?', [
        ['etiqueta', 'Color más etiqueta o símbolo'],
        ['solo', 'Solo color'],
        ['oculto', 'Texto oculto sin explicación']
      ])
    ],
    ['rgb', 'contraste', ['matiz', 'saturacion'], 'rgb', '3', 'etiqueta'],
    {
      label: 'OscarRGB · Teoría del Color',
      url: 'https://www.youtube.com/watch?v=ybd_lh8cyyM'
    }
  ),
  course(
    'design-type',
    'design',
    'Tipografía y jerarquía visual',
    'Ordena tus mensajes para que cada pieza se entienda mejor.',
    'Aa',
    video(
      'EbV3-AJQElQ',
      'Qué tipos de tipografía existen y cómo usarlas',
      'GCFAprendeLibre'
    ),
    [
      [
        'Elegir una tipografía',
        'Una tipografía es el diseño de un conjunto de caracteres. Las familias serif tienen remates y las sans serif no. La legibilidad depende del tamaño, la forma, el contraste y el contexto de uso.'
      ],
      [
        'Jerarquía antes que decoración',
        'La jerarquía visual organiza qué se ve primero. Títulos, subtítulos y cuerpo cumplen funciones distintas. El tamaño y el peso son dos recursos para establecer jerarquía.'
      ],
      [
        'Espacio que ayuda a leer',
        'El interlineado es la distancia entre líneas. Evita bloques largos en mayúsculas y demasiadas familias distintas. Si tu diseño tiene 1 familia para títulos y 1 para cuerpo, utiliza 2 familias tipográficas.'
      ]
    ],
    ['Título', 'Primera lectura', 'Subtítulo', 'Organización', 'Cuerpo', 'Información'],
    'Diseña un anuncio con título, subtítulo y cuerpo. Justifica el tamaño y el peso de cada nivel.',
    [
      radio('¿Qué familia tiene remates?', [
        ['serif', 'Serif'],
        ['sans', 'Sans serif'],
        ['rgb', 'RGB']
      ]),
      select('¿Qué organiza el orden de lectura?', [
        ['jerarquia', 'Jerarquía visual'],
        ['saldo', 'Saldo'],
        ['azar', 'Azar']
      ]),
      multi('Selecciona dos recursos de jerarquía tipográfica.', [
        ['tamano', 'Tamaño'],
        ['peso', 'Peso'],
        ['deuda', 'Deuda']
      ]),
      text('¿Cómo se llama la distancia entre líneas?'),
      number('1 familia para títulos y 1 para cuerpo: ¿cuántas familias utilizas?'),
      select('¿Qué conviene priorizar en textos extensos?', [
        ['lectura', 'Legibilidad'],
        ['mayusculas', 'Todo en mayúsculas'],
        ['variedad', 'Muchas familias sin criterio']
      ])
    ],
    ['serif', 'jerarquia', ['tamano', 'peso'], 'interlineado', '2', 'lectura'],
    {
      label: 'GCFGlobal · Conceptos básicos de diseño gráfico',
      url: 'https://edu.gcfglobal.org/es/conceptos-basicos-de-diseno-grafico/'
    }
  ),
  course(
    'accounting-accounts',
    'accounting',
    'Cuentas y ecuación contable',
    'Reconoce activos, pasivos y patrimonio con ejemplos sencillos.',
    'Q',
    video(
      'ieONSS2bjpI',
      'Cuentas de Balance y Cuentas de Resultados · Contabilidad Básica',
      'Contador Contado'
    ),
    [
      [
        'Identificar lo que tiene y debe una entidad',
        'El activo reúne recursos controlados por una entidad, como caja y bancos. El pasivo representa obligaciones, como préstamos y cuentas por pagar. El patrimonio es la parte residual: activo menos pasivo.'
      ],
      [
        'La ecuación que mantiene el equilibrio',
        'La ecuación contable es Activo = Pasivo + Patrimonio. Si hay Q1000 de activo y Q400 de pasivo, el patrimonio es Q600. Una aportación de capital en efectivo aumenta el activo y el patrimonio.'
      ],
      [
        'Registrar con soporte',
        'La partida doble registra operaciones manteniendo igualdad entre cargos y abonos. Una factura o un recibo respalda un registro. Distingue las cuentas de balance de ingresos y gastos, que describen el desempeño durante un período.'
      ]
    ],
    ['Activo', 'Recursos', 'Pasivo', 'Obligaciones', 'Patrimonio', 'Activo menos pasivo'],
    'Clasifica caja, un préstamo y el aporte de los socios. Comprueba que la ecuación contable se equilibre.',
    [
      radio('¿Qué representa una obligación?', [
        ['pasivo', 'Pasivo'],
        ['activo', 'Activo'],
        ['ingreso', 'Ingreso']
      ]),
      select('¿Cuál es la ecuación contable?', [
        ['ecuacion', 'Activo = Pasivo + Patrimonio'],
        ['error', 'Activo = Pasivo - Patrimonio'],
        ['ventas', 'Ventas = Caja']
      ]),
      multi('Selecciona dos ejemplos de activo.', [
        ['caja', 'Caja'],
        ['bancos', 'Bancos'],
        ['prestamo', 'Préstamo por pagar']
      ]),
      text('¿Cómo se llama la parte residual de activo menos pasivo?'),
      number('Activo Q1000 menos pasivo Q400: ¿cuál es el patrimonio?'),
      select('¿Qué respalda un registro contable?', [
        ['soporte', 'Un comprobante'],
        ['rumor', 'Un rumor'],
        ['diseno', 'Un color']
      ])
    ],
    ['pasivo', 'ecuacion', ['caja', 'bancos'], 'patrimonio', '600', 'soporte'],
    {
      label: 'Contador Contado · Cuentas de balance y resultados',
      url: 'https://www.youtube.com/watch?v=ieONSS2bjpI'
    }
  ),
  course(
    'accounting-equity',
    'accounting',
    'Patrimonio y cambios en el capital',
    'Comprende cómo aportaciones, retiros y resultados cambian el patrimonio.',
    'Σ',
    video('APObK8ovyf8', 'Estado de cambios en el capital contable', 'Contador Contado'),
    [
      [
        'Una fotografía y un recorrido',
        'El balance describe la situación financiera en una fecha. El estado de cambios en el patrimonio explica las variaciones entre el inicio y el cierre de un período. No equivale al dinero disponible en el banco.'
      ],
      [
        'Qué aumenta y qué disminuye',
        'Las aportaciones de los socios y las utilidades aumentan el patrimonio. Los retiros y las pérdidas lo disminuyen. Los préstamos son pasivos: recibir uno no constituye por sí mismo una aportación patrimonial.'
      ],
      [
        'Conciliar el saldo final',
        'Para un ejemplo simplificado: patrimonio final = inicial + aportes + utilidad - retiros. Con Q1000 iniciales, Q200 de aportes, Q100 de utilidad y Q50 de retiros, el saldo final es Q1250. Conserva los soportes para verificar el cálculo.'
      ]
    ],
    [
      'Inicio',
      'Saldo inicial',
      'Cambios',
      'Aportes y resultados',
      'Cierre',
      'Saldo final'
    ],
    'Elabora una conciliación con saldo inicial, aportación, utilidad y retiro de una empresa de ejemplo.',
    [
      radio('¿Qué explica el estado de cambios en el patrimonio?', [
        ['variaciones', 'Las variaciones del patrimonio'],
        ['colores', 'Colores de una marca'],
        ['codigo', 'Código de una página']
      ]),
      select('¿Qué efecto tiene una aportación de los socios?', [
        ['aumenta', 'Aumenta el patrimonio'],
        ['disminuye', 'Lo disminuye'],
        ['nulo', 'Siempre lo deja igual']
      ]),
      multi('Selecciona dos conceptos que disminuyen el patrimonio.', [
        ['retiros', 'Retiros'],
        ['perdidas', 'Pérdidas'],
        ['aportes', 'Aportes']
      ]),
      text('¿Cómo se llama una obligación como un préstamo por pagar?'),
      number('Q1000 + Q200 + Q100 - Q50: ¿cuál es el patrimonio final?'),
      select('¿Patrimonio y saldo bancario son siempre iguales?', [
        ['no', 'No, son conceptos diferentes'],
        ['si', 'Sí, siempre'],
        ['color', 'Depende del color del recibo']
      ])
    ],
    ['variaciones', 'aumenta', ['retiros', 'perdidas'], 'pasivo', '1250', 'no'],
    {
      label: 'Contador Contado · Estado de cambios en el capital',
      url: 'https://www.youtube.com/watch?v=APObK8ovyf8'
    }
  ),
  course(
    'study-time',
    'general',
    'Organiza tu tiempo de estudio',
    'Construye una rutina sostenible con tareas claras y pausas.',
    '◷',
    video('V51bTPmFgRs', '¿Qué es la Técnica Pomodoro?', 'Liderazgo REx'),
    [
      [
        'Empezar con un plan pequeño',
        'Prioriza las tareas según su importancia y fecha límite. Un calendario registra sesiones y entregas; una lista de tareas divide el trabajo en acciones concretas. Estimar tu tiempo ayuda a planear, pero debes revisar los resultados.'
      ],
      [
        'Concentrarte con pausas',
        'La técnica Pomodoro propone bloques de estudio de 25 minutos separados por descansos breves. Elimina distracciones y define una tarea antes de comenzar. Ajusta el ritmo a tus necesidades sin omitir el descanso.'
      ],
      [
        'Aprender de tu rutina',
        'Anota qué lograste y cuánto tardaste. Dos bloques de 25 minutos suman 50 minutos de estudio, sin contar descansos. Al terminar la semana, revisa tu plan y corrige lo que no funcionó.'
      ]
    ],
    ['Plan', 'Priorizar', 'Foco', 'Una tarea', 'Revisión', 'Ajustar'],
    'Reserva dos bloques para una asignatura de tu carrera y define qué resultado concreto esperas al terminar.',
    [
      radio('¿Qué herramienta registra sesiones y entregas?', [
        ['calendario', 'Calendario'],
        ['azar', 'Azar'],
        ['saldo', 'Saldo']
      ]),
      select('¿Qué conviene hacer antes de estudiar?', [
        ['tarea', 'Definir una tarea concreta'],
        ['improvisar', 'Improvisar sin objetivo'],
        ['notificaciones', 'Abrir todas las notificaciones']
      ]),
      multi('Selecciona dos hábitos útiles.', [
        ['pausas', 'Planear pausas'],
        ['priorizar', 'Priorizar tareas'],
        ['multitarea', 'Hacer todo a la vez']
      ]),
      text('¿Cómo se llama la técnica de bloques de estudio presentada?'),
      number('Dos bloques de 25 minutos: ¿cuántos minutos de estudio suman?'),
      select('¿Qué haces al terminar la semana?', [
        ['revisar', 'Revisar y ajustar el plan'],
        ['ocultar', 'Ocultar resultados'],
        ['copiar', 'Copiar sin revisar']
      ])
    ],
    ['calendario', 'tarea', ['pausas', 'priorizar'], 'pomodoro', '50', 'revisar'],
    {
      label: 'UNAM · Técnicas de autogestión',
      url: 'https://sites.google.com/pcpuma.acatlan.unam.mx/autogestion/t%C3%A9cnicas-de-autogesti%C3%B3n'
    }
  ),
  course(
    'study-goals',
    'general',
    'Metas para tu vida universitaria',
    'Define objetivos de aprendizaje que puedas seguir y comprobar.',
    '✦',
    video(
      '-F5-7PRq0vM',
      '¿Cómo plantearte metas y objetivos adecuados? Objetivos SMART',
      'Bienestar y Formación Estudiantil · Universidad del Pacífico'
    ),
    [
      [
        'De un deseo a una meta',
        'Quiero aprender más es una intención. Una meta concreta puede ser resolver diez ejercicios de una asignatura antes del viernes. El método SMART reúne cinco criterios: específico, medible, alcanzable, relevante y temporal.'
      ],
      [
        'Medir tu avance',
        'Medible significa que puedes comprobar tu avance con evidencias. Temporal significa que existe un plazo. Elige una meta que dependa de acciones realistas, no solo de un deseo o del resultado de otras personas.'
      ],
      [
        'Revisar sin perder el rumbo',
        'Anota resultados, identifica obstáculos y ajusta las acciones. Si planeaste 10 ejercicios y completaste 6, faltan 4. Una dificultad sirve para revisar tu estrategia, no para inventar evidencias.'
      ]
    ],
    ['Definir', 'Una meta', 'Medir', 'Evidencias', 'Ajustar', 'Nuevas acciones'],
    'Escribe una meta para tu próxima semana que tenga una cantidad verificable y una fecha límite.',
    [
      radio('¿Qué criterio exige comprobar el avance?', [
        ['medible', 'Medible'],
        ['ambiguo', 'Ambiguo'],
        ['secreto', 'Secreto']
      ]),
      select('¿Qué criterio añade una fecha límite?', [
        ['temporal', 'Temporal'],
        ['azar', 'Azar'],
        ['oculto', 'Oculto']
      ]),
      multi('Selecciona dos características de una buena meta.', [
        ['especifica', 'Específica'],
        ['alcanzable', 'Alcanzable'],
        ['imposible', 'Imposible']
      ]),
      text('Escribe la sigla del método de cinco criterios.'),
      number('De 10 ejercicios completaste 6. ¿Cuántos faltan?'),
      select('¿Cómo reaccionas ante una dificultad?', [
        ['ajustar', 'Revisar y ajustar la estrategia'],
        ['inventar', 'Inventar evidencias'],
        ['ignorar', 'Ignorar el plazo']
      ])
    ],
    ['medible', 'temporal', ['especifica', 'alcanzable'], 'smart', '4', 'ajustar'],
    {
      label: 'Universidad del Pacífico · Metas SMART',
      url: 'https://www.youtube.com/watch?v=-F5-7PRq0vM'
    }
  )
];
const byId = Object.fromEntries(catalog.map((c) => [c.id, c]));
const forCareer = (career) => catalog.filter((c) => c.group === careerGroup(career));
const accessible = (career, id) => !!byId[id] && byId[id].group === careerGroup(career);
function publicCourse(course) {
  const { answers, ...safe } = course;
  return safe;
}
function grade(id, answers) {
  const course = byId[id];
  if (!course || !Array.isArray(answers) || answers.length !== course.questions.length)
    throw new Error('Responde las seis preguntas.');
  if (
    answers.some((answer, i) =>
      Array.isArray(course.answers[i])
        ? !Array.isArray(answer) || answer.length === 0
        : typeof answer !== 'string' || !answer.trim()
    )
  )
    throw new Error('Responde todas las preguntas.');
  const count = course.answers.reduce((score, key, i) => {
    if (Array.isArray(key))
      return (
        score +
        (JSON.stringify([...new Set(answers[i])].sort()) ===
          JSON.stringify([...key].sort()))
      );
    return score + (normalize(answers[i]) === normalize(key));
  }, 0);
  return Math.round((count * 100) / course.questions.length);
}
module.exports = {
  CAREERS,
  GROUPS,
  catalog,
  byId,
  forCareer,
  accessible,
  careerGroup,
  publicCourse,
  grade
};
