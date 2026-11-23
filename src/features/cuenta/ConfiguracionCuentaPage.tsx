import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CuentaApi } from '../../api/CuentaApi';
import { ErrorApi } from '../../api/ClienteHttp';
import { DialogoConfirmacion } from '../../components/DialogoConfirmacion';
import { useAviso } from '../../components/Aviso';
import { formatoFecha } from '../../components/formato';
import { useSesion } from '../auth/SesionStore';
import { Campo } from '../../components/Campo';
import { Icono } from '../../components/Iconos';
import { SelectorTema } from '../../components/Tema';
import { iniciales } from '../../components/MenuUsuario';

/** HU-20, HU-21 and HU-22. */
export function ConfiguracionCuentaPage() {
  const { usuario, actualizarUsuario } = useSesion();
  const [nombre, setNombre] = useState(usuario?.nombre ?? '');
  const [claveActual, setClaveActual] = useState('');
  const [claveNueva, setClaveNueva] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [errorClave, setErrorClave] = useState<string | null>(null);
  const [dialogoEliminarAbierto, setDialogoEliminarAbierto] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [guardando, setGuardando] = useState<'nombre' | 'clave' | null>(null);
  const aviso = useAviso();
  const navegar = useNavigate();

  if (!usuario) return null;
  const nombreValido = nombre.trim().length >= 2 && nombre.trim().length <= 80;

  async function guardarNombre(e: FormEvent) {
    e.preventDefault();
    if (!nombreValido) return;
    setGuardando('nombre');
    try {
      actualizarUsuario(await CuentaApi.actualizarNombre(nombre.trim()));
      aviso('Datos actualizados');
    } catch (err) {
      aviso(err instanceof ErrorApi ? err.message : 'No se pudo guardar', 'error');
    } finally {
      setGuardando(null);
    }
  }

  async function cambiarContrasena(e: FormEvent) {
    e.preventDefault();
    setErrorClave(null);
    if (claveNueva.length < 10) return setErrorClave('La nueva contraseña debe tener al menos 10 caracteres');
    if (claveNueva === claveActual) return setErrorClave('La nueva contraseña debe ser distinta de la actual');
    if (claveNueva !== confirmacion) return setErrorClave('La confirmación no coincide');   // HU-22, before calling the API
    setGuardando('clave');
    try {
      await CuentaApi.cambiarContrasena(claveActual, claveNueva);
      setClaveActual(''); setClaveNueva(''); setConfirmacion('');
      aviso('Contraseña actualizada');
    } catch (err) {
      setErrorClave(err instanceof ErrorApi ? err.message : 'No se pudo cambiar la contraseña');
    } finally {
      setGuardando(null);
    }
  }

  async function eliminarCuenta() {
    setEliminando(true);
    try {
      await CuentaApi.eliminar();
      actualizarUsuario(null);
      navegar('/login', { replace: true, state: { aviso: 'Tu cuenta fue eliminada' } });
    } catch (err) {
      aviso(err instanceof ErrorApi ? err.message : 'No se pudo eliminar la cuenta', 'error');
      setEliminando(false);
    }
  }

  return (
    <>
      <section className="tarjeta perfil">
        <span className="avatar grande">{iniciales(usuario.nombre)}</span>
        <div>
          <strong>{usuario.nombre}</strong>
          <span className="sutil">{usuario.correo} · miembro desde {formatoFecha(usuario.fechaRegistro)}</span>
        </div>
      </section>

      <section className="tarjeta">
        <div className="tarjeta-titulo"><h2><Icono nombre="usuario" />Datos personales</h2></div>
        <form onSubmit={guardarNombre} className="formulario">
          <div className="rejilla rejilla-2" style={{ gap: 14 }}>
            <Campo etiqueta="Nombre" icono="usuario" maxLength={80} valor={nombre} onCambio={setNombre}
              error={nombreValido ? undefined : 'Entre 2 y 80 caracteres'} ayuda={`${nombre.trim().length}/80 · mínimo 2`} />
            <Campo etiqueta="Correo" icono="correo" valor={usuario.correo} onCambio={() => undefined} disabled
              ayuda="Es tu identificador para iniciar sesión; no se puede cambiar." />
          </div>
          <div><button className="boton" disabled={!nombreValido || nombre.trim() === usuario.nombre || guardando === 'nombre'}><Icono nombre="check" tamano={18} />Guardar cambios</button></div>
        </form>
      </section>

      <section className="tarjeta">
        <div className="tarjeta-titulo"><h2><Icono nombre="luna" />Apariencia</h2></div>
        <div className="fila-espaciada">
          <p>Elige el modo claro, el oscuro o el mismo que usa tu dispositivo. Se guarda en este navegador.</p>
          <SelectorTema />
        </div>
      </section>

      <section className="tarjeta" id="seguridad">
        <div className="tarjeta-titulo"><h2><Icono nombre="candado" />Seguridad · cambiar contraseña</h2></div>
        <form onSubmit={cambiarContrasena} className="formulario">
          <Campo etiqueta="Contraseña actual" icono="candado" type="password" autoComplete="current-password" valor={claveActual} onCambio={setClaveActual} />
          <div className="rejilla rejilla-2" style={{ gap: 14 }}>
            <Campo etiqueta="Nueva contraseña" icono="candado" type="password" autoComplete="new-password" valor={claveNueva} onCambio={setClaveNueva} />
            <Campo etiqueta="Confirmar nueva" icono="candado" type="password" autoComplete="new-password" valor={confirmacion} onCambio={setConfirmacion} />
          </div>
          <ul className="comprobaciones">
            {[[claveNueva.length >= 10, 'Al menos 10 caracteres'], [!!claveNueva && claveNueva !== claveActual, 'Distinta de la actual'],
              [!!claveNueva && claveNueva === confirmacion, 'La confirmación coincide']].map(([ok, txt]) => (
              <li key={String(txt)} className={ok ? 'ok' : ''}><Icono nombre={ok ? 'check' : 'info'} tamano={15} />{txt}</li>
            ))}
          </ul>
          <div className="alerta alerta-info"><Icono nombre="info" tamano={18} />Al cambiarla se cerrará la sesión en tus otros dispositivos; aquí seguirás conectado.</div>
          {errorClave && <div className="alerta alerta-error" role="alert"><Icono nombre="alerta" tamano={18} />{errorClave}</div>}
          <div><button className="boton" disabled={!claveActual || !claveNueva || guardando === 'clave'}><Icono nombre="candado" tamano={18} />Cambiar contraseña</button></div>
        </form>
      </section>

      <section className="tarjeta zona-peligro">
        <div className="tarjeta-titulo"><h2><Icono nombre="alerta" />Zona de peligro</h2></div>
        <div className="fila-espaciada">
          <p>Eliminar tu cuenta cierra todas tus sesiones y deja de mostrar tus movimientos, categorías y presupuestos. No se puede deshacer.</p>
          <button className="boton contorno-peligro" onClick={() => setDialogoEliminarAbierto(true)}><Icono nombre="eliminar" tamano={18} />Eliminar mi cuenta</button>
        </div>
      </section>

      <DialogoConfirmacion abierto={dialogoEliminarAbierto} titulo="¿Eliminar tu cuenta?" peligro ocupado={eliminando}
        textoConfirmar="Sí, eliminar mi cuenta" onConfirmar={eliminarCuenta} onCancelar={() => setDialogoEliminarAbierto(false)}>
        <p>Esta acción no se puede deshacer. Al confirmar:</p>
        <ul>
          <li>Tu cuenta pasa a estado <b>ELIMINADA</b>.</li>
          <li>Se cierran tus sesiones en todos los dispositivos.</li>
          <li>Ya no podrás iniciar sesión con este correo.</li>
        </ul>
        <div className="alerta alerta-info">Volverás a la pantalla de inicio de sesión con el aviso «Tu cuenta fue eliminada».</div>
      </DialogoConfirmacion>
    </>
  );
}
