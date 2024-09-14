import React, { useState } from 'react';
import './Popup.css'; 
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

const FileUploadPopup = ({ show, onClose, onUpload, selectedControl, userData, selectedAuditoria}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const { awsCredentials } = useAuth(); // Credenciales AWS desde el contexto

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);

      // Previsualizar el archivo si es un PDF
      if (file.type === 'application/pdf') {
        const fileUrl = URL.createObjectURL(file);
        setPreviewUrl(fileUrl);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Por favor, selecciona un archivo primero.');
      return;
    }
    // Configurar S3Client con las credenciales temporales
    const s3Client = new S3Client({
      region: 'eu-west-1',
      credentials: {
        accessKeyId: awsCredentials.AccessKeyId,
        secretAccessKey: awsCredentials.SecretAccessKey,
        sessionToken: awsCredentials.SessionToken,
      }
    });

    const bucketName = 'empresa-' + userData[1]; // Tu bucket
    const maxLength = 255; // Máximo total de caracteres permitidos para el 'fileKey'
    const fileName = selectedFile.name;
    const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1); // Obtener la extensión del archivo
    const baseFileName = fileName.substring(0, fileName.lastIndexOf('.')); // Obtener el nombre sin la extensión
    const userPrefix = userData[0].split('@')[0];  // Prefijo del usuario
    const uuid = uuidv4();  // Generar un UUID único
    
    const totalFixedLength = `${userPrefix}/${uuid}_`.length + fileExtension.length + 1;  // +1 para el punto antes de la extensión
    const availableLengthForFileName = maxLength - totalFixedLength;
    const truncatedFileName = baseFileName.substring(0, availableLengthForFileName); // Truncar el nombre sin la extensión
    const fileKey = `${userPrefix}/${uuid}_${truncatedFileName}`;
    
    const params = {
      Bucket: bucketName,
      Key: fileKey, // Ruta del archivo en S3
      Body: selectedFile,
      ContentType: selectedFile.type
    };

    try {
      const command = new PutObjectCommand(params);
      const data = await s3Client.send(command);
      console.log('Archivo subido correctamente:', data);
      onUpload(selectedFile); // Llamada a onUpload después de la carga

      const requestBody = {
        id_control: selectedControl[0],
        id_auditoria: selectedAuditoria,
        archive: fileKey
      };
      try {
        const response = await fetch('https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/UpdateControlAuditoria', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer your-auth-token', // Incluye el token de autorización si es necesario
          },
          body: JSON.stringify(requestBody),
        });

        const result = await response.json();

        if (response.ok) {
          onClose();

        }
      } catch (error) {
        console.log(error);
      }
  
      handleClose(); // Cerrar el popup después de la subida


    } catch (error) {
      console.error('Error al subir el archivo:', error);
      setUploadError('Error al subir el archivo. Inténtalo de nuevo.');
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
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
          <h4>Subir Archivo</h4>
          <div className='upload_content_div'>
            {!selectedFile ? ( 
              <input type="file" onChange={handleFileChange} />
            ) : (
              previewUrl ? (
                <div className="pdf-preview">
                  <iframe src={previewUrl} title="Vista previa del PDF" width="100%" height="200px"></iframe>
                </div>
              ) : (
                <p>{selectedFile.name}</p>
              )
            )}

            {uploadError && <div style={{ color: 'red' }}>{uploadError}</div>}
          </div>

          <div className="popup-buttons">
            <button className="popup-button" onClick={handleUpload}>Subir</button>
            <button className="popup-button" onClick={handleClose}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadPopup;
