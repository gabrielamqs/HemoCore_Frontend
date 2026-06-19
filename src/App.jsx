import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Doadores from './pages/Doadores';
import Hospitais from './pages/Hospitais';
import Recepcionistas from './pages/Recepcionistas';
import TiposSanguineos from './pages/TiposSanguineos';
import Cidades from './pages/Cidades';
import UnidadesColeta from './pages/UnidadesColeta';
import Doacoes from './pages/Doacoes';
import Solicitacoes from './pages/Solicitacoes';
import Campanhas from './pages/Campanhas';
import {
  RelSomatorio,
  RelDoadores,
  RelMaioresSolicitantes,
  RelSolicitacoesHospital,
  RelAgendaCampanhas,
  RelColetasCidade,
} from './pages/reports/Relatorio';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/doadores" replace />} />

          {/* Cadastros */}
          <Route path="/doadores" element={<Doadores />} />
          <Route path="/hospitais" element={<Hospitais />} />
          <Route path="/recepcionistas" element={<Recepcionistas />} />
          <Route path="/tipos-sanguineos" element={<TiposSanguineos />} />
          <Route path="/cidades" element={<Cidades />} />
          <Route path="/unidades-coleta" element={<UnidadesColeta />} />

          {/* Processos */}
          <Route path="/doacoes" element={<Doacoes />} />
          <Route path="/solicitacoes" element={<Solicitacoes />} />
          <Route path="/campanhas" element={<Campanhas />} />

          {/* Relatórios */}
          <Route path="/relatorios/somatorio" element={<RelSomatorio />} />
          <Route path="/relatorios/doadores" element={<RelDoadores />} />
          <Route path="/relatorios/maiores-solicitantes" element={<RelMaioresSolicitantes />} />
          <Route path="/relatorios/solicitacoes-hospital" element={<RelSolicitacoesHospital />} />
          <Route path="/relatorios/agenda-campanhas" element={<RelAgendaCampanhas />} />
          <Route path="/relatorios/coletas-cidade" element={<RelColetasCidade />} />

          <Route path="*" element={<Navigate to="/doadores" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
