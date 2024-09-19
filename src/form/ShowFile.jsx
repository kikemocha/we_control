import React, { useState } from 'react';
import './Popup.css'; 
import { useAuth } from '../context/AuthContext';
import S3Image from '../components/S3Image';


const ShowFile = ({ show, onClose, imgkey, bucketName, id_control, id_auditoria, state, fetchAuditoriaData}) => {
  const [uploadError, setUploadError] = useState('');
  const {role} = useAuth(); // Credenciales AWS desde el contexto


  const handleDelete = () => {
    console.log('Borrando... ');
  };

  const handleClose = () => {
    setUploadError('');
    onClose();
  };

  const handleVerify = async () => {
    
    const requestBody = {
      id_control: id_control,
      id_auditoria: id_auditoria,
      state: 1
    };

    try {
      const response = await fetch('https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/UpdateControlAuditoriaState', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer your-auth-token', // Incluye el token de autorización si es necesario
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (response.ok) {
        await fetchAuditoriaData();
        onClose();

      }
    } catch (error) {
      console.log(error);
    }

    handleClose();
  };

  const handleDeny = async () => {
    
    const requestBody = {
      id_control: id_control,
      id_auditoria: id_auditoria,
      state: 2
    };
    try {
      const response = await fetch('https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/UpdateControlAuditoriaState', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer your-auth-token', // Incluye el token de autorización si es necesario
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (response.ok) {
        await fetchAuditoriaData();
        onClose();

      }
    } catch (error) {
      console.log(error);
    }

    handleClose();
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

        {/* Aquí pasas bucketName e imgkey a S3Image */}
        <div className="img_s3"> 
          <S3Image bucketName={bucketName} imgkey={imgkey} /> 
        </div>
        {role === 'admin' ? (
          <div className="popup-buttons">
            { state === 'Verificado' ? (
              <div style={{ width : '100%', display:'flex', justifyContent:'space-around'}}>
                <button className="popup-button" onClick={handleDelete}>Eliminar</button>
                <button className="popup-button" style={{backgroundColor:'rgba(255,0,0,0.5)'}} onClick={handleDeny}>Denegar</button>
              </div>
            ) : state === 'Denegado' ?(
              <div style={{ width : '100%', display:'flex', justifyContent:'space-around'}}>
                <button className="popup-button" onClick={handleDelete}>Eliminar</button>
                <button className="popup-button" style={{backgroundColor:'rgba(0,145,2,0.29)'}} onClick={handleVerify}>Verificar</button>
              </div>
            ) : (
              <div style={{ width : '100%', display:'flex', justifyContent:'space-around'}}>
                <button className="popup-button" onClick={handleDelete}>Eliminar</button>
                <button className="popup-button" style={{backgroundColor:'rgba(0,145,2,0.29)'}} onClick={handleVerify}>Verificar</button>
                <button className="popup-button" style={{backgroundColor:'rgba(255,0,0,0.5)'}} onClick={handleDeny}>Denegar</button>
              </div>
            )}
          </div>
          ) : (
            <div className="popup-buttons">
              <button className="popup-button" onClick={handleDelete}>Eliminar</button>
              <button className="popup-button" onClick={handleClose}>Cancelar</button>
            </div>
          )}
      </div>
    </div>
  );
};

export default ShowFile;
