import { AlmacenTokens } from './AlmacenTokens';
import type { SesionDTO } from './tipos';

const baseUrl = `${(import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')}/api/v1`;

/** API error with the Problem Details fields (RFC 9457). */
export class ErrorApi extends Error {
  constructor(public readonly estado: number, mensaje: string, public readonly codigo?: string) {
    super(mensaje);
  }
}

/** 'rechazada' = the server said the session is not valid; 'sin-conexion' = network or server error. */
export type ResultadoRenovacion = 'ok' | 'rechazada' | 'sin-conexion';
let renovacionEnCurso: Promise<ResultadoRenovacion> | null = null;
let alExpirarSesion: () => void = () => {};

export function cuandoExpireLaSesion(funcion: () => void): void {
  alExpirarSesion = funcion;
}

/** Sent on every call: the API requires it on the cookie endpoints (renovar, logout) as CSRF protection. */
const CABECERA_APP = { 'X-Requested-With': 'XMLHttpRequest' } as const;

/** One refresh at a time even if several requests get 401 together. */
export function renovarConResultado(): Promise<ResultadoRenovacion> {
  if (!renovacionEnCurso) {
    renovacionEnCurso = fetch(`${baseUrl}/auth/renovar`, { method: 'POST', credentials: 'include', headers: CABECERA_APP })
      .then(async (r): Promise<ResultadoRenovacion> => {
        if (r.status === 401 || r.status === 403) return 'rechazada';
        if (!r.ok) return 'sin-conexion';
        const s = (await r.json()) as SesionDTO;
        AlmacenTokens.guardar(s.accessToken);
        return 'ok';
      })
      .catch((): ResultadoRenovacion => 'sin-conexion')
      .finally(() => {
        renovacionEnCurso = null;
      });
  }
  return renovacionEnCurso;
}

export const renovarSesion = async (): Promise<boolean> => (await renovarConResultado()) === 'ok';

async function enviar<T>(metodo: string, ruta: string, cuerpo?: unknown, reintentar = true): Promise<T> {
  const cabeceras: Record<string, string> = { ...CABECERA_APP };
  if (cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json';
  const token = AlmacenTokens.obtener();
  if (token) cabeceras.Authorization = `Bearer ${token}`;

  let r: Response;
  try {
    r = await fetch(`${baseUrl}${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      credentials: 'include',
    });
  } catch {
    throw new ErrorApi(0, 'No hay conexión con el servidor. Intenta de nuevo.');
  }

  // HU-03: renew silently and repeat the request once.
  if (r.status === 401 && reintentar && !ruta.startsWith('/auth/')) {
    const resultado = await renovarConResultado();
    if (resultado === 'ok') return enviar<T>(metodo, ruta, cuerpo, false);
    if (resultado === 'sin-conexion') throw new ErrorApi(0, 'No hay conexión con el servidor. Intenta de nuevo.');
    AlmacenTokens.borrar();
    alExpirarSesion();
  }
  if (!r.ok) {
    let detalle = `Error ${r.status}`;
    let codigo: string | undefined;
    try {
      const p = (await r.json()) as { detail?: string; codigo?: string };
      detalle = p.detail ?? detalle;
      codigo = p.codigo;
    } catch {
      /* body without Problem Details */
    }
    throw new ErrorApi(r.status, detalle, codigo);
  }
  const texto = await r.text();
  return (texto ? JSON.parse(texto) : undefined) as T;
}

function consulta(parametros: Record<string, string | number | undefined>): string {
  const p = new URLSearchParams();
  Object.entries(parametros).forEach(([k, v]) => {
    if (v !== undefined && v !== '') p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : '';
}

export const ClienteHttp = {
  get: <T>(ruta: string, parametros: Record<string, string | number | undefined> = {}) =>
    enviar<T>('GET', ruta + consulta(parametros)),
  post: <T>(ruta: string, cuerpo?: unknown) => enviar<T>('POST', ruta, cuerpo ?? {}),
  put: <T>(ruta: string, cuerpo: unknown) => enviar<T>('PUT', ruta, cuerpo),
  patch: <T>(ruta: string, cuerpo: unknown) => enviar<T>('PATCH', ruta, cuerpo),
  delete: (ruta: string, parametros: Record<string, string | number | undefined> = {}) =>
    enviar<void>('DELETE', ruta + consulta(parametros)),
};
