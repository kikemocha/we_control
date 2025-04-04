import React, {useState, useEffect} from "react";
import '../Home.css';

import { useAuth } from '../../context/AuthContext';

import EmpresasForm from "../../form/EmpresasForm";
import EditEmpresasForm from "../../form/editForms/EditEmpresasForm";
import Card from "../../components/Card";

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import S3Image from "../../components/S3Image";

const HomeAdmin = ({getUserData, UserInfo}) => {
    const { userData, setSelectedEmpresa, selectedEmpresa, searchQuery, selectedEmpresaName, setSelectedEmpresaName, s3Client, token, refreshAccessToken} = useAuth();
    const [showPopup, setShowPopup] = useState(false);


    const [showEditPopup, setshowEditPopup] = useState(false);
    const [selectedEditEmpresa, setSelectedEditEmpresa] = useState(null); // Empresa seleccionado para editar
    const handleOpenEditPopup = (empresa) => {
        setSelectedEditEmpresa(empresa);  // Guardar el item seleccionado
        setshowEditPopup(true);
        };
    const handleCloseEditPopup = () => setshowEditPopup(false);
    
    const filteredEmpresas = UserInfo?.data?.empresas?.filter((empresa) =>
      empresa[1].toLowerCase().includes(searchQuery.toLowerCase()) // Filtra por nombre de empresa
    );
    
    const empresaToObj = (empresa) => ({
      id_empresa: empresa[0],
      name: empresa[1],
      stripe_id: empresa[2],
      is_despacho: empresa[3],
      created_by: empresa[4],
      email: empresa[5],
      web: empresa[6],
      phone: empresa[7],
      img: empresa[8],
      CIF: empresa[9],
    });

    const handleUploadImage = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
    
      // Verifica que s3Client esté disponible
      if (!s3Client) {
        console.error("No se encontró el cliente S3. Verifica tus credenciales.");
        return;
      }
    
      const maxLength = 255;
      const despachoId = userData.despacho_id;
      const empresaId = selectedEmpresa; // id de la empresa
      let pathPrefix = "";
      if (userData.is_gestor === 0 && userData.is_responsable === 0) {
        pathPrefix = `${userData.belongs_to}/${empresaId}`;
      } else if (userData.is_gestor === 1 && userData.is_responsable === 0) {
        pathPrefix = `${despachoId}/${empresaId}`;
      }
    
      const fileName = file.name;
      const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);
      const baseFileName = fileName.substring(0, fileName.lastIndexOf('.'));
      const uuid = uuidv4();
      const cleanFileName = baseFileName.replace(/[^a-zA-Z0-9]/g, "_");
      const totalFixedLength = pathPrefix.length + 1 + uuid.length + 1 + fileExtension.length + 1;
      const availableLengthForFileName = maxLength - totalFixedLength;
      const truncatedFileName = cleanFileName.substring(0, availableLengthForFileName);
      const fileKey = `${pathPrefix}/${uuid}_${truncatedFileName}.${fileExtension}`;
    
      const params = {
        Bucket: "wecontrolbucket",
        Key: fileKey,
        Body: file,
        ContentType: file.type
      };
    
      // Función auxiliar para enviar el archivo
      const sendFile = async (client) => {
        const command = new PutObjectCommand(params);
        return client.send(command);
      };
    
      try {
        await sendFile(s3Client);
      } catch (error) {
        if (error.message && error.message.includes("ExpiredToken")) {
          console.warn("Token expirado. Refrescando credenciales...");
          // Refrescar credenciales
          await refreshAccessToken();
          // Espera un poco para que el context actualice s3Client (por ejemplo, 1 segundo)
          await new Promise(resolve => setTimeout(resolve, 1000));
          try {
            await sendFile(s3Client);
          } catch (retryError) {
            console.error("Error al subir imagen después de actualizar el token:", retryError);
            return;
          }
        } else {
          console.error("Error al subir imagen:", error);
          return;
        }
      }
    
      const imageUrl = `https://${params.Bucket}.s3.eu-west-1.amazonaws.com/${fileKey}`;
      // Actualiza el estado del objeto de la empresa para guardar la URL de la imagen
      setSelectedEmpresaName(prev => ({ ...prev, img: imageUrl }));
    
      // Opcional: Actualiza el backend con la nueva imagen
      const requestBody = {
        empresa_img: fileKey,
        empresa_id: selectedEmpresa
      };
      try {
        await fetch('https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/UpdateControlAuditoria', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        });
      } catch (err) {
        console.error("Error al actualizar backend con imagen:", err);
      }
    };
  
    return <div className='admin_home'>
    {selectedEmpresa !== null && selectedEmpresa !== 'null'?(
      <div>
        <div>
          <svg fill="none" viewBox="0 0 15 15" height="3em" width="3em" onClick={() => {setSelectedEmpresa(null); setSelectedEmpresaName(null)}} className='close-icon text-red-500'>
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
              name='Seguimientos y Auditorías'
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
            <h3 className="md:text-xs lg:text-sm xl:text-md 2xl:text-lg ">Hola {userData.name}</h3>
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
                <div className="w-4/5 mx-auto">
                  <ul className="flex flex-col gap-4 pb-24">
                    <li className="sticky top-0 bg-white z-10 grid grid-cols-3 gap-4 p-2 border-b-2 border-gray-400 font-bold">
                      <span>Nombre</span>
                      <span>CIF</span>
                      <span>Correo de contacto</span>
                    </li>
                    {filteredEmpresas.length > 0 ? (
                      filteredEmpresas.map((empresa, index) => (
                        <li
                          key={index}
                          className="grid grid-cols-3 gap-4 border border-gray-200 hover:bg-gray-100 rounded-2xl px-4 py-4 cursor-pointer relative"
                          onClick={() => {
                            setSelectedEmpresa(empresa[0]);
                            setSelectedEmpresaName(empresaToObj(empresa));
                          }}
                        >
                          <span>{empresa[1]}</span>
                          <span>
                            {empresa[9] === 'None' || !empresa[9] ? '------' : empresa[9]}
                          </span>
                          <span className="overflow-hidden text-ellipsis">{empresa[5] === 'None' || !empresa[5] ? '------' : empresa[5]}</span>
                          <div className='absolute right-3 top-4 hover:bg-gray-400 rounded-full'  onClick={(e) => {e.stopPropagation(); handleOpenEditPopup(empresa)}}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                            </svg>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 text-center mt-4">
                        No se encontraron empresas con ese nombre.
                      </li>
                    )}
                  </ul>
                </div>
              ) : (
                <div className="w-4/5 mx-auto">
                  <ul className="flex flex-col gap-4 pb-24">
                  <li className="sticky top-0 bg-white z-10 grid grid-cols-3 gap-4 p-2 border-b-2 border-gray-400 font-bold">
                        <span>Nombre</span>
                        <span>CIF</span>
                        <span>Correo de contacto</span>
                      </li>
                  {Array.from({ length: 8 }).map((_, index) => (
                      <li
                      key={index}
                      className="skeleton grid grid-cols-3 gap-4 h-16 border border-gray-200 hover:bg-gray-100 rounded-2xl px-4 py-4 cursor-pointer relative"
                    >
                    </li>
                    ))}
                  </ul>
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
                  email={selectedEditEmpresa[5]} 
                  phone={selectedEditEmpresa[7]} 
                  web={selectedEditEmpresa[6]} 
                  cif={selectedEditEmpresa[9]}
                  />    
          )}
          </div>

        )}
    
  </div>
};
export default HomeAdmin;