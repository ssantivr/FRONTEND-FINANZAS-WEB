import { useEffect, useMemo, useState } from 'react';
import { ResumenApi } from '../../api/ResumenApi';
import { ErrorApi } from '../../api/ClienteHttp';
import type { ResumenFinanciero } from '../../api/tipos';
import { formatoMoneda, rangoPeriodo, type ClavePeriodo, formatoPorcentaje } from '../../components/formato';
import { Dona, Linea } from '../../components/Graficos';
import { Icono, IconoCategoria } from '../../components/Iconos';
import { Indicador } from '../../components/Indicador';
import { SelectorPeriodo } from '../../components/SelectorPeriodo';
import { useMovimientos } from '../movimientos/ContextoMovimientos';
import { Cargando, segmentosDe } from './ResumenPage';

/** HU-19: expenses by category, with the trend of the period (mockup "Gasto por categoría"). */
export function ReportesPage() {
  const [periodo, setPeriodo] = useState<ClavePeriodo>('mes');
  const [resumen, setResumen] = useState<ResumenFinanciero | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { version } = useMovimientos();
  const rango = useMemo(() => rangoPeriodo(periodo), [periodo]);

  useEffect(() => {
    let vigente = true;
    setError(null);
    ResumenApi.obtener(rango.desde, rango.hasta).then((r) => vigente && setResumen(r))
      .catch((e) => vigente && setError(e instanceof ErrorApi ? e.message : 'No se pudo cargar el reporte'));
    return () => { vigente = false; };
  }, [rango, version]);

  const mayor = resumen?.porCategoria[0];
  return (
    <>
      <div className="barra-herramientas" style={{ justifyContent: 'flex-end' }}>
        <SelectorPeriodo valor={periodo} onCambio={setPeriodo} />
      </div>
      {error && <div className="alerta alerta-error" role="alert"><Icono nombre="alerta" tamano={18} />{error}</div>}
      {!resumen && !error && <Cargando />}
      {resumen && <>

      <div className="rejilla rejilla-3 kpis">
        <Indicador titulo="Total gastos" valor={resumen?.totalGastos ?? 0} icono="billetera" tono="verde"
          variacion={resumen?.variacionGastos} subeEsMalo />
        <Indicador titulo="Categorías con gasto" valor={0} texto={String(resumen?.porCategoria.length ?? 0)} icono="categorias" tono="verde" />
        <Indicador titulo="Promedio diario" valor={resumen?.promedioDiarioGastos ?? 0} icono="grafica" tono="rojo" className="gastos" />
      </div>

      <section className="tarjeta">
        {!resumen || resumen.porCategoria.length === 0 ? (
          <div className="vacio">
            <span className="icono-vacio"><Icono nombre="presupuestos" tamano={26} /></span>
            No hay gastos en este periodo.
          </div>
        ) : (
          <div className="dona-con-lista" style={{ justifyContent: 'space-around' }}>
            <Dona segmentos={segmentosDe(resumen.porCategoria, 6)} tamano={240} grosor={34}>
              <strong>{formatoMoneda(resumen.totalGastos)}</strong>
              <span>Total gastos</span>
            </Dona>
            <ul className="lista-categorias con-barras" style={{ maxWidth: 520 }}>
              {resumen.porCategoria.map((t) => (
                <li key={t.categoria.id}>
                  <IconoCategoria icono={t.categoria.icono} color={t.categoria.color} tamano={38} />
                  <span>{t.categoria.nombre}</span>
                  <span className="pct">{formatoPorcentaje(t.porcentaje)}</span>
                  <span className="monto">{formatoMoneda(t.total)}</span>
                  <span className="barra-mini" aria-hidden><span style={{ width: `${Math.min(100, t.porcentaje)}%`, ['--c' as string]: t.categoria.color }} /></span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <div className="rejilla rejilla-2-1">
        <section className="tarjeta">
          <div className="tarjeta-titulo"><h2>Tendencia de gastos</h2></div>
          {resumen && <Linea puntos={resumen.tendencia.map((p) => ({ etiqueta: p.etiqueta, valor: p.gastos }))} />}
        </section>
        <section className="tarjeta tarjeta-menta">
          <div className="tarjeta-titulo"><h2><Icono nombre="bombilla" />Dato clave</h2></div>
          {mayor ? (
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <IconoCategoria icono={mayor.categoria.icono} color={mayor.categoria.color} tamano={52} />
              <p style={{ margin: 0, fontSize: 14 }}>
                <b>{mayor.categoria.nombre}</b> representa el <b>{formatoPorcentaje(mayor.porcentaje)}</b> de tus gastos en este periodo.
              </p>
            </div>
          ) : <p className="sutil">Cuando registres gastos verás aquí tu categoría principal.</p>}
        </section>
      </div>
      </>}
    </>
  );
}
