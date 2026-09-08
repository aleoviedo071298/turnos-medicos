# TurnosMed — Backend de Gestión de Turnos Médicos

API REST construida con **Node.js**, **Express** y **TypeScript** para centralizar la gestión de turnos de un centro de atención médica. Expone operaciones CRUD sobre especialidades y profesionales, con borrado lógico, validaciones y manejo global de errores.

> Actividades 1 y 2 — Integraciones Web, Módulos 1 y 2.

## Contexto

Todos los profesionales del centro atienden de **lunes a viernes**, entre las **07:00** y las **13:00**, en turnos de **30 minutos**.

Los datos se cargan desde archivos JSON al iniciar el servidor y viven en arrays en memoria. Toda alta, baja o modificación es ficticia y persiste únicamente mientras el proceso esté corriendo: al reiniciar, los arrays vuelven al contenido de los JSON.

## Estructura del proyecto

```
turnos-medicos/
├── src/
│   ├── data/
│   │   ├── especialidades.json
│   │   └── profesionales.json
│   ├── index.ts
│   └── resources.ts
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

| Archivo | Responsabilidad |
| --- | --- |
| `src/resources.ts` | Lee los JSON con `node:fs/promises`, expone los arrays globales, los tipos de dominio y la parametría de la agenda. |
| `src/index.ts` | Servidor Express: definición de rutas, controllers y middleware global de rutas inexistentes. |
| `src/data/*.json` | Datos iniciales del sistema. |

## Requisitos

- Node.js 24 LTS o superior (permite ejecutar los archivos TypeScript directamente, sin compilar).
- npm 11 o superior.

## Instalación

```bash
npm install
```

## Ejecución

```bash
npm run dev
```

El servidor queda escuchando en `http://localhost:3000`.

## Scripts

| Script | Comando | Descripción |
| --- | --- | --- |
| `npm run dev` | `node --watch src/index.ts` | Modo desarrollo, con recarga automática ante cambios. |
| `npm run build` | `tsc` | Verifica los tipos y compila a JavaScript en `dist/`. |
| `npm start` | `node dist/index.js` | Ejecuta el proyecto compilado. Requiere `npm run build` antes. |

## API REST

Base: `http://localhost:3000`

### Especialidades

| Método | Ruta | Descripción | Éxito | Errores |
| --- | --- | --- | --- | --- |
| GET | `/especialidades` | Listado completo | 200 | 400 |
| GET | `/especialidades/:id` | Busca por `especialidadId` | 200 | 404, 500 |
| POST | `/especialidades` | Alta de especialidad | 201 | 400 |
| DELETE | `/especialidades/:id` | Borrado lógico (`activa` → `false`) | 204 | 404, 500 |

### Profesionales

| Método | Ruta | Descripción | Éxito | Errores |
| --- | --- | --- | --- | --- |
| GET | `/profesionales` | Listado de profesionales activos | 200 | 400 |
| GET | `/profesionales/:id` | Busca por `medicoId` | 200 | 404 |
| POST | `/profesionales` | Alta, validando que la especialidad exista | 201 | 400 |
| PUT | `/profesionales/:id` | Modificación completa | 200 | 400, 404 |
| DELETE | `/profesionales/:id` | Borrado lógico (`activo` → `false`) | 204 | 404 |

### Cuerpos de las peticiones

`POST /especialidades`

```json
{
  "nombreEspecialidad": "Kinesiología",
  "activa": true
}
```

`POST /profesionales` y `PUT /profesionales/:id`

```json
{
  "nombre": "Ana Gutiérrez",
  "especialidad": "Cardiología",
  "activo": true
}
```

El campo `especialidad` debe coincidir con un `nombreEspecialidad` existente en `especialidades.json`. Si no existe, la API responde 400.

### Formato de las respuestas

Éxito:

```json
{ "success": true, "data": { } }
```

Error:

```json
{ "success": false, "message": "Descripción del problema" }
```

Las respuestas 204 no llevan cuerpo.

### Rutas inexistentes

Un middleware final, registrado después de todas las rutas, captura cualquier pathname o método no contemplado:

```json
{
  "success": false,
  "message": "Endpoint no encontrado",
  "ruta": "/ruta-inventada",
  "metodo": "GET"
}
```

## Manejo de errores y códigos de estado

- La lógica de cada controller está envuelta en `try-catch`.
- `200 OK` en lecturas y modificaciones exitosas.
- `201 Created` en las altas.
- `204 No Content` en los borrados lógicos.
- `400 Bad Request` ante un cuerpo inválido o una especialidad inexistente.
- `404 Not Found` ante un id que no existe o una ruta no contemplada.
- `500 Internal Server Error` ante una falla inesperada.

## Visualización en consola

Después de cada petición procesada con éxito sobre un recurso, el servidor ejecuta `console.clear()` y `console.table()` para mostrar en la terminal el estado actualizado del registro manipulado.

```
┌──────────────┬─────────────────┐
│ (index)      │ Values          │
├──────────────┼─────────────────┤
│ medicoId     │ 35              │
│ nombre       │ 'Ana Gutiérrez' │
│ especialidad │ 'Cardiología'   │
│ activo       │ true            │
└──────────────┴─────────────────┘
```

## Datos

### `especialidades.json` — 22 registros

```json
{
  "especialidadId": 1,
  "nombreEspecialidad": "Cardiología",
  "activa": true
}
```

### `profesionales.json` — 34 registros

```json
{
  "medicoId": 1,
  "nombre": "Laura Giménez",
  "especialidad": "Cardiología",
  "activo": true
}
```

## Configuración de la agenda

La interfaz `Parametria`, definida en `src/resources.ts`, establece los límites operativos del centro. Sus tres propiedades son obligatorias y de tipo `string`:

| Propiedad | Formato | Descripción |
| --- | --- | --- |
| `fechaMaxima` | `YYYY-MM-DD` | Fecha límite hasta la que se puede reservar. |
| `horaMinima` | `HH:mm` | Hora de apertura de la atención. |
| `horaMaxima` | `HH:mm` | Hora de cierre de la atención. |

```ts
export const configuracionAgenda: Parametria = {
    fechaMaxima: '2026-12-30',
    horaMinima: '07:00',
    horaMaxima: '13:00'
}
```

Es la regla base del backend para validar que un nuevo turno se mantenga dentro de los márgenes coherentes de la institución antes de ser procesado.

## Detalles técnicos

- **Módulos ESM.** El `package.json` declara `"type": "module"`, por lo que los imports incluyen la extensión del archivo (`./resources.ts`), habilitada con `allowImportingTsExtensions`. Al compilar, `rewriteRelativeImportExtensions` reescribe esas rutas a `.js` en la salida de `dist/`.
- **Ejecución directa de TypeScript.** Node.js 24 remueve los tipos en tiempo de ejecución, de modo que `node src/index.ts` corre sin transpilar previamente.
- **Lectura asíncrona.** `src/resources.ts` usa `fs/promises` con *top-level await*: los JSON se leen durante la carga del módulo y quedan disponibles como arrays exportados.
- **Rutas.** Las rutas a los datos se arman con `path.resolve('src', 'data', ...)`, relativo al directorio desde el que se ejecuta el proceso. El proyecto debe iniciarse desde la raíz.

## Tecnologías

- Node.js (LTS)
- Express.js
- TypeScript
- `node:fs/promises`

## Autor

Alejandro Oviedo — Integraciones Web.
