import { describe, expect, it } from 'vitest';
import { normalizarMonto, sumarDias, validarMovimiento, validarRegistro } from './validacion';
import { rangoDelMes } from '../../components/formato';

const base = { tipo: 'GASTO' as const, monto: '10', fecha: '2026-11-17', idCategoria: 'c', descripcion: '' };

describe('validarMovimiento', () => {
  it('acepta un gasto válido', () => {
    expect(validarMovimiento(base, '2026-11-17')).toEqual({});
  });
  it('rechaza monto 0, negativo o con más de 2 decimales (HU-06)', () => {
    for (const monto of ['0', '-5', '1.234', 'abc', '']) {
      expect(validarMovimiento({ ...base, monto }, '2026-11-17').monto).toBeDefined();
    }
    expect(validarMovimiento({ ...base, monto: '12,50' }, '2026-11-17')).toEqual({});
  });
  it('admite mañana por zona horaria pero no pasado mañana (RN-02)', () => {
    expect(validarMovimiento({ ...base, fecha: '2026-11-18' }, '2026-11-17').fecha).toBeUndefined();
    expect(validarMovimiento({ ...base, fecha: '2026-11-19' }, '2026-11-17').fecha).toBeDefined();
  });
  it('exige categoría y limita la descripción', () => {
    const e = validarMovimiento({ ...base, idCategoria: '', descripcion: 'x'.repeat(141) }, '2026-11-17');
    expect(Object.keys(e).sort()).toEqual(['descripcion', 'idCategoria']);
  });
});

describe('utilidades', () => {
  it('normaliza la coma decimal', () => expect(normalizarMonto(' 12,5 ')).toBe('12.5'));
  it('suma días cruzando el mes', () => expect(sumarDias('2026-11-30', 1)).toBe('2026-12-01'));
  it('calcula el rango del mes', () => expect(rangoDelMes('2028-02')).toEqual({ desde: '2028-02-01', hasta: '2028-02-29' }));
  it('valida el registro (HU-01)', () => {
    expect(validarRegistro('A', 'mal', 'corta')).toHaveProperty('clave');
    expect(validarRegistro('Ana', 'ana@correo.com', 'clave-segura-1')).toEqual({});
  });
});
