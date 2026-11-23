import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { MovimientoDTO, TipoMovimiento } from '../../api/tipos';
import { useAviso } from '../../components/Aviso';
import { FormularioMovimiento } from './FormularioMovimiento';

interface Contexto {
  /** Opens the form: empty to register, with a movement to edit (HU-06 to HU-08). */
  abrir(movimiento?: MovimientoDTO | null, tipo?: TipoMovimiento): void;
  /** Increases after every save, so open pages reload their data. */
  version: number;
  avisarCambio(): void;
}

const Ctx = createContext<Contexto>({ abrir: () => {}, version: 0, avisarCambio: () => {} });

export function MovimientosProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<{ abierto: boolean; movimiento?: MovimientoDTO | null; tipo?: TipoMovimiento }>({ abierto: false });
  const [version, setVersion] = useState(0);
  const aviso = useAviso();
  const abrir = useCallback((movimiento?: MovimientoDTO | null, tipo?: TipoMovimiento) => setEstado({ abierto: true, movimiento, tipo }), []);
  const avisarCambio = useCallback(() => setVersion((v) => v + 1), []);
  const valor = useMemo(() => ({ abrir, version, avisarCambio }), [abrir, version, avisarCambio]);
  return (
    <Ctx.Provider value={valor}>
      {children}
      {estado.abierto && (
        <FormularioMovimiento
          movimiento={estado.movimiento}
          tipoInicial={estado.tipo}
          onCerrar={() => setEstado({ abierto: false })}
          onGuardado={() => {
            aviso(estado.movimiento ? 'Movimiento actualizado' : 'Movimiento registrado');
            setEstado({ abierto: false });
            avisarCambio();
          }}
        />
      )}
    </Ctx.Provider>
  );
}

export const useMovimientos = () => useContext(Ctx);
