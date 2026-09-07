import { configuracionAgenda, arrayProfesionales, arrayEspecialidades } from './resources.ts'

console.clear()
console.log('Configuración de la agenda:')
console.table(configuracionAgenda)
console.log('Profesionales:')
console.table(arrayProfesionales)
console.log('Especialidades:')
console.table(arrayEspecialidades)