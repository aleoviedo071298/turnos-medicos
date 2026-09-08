import { configuracionAgenda, arrayProfesionales, arrayEspecialidades } from './resources.ts'
import Express, {type Response, type Request} from 'express'
import type { Profesional } from './resources.ts'
import type { Especialidad } from './resources.ts'
const PORT = process.env.PORT || 3000
const app = Express()

//Middleware
app.use(Express.json())

//Endpoints
//Hello world
app.get('/', (req: Request, res: Response) => {
    res.status(200)
        .json({success: true, message: 'Bienvenidos al servidor web de MedTurnos'})
})

//Especialidades
//Listado completo de especialidades
app.get('/especialidades', (req: Request, res: Response) => {
    try {
        res.status(200)
            .json({success: true, data: arrayEspecialidades})
    } catch (error) {
        res.status(400)
            .json({success: false, message: 'Error al intentar obtener el listado de especialidades'})
    }
})
//Especialidad segun su especialidadId
app.get('/especialidades/:id', (req: Request, res: Response) => {
    try {
        const especialidadId: number | undefined = Number(req.params.id)
        if (!especialidadId) {
            throw new Error('El id de la especialidad debe ser un número')
        }
        const especialidadSolicitada = arrayEspecialidades.find((esp: any) => esp.especialidadId === especialidadId)
        if (!especialidadSolicitada) {
            return res.status(404)
                .json({success: false, message: 'No existe una especialidad con ese id'})
        } else {
        console.clear()
        console.table(especialidadSolicitada)
        res.status(200)
            .json({success: true, data: especialidadSolicitada})
        }
    } catch (error) {
        res.status(500)
            .json({success: false, message: 'Error interno del servidor'})
    }
})
//Alta de una nueva especialidad
app.post('/especialidades', (req: Request, res: Response) => {
    try {
        const { nombreEspecialidad, activa } = req.body

        if (!nombreEspecialidad || typeof nombreEspecialidad !== 'string') {
            throw new Error('El campo nombreEspecialidad es obligatorio')
        }

        const duplicada = arrayEspecialidades.some((esp: any) => esp.nombreEspecialidad === nombreEspecialidad)
        if (duplicada) {
            throw new Error('Ya existe una especialidad con ese nombre')
        }

        const nuevaEspecialidad: Especialidad = {
            especialidadId: arrayEspecialidades.length + 1,
            nombreEspecialidad: nombreEspecialidad,
            activa: Boolean(activa)
        }
        arrayEspecialidades.push(nuevaEspecialidad)
        console.clear()
        console.table(nuevaEspecialidad)
        res.status(201)
            .json({success: true, data: nuevaEspecialidad})
    } catch (error) {
        res.status(400)
            .json({success: false, message: (error as Error).message})
    }
})
//Borrado logico de una especialidad
app.delete('/especialidades/:id', (req: Request, res: Response) => {
    try {
        const especialidadId: number = Number(req.params.id)
        const indice: number = arrayEspecialidades.findIndex((esp: any) => esp.especialidadId === especialidadId)
        if (indice > -1) {
            arrayEspecialidades[indice].activa = false
            console.clear()
            console.table(arrayEspecialidades[indice])
            res.status(204)
                .json({})
        } else {
            res.status(404)
                .json({success: false, message: 'No existe una especialidad con ese id'})
        }
    } catch (error) {
        res.status(500)
            .json({success: false, message: 'Error interno del servidor'})
    }
})

//Profesionales
//Listado completo de profesionales
app.get('/profesionales', (req: Request, res: Response) => {
    try {
        const profesionalesFiltrados: [] = arrayProfesionales.filter((prof: any) => prof.activo === true)
        res.status(200)
            .json({success: true, data: profesionalesFiltrados})
    } catch (error) {
        res.status(400)
            .json({success: false, message: 'Verifica el codigo de especialidad enviado'})
    }
})
//Profesional segun su medicoId
app.get('/profesionales/:id', (req: Request, res: Response) => {
    try {
        const profesionalId = req.params.id
        const profesionalSeleccionado = arrayProfesionales.find((prof: any) => prof.medicoId === Number(profesionalId))
        if (profesionalSeleccionado) {
            console.clear()
            console.table(profesionalSeleccionado)
            res.status(200)
                .json({success: true, data: profesionalSeleccionado})
        } else {
            throw new Error('No existe un profesional con ese id')
        }
    } catch (error) {
        res.status(404)
            .json({success: false, message: (error as Error).message})
    }
})
//Alta de un nuevo profesional
app.post('/profesionales', (req: Request, res: Response) => {
    try {
        const { nombre, especialidad, activo } = req.body

        if (!nombre || typeof nombre !== 'string') {
            throw new Error('El campo nombre es obligatorio')
        }

        const especialidadExistente = arrayEspecialidades.find((esp: any) => esp.nombreEspecialidad === especialidad)
        if (!especialidadExistente) {
            throw new Error('La especialidad indicada no existe en el listado')
        }

        const nuevoProfesional: Profesional = {
            medicoId: arrayProfesionales.length + 1,
            nombre: nombre,
            especialidad: especialidad,
            activo: Boolean(activo)
        }
        arrayProfesionales.push(nuevoProfesional)
        console.clear()
        console.table(nuevoProfesional)
        res.status(201)
            .json({success: true, data: nuevoProfesional})
    } catch (error) {
        res.status(400)
            .json({success: false, message: (error as Error).message})
    }
})
//Modificacion completa de un profesional
app.put('/profesionales/:id', (req: Request, res: Response) => {
    try {
        const profesionalId = req.params.id
        const { nombre, especialidad, activo } = req.body
        const indice = arrayProfesionales.findIndex((prof: any) => prof.medicoId === Number(profesionalId))
        if (indice > -1) {
            arrayProfesionales[indice].nombre = nombre
            arrayProfesionales[indice].especialidad = especialidad
            arrayProfesionales[indice].activo = Boolean(activo)
            console.clear()
            console.table(arrayProfesionales[indice])
            res.status(200)
                .json({success: true, data: arrayProfesionales[indice]})
        } else {
            res.status(404)
                .json({success: false, message: 'No existe un profesional con ese id'})
        }
    } catch (error) {
        res.status(400)
            .json({success: false, message: (error as Error).message})
    }
})
//Borrado logico de un profesional
app.delete('/profesionales/:id', (req: Request, res: Response) => {
    try {
        const profesionalId = req.params.id
        const indice = arrayProfesionales.findIndex((prof: any) => prof.medicoId === Number(profesionalId))
        if (indice > -1) {
            arrayProfesionales[indice].activo = false
            console.clear()
            console.table(arrayProfesionales[indice])
            res.status(204)
                .json({})
        } else {
            res.status(404)
                .json({success: false, message: 'No existe un profesional con ese id'})
        }
    } catch (error) {
        res.status(400)
            .json({success: false, message: (error as Error).message})
    }
})
//Endpoint general
app.use((req: Request, res: Response) => {
    try {
        res.status(404).json({
            success: false,
            message: 'Endpoint no encontrado',
            ruta: req.originalUrl,
            metodo: req.method
        })
    } catch (error) {
        res.status(500)
            .json({success: false, message: 'Error interno del servidor'})
    }
})
//Servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`)
})