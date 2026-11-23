import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthApi } from '../../api/AuthApi';
import { ErrorApi } from '../../api/ClienteHttp';
import { PantallaAcceso } from './PantallaAcceso';
import { BENEFICIOS_ACCESO } from './InicioSesionPage';
import { Campo } from '../../components/Campo';
import { Icono } from '../../components/Iconos';

/** HU-05: /recuperar asks for the e-mail; /restablecer?token=... sets the new password. */
export function RecuperarContrasenaPage() {
  const [parametros] = useSearchParams();
  const token = parametros.get('token');
  return token ? <Restablecer token={token} /> : <Solicitar />;
}

function Solicitar() {
  const [correo, setCorreo] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function solicitar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await AuthApi.solicitarRecuperacion(correo.trim());
      setEnviado(true);
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudo enviar la solicitud');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <PantallaAcceso hero={['Recupera tu', 'contraseña']} textoHero="Te enviaremos un enlace seguro, válido por 30 minutos."
      beneficios={BENEFICIOS_ACCESO} icono="candado" titulo="¿Olvidaste tu contraseña?" subtitulo="Escribe el correo de tu cuenta">
      {enviado ? (
        <div className="alerta alerta-info"><Icono nombre="check" tamano={18} />Si el correo está registrado, recibirás un enlace para crear una nueva contraseña.</div>
      ) : (
        <form onSubmit={solicitar} className="formulario">
          <Campo icono="correo" type="email" placeholder="Correo electrónico" autoComplete="email" required valor={correo} onCambio={setCorreo} />
          {error && <div className="alerta alerta-error" role="alert"><Icono nombre="alerta" tamano={18} />{error}</div>}
          <button className="boton ancho" disabled={enviando}><Icono nombre="correo" tamano={18} />{enviando ? 'Enviando…' : 'Enviar enlace'}</button>
        </form>
      )}
      <div className="enlaces-acceso"><Link to="/login">Volver a iniciar sesión</Link></div>
    </PantallaAcceso>
  );
}

function Restablecer({ token }: { token: string }) {
  const [nueva, setNueva] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const navegar = useNavigate();

  async function restablecer(e: FormEvent) {
    e.preventDefault();
    if (nueva.length < 10) return setError('La contraseña debe tener al menos 10 caracteres');
    if (nueva !== confirmacion) return setError('Las contraseñas no coinciden');
    setError(null);
    setEnviando(true);
    try {
      await AuthApi.restablecer(token, nueva);
      navegar('/login', { replace: true, state: { aviso: 'Contraseña actualizada. Inicia sesión con la nueva.' } });
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudo restablecer la contraseña');
      setEnviando(false);
    }
  }

  return (
    <PantallaAcceso hero={['Crea una', 'nueva clave']} textoHero="Elige una contraseña de al menos 10 caracteres."
      beneficios={BENEFICIOS_ACCESO} icono="candado" titulo="Nueva contraseña">
      <form onSubmit={restablecer} className="formulario">
        <Campo icono="candado" type="password" placeholder="Nueva contraseña" autoComplete="new-password" valor={nueva} onCambio={setNueva} />
        <Campo icono="candado" type="password" placeholder="Confirmar contraseña" autoComplete="new-password" valor={confirmacion} onCambio={setConfirmacion} />
        {error && <div className="alerta alerta-error" role="alert"><Icono nombre="alerta" tamano={18} /><span>{error} {error.includes('enlace') && <Link to="/recuperar">Pedir otro</Link>}</span></div>}
        <button className="boton ancho" disabled={enviando}><Icono nombre="check" tamano={18} />{enviando ? 'Guardando…' : 'Guardar contraseña'}</button>
      </form>
    </PantallaAcceso>
  );
}
