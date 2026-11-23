import { AlmacenTokens } from './AlmacenTokens';
import { ClienteHttp } from './ClienteHttp';
import type { SesionDTO, UsuarioDTO } from './tipos';

export const CuentaApi = {
  obtener: () => ClienteHttp.get<UsuarioDTO>('/cuenta'),
  actualizarNombre: (nombre: string) => ClienteHttp.patch<UsuarioDTO>('/cuenta', { nombre }),
  async cambiarContrasena(actual: string, nueva: string): Promise<void> {
    const s = await ClienteHttp.put<SesionDTO>('/cuenta/contrasena', { actual, nueva });
    AlmacenTokens.guardar(s.accessToken);
  },
  async eliminar(): Promise<void> {
    await ClienteHttp.delete('/cuenta');
    AlmacenTokens.borrar();
  },
};
