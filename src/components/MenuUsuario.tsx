import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSesion } from '../features/auth/SesionStore';
import { Icono } from './Iconos';

export const iniciales = (nombre: string) => nombre.split(/\s+/).filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase();

/** HU-04: the sign-out lives in the avatar menu, next to the account settings (HU-20 to HU-22). */
export function MenuUsuario() {
  const { usuario, cerrarSesion } = useSesion();
  const [abierto, setAbierto] = useState(false);
  const navegar = useNavigate();
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fuera = (e: MouseEvent) => caja.current && !caja.current.contains(e.target as Node) && setAbierto(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false);
    document.addEventListener('mousedown', fuera);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', fuera);
      document.removeEventListener('keydown', esc);
    };
  }, []);

  if (!usuario) return null;
  const ir = (ruta: string) => {
    setAbierto(false);
    navegar(ruta);
  };
  return (
    <div className="menu" ref={caja}>
      <button className="menu-usuario-boton" onClick={() => setAbierto((a) => !a)} aria-expanded={abierto} aria-haspopup="menu"
        aria-label={`Menú de ${usuario.nombre}`}>
        <span className="avatar">{iniciales(usuario.nombre)}</span>
        <Icono nombre="chevron" tamano={18} />
      </button>
      {abierto && (
        <div className="menu-lista" role="menu" style={{ minWidth: 250 }}>
          <div className="menu-cabecera"><strong>{usuario.nombre}</strong><span>{usuario.correo}</span></div>
          <button role="menuitem" onClick={() => ir('/cuenta')}><Icono nombre="cuenta" tamano={18} /> Configuración de la cuenta</button>
          <button role="menuitem" onClick={() => ir('/cuenta#seguridad')}><Icono nombre="candado" tamano={18} /> Cambiar contraseña</button>
          <button role="menuitem" className="texto-peligro" onClick={async () => {
            setAbierto(false);
            await cerrarSesion();
            navegar('/login', { replace: true });
          }}><Icono nombre="salir" tamano={18} /> Cerrar sesión</button>
        </div>
      )}
    </div>
  );
}
