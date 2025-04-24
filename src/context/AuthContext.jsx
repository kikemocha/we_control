import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { fetchAuthSession, signOut as awsSignOut} from 'aws-amplify/auth';
import { S3Client } from '@aws-sdk/client-s3';
import { json } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => sessionStorage.getItem('token') || null);
  const [accessToken, setAccessToken] = useState(() => sessionStorage.getItem('accessToken') || null);

  const timerRef = useRef(null);
  const leadMs = 2 * 60_000;
  
  const [role, setRole] = useState(() => sessionStorage.getItem('role') || null);
  
  const [expirationTime, setExpirationTime] = useState(
    () => Number(sessionStorage.getItem('expirationTime')) || null
  );

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

  useEffect(() => {
    const stored = sessionStorage.getItem('awsCredentials');
    if (!stored || stored === 'null') return; 
    if (stored) {
      const creds = JSON.parse(stored);
      if (creds.AccessKeyId) {
        setS3Client(new S3Client({
          region: 'eu-west-1',
          credentials: {
            accessKeyId: creds.AccessKeyId,
            secretAccessKey: creds.SecretAccessKey,
            sessionToken: creds.SessionToken,
          },
        }));
      }
    }
  }, []);

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
  useEffect(() => {if (expirationTime) {sessionStorage.setItem('expirationTime', expirationTime.toString()); }}, [expirationTime]);

  useEffect(() => {
    if (awsCredentials != null) {
      sessionStorage.setItem('awsCredentials', JSON.stringify(awsCredentials));
    } else {
      sessionStorage.removeItem('awsCredentials');
    }
  }, [awsCredentials]);
  
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
      sessionStorage.setItem('awsCredentials', JSON.stringify(credentials));
      const client = new S3Client({
        region: 'eu-west-1',
        credentials: {
            accessKeyId: credentials.AccessKeyId,
            secretAccessKey: credentials.SecretAccessKey,
            sessionToken: credentials.SessionToken,
          },
        computeChecksums: false,
      });
      setS3Client(client);


      console.log('S3Client creado y actualizado en el context');
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


  const refreshAccessToken = async () => {
    try {
      const session = await fetchAuthSession({ forceRefresh: true });
      const { exp, iat } = session.tokens.idToken.payload;

      const ttlMs = (exp - iat) * 1000;
      const delay = Math.max(0, ttlMs - leadMs);
      const expMs = exp * 1000;
      setExpirationTime(expMs);

      const newAccess = session.tokens.accessToken.toString();
      const newIdToken     = session.tokens.idToken.toString();
      setAccessToken(newAccess);
      setToken(newIdToken);
      sessionStorage.setItem('accessToken', newAccess);
      sessionStorage.setItem('token',     newIdToken);

      // refresca AWS creds u otras tareas…
      await fetchAwsCredentials(newIdToken);
      console.log(`Tokens renovados; próximo refresh en ${Math.round(delay/1000)}s`);

      timerRef.current = setTimeout(refreshAccessToken, delay);

    } catch (err) {
      console.error('Error al renovar token:', err);
      // si falla, podrías forzar un retry en 1 min:
      setTimeout(refreshAccessToken, 60_000);
    }
  };

  
  

  

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
    s3Client,
    mfaEnable,
    setMfaEnable,
    expirationTime
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
