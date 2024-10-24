import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { fetchAuthSession, signOut as awsSignOut} from 'aws-amplify/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken') || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken') || null);
  const [expirationTime, setExpirationTime] = useState(() => {
    const storedTime = localStorage.getItem('expirationTime');
    return storedTime ? new Date(storedTime) : null;
  });
  const [refreshTimeout, setRefreshTimeout] = useState(null);
  
  const [role, setRole] = useState(() => localStorage.getItem('role') || null);
  const [name, setName] = useState(() => localStorage.getItem('name') || null);
  const [surname, setSurname] = useState(() => localStorage.getItem('surname') || null);
  
  const [cognitoId, setCognitoId] = useState(() => localStorage.getItem('cognitoId') || null);
  const [selectedEmpresa, setSelectedEmpresa] = useState(() => localStorage.getItem('selectedEmpresa') || null);
  const [profileImg, setProfileImg] = useState(() => localStorage.getItem('profileImg') || null);

  // AWS Credentials
  const [awsCredentials, setAwsCredentials] = useState({});

  const [userData, setUserData] = useState(null); // Para almacenar la información del usuario


  useEffect(() => {
    localStorage.setItem('accessToken', accessToken);
  }, [accessToken]);

  useEffect(() => {
    localStorage.setItem('refreshToken', refreshToken);
  }, [refreshToken]);

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

  useEffect(() => {
    localStorage.setItem('expirationTime', expirationTime?.toString() || '');
  }, [expirationTime]);



  const signOut = async () => {
    try {
      console.log('Cerrando sesión...');
      await awsSignOut(); // Sign out from AWS Cognito
      clearTimeout(refreshTimeout);
      // Limpiar el estado en el contexto de React
      setToken(null);
      setAccessToken(null);
      setRefreshToken(null);
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

  const fetchAwsCredentials = async (tokenAWS) => {
    if (!tokenAWS) {
      console.error('No token available to fetch AWS credentials.');
      return;
    }
    try {
      const credentialsResponse = await axios.get('https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getCredentials', {
        headers: {
          Authorization: `Bearer ${tokenAWS}`,
        },
        timeout: 3000, // 3 segundos de timeout
      });
      const credentials = credentialsResponse.data;
      setAwsCredentials(credentials);
      console.log('Credenciales concedidas');
    } catch (error) {
      console.error('Error fetching AWS credentials:', error.message || error.response);
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
      fetchAwsCredentials();
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
    if (selectedEmpresa !== null) {
      localStorage.setItem('selectedEmpresa', selectedEmpresa);
    } else {
      localStorage.removeItem('selectedEmpresa'); // Eliminar si es null
    }
  }, [selectedEmpresa]);

  const refreshAccessToken = async () => {
    try {
      const session = await fetchAuthSession({ forceRefresh: true });
      const cognitoId = session.tokens.accessToken.payload.sub;
      const appClientId = '3p4sind7orh97u1urvh9fktpmr';

      const newAccessToken = localStorage.getItem(`CognitoIdentityServiceProvider.${appClientId}.${cognitoId}.accessToken`);
      const newRefreshToken = localStorage.getItem(`CognitoIdentityServiceProvider.${appClientId}.${cognitoId}.refreshToken`);
      const newIdToken = localStorage.getItem(`CognitoIdentityServiceProvider.${appClientId}.${cognitoId}.idToken`);
      const newExpTime = session.tokens.idToken.payload.exp;

      setAccessToken(newAccessToken);
      setToken(newIdToken);
      setRefreshToken(newRefreshToken);
      setExpirationTime(new Date(newExpTime * 1000));
    } catch (error) {
      console.error('Error al renovar los tokens:', error);
      // Aquí podrías manejar el caso de que la renovación falle, por ejemplo, cerrando la sesión del usuario.
    }
  };


  const scheduleTokenRefresh = (expTime) => {
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }
  
    const now = Date.now();
    const expTimeMs = new Date(expTime).getTime();
    const timeUntilRefresh = expTimeMs - now - 1000; // 1 minuto antes de que expire
  
    if (timeUntilRefresh > 0) {
      // Timeout para refrescar el token
      const timeoutId = setTimeout(() => {
        refreshAccessToken();
      }, timeUntilRefresh);
  
      setRefreshTimeout(timeoutId);
    } else {
      console.warn('El tiempo de expiración del token ya ha pasado o es muy cercano. Renovando token inmediatamente.');
      refreshAccessToken();
    }
  };


  useEffect(() => {
    if (expirationTime) {
      scheduleTokenRefresh(expirationTime);
    }
  }, [expirationTime]);
  
  
  
  

  const value = {
    token,
    setToken,
    accessToken,
    setAccessToken,
    refreshToken,
    setRefreshToken,
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
    fetchUserData, // Ahora disponible para obtener datos del usuario
    userData,
    fetchAwsCredentials,
    refreshAccessToken,
    setExpirationTime
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
