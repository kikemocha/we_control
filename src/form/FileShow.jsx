import React, { useState, useRef, useEffect } from 'react';
import { DeleteObjectCommand, PutObjectCommand, GetObjectCommand} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const MAX_SIMPLE_UPLOAD_SIZE = 5 * 1024 ** 3;

const FileShow = ({data, onClose}) => {
  const { token, userData, s3Client, awsCredentials, role, refreshAccessToken } = useAuth();
  const [archives, setArchives] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeSkewError, setTimeSkewError] = useState(null);

  const [message, setMessage] = useState('');
  const [fileProgress, setFileProgress] = useState({});
  const [showTextPopup, setShowTextPopup] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(()=>{
    if(archives.length !== 0 & uploadError === 'Por favor, selecciona un archivo primero.'){
      setUploadError('');
    }
  },[archives])

  const getPresignedDownloadUrl = async ({key, expiresIn = 3600 }) => {
    const command = new GetObjectCommand({
      Bucket: 'wecontrolbucket',
      Key: key,
    });
  
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  };

  useEffect(() => {
    if (Array.isArray(data.archives)) {
      setArchives(
        data.archives.map(key => ({ key }))
      );
    }

    if (data.archives.length === 1) {
      const fileKey = data.archives[0];
      if (fileKey && fileKey.endsWith('.pdf')) {
        const fetchFileUrl = async () => {
          try {
            console.log('Archivo clave:', fileKey);
            const fileUrl = await getPresignedDownloadUrl({key:fileKey});
            setPreviewUrl(fileUrl);  // Establecer la URL del archivo PDF
          } catch (error) {
            console.error('Error obteniendo la presigned URL:', error);
            alert('Hubo un error al generar la URL para descargar el archivo');
          }
        };
        fetchFileUrl();
      }
    }
  }, [data.archives]);

  const handleDeny = async () => {
    setLoading(true);
    try {
      const requestBody = {
        id_control : data.id_control,
        id_auditoria : data.id_auditoria,
        state: 2, // 2 => Denegado
        order: data.order,
        message: message,
        control_name: data.control_name
      };
      console.log('requestBody: ',requestBody);
      const response = await fetch(
        'https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/UpdateControlAuditoriaState',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );
      if (response.ok) {
        onClose();
      } else {
        const errorMessage = await response.text();
        console.error('Error en la respuesta del servidor:', errorMessage);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const requestBody = {
        id_control : data.id_control,
        id_auditoria: data.id_auditoria,
        state: 1, 
        order : data.order
      };
      const response = await fetch(
        'https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/UpdateControlAuditoriaState',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );
      if (response.ok) {
        onClose();
      } else {
        const errorMessage = await response.text();
        console.error('Error en la respuesta del servidor:', errorMessage);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      onClose();
    }
  };


  if (timeSkewError) {
    return (
      <div className="popup-overlay">
        <div className="popup_img p-4 bg-yellow-100 text-yellow-800 rounded text-center">
          {timeSkewError}
          <button onClick={onClose} className="mt-4 popup-button">Cerrar</button>
        </div>
      </div>
    );
  }

  return (
  <div className='h-full w-full flex'>
    <div className="h-full w-full px-6 flex flex-col">
        <h4 className='text-xl font-bold mt-8 text-center'>
            {
                data.periodicity === 'Anual' ? (
                    data.control_name
                ) : data.periodicity === 'Semestral' ? (
                    `${data.control_name} - S${data.order}`
                ): data.periodicity === 'Cuatrimestral' ? (
                    `${data.control_name} - ${data.order}_Cuatr`
                ): data.periodicity === 'Trimestral' && (
                    `${data.control_name} - T${data.order}`
                )
            }
        </h4>
      {archives.length === 1 && previewUrl ? (
        // Un solo archivo: mostrar preview con botón para agregar más
        <div className="pt-6 h-full w-full flex flex-col">
          <iframe
            src={previewUrl}
            title="Vista previa del PDF"
            width="100%"
            height="90%"
            className='rounded-3xl border-2 border-solid border-gray-300'
          ></iframe>
        </div>
      ) : (
        <div className='h-full w-full'>
          <div className='h-[80%] w-full relative pt-12'>
            <div className='pointer-events-none absolute bottom-0 h-10 left-0 z-10  w-full bg-gradient-to-t from-white to-transparent'></div>
            <div className='overflow-auto h-full'>
              <ul className='px-24 pb-12'>
                {archives.map(({ key, file }, index) => {
                  return (
                    <li key={key} className='bg-gray-400 bg-opacity-35 w-[90%] mx-auto h-20 my-4 rounded-xl relative'>
                    <div className='h-full relative flex'>
                      <p
                        className='text-blue-700 underline cursor-pointer my-auto mx-auto overflow-hidden text-ellipsis px-12'
                        onClick={async () => {
                          try {
                            const url = await getPresignedDownloadUrl({ key });
                            window.open(url, '_blank');
                          } catch (error) {
                            console.error('Error obteniendo la presigned URL:', error);
                            alert('Hubo un error al generar la URL para descargar el archivo');
                          }
                        }}
                      >
                        {key.split('_').slice(1).join('_')}
                      </p>
                      
                    </div>
                  </li> 
                  )
                })}
              </ul>
            </div>
            
          </div>
            <div className="flex justify-center h-[20%] w-full">
                <div className='w-full h-1/2 my-auto'>
                    {(role === 'admin' || role === 'gestor') && (
                        <div className="h-full flex justify-around items-center">
                        {data.state === 'Verificado' ? (
                            <>
                            {!showTextPopup && 
                            <button className="popup-button text-red-800" onClick={() => setShowTextPopup(true)}>
                                No Validar
                            </button>
                            }
                            </>
                        ) : data.state === 'Denegado' ? (
                            <>
                            <button className="popup-button" onClick={handleVerify}>
                                Verificar
                            </button>
                            </>
                        ) : (
                            <>
                            <button className="popup-button" onClick={handleVerify}>
                                Verificar
                            </button>
                            {!showTextPopup && 
                                <button className="popup-button text-red-800" onClick={() => setShowTextPopup(true)}>
                                No Validar
                                </button>
                            }
                            </>
                        )}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
      {uploadError && <div style={{ color: 'red' }}>{uploadError}</div>}
    </div>
    {showTextPopup && (
            <div className="h-full w-1/2 my-auto rounded-3xl flex flex-col justify-center items-center relative">
              <div className='h-[80%] w-full flex items-center pr-12'>
                <textarea
                    rows="4"
                    className="w-full h-[70%] bg-gray-200 rounded-xl p-4 mt-4 mb-4 resize-none"
                    placeholder="Escribe un comentario..."
                    onChange={(e) => setMessage(e.target.value)}
                ></textarea>
              </div>
              <div className='h-[20%] flex items-center mr-12'>
                <button className="popup-button " onClick={handleDeny}>
                    No Validar
                </button>
              </div>
            </div>
          )}
    {loading && (
                <div className="absolute top-0 left-0 rounded-3xl w-full h-full bg-gray-400 bg-opacity-70 flex justify-center items-center z-10">
                  <div role="status">
                    <svg aria-hidden="true" className="inline w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-yellow-400" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
                  </div>
                </div>
              )}
  </div>
  );
};

export default FileShow;
