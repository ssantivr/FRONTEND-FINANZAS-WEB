import { ClienteHttp } from './ClienteHttp';
import type { FiltroMovimientos, MovimientoCmd, MovimientoDTO, Pagina } from './tipos';

export const MovimientosApi = {
  listar: (filtro: FiltroMovimientos, pagina: number, tamano = 20) =>
    ClienteHttp.get<Pagina<MovimientoDTO>>('/movimientos', {
      desde: filtro.desde, hasta: filtro.hasta, tipo: filtro.tipo, categoria: filtro.idCategoria, texto: filtro.texto, pagina, tamano,
    }),
  registrar: (cmd: MovimientoCmd) => ClienteHttp.post<MovimientoDTO>('/movimientos', cmd),
  modificar: (id: string, cmd: MovimientoCmd) => ClienteHttp.put<MovimientoDTO>(`/movimientos/${id}`, cmd),
  eliminar: (id: string) => ClienteHttp.delete(`/movimientos/${id}`),
};
