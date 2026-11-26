// Textos de Mi año en cine (DESIGN.md §5). Los plurales se resuelven aquí, no en la pantalla.
import type { ItemLista } from '../types/lista';

export function contar(n: number, singular: string, plural: string): string {
  throw new Error(`Sin implementar: ${n} ${singular} ${plural}`);
}
export function textoHoras(horas: number): string {
  throw new Error(`Sin implementar: ${horas}`);
}
export function detalleTipos(peliculas: number, series: number): string {
  throw new Error(`Sin implementar: ${peliculas} ${series}`);
}
export function avisoSinDuracion(peliculas: number): string | null {
  throw new Error(`Sin implementar: ${peliculas}`);
}
export function avisoSinDatos(obras: number): string | null {
  throw new Error(`Sin implementar: ${obras}`);
}
export function avisoSinConexion(sinFecha: number): string {
  throw new Error(`Sin implementar: ${sinFecha}`);
}
export function tituloVacio(anio: number): string {
  throw new Error(`Sin implementar: ${anio}`);
}
export function textoProgreso(hechas: number, total: number): string {
  throw new Error(`Sin implementar: ${hechas} ${total}`);
}
export function nombreMes(mes: number): string {
  throw new Error(`Sin implementar: ${mes}`);
}
export function textoMesTop(mes: number, obras: number): string {
  throw new Error(`Sin implementar: ${mes} ${obras}`);
}
export function etiquetaBarra(mes: number, obras: number): string {
  throw new Error(`Sin implementar: ${mes} ${obras}`);
}
export function detalleDestacada(obra: Pick<ItemLista, 'tipo' | 'vistaEn'>): string {
  throw new Error(`Sin implementar: ${obra.tipo}`);
}
