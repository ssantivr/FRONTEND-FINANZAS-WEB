import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ResumenApi } from '../../api/ResumenApi';
import { MovimientosApi } from '../../api/MovimientosApi';
import { ErrorApi } from '../../api/ClienteHttp';
import type { MovimientoDTO, ResumenFinanciero, TotalPorCategoria } from '../../api/tipos';
import { formatoFecha, formatoMoneda, rangoPeriodo, type ClavePeriodo, formatoPorcentaje, nombreMes } from '../../components/formato';
import { BarrasDobles, Dona, type Segmento } from '../../components/Graficos';
import { Icono, IconoCategoria } from '../../components/Iconos';
import { Indicador } from '../../components/Indicador';
import { SelectorPeriodo } from '../../components/SelectorPeriodo';
import { useMovimientos } from '../movimientos/ContextoMovimientos';

/** Top categories plus "Otros" so the donut stays readable. */
export function segmentosDe(porCategoria: TotalPorCategoria[], maximo = 5): Segmento[] {
  const top = porCategoria.slice(0, maximo);
  const resto = porCategoria.slice(maximo).reduce((s, t) => s + t.total, 0);
  const seg = top.map((t) => ({ clave: t.categoria.id, valor: t.total, color: t.categoria.color, etiqueta: t.categoria.nombre }));
  return resto > 0 ? [...seg, { clave: 'otros', valor: resto, color: '#94a3b8', etiqueta: 'Otras' }] : seg;
}

