import { describe, expect, it } from 'vitest';
import { formatoCorto, formatoMoneda, nombreMes, rangoDelMes, rangoPeriodo } from './formato';

// Intl uses a non-breaking space between "$" and the amount; compare with plain spaces.
const plano = (t: string) => t.replace(/\s/g, ' ');

describe('formatoMoneda', () => {
  it('shows whole pesos without decimals', () => {
    expect(plano(formatoMoneda(2418500))).toBe('$ 2.418.500');
  });
  it('always shows two decimals when there are cents', () => {
    expect(plano(formatoMoneda(45000.5))).toBe('$ 45.000,50');
  });
});

describe('formatoCorto (chart axis)', () => {
  it('uses millions and thousands', () => {
    expect(plano(formatoCorto(1_250_000))).toBe('$ 1,3 M');
    expect(plano(formatoCorto(500_000))).toBe('$ 500 k');
    expect(plano(formatoCorto(80))).toBe('$ 80');
  });
});

describe('months', () => {
  it('names the month with a capital letter', () => {
    expect(nombreMes('2026-11')).toBe('Noviembre 2026');
  });
  it('knows the last day of each month, leap years included', () => {
    expect(rangoDelMes('2028-02')).toEqual({ desde: '2028-02-01', hasta: '2028-02-29' });
    expect(rangoDelMes('2026-02')).toEqual({ desde: '2026-02-01', hasta: '2026-02-28' });
  });
});

describe('rangoPeriodo', () => {
  const base = new Date(2026, 0, 15, 12);   // 15 Jan 2026, local noon

  it('"previous month" in January is December of the previous year', () => {
    expect(rangoPeriodo('mes-anterior', base)).toEqual({ desde: '2025-12-01', hasta: '2025-12-31' });
  });
  it('"last 30 days" includes today', () => {
    expect(rangoPeriodo('30-dias', base)).toEqual({ desde: '2025-12-17', hasta: '2026-01-15' });
  });
  it('"last 3 months" spans the current month and the two before', () => {
    expect(rangoPeriodo('3-meses', base)).toEqual({ desde: '2025-11-01', hasta: '2026-01-31' });
  });
  it('"this year" covers the whole calendar year', () => {
    expect(rangoPeriodo('anio', base)).toEqual({ desde: '2026-01-01', hasta: '2026-12-31' });
  });
});
