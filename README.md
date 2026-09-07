# TurnosMed — Backend de Gestión de Turnos Médicos

Prototipo de backend construido con **Node.js**, **TypeScript** y **Express**, que centraliza la gestión de turnos de un centro de atención médica. Expone las entidades del dominio (especialidades y profesionales) y la parametría de la agenda que sirve como regla base para validar las reservas.

> Actividad 1 — Integraciones Web, Módulo 1.

## Contexto

Todos los profesionales del centro atienden de **lunes a viernes**, en turnos de **30 minutos** de duración.

El frontend valida que la fecha y el rango horario elegidos por el paciente se ajusten a las reglas del sistema. El backend se encarga de:

- Estructurar las entidades del dominio.
- Disponibilizar la información de profesionales y especialidades.
- Definir la parametría de la agenda que acota los turnos a los márgenes de la institución.

La persistencia inicial se resuelve con archivos JSON leídos mediante el módulo nativo `node:fs/promises`.

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
| `src/resources.ts` | Lee los archivos JSON con `fs/promises`, expone los arrays de datos y la configuración de la agenda. |
| `src/index.ts` | Punto de entrada. Importa los recursos y los muestra por consola con `console.table`. |
| `src/data/*.json` | Mockup de datos generado con IA. |

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

## Scripts

| Script | Comando | Descripción |
| --- | --- | --- |
| `npm run dev` | `node --watch src/index.ts` | Ejecuta el proyecto en modo desarrollo, con recarga automática ante cambios. Es la forma habitual de correrlo. |
| `npm run build` | `tsc` | Verifica los tipos y compila el proyecto a JavaScript en `dist/`. |
| `npm start` | `node dist/index.js` | Ejecuta el proyecto compilado. Requiere haber corrido `npm run build` antes. |

## Detalles técnicos

- **Módulos ESM.** El `package.json` declara `"type": "module"`, por lo que los imports incluyen la extensión del archivo (`./resources.ts`), habilitada con `allowImportingTsExtensions`. Al compilar, `rewriteRelativeImportExtensions` reescribe esas rutas a `.js` en la salida de `dist/`.
- **Ejecución directa de TypeScript.** Node.js 24 remueve los tipos en tiempo de ejecución, de modo que `node src/index.ts` corre sin transpilar previamente.
- **Lectura asíncrona.** `src/resources.ts` usa `fs/promises` con *top-level await*: los archivos JSON se leen durante la carga del módulo y quedan disponibles como arrays exportados.
- **Rutas.** Las rutas a los datos se arman con `path.resolve('src', 'data', ...)`, relativo al directorio desde el que se ejecuta el proceso. El proyecto debe iniciarse desde la raíz.

## Datos

Los datos iniciales fueron generados con IA y guardados en `src/data/`.

### `especialidades.json` — 22 registros

```json
{
  "especialidadId": "uuid-v4",
  "nombreEspecialidad": "Nombre de la Especialidad",
  "activa": true
}
```

### `profesionales.json` — 34 registros

```json
{
  "medicoId": "uuid-v4",
  "nombre": "Nombre y Apellido",
  "especialidad": "Nombre de la Especialidad existente",
  "activo": true
}
```

El campo `especialidad` de cada profesional coincide textualmente con un `nombreEspecialidad` existente en `especialidades.json`.

## Configuración de la agenda

La interfaz `Parametria`, definida en `src/resources.ts`, establece los límites operativos del centro. Sus tres propiedades son obligatorias y de tipo `string`:

| Propiedad | Formato | Descripción |
| --- | --- | --- |
| `fechaMaxima` | `YYYY-MM-DD` | Fecha límite hasta la que se puede reservar. |
| `horaMinima` | `HH:mm` | Hora de apertura de la atención. |
| `horaMaxima` | `HH:mm` | Hora de cierre de la atención. |

Valores actuales:

```ts
export const configuracionAgenda: Parametria = {
    fechaMaxima: '2026-12-30',
    horaMinima: '07:00',
    horaMaxima: '13:00'
}
```

Esta parametría es la regla base del backend para validar que un nuevo turno se mantenga dentro de los márgenes coherentes de la institución antes de ser procesado.

## Salida esperada

Al ejecutar el proyecto se imprimen por consola la configuración de la agenda y las tablas de profesionales y especialidades:

```
Configuración de la agenda:
┌─────────────┬──────────────┐
│ (index)     │ Values       │
├─────────────┼──────────────┤
│ fechaMaxima │ '2026-12-30' │
│ horaMinima  │ '07:00'      │
│ horaMaxima  │ '13:00'      │
└─────────────┴──────────────┘
Profesionales:
...
Especialidades:
...
```

## Tecnologías

- Node.js (LTS)
- TypeScript
- Express.js
- `node:fs/promises`

## Autor

Alejandro Oviedo — Integraciones Web, Módulo 1, Actividad 1.
