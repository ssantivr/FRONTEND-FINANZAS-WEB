import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Enrutador } from './app/Enrutador';
import { SesionProvider } from './features/auth/SesionStore';
import { AvisoProvider } from './components/Aviso';
import { TemaProvider } from './components/Tema';
import './estilos.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <TemaProvider>
      <AvisoProvider>
        <SesionProvider>
          <Enrutador />
        </SesionProvider>
      </AvisoProvider>
      </TemaProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
