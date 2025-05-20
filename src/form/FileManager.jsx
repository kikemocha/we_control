import React, { useState, useRef, useEffect } from 'react';
import './Popup.css';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, Upload } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import FileUpload from './FileUpload';
import FileShow from './FileShow';

const FileManager = ({ show, onClose, data, fetchData, className='' }) => {
  const { token, userData, s3Client, awsCredentials, expirationTime, refreshAccessToken } = useAuth();
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeSkewError, setTimeSkewError] = useState(null);

  const handleOnClose = ()=>{
    fetchData();
    onClose();
  };
  if (!show) return null;

  if (timeSkewError) {
    return (
      <div className="z-50 fixed top-0 left-0 w-full h-full bg-gray-400 bg-opacity-55 flex justify-center items-center">
        <div className="popup_img p-4 bg-yellow-100 text-yellow-800 rounded text-center">
          {timeSkewError}
          <button onClick={onClose} className="mt-4 popup-button">Cerrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`z-50 fixed top-0 left-0 w-full h-full bg-gray-400 bg-opacity-55 flex justify-center gap-4 items-center ${className}`}>
      <div className="popup_img">
        <button className="popup-close" style={{zIndex: 999}} onClick={handleOnClose}>
          <svg fill="none" viewBox="0 0 15 15" height="2em" width="2em">
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M11.782 4.032a.575.575 0 10-.813-.814L7.5 6.687 4.032 3.218a.575.575 0 00-.814.814L6.687 7.5l-3.469 3.468a.575.575 0 00.814.814L7.5 8.313l3.469 3.469a.575.575 0 00.813-.814L8.313 7.5l3.469-3.468z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <div className="h-full w-full rounded-3xl">
            {userData.is_responsable || userData.id == data.id_user ? (
                <FileUpload
                    data={data}
                    onClose={handleOnClose}
                />
            ): (
                <FileShow
                  data={data}
                  onClose={handleOnClose}
                />
            )
            }
        </div>
        
      </div>
      {data.message_admin  &&  data.message_admin !== 'None' && (
        <div className='w-1/4 h-2/3 bg-white rounded-3xl p-12'>
          <div className=' h-full overflow-y-auto'>
          {data.message_admin}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;
