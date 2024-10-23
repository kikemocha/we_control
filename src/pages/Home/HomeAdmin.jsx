import React, {useState} from "react";
import '../Home.css';

import { useAuth } from '../../context/AuthContext';

import EmpresasForm from "../../form/EmpresasForm";
import EditEmpresasForm from "../../form/editForms/EditEmpresasForm";
import CircularProgress from "../../components/CircularProgress";
import Card from "../../components/Card";

const HomeAdmin = ({getUserData, UserInfo}) => {
    const { name, setSelectedEmpresa, selectedEmpresa} = useAuth();
    
    const [showPopup, setShowPopup] = useState(false);

      // Admin -> Empresas Edit Form

    const [showEditPopup, setshowEditPopup] = useState(false);
    const [selectedEditEmpresa, setSelectedEditEmpresa] = useState(null); // Empresa seleccionado para editar
    const handleOpenEditPopup = (empresa) => {
        setSelectedEditEmpresa(empresa);  // Guardar el item seleccionado
        setshowEditPopup(true);
        };
    const handleCloseEditPopup = () => setshowEditPopup(false);
    
    return <div className='admin_home'>
    {selectedEmpresa ?(
      <div>
        <div>
          <svg fill="none" viewBox="0 0 15 15" height="3em" width="3em" onClick={() => setSelectedEmpresa(null)} className='close-icon text-red-500'>
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
            <EmpresasForm show={showPopup} onClose={() => {setShowPopup(false)}} fetchData={getUserData}/>
            <div className='total_add'>
              <div className='upper_box'>
                  <div className='text'>Total de&nbsp;<strong>empresas</strong>:</div>
                  {UserInfo && UserInfo.data && UserInfo.data.empresas ? (
                    <div className='number'>{UserInfo.data.empresas.length}</div>
                  ):(
                    <div></div>
                  )}
                  
              </div>
              <div onClick={() => {setShowPopup(true)}}>
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
                      <div className='grow flex' onClick={() => setSelectedEmpresa(empresas[0])}>
                        <div className='w-3/4 mx-auto h-full flex-col flex'>
                          <h4 className='border-b-2 border-black w-3/4 mx-auto'>
                            <span className='px-3'>Contacto</span>
                          </h4>
                          <div className='flex flex-col justify-around grow h-full'>
                            <div>{empresas[8] === 'None' ? '------' : empresas[8]}</div>
                            <div>{empresas[10] === 'None' ? '------' : empresas[10]}</div>
                            <div>
                              <a 
                                className='z-99 text-blue-800 hover:text-purple-800' 
                                href={
                                  empresas[9] === 'None' 
                                    ? ' ' 
                                    : empresas[9].startsWith('http') 
                                      ? empresas[9] 
                                      : `https://${empresas[9]}`
                                } 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                {empresas[9] === 'None' ? '------' : empresas[9]}
                              </a>
                            </div>
  
                          </div>
                        </div>
                      </div>
                      {/*
                      <div>Img <span>{empresas[11]}</span></div>
                      */}
                      <div className='absolute right-3' style={{zIndex:'99'}} onClick={(e) => handleOpenEditPopup(empresas)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-7 bg-gray-300 p-1 rounded-full hover:bg-gray-500 hover:border-2 hover:border-black">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
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
};
export default HomeAdmin;