import React, { useState, useEffect, useRef } from 'react';
import './Popup.css'; 
import { useAuth } from '../context/AuthContext';
import { S3Client, DeleteObjectCommand, GetObjectCommand, PutObjectCommand} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const ShowFile = ({
  archives = [],         // Array de rutas S3
  show,
  onClose,
  id_control,
  id_auditoria,
  state,
  fetchData,
  control_name,
  message_admin,
  order
}) => {
  const [uploadError, setUploadError] = useState('');
  const { role, token, awsCredentials, fetchAwsCredentials, userData } = useAuth(); 
  const [message, setMessage] = useState('');
  const [showTextPopup, setShowTextPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  // Para almacenar temporalmente el signedURL cuando hay 1 solo archivo PDF
  const [pdfSignedUrl, setPdfSignedUrl] = useState(null);

  // Intentos para reintentar credenciales
  useEffect(() => {
    let attemptCount = 0;
    const checkAwsCredentials = async () => {
      if (!awsCredentials?.AccessKeyId && attemptCount < 3) {
        setLoading(true);
        attemptCount += 1;
        await fetchAwsCredentials(token);

        if (!awsCredentials?.AccessKeyId && attemptCount < 3) {
          setTimeout(checkAwsCredentials, 1000);
        } else {
          setLoading(false);
        }
      }
    };
    checkAwsCredentials();
  }, [awsCredentials, fetchAwsCredentials, token]);

  // Instancia del cliente S3
  const s3Client = new S3Client({
    region: 'eu-west-1',
    credentials: {
      accessKeyId: awsCredentials?.AccessKeyId || '',
      secretAccessKey: awsCredentials?.SecretAccessKey || '',
      sessionToken: awsCredentials?.SessionToken || '',
    },
  });

  // Cerrar popup
  const handleClose = () => {
    setShowTextPopup(false);
    setUploadError('');
    setPdfSignedUrl(null);  // Reseteamos la URL PDF si existía
    onClose();
  };

  // Eliminar un archivo específico
  const handleDelete = async (archiveKey) => {
    setLoading(true);
    try {
      // 1. Eliminar en S3
      const params = {
        Bucket: 'wecontrolbucket',
        Key: archiveKey,
      };
      const deleteCommand = new DeleteObjectCommand(params);
      await s3Client.send(deleteCommand);

      // 2. Llamar a tu API para marcarlo en BD
      const requestBody = {
        id_control,
        id_auditoria,
        order,
        archiveKey
      };
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
      if (!response.ok) {
        console.error('Error al eliminar en la BD');
      }

      // Refrescar datos
      await fetchData();
      onClose();
    } catch (error) {
      console.error('Error eliminando archivo :', error);
    } finally {
      setLoading(false);
    }
  };

  // Descargar un archivo
  const handleDownload = async (archiveKey) => {
    setLoading(true);
    try {
      const command = new GetObjectCommand({
        Bucket: 'wecontrolbucket',
        Key: archiveKey,
      });
      // Generar el signed URL (1 hora)
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      window.open(signedUrl, '_blank'); // Abrir en otra pestaña
    } catch (error) {
      console.error('Error generando link de descarga:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generar Signed URL y guardarlo en pdfSignedUrl para usar un <iframe>
  const generatePdfUrl = async (archiveKey) => {
    setLoading(true);
    try {
      const command = new GetObjectCommand({
        Bucket: 'wecontrolbucket',
        Key: archiveKey,
      });
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      setPdfSignedUrl(signedUrl);
    } catch (error) {
      console.error('Error generando link de descarga:', error);
    } finally {
      setLoading(false);
    }
  };

  // Muestra popup de texto para "No validar"
  const handleshowDescription = () => {
    setShowTextPopup(true);
  };

  // Lógica para "Verificar" o "No validar" (depende de tu API)
  const handleVerify = async () => {
    setLoading(true);
    try {
      const requestBody = {
        id_control,
        id_auditoria,
        state: 1, // 1 => Verificado
        order
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
        await fetchData();
        onClose();
      } else {
        const errorMessage = await response.text();
        console.error('Error en la respuesta del servidor:', errorMessage);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  const handleDeny = async () => {
    setLoading(true);
    try {
      const requestBody = {
        id_control,
        id_auditoria,
        state: 2, // 2 => Denegado
        order,
        message,
        control_name
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
        await fetchData();
        onClose();
      } else {
        const errorMessage = await response.text();
        console.error('Error en la respuesta del servidor:', errorMessage);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      handleClose();
    }
  };
  // 3. Solo 1 archivo
  const singleFile = archives[0];
  const isPdf = singleFile.toLowerCase().endsWith('.pdf');

  // Si es un PDF, generamos la URL y la mostramos en un iframe
  useEffect(() => {
    if (archives.length === 1 && isPdf) {
      generatePdfUrl(singleFile);
    }
    // eslint-disable-next-line
  }, [archives]);

  const hiddenFileInput = useRef(null);

  // 2. Función para abrir el input de archivo
  const handleClickAddFile = () => {
    hiddenFileInput.current.click();

  };

  // 3. Cuando se selecciona un archivo, subimos inmediatamente
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      // Generar la key para S3
      const despachoId = userData.despacho_id;  // Ajusta con tus datos
      const empresaId = userData.belongs_to;    // Ajusta con tus datos
      const userId = userData.id;          // Ajusta con tus datos

      const pathPrefix = `${despachoId}/${empresaId}/${userId}`;
      console.log('pathPrefix: ',pathPrefix)
      const uuid = uuidv4();
      const extension = file.name.substring(file.name.lastIndexOf('.') + 1);
      const baseName = file.name.substring(0, file.name.lastIndexOf('.'));
      const maxLength = 255;
      // Calcular truncado
      const totalFixedLength = pathPrefix.length + 1 + uuid.length + 1 + extension.length + 1;
      const availableLength = maxLength - totalFixedLength;
      const truncatedFileName = baseName.substring(0, availableLength);

      const fileKey = `${pathPrefix}/${uuid}_${truncatedFileName}.${extension}`;
      console.log('Uploading to:', fileKey);

      // Subir a S3
      const putCommand = new PutObjectCommand({
        Bucket: 'wecontrolbucket',
        Key: fileKey,
        Body: file,
        ContentType: file.type,
      });
      await s3Client.send(putCommand);
      console.log('Archivo subido a S3 correctamente');

      // Llamar a tu API para insertar en BD
      const body = {
        id_control,
        id_auditoria,
        archive: fileKey,
        order
      };
      const response = await fetch('https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/UpdateControlAuditoria', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        console.error('Error al insertar en la BD');
      } else {
        console.log('Archivo insertado en BD');
        // Refrescar la lista de archivos
        await fetchData();
        onClose();
      }
    } catch (error) {
      console.error('Error subiendo archivo:', error);
    } finally {
      setLoading(false);
    }
  };


  if (!show) return null;

  // 1. No hay archivos
  if (!archives || archives.length === 0) {
    return (
      <div className="popup-overlay">
        <div className="popup_img">
          <button className="popup-close" onClick={handleClose}>
            X
          </button>
          <p>No hay archivos</p>
        </div>
      </div>
    );
  }

  // 2. Hay múltiples archivos => lista
  if (archives.length > 1) {
    return (
      <div className="popup-overlay !justify-around ">
        <div className="popup_img">
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
          <button className="popup-close" onClick={handleClose}>
              <svg fill="none" viewBox="0 0 15 15" height="2em" width="2em">
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M11.782 4.032a.575.575 0 10-.813-.814L7.5 6.687 4.032 3.218a.575.575 0 00-.814.814L6.687 7.5l-3.469 3.468a.575.575 0 00.814.814L7.5 8.313l3.469 3.469a.575.575 0 00.813-.814L8.313 7.5l3.469-3.468z"
                  clipRule="evenodd"
                />
              </svg>
          </button>
          <h3 className="font-bold mb-6 my-7 text-center">{control_name}</h3>

          <div className='h-[80%] overflow-scroll'>
            <ul>
              {archives.map((archiveKey, index) => (
                <li index={index} className='bg-gray-300 w-[90%] mx-auto h-40 my-4 rounded-xl'>
                  <div className='h-full flex items-center justify-around'>
                    <p
                      className='text-blue-700 underline cursor-pointer'
                      onClick={() => handleDownload(archiveKey)}
                    >{archiveKey.split('_').slice(1).join('_')}</p>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="size-6 text-red-600 cursor-pointer"
                      onClick={()=>{handleDelete(archiveKey)}}
                      >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </div>
                </li>
              ))}
            </ul>
            {role === 'responsable' && (
              <div className="flex flex-col justify-center items-center gap-4">
                <button 
                  className="h-10 w-10 rounded-full bg-gray-400 text-xl font-bold"
                  onClick={handleClickAddFile}
                >
                  +
                </button>
                {/* Input oculto */}
                <input
                  type="file"
                  ref={hiddenFileInput}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  accept="application/pdf"
                />
              </div>
            )}
            
          </div>

          {role === 'admin' && (
            <div className="popup-buttons flex justify-around">
              {state === 'Verificado' ? (
                <>
                  <button className="popup-button mt-3" onClick={() => setShowTextPopup(true)}>
                    No Validar
                  </button>
                </>
              ) : state === 'Denegado' ? (
                <>
                  <button className="popup-button mt-3" onClick={handleVerify}>
                    Verificar
                  </button>
                </>
              ) : (
                <>
                  <button className="popup-button mt-3" onClick={handleVerify}>
                    Verificar
                  </button>
                  <button className="popup-button bg-red-300 mt-3" onClick={handleshowDescription}>
                    No validar
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        {message_admin | message_admin!=='None' && (
          <div className="h-3/4 w-1/4 bg-white rounded-3xl flex flex-col justify-center items-center relative">
            <p
              className="w-[80%] h-[80%] bg-gray-200 rounded-xl p-4 mt-4 mb-4 resize-none"
            >
              {message_admin}
            </p>
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
        )}
        {showTextPopup && (
            <div className="h-3/4 w-1/4 bg-white rounded-3xl flex flex-col justify-center items-center relative">
              <button className="popup-close !translate-x-3 !-translate-y-4" onClick={() => {setShowTextPopup(false)}}>
                <svg fill="none" viewBox="0 0 15 15" height="2em" width="2em">
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M11.782 4.032a.575.575 0 10-.813-.814L7.5 6.687 4.032 3.218a.575.575 0 00-.814.814L6.687 7.5l-3.469 3.468a.575.575 0 00.814.814L7.5 8.313l3.469 3.469a.575.575 0 00.813-.814L8.313 7.5l3.469-3.468z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <textarea
                rows="4"
                className="w-[80%] h-[80%] bg-gray-200 rounded-xl p-4 mt-4 mb-4 resize-none"
                placeholder="Escribe un comentario..."
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
              <button className="popup-button bg-red-300" onClick={handleDeny}>
                No Validar
              </button>
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
          )}
      </div>
    );
  }

  

  return (
    <div className="popup-overlay !justify-around">
      <div className="popup_img">
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
        <button className="popup-close" onClick={handleClose}>
              <svg fill="none" viewBox="0 0 15 15" height="2em" width="2em">
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M11.782 4.032a.575.575 0 10-.813-.814L7.5 6.687 4.032 3.218a.575.575 0 00-.814.814L6.687 7.5l-3.469 3.468a.575.575 0 00.814.814L7.5 8.313l3.469 3.469a.575.575 0 00.813-.814L8.313 7.5l3.469-3.468z"
                  clipRule="evenodd"
                />
              </svg>
          </button>
        <h3 className="font-bold text-center my-7 mb-6">{control_name}</h3>

        {isPdf ? (
          pdfSignedUrl ? (
            <iframe
              src={pdfSignedUrl}
              title="Vista previa del PDF"
              width="80%"
              height="70%"
              className='mx-auto'
              style={{ border: '1px solid #ccc', marginBottom: '1rem' }}
            ></iframe>
          ) : (
            <p>Generando vista previa PDF...</p>
          )
        ) : (
          <div>
            <span 
              className="text-blue-600 underline cursor-pointer"
              onClick={() => handleDownload(singleFile)}
            >
              {singleFile.split('/').pop()}
            </span>
          </div>
        )}
        {role === 'responsable' && (
          <div className="flex flex-col justify-center items-center gap-4">
            <button 
              className="h-10 w-10 rounded-full bg-gray-400 text-xl font-bold"
              onClick={handleClickAddFile}
            >
              +
            </button>
            {/* Input oculto */}
            <input
              type="file"
              ref={hiddenFileInput}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept="application/pdf"
            />

            <button className="popup-button !bg-red-500" onClick={() => handleDelete(singleFile)}>
              Eliminar
            </button>
          </div>
        )}
        {role === 'admin' | role === 'gestor' && (
          <div className="popup-buttons flex justify-around">
            {role === 'admin' | role === 'gestor' && (
              <button className="popup-button text-red-600" onClick={() => handleDelete(singleFile)}>
                Eliminar
              </button>
            )}
            {state === 'Verificado' ? (
              <>
                <button className="popup-button text-red-800" onClick={() => setShowTextPopup(true)}>
                  No Validar
                </button>
              </>
            ) : state === 'Denegado' ? (
              <>
                <button className="popup-button " onClick={handleVerify}>
                  Verificar
                </button>
              </>
            ) : (
              <>
                <button className="popup-button " onClick={handleVerify}>
                  Verificar
                </button>
                <button className="popup-button text-red-800" onClick={handleshowDescription}>
                  No validar
                </button>
              </>
            )}
          </div>
        )}
      </div>
      {message_admin && message_admin !== 'None' && (
          <div className="h-3/4 w-1/4 bg-white rounded-3xl flex flex-col justify-center items-center relative">
            <p
              className="w-[80%] h-[80%] bg-gray-200 rounded-xl p-4 mt-4 mb-4 resize-none"
            >
              {message_admin}
            </p>
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
        )}
        {showTextPopup && (
            <div className="h-3/4 w-1/4 bg-white rounded-3xl flex flex-col justify-center items-center relative">
              <button className="popup-close !translate-x-3 !-translate-y-4" onClick={() => {setShowTextPopup(false)}}>
                <svg fill="none" viewBox="0 0 15 15" height="2em" width="2em">
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M11.782 4.032a.575.575 0 10-.813-.814L7.5 6.687 4.032 3.218a.575.575 0 00-.814.814L6.687 7.5l-3.469 3.468a.575.575 0 00.814.814L7.5 8.313l3.469 3.469a.575.575 0 00.813-.814L8.313 7.5l3.469-3.468z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <textarea
                rows="4"
                className="w-[80%] h-[80%] bg-gray-200 rounded-xl p-4 mt-4 mb-4 resize-none"
                placeholder="Escribe un comentario..."
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
              <button className="popup-button bg-red-300" onClick={handleDeny}>
                No Validar
              </button>
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
          )}
    </div>
  );
};

export default ShowFile;
