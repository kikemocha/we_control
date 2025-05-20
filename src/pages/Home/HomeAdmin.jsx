import React, {useState, useEffect} from "react";
import '../Home.css';

import { useAuth } from '../../context/AuthContext';
import axios from "axios";

import EmpresasForm from "../../form/EmpresasForm";
import EditEmpresasForm from "../../form/editForms/EditEmpresasForm";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

import RiskBarChart from "../graphs/RiskBarChart";
import ControlsDonutChart from "../graphs/ControlsDonutChart";
import PersonsCount from "../graphs/PersonCount";
import ProgressBar from "../graphs/ProgressBar";

const HomeAdmin = ({getUserData, UserInfo}) => {
    const { userData, setSelectedEmpresa, selectedEmpresa, searchQuery, selectedEmpresaName, setSelectedEmpresaName, s3Client, token, refreshAccessToken} = useAuth();
    const [showPopup, setShowPopup] = useState(false);
    
    const [years, setYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);
    const [loading, setLoading] = useState(false);
    const [homeInfo, setHomeInfo] = useState(null);
    
    useEffect(() => {
      if (!selectedEmpresa) {
        setYears([]);
        setSelectedYear(null);
        return;
      }
  
      setLoading(true);
  
      axios
        .get("https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getYears", {
          headers: { Authorization: `Bearer ${token}` },
          params: { id_empresa: selectedEmpresa },
        })
        .then((resp) => {
          const yrs = resp.data;
          console.log(yrs)
          setYears(yrs);
          if (yrs.length) {
            // pick the highest id_year
            const max = yrs.reduce(
              (acc, y) => (y.id_year > acc ? y.id_year : acc),
              yrs[0].id_year
            );
            setSelectedYear(max);
          }
        })
        .catch((err) => {
          console.error("couldn't fetch years", err);
        })
        .finally(() => setLoading(false));
    }, [selectedEmpresa, token]);
  
    // 2) When empresa AND selectedYear are set, fetch the homeInfo
    useEffect(() => {
      if (!selectedEmpresa || selectedEmpresa === 'null'|| selectedYear === null) return;
  
      setLoading(true);
  
      axios
        .get("https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getHomeInfo", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: {
            id_empresa: selectedEmpresa,
            id_year: selectedYear,
          },
        })
        .then((resp) => {
          setHomeInfo(resp.data.result);
        })
        .catch((err) => {
          console.error("failed to load home info", err);
        })
        .finally(() => setLoading(false));
    }, [selectedEmpresa, selectedYear, token]);
    
    
    
    const [showEditPopup, setshowEditPopup] = useState(false);
    const [selectedEditEmpresa, setSelectedEditEmpresa] = useState(null);
    const handleOpenEditPopup = (empresa) => {
        setSelectedEditEmpresa(empresa);
        setshowEditPopup(true);
        };
    const handleCloseEditPopup = () => setshowEditPopup(false);
    
    const filteredEmpresas = UserInfo?.data?.empresas?.filter((empresa) =>
      empresa[1].toLowerCase().includes(searchQuery.toLowerCase()) // Filtra por nombre de empresa
    );

    const [imgUrl, setImgUrl] = useState(null);
    const { img: imgKey } = selectedEmpresaName || {};

    useEffect(() => {
      if (!s3Client || !imgKey) {
        setImgUrl(null);
        return;
      }
      const fetchImageUrl = async () => {
        const command = new GetObjectCommand({
          Bucket: "wecontrolbucket",
          Key: imgKey,
        });
        try {
          const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
          setImgUrl(url);
        } catch (err) {
          console.error("Error getting signed URL", err);
          setImgUrl(null);
        }
      };
      fetchImageUrl();
    }, [s3Client, imgKey]);
    
    const empresaToObj = (empresa) => ({
      id_empresa: empresa[0],
      name: empresa[1],
      stripe_id: empresa[2],
      is_despacho: empresa[3],
      created_by: empresa[4],
      email: empresa[5],
      web: empresa[6],
      phone: empresa[7],
      img: empresa[8] && empresa[8] !== "None" ? empresa[8] : null,
      CIF: empresa[9],
    });

    const handleUploadImage = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

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
      console.log("fileKey:", fileKey);
    
      const arrayBuffer = await file.arrayBuffer();

      const params = {
        Bucket: "wecontrolbucket",
        Key: fileKey,
        Body: new Uint8Array(arrayBuffer),
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
    
      console.log("Imagen subida correctamente:", fileKey);
      const imageUrl = fileKey;
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

    const handleDeleteEmpresaImg = async (imgKey) =>{
      if (!s3Client) {
        console.error("No S3 client available");
        return;
      }
      const requestBody = {
        empresa_img: imgKey,
        empresa_id: selectedEmpresa
      };
      const params = {
        Bucket: "wecontrolbucket",
        Key: imgKey,
      };
      try {
        try {
          const command = new DeleteObjectCommand(params);
          await s3Client.send(command);
          console.log("Image deleted from S3:", imgKey);
          // Actualiza el estado para borrar la imagen
          setSelectedEmpresaName((prev) => ({ ...prev, img: null }));
        } catch (error) {
          console.error("Error deleting image from S3:", error);
        }
        const response = await fetch(
          'https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/deleteFile',
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
          }
        );
      } catch (err) {
        console.error("Error al actualizar backend con imagen:", err);
      }
    };
    const handleDeleteImage = async () => {
      if (selectedEmpresaName?.img) {
        await handleDeleteEmpresaImg(selectedEmpresaName.img);
        setSelectedEmpresaName((prev) => ({ ...prev, img: null }));
      }
    };

    const info = homeInfo || {
      valor_especifico: 0,
      valor_transversal: 0,
      no_riesgo: 0,
      poco_riesgo: 0,
      riesgo_medio: 0,
      riesgo_alto: 0,
      mucho_riesgo: 0,
      controles_especificos: 0,
      controles_transversales: 0,
      responsables: 0,
      gestores: 0,
      total_auditorias: 0,
      Verificado: 0,
      NoVerificado: 0,
    };

  
    if (selectedEmpresa && selectedEmpresa !== 'null' && loading) {
      return <div className="h-full">
      <div>
        <svg fill="none" viewBox="0 0 15 15" height="3em" width="3em" onClick={() => {
          setSelectedEmpresa(null); 
          setSelectedEmpresaName(null); 
          setImgUrl(null); 
          getUserData();
          setHomeInfo(null)}} className='close-icon text-red-500'>
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M11.782 4.032a.575.575 0 10-.813-.814L7.5 6.687 4.032 3.218a.575.575 0 00-.814.814L6.687 7.5l-3.469 3.468a.575.575 0 00.814.814L7.5 8.313l3.469 3.469a.575.575 0 00.813-.814L8.313 7.5l3.469-3.468z"
            clipRule="evenodd"
          />
        </svg>
      </div>
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
    } else if (loading){
      return <div className='bussines_box'>
      <h3 className="md:text-xs lg:text-sm xl:text-md 2xl:text-lg ">Hola {userData.name}</h3>
      <EmpresasForm show={showPopup} onClose={() => {setShowPopup(false)}} fetchData={getUserData}/>
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

    return <div className='admin_home'>
    {selectedEmpresa !== null && selectedEmpresa !== 'null'?(
      <div className="h-full">
        <div>
          <svg fill="none" viewBox="0 0 15 15" height="3em" width="3em" onClick={() => {
            setSelectedEmpresa(null); 
            setSelectedEmpresaName(null); 
            setImgUrl(null); 
            getUserData();
            setHomeInfo(null)}} className='close-icon text-red-500'>
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M11.782 4.032a.575.575 0 10-.813-.814L7.5 6.687 4.032 3.218a.575.575 0 00-.814.814L6.687 7.5l-3.469 3.468a.575.575 0 00.814.814L7.5 8.313l3.469 3.469a.575.575 0 00.813-.814L8.313 7.5l3.469-3.468z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="h-full w-full flex-col justify-between">
          <div className="w-full h-full flex flex-col">
            <div className="flex flex-row w-full">
              <div className="w-1/2 h-[40vh] mr-12 p-6 bg-gray-100 rounded-3xl">
                <div className="h-2/3 w-full flex">
                {/* Columna de imagen */}
                <div className="w-1/2 h-full flex items-center justify-center relative">
                  {imgUrl ? (
                      <div className="w-full h-full flex items-center justify-center p-12">
                      {console.log('IMGURL: ', imgUrl)}
                      <img
                        src={imgUrl}
                        alt={selectedEmpresaName?.name}
                        className="w-full h-full max-h-full object-contain"
                      />
                      <div className="absolute top-1 right-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="red" className="size-6 cursor-pointer" onClick={handleDeleteImage}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                      <label className="bg-gray-300 px-4 py-2 rounded cursor-pointer">
                          Subir img
                          <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleUploadImage}
                          />
                      </label>
                  )}
                </div>
                <div className="w-1/2 h-full flex flex-col items-center justify-center">
                  <div className="">
                    <p className=" text-center border-b-2 border-gray-600 ">{selectedEmpresaName?.name}</p>
                  </div>
                  <div className="mt-2">
                  {selectedEmpresaName?.CIF && selectedEmpresaName.CIF !== 'None' && selectedEmpresaName.CIF !== '' 
                  ? selectedEmpresaName.CIF 
                  : '------'}
                  </div>
                </div>
              </div>

                <div className="h-1/3 w-full flex justify-around">
                  <div className="w-1/2 flex justify-center align-middle items-center">
                    <select name="" id="" className="h-1/2 w-1/2 p-4 rounded-2xl"
                      value={selectedYear} 
                      onChange={(e) => setSelectedYear(e.target.value)}>
                      <option disabled value="">Año</option>
                            {years.length === 0 ? (
                                <option>Cargando...</option>
                            ) : (
                                years.map((year, index) => (
                                    <option key={index} value={year.id_year}>{year.value}</option>
                                ))
                            )}
                      
                    </select>
                  </div>
                  <div className="w-1/2 flex justify-around">
                    <div>
                      <ul className="h-full flex flex-col justify-center">
                        <li className="border-b-2 border-gray-400">Valor Específico</li>
                        <li className="my-2 text-center font-bold">{info.valor_especifico}</li>
                      </ul>
                    </div>
                    <div>
                      <ul className="h-full flex flex-col justify-center">
                        <li className="border-b-2 border-gray-400">Valor Transversal</li>
                        <li className="my-2 text-center font-bold">{info.valor_transversal}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-1/3 h-[40vh] mr-12 p-6 bg-gray-100 rounded-3xl">
                    <div className="w-full text-center uppercase" style={{height:"20%"}}>
                      Riesgos
                    </div>
                    <div className="px-12" style={{height:"80%"}}>
                    {selectedEmpresa && (
                      <RiskBarChart
                        key={selectedEmpresa}      // ← aquí forzas remount al cambiar de empresa
                        counts={{
                          
                          'Muy Bajo': info.no_riesgo,
                          'Bajo':       info.poco_riesgo,
                          'Medio':   info.riesgo_medio,
                          'Alto':      info.riesgo_alto,
                          'Muy Alto' : info.mucho_riesgo
                          
                        }}
                      />
                    )}
                    </div>
              </div>
            </div>
            <div className="w-full h-1/2 flex flex-row items-center">
              <div className="w-1/3 h-[40vh] mr-12 p-6 bg-gray-100 rounded-3xl">
                <div className="w-full text-center uppercase" style={{height:"20%"}}>
                  Controles
                </div>
                <ControlsDonutChart key={selectedEmpresa} counts={{
                  'Transversal': info.controles_transversales,
                  'Especifico': info.controles_especificos,
                }} />
              </div>
              <div className="w-1/6 h-[40vh] mr-12 p-6 bg-gray-100 rounded-3xl">
                <PersonsCount key={selectedEmpresa} counts={
                  {
                    'Gestores': info.gestores,
                    'Responsables': info.responsables
                  }} />
              </div>
              <div className="w-1/3 h-[40vh] mr-12 p-6 bg-gray-100 rounded-3xl">
                <div className="w-full text-center uppercase" style={{height:"20%"}}>
                  Auditorías / Seguimientos
                </div>
                <div className="" style={{height:"40%"}}>
                  <PersonsCount key={selectedEmpresa} counts={{'Total auditorías / seguimientos' : info.total_auditorias}} />
                </div>
                <div className="flex flex-col px-12 pt-6" style={{height:"40%"}}>
                  <span className=" w-full mb-6 text-md uppercase text-gray-600 text-center mx-auto">Porcentaje total</span>
                  <ProgressBar percent={
                    (info.Verificado + info.NoVerificado) > 0
                      ? Math.round(
                          (info.Verificado / (info.Verificado + info.NoVerificado)) * 100
                        )
                      : 0
                  } height={16} />
                  <div className="mx-auto">
                  {
                    (info.Verificado + info.NoVerificado) > 0
                      ? Math.round(
                          (info.Verificado / (info.Verificado + info.NoVerificado)) * 100
                        )
                      : 0
                  }%
                  </div>
                </div>
              </div>
            </div>
            
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
                          <span className="overflow-hidden text-ellipsis">{empresa[6] === 'None' || !empresa[6] ? '------' : empresa[6]}</span>
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
                <div className='bussines_box'>
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