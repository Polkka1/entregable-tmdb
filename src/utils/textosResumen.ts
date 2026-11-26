// Textos de Mi año en cine (DESIGN.md §5). Los plurales se resuelven aquí, no en la pantalla.
import { ETIQUETA_TIPO, type ItemLista } from '../types/lista';

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

export function contar(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

/** D7: horas con un decimal y coma decimal (37,5 h). */
export function textoHoras(horas: number): string {
  return `${horas.toFixed(1).replace('.', ',')} h`;
}

export function detalleTipos(peliculas: number, series: number): string {
  return `${contar(peliculas, 'película', 'películas')} · ${contar(series, 'serie', 'series')}`;
}

/** D7: aviso de películas sin duración, o null si no hay. */
export function avisoSinDuracion(peliculas: number): string | null {
  if (peliculas === 0) return null;
  return peliculas === 1
    ? '1 película sin duración no suma horas.'
    : `${peliculas} películas sin duración no suman horas.`;
}

/** D6: aviso de obras que quedaron sin datos de TMDB, o null si no hay. */
export function avisoSinDatos(obras: number): string | null {
  if (obras === 0) return null;
  return obras === 1
    ? '1 obra quedó sin datos de TMDB: cuenta en el total, pero no en horas, géneros ni directores.'
    : `${obras} obras quedaron sin datos de TMDB: cuentan en el total, pero no en horas, géneros ni directores.`;
}

/** D13 y PA-1: aviso sin conexión y cuántas obras vistas aún no tienen fecha. */
export function avisoSinConexion(sinFecha: number): string {
  const base = 'Sin conexión: estás viendo tu última copia guardada.';
  if (sinFecha === 0) return base;
  return sinFecha === 1
    ? `${base} 1 obra vista aún no tiene fecha y se sumará al reconectar.`
    : `${base} ${sinFecha} obras vistas aún no tienen fecha y se sumarán al reconectar.`;
}

/** D12 */
export function tituloVacio(anio: number): string {
  return `Aún no hay obras vistas en ${anio}.`;
}

/** D6 */
export function textoProgreso(hechas: number, total: number): string {
  return `${hechas} de ${contar(total, 'obra', 'obras')}`;
}

export function nombreMes(mes: number): string {
  return MESES[mes] ?? '';
}

/** D10: "Julio · 8 obras" */
export function textoMesTop(mes: number, obras: number): string {
  const nombre = nombreMes(mes);
  return `${nombre.charAt(0).toUpperCase()}${nombre.slice(1)} · ${contar(obras, 'obra', 'obras')}`;
}

/** D10: lo que anuncia el lector de pantalla en cada barra. */
export function etiquetaBarra(mes: number, obras: number): string {
  return `${nombreMes(mes)}: ${contar(obras, 'obra', 'obras')}`;
}

/** D11: "Película · vista el 12 de marzo", en la hora local del teléfono. */
export function detalleDestacada(obra: Pick<ItemLista, 'tipo' | 'vistaEn'>): string {
  const tipo = ETIQUETA_TIPO[obra.tipo];
  if (obra.vistaEn === null) return tipo;
  const fecha = new Date(obra.vistaEn);
  return `${tipo} · vista el ${fecha.getDate()} de ${nombreMes(fecha.getMonth())}`;
}
