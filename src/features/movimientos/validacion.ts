import type { TipoMovimiento } from '../../api/tipos';

export const PATRON_MONTO = /^\d{1,12}([.,]\d{1,2})?$/;

/** Normalizes "1.234,50" style input is NOT supported on purpose: only digits with an optional "." or "," decimal. */
export function normalizarMonto(texto: string): string {
  return texto.trim().replace(',', '.');
}

export interface DatosMovimiento {
  tipo: TipoMovimiento;
  monto: string;
  fecha: string;
  idCategoria: string;
  descripcion: string;
}

/** HU-06 criterion 2 (RN-01, RN-02): checked in the browser before calling the API. */
export function validarMovimiento(d: DatosMovimiento, hoy: string): Record<string, string> {
  const errores: Record<string, string> = {};
  const monto = d.monto.trim();
  if (!PATRON_MONTO.test(monto) || Number(normalizarMonto(monto)) <= 0) {
    errores.monto = 'Ingresa un monto mayor que 0 con máximo 2 decimales';
  }
  if (!d.fecha) {
    errores.fecha = 'La fecha es obligatoria';
  } else if (d.fecha > sumarDias(hoy, 1)) {
    errores.fecha = 'La fecha no puede ser futura';
  }
  if (!d.idCategoria) errores.idCategoria = 'Elige una categoría';
  if (d.descripcion.length > 140) errores.descripcion = 'Máximo 140 caracteres';
  return errores;
}

export function validarRegistro(nombre: string, correo: string, clave: string): Record<string, string> {
  const errores: Record<string, string> = {};
  const n = nombre.trim();
  if (n.length < 2 || n.length > 80) errores.nombre = 'El nombre debe tener entre 2 y 80 caracteres';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(correo.trim())) errores.correo = 'Ingresa un correo válido';
  if (clave.length < 10) errores.clave = 'La contraseña debe tener al menos 10 caracteres';
  return errores;
}

export function sumarDias(iso: string, dias: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}
