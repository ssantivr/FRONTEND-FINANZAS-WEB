import { ClienteHttp } from './ClienteHttp';
import type { ResumenFinanciero } from './tipos';

export const ResumenApi = {
  obtener: (desde: string, hasta: string) => ClienteHttp.get<ResumenFinanciero>('/resumen', { desde, hasta }),
};
