import type { Request, Response } from 'express'
import { arrayProfesionales, arrayEspecialidades } from '../resources.ts'
import type { Profesional } from '../resources.ts'

export class ProfesionalesController {
    static statusCode = 200
    //Listado completo de profesionales
    static getAll = async (req: Request, res: Response) => {
        this.statusCode = 200
        try {
            const profesionalesFiltrados: [] = arrayProfesionales.filter((prof: any) => prof.activo === true)
            return res.status(this.statusCode)
                .json({success: true, data: profesionalesFiltrados})
        } catch (error: any) {
            if (this.statusCode < 400) this.statusCode = 400
            return res.status(this.statusCode)
                .json({success: false, message: error.message})
        }
    }

    //Profesional segun su medicoId
    static findById = async (req: Request, res: Response) => {
        this.statusCode = 200
        try {
            const profesionalId: number = Number(req.params.id)
            if (Number.isNaN(profesionalId)) {
                this.statusCode = 400
                throw new Error('El id del profesional debe ser un número')
            }
            const profesionalSeleccionado = arrayProfesionales.find((prof: any) => prof.medicoId === profesionalId)
            if (profesionalSeleccionado) {

                return res.status(this.statusCode)
                    .json({success: true, data: profesionalSeleccionado})
            } else {
                this.statusCode = 404
                throw new Error('No existe un profesional con ese id')
            }
        } catch (error: any) {
            if (this.statusCode < 400) this.statusCode = 400
            return res.status(this.statusCode)
                .json({success: false, message: error.message})
        }
    }

    //Alta de un nuevo profesional
    static create = async (req: Request, res: Response) => {
        this.statusCode = 201
        try {
            const { nombre, especialidad, activo } = req.body

            if (!nombre || typeof nombre !== 'string') {
                this.statusCode = 400
                throw new Error('El campo nombre es obligatorio')
            }

            const especialidadExistente = arrayEspecialidades.find((esp: any) => esp.nombreEspecialidad === especialidad)
            if (!especialidadExistente) {
                this.statusCode = 400
                throw new Error('La especialidad ingresada no existe')
            }

            const nuevoProfesional: Profesional = {
                medicoId: arrayProfesionales.length + 1,
                nombre: nombre,
                especialidad: especialidad,
                activo: Boolean(activo)
            }
            arrayProfesionales.push(nuevoProfesional)
            return res.status(this.statusCode)
                .json({success: true, data: nuevoProfesional})
        } catch (error: any) {
            if (this.statusCode < 400) this.statusCode = 400
            return res.status(this.statusCode)
                .json({success: false, message: error.message})
        }
    }

    //Modificacion completa de un profesional
    static modify = async (req: Request, res: Response) => {
        this.statusCode = 200
        try {
            const profesionalId: number = Number(req.params.id)
            if (Number.isNaN(profesionalId)) {
                this.statusCode = 400
                throw new Error('El id del profesional debe ser un número')
            }
            const { nombre, especialidad, activo } = req.body
            const indice = arrayProfesionales.findIndex((prof: any) => prof.medicoId === profesionalId)
            if (indice > -1) {
                arrayProfesionales[indice].nombre = nombre
                arrayProfesionales[indice].especialidad = especialidad
                arrayProfesionales[indice].activo = Boolean(activo)

                return res.status(this.statusCode)
                    .json({success: true, data: arrayProfesionales[indice]})
            } else {
                this.statusCode = 404
                throw new Error('No existe un profesional con ese id')
            }
        } catch (error: any) {
            if (this.statusCode < 400) this.statusCode = 400
            return res.status(this.statusCode)
                .json({success: false, message: error.message})
        }
    }

    //Borrado logico de un profesional
    static delete = async (req: Request, res: Response) => {
        this.statusCode = 204
        try {
            const profesionalId: number = Number(req.params.id)
            if (Number.isNaN(profesionalId)) {
                this.statusCode = 400
                throw new Error('El id del profesional debe ser un número')
            }
            const indice = arrayProfesionales.findIndex((prof: any) => prof.medicoId === profesionalId)
            if (indice > -1) {
                arrayProfesionales[indice].activo = false

                return res.status(this.statusCode)
                    .json({})
            } else {
                this.statusCode = 404
                throw new Error('No existe un profesional con ese id')
            }
        } catch (error: any) {
            if (this.statusCode < 400) this.statusCode = 400
            return res.status(this.statusCode)
                .json({success: false, message: error.message})
        }
    }
}