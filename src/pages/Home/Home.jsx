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
    return <div className='bussines_box'>
            <h3 className="md:text-xs lg:text-sm xl:text-md 2xl:text-lg ">Hola </h3>
            <div className='total_add'>
              <div className='upper_box'>
                  <div className='text'>Total de&nbsp;<strong>empresas</strong>:</div>
                  
                  <div className='number'> <div className="h-2/3 w-1/2 bg-gray-200 animate-pulse rounded-3xl"></div></div>
              </div>
            </div>
            <div className='bussines_div overflow-auto h-full'>
                <div className="w-4/5 mx-auto">
                  <ul className="flex flex-col gap-4 pb-24">
                    <li className="sticky top-0 bg-white z-10 grid grid-cols-3 gap-4 p-2 border-b-2 border-gray-400 font-bold">
                      <span>Nombre</span>
                      <span>CIF</span>
                      <span>Correo de contacto</span>
                    </li>
                    {[...Array(10)].map((_, i) => (
                        <li
                          
                          className=" h-16 grid grid-cols-3 gap-4 border bg-gray-200 animate-pulse rounded-2xl px-4 py-4"
                          
                        >

                          
                        </li>
                      ))
                      }
                  </ul>
                </div>
            </div>
          </div>
          
  }

  if (loading && role === 'gestor') {
    return <div className="h-full">
      <div className="h-full w-full flex-col justify-between">
        <div className="w-full h-full flex flex-col">
          <div className="flex flex-row w-full">
            <div className="w-1/2 h-[40vh] mr-12 p-6 bg-gray-200 animate-pulse rounded-3xl">
            </div>
            <div className="w-1/3 h-[40vh] mr-12 p-6 bg-gray-200 animate-pulse rounded-3xl">
            </div>
          </div>
          <div className="w-full h-1/2 flex flex-row items-center">
            <div className="w-1/3 h-[40vh] mr-12 p-6 bg-gray-200 animate-pulse rounded-3xl">
            </div>
            <div className="w-1/6 h-[40vh] mr-12 p-6 bg-gray-200 animate-pulse rounded-3xl">
            </div>
            <div className="w-1/3 h-[40vh] mr-12 p-6 bg-gray-200 animate-pulse rounded-3xl">
            </div>
          </div>
          
        </div>
      </div>
    </div>;
  }

  return (
    <div className='home_main'>
      {role === 'admin' && (
        <HomeAdmin getUserData={getUserData} UserInfo={UserInfo}/>
      )}
      {role === 'gestor' && (
        <HomeGestor userInfo={UserInfo}/>
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
