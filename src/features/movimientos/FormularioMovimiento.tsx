import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CategoriasApi } from '../../api/CategoriasApi';
import { MovimientosApi } from '../../api/MovimientosApi';
import { ErrorApi } from '../../api/ClienteHttp';
import { METODOS_PAGO, type CategoriaDTO, type MetodoPago, type MovimientoDTO, type TipoMovimiento } from '../../api/tipos';
import { hoyIso } from '../../components/formato';
import { Campo, Seleccion } from '../../components/Campo';
import { Icono, IconoCategoria } from '../../components/Iconos';
import { normalizarMonto, validarMovimiento } from './validacion';
import { useTrampaFoco } from '../../components/useTrampaFoco';

interface Props {
  movimiento?: MovimientoDTO | null;
  tipoInicial?: TipoMovimiento;
  onGuardado: (m: MovimientoDTO) => void;
  onCerrar: () => void;
}

/** HU-06, HU-07 and HU-08: register or edit an expense or income (mockup "Nuevo movimiento"). */
export function FormularioMovimiento({ movimiento, tipoInicial, onGuardado, onCerrar }: Props) {
  const [tipo, setTipo] = useState<TipoMovimiento>(movimiento?.tipo ?? tipoInicial ?? 'GASTO');
  const [monto, setMonto] = useState(movimiento ? String(movimiento.monto) : '');
  const [fecha, setFecha] = useState(movimiento?.fecha ?? hoyIso());
  const [idCategoria, setIdCategoria] = useState(movimiento?.categoria.id ?? '');
  const [descripcion, setDescripcion] = useState(movimiento?.descripcion ?? '');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(movimiento?.metodoPago ?? 'EFECTIVO');
  const [fuente, setFuente] = useState(movimiento?.fuente ?? '');
  const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);
  const caja = useRef<HTMLFormElement>(null);

  useEffect(() => {
    let vigente = true;   // ignore the answer for the previous type if the user switched quickly
    CategoriasApi.listar(tipo)
      .then((lista) => { if (vigente) { setCategorias(lista); setErrores((e) => ({ ...e, idCategoria: '' })); } })
      .catch(() => { if (vigente) { setCategorias([]); setErrores((e) => ({ ...e, idCategoria: 'No se pudieron cargar las categorías; cierra y vuelve a intentarlo' })); } });
    return () => { vigente = false; };
  }, [tipo]);

  useTrampaFoco(caja, true, onCerrar);

  function cambiarTipo(t: TipoMovimiento) {
    if (movimiento) return;   // the type of an existing movement does not change
    setTipo(t);
    setIdCategoria('');
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();
    const v = validarMovimiento({ tipo, monto, fecha, idCategoria, descripcion }, hoyIso());
    setErrores(v);
    if (Object.keys(v).length) return;
    setGuardando(true);
    const cmd = {
      tipo, monto: normalizarMonto(monto), fecha, idCategoria, descripcion: descripcion || undefined,
      metodoPago: tipo === 'GASTO' ? metodoPago : undefined, fuente: tipo === 'INGRESO' ? fuente || undefined : undefined,
    };
    try {
      const m = movimiento ? await MovimientosApi.modificar(movimiento.id, cmd) : await MovimientosApi.registrar(cmd);
      onGuardado(m);
    } catch (err) {
      setErrores({ general: err instanceof ErrorApi ? err.message : 'No se pudo guardar' });
    } finally {
      setGuardando(false);
    }
  }

  const elegida = categorias.find((c) => c.id === idCategoria);
  const predeterminadas = categorias.filter((c) => c.predeterminada);
  const propias = categorias.filter((c) => !c.predeterminada);
  const esGasto = tipo === 'GASTO';

  return (
    <div className="fondo-modal" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <form ref={caja} className="modal modal-ancho" onSubmit={guardar} noValidate role="dialog" aria-modal="true" aria-labelledby="titulo-movimiento">
        <div className="modal-cabecera">
          <h3 id="titulo-movimiento">{movimiento ? 'Editar movimiento' : 'Nuevo movimiento'}</h3>
          <button type="button" className="boton-icono" aria-label="Cerrar" onClick={onCerrar}><Icono nombre="cerrar" /></button>
        </div>

        <div className="tipo-movimiento" role="radiogroup" aria-label="Tipo de movimiento">
          {(['INGRESO', 'GASTO'] as const).map((t) => (
            <button type="button" key={t} role="radio" aria-checked={tipo === t} disabled={!!movimiento && tipo !== t}
              className={t === 'GASTO' ? 'gasto' : 'ingreso'} onClick={() => cambiarTipo(t)}>
              <Icono nombre={t === 'GASTO' ? 'abajo' : 'arriba'} tamano={18} />{t === 'GASTO' ? 'Gasto' : 'Ingreso'}
            </button>
          ))}
        </div>

        <div className="cabecera-tipo">
          <span className={`circulo ${esGasto ? 'gasto' : 'ingreso'}`}><Icono nombre={esGasto ? 'billetera' : 'grafica'} tamano={26} /></span>
          <div>
            <strong>{esGasto ? 'Gasto' : 'Ingreso'}</strong>
            <span className="sutil">{esGasto ? 'Registra un gasto de tu día a día' : 'Registra un dinero que recibiste'}</span>
          </div>
        </div>

        <div className="rejilla rejilla-2" style={{ gap: 14 }}>
          <Seleccion etiqueta="Categoría" valor={idCategoria} onCambio={setIdCategoria} error={errores.idCategoria}
            icono={elegida ? <IconoCategoria icono={elegida.icono} color={elegida.color} tamano={26} /> : 'etiqueta'}>
            <option value="">Elige una categoría</option>
            {predeterminadas.length > 0 && (
              <optgroup label="Predeterminadas">
                {predeterminadas.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </optgroup>
            )}
            {propias.length > 0 && (
              <optgroup label="Mis categorías">
                {propias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </optgroup>
            )}
          </Seleccion>
          <Campo etiqueta="Fecha" icono="calendario" type="date" max={hoyIso()} valor={fecha} onCambio={setFecha} error={errores.fecha} />
          <Campo etiqueta="Monto" inputMode="decimal" autoFocus placeholder="0" sufijo="COP" valor={monto} onCambio={setMonto}
            error={errores.monto && 'El monto debe ser mayor a 0 (máximo 2 decimales)'} />
          {esGasto ? (
            <Seleccion etiqueta="Método de pago" icono="billetera" valor={metodoPago} onCambio={(v) => setMetodoPago(v as MetodoPago)}>
              {METODOS_PAGO.map((m) => <option key={m.valor} value={m.valor}>{m.texto}</option>)}
            </Seleccion>
          ) : (
            <Campo etiqueta="Fuente (opcional)" icono="maletin" placeholder="Ej. Empresa" maxLength={80} valor={fuente} onCambio={setFuente} />
          )}
        </div>
        <Campo etiqueta="Descripción (opcional)" icono="documento" placeholder={esGasto ? 'Ej. almuerzo en el centro' : 'Ej. salario de noviembre'}
          maxLength={140} valor={descripcion} onCambio={setDescripcion} error={errores.descripcion} ayuda={`${descripcion.length}/140 caracteres`} />

        {errores.general && <div className="alerta alerta-error" role="alert"><Icono nombre="alerta" tamano={18} />{errores.general}</div>}
        <div className="acciones">
          <button type="button" className="boton secundario" onClick={onCerrar}>Cancelar</button>
          <button className="boton" disabled={guardando}><Icono nombre="check" tamano={18} />
            {guardando ? 'Guardando…' : movimiento ? 'Guardar cambios' : `Registrar ${esGasto ? 'gasto' : 'ingreso'}`}</button>
        </div>
      </form>
    </div>
  );
}
