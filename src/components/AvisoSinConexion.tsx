import { avisoSinConexion } from '../utils/textosResumen';
import { Aviso } from './Aviso';

/** Aviso de RF8 y D13: lo que se ve es la última copia guardada en el dispositivo. */
export function AvisoSinConexion({ sinFecha = 0 }: { sinFecha?: number }) {
  return <Aviso tipo="sinConexion" texto={avisoSinConexion(sinFecha)} />;
}
