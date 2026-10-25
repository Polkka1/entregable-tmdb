import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as authService from '../services/authService';
import type { Usuario } from '../types/usuario';

// Estado global de la sesión (Firebase Auth). La navegación decide qué mostrar según `usuario`.

interface SesionContextValor {
  usuario: Usuario | null;
  /** true mientras Firebase recupera la sesión guardada al abrir la app */
  verificando: boolean;
  iniciarSesion: (email: string, password: string) => Promise<void>;
  registrarse: (email: string, password: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

const SesionContext = createContext<SesionContextValor | null>(null);

export function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(
    () =>
      authService.observarSesion((u) => {
        setUsuario(u);
        setVerificando(false);
      }),
    [],
  );

  const valor = useMemo(
    () => ({
      usuario,
      verificando,
      iniciarSesion: authService.iniciarSesion,
      registrarse: authService.registrarse,
      cerrarSesion: authService.cerrarSesion,
    }),
    [usuario, verificando],
  );

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}

export function useSesion(): SesionContextValor {
  const contexto = useContext(SesionContext);
  if (!contexto) throw new Error('useSesion debe usarse dentro de <SesionProvider>');
  return contexto;
}
