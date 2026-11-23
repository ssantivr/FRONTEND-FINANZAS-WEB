import { PERIODOS, type ClavePeriodo } from './formato';
import { Icono } from './Iconos';

/** "Este mes / Últimos 30 días / ..." selector with a calendar icon (mockups HU-16, HU-18, HU-19). */
export function SelectorPeriodo({ valor, onCambio }: { valor: ClavePeriodo; onCambio(c: ClavePeriodo): void }) {
  return (
    <div className="control" style={{ minWidth: 200, maxWidth: 230, flex: 'none' }}>
      <Icono nombre="calendario" />
      <select value={valor} onChange={(e) => onCambio(e.target.value as ClavePeriodo)} aria-label="Periodo">
        {PERIODOS.map((p) => <option key={p.clave} value={p.clave}>{p.texto}</option>)}
      </select>
      <Icono nombre="chevron" tamano={18} className="control-select-chevron" />
    </div>
  );
}
