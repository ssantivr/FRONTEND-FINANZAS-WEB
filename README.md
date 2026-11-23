# Frontend — finanzas-web

React 18 · TypeScript (estricto) · Vite · React Router. El diseño sigue los mockups de `docs/08-requisitos/Historias_de_Usuario_Finanzas_Personales_APA7.docx` (marca **PulsoFinance**: verde menta, menú lateral blanco, tarjetas con iconos de color, gráficos de dona, barras y línea, y en el celular una barra inferior con botón «+»). Carpetas según DEV-01:

| Carpeta | Contenido |
|---|---|
| `src/app/` | `Enrutador`, `RutaProtegida` |
| `src/features/` | Una carpeta por épica: `auth/` (con `SesionStore`), `cuenta/`, `movimientos/` (con `ContextoMovimientos`, el formulario global), `categorias/`, `presupuestos/`, `resumen/` (resumen y reportes, HU-18 y HU-19) |
| `src/api/` | `ClienteHttp` (renovación automática ante 401), `AlmacenTokens` y un cliente por recurso REST |
| `src/components/` | `Plantilla`, `MenuUsuario`, `Marca`, `Iconos`, `Graficos` (SVG sin librerías), `Campo`, `Indicador`, `SelectorPeriodo`, `DialogoConfirmacion`, `Aviso`, formatos |

- **Token de acceso:** vive solo en memoria. Al recargar, la sesión se recupera con la cookie `HttpOnly` (HU-03).
- **Montos:** se envían como texto, para no perder decimales.
- **Fuera del alcance:** los mockups muestran «Ahorro», «Metas», «Premium», campana de notificaciones, teléfono e inicio con Google/Apple. No están en los 27 RF, así que no se implementaron.

## Comandos

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm test
```

- `npm run dev`: abre http://localhost:5173 y envía `/api` a `http://localhost:8080`.
- `npm run build`: revisa los tipos con `tsc` y genera `dist/`.
- `npm test`: corre las pruebas de validación (Vitest).

## Despliegue en Vercel

1. En `vercel.json`, reemplaza `https://finanzas-api.onrender.com` por la URL real del backend.
2. En Vercel, crea el proyecto con *Root Directory* = `frontend`. Vercel detecta Vite: `npm run build` → `dist`.
3. Otra opción es la CLI: `vercel` (vista previa) y `vercel --prod` (producción).

`vercel.json` reenvía `/api/*` al backend, devuelve `index.html` para las rutas del cliente y agrega cabeceras de seguridad.
