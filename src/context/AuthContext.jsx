import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [role, setRole] = useState(() => localStorage.getItem('role') || null);
  const [name, setName] = useState(() => localStorage.getItem('name') || null);
  const [surname, setSurname] = useState(() => localStorage.getItem('surname') || null);
  
  const [cognitoId, setCognitoId] = useState(() => localStorage.getItem('cognitoId') || null);
  const [selectedEmpresa, setSelectedEmpresa] = useState(() => localStorage.getItem('selectedEmpresa') || null);
  const [profileImg, setProfileImg] = useState(() => localStorage.getItem('profileImg') || null);

  // AWS Credentials
  const [awsCredentials, setAwsCredentials] = useState({});
  const [isCredentialsFetched, setIsCredentialsFetched] = useState(false); // Estado para controlar si se obtuvieron credenciales

  const [userData, setUserData] = useState(null); // Para almacenar la información del usuario

  
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
    localStorage.setItem('profileImg', profileImg);
  }, [profileImg]);

  useEffect(() => {
    localStorage.setItem('surname', surname);
  }, [surname]);
  

  useEffect(() => {
    localStorage.setItem('cognitoId', cognitoId);
  }, [cognitoId]);

  useEffect(() => {
    localStorage.setItem('selectedEmpresa', selectedEmpresa);
  }, [selectedEmpresa]);

  const signOut = () => {
    try {
      // Limpiar el estado en el contexto de React
      setToken(null);
      setRole(null);
      setName(null);
      setSurname(null);
      setProfileImg(null);
      setCognitoId(null);
      setSelectedEmpresa(null);
      setAwsCredentials(null);
      setUserData(null);
  
      // Limpiar el almacenamiento local
      localStorage.clear(); // Eliminar todo del localStorage
  
      // Redirigir al usuario a la página de inicio de sesión
      window.location.href = '/login'; // Forzar redirección a la página de inicio
    } catch (error) {
      console.error('Error al limpiar sesión:', error);
    }
  };

  const configureAwsCredentials = (credentials) => {
    console.log('Tienes credenciales!');
    setAwsCredentials(credentials);
  };

  const MAX_RETRIES = 3; // Número máximo de reintentos para obtener credenciales
let retryCount = 0;

const fetchAwsCredentials = async () => {
  try {
    const credentialsResponse = await axios.get('https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getCredentials', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 3000, // 3 segundos de timeout
    });
    const credentials = credentialsResponse.data;
    configureAwsCredentials(credentials);
    setIsCredentialsFetched(true);
    retryCount = 0; // Reiniciar el contador de reintentos al obtener credenciales con éxito
    scheduleCredentialsRefresh(credentials.Expiration); // Programar renovación
  } catch (error) {
    console.error('Error fetching AWS credentials:', error.message || error.response);

    // Verificar si el token ha expirado y proceder a cerrar sesión si es necesario
    if (error.response && error.response.data.message === 'The incoming token has expired') {
      console.log('El token ha expirado, cerrando sesión.');
      signOut();
      return;
    }

    // Implementar lógica de reintento
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`Reintentando obtener credenciales AWS... Intento ${retryCount} de ${MAX_RETRIES}`);
      setTimeout(() => fetchAwsCredentials(), 2000 * retryCount); // Aumentar el tiempo de espera entre reintentos
    } else {
      console.error('Error persistente al obtener credenciales AWS después de varios intentos.');
    }
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

  const fetchUserData = async (id_cognito, token) => {
    try {
      const response = await axios.get(`https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getUserInfo?id_cognito=${id_cognito}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = response.data;
      setUserData(data);

      if (data.is_gestor === 0 && data.is_responsable === 0) {
        setSelectedEmpresa(null);
        setRole('admin');
      } else if (data.is_gestor === 1 && data.is_responsable === 0) {
        setSelectedEmpresa(data.belongs_to);
        setRole('gestor');
      } else {
        setSelectedEmpresa(data.belongs_to);
        setRole('responsable');
      }
      setName(data.name);
      setSurname(data.surname);
      setProfileImg(data.img);
    } catch (error) {
      console.error('Error fetching user data:', error);
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
    surname,
    setSurname,
    profileImg,
    setProfileImg,
    cognitoId,
    setCognitoId,
    signOut,
    selectedEmpresa,
    setSelectedEmpresa,
    awsCredentials,
    configureAwsCredentials,
    fetchUserData, // Ahora disponible para obtener datos del usuario
    userData
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
