import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Icono } from './Iconos';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  etiqueta?: string;
  icono?: string;
  sufijo?: ReactNode;
  error?: string;
  ayuda?: ReactNode;
  valor: string;
  onCambio(v: string): void;
}

/** Text input with a leading icon, optional suffix ("COP"), error and help text; passwords get a show/hide eye. */
export function Campo({ etiqueta, icono, sufijo, error, ayuda, valor, onCambio, type = 'text', placeholder, ...resto }: Props) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const esClave = type === 'password';
  return (
    <div className="campo">
      {etiqueta && <label htmlFor={id}>{etiqueta}</label>}
      <div className={`control ${error ? 'error' : ''} ${resto.disabled ? 'deshabilitado' : ''}`}>
        {icono && <Icono nombre={icono} />}
        <input {...resto} id={id} type={esClave && visible ? 'text' : type} value={valor} placeholder={placeholder}
          aria-label={etiqueta ? undefined : placeholder} aria-invalid={!!error}
          aria-describedby={error ? `${id}-e` : ayuda ? `${id}-a` : undefined}
          onChange={(e) => onCambio(e.target.value)} />
        {sufijo && <span className="sufijo">{sufijo}</span>}
        {esClave && (
          <button type="button" className="control-boton" onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
            <Icono nombre={visible ? 'ojo' : 'ojoTachado'} tamano={18} />
          </button>
        )}
      </div>
      {error && <span className="error-campo" id={`${id}-e`}><Icono nombre="alerta" tamano={14} />{error}</span>}
      {!error && ayuda && <span className="ayuda" id={`${id}-a`}>{ayuda}</span>}
    </div>
  );
}

/** Native select styled like {@link Campo}. */
export function Seleccion({ etiqueta, icono, error, valor, onCambio, children, ariaLabel }: {
  etiqueta?: string; icono?: ReactNode; error?: string; valor: string; onCambio(v: string): void; children: ReactNode; ariaLabel?: string;
}) {
  const id = useId();
  return (
    <div className="campo">
      {etiqueta && <label htmlFor={id}>{etiqueta}</label>}
      <div className={`control ${error ? 'error' : ''}`}>
        {typeof icono === 'string' ? <Icono nombre={icono} /> : icono}
        <select id={id} value={valor} onChange={(e) => onCambio(e.target.value)} aria-label={etiqueta ? undefined : ariaLabel}
          aria-invalid={!!error} aria-describedby={error ? `${id}-e` : undefined}>{children}</select>
        <Icono nombre="chevron" tamano={18} className="control-select-chevron" />
      </div>
      {error && <span className="error-campo" id={`${id}-e`}><Icono nombre="alerta" tamano={14} />{error}</span>}
    </div>
  );
}
