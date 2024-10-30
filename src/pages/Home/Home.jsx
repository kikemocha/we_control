import React, { useEffect, useState } from 'react';
import '../Home.css';

import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

import HomeAdmin from './HomeAdmin';
import HomeGestor from './HomeGestor';
import HomeResponsable from './HomeResponsable';

const Home = () => {
  const {role, cognitoId, token, awsCredentials, fetchAwsCredentials} = useAuth();
  const [UserInfo, setUserInfo] = useState(null); // State para guardar los datos
  const [loading, setLoading] = useState(false); // Estado de carga
  const [error, setError] = useState(null);

  // Success / Error PopUp
  const [messagePopUp, setMessagePopUp] = useState('');
    const [messageStatePopUp, setMessageStatePopUp] = useState('');
    const [messageIsVisible, setMessageIsVisible] = useState(false);
    const [showMessagePopUp, setShowMessagePopUp] = useState(false);

    const handleCloseMessagePopUp = (message, messageState) => {
        setMessageStatePopUp(messageState); 
        setMessagePopUp(message); // Establece el mensaje que se mostrará
        setShowMessagePopUp(true); // Muestra el popup
        setMessageIsVisible(true); // Controla la animación de entrada
    
        // Después de 2 segundos, empieza la animación de salida y cierra el popup
        setTimeout(() => {
            setMessageIsVisible(false); // Activamos la animación de salida
          setTimeout(() => {
            setShowMessagePopUp(false); // Remueve el popup después de que la animación termine
            setMessagePopUp(''); // Limpia el mensaje
          }, 500); // 500 ms es la duración de la animación de salida
        }, 2000); // El popup permanece visible durante 2 segundos
    };


  const getUserData = async () => {
    try {
      const userId = cognitoId;
      const response = await axios.get('https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getUserData', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          id_cognito: userId
        }
      });
      setUserInfo(response.data);

    } catch (error) {
      console.error('Error fetching data: ', error);
    } finally {
      setLoading(false); // Finalizar estado de carga
    }
  };
  useEffect(()=>{
    getUserData();
  }, []);


  useEffect(() => {
    let attemptCount = 0;
    // Función para verificar y obtener credenciales
    const checkAwsCredentials = async () => {
      if (!awsCredentials.AccessKeyId && attemptCount < 3) {
        setLoading(true);
        attemptCount += 1;
        await fetchAwsCredentials(token);

        // Si todavía no hay credenciales después del intento, espera 1 segundo y vuelve a intentar
        if (!awsCredentials && attemptCount < 3) {
          setTimeout(checkAwsCredentials, 1000);
        } else {
          setLoading(false); // Deja de cargar si las credenciales están presentes o se agotaron los intentos
        }
      }
    };

    checkAwsCredentials();
  }, [awsCredentials, fetchAwsCredentials]);
  

  if (loading && role === 'admin') {
    return <div>
              <br />
              <div className='total_add'>
              <div className='upper_box'>
                            <div className='text'>Total de&nbsp;<strong>empresas</strong>:</div>
                            <div className='number skeleton' style={{height : '70%', margin: 'auto', width:'50px', borderRadius:'30px'}}></div>
                        </div>
                <div>
                    <svg
                        viewBox="0 0 1024 1024"
                        fill="currentColor"
                        height="2em"
                        width="2em"
                        >
                        <defs>
                            <style />
                        </defs>
                        <path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z" />
                        <path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z" />
                    </svg>
                </div>
              </div>
            
              <div className='admin_boxes'>
                {Array.from({ length: 8 }).map((_, index) => (
                  <div className='bussiness_boxes skeleton'></div>
                ))}
              </div>; // Indicador de carga mientras se obtienen los datos
            </div> 
          
  }

  return (
    <div className='home_main'>
      {role === 'admin' && (
        <HomeAdmin getUserData={getUserData} UserInfo={UserInfo}/>
      )}
      {role === 'gestor' && (
        <div>
          <HomeGestor/>
        </div>
      )}
      {role === 'responsable' ? (
  loading ? (
    <div>Cargando...</div> // Mostrar un mensaje mientras se cargan los datos
  ) : (
    <HomeResponsable
      UserInfo={UserInfo}
      getUserData={getUserData}
      handleCloseMessagePopUp={handleCloseMessagePopUp}
    />
  )
) : null}
      {showMessagePopUp && (
        <div
        className={`fixed w-1/2 h-24 left-1/4 bottom-2 transform -translate-x-1/2 z-50 rounded-2xl flex items-center justify-center transition-all duration-500 ${
            messageIsVisible ? 'animate-fadeIn' : 'animate-fadeOut'
          } ${messageStatePopUp === 'success' ? 'bg-green-400' : 'bg-red-400'}`}
        style={{ zIndex: 99 }}
        >
        <button className="absolute right-2 top-2 text-red-600" onClick={() => setShowMessagePopUp(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        <p className="text-black">{messagePopUp}</p>
        </div>
      )}
    </div>
  );
};

export default Home;
