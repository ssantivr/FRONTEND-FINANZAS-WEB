import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthApi } from '../../api/AuthApi';
import { CuentaApi } from '../../api/CuentaApi';
import { cuandoExpireLaSesion } from '../../api/ClienteHttp';
import type { RegistroCmd, UsuarioDTO } from '../../api/tipos';

interface SesionStore {
  usuario: UsuarioDTO | null;
  cargando: boolean;
  registrar(datos: RegistroCmd): Promise<void>;
  iniciarSesion(correo: string, clave: string): Promise<void>;
  cerrarSesion(): Promise<void>;
  actualizarUsuario(usuario: UsuarioDTO | null): void;
}

const Contexto = createContext<SesionStore | null>(null);

export function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioDTO | null>(null);
  const [cargando, setCargando] = useState(true);

  // On load: restore the session with the HttpOnly refresh cookie (HU-03).
  useEffect(() => {
    cuandoExpireLaSesion(() => setUsuario(null));
    AuthApi.renovar()
      .then(async (ok) => (ok ? setUsuario(await CuentaApi.obtener()) : undefined))
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false));
  }, []);

  const registrar = useCallback(async (datos: RegistroCmd) => {
    await AuthApi.registrar(datos);
    setUsuario(await CuentaApi.obtener());
  }, []);
  const iniciarSesion = useCallback(async (correo: string, clave: string) => {
    await AuthApi.iniciarSesion(correo, clave);
    setUsuario(await CuentaApi.obtener());
  }, []);
  const cerrarSesion = useCallback(async () => {
    try {
      await AuthApi.cerrarSesion();
    } finally {
      setUsuario(null);
    }
  }, []);

  const valor = useMemo(
    () => ({ usuario, cargando, registrar, iniciarSesion, cerrarSesion, actualizarUsuario: setUsuario }),
    [usuario, cargando, registrar, iniciarSesion, cerrarSesion],
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSesion(): SesionStore {
  const s = useContext(Contexto);
  if (!s) throw new Error('useSesion fuera de SesionProvider');
  return s;
}
