// GestoresForm.js
import React, { useState } from 'react';
import './Popup.css'; // Asegúrate de tener los estilos
import { useAuth } from '../context/AuthContext';

const AuditoriaForm = ({ show, onClose, fetchData }) => {
  const {selectedEmpresa} = useAuth();
  const [name, setName] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestBody = {
      name: name,
      belongs_to: selectedEmpresa,
    };

    try {
      const response = await fetch('https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/insertAuditoria', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer your-auth-token', // Incluye el token de autorización si es necesario
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (response.ok) {
        onClose();
        setSuccessMessage(result.message);
        setErrorMessage('');
      } else {
        setErrorMessage(result.message);
        setSuccessMessage('');
      }
    } catch (error) {
      setErrorMessage('Error al enviar los datos al servidor');
      setSuccessMessage('');
    }
  };
  if (!show) return null;

  return (
    <div className="popup-overlay">
      <div className="popup">
        <button className="popup-close" onClick={onClose}>
          <svg fill="none" viewBox="0 0 15 15" height="1em" width="1em">
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M11.782 4.032a.575.575 0 10-.813-.814L7.5 6.687 4.032 3.218a.575.575 0 00-.814.814L6.687 7.5l-3.469 3.468a.575.575 0 00.814.814L7.5 8.313l3.469 3.469a.575.575 0 00.813-.814L8.313 7.5l3.469-3.468z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <form onSubmit={handleSubmit}>
          <h4>NUEVA AUDITORÍA</h4>
          <label>
            <p>Nombre</p>
            <input 
              className='number_form_name' 
              type="text" 
              name="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required/>
          </label>  
          <div></div>
          {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
          {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
          <button type="submit">Nueva auditoría</button>
        </form>
      </div>
    </div>
  );
};

export default AuditoriaForm;