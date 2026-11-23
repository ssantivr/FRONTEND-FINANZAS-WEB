import { ClienteHttp } from './ClienteHttp';
import type { CategoriaDTO, TipoMovimiento } from './tipos';

export const CategoriasApi = {
  listar: (tipo?: TipoMovimiento) => ClienteHttp.get<CategoriaDTO[]>('/categorias', { tipo }),
  crear: (nombre: string, tipo: TipoMovimiento, color?: string) => ClienteHttp.post<CategoriaDTO>('/categorias', { nombre, tipo, color }),
  renombrar: (id: string, nombre: string) => ClienteHttp.patch<CategoriaDTO>(`/categorias/${id}`, { nombre }),
  eliminar: (id: string, destino?: string) => ClienteHttp.delete(`/categorias/${id}`, { destino }),
};
