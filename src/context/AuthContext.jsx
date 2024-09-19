import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [role, setRole] = useState(() => localStorage.getItem('role') || null);
  const [name, setName] = useState(() => localStorage.getItem('name') || null);
  const [cognitoId, setCognitoId] = useState(() => localStorage.getItem('cognitoId') || null);
  const [selectedEmpresa, setSelectedEmpresa] = useState(() => localStorage.getItem('selectedEmpresa') || null);

  // AWS Credentials
  const [awsCredentials, setAwsCredentials] = useState({});
  const [isCredentialsFetched, setIsCredentialsFetched] = useState(false); // Estado para controlar si se obtuvieron credenciales



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
    console.log('Tienes credenciales!');
    setAwsCredentials(credentials);
  };

  const fetchAwsCredentials = async () => {
    try {
      console.log('TOKEN:: ',token);
      const credentialsResponse = await axios.get('https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getCredentials', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 3000, // 3 segundos de timeout
      });
      const credentials = credentialsResponse.data;
      configureAwsCredentials(credentials);
      setIsCredentialsFetched(true);
      scheduleCredentialsRefresh(credentials.Expiration); // Programar renovación
    } catch (error) {
      console.error('Error fetching AWS credentials:', error.response ? error.response.data : error.message);
    }
  };

  const scheduleCredentialsRefresh = (expiration) => {
    const currentTime = new Date().getTime();
    const expirationTime = new Date(expiration).getTime();
    const timeLeft = expirationTime - currentTime;
    const refreshTime = timeLeft - 5 * 60 * 1000; // Renovar 5 minutos antes de expirar

    if (refreshTime > 0) {
      setTimeout(() => {
        fetchAwsCredentials();
      }, refreshTime);
    } else {
      fetchAwsCredentials(); // Si está muy cerca de expirar, renovarlas de inmediato
    }
  };

  useEffect(() => {
    if (token && !isCredentialsFetched) {
      fetchAwsCredentials();
    }
  }, [token, isCredentialsFetched]);

  useEffect(() => {
    if (selectedEmpresa !== null) {
      localStorage.setItem('selectedEmpresa', selectedEmpresa);
    } else {
      localStorage.removeItem('selectedEmpresa'); // Eliminar si es null
    }
  }, [selectedEmpresa]);

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
