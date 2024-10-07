import React, { useState } from 'react';
import './Popup.css'; 
import { useAuth } from '../context/AuthContext';
import S3Image from '../components/S3Image';


const ShowFile = ({ show, onClose, imgkey, bucketName, id_control, id_auditoria, state, fetchData, control_name}) => {
  const [uploadError, setUploadError] = useState('');
  const {role, token} = useAuth(); // Credenciales AWS desde el contexto
  const [message, setMessage] = useState('');

  const [showTextPopup, setShowTextPopup] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    console.log('Borrando... ');
  };

  const handleClose = () => {
    setShowTextPopup(false);
    setUploadError('');
    onClose();
  };

  const handleVerify = async () => {
    setLoading(true);
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
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (response.ok) {
        await fetchData();
        onClose();

      } else {
        // Si no es ok, intenta obtener el mensaje de error desde la respuesta
        const errorMessage = await response.text();
        console.error('Error en la respuesta del servidor:', errorMessage);
      }
    } catch (error) {
      console.log(error);
    } finally{
      setLoading(false);
      handleClose();
    }
  };
  const handleshowDescription = () => {
    setShowTextPopup(true);
  } 

  const handleDeny = async () => {

    setLoading(true);
    const requestBody = {
      id_control: id_control,
      id_auditoria: id_auditoria,
      state: 2 ,
      message : message,
      control_name : control_name,
    };
    try {
      console.log('REQUEST BODY: ', requestBody);
      const response = await fetch('https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/UpdateControlAuditoriaState', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        await fetchData();
        onClose();
      } else {
        // Si no es ok, intenta obtener el mensaje de error desde la respuesta
        const errorMessage = await response.text();
        console.error('Error en la respuesta del servidor:', errorMessage);
      }
    } catch (error) {
      console.log(error);
    } finally{
      setLoading(false);
      handleClose();
    }
    
    
  };

  if (!show) return null;

  return (
    <div className="popup-overlay">
      
      <div className="popup_img">
      {loading && (
          <div className="absolute rounded-3xl top-0 left-0 w-full h-full bg-gray-400 bg-opacity-70 flex justify-center items-center z-10">
            <div role="status">
              <svg aria-hidden="true" class="inline w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-yellow-400" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
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

        {/* Aquí pasas bucketName e imgkey a S3Image */}
        <div className="img_s3"> 
        <h3 className='w-full text-center font-bold mb-3'>{control_name}</h3>
          <S3Image bucketName={bucketName} imgkey={imgkey} /> 
        </div>
        {role === 'admin' ? (
          <div className="popup-buttons">
            { state === 'Verificado' ? (
              <div style={{ width : '100%', display:'flex', justifyContent:'space-around'}}>
                <button className="popup-button" onClick={handleDelete}>{loading ? 'Cargando...' : 'Eliminar'}</button>
                <button className={showTextPopup ? 'hidden' : 'popup-button p-1'} style={{backgroundColor:'rgba(255,0,0,0.5)'}} onClick={handleshowDescription}>{loading ? 'Cargando...' : 'No validar'}</button>
              </div>
            ) : state === 'Denegado' ?(
              <div style={{ width : '100%', display:'flex', justifyContent:'space-around'}}>
                <button className="popup-button" onClick={handleDelete}>{loading ? 'Cargando...' : 'Eliminar'}</button>
                <button className="popup-button" style={{backgroundColor:'rgba(0,145,2,0.29)'}} onClick={handleVerify}>{loading ? 'Cargando...' : 'Verificar'}</button>
              </div>
            ) : (
              <div style={{ width : '100%', display:'flex', justifyContent:'space-around'}}>
                <button className="popup-button" onClick={handleDelete}>{loading ? 'Cargando...' : 'Eliminar'}</button>
                <button className="popup-button" style={{backgroundColor:'rgba(0,145,2,0.29)'}} onClick={handleVerify}>{loading ? 'Cargando...' : 'Verificar'}</button>
                <button className={showTextPopup ? 'hidden' : 'popup-button'} style={{backgroundColor:'rgba(255,0,0,0.5)'}} onClick={handleshowDescription}>{loading ? 'Cargando...' : 'No validar'}</button>
              </div>
            )}
          </div>
          ) : (
            <div className="popup-buttons">
              <button className="popup-button" onClick={handleDelete}>{loading ? 'Cargando...' : 'Eliminar'}</button>
              <button className="popup-button" onClick={handleClose}>{loading ? 'Cargando...' : 'Cancelar'}</button>
            </div>
          )}
      </div>
      {showTextPopup ? (
        <div 
          className='ml-6 px-3 pt-12 transition-opacity duration-300 ease-in-out opacity-100' 
          style={{
            height: '90%', 
            width: '30%', 
            backgroundColor: 'white', 
            borderRadius: '30px', 
            position: 'relative'
            }}
          >
          <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-900">Tú comentario</label>
          <textarea 
            id="message" 
            rows="4" 
            className="block p-2.5 w-full h-3/4 text-sm text-gray-900 bg-gray-50 rounded-2xl border border-gray-300 resize-none" 
            placeholder="Escribe un comentario..."
            onChange={(e) => {setMessage(e.target.value)} }
          ></textarea>
          <div className="h-32 flex justify-center items-end">
            <button 
              className="popup-button m-auto" 
              style={{backgroundColor: 'rgba(255,0,0,0.5)'}} 
              onClick={handleDeny}
            >
              {loading ? 'Cargando...' : 'No validar'}
            </button>
          </div>
        </div>) : (
                <div className='transition-opacity duration-300 ease-in-out opacity-0'></div>
              )}
    </div>
  );
};

export default ShowFile;
