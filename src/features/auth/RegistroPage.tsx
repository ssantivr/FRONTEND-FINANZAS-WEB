import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useSesion } from './SesionStore';
import { PantallaAcceso } from './PantallaAcceso';
import { ErrorApi } from '../../api/ClienteHttp';
import { validarRegistro } from '../movimientos/validacion';
import { Campo } from '../../components/Campo';
import { Icono } from '../../components/Iconos';

const BENEFICIOS = [
  { icono: 'escudo', texto: 'Gestiona tus finanzas con seguridad' },
  { icono: 'grafica', texto: 'Planifica tus metas con facilidad' },
  { icono: 'objetivo', texto: 'Controla tus presupuestos cada mes' },
];

/** HU-01. */
export function RegistroPage() {
  const { usuario, registrar } = useSesion();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [acepta, setAcepta] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const navegar = useNavigate();

  if (usuario) return <Navigate to="/resumen" replace />;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const v = validarRegistro(nombre, correo, clave);
    if (clave && confirmacion !== clave) v.confirmacion = 'Las contraseñas no coinciden';
    if (!acepta) v.acepta = 'Debes aceptar la política de tratamiento de datos';
    setErrores(v);
    if (Object.keys(v).length) return;   // HU-01: rejected before calling the API
    setEnviando(true);
    try {
      await registrar({ nombre, correo, clave });
      navegar('/resumen', { replace: true });
    } catch (err) {
      setErrores({ general: err instanceof ErrorApi ? err.message : 'No se pudo crear la cuenta' });
    } finally {
      setEnviando(false);
    }
  }

  const avance = Math.min(100, (clave.length / 10) * 100);
  return (
    <PantallaAcceso hero={['Crea tu', 'cuenta']} textoHero="Da el primer paso hacia una mejor gestión financiera."
      beneficios={BENEFICIOS} icono="usuarioMas" titulo="Regístrate" subtitulo="Completa tus datos para comenzar">
      <form onSubmit={enviar} className="formulario" noValidate>
        <Campo icono="usuario" placeholder="Nombre completo" autoComplete="name" maxLength={80} valor={nombre} onCambio={setNombre} error={errores.nombre} />
        <Campo icono="correo" type="email" placeholder="Correo electrónico" autoComplete="email" valor={correo} onCambio={setCorreo} error={errores.correo} />
        <Campo icono="candado" type="password" placeholder="Contraseña" autoComplete="new-password" valor={clave} onCambio={setClave} error={errores.clave} />
        {clave && (
          <div className="fuerza" aria-live="polite">
            <div className="barra"><div className={`relleno ${clave.length < 10 ? 'excedido' : ''}`} style={{ width: `${avance}%` }} /></div>
            <span className={clave.length >= 10 ? 'ayuda ok' : 'ayuda'}>
              {clave.length >= 10 ? 'Longitud correcta' : `Mínimo 10 caracteres (llevas ${clave.length})`}
            </span>
          </div>
        )}
        <Campo icono="candado" type="password" placeholder="Confirmar contraseña" autoComplete="new-password" valor={confirmacion} onCambio={setConfirmacion} error={errores.confirmacion} />
        <label className="casilla">
          <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} />
          <span>Acepto el tratamiento de mis datos personales según la Ley 1581 de 2012.</span>
        </label>
        {errores.acepta && <span className="error-campo"><Icono nombre="alerta" tamano={14} />{errores.acepta}</span>}
        {errores.general && <div className="alerta alerta-error" role="alert"><Icono nombre="alerta" tamano={18} />{errores.general}</div>}
        <button className="boton ancho" disabled={enviando}><Icono nombre="usuarioMas" tamano={18} />{enviando ? 'Creando…' : 'Registrarse'}</button>
      </form>
      <div className="separador">¿Ya tienes una cuenta?</div>
      <Link className="boton secundario ancho" to="/login">Iniciar sesión</Link>
    </PantallaAcceso>
  );
}
