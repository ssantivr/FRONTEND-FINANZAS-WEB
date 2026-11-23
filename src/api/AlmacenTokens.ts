// The access token lives only in memory (never in localStorage). After a reload the session is restored
// with the HttpOnly refresh cookie, which JavaScript cannot read.
let accessToken: string | null = null;

export const AlmacenTokens = {
  guardar(token: string): void {
    accessToken = token;
  },
  obtener(): string | null {
    return accessToken;
  },
  borrar(): void {
    accessToken = null;
  },
};
