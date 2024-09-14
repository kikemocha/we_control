// AuditoriaControlForm.js
import React, { useState, useEffect } from 'react';
import './Popup.css'; // Asegúrate de tener los estilos
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Importa los estilos de DatePicker


const AuditoriaControlesForm = ({ show, onClose, fetchData, selectedAuditoria }) => {
  const { selectedEmpresa } = useAuth();
  const [controlName, setControlName] = useState('');
  const [numberName, setNumberName] = useState('');
  const [evidences, setEvidences] = useState('');
  const [periocity, setPeriocity] = useState('Anual');
  const [valueControl, setValueControl] = useState('Transversal');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [controles, setControles] = useState([]); // Estado para almacenar los controles disponibles
  const [selectedControl, setSelectedControl] = useState(null); // Estado para almacenar el control seleccionado
  const [responsables, setResponsables] = useState([]); // Estado para almacenar los responsables disponibles
  const [selectedResponsable, setSelectedResponsable] = useState(null); // Estado para almacenar el responsable seleccionado

  const [limitDate, setLimitDate] = useState(new Date()); // Estado para la fecha límite seleccionada

  useEffect(() => {
    const fetchControles = async () => {
      try {
        const response = await axios.get(`https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getControlesData?id_empresa=${selectedEmpresa}`, {
          headers: {
            'Authorization': `Bearer `
          }
        });
        console.log(response.data);
        setControles(response.data);
      } catch (error) {
        console.error('Error fetching controles:', error);
      }
    };

    const fetchResponsables = async () => {
      try {
        const response = await axios.get(`https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getResponsablesData?id_empresa=${selectedEmpresa}`, {
          headers: {
            'Authorization': `Bearer `
          }
        });
        console.log(response.data);
        setResponsables(response.data);
      } catch (error) {
        console.error('Error fetching responsables:', error);
      }
    };

    fetchControles();
    fetchResponsables();
  }, [selectedEmpresa]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedControl || !selectedResponsable) {
      setErrorMessage('Debes seleccionar un control y un responsable');
      return;
    }

    const requestBody = {
      id_auditoria: selectedAuditoria,
      id_control: selectedControl,
      id_responsable: selectedResponsable,
      limit_date: limitDate.toISOString().split('T')[0],
    };
    console.log(selectedAuditoria, requestBody);

    try {
      const response = await fetch('https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/insertControlAuditoria', {
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
        fetchData(); // Recargar la lista de controles
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

  const handleControlClick = (controlId) => {
    setSelectedControl(controlId); // Selecciona solo un control
  };

  const handleResponsableClick = (responsableId) => {
    setSelectedResponsable(responsableId); // Selecciona solo un responsable
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
        <form className="form_controles" onSubmit={handleSubmit}>
          <h4>NUEVO CONTROL</h4>
          <label>
            <p>Controles Disponibles</p>
            <div className='control_riesgos'>
              {controles.map(control => (
                <div 
                  key={control[0]} 
                  className={`riesgo-item ${selectedControl === control[0] ? 'selected' : ''}`} 
                  onClick={() => handleControlClick(control[0])}
                >
                  <strong>{control[1]}</strong>
                  <p>{control[2]}</p>
                </div>
              ))}
            </div>
          </label>
          <br />
          <label>
            <p>Responsables Disponibles</p>
            <div className='control_riesgos'>
              {responsables.map(responsable => (
                <div 
                  key={responsable[0]} 
                  className={`riesgo-item ${selectedResponsable === responsable[0] ? 'selected' : ''}`} 
                  onClick={() => handleResponsableClick(responsable[0])}
                >
                  <strong>{responsable[2]}</strong>
                  <p>{responsable[4]}</p>
                </div>
              ))}
            </div>
          </label>
          <br />
          <label>
            <p>Fecha Límite</p>
            <DatePicker
              selected={limitDate}
              onChange={(date) => setLimitDate(date)}
              dateFormat="yyyy-MM-dd"
              className="date-picker"
              required
            />
          </label>
          <br />
          {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
          {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
          <button type="submit">Nuevo Control</button>
        </form>
      </div>
    </div>
  );
};

export default AuditoriaControlesForm;
