import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Layout from './components/Layout';
import Riesgos from './pages/Riesgos';
import Controles from './pages/Controles';
import Gestores from './pages/Gestores';
import Auditorias from './pages/Auditorias';
import Responsables from './pages/Responsables';
import Home from './pages/Home/Home';
import LandingPage from './pages/LandingPage';
import LogIn from './pages/LogIn';

import ProtectedRoute from './components/ProtectedRoute';


const App = () => {
  return (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="login" element={<LogIn />} />
        <Route path="/" element={<Layout />}>
          <Route path='home' element={<ProtectedRoute element={Home} allowedRoles={['admin', 'gestor', 'responsable']} />} /> 
          <Route path="riesgos" element={<ProtectedRoute element={Riesgos} allowedRoles={['admin', 'gestor']} />} />
          <Route path="controles" element={<ProtectedRoute element={Controles} allowedRoles={['admin', 'gestor']}  />} />
          <Route path="gestores" element={<ProtectedRoute element={Gestores} allowedRoles={['admin']} />} />
          <Route path="auditorias" element={<ProtectedRoute element={Auditorias} allowedRoles={['admin', 'gestor']} />} />
          <Route path="responsables" element={<ProtectedRoute element={Responsables} allowedRoles={['gestor']} />} />
        </Route>
      </Routes>
    </Router>
  </AuthProvider>
  );
};

export default App;
