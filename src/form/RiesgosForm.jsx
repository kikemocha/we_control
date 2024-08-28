// RiesgosForm.js
import React, { useState } from 'react';
import './Popup.css'; // Asegúrate de tener los estilos
import { useAuth } from '../context/AuthContext';

const RiesgosForm = ({ show, onClose, fetchData }) => {
  const {selectedEmpresa} = useAuth();
  const [numberName, setNumberName] = useState('');
  const [description, setDescription] = useState('');
  const [riesgoValue, setRiesgoValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const formatDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestBody = {
      number_name: numberName,
      description: description,
      value: riesgoValue,
      belongs_to: selectedEmpresa,
      create_date: formatDate(), // Formatear la fecha como ISO
    };

    try {
      const response = await fetch('https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/insertRiesgo', {
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
        fetchData();
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
          <h4>NUEVO RIESGO</h4>
          <label>
            <p>Número de Riesgo</p>
            <input 
              className='number_form_name' 
              type="text" 
              name="number_name" 
              value={numberName}
              onChange={(e) => setNumberName(e.target.value)}
              required/>
          </label>
          <br />
          <label>
            <p>Descripción</p>
            <input 
              className='description_form' 
              type="text" 
              name="description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)} 
              required/>
          </label>
          <br />
          <label>
            <p>Valor de  <br />Riesgo inherente</p>
            <input 
              className='calor_inherente' 
              type="number" 
              name="riesgo_value" 
              step=".01" 
              value={riesgoValue}
              onChange={(e) => setRiesgoValue(e.target.value)}
              required/>
          </label>
          <br />
          <div></div>
          {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
          {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
          <button type="submit">Nuevo Riesgo</button>
        </form>
      </div>
    </div>
  );
};

export default RiesgosForm;