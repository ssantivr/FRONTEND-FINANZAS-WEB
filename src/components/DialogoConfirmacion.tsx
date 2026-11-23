import { useId, useRef, type ReactNode } from 'react';
import { Icono } from './Iconos';
import { useTrampaFoco } from './useTrampaFoco';

interface Props {
  abierto: boolean;
  titulo: string;
  children?: ReactNode;
  textoConfirmar?: string;
  peligro?: boolean;
  ocupado?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function DialogoConfirmacion(props: Props) {
  return props.abierto ? <Dialogo {...props} /> : null;
}

function Dialogo({ titulo, children, textoConfirmar = 'Confirmar', peligro, ocupado, onConfirmar, onCancelar }: Props) {
  const caja = useRef<HTMLDivElement>(null);
  const id = useId();
  useTrampaFoco(caja, true, () => !ocupado && onCancelar());
  return (
    <div className="fondo-modal" onMouseDown={(e) => e.target === e.currentTarget && !ocupado && onCancelar()}>
      <div ref={caja} className="modal" role="alertdialog" aria-modal="true" aria-labelledby={`${id}-t`} aria-describedby={`${id}-c`}>
        {peligro && <div className="icono-peligro" aria-hidden><Icono nombre="alerta" tamano={26} /></div>}
        <h3 id={`${id}-t`}>{titulo}</h3>
        <div className="modal-cuerpo" id={`${id}-c`}>{children}</div>
        <div className="acciones">
          {/* Cancel gets the focus first: the safe choice for a destructive dialog */}
          <button autoFocus className="boton secundario" onClick={onCancelar} disabled={ocupado}>Cancelar</button>
          <button className={`boton ${peligro ? 'peligro' : ''}`} onClick={onConfirmar} disabled={ocupado}>
            {ocupado ? 'Procesando…' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
