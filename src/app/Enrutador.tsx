import { Navigate, Route, Routes } from 'react-router-dom';
import { RutaProtegida } from './RutaProtegida';
import { Plantilla } from '../components/Plantilla';
import { InicioSesionPage } from '../features/auth/InicioSesionPage';
import { RegistroPage } from '../features/auth/RegistroPage';
import { RecuperarContrasenaPage } from '../features/auth/RecuperarContrasenaPage';
import { ResumenPage } from '../features/resumen/ResumenPage';
import { ReportesPage } from '../features/resumen/ReportesPage';
import { HistorialPage } from '../features/movimientos/HistorialPage';
import { CategoriasPage } from '../features/categorias/CategoriasPage';
import { PresupuestosPage } from '../features/presupuestos/PresupuestosPage';
import { ConfiguracionCuentaPage } from '../features/cuenta/ConfiguracionCuentaPage';

export function Enrutador() {
  return (
    <Routes>
      <Route path="/login" element={<InicioSesionPage />} />
      <Route path="/registro" element={<RegistroPage />} />
      <Route path="/recuperar" element={<RecuperarContrasenaPage />} />
      <Route path="/restablecer" element={<RecuperarContrasenaPage />} />
      <Route element={<RutaProtegida><Plantilla /></RutaProtegida>}>
        <Route path="/resumen" element={<ResumenPage />} />
        <Route path="/movimientos" element={<HistorialPage />} />
        <Route path="/categorias" element={<CategoriasPage />} />
        <Route path="/presupuestos" element={<PresupuestosPage />} />
        <Route path="/reportes" element={<ReportesPage />} />
        <Route path="/cuenta" element={<ConfiguracionCuentaPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/resumen" replace />} />
    </Routes>
  );
}
