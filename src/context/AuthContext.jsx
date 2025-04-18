import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { fetchAuthSession, signOut as awsSignOut} from 'aws-amplify/auth';
import { S3Client } from '@aws-sdk/client-s3';
import { json } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => sessionStorage.getItem('token') || null);
  const [accessToken, setAccessToken] = useState(() => sessionStorage.getItem('accessToken') || null);

  const [expirationTime, setExpirationTime] = useState(() => {
    const storedTime = sessionStorage.getItem('expirationTime');
    return storedTime ? new Date(storedTime) : null;
  });
  
  const [role, setRole] = useState(() => sessionStorage.getItem('role') || null);
  
  const [cognitoId, setCognitoId] = useState(() => sessionStorage.getItem('cognitoId') || null);
  const [selectedEmpresa, setSelectedEmpresa] = useState(() => sessionStorage.getItem('selectedEmpresa') || null);
  const [selectedEmpresaName, setSelectedEmpresaName] = useState(() => {
    const stored = sessionStorage.getItem('selectedEmpresaName');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error parsing selectedEmpresaName from sessionStorage:', error);
      return null;
    }
  });
  

  const [awsCredentials, setAwsCredentials] = useState(() => {
    const stored = sessionStorage.getItem('awsCredentials');
    try {
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error parsing awsCredentials from sessionStorage:', error);
      return {};
    }
  });
  
  

  const [s3Client, setS3Client] = useState(null);

  const [userData, setUserData] = useState(() => {
    const storedUserData = sessionStorage.getItem('userData');
    return storedUserData ? JSON.parse(storedUserData) : null;
  });

  const [mfaEnable, setMfaEnable] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const refreshTimeoutRef = useRef(null);

  useEffect(() => { sessionStorage.setItem('accessToken', accessToken); }, [accessToken]);
  useEffect(() => { if (userData) {sessionStorage.setItem('userData', JSON.stringify(userData)); }}, [userData]);
  useEffect(() => { if (userData && typeof userData === 'string') { setUserData(JSON.parse(userData)); }}, []);
  useEffect(()=>  { sessionStorage.setItem('mfaEnable', mfaEnable); }, [mfaEnable]);
  useEffect(() => { sessionStorage.setItem('token', token); }, [token]);
  useEffect(() => { sessionStorage.setItem('role', role); }, [role]);
  useEffect(() => { sessionStorage.setItem('cognitoId', cognitoId); }, [cognitoId]);
  useEffect(() => { sessionStorage.setItem('selectedEmpresa', selectedEmpresa); }, [selectedEmpresa]);
  useEffect(() => { sessionStorage.setItem('selectedEmpresaName', JSON.stringify(selectedEmpresaName)); }, [selectedEmpresaName]);
  useEffect(() => { sessionStorage.setItem('awsCredentials', awsCredentials);}, [awsCredentials]);
  useEffect(() => { sessionStorage.setItem('expirationTime', expirationTime?.toString() || ''); }, [expirationTime]);
  

  const signOut = async () => {
    try {
      console.log('Cerrando sesión...');
      await awsSignOut(); // Sign out from AWS Cognito
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      // Limpiar el estado en el contexto de React
      setToken(null);
      setAccessToken(null);
      setRole(null);
      setCognitoId(null);
      setSelectedEmpresa(null);
      setSelectedEmpresaName(null);
      setAwsCredentials(null);
      setUserData(null);
      setS3Client(null);
      setMfaEnable(false);
      // Limpiar el almacenamiento local
      sessionStorage.clear();
  
      // Redirigir al usuario a la página de inicio de sesión
      window.location.href = '/'; // Forzar redirección a la página de inicio
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
      const credentialsResponse = await axios.get(
        'https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getCredentials',
        {
          headers: {
            Authorization: `Bearer ${tokenAWS}`,
          },
          timeout: 10000,
        }
      );
      const credentials = credentialsResponse.data;
      setAwsCredentials(credentials);
      // Save credentials in sessionStorage as a JSON string
      sessionStorage.setItem('awsCredentials', JSON.stringify(credentials));
      console.log('AWS credentials stored in sessionStorage');
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
      await fetchAwsCredentials(token);
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
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  
  useEffect(() => {
    sessionStorage.setItem('awsCredentials', JSON.stringify(awsCredentials));
    if (awsCredentials && awsCredentials.AccessKeyId) {
      const client = new S3Client({
        region: 'eu-west-1',
        credentials: {
          accessKeyId: awsCredentials.AccessKeyId,
          secretAccessKey: awsCredentials.SecretAccessKey,
          sessionToken: awsCredentials.SessionToken,
        },
      });
      setS3Client(client);
      console.log('S3Client creado y actualizado en el context.');
    } else {
      setS3Client(null);
    }
  }, [awsCredentials]);

  const refreshAccessToken = async () => {
    try {
      const session = await fetchAuthSession({ forceRefresh: true });
      //const exp = session.tokens.idToken.payload.exp;
      
      const { exp, auth_time } = session.tokens.idToken.payload;
      
      const newAccessToken = session.tokens.accessToken.toString();
      const newIdToken = session.tokens.idToken.toString();

      sessionStorage.setItem('accessToken', newAccessToken);
      sessionStorage.setItem('idToken', newIdToken);

      setAccessToken(newAccessToken);
      setToken(newIdToken);
  
      setExpirationTime(new Date(exp * 1000));
      await fetchAwsCredentials(newIdToken);

      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);

      const ttlMs   = (exp - auth_time) * 1000;
      const delayMs = Math.max(0, ttlMs - 60_000);
      refreshTimeoutRef.current = setTimeout(refreshAccessToken, delayMs);

      console.log(`Tokens renewed; next refresh in ${Math.round(delayMs/1000)}s.`);
    } catch (error) {
      console.error('Error al renovar el token:', error);
    }
  };
  


  useEffect(() => {
    if (accessToken && !refreshTimeoutRef.current) {
      refreshAccessToken();
    }
    return () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, [accessToken]);
  

  const value = {
    token,
    setToken,
    accessToken,
    setAccessToken,
    role,
    setRole,
    searchQuery,
    setSearchQuery,
    cognitoId,
    setCognitoId,
    signOut,
    selectedEmpresa,
    setSelectedEmpresa,
    selectedEmpresaName,
    setSelectedEmpresaName,
    awsCredentials,
    fetchUserData, 
    userData,
    fetchAwsCredentials,
    refreshAccessToken,
    expirationTime,
    setExpirationTime,
    s3Client,
    mfaEnable,
    setMfaEnable
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
