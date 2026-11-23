const monedaEntera = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const monedaDecimal = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fechaLarga = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

/** Whole pesos without decimals; otherwise always two ("$ 45.000,50", never "$ 45.000,5"). */
export const formatoMoneda = (valor: number): string =>
  (Number.isInteger(valor) ? monedaEntera : monedaDecimal).format(valor);
export const formatoFecha = (iso: string): string => fechaLarga.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));

/** Local date as yyyy-MM-dd (not UTC, so late-evening entries keep today's date). */
export function hoyIso(base = new Date()): string {
  const d = new Date(base.getTime() - base.getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 10);
}

export function mesActual(base = new Date()): string {
  return hoyIso(base).slice(0, 7);
}

export function rangoDelMes(periodo: string): { desde: string; hasta: string } {
  const [a, m] = periodo.split('-').map(Number);
  const ultimo = new Date(Date.UTC(a, m, 0)).getUTCDate();
  return { desde: `${periodo}-01`, hasta: `${periodo}-${String(ultimo).padStart(2, '0')}` };
}

/** Axis labels: "$ 1,2 M", "$ 500 k"; with `completo` the full amount (chart bubble). */
export function formatoCorto(valor: number, completo = false): string {
  if (completo) return formatoMoneda(valor);
  const a = Math.abs(valor);
  if (a >= 1_000_000) return `$ ${(valor / 1_000_000).toLocaleString('es-CO', { maximumFractionDigits: 1 })} M`;
  if (a >= 1_000) return `$ ${Math.round(valor / 1_000)} k`;
  return `$ ${Math.round(valor)}`;
}

const mesLargo = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric', timeZone: 'UTC' });
/** "2026-11" -> "Noviembre 2026". */
export function nombreMes(periodo: string): string {
  const t = mesLargo.format(new Date(`${periodo}-01T00:00:00Z`)).replace(' de ', ' ');
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export type ClavePeriodo = 'mes' | 'mes-anterior' | '30-dias' | '3-meses' | 'anio';
export const PERIODOS: { clave: ClavePeriodo; texto: string }[] = [
  { clave: 'mes', texto: 'Este mes' },
  { clave: 'mes-anterior', texto: 'Mes anterior' },
  { clave: '30-dias', texto: 'Últimos 30 días' },
  { clave: '3-meses', texto: 'Últimos 3 meses' },
  { clave: 'anio', texto: 'Este año' },
];

/** Range of each period option; always within the 24-month limit of the API (RF-21). */
export function rangoPeriodo(clave: ClavePeriodo, base = new Date()): { desde: string; hasta: string } {
  const hoy = hoyIso(base);
  const mes = hoy.slice(0, 7);
  const restarMeses = (p: string, n: number) => {
    const [a, m] = p.split('-').map(Number);
    const d = new Date(Date.UTC(a, m - 1 - n, 1));
    return d.toISOString().slice(0, 7);
  };
  switch (clave) {
    case 'mes': return rangoDelMes(mes);
    case 'mes-anterior': return rangoDelMes(restarMeses(mes, 1));
    case '30-dias': {
      const d = new Date(`${hoy}T00:00:00Z`);
      d.setUTCDate(d.getUTCDate() - 29);
      return { desde: d.toISOString().slice(0, 10), hasta: hoy };
    }
    case '3-meses': return { desde: `${restarMeses(mes, 2)}-01`, hasta: rangoDelMes(mes).hasta };
    case 'anio': return { desde: `${hoy.slice(0, 4)}-01-01`, hasta: `${hoy.slice(0, 4)}-12-31` };
  }
}

/** Colors that contrast with white for categories without one (data from older API versions). */
export const PALETA = ['#14b8a6', '#f59e0b', '#6366f1', '#e11d48', '#0ea5e9', '#a855f7', '#10b981', '#f97316', '#64748b', '#ec4899'];

/** "49,4 %" (Colombian decimal comma, at most one decimal). */
export const formatoPorcentaje = (valor: number): string => `${valor.toLocaleString('es-CO', { maximumFractionDigits: 1 })} %`;
