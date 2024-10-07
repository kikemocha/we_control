import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import './Home.css';
import EmpresasForm from '../form/EmpresasForm';


import FileUploadPopup from '../form/UploadFile'; // Importa el nuevo componente

import { useAuth } from '../context/AuthContext';
import axios from 'axios';

import ShowFile from '../form/ShowFile';
import CircularProgress from '../components/CircularProgress';
import EditEmpresasForm from '../form/editForms/EditEmpresasForm';


const Home = () => {
  
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [showIMGPopup, setshowIMGPopup] = useState(false);

  const { name, role, cognitoId, token, setSelectedEmpresa, selectedEmpresa, configureAwsCredentials} = useAuth();
  const [UserInfo, setUserInfo] = useState(null); // State para guardar los datos
  const [loading, setLoading] = useState(false); // Estado de carga

  const [showPopup, setShowPopup] = useState(false);
  const handleOpenPopup = () => setShowPopup(true);
  const handleClosePopup = () => setShowPopup(false);
  const [error, setError] = useState(null);
  const [selectedControl, setSelectedControl] = useState(null);

  const [UserAuditoriaData, setUserAuditoriaData] = useState(null);

  // Admin -> Empresas Edit Form

  const [showEditPopup, setshowEditPopup] = useState(false);
  const [selectedEditEmpresa, setSelectedEditEmpresa] = useState(null); // Empresa seleccionado para editar
  const handleOpenEditPopup = (riesgo) => {
      setSelectedEditEmpresa(riesgo);  // Guardar el item seleccionado
      setshowEditPopup(true);
    };
  const handleCloseEditPopup = () => setshowEditPopup(false);

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



  const handleUpload = async (file) => {
    // Aquí va tu lógica de carga de archivos usando S3
  };
  const [isCredentialsFetched, setIsCredentialsFetched] = useState(false);

  useEffect(() => {
    if (token && !isCredentialsFetched) {
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
          setIsCredentialsFetched(true); // Marcar como credenciales obtenidas
        } catch (error) {
          console.error('Error fetching AWS credentials:', error.response ? error.response.data : error.message);
        }
      };

      fetchAwsCredentials();
    }
  }, [token, isCredentialsFetched, configureAwsCredentials]);

  const fetchUserAuditoriaData = async () => {
    try {
        const response = await axios.get("https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getUserAuditoriaData?id_cognito="+cognitoId,
          {headers : {
            'Authorization' : `Bearer ${token}`
          }}
        );
        let data_clean = [];
        data_clean = response.data
        setUserAuditoriaData(data_clean);
    } catch (error) {
        setError(error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'responsable') {
      fetchUserAuditoriaData();
    }
  }, [role]);

  const handleClick = (id) => {
    setSelectedEmpresa(id);
  };
  const handleReset = () => {
    setSelectedEmpresa(null);
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

  if (loading && role === 'admin') {
    return <div>
              <br />
              <div className='total_add'>
              <div className='upper_box'>
                            <div className='text'>Total de&nbsp;<strong>empresas</strong>:</div>
                            <div className='number skeleton' style={{height : '70%', margin: 'auto', width:'50px', borderRadius:'30px'}}></div>
                        </div>
                <div onClick={handleOpenPopup}>
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
        <div className='admin_home'>
          {selectedEmpresa ?(
            <div>
              <div>
                <svg fill="none" viewBox="0 0 15 15" height="3em" width="3em" onClick={handleReset} className='close-icon text-red-500'>
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M11.782 4.032a.575.575 0 10-.813-.814L7.5 6.687 4.032 3.218a.575.575 0 00-.814.814L6.687 7.5l-3.469 3.468a.575.575 0 00.814.814L7.5 8.313l3.469 3.469a.575.575 0 00.813-.814L8.313 7.5l3.469-3.468z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className='home_hub'>
                <div className={'big_card'}>
                  <Card
                    name='Controles'
                    singularName='control'
                    href='controles'
                    index={['Número', 'Nombre', 'Evidencias', 'Periodicidad', 'Riesgos en uso']}
                    apiURL={'https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getControlesData?id_empresa='}
                  />
                </div>
                <div className={'small_card'}>
                  <Card
                    name='Gestores'
                    singularName='gestor'
                    href='gestores'
                    index={['Nombre', 'email']}
                    apiURL = 'https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getGestoresData?id_empresa='
                  />
                </div>
                <div className={'big_card'}>
                  <Card
                    name='Riesgos'
                    singularName='riesgo'
                    href='riesgos'
                    index={['Nombre', 'Valor inherente', 'Número de Controles Asociados', 'Valor Residual']}
                    apiURL='https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getRiesgosData?id_empresa='
                  />
                </div>
                <div className={'small_card'}>
                  <Card
                    name='Auditorías'
                    singularName='auditoría'
                    href='auditorias'
                    index={['Nombre', 'Progreso']}
                    apiURL='https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getAuditorias?id_empresa='
                  />
                </div>
              </div>
            </div>
            
          ) : (
                <div className='bussines_box'>
                  <h3>Hola {name}</h3>
                  <EmpresasForm show={showPopup} onClose={handleClosePopup} fetchData={getUserData}/>
                  <div className='total_add'>
                    <div className='upper_box'>
                        <div className='text'>Total de&nbsp;<strong>empresas</strong>:</div>
                        {UserInfo && UserInfo.data && UserInfo.data.empresas ? (
                          <div className='number'>{UserInfo.data.empresas.length}</div>
                        ):(
                          <div></div>
                        )}
                        
                    </div>
                    <div onClick={handleOpenPopup}>
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
                  <div className='bussines_div overflow-auto h-full'>
                    {UserInfo && UserInfo.data && UserInfo.data.empresas ? (
                      <div className='admin_boxes overflow-y-auto h-full' >
                        {UserInfo.data.empresas.map((empresas, index) => (
                          <div className='bussiness_boxes flex flex-col relative' >
                            <h3 className='font-bold'>{empresas[1]}</h3>
                            <div className='grow flex' onClick={() => handleClick(empresas[0])}>
                              <div className='w-1/2 h-full flex-col flex'>
                                <h4 className='border-b-2 border-black w-3/4 mx-auto'>
                                  <span className='px-3'>Contacto</span>
                                </h4>
                                <div className='flex flex-col justify-around grow h-full'>
                                  <div>{empresas[8] === 'None' ? '------' : empresas[8]}</div>
                                  <div>{empresas[10] === 'None' ? '------' : empresas[10]}</div>
                                  <div><a href={empresas[9] === 'None' ? ' ' : empresas[9]}>{empresas[9] === 'None' ? '------' : empresas[9]}</a></div>
                                  <div className='h-12 w-3/4  mx-auto'>
                                    <tr className='flex justify-between'>
                                      <td><p className='text-center font-semibold'>V.Transversal</p></td>
                                      <td><p className='text-center font-semibold'>V.Específico</p></td>
                                    </tr>
                                    <tr className='flex justify-around'>
                                      <td><p className='text-center'>{empresas[6] === 'None' ? 0 : empresas[6]}</p></td>
                                      <td><p className='text-center'>{empresas[7] === 'None' ? 0 : empresas[7]}</p></td>
                                    </tr>
                                  </div>
                                </div>
                              </div>
                              <div className='w-1/2 flex flex-col justify-around'>
                                <div>
                                  <p>Total Auditorías</p>
                                  <p>{empresas[12]}</p>
                                </div>
                                <div>
                                  <p>Progeso Total</p>
                                  <CircularProgress 
                                    value={empresas[12] === '0'
                                      ? 0 
                                      : parseInt(empresas[13]) / (parseInt(empresas[14]) + parseInt(empresas[13]))
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                            {/*
                            <div>Img <span>{empresas[11]}</span></div>
                            */}
                            <div className='absolute right-3' style={{zIndex:'99'}} onClick={(e) => handleOpenEditPopup(empresas)}>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-7 bg-gray-300 p-1 rounded-full hover:bg-gray-500 hover:border-2 hover:border-black">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                              </svg>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                    ) : (
                          <div className='admin_boxes'>
                            {Array.from({ length: 4 }).map((_, index) => (
                              <div className='bussiness_boxes skeleton'></div>
                            ))}
                          </div>
                    )}
                  </div>
                  {showEditPopup && selectedEditEmpresa && (
                    <EditEmpresasForm
                        show={showEditPopup}
                        onClose={handleCloseEditPopup}
                        fetchData={getUserData}
                        empresa_id={selectedEditEmpresa[0]} 
                        name={selectedEditEmpresa[1]} 
                        email={selectedEditEmpresa[8]} 
                        phone={selectedEditEmpresa[10]} 
                        web={selectedEditEmpresa[9]} 
                        v_esp={selectedEditEmpresa[6]} 
                        v_trn={selectedEditEmpresa[7]}
                        />    
                )}
                </div>

              )}
          
        </div>
      )}
      {role === 'gestor' && (
        <div className='gestor_home'>
          <div className='home_hub'>
            <div className={'big_card'}>
              <Card
                name='Controles'
                singularName='control'
                href='controles'
                index={['Número', 'Nombre', 'Evidencias', 'Periodicidad', 'Auditorías en uso']}
                apiURL={'https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getControlesData?id_empresa='}
              />
            </div>
            <div className={'small_card'}>
              <Card
                name='Auditorías'
                singularName='auditoría'
                href='auditorias'
                index={['Nombre', 'Progreso']}
                apiURL='https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getAuditorias?id_empresa='
              />
            </div>
            <div className={'big_card'}>
              <Card
                name='Responsables'
                singularName='responsable'
                href='responsables'
                index={['Nombre', 'Título', 'email']}
                apiURL={'https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getResponsablesData?id_empresa='}
              />
            </div>
          </div>
        </div>
      )}
      {role === 'responsable' && (
        <div className='responsable_home'>
          { UserInfo ? (
              <div className='responsable_main'>
                <div className='length-responsable'>
                  Controles Asociados: {UserInfo.data.riesgos.length}
                </div>
                <div className='card_option'>
                <div className="table-container">
                  {UserInfo && UserInfo.data && UserInfo.data.riesgos ? (
                    <div>
                      <table className="card_table">
                        <tr className="table-row">
                          <th>Número de Control</th>
                          <th>Nombre</th>
                          <th>Evidencias</th>
                          <th>Responsable</th>
                          <th>Fecha límite</th>
                          <th>Fecha de creación</th>
                          <th>Archivos subidos</th>
                          <th>Estado</th>
                        </tr>
                        {UserInfo.data.riesgos.map((riesgo, index) => (
                          <tr key={index} className="table-row">
                            <td>{riesgo[1]}</td>
                            <td>{riesgo[2]}</td>
                            <td>{riesgo[3]}</td>
                            <td>{riesgo[4]}</td>
                            <td>{riesgo[5]}</td>
                            <td>{riesgo[6]}</td>
                            <td className='archive_responsable'>
                              <div className={riesgo[7] === 'None' ? '' : 'archive'}>
                                  {riesgo[7] === 'None' ? (
                                    <>
                                      <button className='archive_button' onClick={() => {
                                            setShowUploadPopup(true);
                                            setSelectedControl(riesgo);
                                          }
                                      }>Subir Archivo</button>
                                      <FileUploadPopup
                                        show={showUploadPopup}
                                        onClose={() => setShowUploadPopup(false)}
                                        onUpload={handleUpload}
                                        selectedControl={selectedControl}
                                        selectedAuditoria={riesgo[9]}
                                        userData = {UserAuditoriaData}
                                        fetchData={getUserData}
                                      />
                                    </>
                                  ) : (
                                    <>
                                      <p onClick={() => setshowIMGPopup(true)}>{riesgo[7].split('/').slice(1).join('')}</p>
                                      <ShowFile
                                        show={showIMGPopup}
                                        onClose={() => setshowIMGPopup(false)}
                                        imgkey={riesgo[7]} // Pasamos el Key del archivo
                                        bucketName={`empresa-${riesgo[10]}`}
                                      />
                                    </>
                                  )}
                                </div>
                              </td>
                            <td>{riesgo[8]}</td>
                          </tr>
                        ))}
                      </table>
                    </div>

                  ) : (
                    <div>No hay información disponible</div>
                  )}
                </div>
                </div>
              </div>
          ):(
            <div className='responsable_main'>
                <div className='length-responsable'>
                  <p>Controles Asociados: <div className='number skeleton' style={{height : '70%', margin: 'auto', width:'50px', borderRadius:'30px'}}></div></p>
                </div>

                <div className='card_option'>
                  <div className="table-container skeleton">
                    <div>
                      <table className="card_table">
                        <tr className="table-row">
                          <th>Número de Control</th>
                          <th>Nombre</th>
                          <th>Evidencias</th>
                          <th>Responsable</th>
                          <th>Fecha límite</th>
                          <th>Fecha de creación</th>
                          <th>Archivos subidos</th>
                          <th>Estado</th>
                        </tr>
                        {Array.from({ length: 8 }).map((_, index) => (
                          <tr key={index} className="table-row">
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                          </tr>
                        ))}
                      </table>
                    </div>
                  </div>
                </div>
              </div>

          )}
        </div>
      )}
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
