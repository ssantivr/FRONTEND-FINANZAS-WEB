// Same shapes as the API DTOs. Amounts travel as numbers in responses and as strings in requests.
export type TipoMovimiento = 'GASTO' | 'INGRESO';
export type MetodoPago = 'EFECTIVO' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'TRANSFERENCIA' | 'OTRO';
export type EstadoPresupuesto = 'OK' | 'ALERTA' | 'EXCEDIDO';

export interface SesionDTO { accessToken: string; expiraEn: string }
export interface UsuarioDTO { id: string; nombre: string; correo: string; fechaRegistro: string }
export interface RegistroCmd { nombre: string; correo: string; clave: string }

export interface CategoriaDTO { id: string; nombre: string; tipo: TipoMovimiento; icono?: string; color: string; predeterminada: boolean }

export interface MovimientoDTO {
  id: string; tipo: TipoMovimiento; monto: number; fecha: string; descripcion?: string;
  categoria: CategoriaDTO; metodoPago?: MetodoPago; fuente?: string;
}
export interface MovimientoCmd {
  tipo: TipoMovimiento; monto: string; fecha: string; descripcion?: string;
  idCategoria: string; metodoPago?: MetodoPago; fuente?: string;
}
export interface FiltroMovimientos { desde?: string; hasta?: string; tipo?: TipoMovimiento; idCategoria?: string; texto?: string }
export interface Pagina<T> { elementos: T[]; pagina: number; tamano: number; totalElementos: number }

export interface PresupuestoDTO {
  id: string; categoria: CategoriaDTO; periodo: string; limite: number; consumo: number;
  porcentaje: number; estado: EstadoPresupuesto;
}
export interface TotalPorCategoria { categoria: CategoriaDTO; total: number; porcentaje: number }
export interface ResumenFinanciero {
  desde: string; hasta: string; totalIngresos: number; totalGastos: number; balance: number;
  porCategoria: TotalPorCategoria[]; presupuestos: PresupuestoDTO[];
  /** % change against the previous range of the same length; absent when that range had no data. */
  variacionIngresos?: number; variacionGastos?: number;
  promedioDiarioGastos: number; tendencia: PuntoTendencia[];
}
export interface PuntoTendencia { etiqueta: string; desde: string; hasta: string; ingresos: number; gastos: number }

export const METODOS_PAGO: { valor: MetodoPago; texto: string }[] = [
  { valor: 'EFECTIVO', texto: 'Efectivo' },
  { valor: 'TARJETA_DEBITO', texto: 'Tarjeta débito' },
  { valor: 'TARJETA_CREDITO', texto: 'Tarjeta crédito' },
  { valor: 'TRANSFERENCIA', texto: 'Transferencia' },
  { valor: 'OTRO', texto: 'Otro' },
];
