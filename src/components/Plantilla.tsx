import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MenuUsuario } from './MenuUsuario';
import { Logo, Marca } from './Marca';
import { Icono } from './Iconos';
import { BotonTema } from './Tema';
import { useSesion } from '../features/auth/SesionStore';
import { MovimientosProvider, useMovimientos } from '../features/movimientos/ContextoMovimientos';

const SECCIONES = [
  { ruta: '/resumen', texto: 'Inicio', icono: 'inicio' },
  { ruta: '/movimientos', texto: 'Movimientos', icono: 'movimientos' },
  { ruta: '/categorias', texto: 'Categorías', icono: 'categorias' },
  { ruta: '/presupuestos', texto: 'Presupuestos', icono: 'presupuestos' },
  { ruta: '/reportes', texto: 'Reportes', icono: 'reportes' },
  { ruta: '/cuenta', texto: 'Configuración', icono: 'cuenta' },
];

const TITULOS: Record<string, [string, string]> = {
  '/resumen': ['Resumen financiero', 'Tu panorama financiero en un vistazo'],
  '/movimientos': ['Historial de movimientos', 'Consulta y gestiona el historial de tus finanzas'],
  '/categorias': ['Gestión de categorías', 'Administra tus categorías de movimientos'],
  '/presupuestos': ['Presupuestos del mes', 'Controla tus gastos y mantente en el plan'],
  '/reportes': ['Gasto por categoría', 'Analiza en qué gastas tu dinero'],
  '/cuenta': ['Configuración de la cuenta', 'Tus datos personales y la seguridad de tu cuenta'],
};

const CONSEJOS = [
  'Registra tus gastos el mismo día: así tus presupuestos y tu resumen siempre están al día.',
  'Define un presupuesto para tus 3 categorías con más gasto; la app te muestra una alerta al pasar el 80 %.',
  'Revisa Reportes cada fin de mes: la categoría más grande suele ser la más fácil de ajustar.',
  'Intenta ahorrar al menos el 10 % de lo que recibes; el Resumen te muestra tu porcentaje.',
  'Usa la búsqueda del historial para encontrar un pago por su descripción o su categoría.',
  'Crea categorías propias (Mascotas, Gimnasio…) para saber exactamente en qué se va tu dinero.',
];

/** A different tip each day (same tip all day long, so it does not change on every click). */
function consejoDelDia(hoy = new Date()): string {
  const dia = Math.floor((hoy.getTime() - new Date(hoy.getFullYear(), 0, 0).getTime()) / 86_400_000);
  return CONSEJOS[dia % CONSEJOS.length];
}

function saludo(hora = new Date().getHours()): string {
  return hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';
}

const FECHA_LARGA = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
const hoyLargo = () => FECHA_LARGA.format(new Date());

export function Plantilla() {
  return (
    <MovimientosProvider>
      <Marco />
    </MovimientosProvider>
  );
}

function Marco() {
  const { pathname } = useLocation();
  const { cerrarSesion, usuario } = useSesion();
  const { abrir } = useMovimientos();
  const navegar = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [titulo, subtituloBase] = TITULOS[pathname] ?? ['PulsoFinance', ''];
  // The home page greets the user by first name with today's date, like a real banking app.
  const subtitulo = pathname === '/resumen' && usuario ? `${saludo()}, ${usuario.nombre.split(' ')[0]} · ${hoyLargo()}` : subtituloBase;

  useEffect(() => setMenuAbierto(false), [pathname]);
  useEffect(() => {
    if (!menuAbierto) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setMenuAbierto(false);
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [menuAbierto]);
  useEffect(() => { document.title = `${titulo} · PulsoFinance`; }, [titulo]);

  async function salir() {
    await cerrarSesion();
    navegar('/login', { replace: true });
  }

  return (
    <div className="aplicacion">
      <aside className={`lateral ${menuAbierto ? 'abierto' : ''}`} aria-label="Menú principal">
        <Marca apilada />
        <nav>
          {SECCIONES.map((s) => (
            <NavLink key={s.ruta} to={s.ruta} className={({ isActive }) => `enlace-nav ${isActive ? 'activo' : ''}`}>
              <Icono nombre={s.icono} /> {s.texto}
            </NavLink>
          ))}
        </nav>
        <div className="lateral-pie">
          <div className="tarjeta-consejo">
            <strong>Consejo</strong>
            {consejoDelDia()}
          </div>
          <button className="enlace-nav" onClick={salir}><Icono nombre="salir" /> Cerrar sesión</button>
        </div>
      </aside>
      <div className={`cortina ${menuAbierto ? 'abierta' : ''}`} onClick={() => setMenuAbierto(false)} aria-hidden />

      <div className="principal">
        <header className="encabezado">
          <div className="encabezado-titulo">
            <button className="boton-icono boton-menu" aria-label="Abrir menú" aria-expanded={menuAbierto} onClick={() => setMenuAbierto(true)}>
              <Icono nombre="menu" tamano={22} />
            </button>
            <span className="marca-movil" aria-hidden><Logo tamano={30} /></span>
            <div style={{ minWidth: 0 }}>
              <h1>{titulo}</h1>
              {subtitulo && <div className="subtitulo">{subtitulo}</div>}
            </div>
          </div>
          <div className="encabezado-acciones">
            <button className="boton boton-nuevo" onClick={() => abrir()}><Icono nombre="mas" tamano={18} /> Nuevo movimiento</button>
            <BotonTema />
            <MenuUsuario />
          </div>
        </header>
        <main className="contenido" key={pathname}><Outlet /></main>
      </div>

      <nav className="nav-inferior" aria-label="Navegación rápida">
        <NavLink to="/resumen" className={({ isActive }) => (isActive ? 'activo' : '')}><Icono nombre="inicio" />Inicio</NavLink>
        <NavLink to="/movimientos" className={({ isActive }) => (isActive ? 'activo' : '')}><Icono nombre="movimientos" />Movimientos</NavLink>
        <button className="fab" aria-label="Nuevo movimiento" onClick={() => abrir()}><Icono nombre="mas" tamano={26} /></button>
        <NavLink to="/presupuestos" className={({ isActive }) => (isActive ? 'activo' : '')}><Icono nombre="objetivo" />Presupuestos</NavLink>
        <NavLink to="/reportes" className={({ isActive }) => (isActive ? 'activo' : '')}><Icono nombre="reportes" />Reportes</NavLink>
      </nav>
    </div>
  );
}
