import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSesion } from './SesionStore';
import { PantallaAcceso } from './PantallaAcceso';
import { ErrorApi } from '../../api/ClienteHttp';
import { Campo } from '../../components/Campo';
import { Icono } from '../../components/Iconos';

export const BENEFICIOS_ACCESO = [
  { icono: 'escudo', texto: 'Tu información siempre protegida' },
  { icono: 'rayo', texto: 'Acceso rápido y seguro' },
  { icono: 'grafica', texto: 'Toma el control de tu dinero' },
];

/** HU-02. */
export function InicioSesionPage() {
  const { usuario, iniciarSesion } = useSesion();
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const estado = ubicacion.state as { desde?: string; aviso?: string } | null;

  if (usuario) return <Navigate to={estado?.desde ?? '/resumen'} replace />;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await iniciarSesion(correo.trim(), clave);
      navegar(estado?.desde ?? '/resumen', { replace: true });
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <PantallaAcceso hero={['Inicia', 'Sesión']} textoHero="Gestiona tus finanzas de forma simple, segura y eficiente."
      beneficios={BENEFICIOS_ACCESO} icono="usuario" titulo="Bienvenido de nuevo" subtitulo="Ingresa a tu cuenta para continuar">
      {estado?.aviso && <div className="alerta alerta-info" role="status"><Icono nombre="info" tamano={18} />{estado.aviso}</div>}
      <form onSubmit={enviar} className="formulario">
        <Campo icono="correo" type="email" placeholder="Correo electrónico" autoComplete="email" required valor={correo} onCambio={setCorreo} />
        <Campo icono="candado" type="password" placeholder="Contraseña" autoComplete="current-password" required valor={clave} onCambio={setClave} />
        <div className="fila-entre">
          <span className="sutil">La sesión se mantiene 7 días en este equipo.</span>
          <Link to="/recuperar">¿Olvidaste tu contraseña?</Link>
        </div>
        {error && <div className="alerta alerta-error" role="alert"><Icono nombre="alerta" tamano={18} />{error}</div>}
        <button className="boton ancho" disabled={enviando}><Icono nombre="salir" tamano={18} style={{ transform: 'scaleX(-1)' }} />
          {enviando ? 'Ingresando…' : 'Iniciar sesión'}</button>
      </form>
      <div className="enlaces-acceso"><span>¿No tienes una cuenta? <Link to="/registro">Regístrate</Link></span></div>
    </PantallaAcceso>
  );
}
