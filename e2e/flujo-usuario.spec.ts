import { expect, test, type Page } from '@playwright/test';

/**
 * The life of one user, from sign-up to deleting the account, through the real UI, API and MongoDB.
 * Each run creates its own throw-away account and deletes it at the end, so the demo data is never touched.
 * Steps share one browser page and run in order (each step starts where the previous one left off).
 */
test.describe.configure({ mode: 'serial' });

const id = Date.now();
const USUARIO = { nombre: 'Prueba Playwright', correo: `e2e.${id}@pulsofinance.local`, clave: 'E2e-Prueba-2026!' };
const DESCRIPCION = `Almuerzo e2e ${id}`;

let page: Page;
let categoria = '';

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
});
test.afterAll(async () => {
  await page.close();
});

async function ir(ruta: string, titulo: string) {
  await page.goto(ruta);
  await expect(page.getByRole('heading', { level: 1, name: titulo })).toBeVisible();
}

test('HU-01 registro: crea la cuenta y entra al resumen con un saludo', async () => {
  await page.goto('/registro');
  await page.getByPlaceholder('Nombre completo').fill(USUARIO.nombre);
  await page.getByPlaceholder('Correo electrónico').fill(USUARIO.correo);
  await page.getByPlaceholder('Contraseña', { exact: true }).fill(USUARIO.clave);
  await page.getByPlaceholder('Confirmar contraseña').fill(USUARIO.clave);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Registrarse' }).click();

  await expect(page).toHaveURL(/\/resumen$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Resumen financiero' })).toBeVisible();
  await expect(page.getByText(/^(Buenos días|Buenas tardes|Buenas noches), Prueba · /)).toBeVisible();
});

test('HU-01 registro: rechaza una contraseña corta antes de llamar a la API', async ({ browser }) => {
  const otra = await browser.newPage();
  await otra.goto('/registro');
  await otra.getByPlaceholder('Nombre completo').fill('Otra Persona');
  await otra.getByPlaceholder('Correo electrónico').fill(`otra.${id}@pulsofinance.local`);
  await otra.getByPlaceholder('Contraseña', { exact: true }).fill('corta');
  await otra.getByRole('button', { name: 'Registrarse' }).click();
  await expect(otra.getByText('La contraseña debe tener al menos 10 caracteres')).toBeVisible();
  await expect(otra).toHaveURL(/\/registro$/);
  await otra.close();
});

test('HU-06 registrar gasto: valida el monto y luego lo guarda', async () => {
  await page.getByRole('button', { name: 'Nuevo movimiento' }).click();
  const dialogo = page.getByRole('dialog');
  await expect(dialogo).toBeVisible();
  await dialogo.getByRole('radio', { name: 'Gasto' }).click();

  const selector = dialogo.getByLabel('Categoría');
  await selector.selectOption({ index: 1 });
  categoria = (await selector.locator('option:checked').textContent())!.trim();

  await dialogo.getByLabel('Monto').fill('0');
  await dialogo.getByRole('button', { name: 'Registrar gasto' }).click();
  await expect(dialogo.getByText('El monto debe ser mayor a 0 (máximo 2 decimales)')).toBeVisible();

  await dialogo.getByLabel('Monto').fill('45000');
  await dialogo.getByLabel('Descripción (opcional)').fill(DESCRIPCION);
  await dialogo.getByRole('button', { name: 'Registrar gasto' }).click();
  await expect(dialogo).toBeHidden();
});

test('HU-16 historial: el gasto aparece con su monto y categoría', async () => {
  await ir('/movimientos', 'Historial de movimientos');
  const fila = page.getByRole('row', { name: new RegExp(DESCRIPCION) });
  await expect(fila).toBeVisible();
  await expect(fila).toContainText('$ 45.000');
  await expect(fila).toContainText(categoria);
});

test('HU-17 búsqueda: encuentra por texto sin importar mayúsculas y avisa si no hay resultados', async () => {
  const buscar = page.getByLabel('Buscar movimiento');
  await buscar.fill(`ALMUERZO E2E ${id}`);
  await expect(page.getByText('Mostrando 1 – 1 de 1 movimientos')).toBeVisible();

  await buscar.fill('zzzz-no-existe');
  await expect(page.getByText('Ningún movimiento coincide con estos filtros.')).toBeVisible();
  await page.getByRole('button', { name: 'Limpiar filtros' }).first().click();
  await expect(page.getByRole('row', { name: new RegExp(DESCRIPCION) })).toBeVisible();
});

test('HU-13/14 presupuesto: un límite menor que el gasto queda "Excedido"', async () => {
  await ir('/presupuestos', 'Presupuestos del mes');
  await page.getByLabel('Categoría de gasto').selectOption({ label: categoria });
  await page.getByLabel('Monto del presupuesto').fill('40000');
  await page.getByRole('button', { name: 'Guardar presupuesto' }).click();

  const tarjeta = page.locator('.tarjeta-presupuesto', { hasText: categoria });
  await expect(tarjeta).toContainText('Excedido');
  await expect(tarjeta).toContainText('112,5 %');
  await expect(page.getByRole('heading', { name: 'Superaste un presupuesto' })).toBeVisible();
});

test('HU-09 eliminar movimiento: pide confirmación y el presupuesto vuelve a estar en control', async () => {
  await ir('/movimientos', 'Historial de movimientos');
  await page.getByRole('button', { name: `Eliminar ${DESCRIPCION}` }).first().click();
  // Destructive confirmations use role="alertdialog" (the movement form is a plain "dialog").
  const dialogo = page.getByRole('alertdialog');
  await expect(dialogo).toContainText('¿Eliminar este movimiento?');
  await dialogo.getByRole('button', { name: 'Sí, eliminar' }).click();
  await expect(page.getByText('No hay movimientos en este periodo.')).toBeVisible();

  await ir('/presupuestos', 'Presupuestos del mes');
  await expect(page.locator('.tarjeta-presupuesto', { hasText: categoria })).toContainText('En control');
});

test('Apariencia: el modo oscuro se aplica y se mantiene al recargar', async () => {
  await ir('/cuenta', 'Configuración de la cuenta');
  await page.getByRole('radio', { name: 'Oscuro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('radio', { name: 'Claro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('Móvil (375 px): ninguna página se sale de la pantalla y la barra inferior está visible', async () => {
  await page.setViewportSize({ width: 375, height: 812 });
  const paginas: [string, string][] = [
    ['/resumen', 'Resumen financiero'], ['/movimientos', 'Historial de movimientos'],
    ['/presupuestos', 'Presupuestos del mes'], ['/categorias', 'Gestión de categorías'],
    ['/reportes', 'Gasto por categoría'], ['/cuenta', 'Configuración de la cuenta'],
  ];
  for (const [ruta, titulo] of paginas) {
    await ir(ruta, titulo);
    const ancho = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(ancho, `scroll lateral en ${ruta}`).toBeLessThanOrEqual(375);
  }
  await expect(page.getByRole('link', { name: 'Movimientos' }).last()).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 800 });
});

test('HU-02/04 sesión: cerrar sesión y volver a entrar; una ruta protegida pide iniciar sesión', async () => {
  await ir('/resumen', 'Resumen financiero');
  await page.locator('.menu-usuario-boton').click();
  await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.goto('/presupuestos');
  await expect(page).toHaveURL(/\/login$/);

  await page.getByPlaceholder('Correo electrónico').fill(USUARIO.correo);
  await page.getByPlaceholder('Contraseña').fill('clave-incorrecta-1');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.getByRole('alert')).toBeVisible();

  await page.getByPlaceholder('Contraseña').fill(USUARIO.clave);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/\/presupuestos$/);
});

test('HU-03 sesión: sobrevive a recargar la página (cookie de renovación)', async () => {
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Presupuestos del mes' })).toBeVisible();
});

test('HU-20 eliminar cuenta: confirma, vuelve al login y la cuenta ya no entra', async () => {
  await ir('/cuenta', 'Configuración de la cuenta');
  await page.getByRole('button', { name: 'Eliminar mi cuenta' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Sí, eliminar mi cuenta' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText('Tu cuenta fue eliminada')).toBeVisible();

  await page.getByPlaceholder('Correo electrónico').fill(USUARIO.correo);
  await page.getByPlaceholder('Contraseña').fill(USUARIO.clave);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});
