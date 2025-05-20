import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Layout from "./components/Layout";
import Riesgos from "./pages/Riesgos";
import Controles from "./pages/Controles";
import Gestores from "./pages/Gestores";
import Auditorias from "./pages/Auditorias";
import Responsables from "./pages/Responsables";
import Home from "./pages/Home/Home";
import LogIn from "./pages/LogIn";
import MisControles from "./pages/MisControles";

import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta pública */}
          <Route path="/" element={<LogIn />} />

          {/* Protegemos el Layout para evitar que se renderice sin autenticación */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["admin", "gestor", "responsable", "user"]}>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Cada ruta mantiene sus roles específicos */}
            <Route
              path="home"
              element={
                <ProtectedRoute allowedRoles={["admin", "gestor", "responsable"]}>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="riesgos"
              element={
                <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                  <Riesgos />
                </ProtectedRoute>
              }
            />
            <Route
              path="controles"
              element={
                <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                  <Controles />
                </ProtectedRoute>
              }
            />
            <Route
              path="gestores"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Gestores />
                </ProtectedRoute>
              }
            />
            <Route
              path="auditorias"
              element={
                <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                  <Auditorias />
                </ProtectedRoute>
              }
            />
            <Route
              path="responsables"
              element={
                <ProtectedRoute allowedRoles={["admin", "gestor"]}>
                  <Responsables />
                </ProtectedRoute>
              }
            />
            <Route
              path="miscontroles"
              element={
                <ProtectedRoute allowedRoles={["gestor"]}>
                  <MisControles />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
