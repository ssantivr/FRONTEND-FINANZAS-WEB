import { ClienteHttp } from './ClienteHttp';
import type { PresupuestoDTO } from './tipos';

export const PresupuestosApi = {
  listar: (periodo: string) => ClienteHttp.get<PresupuestoDTO[]>('/presupuestos', { periodo }),
  definir: (idCategoria: string, periodo: string, limite: string) =>
    ClienteHttp.put<PresupuestoDTO>('/presupuestos', { idCategoria, periodo, limite }),
  eliminar: (id: string) => ClienteHttp.delete(`/presupuestos/${id}`),
};
