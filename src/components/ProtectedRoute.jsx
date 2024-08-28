import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ element: Component, allowedRoles }) => {
  const { token, role } = useAuth();

  if (!token) {
    // Si no hay token, redirigir a la página de inicio de sesión
    console.log('No tienes token');
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(role)) {
    // Si el rol del usuario no está permitido, redirigir a una página de no autorizado
    console.log('No tienes permiso para acceder a esta página');
    return <Navigate to="/" />;
  }

  console.log('Tienes token y permiso');
  // Si hay token y el rol está permitido, renderizar el componente
  return <Component />;
};

export default ProtectedRoute;