/** HU-18 (summary) with a preview of HU-19 and the latest movements. */
export function ResumenPage() {
  const [periodo, setPeriodo] = useState<ClavePeriodo>('mes');
  const [resumen, setResumen] = useState<ResumenFinanciero | null>(null);
  const [ultimos, setUltimos] = useState<MovimientoDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [errorUltimos, setErrorUltimos] = useState(false);
  const { abrir, version } = useMovimientos();
  const rango = useMemo(() => rangoPeriodo(periodo), [periodo]);

  useEffect(() => {
    let vigente = true;   // a slower answer for a previous period must not overwrite the current one
    setError(null);
    ResumenApi.obtener(rango.desde, rango.hasta).then((r) => vigente && setResumen(r))
      .catch((e) => vigente && setError(e instanceof ErrorApi ? e.message : 'No se pudo cargar el resumen'));
    setErrorUltimos(false);
    MovimientosApi.listar(rango, 0, 5).then((p) => vigente && setUltimos(p.elementos)).catch(() => vigente && setErrorUltimos(true));
    return () => { vigente = false; };
  }, [rango, version]);

  const ahorro = resumen && resumen.totalIngresos > 0 ? Math.max(0, Math.round((resumen.balance / resumen.totalIngresos) * 100)) : 0;
  const segmentos = resumen ? segmentosDe(resumen.porCategoria, 4) : [];

  return (
    <>
      <div className="barra-herramientas" style={{ justifyContent: 'flex-end' }}>
        <SelectorPeriodo valor={periodo} onCambio={setPeriodo} />
      </div>
      {error && <div className="alerta alerta-error" role="alert"><Icono nombre="alerta" tamano={18} />{error}</div>}

      {!resumen && !error && <Cargando />}
      {resumen && <>
      <div className="rejilla rejilla-3 kpis">
        <Indicador titulo="Balance actual" valor={resumen.balance} icono="billetera" tono="verde" destacado />
        <Indicador titulo="Total ingresos" valor={resumen.totalIngresos} icono="arriba" tono="verde" variacion={resumen.variacionIngresos} />
        <Indicador titulo="Total gastos" valor={resumen.totalGastos} icono="abajo" tono="rojo" className="gastos"
          variacion={resumen?.variacionGastos} subeEsMalo />
      </div>

      <div className="rejilla rejilla-2">
        <section className="tarjeta">
          <div className="tarjeta-titulo">
            <h2>Gastos por categoría</h2>
            <Link className="enlace" to="/reportes">Ver más <Icono nombre="derecha" tamano={16} /></Link>
          </div>
          {segmentos.length === 0 ? (
            <div className="vacio">
              <span className="icono-vacio"><Icono nombre="presupuestos" tamano={26} /></span>
              Sin gastos en este periodo.
            </div>
          ) : (
            <div className="dona-con-lista">
              <Dona segmentos={segmentos} tamano={180} grosor={28}>
                <strong>{formatoPorcentaje(resumen.porCategoria[0]?.porcentaje ?? 0)}</strong>
                <span>{resumen.porCategoria[0]?.categoria.nombre}</span>
              </Dona>
              <ul className="lista-categorias">
                {segmentos.map((s) => (
                  <li key={s.clave} style={{ gridTemplateColumns: 'auto 1fr auto' }}>
                    <span className="punto" style={{ background: s.color }} />
                    <span>{s.etiqueta}</span>
                    <span className="pct">{formatoPorcentaje((s.valor / (resumen.totalGastos || 1)) * 100)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="tarjeta">
          <div className="tarjeta-titulo">
            <h2>Resumen del periodo</h2>
            <div className="leyenda"><span><i style={{ background: '#22c55e' }} />Ingresos</span><span><i style={{ background: '#3b82f6' }} />Gastos</span></div>
          </div>
          <BarrasDobles puntos={resumen.tendencia} />
        </section>
      </div>

      <section className="tarjeta tarjeta-menta">
        <div className="fila-espaciada">
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 17, display: 'flex', gap: 8, alignItems: 'center' }}><Icono nombre="grafica" />Tu progreso financiero</h2>
            <p style={{ margin: '6px 0 10px' }}>
              {resumen.totalIngresos > 0
                ? <>Has ahorrado el <b>{ahorro} %</b> de tus ingresos en este periodo.</>
                : 'Registra tus ingresos para ver cuánto ahorras.'}
            </p>
            <div className="barra" style={{ maxWidth: 420 }}><div className="relleno" style={{ width: `${ahorro}%` }} /></div>
          </div>
          <div className="tarjeta" style={{ padding: '14px 20px', textAlign: 'center', boxShadow: 'none' }}>
            <span className="sutil">Ahorro actual</span>
            <strong style={{ display: 'block', fontSize: 20 }}>{formatoMoneda(Math.max(0, resumen.balance))} COP</strong>
          </div>
        </div>
      </section>

      <div className="rejilla rejilla-3-2">
        <section className="tarjeta">
          <div className="tarjeta-titulo">
            <h2>Últimos movimientos</h2>
            <Link className="enlace" to="/movimientos">Ver todos <Icono nombre="derecha" tamano={16} /></Link>
          </div>
          {errorUltimos ? (
            <div className="alerta alerta-error" role="alert"><Icono nombre="alerta" tamano={18} />No se pudieron cargar los últimos movimientos.</div>
          ) : ultimos.length === 0 ? (
            <div className="vacio">
              <span className="icono-vacio"><Icono nombre="movimientos" tamano={26} /></span>
              Aún no tienes movimientos en este periodo.
              <button className="boton pequeno" onClick={() => abrir()}><Icono nombre="mas" tamano={16} />Registrar el primero</button>
            </div>
          ) : (
            <ul className="lista-simple">
              {ultimos.map((m) => (
                <li key={m.id}>
                  <IconoCategoria icono={m.categoria.icono} color={m.categoria.color} tamano={40} />
                  <div className="info">
                    <strong>{m.descripcion ?? m.categoria.nombre}</strong>
                    <span className="sutil">{formatoFecha(m.fecha)} · {m.categoria.nombre}</span>
                  </div>
                  <span className={`monto ${m.tipo === 'GASTO' ? 'negativo' : 'positivo'}`}>
                    {m.tipo === 'GASTO' ? '−' : '+'}{formatoMoneda(m.monto)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="tarjeta">
          <div className="tarjeta-titulo">
            {/* Budgets are monthly: with a multi-month period they belong to the month the period ends in. */}
            <h2>Presupuestos de {nombreMes(rango.hasta.slice(0, 7)).toLowerCase()}</h2>
            <Link className="enlace" to="/presupuestos">Gestionar <Icono nombre="derecha" tamano={16} /></Link>
          </div>
          {resumen.presupuestos.length === 0 ? (
            <div className="vacio">
              <span className="icono-vacio"><Icono nombre="objetivo" tamano={26} /></span>
              Sin presupuestos. <Link to="/presupuestos">Definir uno</Link>
            </div>
          ) : (
            <ul className="lista-categorias" style={{ gap: 14 }}>
              {resumen.presupuestos.map((p) => (
                <li key={p.id} style={{ display: 'block', borderBottom: 'none', padding: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span>{p.categoria.nombre}</span>
                    <span className={`estado estado-${p.estado.toLowerCase()}`}>{formatoPorcentaje(p.porcentaje)}</span>
                  </div>
                  <div className="barra"><div className={`relleno ${p.estado === 'OK' ? '' : p.estado.toLowerCase()}`} style={{ width: `${Math.min(100, p.porcentaje)}%` }} /></div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      </>}
    </>
  );
}

/** Placeholder while the first summary arrives, so the page never shows $0 as if it were real data. */
export function Cargando() {
  return (
    <div role="status" aria-live="polite" style={{ display: 'grid', gap: 20 }}>
      <span className="sr-solo">Cargando tus datos…</span>
      <div className="rejilla rejilla-3">{[0, 1, 2].map((i) => <div key={i} className="esqueleto" style={{ height: 96 }} />)}</div>
      <div className="rejilla rejilla-2">{[0, 1].map((i) => <div key={i} className="esqueleto" style={{ height: 260 }} />)}</div>
    </div>
  );
}
