import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Icono } from './Iconos';

export type TipoAviso = 'exito' | 'error' | 'info';
interface Aviso { id: number; mensaje: string; tipo: TipoAviso }

const Contexto = createContext<(mensaje: string, tipo?: TipoAviso) => void>(() => {});

/** Toasts ("Datos actualizados", "Contraseña actualizada"...). */
export function AvisoProvider({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const mostrar = useCallback((mensaje: string, tipo: TipoAviso = 'exito') => {
    const id = Date.now() + Math.random();
    setAvisos((a) => [...a, { id, mensaje, tipo }]);
    setTimeout(() => setAvisos((a) => a.filter((x) => x.id !== id)), tipo === 'error' ? 7000 : 5000);
  }, []);
  return (
    <Contexto.Provider value={mostrar}>
      {children}
      <div className="avisos">
        {avisos.map((a) => (
          <div key={a.id} className={`aviso aviso-${a.tipo}`} role={a.tipo === 'error' ? 'alert' : 'status'} aria-atomic="true">
            <Icono nombre={a.tipo === 'error' ? 'alerta' : a.tipo === 'info' ? 'info' : 'check'} />{a.mensaje}
          </div>
        ))}
      </div>
    </Contexto.Provider>
  );
}

export const useAviso = () => useContext(Contexto);
