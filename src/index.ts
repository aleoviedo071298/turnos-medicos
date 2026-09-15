import Express, { type Request, type Response } from 'express'
import { configuracionAgenda } from './resources.ts'
import type { Especialidad, Profesional } from './resources.ts'
import { GeneralController } from './controller/general.controller.ts'
import { EspecialidadesController } from './controller/especialidades.controller.ts'
import { ProfesionalesController } from './controller/profesionales.controller.ts'

const PORT = process.env.PORT || 3000
const app = Express()

//Middleware
app.use(Express.json())

//Endpoints

//Hello world
app.get('/', GeneralController.helloWorld)

//Profesionales
app.get('/profesionales', ProfesionalesController.getAll)
app.get('/profesionales/:id', ProfesionalesController.findById)
app.post('/profesionales', ProfesionalesController.create)
app.put('/profesionales/:id', ProfesionalesController.modify)
app.delete('/profesionales/:id', ProfesionalesController.delete)

//Especialidades
app.get('/especialidades', EspecialidadesController.getAll)
app.get('/especialidades/:id', EspecialidadesController.findById)
app.post('/especialidades', EspecialidadesController.create)
app.delete('/especialidades/:id', EspecialidadesController.delete)

//Endpoint general
app.use(GeneralController.notFound)

//Configuracion de la agenda
//Servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`)
})