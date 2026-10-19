export default {
  langName: 'Español',
  ui: {
    updated: 'Última actualización: {updated}',
    nav: {
      privacy: 'Privacidad',
      terms: 'Términos',
      delete: 'Eliminar cuenta',
      support: 'Soporte',
    },
    indexTitle: 'Dotyk — información legal y soporte',
    indexIntro:
      'Dotyk es una app para parejas: recuerdos compartidos, notas, fechas, juegos y una mascota que cuidáis juntos.',
  },
  privacy: {
    title: 'Política de privacidad',
    intro:
      'Esta política explica qué datos recoge Dotyk, para qué, quién los trata y cómo puedes controlarlos. Creamos Dotyk para que la vida privada de una pareja siga siendo privada: sin anuncios, sin rastreo y sin venta de datos.',
    sections: [
      {
        h: 'Quiénes somos',
        p: [
          'Dotyk lo desarrolla y gestiona {owner}, persona física con sede en Ucrania («nosotros»). Somos el responsable del tratamiento de tus datos personales. Contacto: <a href="mailto:{email}">{email}</a>.',
        ],
      },
      {
        h: 'Qué datos recogemos',
        p: ['<strong>Datos de la cuenta.</strong>'],
        ul: [
          'Correo electrónico y contraseña (la contraseña solo se guarda como hash seguro en nuestro proveedor de autenticación) o, si inicias sesión con Google, el correo, el nombre y el identificador de tu cuenta de Google.',
          'Tu nombre y, si quieres, tu fecha de nacimiento y foto de perfil.',
          'Ajustes: idioma de la app, si la IA está activada y preferencias de notificaciones.',
        ],
      },
      {
        p: [
          '<strong>Contenido que creáis juntos.</strong> Recuerdos y sus fotos, comentarios, notas, momentos «¿Cuándo fue la última vez…?», estados de ánimo, respuestas a la pregunta del día, respuestas de juegos, retos, lista de deseos y listas compartidas, fechas importantes, cápsulas del tiempo, dibujos, vuestra mascota compartida y sus cuidados, y los «toques» (corazón, abrazo, pienso en ti). Este contenido lo ve tu pareja por diseño: para eso existe la app.',
          '<strong>Datos de emparejamiento.</strong> El código de invitación que compartes con tu pareja y un registro de intentos de unión, para evitar que alguien adivine el código.',
          '<strong>Datos técnicos y del dispositivo.</strong> Un token de notificaciones push y la plataforma (iOS o Android) para poder entregar notificaciones. Nuestro proveedor de alojamiento trata direcciones IP y registros de solicitudes para operar y proteger el servicio.',
          '<strong>Compras.</strong> Los pagos se hacen a través del App Store o Google Play; nunca vemos los datos de tu tarjeta. Nuestro proveedor de suscripciones recibe tu identificador en la app y los recibos de compra para confirmar tu estado Plus. Guardamos el estado y la fecha de caducidad de Plus y desde qué pantalla se abrió la oferta.',
          '<strong>Solicitudes de IA.</strong> Solo cuando pulsas un botón marcado con ✨ y solo con los datos que necesita esa función (consulta «Funciones de IA»). Contamos las solicitudes para aplicar el límite diario.',
        ],
      },
      {
        h: 'Qué no recogemos',
        ul: [
          'Ni publicidad, ni identificadores publicitarios, ni rastreo en otras apps o sitios web.',
          'Ningún SDK de analítica de terceros.',
          'Ni ubicación, ni contactos, ni grabaciones de micrófono o cámara. Solo las fotos que tú eliges añadir.',
          'Nunca vendemos ni alquilamos tus datos.',
        ],
      },
      {
        h: 'Para qué los usamos (bases jurídicas)',
        ul: [
          '<strong>Para prestar la app</strong>: cuentas, emparejamiento, sincronización del contenido compartido y Plus (ejecución de un contrato).',
          '<strong>Funciones opcionales</strong>: la IA y las notificaciones push solo funcionan si las activas y puedes desactivarlas en cualquier momento (consentimiento).',
          '<strong>Seguridad y prevención de abusos</strong>: límites de uso, protección de los códigos de invitación y corrección de errores (interés legítimo).',
          '<strong>Obligaciones legales</strong>: por ejemplo, registros fiscales y contables que llevan las tiendas de apps.',
        ],
      },
      {
        h: 'Funciones de IA',
        p: [
          'Las funciones de IA (ideas para citas, ayuda con las notas y la historia de vuestro año) son opcionales. Las solicitudes van a nuestro servidor y desde allí al modelo Claude de Anthropic. Según las condiciones de Anthropic, los datos enviados a través de su API no se usan para entrenar modelos.',
          'Solo enviamos lo que necesita cada función: para ideas de citas, el presupuesto y el ánimo elegidos, el mes actual, vuestros momentos más frecuentes y los deseos pendientes; para las notas, el tono, tu borrador y el nombre de tu pareja; para la historia del año, las cifras del año, vuestros nombres, los momentos frecuentes, los deseos cumplidos y los pies de foto de los recuerdos. Nunca se envían fotos, respuestas a la pregunta del día, estados de ánimo, notas y comentarios de tu pareja, tu correo ni tu fecha de nacimiento.',
          'Las respuestas terminadas se guardan en caché en nuestro servidor hasta 30 días para que la misma solicitud no consuma tu límite. Si tu pareja desactiva la IA, no se envía ningún dato compartido de la pareja.',
        ],
      },
      {
        h: 'Quién trata tus datos',
        p: ['Usamos pocos proveedores, que tratan datos por cuenta nuestra:'],
        ul: [
          '<strong>Supabase</strong>: base de datos, autenticación, almacenamiento de fotos y funciones de servidor.',
          '<strong>Anthropic</strong>: funciones de IA, solo cuando las usas.',
          '<strong>RevenueCat</strong>: gestión de compras y suscripciones dentro de la app.',
          '<strong>Apple y Google</strong>: inicio de sesión con Google, pagos y entrega de notificaciones push (APNs, Firebase Cloud Messaging).',
          '<strong>Expo</strong>: servicio de notificaciones push que reenvía las notificaciones a Apple y Google.',
        ],
        p2: [
          'Algunos proveedores tratan datos fuera de Ucrania y del Espacio Económico Europeo, también en Estados Unidos. Cuando es necesario, las transferencias se protegen con cláusulas contractuales tipo o garantías equivalentes de estos proveedores.',
        ],
      },
      {
        h: 'Tu pareja y los datos compartidos',
        p: [
          'Todo lo que añades al espacio de la pareja lo ve tu pareja, y tú ves su contenido. Tu pareja también ve tu nombre, tu foto de perfil y tu fecha de nacimiento (para los recordatorios de cumpleaños).',
          'Si cualquiera de los dos abandona la pareja o elimina su cuenta, el espacio compartido —todo el contenido y las fotos compartidas— se elimina para ambos. Así nadie se queda con los datos de la otra persona.',
        ],
      },
      {
        h: 'Cuánto tiempo conservamos los datos',
        ul: [
          'Cuenta y contenido: mientras exista tu cuenta. Lo que eliminas desaparece al instante para los dos y se borra definitivamente, como muy tarde, cuando se elimina la pareja.',
          'Respuestas de IA en caché: hasta 30 días.',
          'Cuando eliminas tu cuenta, tu perfil, foto de perfil, tokens push y el espacio compartido de la pareja se eliminan de inmediato. Las copias de seguridad de nuestro proveedor de alojamiento se sobrescriben en un plazo limitado.',
          'Apple, Google y RevenueCat conservan los registros de compra según sus propias políticas y obligaciones legales.',
        ],
      },
      {
        h: 'Seguridad',
        p: [
          'Los datos se cifran en tránsito. Las reglas de la base de datos garantizan que solo tú y tu pareja podéis leer los datos de vuestra pareja. Las fotos se guardan en un almacenamiento privado y solo son accesibles mediante enlaces temporales. Tu sesión se guarda cifrada en tu dispositivo, con la clave en el llavero del sistema.',
        ],
      },
      {
        h: 'Tus derechos',
        p: [
          'Según dónde vivas (incluido el RGPD y la ley ucraniana de protección de datos personales), tienes derecho a acceder a tus datos, rectificarlos, suprimirlos, recibir una copia en formato portable, limitar u oponerte al tratamiento y retirar tu consentimiento en cualquier momento.',
          'Puedes editar la mayoría de los datos en la app y eliminar tu cuenta en Ajustes. Para cualquier otra cosa, escribe a <a href="mailto:{email}">{email}</a>; respondemos en un plazo de 30 días. También puedes reclamar ante una autoridad de protección de datos: en Ucrania, el Comisionado del Parlamento para los Derechos Humanos; en la UE, la autoridad de tu país.',
        ],
      },
      {
        h: 'Edad',
        p: [
          'Dotyk está pensado para mayores de 16 años. No recogemos a sabiendas datos de menores. Si crees que un menor ha creado una cuenta, escríbenos y la eliminaremos.',
        ],
      },
      {
        h: 'Cambios en esta política',
        p: [
          'Si cambiamos esta política, actualizaremos la fecha de arriba y te avisaremos en la app de los cambios importantes antes de que entren en vigor.',
        ],
      },
      {
        h: 'Contacto',
        p: ['{owner}, Ucrania — <a href="mailto:{email}">{email}</a>'],
      },
    ],
  },
  terms: {
    title: 'Términos de uso',
    intro:
      'Estos términos se aplican cuando usas la app Dotyk. Al crear una cuenta, los aceptas. Léelos junto con nuestra <a href="privacy.html">Política de privacidad</a>.',
    sections: [
      {
        h: 'El servicio',
        p: [
          'Dotyk lo ofrece {owner}, Ucrania («nosotros»). La app permite a dos personas crear un espacio compartido: recuerdos, notas, fechas, planes, juegos y una mascota virtual.',
        ],
      },
      {
        h: 'Quién puede usar Dotyk',
        p: [
          'Debes tener al menos 16 años y poder aceptar estos términos. Solo puedes estar en una pareja a la vez.',
        ],
      },
      {
        h: 'Tu cuenta',
        p: [
          'Facilita datos veraces y protege tus datos de acceso. Eres responsable de la actividad de tu cuenta. Avísanos si crees que otra persona tiene acceso a ella.',
        ],
      },
      {
        h: 'Tu contenido',
        p: [
          'Conservas todos los derechos sobre lo que añades. Nos das un permiso limitado para guardar, tratar y mostrar tu contenido a ti y a tu pareja, solo para hacer funcionar la app.',
          'Añade solo contenido que tengas derecho a compartir. No subas fotos de otras personas sin su consentimiento ni uses Dotyk para nada ilegal, acosador o dañino.',
          'Recuerda que tu pareja ve lo que añades al espacio compartido y que el contenido compartido se elimina para ambos si cualquiera de los dos abandona la pareja o elimina su cuenta.',
        ],
      },
      {
        h: 'Uso aceptable',
        ul: [
          'No intentes acceder a cuentas o datos ajenos ni interferir en el servicio.',
          'No apliques ingeniería inversa, sobrecargues ni abuses de la app, sus límites o sus funciones de IA.',
          'No uses la app para enviar spam o contenido ilegal.',
        ],
      },
      {
        h: 'Dotyk Plus',
        ul: [
          'Plus es opcional. Las funciones básicas son gratuitas.',
          'Plus se compra a través del App Store o Google Play y se comparte con tu pareja mientras estéis emparejados. El precio y el periodo se muestran antes de comprar.',
          'Las suscripciones se renuevan automáticamente salvo que se cancelen al menos 24 horas antes del final del periodo actual. El cargo se realiza en tu cuenta de la tienda en las 24 horas previas a la renovación.',
          'Puedes gestionar o cancelar la suscripción en los ajustes de tu cuenta del App Store o Google Play. Eliminar la app o tu cuenta de Dotyk no cancela la suscripción.',
          'Si se ofrece una prueba gratuita, la parte no usada termina al comprar una suscripción. Los reembolsos los gestionan Apple o Google según sus políticas.',
          'Una compra única «para siempre» da Plus mientras se ofrezca la app.',
        ],
      },
      {
        h: 'Funciones de IA',
        p: [
          'Las sugerencias de IA se generan automáticamente y pueden ser inexactas o inadecuadas. Usa tu propio criterio. Las funciones de IA son opcionales y tienen límites diarios en el plan gratuito.',
        ],
      },
      {
        h: 'Cambios y disponibilidad',
        p: [
          'Mejoramos Dotyk continuamente y podemos cambiar o retirar funciones. Intentamos que la app esté disponible, pero no podemos garantizar que funcione siempre sin interrupciones. Te avisaremos con antelación de los cambios importantes en estos términos.',
        ],
      },
      {
        h: 'Fin del uso',
        p: [
          'Puedes dejar de usar Dotyk y eliminar tu cuenta en cualquier momento en Ajustes. Podemos suspender o cerrar cuentas que incumplan estos términos de forma grave o reiterada.',
        ],
      },
      {
        h: 'Responsabilidad',
        p: [
          'La app se ofrece «tal cual». En la medida en que lo permita la ley, no respondemos de daños indirectos ni de pérdida de datos. Nada en estos términos limita los derechos que te reconoce como consumidor la ley de tu país.',
        ],
      },
      {
        h: 'Apple App Store',
        p: [
          'Si descargaste Dotyk del App Store, estos términos son entre tú y nosotros, no Apple. También se aplica el <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">Contrato de licencia de usuario final de Apple</a>, y Apple no tiene obligación de dar soporte a la app.',
        ],
      },
      {
        h: 'Ley aplicable',
        p: [
          'Estos términos se rigen por la ley de Ucrania. Si eres consumidor, conservas además la protección de las normas imperativas del país donde vives.',
        ],
      },
      { h: 'Contacto', p: ['<a href="mailto:{email}">{email}</a>'] },
    ],
  },
  delete: {
    title: 'Eliminar tu cuenta de Dotyk',
    intro: 'Puedes eliminar tu cuenta y tus datos en cualquier momento, directamente en la app.',
    sections: [
      {
        h: 'En la app',
        ol: [
          'Abre Dotyk y ve a la pestaña <strong>Perfil</strong>.',
          'Desplázate hasta <strong>Cuenta</strong>.',
          'Pulsa <strong>Eliminar cuenta</strong> y confirma.',
        ],
      },
      {
        h: 'Qué se elimina',
        ul: [
          'Tu cuenta, nombre, correo, fecha de nacimiento y foto de perfil.',
          'El espacio compartido de vuestra pareja: recuerdos y fotos, notas, momentos, fechas, planes, juegos, dibujos y vuestra mascota. También desaparece para tu pareja.',
          'Los tokens de notificaciones push y las respuestas de IA en caché.',
        ],
        p2: [
          'La eliminación es inmediata. Las copias de seguridad se sobrescriben en un plazo limitado.',
        ],
      },
      {
        h: 'Qué no se elimina automáticamente',
        ul: [
          '<strong>Suscripciones.</strong> Cancela Plus en los ajustes de tu cuenta del App Store o Google Play: eliminar la cuenta no detiene los pagos.',
          'Los registros de compra que conservan Apple, Google y RevenueCat según sus propias políticas y obligaciones legales.',
        ],
      },
      {
        h: '¿No tienes acceso a la app?',
        p: [
          'Escribe a <a href="mailto:{email}?subject=Delete%20my%20Dotyk%20account">{email}</a> desde la dirección que usas en Dotyk con el asunto «Eliminar mi cuenta de Dotyk». Eliminaremos la cuenta en un plazo de 30 días y te lo confirmaremos por correo.',
        ],
      },
    ],
  },
  support: {
    title: 'Soporte',
    intro:
      '¿Preguntas, ideas o algo no funciona? Escribe a <a href="mailto:{email}">{email}</a>; solemos responder en pocos días.',
    sections: [
      {
        h: '¿Cómo nos conectamos como pareja?',
        p: [
          'Uno de los dos crea la pareja y comparte el código de invitación; el otro lo introduce en la pantalla «Código de tu pareja».',
        ],
      },
      {
        h: '¿Cómo cancelo Plus?',
        p: [
          'En los ajustes de tu cuenta del App Store o Google Play, en Suscripciones. Plus sigue activo hasta el final del periodo pagado.',
        ],
      },
      {
        h: 'He comprado Plus pero no aparece',
        p: [
          'Abre la pestaña Perfil y pulsa «Restaurar compras». Asegúrate de haber iniciado sesión con la misma cuenta del App Store o Google Play.',
        ],
      },
      {
        h: '¿Cómo elimino mi cuenta?',
        p: ['Consulta <a href="delete-account.html">Eliminar cuenta</a>.'],
      },
    ],
  },
};
