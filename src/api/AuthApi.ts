import { AlmacenTokens } from './AlmacenTokens';
import { ClienteHttp, renovarSesion } from './ClienteHttp';
import type { RegistroCmd, SesionDTO } from './tipos';

export const AuthApi = {
  async registrar(cmd: RegistroCmd): Promise<void> {
    const s = await ClienteHttp.post<SesionDTO>('/auth/registro', cmd);
    AlmacenTokens.guardar(s.accessToken);
  },
  async iniciarSesion(correo: string, clave: string): Promise<void> {
    const s = await ClienteHttp.post<SesionDTO>('/auth/login', { correo, clave });
    AlmacenTokens.guardar(s.accessToken);
  },
  renovar: (): Promise<boolean> => renovarSesion(),
  async cerrarSesion(): Promise<void> {
    try {
      await ClienteHttp.post<void>('/auth/logout');
    } finally {
      AlmacenTokens.borrar();
    }
  },
  solicitarRecuperacion: (correo: string) => ClienteHttp.post<void>('/auth/recuperacion', { correo }),
  restablecer: (token: string, nuevaClave: string) => ClienteHttp.post<void>('/auth/restablecer', { token, nuevaClave }),
};
