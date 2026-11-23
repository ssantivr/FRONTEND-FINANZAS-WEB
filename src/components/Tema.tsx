import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Icono } from './Iconos';

export type Tema = 'claro' | 'oscuro' | 'sistema';
const CLAVE = 'pulso-tema';
const consulta = () => window.matchMedia('(prefers-color-scheme: dark)');

function leer(): Tema {
  try {
    const v = localStorage.getItem(CLAVE);
    return v === 'claro' || v === 'oscuro' ? v : 'sistema';
  } catch {
    return 'sistema';   // storage blocked (private mode): follow the system
  }
}

/** Sets data-theme on <html>; "sistema" removes it so the CSS media query decides. */
export function aplicarTema(tema: Tema) {
  const raiz = document.documentElement;
  if (tema === 'sistema') delete raiz.dataset.theme;
  else raiz.dataset.theme = tema === 'oscuro' ? 'dark' : 'light';
}

interface Ctx { tema: Tema; oscuro: boolean; cambiar(t: Tema): void }
const Contexto = createContext<Ctx>({ tema: 'sistema', oscuro: false, cambiar: () => {} });

export function TemaProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(leer);
  const [sistemaOscuro, setSistemaOscuro] = useState(() => consulta().matches);

  useEffect(() => {
    const mq = consulta();
    const cambio = (e: MediaQueryListEvent) => setSistemaOscuro(e.matches);
    mq.addEventListener('change', cambio);
    return () => mq.removeEventListener('change', cambio);
  }, []);
  useEffect(() => aplicarTema(tema), [tema]);

  const cambiar = useCallback((t: Tema) => {
    setTema(t);
    try {
      if (t === 'sistema') localStorage.removeItem(CLAVE);
      else localStorage.setItem(CLAVE, t);
    } catch { /* the choice still applies for this visit */ }
  }, []);

  const oscuro = tema === 'oscuro' || (tema === 'sistema' && sistemaOscuro);
  const valor = useMemo(() => ({ tema, oscuro, cambiar }), [tema, oscuro, cambiar]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export const useTema = () => useContext(Contexto);

/** Sun / moon button for the header and the sign-in screens. */
export function BotonTema({ className = '' }: { className?: string }) {
  const { oscuro, cambiar } = useTema();
  const texto = oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
  return (
    <button type="button" className={`boton-icono boton-tema ${className}`} onClick={() => cambiar(oscuro ? 'claro' : 'oscuro')}
      aria-label={texto} title={texto}>
      <Icono nombre={oscuro ? 'sol' : 'luna'} tamano={20} />
    </button>
  );
}

/** Light / dark / system choice for the account page. */
export function SelectorTema() {
  const { tema, cambiar } = useTema();
  const opciones: [Tema, string, string][] = [['claro', 'Claro', 'sol'], ['oscuro', 'Oscuro', 'luna'], ['sistema', 'Sistema', 'monitor']];
  return (
    <div className="segmentos" role="radiogroup" aria-label="Apariencia">
      {opciones.map(([v, txt, ic]) => (
        <button key={v} type="button" role="radio" aria-checked={tema === v} onClick={() => cambiar(v)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icono nombre={ic} tamano={16} />{txt}
        </button>
      ))}
    </div>
  );
}
