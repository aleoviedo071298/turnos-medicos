# Propuesta de módulo: Pacientes y Turnos

Definición técnica del nuevo módulo de TurnosMed, pensada como mockup para que el equipo de Frontend avance con la pantalla de gestión de pacientes y asignación de turnos médicos.

El documento describe las tres estructuras de datos que soportan el módulo y los endpoints RESTful propuestos para cada entidad.

---

## 1. Estructuras de datos

### 1.1. Paciente (`pacientes.json`)

Representa a la persona que solicita atención en el centro médico. Concentra los datos mínimos e indispensables para identificarla, contactarla y determinar bajo qué cobertura se la atiende.

```json
{
  "codigo_paciente": "PAC-2026-001",
  "nombre_completo": "María Elena Gómez",
  "documento_identificador": "38450912",
  "fecha_nacimiento": "1994-06-15",
  "email": "maria.gomez@example.com",
  "telefono": "+541155554321",
  "cobertura_salud": "OSDE 310"
}
```

```typescript
interface Paciente {
    codigo_paciente: string
    nombre_completo: string
    documento_identificador: string
    fecha_nacimiento: string
    email: string
    telefono: string
    cobertura_salud: string
}
```

| Campo | Descripción |
| --- | --- |
| `codigo_paciente` | Identificador único del paciente dentro del sistema. Usa el formato `PAC-AAAA-NNN`, donde `AAAA` es el año de alta y `NNN` un correlativo. Es la clave con la que el resto de la API referencia al paciente, y no cambia durante su vida útil. |
| `nombre_completo` | Nombre y apellido tal como figuran en la documentación del paciente. Es el dato que se muestra en las pantallas de agenda y en el detalle del turno. |
| `documento_identificador` | Número de documento, en texto. Se guarda como cadena y no como número porque puede incluir ceros a la izquierda y porque nunca se opera aritméticamente con él. Identifica unívocamente a la persona frente a organismos externos. |
| `fecha_nacimiento` | Fecha en formato ISO `AAAA-MM-DD`. Permite calcular la edad del paciente al momento de la consulta, dato necesario para derivarlo a especialidades como Pediatría o Geriatría. |
| `email` | Correo electrónico de contacto. Canal previsto para los recordatorios de turno y las notificaciones de cambios de estado. |
| `telefono` | Teléfono de contacto en formato internacional. Es la vía de contacto inmediata ante una cancelación o reprogramación de último momento. |
| `cobertura_salud` | Obra social o prepaga del paciente, con su plan. Determina la validación administrativa previa a la atención y condiciona qué prestaciones están habilitadas. Los pacientes sin cobertura se registran como `Particular`. |

### 1.2. Turno (`turnos.json`)

Representa la reserva de un espacio de atención: vincula a un paciente con un profesional en una fecha y hora determinadas, y registra en qué punto del circuito se encuentra esa atención.

```json
{
  "codigo_turno": "TUR-2026-8941",
  "fecha": "2026-10-05",
  "hora": "14:30",
  "especialidad": "Cardiología",
  "profesional": "Dr. Carlos Benítez",
  "nombre_paciente": "María Elena Gómez",
  "estado_turno": "registrado"
}
```

```typescript
interface Turno {
    codigo_turno: string
    fecha: string
    hora: string
    especialidad: string
    profesional: string
    nombre_paciente: string
    estado_turno: string
}
```

| Campo | Descripción |
| --- | --- |
| `codigo_turno` | Identificador único de la reserva, con el formato `TUR-AAAA-NNNN`. Es el dato que el paciente recibe como comprobante y con el que se consulta o modifica el turno. |
| `fecha` | Día de la atención, en formato ISO `AAAA-MM-DD`. Debe caer dentro de los días hábiles de atención del centro y no puede superar la `fechaMaxima` definida en la parametría de agenda. |
| `hora` | Horario de inicio de la atención, en formato `HH:mm`. Se espera que coincida con el comienzo de una franja de 30 minutos dentro del rango de apertura y cierre configurado. |
| `especialidad` | Especialidad médica bajo la que se brinda la atención. Debe corresponder a una especialidad activa del listado del centro, y coincidir con la del profesional asignado. |
| `profesional` | Profesional que atenderá el turno. Permite armar la agenda individual de cada médico y evitar que se le asigne más de un paciente en la misma franja horaria. |
| `nombre_paciente` | Paciente para el que se reservó el turno. Vincula la reserva con la ficha registrada en la entidad Paciente. |
| `estado_turno` | Punto del circuito en el que se encuentra el turno. Su valor siempre corresponde a un `codigo` del catálogo de estados descripto abajo. Es lo que permite filtrar la agenda del día y medir ausentismo. |

