import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useTrampaFoco } from '../../components/useTrampaFoco';
import { CategoriasApi } from '../../api/CategoriasApi';
import { ErrorApi } from '../../api/ClienteHttp';
import type { CategoriaDTO, TipoMovimiento } from '../../api/tipos';
import { DialogoConfirmacion } from '../../components/DialogoConfirmacion';
import { useAviso } from '../../components/Aviso';
import { Campo, Seleccion } from '../../components/Campo';
import { Icono, IconoCategoria } from '../../components/Iconos';
import { PALETA } from '../../components/formato';

const NOMBRES_COLOR: Record<string, string> = {
  '#14b8a6': 'Turquesa', '#f59e0b': 'Ámbar', '#6366f1': 'Índigo', '#e11d48': 'Rojo', '#0ea5e9': 'Celeste',
  '#a855f7': 'Morado', '#10b981': 'Verde', '#f97316': 'Naranja', '#64748b': 'Gris', '#ec4899': 'Rosado',
};

type Edicion = { id?: string; nombre: string; tipo: TipoMovimiento; color: string };

/** HU-10 to HU-12 (mockup "Gestión de categorías"). */
export function CategoriasPage() {
  const [filtro, setFiltro] = useState<'' | TipoMovimiento>('');
  const [busqueda, setBusqueda] = useState('');
  const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);
  const [edicion, setEdicion] = useState<Edicion | null>(null);
  const [errorEdicion, setErrorEdicion] = useState<string | null>(null);
  const [porEliminar, setPorEliminar] = useState<CategoriaDTO | null>(null);
  const [necesitaDestino, setNecesitaDestino] = useState(false);
  const [destino, setDestino] = useState('');
  const aviso = useAviso();
  const cajaEdicion = useRef<HTMLFormElement>(null);
  useTrampaFoco(cajaEdicion, !!edicion, () => setEdicion(null));

  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const cargar = useCallback(() => CategoriasApi.listar()
    .then((lista) => { setCategorias(lista); setErrorCarga(null); })
    .catch((e) => setErrorCarga(e instanceof ErrorApi ? e.message : 'No se pudieron cargar las categorías')), []);
  useEffect(() => { void cargar(); }, [cargar]);

  const [ocupado, setOcupado] = useState(false);
  const mensaje = (e: unknown) => (e instanceof ErrorApi ? e.message : 'Ocurrió un error');

  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (!edicion) return;
    setErrorEdicion(null);
    const nombre = edicion.nombre.trim();
    if (!nombre || nombre.length > 40) return setErrorEdicion('El nombre debe tener entre 1 y 40 caracteres');
    setOcupado(true);
    try {
      if (edicion.id) {
        await CategoriasApi.renombrar(edicion.id, nombre);
        aviso('Categoría renombrada');
      } else {
        await CategoriasApi.crear(nombre, edicion.tipo, edicion.color);
        aviso('Categoría creada');
      }
      setEdicion(null);
      await cargar();
    } catch (err) {
      setErrorEdicion(mensaje(err));
    } finally {
      setOcupado(false);
    }
  }

  async function eliminar() {
    if (!porEliminar) return;
    if (necesitaDestino && !destino) return aviso('Elige a qué categoría pasar los movimientos', 'error');
    setOcupado(true);
    try {
      await CategoriasApi.eliminar(porEliminar.id, necesitaDestino ? destino : undefined);
      aviso('Categoría eliminada');
      cerrarDialogo();
      await cargar();
    } catch (err) {
      if (err instanceof ErrorApi && err.codigo === 'DESTINO_OBLIGATORIO') {
        setNecesitaDestino(true);   // HU-12: it has movements, ask where to move them
      } else {
        aviso(mensaje(err), 'error');
      }
    } finally {
      setOcupado(false);
    }
  }

  function cerrarDialogo() {
    setPorEliminar(null);
    setNecesitaDestino(false);
    setDestino('');
  }

  const texto = busqueda.trim().toLowerCase();
  const visibles = categorias.filter((c) => (!filtro || c.tipo === filtro) && (!texto || c.nombre.toLowerCase().includes(texto)));
  const propias = categorias.filter((c) => !c.predeterminada);

  return (
    <>
      {errorCarga && (
        <div className="alerta alerta-error" role="alert"><Icono nombre="alerta" tamano={18} />
          <span>{errorCarga}</span>
          <button className="enlace" onClick={() => void cargar()}>Reintentar</button>
        </div>
      )}
      <div className="barra-herramientas">
        <div className="control">
          <Icono nombre="buscar" />
          <input placeholder="Buscar categoría…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} aria-label="Buscar categoría" />
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div className="control" style={{ minWidth: 160, flex: 'none' }}>
            <select value={filtro} onChange={(e) => setFiltro(e.target.value as '' | TipoMovimiento)} aria-label="Tipo de categoría">
              <option value="">Todas</option><option value="GASTO">Gastos</option><option value="INGRESO">Ingresos</option>
            </select>
            <Icono nombre="chevron" tamano={18} className="control-select-chevron" />
          </div>
          <button className="boton" onClick={() => { setErrorEdicion(null); setEdicion({ nombre: '', tipo: filtro || 'GASTO', color: PALETA[propias.length % PALETA.length] }); }}>
            <Icono nombre="mas" tamano={18} />Nueva categoría
          </button>
        </div>
      </div>

      {visibles.length === 0 ? (
        <div className="tarjeta vacio"><span className="icono-vacio"><Icono nombre="categorias" tamano={26} /></span>No hay categorías con ese nombre.</div>
      ) : (
        // With "Todas" the cards are grouped by type, each group with its count.
        (filtro ? [[filtro, visibles]] as const : ([['GASTO', visibles.filter((c) => c.tipo === 'GASTO')], ['INGRESO', visibles.filter((c) => c.tipo === 'INGRESO')]] as const))
          .filter(([, lista]) => lista.length > 0).map(([tipoGrupo, lista]) => (
        <section key={tipoGrupo} className="grupo-categorias" aria-label={tipoGrupo === 'GASTO' ? 'Categorías de gasto' : 'Categorías de ingreso'}>
          {!filtro && <h2><Icono nombre={tipoGrupo === 'GASTO' ? 'abajo' : 'arriba'} tamano={18} />{tipoGrupo === 'GASTO' ? 'Gastos' : 'Ingresos'}<span className="contador">{lista.length}</span></h2>}
        <div className="rejilla-categorias">
          {lista.map((c) => (
            <article key={c.id} className="tarjeta-categoria" style={{ background: `linear-gradient(135deg, var(--superficie) 55%, ${c.color}12)` }}>
              <div className="fila">
                <IconoCategoria icono={c.icono} color={c.color} tamano={46} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ display: 'block' }}>{c.nombre}</strong>
                  <span className={`pildora ${c.tipo === 'GASTO' ? 'gasto' : 'ingreso'}`} style={{ marginTop: 4 }}>{c.tipo === 'GASTO' ? 'Gasto' : 'Ingreso'}</span>
                </div>
              </div>
              <div className="pie">
                {c.predeterminada ? <span className="pildora predeterminada" title="Las categorías del sistema no se pueden editar ni eliminar"><Icono nombre="candado" tamano={12} />Predeterminada</span> : (
                  <>
                    <button className="enlace" onClick={() => { setErrorEdicion(null); setEdicion({ id: c.id, nombre: c.nombre, tipo: c.tipo, color: c.color }); }}>
                      <Icono nombre="editar" tamano={14} />Editar
                    </button>
                    <span>·</span>
                    <button className="enlace peligro" onClick={() => setPorEliminar(c)}><Icono nombre="eliminar" tamano={14} />Eliminar</button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
        </section>
        ))
      )}

      <div className="rejilla rejilla-2">
        <section className="tarjeta">
          <div className="tarjeta-titulo"><h2><Icono nombre="reportes" />Estadísticas</h2></div>
          <p style={{ margin: 0, fontSize: 15 }}><b>{propias.length}</b> {propias.length === 1 ? 'categoría creada' : 'categorías creadas'} por ti
            · {categorias.length - propias.length} predeterminadas</p>
        </section>
        <section className="tarjeta tarjeta-menta">
          <div className="tarjeta-titulo"><h2><Icono nombre="bombilla" />Consejo</h2></div>
          <p style={{ margin: 0, fontSize: 14 }}>Crea categorías propias (Mascotas, Gimnasio…) para llevar un mejor control. Las predeterminadas no se pueden editar.</p>
        </section>
      </div>

      {edicion && (
        <div className="fondo-modal" onMouseDown={(e) => e.target === e.currentTarget && setEdicion(null)}>
          <form ref={cajaEdicion} className="modal" onSubmit={guardar} role="dialog" aria-modal="true" aria-labelledby="titulo-categoria">
            <div className="modal-cabecera">
              <h3 id="titulo-categoria">{edicion.id ? 'Renombrar categoría' : 'Nueva categoría'}</h3>
              <button type="button" className="boton-icono" aria-label="Cerrar" onClick={() => setEdicion(null)}><Icono nombre="cerrar" /></button>
            </div>
            <div className="cabecera-tipo">
              <IconoCategoria icono={undefined} color={edicion.color} tamano={52} />
              <div><strong>{edicion.nombre.trim() || 'Tu categoría'}</strong><span className="sutil">{edicion.tipo === 'GASTO' ? 'Categoría de gasto' : 'Categoría de ingreso'}</span></div>
            </div>
            <Campo etiqueta="Nombre" icono="etiqueta" autoFocus maxLength={40} placeholder="Ej. Mascotas" valor={edicion.nombre}
              onCambio={(v) => setEdicion({ ...edicion, nombre: v })} ayuda={`${edicion.nombre.trim().length}/40`} />
            {!edicion.id && (
              <>
                <Seleccion etiqueta="Tipo" icono="movimientos" valor={edicion.tipo} onCambio={(v) => setEdicion({ ...edicion, tipo: v as TipoMovimiento })}>
                  <option value="GASTO">Gasto</option><option value="INGRESO">Ingreso</option>
                </Seleccion>
                <div className="campo">
                  <span>Color</span>
                  <div className="selector-color" role="radiogroup" aria-label="Color">
                    {PALETA.map((c) => (
                      <button type="button" key={c} role="radio" aria-checked={edicion.color === c} aria-label={NOMBRES_COLOR[c] ?? c} title={NOMBRES_COLOR[c] ?? c} style={{ background: c }}
                        onClick={() => setEdicion({ ...edicion, color: c })} />
                    ))}
                  </div>
                </div>
              </>
            )}
            {errorEdicion && <div className="alerta alerta-error" role="alert"><Icono nombre="alerta" tamano={18} />{errorEdicion}</div>}
            <div className="acciones">
              <button type="button" className="boton secundario" onClick={() => setEdicion(null)}>Cancelar</button>
              <button className="boton" disabled={ocupado}><Icono nombre="check" tamano={18} />{ocupado ? 'Guardando…' : edicion.id ? 'Guardar' : 'Crear categoría'}</button>
            </div>
          </form>
        </div>
      )}

      <DialogoConfirmacion abierto={!!porEliminar} titulo={`¿Eliminar «${porEliminar?.nombre ?? ''}»?`} peligro ocupado={ocupado}
        textoConfirmar={necesitaDestino ? 'Reasignar y eliminar' : 'Sí, eliminar'} onConfirmar={eliminar} onCancelar={cerrarDialogo}>
        {necesitaDestino ? (
          <Seleccion etiqueta="Esta categoría tiene movimientos. Pásalos a:" valor={destino} onCambio={setDestino} icono="categorias">
            <option value="">Elige una categoría</option>
            {categorias.filter((c) => c.id !== porEliminar?.id && c.tipo === porEliminar?.tipo).map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </Seleccion>
        ) : <p>Sus presupuestos también se eliminarán. Si tiene movimientos, te pediremos a qué categoría pasarlos.</p>}
      </DialogoConfirmacion>
    </>
  );
}
