import type { CSSProperties } from 'react';

/** Stroke icons drawn on a 24x24 grid (1.8px line, round caps). */
const TRAZOS: Record<string, string> = {
  inicio: 'M3 11.5 12 4l9 7.5M5.5 9.5V20h4.5v-6h4v6h4.5V9.5',
  movimientos: 'M7 4v16M7 4 3.5 7.5M7 4l3.5 3.5M17 20V4m0 16-3.5-3.5M17 20l3.5-3.5',
  categorias: 'M4 4h6.5v6.5H4zM13.5 4H20v6.5h-6.5zM4 13.5h6.5V20H4zM13.5 13.5H20V20h-6.5z',
  presupuestos: 'M12 3a9 9 0 1 0 9 9h-9zM15 3.5A9 9 0 0 1 20.5 9H15z',
  reportes: 'M4 20h16M7 16.5V11m5 5.5V6m5 10.5v-8',
  cuenta: 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM19.4 13.5l1.6 1.2-2 3.4-1.9-.7a7 7 0 0 1-2 1.2L14.8 21h-4l-.3-2.4a7 7 0 0 1-2-1.2l-1.9.7-2-3.4 1.6-1.2a7 7 0 0 1 0-3l-1.6-1.2 2-3.4 1.9.7a7 7 0 0 1 2-1.2L10.8 3h4l.3 2.4a7 7 0 0 1 2 1.2l1.9-.7 2 3.4-1.6 1.2a7 7 0 0 1 0 3z',
  salir: 'M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14M9.5 16.5 5 12l4.5-4.5M5 12h11',
  mas: 'M12 5v14M5 12h14',
  menu: 'M4 7h16M4 12h16M4 17h16',
  cerrar: 'M6 6l12 12M18 6 6 18',
  arriba: 'M12 19V5m0 0-6 6m6-6 6 6',
  abajo: 'M12 5v14m0 0-6-6m6 6 6-6',
  billetera: 'M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3M4 7.5V17a2 2 0 0 0 2 2h14V8H6.5A2.5 2.5 0 0 1 4 7.5zM16 13.5h.01',
  buscar: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm9 2-4-4',
  calendario: 'M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM4 10h16M8 3.5V7m8-3.5V7',
  ojo: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  ojoTachado: 'M3 3l18 18M10.6 6.1A9.6 9.6 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-2.6 3.4M6.4 7.4C3.9 9.1 2.5 12 2.5 12s3.5 6 9.5 6c1.5 0 2.9-.4 4.1-1M9.9 9.9a3 3 0 0 0 4.2 4.2',
  correo: 'M4 6h16v12H4zM4 7l8 6 8-6',
  candado: 'M6.5 10.5h11a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-7.5a1 1 0 0 1 1-1zM8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5',
  usuario: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20a7.5 7.5 0 0 1 15 0',
  usuarioMas: 'M10 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM3 20a7 7 0 0 1 11.5-5.4M18 14v6m-3-3h6',
  escudo: 'M12 3 5 6v5.5c0 4.4 3 7.8 7 9.5 4-1.7 7-5.1 7-9.5V6zM9 12l2 2 4-4',
  rayo: 'M13 3 5 13.5h6L10 21l8-10.5h-6z',
  grafica: 'M4 18l5-5.5 3.5 3L20 7m0 0h-5m5 0v5',
  editar: 'M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3zM14.5 7.5l3 3',
  eliminar: 'M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5m4-5.5v5.5',
  puntos: 'M12 5.5h.01M12 12h.01M12 18.5h.01',
  check: 'M5 12.5 10 17.5 19.5 7',
  alerta: 'M12 9v4.5m0 3.5h.01M10.3 4.3 2.6 17.6A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-2.9L13.7 4.3a2 2 0 0 0-3.4 0z',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-10v5.5m0-8.5h.01',
  objetivo: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-4.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zm0-3.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  bombilla: 'M9 18h6m-5 3h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z',
  chevron: 'm6 9 6 6 6-6',
  sol: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2.5v2m0 15v2M4.6 4.6l1.4 1.4m12 12 1.4 1.4M2.5 12h2m15 0h2M4.6 19.4 6 18M18 6l1.4-1.4',
  luna: 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z',
  monitor: 'M3.5 5h17v11h-17zM9 20h6m-3-4v4',
  izquierda: 'm15 18-6-6 6-6',
  derecha: 'm9 18 6-6-6-6',
  // category icons (CategoriaDTO.icono)
  cubiertos: 'M7 3v8a2 2 0 0 0 2 2v8M5 3v6m4-6v6M17 21V3c-2 1-3.5 4-3.5 8h3.5',
  bus: 'M6 17V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v11zM6 11h12M8 17v2.5m8-2.5v2.5M8.5 14h.01m7 0h.01',
  casa: 'M3.5 11 12 4l8.5 7M6 9v11h12V9M10 20v-5h4v5',
  corazon: 'M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z',
  libro: 'M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z',
  estrella: 'm12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z',
  camisa: 'M9 4 4 6.5l1.5 4L8 9.5V20h8V9.5l2.5 1 1.5-4L15 4c0 1.5-1.3 2.5-3 2.5S9 5.5 9 4z',
  maletin: 'M4 8h16v11H4zM9 8V5.5h6V8M4 13h16',
  documento: 'M6 3h8l4 4v14H6zM14 3v4h4M9 12h6m-6 4h6',
  regalo: 'M4 9h16v4H4zM5.5 13H18.5v7h-13zM12 9v11M12 9S10.5 4 8 5.5 10 9 12 9zm0 0s1.5-5 4-3.5S14 9 12 9z',
  etiqueta: 'M3.5 12.5V4h8.5l8.5 8.5-8.5 8.5zM8 8.5h.01',
};

interface Props { nombre: string; tamano?: number; className?: string; style?: CSSProperties; titulo?: string }

export function Icono({ nombre, tamano = 20, className, style, titulo }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round" className={className} style={style}
      aria-hidden={titulo ? undefined : true} role={titulo ? 'img' : undefined}>
      {titulo && <title>{titulo}</title>}
      <path d={TRAZOS[nombre] ?? TRAZOS.etiqueta} />
    </svg>
  );
}

/** Round tinted badge with the category icon in the category color (mockups HU-10 to HU-19). */
export function IconoCategoria({ icono, color, tamano = 40 }: { icono?: string; color: string; tamano?: number }) {
  return (
    <span className="icono-categoria" style={{ width: tamano, height: tamano, color, background: `${color}1f` }}>
      <Icono nombre={icono ?? 'etiqueta'} tamano={Math.round(tamano * 0.5)} />
    </span>
  );
}
