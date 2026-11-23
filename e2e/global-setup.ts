import type { FullConfig } from '@playwright/test';

/** Fails fast when the API behind the web server is down, instead of 30 s timeouts in every test. */
export default async function globalSetup(config: FullConfig) {
  const base = config.projects[0].use.baseURL!;
  let estado = 0;
  try {
    estado = (await fetch(`${base}/api/v1/categorias`)).status;
  } catch {
    throw new Error(`No responde la web en ${base}. Arranca el frontend (o iniciar.cmd) antes de las pruebas.`);
  }
  // 401 = the API answered through the proxy (no token sent); 5xx = the proxy could not reach the API.
  if (estado !== 401) {
    throw new Error(`La API no responde detrás de ${base} (HTTP ${estado}). Arranca la API y MongoDB antes de las pruebas.`);
  }
}
