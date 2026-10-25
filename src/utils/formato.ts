/** '2008-07-16' → '2008'; '' si no hay fecha. */
export function extraerAnio(fecha: string | undefined): string {
  return fecha && fecha.length >= 4 ? fecha.slice(0, 4) : '';
}

/** 139 → '2 h 19 min' */
export function formatearDuracion(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (horas === 0) return `${resto} min`;
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}

/** 12345 → '12,3 mil' */
export function formatearVotos(votos: number): string {
  if (votos < 1000) return String(votos);
  return `${(votos / 1000).toFixed(1).replace('.', ',')} mil`;
}
