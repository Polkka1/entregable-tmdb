import { useEffect, useState } from 'react';

/** Devuelve `valor` solo cuando deja de cambiar durante `esperaMs`. Evita una petición por tecla. */
export function useDebounce<T>(valor: T, esperaMs: number): T {
  const [valorEstable, setValorEstable] = useState(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => setValorEstable(valor), esperaMs);
    return () => clearTimeout(temporizador);
  }, [valor, esperaMs]);

  return valorEstable;
}
