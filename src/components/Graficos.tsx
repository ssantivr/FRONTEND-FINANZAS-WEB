import type { ReactNode } from 'react';
import { formatoCorto } from './formato';

export interface Segmento { clave: string; valor: number; color: string; etiqueta: string }

/** Donut chart; the center shows `children` (HU-19). */
export function Dona({ segmentos, children, tamano = 200, grosor = 26 }: {
  segmentos: Segmento[]; children?: ReactNode; tamano?: number; grosor?: number;
}) {
  const r = (tamano - grosor) / 2;
  const c = 2 * Math.PI * r;
  const total = segmentos.reduce((s, x) => s + x.valor, 0);
  let acumulado = 0;
  return (
    <div className="dona" style={{ width: tamano, height: tamano }}>
      <svg width={tamano} height={tamano} viewBox={`0 0 ${tamano} ${tamano}`} role="img"
        aria-label={segmentos.map((s) => `${s.etiqueta} ${Math.round((s.valor / (total || 1)) * 100)} %`).join(', ')}>
        <circle cx={tamano / 2} cy={tamano / 2} r={r} fill="none" style={{ stroke: 'var(--pista)' }} strokeWidth={grosor} />
        {total > 0 && segmentos.map((s) => {
          const largo = (s.valor / total) * c;
          // 2px gap between segments when there is more than one
          const visible = segmentos.length > 1 ? Math.max(0, largo - 2) : largo;
          const el = (
            <circle key={s.clave} cx={tamano / 2} cy={tamano / 2} r={r} fill="none" stroke={s.color} strokeWidth={grosor}
              strokeDasharray={`${visible} ${c - visible}`} strokeDashoffset={-acumulado}
              transform={`rotate(-90 ${tamano / 2} ${tamano / 2})`}>
              <title>{s.etiqueta}</title>
            </circle>
          );
          acumulado += largo;
          return el;
        })}
      </svg>
      <div className="dona-centro">{children}</div>
    </div>
  );
}

/** Progress ring used by the budgets overview. */
export function Anillo({ porcentaje, color = '#16a34a', tamano = 120, children }: {
  porcentaje: number; color?: string; tamano?: number; children?: ReactNode;
}) {
  const grosor = 12;
  const r = (tamano - grosor) / 2;
  const c = 2 * Math.PI * r;
  const lleno = (Math.min(100, Math.max(0, porcentaje)) / 100) * c;
  return (
    <div className="dona" style={{ width: tamano, height: tamano }}>
      <svg width={tamano} height={tamano} aria-hidden>
        <circle cx={tamano / 2} cy={tamano / 2} r={r} fill="none" style={{ stroke: 'var(--pista)' }} strokeWidth={grosor} />
        <circle cx={tamano / 2} cy={tamano / 2} r={r} fill="none" stroke={color} strokeWidth={grosor} strokeLinecap="round"
          strokeDasharray={`${lleno} ${c}`} transform={`rotate(-90 ${tamano / 2} ${tamano / 2})`} />
      </svg>
      <div className="dona-centro">{children}</div>
    </div>
  );
}

const ALTO = 190;
const ANCHO = 520;
const MARGEN = { izq: 46, der: 12, arr: 14, aba: 28 };

/** Round axis ticks (0, 1 M, 2 M...) with about four steps. */
function escala(maximo: number): number[] {
  if (maximo <= 0) return [0, 1];
  const bruto = maximo / 4;
  const base = 10 ** Math.floor(Math.log10(bruto));
  const paso = [1, 2, 2.5, 5, 10].map((f) => f * base).find((p) => p >= bruto)!;
  return Array.from({ length: Math.ceil(maximo / paso) + 1 }, (_, i) => i * paso);
}

