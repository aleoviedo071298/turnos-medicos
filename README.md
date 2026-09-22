# TurnosMed

> API REST para la gestión centralizada de turnos médicos — especialidades y profesionales con CRUD completo y borrado lógico.

![Node.js](https://img.shields.io/badge/Node.js-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)

> Actividades 1, 2, 3 y 4 — Integraciones Web, Módulos 1, 2, 3 y 4. Teclab — Tecnicatura Superior en Programación.

## Contexto

Todos los profesionales del centro atienden de **lunes a viernes**, entre las **07:00** y las **13:00**, en turnos de **30 minutos**.

Los datos se cargan desde archivos JSON al iniciar el servidor y viven en arrays en memoria. Toda alta, baja o modificación persiste únicamente mientras el proceso esté corriendo: al reiniciar, los arrays vuelven al contenido de los JSON.

La propuesta del próximo módulo, con el modelado de **Pacientes** y **Turnos** y sus endpoints, está documentada en [`pacientes-turnos.md`](./pacientes-turnos.md).

## Tech Stack

| Capa | Detalle |
|---|---|
| **Runtime** | Node.js 24 LTS |
| **Lenguaje** | TypeScript |
| **Framework** | Express.js |
| **Datos** | `node:fs/promises` — JSON en memoria |

## Estructura del proyecto

```
turnos-medicos/
├── src/
│   ├── controller/
│   │   ├── general.controller.ts          Hello world y middleware de rutas inexistentes
│   │   ├── especialidades.controller.ts   Handlers de la entidad Especialidades
│   │   └── profesionales.controller.ts    Handlers de la entidad Profesionales
│   ├── data/
│   │   ├── especialidades.json
│   │   ├── profesionales.json
│   │   ├── pacientes.json                 Mockup del próximo módulo
│   │   ├── turnos.json                    Mockup del próximo módulo
│   │   └── estadosdeturnos.json           Catálogo de estados de turno
│   ├── index.ts          Servidor Express: registro de rutas y middlewares
│   └── resources.ts      Carga de JSON, tipos de dominio y parametría de agenda
├── .gitignore
├── package.json
├── tsconfig.json
├── pacientes-turnos.md
└── README.md
```

### Arquitectura

La definición de las rutas está desacoplada de la lógica de negocio. `index.ts` solo registra cada ruta contra el método del controlador que le corresponde:

```ts
app.get('/especialidades', EspecialidadesController.getAll)
app.get('/especialidades/:id', EspecialidadesController.findById)
```

Cada controlador es una clase con métodos estáticos asincrónicos. Todos siguen el mismo patrón:

- Una variable de estado `statusCode` propia del controlador, que se ajusta según el camino que tome el flujo.
- Validaciones previas a cualquier lectura o modificación de datos, que lanzan `throw new Error(...)` tras fijar el código correspondiente.
- La lógica envuelta en `try-catch`, con el `catch` devolviendo el mensaje del error y el código ya configurado.
- `return` explícito en cada respuesta, para evitar el error *headers already sent*.

```ts
static findById = async (req: Request, res: Response) => {
    this.statusCode = 200
    try {
        const especialidadId: number = Number(req.params.id)
        if (Number.isNaN(especialidadId)) {
            this.statusCode = 400
            throw new Error('El id de la especialidad debe ser un número')
        }
        // ...
    } catch (error: any) {
        if (this.statusCode < 400) this.statusCode = 400
        return res.status(this.statusCode)
            .json({success: false, message: error.message})
    }
}
```

---

## API REST

**Base URL:** `http://localhost:3000`

### Resumen de endpoints

| Método | Path | Descripción funcional |
|---|---|---|
| GET | `/` | Mensaje de bienvenida del servidor |
| GET | `/especialidades` | Listado de especialidades activas |
| GET | `/especialidades/:id` | Recupera una especialidad por su identificador |
| POST | `/especialidades` | Registra una nueva especialidad |
| DELETE | `/especialidades/:id` | Baja lógica de una especialidad |
| GET | `/profesionales` | Listado de profesionales activos |
| GET | `/profesionales/:id` | Recupera un profesional por su identificador |
| POST | `/profesionales` | Registra un nuevo profesional |
| PUT | `/profesionales/:id` | Modificación completa de un profesional |
| DELETE | `/profesionales/:id` | Baja lógica de un profesional |

### Convenciones

Toda respuesta exitosa con contenido devuelve:

```json
{ "success": true, "data": {} }
```

Toda respuesta de error devuelve:

```json
{ "success": false, "message": "Descripción del problema" }
```

Las respuestas `204 No Content` no llevan cuerpo. Las peticiones con cuerpo requieren la cabecera `Content-Type: application/json`.

Esta versión de la API **no utiliza query params**: los identificadores viajan siempre como parámetros de ruta y los datos de alta o modificación en el cuerpo de la petición.

| Código | Cuándo se devuelve |
|---|---|
| `200 OK` | Lectura o modificación exitosa |
| `201 Created` | Alta exitosa |
| `204 No Content` | Baja lógica exitosa, sin cuerpo de respuesta |
| `400 Bad Request` | Cuerpo inválido, identificador no numérico o regla de negocio incumplida |
| `404 Not Found` | El identificador no corresponde a ningún registro, o la ruta no existe |

---

### General

#### `GET /`

Mensaje de bienvenida que confirma que el servidor está levantado y respondiendo.

**Parámetros:** ninguno. **Cuerpo:** no requiere.

**`200 OK`**
```json
{
  "success": true,
  "message": "Bienvenidos al servidor web de MedTurnos"
}
```

#### Rutas y métodos no contemplados

Cualquier petición dirigida a un path inexistente, o con un verbo HTTP no previsto sobre un path existente, es capturada por el middleware final `GeneralController.notFound`.

**`404 Not Found`**
```json
{
  "success": false,
  "message": "Endpoint no encontrado",
  "ruta": "/ruta-inventada",
  "metodo": "GET"
}
```

---

### Especialidades

#### `GET /especialidades`

Devuelve el listado de especialidades cuyo campo `activa` es `true`.

**Parámetros:** ninguno. **Cuerpo:** no requiere.

**`200 OK`**
```json
{
  "success": true,
  "data": [
    {
      "especialidadId": 1,
      "nombreEspecialidad": "Cardiología",
      "activa": true
    }
  ]
}
```

| Error | Código | Mensaje |
|---|---|---|
| Falla inesperada | `400` | Mensaje del error capturado |

#### `GET /especialidades/:id`

Recupera una especialidad puntual a partir de su identificador.

| Parámetro | Ubicación | Tipo | Obligatorio | Descripción |
|---|---|---|---|---|
| `id` | Ruta | `number` | Sí | Valor de `especialidadId` a buscar |

**Cuerpo:** no requiere.

**`200 OK`**
```json
{
  "success": true,
  "data": {
    "especialidadId": 1,
    "nombreEspecialidad": "Cardiología",
    "activa": true
  }
}
```

| Error | Código | Mensaje |
|---|---|---|
| Identificador no numérico | `400` | `El id de la especialidad debe ser un número` |
| Identificador inexistente | `404` | `No existe una especialidad con ese id` |

#### `POST /especialidades`

Registra una nueva especialidad. El `especialidadId` se genera del lado del servidor.

**Parámetros de ruta:** ninguno.

| Campo del cuerpo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `nombreEspecialidad` | `string` | Sí | Nombre de la especialidad |
| `activa` | `boolean` | No | Estado inicial. Se interpreta como `false` si se omite |

```json
{
  "nombreEspecialidad": "Kinesiología",
  "activa": true
}
```

**`201 Created`**
```json
{
  "success": true,
  "data": {
    "especialidadId": 23,
    "nombreEspecialidad": "Kinesiología",
    "activa": true
  }
}
```

| Error | Código | Mensaje |
|---|---|---|
| Falta el nombre o no es texto | `400` | `El campo nombreEspecialidad es obligatorio` |

#### `DELETE /especialidades/:id`

Aplica la baja lógica de una especialidad: el registro permanece en el array y solo se marca `activa` en `false`.

| Parámetro | Ubicación | Tipo | Obligatorio | Descripción |
|---|---|---|---|---|
| `id` | Ruta | `number` | Sí | Valor de `especialidadId` a dar de baja |

**Cuerpo:** no requiere.

**`204 No Content`** — sin cuerpo de respuesta.

| Error | Código | Mensaje |
|---|---|---|
| Identificador no numérico | `400` | `El id de la especialidad debe ser un número` |
| Identificador inexistente | `404` | `No existe una especialidad con ese id` |

---

### Profesionales

#### `GET /profesionales`

Devuelve el listado de profesionales cuyo campo `activo` es `true`.

**Parámetros:** ninguno. **Cuerpo:** no requiere.

**`200 OK`**
```json
{
  "success": true,
  "data": [
    {
      "medicoId": 1,
      "nombre": "Laura Giménez",
      "especialidad": "Cardiología",
      "activo": true
    }
  ]
}
```

| Error | Código | Mensaje |
|---|---|---|
| Falla inesperada | `400` | Mensaje del error capturado |

#### `GET /profesionales/:id`

Recupera un profesional puntual a partir de su identificador.

| Parámetro | Ubicación | Tipo | Obligatorio | Descripción |
|---|---|---|---|---|
| `id` | Ruta | `number` | Sí | Valor de `medicoId` a buscar |

**Cuerpo:** no requiere.

**`200 OK`**
```json
{
  "success": true,
  "data": {
    "medicoId": 1,
    "nombre": "Laura Giménez",
    "especialidad": "Cardiología",
    "activo": true
  }
}
```

| Error | Código | Mensaje |
|---|---|---|
| Identificador no numérico | `400` | `El id del profesional debe ser un número` |
| Identificador inexistente | `404` | `No existe un profesional con ese id` |

#### `POST /profesionales`

Registra un nuevo profesional, validando que la especialidad asignada exista en el listado de especialidades. El `medicoId` se genera del lado del servidor.

**Parámetros de ruta:** ninguno.

| Campo del cuerpo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `nombre` | `string` | Sí | Nombre y apellido del profesional |
| `especialidad` | `string` | Sí | Debe coincidir con un `nombreEspecialidad` existente |
| `activo` | `boolean` | No | Estado inicial. Se interpreta como `false` si se omite |

```json
{
  "nombre": "Ana Gutiérrez",
  "especialidad": "Cardiología",
  "activo": true
}
```

**`201 Created`**
```json
{
  "success": true,
  "data": {
    "medicoId": 35,
    "nombre": "Ana Gutiérrez",
    "especialidad": "Cardiología",
    "activo": true
  }
}
```

| Error | Código | Mensaje |
|---|---|---|
| Falta el nombre o no es texto | `400` | `El campo nombre es obligatorio` |
| La especialidad no existe | `400` | `La especialidad ingresada no existe` |

#### `PUT /profesionales/:id`

Modificación completa de un profesional existente. El `medicoId` no es modificable: se toma del parámetro de ruta.

| Parámetro | Ubicación | Tipo | Obligatorio | Descripción |
|---|---|---|---|---|
| `id` | Ruta | `number` | Sí | Valor de `medicoId` a modificar |

| Campo del cuerpo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `nombre` | `string` | Sí | Nuevo nombre del profesional |
| `especialidad` | `string` | Sí | Nueva especialidad asignada |
| `activo` | `boolean` | Sí | Nuevo estado del profesional |

```json
{
  "nombre": "Ana Gutiérrez Actualizada",
  "especialidad": "Pediatría",
  "activo": true
}
```

**`200 OK`**
```json
{
  "success": true,
  "data": {
    "medicoId": 1,
    "nombre": "Ana Gutiérrez Actualizada",
    "especialidad": "Pediatría",
    "activo": true
  }
}
```

| Error | Código | Mensaje |
|---|---|---|
| Identificador no numérico | `400` | `El id del profesional debe ser un número` |
| Identificador inexistente | `404` | `No existe un profesional con ese id` |

#### `DELETE /profesionales/:id`

Aplica la baja lógica de un profesional: el registro permanece en el array y solo se marca `activo` en `false`.

| Parámetro | Ubicación | Tipo | Obligatorio | Descripción |
|---|---|---|---|---|
| `id` | Ruta | `number` | Sí | Valor de `medicoId` a dar de baja |

**Cuerpo:** no requiere.

**`204 No Content`** — sin cuerpo de respuesta.

| Error | Código | Mensaje |
|---|---|---|
| Identificador no numérico | `400` | `El id del profesional debe ser un número` |
| Identificador inexistente | `404` | `No existe un profesional con ese id` |

---

## Configuración de la agenda

La interfaz `Parametria` define los límites operativos del centro:

| Propiedad | Formato | Descripción |
|---|---|---|
| `fechaMaxima` | `YYYY-MM-DD` | Fecha límite para reservar turnos |
| `horaMinima` | `HH:mm` | Hora de apertura |
| `horaMaxima` | `HH:mm` | Hora de cierre |

```ts
export const configuracionAgenda: Parametria = {
  fechaMaxima: '2026-12-30',
  horaMinima: '07:00',
  horaMaxima: '13:00'
}
```

---

## Instalación y ejecución

### Requisitos previos

- Node.js 24 LTS o superior
- npm 11 o superior

Para verificar las versiones instaladas:

```bash
node -v
npm -v
```

### 1. Descargar el proyecto del repositorio

```bash
git clone https://github.com/aleoviedo071298/turnos-medicos.git
cd turnos-medicos
```

### 2. Instalar las dependencias

```bash
npm install
```

El comando lee `package.json` y crea la carpeta `node_modules/`, que está excluida del repositorio por el `.gitignore`.

> **Sobre `sudo`:** en Linux o macOS no hace falta anteponer `sudo` a `npm install`. Las dependencias se instalan dentro del directorio del proyecto, no a nivel del sistema. Ejecutarlo como superusuario deja los archivos de `node_modules/` con propietario `root` y después genera errores de permisos al trabajar con el usuario habitual. Reservá `sudo` para las instalaciones globales con la bandera `-g`.

### 3. Ejecutar en ambiente de desarrollo

```bash
npm run dev
```

Levanta el servidor con `node --watch src/index.ts`, que ejecuta TypeScript directamente y reinicia el proceso ante cada cambio guardado. El servidor queda escuchando en `http://localhost:3000`.

### 4. Transpilar el proyecto

```bash
npm run build
```

Ejecuta `tsc`, que verifica los tipos y genera el JavaScript compilado dentro de la carpeta `dist/`, también excluida del repositorio.

### 5. Ejecutar en ambiente de producción

```bash
npm start
```

Ejecuta `node dist/index.js`, es decir, el código ya transpilado. Requiere haber corrido `npm run build` previamente.

### Resumen de scripts

| Script | Comando subyacente | Ambiente |
|---|---|---|
| `npm run dev` | `node --watch src/index.ts` | Desarrollo |
| `npm run build` | `tsc` | Transpilación |
| `npm start` | `node dist/index.js` | Producción |

---

**Alejandro Oviedo** · [LinkedIn](https://www.linkedin.com/in/aleoviedo071298/) · [GitHub](https://github.com/aleoviedo071298)
