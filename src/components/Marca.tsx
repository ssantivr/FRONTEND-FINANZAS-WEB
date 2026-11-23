/** PulsoFinance logo: rising bars with an arrow, as in the Word mockups. */
export function Logo({ tamano = 40 }: { tamano?: number }) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 48 48" aria-hidden>
      <defs>
        <linearGradient id="logo-verde" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#15803d" />
          <stop offset="1" stopColor="#4ade80" />
        </linearGradient>
      </defs>
      <rect x="5" y="30" width="7" height="13" rx="1.5" fill="url(#logo-verde)" />
      <rect x="15" y="24" width="7" height="19" rx="1.5" fill="url(#logo-verde)" />
      <rect x="25" y="18" width="7" height="25" rx="1.5" fill="url(#logo-verde)" />
      <rect x="35" y="11" width="7" height="32" rx="1.5" fill="url(#logo-verde)" />
      <path d="M4 25 16 15l7 5L38 6" fill="none" stroke="#16a34a" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M31 5h8v8" fill="none" stroke="#16a34a" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Marca({ apilada = false, lema = false }: { apilada?: boolean; lema?: boolean }) {
  return (
    <div className={`marca ${apilada ? 'marca-apilada' : ''}`}>
      <Logo tamano={apilada ? 46 : 38} />
      <div>
        <div className="marca-nombre">Pulso<span>Finance</span></div>
        {lema && <div className="marca-lema">Controla · Planifica · Crece</div>}
      </div>
    </div>
  );
}
