import { useCallback, useEffect, useMemo, useState } from 'react';
import { CategoriasApi } from '../../api/CategoriasApi';
import { MovimientosApi } from '../../api/MovimientosApi';
import { ResumenApi } from '../../api/ResumenApi';
import { ErrorApi } from '../../api/ClienteHttp';
import { METODOS_PAGO, type CategoriaDTO, type MovimientoDTO, type Pagina, type ResumenFinanciero, type TipoMovimiento } from '../../api/tipos';
import { DialogoConfirmacion } from '../../components/DialogoConfirmacion';
import { useAviso } from '../../components/Aviso';
import { formatoFecha, formatoMoneda, rangoPeriodo, type ClavePeriodo } from '../../components/formato';
import { Icono, IconoCategoria } from '../../components/Iconos';
import { Indicador } from '../../components/Indicador';
import { SelectorPeriodo } from '../../components/SelectorPeriodo';
import { useMovimientos } from './ContextoMovimientos';

const TAMANO = 10;
const textoMetodo = (m: MovimientoDTO) =>
  m.tipo === 'INGRESO' ? m.fuente ?? '—' : METODOS_PAGO.find((x) => x.valor === m.metodoPago)?.texto ?? '—';

/** HU-16 and HU-17 (history and filters), plus HU-08 and HU-09 (edit, delete). */
export function HistorialPage() {
  const [periodo, setPeriodo] = useState<ClavePeriodo>('mes');
  const [tipo, setTipo] = useState<TipoMovimiento | undefined>();
  const [idCategoria, setIdCategoria] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [texto, setTexto] = useState('');
  const [numeroPagina, setNumeroPagina] = useState(0);
  const [pagina, setPagina] = useState<Pagina<MovimientoDTO> | null>(null);
  const [resumen, setResumen] = useState<ResumenFinanciero | null>(null);
  const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [porEliminar, setPorEliminar] = useState<MovimientoDTO | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const aviso = useAviso();
  const { abrir, version, avisarCambio } = useMovimientos();
  const rango = useMemo(() => rangoPeriodo(periodo), [periodo]);

  // The search runs on the server over the whole period (not only the visible page), 300 ms after the last key.
  useEffect(() => {
    const t = setTimeout(() => { setTexto(busqueda.trim()); setNumeroPagina(0); }, 300);
    return () => clearTimeout(t);
  }, [busqueda]);

  const cargar = useCallback(async (vigente: () => boolean) => {
    setError(null);
    try {
      const [p, r] = await Promise.all([
        MovimientosApi.listar({ ...rango, tipo, idCategoria: idCategoria || undefined, texto: texto || undefined }, numeroPagina, TAMANO),
        ResumenApi.obtener(rango.desde, rango.hasta),
      ]);
      if (!vigente()) return;   // a newer filter was chosen while this request was in flight
      if (p.elementos.length === 0 && numeroPagina > 0) return setNumeroPagina(numeroPagina - 1);   // last row of the last page deleted
      setPagina(p);
      setResumen(r);
    } catch (e) {
      if (vigente()) setError(e instanceof ErrorApi ? e.message : 'No se pudo cargar el historial');
    }
  }, [rango, tipo, idCategoria, texto, numeroPagina]);

  useEffect(() => {
    let vigente = true;
    void cargar(() => vigente);
    return () => { vigente = false; };
  }, [cargar, version]);
  useEffect(() => { CategoriasApi.listar().then(setCategorias).catch(() => undefined); }, [version]);

  function cambiarPeriodo(p: ClavePeriodo) { setPeriodo(p); setNumeroPagina(0); }
  function cambiarCategoria(id: string) { setIdCategoria(id); setNumeroPagina(0); }
  function cambiarTipo(t: TipoMovimiento | undefined) {
    setTipo(t);
    setNumeroPagina(0);
    // A category of the other type would stay selected but hidden in the list, and the table would look empty.
    if (t && categorias.find((c) => c.id === idCategoria)?.tipo !== t) setIdCategoria('');
  }
  function limpiarFiltros() { setTipo(undefined); setIdCategoria(''); setBusqueda(''); setTexto(''); setNumeroPagina(0); }

  async function eliminar() {
    if (!porEliminar) return;
    setEliminando(true);
    try {
      await MovimientosApi.eliminar(porEliminar.id);
      aviso('Movimiento eliminado');
      setPorEliminar(null);
      avisarCambio();
    } catch (e) {
      aviso(e instanceof ErrorApi ? e.message : 'No se pudo eliminar', 'error');
    } finally {
      setEliminando(false);
    }
  }

  const filas = pagina?.elementos ?? [];
  const totalPaginas = pagina ? Math.max(1, Math.ceil(pagina.totalElementos / TAMANO)) : 1;
  const desdeN = pagina && pagina.totalElementos ? numeroPagina * TAMANO + 1 : 0;
  const hastaN = pagina ? Math.min(pagina.totalElementos, (numeroPagina + 1) * TAMANO) : 0;
  const filtroActivo = !!tipo || !!idCategoria || !!busqueda.trim();

  return (
    <>
      <div className="rejilla rejilla-3 kpis">
        <Indicador titulo="Balance del periodo" valor={resumen?.balance ?? 0} icono="billetera" tono="verde" destacado cargando={!resumen} />
        <Indicador titulo="Total ingresos" valor={resumen?.totalIngresos ?? 0} icono="arriba" tono="verde" variacion={resumen?.variacionIngresos} cargando={!resumen} />
        <Indicador titulo="Total gastos" valor={resumen?.totalGastos ?? 0} icono="abajo" tono="rojo" className="gastos"
          variacion={resumen?.variacionGastos} subeEsMalo cargando={!resumen} />
      </div>

      <section className="tarjeta">
        <div className="barra-herramientas" style={{ marginBottom: 14 }}>
          <div className="segmentos" role="group" aria-label="Tipo">
            {([[undefined, 'Todos'], ['INGRESO', 'Ingresos'], ['GASTO', 'Gastos']] as const).map(([t, txt]) => (
              <button key={txt} aria-pressed={tipo === t} onClick={() => cambiarTipo(t)}>{txt}</button>
            ))}
          </div>
          <SelectorPeriodo valor={periodo} onCambio={cambiarPeriodo} />
        </div>
        <div className="barra-herramientas" style={{ marginBottom: 16 }}>
          <div className="control">
            <Icono nombre="buscar" />
            <input type="search" placeholder="Buscar por descripción, fuente o categoría…" value={busqueda} maxLength={60}
              onChange={(e) => setBusqueda(e.target.value)} aria-label="Buscar movimiento" />
          </div>
          <div className="control" style={{ maxWidth: 260, flex: 'none', minWidth: 200 }}>
            <Icono nombre="categorias" />
            <select value={idCategoria} onChange={(e) => cambiarCategoria(e.target.value)} aria-label="Categoría">
              <option value="">Todas las categorías</option>
              {categorias.filter((c) => !tipo || c.tipo === tipo).map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            <Icono nombre="chevron" tamano={18} className="control-select-chevron" />
          </div>
          {filtroActivo && (
            <button className="enlace" onClick={limpiarFiltros}>
              <Icono nombre="cerrar" tamano={16} />Limpiar filtros
            </button>
          )}
        </div>

        {error && <div className="alerta alerta-error" role="alert"><Icono nombre="alerta" tamano={18} />{error}</div>}

        {!pagina ? (
          !error && <div className="esqueleto" style={{ height: 260, borderRadius: 12 }} role="status" aria-label="Cargando movimientos" />
        ) : filas.length === 0 ? (
          <div className="vacio">
            <span className="icono-vacio"><Icono nombre="movimientos" tamano={26} /></span>
            <p style={{ margin: 0 }}>{filtroActivo ? 'Ningún movimiento coincide con estos filtros.' : 'No hay movimientos en este periodo.'}</p>
            {filtroActivo
              ? <button className="boton secundario" onClick={limpiarFiltros}><Icono nombre="cerrar" tamano={18} />Limpiar filtros</button>
              : <button className="boton" onClick={() => abrir(null, tipo)}><Icono nombre="mas" tamano={18} />Registrar un movimiento</button>}
          </div>
        ) : (
          <>
            <div className="tabla-contenedor">
              <table className="tabla">
                <thead>
                  <tr><th scope="col">Fecha</th><th scope="col">Descripción</th><th scope="col">Categoría</th><th scope="col">Método / fuente</th><th scope="col">Tipo</th><th scope="col" className="num">Monto</th><th scope="col" className="num">Acciones</th></tr>
                </thead>
                <tbody>
                  {filas.map((m) => (
                    <tr key={m.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatoFecha(m.fecha)}</td>
                      <td>
                        <span className="celda-descripcion">
                          <IconoCategoria icono={m.categoria.icono} color={m.categoria.color} tamano={36} />
                          {m.descripcion ?? m.categoria.nombre}
                        </span>
                      </td>
                      <td><span className="pildora categoria" style={{ ['--c' as string]: m.categoria.color }}>{m.categoria.nombre}</span></td>
                      <td className="sutil">{textoMetodo(m)}</td>
                      <td><span className={`pildora ${m.tipo === 'GASTO' ? 'gasto' : 'ingreso'}`}>{m.tipo === 'GASTO' ? 'Gasto' : 'Ingreso'}</span></td>
                      <td className={`num ${m.tipo === 'GASTO' ? 'negativo' : 'positivo'}`} style={{ fontWeight: 700 }}>
                        {m.tipo === 'GASTO' ? '−' : '+'}{formatoMoneda(m.monto)}
                      </td>
                      <td className="num">
                        <button className="boton-icono" aria-label={`Editar ${m.descripcion ?? m.categoria.nombre}`} onClick={() => abrir(m)}><Icono nombre="editar" tamano={18} /></button>
                        <button className="boton-icono peligro" aria-label={`Eliminar ${m.descripcion ?? m.categoria.nombre}`} onClick={() => setPorEliminar(m)}><Icono nombre="eliminar" tamano={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="lista-movimientos">
              {filas.map((m) => (
                <li key={m.id}>
                  <button className="editar" onClick={() => abrir(m)} aria-label={`Editar ${m.descripcion ?? m.categoria.nombre}`}>
                    <IconoCategoria icono={m.categoria.icono} color={m.categoria.color} tamano={42} />
                    <div className="info"><strong>{m.descripcion ?? m.categoria.nombre}</strong><span>{formatoFecha(m.fecha)} · {m.categoria.nombre}</span></div>
                    <span className={`monto ${m.tipo === 'GASTO' ? 'negativo' : 'positivo'}`}>{m.tipo === 'GASTO' ? '−' : '+'}{formatoMoneda(m.monto)}</span>
                  </button>
                  <button className="boton-icono peligro" aria-label={`Eliminar ${m.descripcion ?? m.categoria.nombre}`} onClick={() => setPorEliminar(m)}><Icono nombre="eliminar" tamano={18} /></button>
                </li>
              ))}
            </ul>
          </>
        )}

        {pagina && pagina.totalElementos > 0 && (
          <div className="paginacion">
            <span>Mostrando {desdeN} – {hastaN} de {pagina.totalElementos} movimientos</span>
            <div className="paginas">
              <button aria-label="Página anterior" disabled={numeroPagina === 0} onClick={() => setNumeroPagina((p) => p - 1)}><Icono nombre="izquierda" tamano={16} /></button>
              {Array.from({ length: totalPaginas }, (_, i) => i).filter((i) => Math.abs(i - numeroPagina) <= 2 || i === 0 || i === totalPaginas - 1).map((i) => (
                <button key={i} aria-current={i === numeroPagina ? 'page' : undefined} onClick={() => setNumeroPagina(i)}>{i + 1}</button>
              ))}
              <button aria-label="Página siguiente" disabled={numeroPagina + 1 >= totalPaginas} onClick={() => setNumeroPagina((p) => p + 1)}><Icono nombre="derecha" tamano={16} /></button>
            </div>
          </div>
        )}
      </section>

      <DialogoConfirmacion abierto={!!porEliminar} titulo="¿Eliminar este movimiento?" textoConfirmar="Sí, eliminar" peligro
        ocupado={eliminando} onConfirmar={eliminar} onCancelar={() => setPorEliminar(null)}>
        {porEliminar && <p><b>{porEliminar.descripcion ?? porEliminar.categoria.nombre}</b> · {formatoMoneda(porEliminar.monto)}. Desaparecerá del historial, de los totales y de tus presupuestos.</p>}
      </DialogoConfirmacion>
    </>
  );
}
