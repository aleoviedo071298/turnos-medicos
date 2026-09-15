import type { Request, Response } from 'express'

//Endpoints
//Hello world
export class GeneralController {
    static statusCode = 200

    static helloWorld = async (req: Request, res: Response)=> {
        this.statusCode = 200
        try {
            return res.status(this.statusCode)
                .json({success: true, message: 'Bienvenidos al servidor web de MedTurnos'})
        } catch (error: any) {
            if (this.statusCode < 400) this.statusCode = 500
            return res.status(this.statusCode)
                .json({success: false, message: error.message})
        }
    }

    //Endpoint general
    static notFound = async (req: Request, res: Response) => {
        this.statusCode = 404
        try {
            return res.status(this.statusCode).json({
                success: false,
                message: 'Endpoint no encontrado',
                ruta: req.originalUrl,
                metodo: req.method
            })
        } catch (error: any) {
            if (this.statusCode < 400) this.statusCode = 500
            return res.status(this.statusCode)
                .json({success: false, message: error.message})
        }
    }
}
