import { Icono } from './Iconos';
import { formatoMoneda } from './formato';
import { useConteo } from './useConteo';

interface Props {
  titulo: string;
  valor: number;
  icono: string;
  tono: 'verde' | 'rojo' | 'azul';
  /** % change vs the previous period; for expenses a rise is shown in red. */
  variacion?: number | null;
  subeEsMalo?: boolean;
  destacado?: boolean;
  className?: string;
  texto?: string;
  /** While the data loads a placeholder is shown instead of a misleading "$ 0". */
  cargando?: boolean;
}

/** KPI card of the mockups ("Balance actual", "Total ingresos", "Total gastos"). */
export function Indicador({ titulo, valor, icono, tono, variacion, subeEsMalo, destacado, className = '', texto, cargando }: Props) {
  const animado = useConteo(cargando ? 0 : valor);
  const hayVariacion = variacion !== undefined && variacion !== null;
  const sube = hayVariacion && variacion! > 0;
  const clase = !hayVariacion || variacion === 0 ? 'neutra' : sube !== !!subeEsMalo ? 'sube' : 'baja';
  return (
    <div className={`tarjeta indicador ${destacado ? 'destacado' : ''} ${className}`}>
      <span className={`indicador-icono ${tono}`}><Icono nombre={icono} tamano={24} /></span>
      <div className="indicador-texto">
        <span>{titulo}</span>
        {cargando
          ? <span className="esqueleto" style={{ display: 'block', width: 110, height: 24, marginTop: 4 }} aria-label="Cargando" />
          : <strong aria-label={texto ?? `${formatoMoneda(valor)} COP`}>{texto ?? formatoMoneda(Math.round(animado))}{!texto && <small>COP</small>}</strong>}
        {hayVariacion && (
          <span className={`variacion ${clase}`} title="Frente al periodo anterior de la misma duración">
            <Icono nombre={sube ? 'arriba' : 'abajo'} tamano={12} />
            {Math.abs(variacion!).toLocaleString('es-CO')} %
          </span>
        )}
      </div>
    </div>
  );
}
