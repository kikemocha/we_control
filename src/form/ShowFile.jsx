import React, { useState } from 'react';
import './Popup.css'; 
import { useAuth } from '../context/AuthContext';
import S3Image from '../components/S3Image';


const ShowFile = ({ show, onClose, imgkey, bucketName}) => {
  const [uploadError, setUploadError] = useState('');
  const { awsCredentials } = useAuth(); // Credenciales AWS desde el contexto


  const handleDelete = () => {
    console.log('Borrando... ');
  };
  const handleClose = () => {
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

        {/* Aquí pasas bucketName e imgkey a S3Image */}
        <div className="img_s3"> 
          <S3Image bucketName={bucketName} imgkey={imgkey} /> 
        </div>
        
        <div className="popup-buttons">
          <button className="popup-button" onClick={handleDelete}>Eliminar</button>
          <button className="popup-button" onClick={handleClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default ShowFile;