### 1.3. Estados de turno (`estadosdeturnos.json`)

Catálogo cerrado con los estados válidos por los que puede atravesar un turno. Existe como estructura propia para que el frontend pueda construir sus filtros y etiquetas a partir de la API, en lugar de tener la lista escrita a mano.

```json
{
  "estados_disponibles": [
    {
      "codigo": "registrado",
      "nombre": "Registrado",
      "descripcion": "El turno fue solicitado y agendado correctamente."
    }
  ]
}
```

```typescript
interface EstadoTurno {
    codigo: string
    nombre: string
    descripcion: string
}
```

| Campo | Descripción |
| --- | --- |
| `codigo` | Valor técnico del estado, en minúsculas y con guion bajo. Es el que viaja en el campo `estado_turno` de la entidad Turno y el que se usa en las comparaciones dentro del código. |
| `nombre` | Etiqueta legible del estado, pensada para mostrarse en pantalla sin transformaciones. |
| `descripcion` | Explicación de qué significa el estado dentro del circuito de atención. Sirve como referencia para el equipo de Frontend y para la documentación funcional. |

El circuito completo, en el orden esperado:

| Código | Nombre | Significado |
| --- | --- | --- |
| `registrado` | Registrado | El turno fue solicitado y agendado correctamente. |
| `validado` | Validado | La cobertura de salud o los datos del turno fueron confirmados. |
| `presente` | Presente | El paciente ha llegado al establecimiento. |
| `en_consulta` | En Consulta | El paciente está siendo atendido por el profesional. |
| `finalizado` | Finalizado | La consulta concluyó y el turno se cerró correctamente. |
| `cancelado` | Cancelado | El turno fue dado de baja por el paciente o por el establecimiento. |
| `no_presentado` | No Presentado | El paciente no asistió al turno y no avisó con antelación. |

Los cinco primeros describen la progresión normal de una atención. `cancelado` y `no_presentado` son estados terminales que pueden alcanzarse desde cualquier punto previo a la consulta.

---

## 2. Endpoints propuestos

### 2.1. Pacientes

#### `GET /pacientes`

Devuelve el listado completo de pacientes registrados. Es el endpoint que alimenta la grilla principal de la pantalla de gestión. No recibe parámetros de entrada y responde con un array de objetos `Paciente`.

#### `GET /pacientes/codigo_paciente`

Recupera la ficha de un único paciente a partir de su código. El identificador viaja como parámetro de ruta. Se usa al abrir el detalle de un paciente o al precargar sus datos antes de asignarle un turno. Si el código no corresponde a ningún paciente registrado, responde con un error de recurso no encontrado.

#### `POST /pacientes`

Da de alta un nuevo paciente. Recibe en el cuerpo de la petición los datos de la ficha, valida que estén completos y que el documento no pertenezca a un paciente ya registrado, y genera el `codigo_paciente` del lado del servidor. Devuelve el paciente creado.

#### `PUT /pacientes`

Modifica de forma completa los datos de un paciente existente. El cuerpo de la petición incluye el `codigo_paciente` que identifica a quién modificar, junto con todos los campos de la ficha. Está pensado para actualizar datos de contacto o cambios de cobertura de salud. El código del paciente no es modificable.

#### `DELETE /pacientes` (soft delete)