/** Grouped bars, income vs expenses per week or month (mockup HU-18 "Resumen mensual"). */
export function BarrasDobles({ puntos }: { puntos: { etiqueta: string; ingresos: number; gastos: number }[] }) {
  const marcas = escala(Math.max(0, ...puntos.flatMap((p) => [p.ingresos, p.gastos])));
  const tope = marcas[marcas.length - 1];
  const alto = ALTO - MARGEN.arr - MARGEN.aba;
  const ancho = ANCHO - MARGEN.izq - MARGEN.der;
  const grupo = ancho / Math.max(1, puntos.length);
  const barra = Math.min(22, grupo / 3.2);
  const y = (v: number) => MARGEN.arr + alto - (v / tope) * alto;
  return (
    <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="grafico" role="img"
      aria-label={puntos.map((p) => `${p.etiqueta}: ingresos ${formatoCorto(p.ingresos)}, gastos ${formatoCorto(p.gastos)}`).join('; ')}>
      {marcas.map((m) => (
        <g key={m}>
          <line x1={MARGEN.izq} x2={ANCHO - MARGEN.der} y1={y(m)} y2={y(m)} className="grafico-guia" />
          <text x={MARGEN.izq - 8} y={y(m) + 4} textAnchor="end" className="grafico-texto">{formatoCorto(m)}</text>
        </g>
      ))}
      {puntos.map((p, i) => {
        const cx = MARGEN.izq + grupo * i + grupo / 2;
        return (
          <g key={p.etiqueta}>
            <rect x={cx - barra - 2} y={y(p.ingresos)} width={barra} height={Math.max(0, MARGEN.arr + alto - y(p.ingresos))} rx={4} className="barra-grafico" fill="#22c55e">
              <title>{`Ingresos ${p.etiqueta}: ${formatoCorto(p.ingresos)}`}</title>
            </rect>
            <rect x={cx + 2} y={y(p.gastos)} width={barra} height={Math.max(0, MARGEN.arr + alto - y(p.gastos))} rx={4} className="barra-grafico" fill="#3b82f6">
              <title>{`Gastos ${p.etiqueta}: ${formatoCorto(p.gastos)}`}</title>
            </rect>
            <text x={cx} y={ALTO - 8} textAnchor="middle" className="grafico-texto">{p.etiqueta}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** Area line with the last value highlighted (mockup HU-19 "Tendencia de gastos"). */
export function Linea({ puntos, color = '#16a34a' }: { puntos: { etiqueta: string; valor: number }[]; color?: string }) {
  const marcas = escala(Math.max(0, ...puntos.map((p) => p.valor)));
  const tope = marcas[marcas.length - 1];
  const alto = ALTO - MARGEN.arr - MARGEN.aba;
  const ancho = ANCHO - MARGEN.izq - MARGEN.der - 30;
  const x = (i: number) => MARGEN.izq + 15 + (puntos.length > 1 ? (i / (puntos.length - 1)) * ancho : ancho / 2);
  const y = (v: number) => MARGEN.arr + alto - (v / tope) * alto;
  const ruta = puntos.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.valor)}`).join(' ');
  const area = puntos.length ? `${ruta} L${x(puntos.length - 1)},${MARGEN.arr + alto} L${x(0)},${MARGEN.arr + alto} Z` : '';
  const ultimo = puntos[puntos.length - 1];
  return (
    <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="grafico" role="img"
      aria-label={puntos.map((p) => `${p.etiqueta}: ${formatoCorto(p.valor)}`).join('; ')}>
      <defs>
        <linearGradient id="linea-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity=".22" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {marcas.map((m) => (
        <g key={m}>
          <line x1={MARGEN.izq} x2={ANCHO - MARGEN.der} y1={y(m)} y2={y(m)} className="grafico-guia" />
          <text x={MARGEN.izq - 8} y={y(m) + 4} textAnchor="end" className="grafico-texto">{formatoCorto(m)}</text>
        </g>
      ))}
      <path d={area} fill="url(#linea-area)" />
      <path d={ruta} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
      {puntos.map((p, i) => (
        <g key={p.etiqueta}>
          <circle cx={x(i)} cy={y(p.valor)} r={i === puntos.length - 1 ? 6 : 4} fill={i === puntos.length - 1 ? 'var(--superficie)' : color}
            stroke={color} strokeWidth={2.5}><title>{`${p.etiqueta}: ${formatoCorto(p.valor)}`}</title></circle>
          <text x={x(i)} y={ALTO - 8} textAnchor="middle" className="grafico-texto">{p.etiqueta}</text>
        </g>
      ))}
      {ultimo && (
        <g>
          <rect x={x(puntos.length - 1) - 40} y={y(ultimo.valor) - 32} width={80} height={22} rx={6} className="grafico-burbuja" />
          <text x={x(puntos.length - 1)} y={y(ultimo.valor) - 17} textAnchor="middle" className="grafico-burbuja-texto">
            {formatoCorto(ultimo.valor, true)}
          </text>
        </g>
      )}
    </svg>
  );
}
