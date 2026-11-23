import { useEffect, type ReactNode } from 'react';
import { Marca } from '../../components/Marca';
import { Icono } from '../../components/Iconos';
import { BotonTema } from '../../components/Tema';

interface Props {
  /** Big two-line title; the second line is green ("Inicia" / "Sesión"). */
  hero: [string, string];
  textoHero: string;
  beneficios: { icono: string; texto: string }[];
  icono: string;
  titulo: string;
  subtitulo?: string;
  children: ReactNode;
}

/** Shared frame of the sign-in, sign-up and recovery screens (mockups HU-01, HU-02, HU-05). */
export function PantallaAcceso({ hero, textoHero, beneficios, icono, titulo, subtitulo, children }: Props) {
  // Otherwise the tab keeps the title of the last page seen before signing out.
  useEffect(() => { document.title = `${titulo} · PulsoFinance`; }, [titulo]);
  return (
    <div className="acceso">
      <section className="acceso-hero">
        <Marca lema />
        <div className="acceso-cuerpo">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h1>{hero[0]} <span>{hero[1]}</span></h1>
            <p>{textoHero}</p>
            <ul className="beneficios">
              {beneficios.map((b) => (
                <li key={b.texto}><span className="burbuja"><Icono nombre={b.icono} /></span>{b.texto}</li>
              ))}
            </ul>
          </div>
          <Ilustracion />
        </div>
      </section>
      <BotonTema className="tema-acceso" />
      <section className="acceso-panel">
        <div className="acceso-tarjeta">
          <div className="acceso-tarjeta-cabecera">
            <span className="icono-cabecera"><Icono nombre={icono} tamano={28} /></span>
            <h2>{titulo}</h2>
            {subtitulo && <span className="sutil">{subtitulo}</span>}
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}

/** Phone with a rising chart, coins and a shield. */
function Ilustracion() {
  return (
    <svg className="ilustracion ilustracion-grande" viewBox="0 0 260 260" aria-hidden>
      <defs>
        <linearGradient id="il-verde" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4ade80" /><stop offset="1" stopColor="#15803d" /></linearGradient>
        <linearGradient id="il-oro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fde68a" /><stop offset="1" stopColor="#f59e0b" /></linearGradient>
      </defs>
      <ellipse cx="130" cy="232" rx="110" ry="16" fill="#bbf7d0" opacity=".6" />
      <rect x="70" y="20" width="118" height="200" rx="20" fill="#13233f" />
      <rect x="77" y="28" width="104" height="184" rx="14" fill="#f0fdf4" />
      <rect x="92" y="150" width="14" height="40" rx="3" fill="url(#il-verde)" />
      <rect x="112" y="130" width="14" height="60" rx="3" fill="url(#il-verde)" />
      <rect x="132" y="112" width="14" height="78" rx="3" fill="url(#il-verde)" />
      <rect x="152" y="88" width="14" height="102" rx="3" fill="url(#il-verde)" />
      <path d="M90 128l26-22 20 12 32-38" fill="none" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M154 78h16v16" fill="none" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="92" y="44" width="54" height="8" rx="4" fill="#bbf7d0" />
      <rect x="92" y="58" width="36" height="6" rx="3" fill="#d1fae5" />
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx="52" cy={210 - i * 12} rx="28" ry="9" fill="url(#il-oro)" stroke="#d97706" strokeWidth="1.5" />
      ))}
      <circle cx="58" cy="150" r="26" fill="url(#il-oro)" stroke="#d97706" strokeWidth="2" />
      <text x="58" y="160" textAnchor="middle" fontSize="28" fontWeight="800" fill="#b45309" fontFamily="Arial">$</text>
      <path d="M210 120l-26 10v22c0 18 12 30 26 36 14-6 26-18 26-36v-22z" fill="url(#il-verde)" />
      <path d="M198 152l9 9 16-18" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
