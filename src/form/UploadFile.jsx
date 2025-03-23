import React, { useState, useRef } from 'react';
import './Popup.css'; 
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';


const FileUploadPopup = ({ show, onClose, onUpload, selectedControl, selectedAuditoria, fetchData, refreshAccessToken}) => {
  const { token, userData, s3Client} = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadError, setUploadError] = useState('');
  
  const [loading, setLoading] = useState(false)

  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        setSelectedFile(file);
        if (file.type === 'application/pdf') {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(null);
        }
    }
    // Resetea el valor del input de archivo
    event.target.value = null;
};

const sanitizeFileName = (name) => {
  return name
    .normalize('NFD')                      // Normaliza caracteres especiales
    .replace(/[^\w.-]/g, '_')              // Reemplaza caracteres no permitidos por guión bajo
    .replace(/_{2,}/g, '_')                 // Evita guiones bajos consecutivos
    .replace(/^_|_$/g, '');                 // Remueve guiones bajos al inicio y final
};


const handleUpload = async () => {
  setLoading(true);
  if (!selectedFile) {
    setUploadError('Por favor, selecciona un archivo primero.');
    return;
  }

  // Usa el s3Client que ya viene del context
  if (!s3Client) {
    setUploadError('No se encontró el cliente S3. Intenta refrescar la página.');
    setLoading(false);
    return;
  }

  const maxLength = 255; // Máximo total de caracteres permitidos
  const despachoId = userData.despacho_id;
  const empresaId = userData.belongs_to;
  const userId = userData.id;
  const pathPrefix = `${despachoId}/${empresaId}/${userId}`;
  const fileName = selectedFile.name;
  const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);
  const baseFileName = fileName.substring(0, fileName.lastIndexOf('.'));
  const uuid = uuidv4();

  const cleanFileName = sanitizeFileName(baseFileName);

  const totalFixedLength =
    pathPrefix.length + 1 +
    uuid.length + 1 +
    fileExtension.length + 1;

  const availableLengthForFileName = maxLength - totalFixedLength;
  const truncatedFileName = cleanFileName.substring(0, availableLengthForFileName);

  const fileKey = `${pathPrefix}/${uuid}_${truncatedFileName}.${fileExtension}`;
  console.log('fileKey: ', fileKey);

  const params = {
    Bucket: 'wecontrolbucket',
    Key: fileKey,
    Body: selectedFile,
    ContentType: selectedFile.type
  };

  // Función para enviar la imagen
  const sendFile = async (client) => {
    const command = new PutObjectCommand(params);
    return client.send(command);
  };

  try {
    // Intentar enviar con el s3Client actual
    await sendFile(s3Client);
  } catch (error) {
    if (error.message && error.message.includes("ExpiredToken")) {
      console.warn("Token expirado. Refrescando credenciales...");
      // Actualizar token y credenciales
      await refreshAccessToken();
      // Esperar un poco para que el contexto se actualice (opcional, 1 segundo)
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Reintentar con el nuevo s3Client (se supone que el useEffect del context ya lo actualizó)
      if (!s3Client) {
        setUploadError('Error al actualizar el S3Client tras refrescar credenciales.');
        setLoading(false);
        return;
      }
      try {
        await sendFile(s3Client);
      } catch (errorRetry) {
        console.error('Error al subir la imagen después de refrescar el token:', errorRetry);
        setUploadError('Error al subir la imagen tras actualizar el token. Inténtalo de nuevo.');
        setLoading(false);
        return;
      }
    } else {
      console.error('Error al subir la imagen:', error);
      setUploadError('Error al subir la imagen. Inténtalo de nuevo.');
      setLoading(false);
      return;
    }
  }

  // Si llega aquí, la imagen se subió correctamente
  onUpload(selectedFile);

  // Realiza la actualización en tu backend (opcional)
  const requestBody = {
    id_control: selectedControl[0],
    id_auditoria: selectedAuditoria,
    archive: fileKey,
    order: selectedControl[12]
  };

  try {
    const response = await fetch('https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/UpdateControlAuditoria', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (response.ok) {
      fetchData();
      onClose();
    } else {
      console.error('Error en la respuesta del servidor:', result);
    }
  } catch (error) {
    console.log(error);
  } finally {
    handleClose();
    setLoading(false);
  }
};


  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError('');
    onClose();
  };

  const handleLabelClick = () => {
    fileInputRef.current.click(); // Dispara manualmente el input de archivo
  };

  if (!show) return null;

  return (
    <div className="popup-overlay">
      {console.log(selectedControl)}
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
          <h4>Subir Archivo</h4>
          <div className="upload_content_div flex-col">
            {!selectedFile ? (
              <div className="flex items-center justify-center w-full h-full">
                {/* Label para arrastrar y soltar archivo */}
                <div
                  onClick={(e)=>{handleLabelClick(e)}}
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-3/4 h-3/4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  onDragOver={(e) => e.preventDefault()} // Permite arrastrar el archivo sobre el área
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      const file = e.dataTransfer.files[0];
                      if (file.type === 'application/pdf') {
                        setSelectedFile(file);
                        setPreviewUrl(URL.createObjectURL(file));
                      }
                    }
                  }}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6" >
                    <svg
                      className="w-8 h-8 mb-4 text-gray-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click para subir</span> o arrastra un archivo
                    </p>
                    <p className="text-xs text-gray-500">PDFs aceptados (MAX. 800x400px)</p>
                  </div>
                </div>

                {/* Input para seleccionar archivo */}
                <input
                  type="file"
                  ref={fileInputRef} // Asocia el input con la referencia
                  onChange={handleFileChange}
                  accept="application/pdf"
                  style={{ display: 'none' }}
                />
              </div>
            ) : previewUrl ? (
              <div className="pdf-preview">
                <iframe
                  src={previewUrl}
                  title="Vista previa del PDF"
                  width="100%"
                  height="200px"
                ></iframe>
              </div>
            ) : (
              <p>{selectedFile.name}</p>
            )}
            {loading && (
                      <div className="absolute top-0 left-0 w-full h-full rounded-3xl bg-gray-400 bg-opacity-70 flex justify-center items-center z-10">
                        <div role="status">
                          <svg aria-hidden="true" className="inline w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-yellow-400" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                          </svg>
                        </div>
                      </div>
                    )}
            {uploadError && <div style={{ color: 'red' }}>{uploadError}</div>}
          </div>


          <div className="popup-buttons">
            <button className={`popup-button text-black font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`} onClick={handleUpload}>
              {loading ? 'Cargando...' : 'Subir'}
            </button>
            <button className={`popup-button text-black font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`} onClick={handleClose}>
              {loading ? 'Cargando...' : 'Cancelar'}
            </button>
          </div>
        </div>
        
      </div>
      
    </div>
  );
};

export default FileUploadPopup;
