import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import './Home.css';
import EmpresasForm from '../form/EmpresasForm';


import FileUploadPopup from '../form/UploadFile'; // Importa el nuevo componente

import { useAuth } from '../context/AuthContext';
import axios from 'axios';

import ShowFile from '../form/ShowFile';

const Home = () => {
  
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [showIMGPopup, setshowIMGPopup] = useState(false);

  const { name, role, cognitoId, token, setSelectedEmpresa, selectedEmpresa, configureAwsCredentials} = useAuth();
  const [UserInfo, setUserInfo] = useState(null); // State para guardar los datos
  const [loading, setLoading] = useState(true); // Estado de carga

  const [showPopup, setShowPopup] = useState(false);
  const handleOpenPopup = () => setShowPopup(true);
  const handleClosePopup = () => setShowPopup(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [selectedControl, setSelectedControl] = useState(null);

  const [UserAuditoriaData, setUserAuditoriaData] = useState(null);


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


  const fetchData = async () => {
    try {
        setData(data.empresas);
        getUserData();
    } catch (error) {
        setError(error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
      fetchData();
  }, [selectedEmpresa]);


  const fetchUserAuditoriaData = async () => {
    try {
        const response = await axios.get("https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getUserAuditoriaData?id_cognito="+cognitoId);
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
    return <div className='admin_boxes'>
              {Array.from({ length: 8 }).map((_, index) => (
                <div className='bussiness_boxes skeleton'></div>
              ))}
            </div>; // Indicador de carga mientras se obtienen los datos
  }

  return (
    <div className='home_main'>
      {role === 'admin' && (
        <div className='admin_home'>
          {selectedEmpresa ?(
            <div>
              <div>
                <svg 
                  className='close-icon'
                  fill="none" 
                  viewBox="0 0 15 15" 
                  height="3em" 
                  width="3em" 
                  onClick={handleReset}
                >
                  <path
                    fill="red"
                    fillRule="evenodd"
                    d="M11.782 4.032a.575.575 0 10-.813-.814L7.5 6.687 4.032 3.218a.575.575 0 00-.814.814L6.687 7.5l-3.469 3.468a.575.575 0 00.814.814L7.5 8.313l3.469 3.469a.575.575 0 00.813-.814L8.313 7.5l3.469-3.468z"
                    clipRule="evenodd"
                    stroke="red"
                    strokeWidth="0.6"  // Ajusta este valor para cambiar el grosor
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
                    index={['Nombre', 'Puntuación', 'Controles Asociados', 'Número de Controles Asociados']}
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
                  <EmpresasForm show={showPopup} onClose={handleClosePopup} fetchData={fetchData}/>
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
                  <div className='bussines_div'>
                    {UserInfo && UserInfo.data && UserInfo.data.empresas ? (
                      <div className='admin_boxes' >
                        {UserInfo.data.empresas.map((empresas, index) => (
                          <div className='bussiness_boxes' onClick={() => handleClick(empresas[0])}>
                            <h3>{empresas[1]}</h3>
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
                                      />
                                    </>
                                  ) : (
                                    <>
                                      <p onClick={() => setshowIMGPopup(true)}>{riesgo[7]}</p>
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
    </div>
  );
};

export default Home;
