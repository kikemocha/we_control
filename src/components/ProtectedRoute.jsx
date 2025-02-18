import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, role } = useAuth();

  if (!token || token === "null" || token === "undefined" || token.trim() === "") {
    console.log("Redirigiendo al login");
    return <Navigate to="/" replace />;
  }  
  if (!role || !allowedRoles?.includes(role)) {
    return <Navigate to="/" replace />;
  }
  

  return children;
};

export default ProtectedRoute;
