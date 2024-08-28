import React, { createContext, useState, useContext, useEffect } from 'react';
import { S3Client } from '@aws-sdk/client-s3';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [role, setRole] = useState(() => localStorage.getItem('role') || null);
  const [name, setName] = useState(() => localStorage.getItem('name') || null);
  const [cognitoId, setCognitoId] = useState(() => localStorage.getItem('cognitoId') || null);
  const [selectedEmpresa, setSelectedEmpresa] = useState(() => localStorage.getItem('selectedEmpresa') || null);
  const [awsCredentials, setAwsCredentials] = useState({});

  useEffect(() => {
    localStorage.setItem('token', token);
  }, [token]);

  useEffect(() => {
    localStorage.setItem('role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('name', name);
  }, [name]);

  useEffect(() => {
    localStorage.setItem('cognitoId', cognitoId);
  }, [cognitoId]);

  useEffect(() => {
    localStorage.setItem('selectedEmpresa', selectedEmpresa);
  }, [selectedEmpresa]);

  const signOut = () => {
    setToken(null);
    setRole(null);
    setName(null);
    setCognitoId(null);
    setSelectedEmpresa(null);
    setAwsCredentials(null);
    localStorage.removeItem('selectedEmpresa');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('cognitoId');
  };

  const configureAwsCredentials = (credentials) => {
    setAwsCredentials(credentials);
  };

  const value = {
    token,
    setToken,
    role,
    setRole,
    name,
    setName,
    cognitoId,
    setCognitoId,
    signOut,
    selectedEmpresa,
    setSelectedEmpresa,
    awsCredentials,
    configureAwsCredentials,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