Da de baja a un paciente sin eliminarlo físicamente del sistema. Al igual que en las entidades ya existentes de TurnosMed, la baja es lógica: el registro permanece almacenado y solo se marca como inactivo. Esto es indispensable en un sistema de salud, donde los turnos históricos de ese paciente deben seguir siendo consultables aunque la ficha ya no esté vigente.

### 2.2. Turnos

#### `GET /turnos`

Devuelve el listado completo de turnos. Es la base de la vista de agenda, sobre la que el frontend aplica sus propios filtros por fecha, profesional o estado.

#### `GET /turnos/codigo_turno`

Recupera un turno puntual a partir de su código, recibido como parámetro de ruta. Se usa al abrir el detalle de una reserva o al mostrarle al paciente el comprobante de su turno. Si el código no existe, responde con un error de recurso no encontrado.

#### `POST /turnos`

Registra un nuevo turno. Recibe en el cuerpo la fecha, la hora, la especialidad, el profesional y el paciente. Antes de crearlo, valida que el paciente y el profesional existan, que la especialidad coincida con la del profesional asignado, y que la fecha y la hora respeten la parametría de agenda del centro: día hábil, franja de 30 minutos y horario dentro del rango de apertura y cierre. También verifica que el profesional no tenga otro turno asignado en esa misma franja. El turno se crea siempre en estado `registrado`.

#### `PUT /turnos`

Modifica un turno existente, identificado por el `codigo_turno` que viaja en el cuerpo. Cubre dos escenarios: la reprogramación, cuando cambian la fecha y la hora, y el avance del circuito de atención, cuando cambia el `estado_turno`. En ambos casos se aplican las mismas validaciones que en el alta, y el nuevo estado debe pertenecer al catálogo de estados disponibles.

##### Correlación con los estados de turno

Este es el endpoint que hace avanzar el turno por el circuito. Cada cambio de estado es una petición `PUT` que envía el código del turno y el nuevo valor de `estado_turno`:

```json
{
  "codigo_turno": "TUR-2026-8941",
  "estado_turno": "validado"
}
```

Un turno nace en `registrado` al crearse con `POST /turnos`. A partir de ahí, cada avance corresponde a un `PUT` disparado por un actor distinto del centro médico:

| Estado actual | Transiciones válidas | Quién la dispara y cuándo |
| --- | --- | --- |
| `registrado` | `validado`, `cancelado`, `no_presentado` | Administración, al confirmar la cobertura de salud y los datos de la reserva. |
| `validado` | `presente`, `cancelado`, `no_presentado` | Recepción, cuando el paciente se acredita en el establecimiento. |
| `presente` | `en_consulta`, `cancelado` | El profesional, al hacer pasar al paciente al consultorio. |
| `en_consulta` | `finalizado` | El profesional, al cerrar la atención. |
| `finalizado` | — | Estado terminal. |
| `cancelado` | — | Estado terminal. |
| `no_presentado` | — | Estado terminal. |

De la tabla se desprenden las reglas que el endpoint debe validar antes de aceptar el cambio:

- El estado recibido tiene que existir en el catálogo de `estadosdeturnos.json`.
- La transición tiene que estar permitida desde el estado actual del turno. No se puede pasar de `registrado` directamente a `finalizado`, porque saltearía la acreditación y la consulta.
- Un turno en estado terminal (`finalizado`, `cancelado` o `no_presentado`) no admite más cambios de estado.
- La reprogramación de fecha y hora solo tiene sentido mientras el turno no haya sido atendido, es decir, en `registrado` o `validado`.

`cancelado` y `no_presentado` se separan porque responden a situaciones distintas: la cancelación implica un aviso previo que libera la franja horaria para otro paciente, mientras que el `no_presentado` se registra cuando la franja ya se perdió. Distinguirlos es lo que permite medir el ausentismo real del centro.

No se define un endpoint `DELETE` para los turnos. La baja de una reserva no se resuelve eliminando el registro, sino asignándole el estado `cancelado` mediante `PUT /turnos`. De esta manera el turno permanece en el historial del paciente, queda registrado quién lo canceló y cuándo, y las cancelaciones pueden contabilizarse junto con los `no_presentado` para medir el ausentismo del centro.
