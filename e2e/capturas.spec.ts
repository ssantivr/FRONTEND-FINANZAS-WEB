import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

/**
 * Screenshots of every screen for the report (docs/evidencias/capturas). Not part of the normal run:
 *   set CAPTURAS=1 && npx playwright test capturas
 * Uses the demo account; its local test password is read from the seed script, so it is not repeated here.
 */
test.skip(!process.env.CAPTURAS, 'Solo con CAPTURAS=1');
test.describe.configure({ mode: 'serial' });
test.use({ reducedMotion: 'reduce' });   // no entrance animations: every capture shows the final state
test.setTimeout(120_000);

const SALIDA = '../docs/evidencias/capturas';
const semilla = readFileSync('../base-de-datos/05_datos_demo.mjs', 'utf8');
const DEMO = {
  correo: /correo: '([^']+)'/.exec(semilla)![1],
  clave: /clave: '([^']+)'/.exec(semilla)![1],
};

const PAGINAS: [string, string, string][] = [
  ['resumen', '/resumen', 'Resumen financiero'],
  ['movimientos', '/movimientos', 'Historial de movimientos'],
  ['presupuestos', '/presupuestos', 'Presupuestos del mes'],
  ['categorias', '/categorias', 'Gestión de categorías'],
  ['reportes', '/reportes', 'Gasto por categoría'],
  ['cuenta', '/cuenta', 'Configuración de la cuenta'],
];

async function tema(page: Page, valor: 'claro' | 'oscuro') {
  await page.evaluate((v) => localStorage.setItem('pulso-tema', v), valor);
}

async function entrar(page: Page) {
  await page.goto('/login');
  await page.getByPlaceholder('Correo electrónico').fill(DEMO.correo);
  await page.getByPlaceholder('Contraseña').fill(DEMO.clave);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/\/resumen$/);
}

async function capturar(page: Page, ruta: string, titulo: string, archivo: string, completa = true) {
  await page.goto(ruta);
  await expect(page.getByRole('heading', { level: 1, name: titulo })).toBeVisible();
  await expect(page.locator('.esqueleto')).toHaveCount(0);
  await page.waitForTimeout(400);   // charts and counters settle
  await page.screenshot({ path: `${SALIDA}/${archivo}.png`, fullPage: completa });
}

test('acceso: inicio de sesión y registro (claro y oscuro)', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  for (const t of ['claro', 'oscuro'] as const) {
    await page.goto('/login');
    await tema(page, t);
    await page.goto('/login');
    await page.screenshot({ path: `${SALIDA}/00-login-${t}.png` });
    await page.goto('/registro');
    await page.screenshot({ path: `${SALIDA}/00-registro-${t}.png` });
  }
});

test('escritorio 1366 px: las 6 páginas en claro y oscuro', async ({ page }) => {
  // A tall window instead of fullPage: the side menu is sticky (100vh), so a stitched full page would cut it.
  await page.setViewportSize({ width: 1366, height: 1300 });
  await page.goto('/login');
  await tema(page, 'claro');
  await entrar(page);
  for (const t of ['claro', 'oscuro'] as const) {
    await tema(page, t);
    for (const [i, [nombre, ruta, titulo]] of PAGINAS.entries()) {
      await capturar(page, ruta, titulo, `${String(i + 1).padStart(2, '0')}-${nombre}-${t}`, false);
    }
  }
  await tema(page, 'claro');
  await page.goto('/resumen');
  await page.getByRole('button', { name: 'Nuevo movimiento' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.screenshot({ path: `${SALIDA}/07-nuevo-movimiento-claro.png` });
});

test('celular 390 px: las 6 páginas en claro', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/login');
  await tema(page, 'claro');
  await entrar(page);
  for (const [i, [nombre, ruta, titulo]] of PAGINAS.entries()) {
    await capturar(page, ruta, titulo, `movil-${String(i + 1).padStart(2, '0')}-${nombre}`, false);
  }
});
