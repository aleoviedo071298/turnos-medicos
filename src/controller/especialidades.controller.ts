import type { Request, Response } from "express"
import { arrayEspecialidades } from "../resources.ts"
import type { Especialidad } from "../resources.ts"

//Listado completo de especialidades
export class EspecialidadesController {
    static statusCode = 200

    static getAll = async (req: Request, res: Response) => {
        this.statusCode = 200
        try {
            const especialidadesActivas = arrayEspecialidades.filter((esp: any) => esp.activa === true)
            if (!especialidadesActivas) {
                this.statusCode = 400
                throw new Error('No hay especialidades activas')
            }
            return res.status(this.statusCode)
                .json({success: true, data: especialidadesActivas})
        } catch (error: any) {
            if (this.statusCode < 400) this.statusCode = 400
            return res.status(this.statusCode)
                .json({success: false, message: error.message})
        }
    }

//Especialidad segun su especialidadId

    static findById = async (req: Request, res: Response) => {
        this.statusCode = 200
        try {
            const especialidadId: number = Number(req.params.id)
            if (Number.isNaN(especialidadId)) {
                this.statusCode = 400
                throw new Error('El id de la especialidad debe ser un número')
            }
            const especialidadSolicitada = arrayEspecialidades.find((esp: any) => esp.especialidadId === especialidadId)
            if (!especialidadSolicitada) {
                this.statusCode = 404
                throw new Error('No existe una especialidad con ese id')
            } else {
            return res.status(this.statusCode)
                .json({success: true, data: especialidadSolicitada})
            }
        } catch (error: any) {
            if (this.statusCode < 400) this.statusCode = 400
            return res.status(this.statusCode)
                .json({success: false, message: error.message})
        }
    }

//Alta de una nueva especialidad
    static create = async (req: Request, res: Response) => {
        this.statusCode = 201
        try {
            const { nombreEspecialidad, activa } = req.body

            if (!nombreEspecialidad || typeof nombreEspecialidad !== 'string') {
                this.statusCode = 400
                throw new Error('El campo nombreEspecialidad es obligatorio')
            }

            const nuevaEspecialidad: Especialidad = {
                especialidadId: arrayEspecialidades.length + 1,
                nombreEspecialidad: nombreEspecialidad,
                activa: Boolean(activa)
            }
            arrayEspecialidades.push(nuevaEspecialidad)

            return res.status(this.statusCode)
                .json({success: true, data: nuevaEspecialidad})
        } catch (error: any) {
            if (this.statusCode < 400) this.statusCode = 400
            return res.status(this.statusCode)
                .json({success: false, message: error.message})
        }
    }

    //Borrado logico de una especialidad
    static delete = async (req: Request, res: Response) => {
        this.statusCode = 204
        try {
            const especialidadId: number = Number(req.params.id)
            if (Number.isNaN(especialidadId)) {
                this.statusCode = 400
                throw new Error('El id de la especialidad debe ser un número')
            }
            const indice: number = arrayEspecialidades.findIndex((esp: any) => esp.especialidadId === especialidadId)
            if (indice > -1) {
                arrayEspecialidades[indice].activa = false
                return res.status(this.statusCode)
                    .json({})
            } else {
                this.statusCode = 404
                throw new Error('No existe una especialidad con ese id')
            }
        } catch (error: any) {
            if (this.statusCode < 400) this.statusCode = 400
            return res.status(this.statusCode)
                .json({success: false, message: error.message})
        }
    }
}
