// RiesgosForm.js
import React, { useState, useEffect } from 'react';
import './Popup.css'; // Asegúrate de tener los estilos
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ControlesForm = ({ show, onClose, fetchData }) => {
  const {selectedEmpresa} = useAuth();
  const [controlName, setControlName] = useState('');
  const [numberName, setNumberName] = useState('');
  const [evidences, setEvidences] = useState('');
  const [periocity, setPeriocity] = useState('Anual');
  const [valueControl, setValueControl] = useState('Transversal');


  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [riesgos, setRiesgos] = useState([]); // Estado para almacenar los riesgos disponibles
  const [selectedRiesgos, setSelectedRiesgos] = useState([]); // Estado para almacenar los riesgos seleccionados


  useEffect(() => {
    const fetchRiesgos = async () => {
      try {
        const response = await axios.get(`https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getRiesgosData?id_empresa=${selectedEmpresa}`, {
          headers: {
            'Authorization': `Bearer `
          }
        });
        console.log(response.data);
        setRiesgos(response.data);
      } catch (error) {
        console.error('Error fetching riesgos:', error);
      }
    };

    fetchRiesgos();
  }, [selectedEmpresa]);


  const formatDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedRiesgos.length === 0) {
      setErrorMessage('Debes seleccionar al menos un riesgo');
      return;
    }

    const requestBody = {
      number_name: numberName,
      name: controlName,
      evidences: evidences,
      periodicity: periocity,
      valueControl: valueControl,
      riesgos: selectedRiesgos, // Incluir los IDs de los riesgos seleccionados
      belongs_to: selectedEmpresa,
 // Formatear la fecha como YYYY-MM-DD
    };

    try {
      const response = await fetch('https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/insertControl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer `, // Incluye el token de autorización si es necesario
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage(result.message);
        setErrorMessage('');
        fetchData(); // Recargar la lista de riesgos
        onClose();
      } else {
        setErrorMessage(result.message);
        setSuccessMessage('');
      }
    } catch (error) {
      setErrorMessage('Error al enviar los datos al servidor');
      setSuccessMessage('');
    }
  };

  const handleRiesgoClick = (riesgoId) => {
    setSelectedRiesgos(prevSelectedRiesgos => 
      prevSelectedRiesgos.includes(riesgoId) 
        ? prevSelectedRiesgos.filter(id => id !== riesgoId) 
        : [...prevSelectedRiesgos, riesgoId]
    );
  };


  if (!show) return null;

  return (
    <div className="popup-overlay">
      <div className="popup form_control">
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
        <form className="form_controles"onSubmit={handleSubmit}>
          <h4>NUEVO CONTROL</h4>
          <label>
            <p>Número de Control</p>
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
            <p>Riesgos Asociados</p>
            <div className='control_riesgos'>
              {riesgos.map(riesgo => (
                <div 
                  key={riesgo[0]} 
                  className={`riesgo-item ${selectedRiesgos.includes(riesgo[0]) ? 'selected' : ''}`} 
                  onClick={() => handleRiesgoClick(riesgo[0])}
                >
                  <strong>{riesgo[1]}</strong>
                  <p>{riesgo[2]}</p>
                </div>
              ))}
            </div>
          </label>
          <br />
          <label>
            <p>Nombre</p>
            <input 
              className='name_control' 
              type="text" 
              name="name" 
              value={controlName}
              onChange={(e) => setControlName(e.target.value)}
              required/>
          </label>
          <br />
          <label>
            <p>Evidencias</p>
            <input 
              className='description_form' 
              type="text" 
              name="evidences" 
              value={evidences}
              onChange={(e) => setEvidences(e.target.value)} 
              required/>
          </label>
          <br />
          <label>
            <p>Periodicidad</p>
            <select 
              name="periocity" 
              value={periocity} // Añadir el valor del estado
              onChange={(e) => setPeriocity(e.target.value)} // Actualizar el estado al cambiar
              required
            >
              <option value="Anual">Anual</option>
              <option value="Trimestral">Trimestral</option>
            </select>
          </label>
          <br />
          <label>
            <p>Valor de Control</p>
            <select 
              name="valueControl" 
              value={valueControl} // Añadir el valor del estado
              onChange={(e) => setValueControl(e.target.value)} // Actualizar el estado al cambiar
              required
            >
              <option value="Transversal">Transversal</option>
              <option value="Especifico">Específico</option>
            </select>
          </label>
          <br />
          <div></div>
          {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
          {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
          <button type="submit">Nuevo Control</button>
        </form>
      </div>
    </div>
  );
};

export default ControlesForm;