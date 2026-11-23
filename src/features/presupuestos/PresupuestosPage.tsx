import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { CategoriasApi } from '../../api/CategoriasApi';
import { PresupuestosApi } from '../../api/PresupuestosApi';
import { ErrorApi } from '../../api/ClienteHttp';
import type { CategoriaDTO, PresupuestoDTO } from '../../api/tipos';
import { useAviso } from '../../components/Aviso';
import { DialogoConfirmacion } from '../../components/DialogoConfirmacion';
import { formatoMoneda, mesActual, nombreMes, formatoPorcentaje } from '../../components/formato';
import { Anillo } from '../../components/Graficos';
import { Campo, Seleccion } from '../../components/Campo';
import { Icono, IconoCategoria } from '../../components/Iconos';
import { useMovimientos } from '../movimientos/ContextoMovimientos';
import { PATRON_MONTO, normalizarMonto } from '../movimientos/validacion';

const TEXTO_ESTADO = { OK: 'En control', ALERTA: 'Alerta', EXCEDIDO: 'Excedido' } as const;

/** HU-13 (define) and HU-14 (state of the month), mockups "Definir presupuesto" and "Presupuestos del mes". */
export function PresupuestosPage() {
  const [periodo, setPeriodo] = useState(mesActual());
  const [presupuestos, setPresupuestos] = useState<PresupuestoDTO[]>([]);
  const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);
  const [idCategoria, setIdCategoria] = useState('');
  const [limite, setLimite] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [porEliminar, setPorEliminar] = useState<PresupuestoDTO | null>(null);
  const [cargado, setCargado] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const aviso = useAviso();
  const { version } = useMovimientos();

  // A failed load shows an error instead of "no budgets", which would invite the user to create duplicates.
  const cargar = useCallback(() => PresupuestosApi.listar(periodo)
    .then((lista) => { setPresupuestos(lista); setErrorCarga(null); })
    .catch((e) => setErrorCarga(e instanceof ErrorApi ? e.message : 'No se pudieron cargar los presupuestos'))
    .finally(() => setCargado(true)), [periodo]);
  useEffect(() => { void cargar(); }, [cargar, version]);
  useEffect(() => {
    CategoriasApi.listar('GASTO').then(setCategorias)
      .catch(() => setError('No se pudieron cargar las categorías; recarga la página'));
  }, []);

  const existente = presupuestos.find((p) => p.categoria.id === idCategoria);
  const elegida = categorias.find((c) => c.id === idCategoria);
  const montoValido = PATRON_MONTO.test(limite.trim()) && Number(normalizarMonto(limite)) > 0;

  async function definir(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!idCategoria) return setError('Elige una categoría');
    if (!montoValido) return setError('Ingresa un límite mayor que 0 con máximo 2 decimales');
    setOcupado(true);
    try {
      await PresupuestosApi.definir(idCategoria, periodo, normalizarMonto(limite));
      setLimite('');
      setIdCategoria('');
      aviso(existente ? 'Límite actualizado' : 'Presupuesto guardado');
      await cargar();
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudo guardar');
    } finally {
      setOcupado(false);
    }
  }

  async function eliminar() {
    if (!porEliminar) return;
    setOcupado(true);
    try {
      await PresupuestosApi.eliminar(porEliminar.id);
      setPorEliminar(null);
      aviso('Presupuesto eliminado');
      await cargar();
    } catch (err) {
      aviso(err instanceof ErrorApi ? err.message : 'No se pudo eliminar el presupuesto', 'error');
    } finally {
      setOcupado(false);
    }
  }

  const totalLimite = presupuestos.reduce((s, p) => s + p.limite, 0);
  const totalConsumo = presupuestos.reduce((s, p) => s + p.consumo, 0);
  const usado = totalLimite > 0 ? Math.round((totalConsumo / totalLimite) * 100) : 0;
  const excedidos = presupuestos.filter((p) => p.estado === 'EXCEDIDO');
  const alertas = presupuestos.filter((p) => p.estado === 'ALERTA');
  const estadoGeneral = excedidos.length ? 'excedido' : alertas.length ? 'alerta' : 'ok';
  // The ring and bar show the month total; one exceeded category is reported in the message card, not by painting 72 % red.
  const tonoTotal = usado >= 100 ? 'excedido' : usado >= 80 ? 'alerta' : 'ok';

  return (
    <>
      <div className="barra-herramientas" style={{ justifyContent: 'flex-end' }}>
        <div className="control" style={{ maxWidth: 230, flex: 'none' }}>
          <Icono nombre="calendario" />
          <input type="month" value={periodo} onChange={(e) => e.target.value && setPeriodo(e.target.value)} aria-label="Mes" />
        </div>
      </div>

      <div className="rejilla rejilla-2-1">
        <section className="tarjeta">
          <div className="resumen-presupuesto">
            <Anillo porcentaje={usado} tamano={130} color={tonoTotal === 'excedido' ? '#dc2626' : tonoTotal === 'alerta' ? '#f59e0b' : '#16a34a'}>
              <strong>{usado} %</strong><span>Utilizado</span>
            </Anillo>
            <div className="detalle">
              <span className="sutil">{nombreMes(periodo)}</span>
              <strong>{formatoMoneda(totalConsumo)} <small style={{ fontSize: 14 }}>COP</small></strong>
              <span className="sutil">de {formatoMoneda(totalLimite)} COP presupuestados</span>
              <div className="barra"><div className={`relleno ${tonoTotal === 'ok' ? '' : tonoTotal}`} style={{ width: `${Math.min(100, usado)}%` }} /></div>
            </div>
          </div>
        </section>
        <section className="tarjeta tarjeta-menta tarjeta-quedan">
          <span className="indicador-icono verde"><Icono nombre="billetera" tamano={26} /></span>
          <div>
            <span className="sutil">{totalLimite - totalConsumo >= 0 ? 'Te quedan' : 'Te pasaste por'}</span>
            <strong>{formatoMoneda(Math.abs(totalLimite - totalConsumo))} COP</strong>
          </div>
        </section>
      </div>

      <section>
        <div className="tarjeta-titulo"><h2 style={{ fontSize: 19 }}>Por categoría</h2></div>
        {errorCarga ? (
          <div className="alerta alerta-error" role="alert"><Icono nombre="alerta" tamano={18} />
            <span>{errorCarga}</span>
            <button className="enlace" onClick={() => void cargar()}>Reintentar</button>
          </div>
        ) : !cargado ? (
          <div className="tarjeta esqueleto" style={{ height: 120 }} role="status" aria-label="Cargando presupuestos" />
        ) : presupuestos.length === 0 ? (
          <div className="tarjeta vacio">
            <span className="icono-vacio"><Icono nombre="objetivo" tamano={26} /></span>
            No hay presupuestos para {nombreMes(periodo).toLowerCase()}. Define el primero abajo.
          </div>
        ) : (
          <div className="rejilla-presupuestos">
            {presupuestos.map((p) => (
              <article key={p.id} className="tarjeta tarjeta-presupuesto">
                <IconoCategoria icono={p.categoria.icono} color={p.categoria.color} tamano={48} />
                <div className="cuerpo">
                  <div className="cabecera">
                    <strong>{p.categoria.nombre}</strong>
                    <span className={`estado estado-${p.estado.toLowerCase()}`}>{TEXTO_ESTADO[p.estado]}</span>
                  </div>
                  <div className="cifras"><span><b>{formatoMoneda(p.consumo)}</b> / {formatoMoneda(p.limite)}</span><b>{formatoPorcentaje(p.porcentaje)}</b></div>
                  <div className="barra"><div className={`relleno ${p.estado === 'OK' ? '' : p.estado.toLowerCase()}`} style={{ width: `${Math.min(100, p.porcentaje)}%` }} /></div>
                  <div className="pie">
                    <span className="sutil">{p.limite - p.consumo >= 0 ? `Disponible ${formatoMoneda(p.limite - p.consumo)}` : `Excedido en ${formatoMoneda(p.consumo - p.limite)}`}</span>
                    <span className="acciones-tarjeta">
                      <button className="boton-icono" aria-label={`Editar límite de ${p.categoria.nombre}`}
                        onClick={() => { setIdCategoria(p.categoria.id); setLimite(String(p.limite)); setError(null); document.getElementById('definir')?.scrollIntoView({ behavior: 'smooth' }); }}>
                        <Icono nombre="editar" tamano={17} />
                      </button>
                      <button className="boton-icono peligro" aria-label={`Eliminar presupuesto de ${p.categoria.nombre}`} onClick={() => setPorEliminar(p)}>
                        <Icono nombre="eliminar" tamano={17} />
                      </button>
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {presupuestos.length > 0 && (
        <section className={`tarjeta ${estadoGeneral === 'ok' ? 'tarjeta-menta' : ''} mensaje-estado ${estadoGeneral}`}>
          <span className="circulo"><Icono nombre={estadoGeneral === 'ok' ? 'check' : 'alerta'} tamano={26} /></span>
          <div>
            <h3>{estadoGeneral === 'ok' ? '¡Vas muy bien!' : estadoGeneral === 'alerta' ? 'Cuidado: te acercas al límite' : 'Superaste un presupuesto'}</h3>
            <span className="sutil">
              {estadoGeneral === 'ok' ? 'Estás dentro de tu presupuesto mensual.'
                : estadoGeneral === 'alerta' ? `${alertas.map((p) => p.categoria.nombre).join(', ')} ya pasó el 80 % del límite.`
                  : `${excedidos.map((p) => p.categoria.nombre).join(', ')} superó el límite. Te avisamos por correo la primera vez.`}
            </span>
          </div>
        </section>
      )}

      <section className="tarjeta" id="definir">
        <div className="tarjeta-titulo"><h2><Icono nombre="objetivo" />Definir presupuesto</h2></div>
        <form className="formulario" onSubmit={definir}>
          <div className="rejilla rejilla-2" style={{ gap: 14 }}>
            <Seleccion etiqueta="Categoría de gasto" valor={idCategoria} onCambio={setIdCategoria}
              icono={elegida ? <IconoCategoria icono={elegida.icono} color={elegida.color} tamano={26} /> : 'categorias'}>
              <option value="">Elige una categoría</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </Seleccion>
            <Campo etiqueta="Monto del presupuesto" icono="billetera" inputMode="decimal" placeholder="300000" sufijo="COP" valor={limite} onCambio={setLimite} />
          </div>
          {existente && (
            <div className="alerta alerta-info"><Icono nombre="info" tamano={18} />
              <span>Ya tienes un presupuesto de {existente.categoria.nombre} para {nombreMes(periodo).toLowerCase()}: se <b>actualizará</b> el límite.</span>
            </div>
          )}
          {elegida && montoValido && (
            <div className="cabecera-tipo">
              <span className="circulo ingreso"><Icono nombre="reportes" tamano={24} /></span>
              <div>
                <span className="sutil">Resumen del presupuesto · {elegida.nombre} · {nombreMes(periodo)}</span>
                <strong>{formatoMoneda(Number(normalizarMonto(limite)))} COP</strong>
              </div>
            </div>
          )}
          {error && <div className="alerta alerta-error" role="alert"><Icono nombre="alerta" tamano={18} />{error}</div>}
          <div className="acciones">
            <button type="button" className="boton secundario" onClick={() => { setIdCategoria(''); setLimite(''); setError(null); }}>
              <Icono nombre="eliminar" tamano={18} />Restablecer
            </button>
            <button className="boton" disabled={ocupado} aria-busy={ocupado}><Icono nombre="check" tamano={18} />{ocupado ? 'Guardando…' : 'Guardar presupuesto'}</button>
          </div>
        </form>
      </section>

      <div className="alerta alerta-info"><Icono nombre="info" tamano={18} />
        Los presupuestos se calculan sobre tus gastos del mes. Te avisamos por correo la primera vez que superas un límite.
      </div>

      <DialogoConfirmacion abierto={!!porEliminar} titulo="¿Eliminar este presupuesto?" textoConfirmar="Sí, eliminar" peligro
        ocupado={ocupado} onConfirmar={eliminar} onCancelar={() => setPorEliminar(null)}>
        <p>Se elimina el límite de <b>{porEliminar?.categoria.nombre}</b> para {nombreMes(periodo).toLowerCase()}. Tus gastos no cambian.</p>
      </DialogoConfirmacion>
    </>
  );
}
