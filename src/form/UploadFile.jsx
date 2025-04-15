import React, { useState, useRef, useEffect } from 'react';
import './Popup.css';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

const FileUploadPopup = ({ show, onClose, selectedControl, selectedAuditoria, fetchData }) => {
  const { token, userData, s3Client, awsCredentials, expirationTime, refreshAccessToken } = useAuth();
  const [archives, setArchives] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
      const checkAndRefreshToken = async () => {
        if (expirationTime) {
          const now = new Date();
          const expTime = new Date(expirationTime);
          console.log(`Verificando token: ahora = ${now.getTime()}, expiración = ${expTime.getTime()}`);
          if (now > expTime) {
            console.log("El token ha expirado, renovando token...");
            setLoading(true);
            await refreshAccessToken();
            setLoading(false);
          }
        }
      };
      checkAndRefreshToken();
    }, [expirationTime, refreshAccessToken]);

  // Handler: agregar archivo vía input o drag/drop
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setArchives((prev) => [...prev, file]);
    // If it's a PDF, set preview URL; otherwise, do nothing
    if (file.type === 'application/pdf') {
      setPreviewUrl(URL.createObjectURL(file));
    }
    e.target.value = null;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setArchives((prev) => [...prev, file]);
      if (file.type === 'application/pdf') {
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleClickAddFile = () => {
    fileInputRef.current.click();
  };

  const handleDeleteFile = (index) => {
    setArchives(prev => prev.filter((_, i) => i !== index));
    if (archives.length === 1) setPreviewUrl(null);
  };

  const sanitizeFileName = (name) => {
    return name
      .normalize('NFD')
      .replace(/[^\w.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
  };

  const getFileKey = (file) => {
    const despachoId = userData.despacho_id;
    const empresaId = userData.belongs_to;
    const userId = userData.id;
    const pathPrefix = `${despachoId}/${empresaId}/${userId}`;
    const originalName = file.name;
    const fileExtension = originalName.substring(originalName.lastIndexOf('.') + 1);
    const baseFileName = originalName.substring(0, originalName.lastIndexOf('.'));
    const uniqueId = uuidv4();
    const cleanFileName = sanitizeFileName(baseFileName);
    const maxLength = 255;
    const totalFixedLength = pathPrefix.length + 1 + uniqueId.length + 1 + fileExtension.length + 1;
    const availableLength = maxLength - totalFixedLength;
    const truncatedFileName = cleanFileName.substring(0, availableLength);
    const fileKey = `${pathPrefix}/${uniqueId}_${truncatedFileName}.${fileExtension}`;
    console.log('fileKey:', fileKey);
    return fileKey;
  };

  const uploadFile = async (file) => {

    if (!awsCredentials?.AccessKeyId) {
      console.warn("No hay credenciales de AWS disponibles, actualizando...");
      await refreshAccessToken();
      if (!awsCredentials?.AccessKeyId) {
        throw new Error("No se pudieron obtener credenciales válidas.");
      }
    }
    
    const fileKey = getFileKey(file);
    const params = {
      Bucket: 'wecontrolbucket',
      Key: fileKey,
      Body: file,
      ContentType: file.type,
    };

    const sendFile = async (client) => {
      const command = new PutObjectCommand(params);
      return client.send(command);
    };

    try {
      await sendFile(s3Client);
    } catch (error) {
      if (error.message && error.message.includes("ExpiredToken")) {
        console.warn("Token expirado. Refrescando credenciales...");
        await refreshAccessToken();
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          await sendFile(s3Client);
        } catch (retryError) {
          throw new Error("Error después de refrescar el token");
        }
      } else {
        throw error;
      }
    }

    const requestBody = {
      id_control: selectedControl[0],
      id_auditoria: selectedAuditoria,
      archive: fileKey,
      order: selectedControl[11]
    };

    const response = await fetch(
      'https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/UpdateControlAuditoria',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || "Error en la API");
    }
  };

  const handleUpload = async () => {
    if (archives.length === 0) {
      setUploadError('Por favor, selecciona un archivo primero.');
      return;
    }
    setLoading(true);
    setUploadError('');
    try {
      for (const file of archives) {
        await uploadFile(file);
      }
      await fetchData();
      onClose();
    } catch (error) {
      console.error(error);
      setUploadError('Error al subir archivos. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setArchives([]);
    setPreviewUrl(null);
    setUploadError('');
    onClose();
  };

  if (!show) return null;

  return (
    <div className="popup-overlay">
      <div className="popup_img">
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

        <div className="upload-content">
          <h4 className=''>Subir Archivo</h4>
          {archives.length === 0 ? (
            // Sin archivos: mostrar área de drag & drop
            <div
              className="flex items-center justify-center w-full h-3/4"
              onClick={handleClickAddFile}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              style={{
                border: '2px dashed gray',
                borderRadius: '8px',
                padding: '1rem',
                backgroundColor: '#f9f9f9',
                cursor: 'pointer'
              }}
            >
              <div className="flex flex-col items-center justify-center ">
                <svg className="w-8 h-8 mb-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click para subir</span> o arrastra un archivo
                </p>
                <p className="text-xs text-gray-500">PDFs aceptados</p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          ) : archives.length === 1 && previewUrl ? (
            // Un solo archivo: mostrar preview con botón para agregar más
            <div className="pdf-preview flex flex-col">
              <iframe
                src={previewUrl}
                title="Vista previa del PDF"
                width="100%"
                height="200px"
                style={{ border: '1px solid #ccc' }}
              ></iframe>
              <div className="flex flex-col justify-center items-center gap-4 mt-2">
                <button className="h-10 w-10 rounded-full bg-gray-400 text-xl font-bold" onClick={handleClickAddFile}>
                  +
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          ) : (
            // Múltiples archivos: mostrar lista con opción para eliminar y botón para agregar
            <div className='h-[80%] overflow-scroll w-full'>
              <ul>
                {archives.map((file, index) => (
                  <li key={index} className='bg-gray-300 w-[90%] mx-auto h-40 my-4 rounded-xl'>
                    <div className='h-full flex items-center justify-around'>
                      <p
                        className='text-blue-700 underline cursor-pointer'
                        onClick={() => window.open(URL.createObjectURL(file), '_blank')}
                      >
                        {file.name}
                      </p>
                      <button onClick={() => handleDeleteFile(index)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-red-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex justify-center mt-2">
                <button className="h-10 w-10 rounded-full bg-gray-400 text-xl font-bold" onClick={handleClickAddFile}>
                  +
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          )}
          {loading && (
            <div className="absolute top-0 left-0 w-full h-full rounded-3xl bg-gray-400 bg-opacity-70 flex justify-center items-center z-10">
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="inline w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-yellow-400"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
              </div>
            </div>
          )}
          {uploadError && <div style={{ color: 'red' }}>{uploadError}</div>}
        </div>
        <div className="popup-buttons">
          <button
            className={`popup-button text-black font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleUpload}
          >
            {loading ? 'Cargando...' : 'Subir'}
          </button>
          <button
            className={`popup-button text-black font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleClose}
          >
            {loading ? 'Cargando...' : 'Cancelar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadPopup;
