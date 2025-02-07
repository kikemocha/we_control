// AuditoriaControlForm.js
import React, { useState, useEffect } from 'react';
import './Popup.css'; // Asegúrate de tener los estilos
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Importa los estilos de DatePicker

import Button from '../components/common/Button';

const AuditoriaControlesForm = ({ show, onClose, fetchData, selectedAuditoria }) => {
  const { selectedEmpresa, token } = useAuth();
  const [periocity, setPeriocity] = useState('Anual');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [loading, setLoading] = useState(false);

  const [controles, setControles] = useState([]); // Estado para almacenar los controles disponibles
  const [selectedControl, setSelectedControl] = useState(null); // Estado para almacenar el control seleccionado
  const [selectedControlName, setSelectedControlName] = useState(null);

  const [searchTermControles, setSearchTermControles] = useState('');

  const filteredControles = controles.filter((riesgo) =>
    riesgo[2].toLowerCase().includes(searchTermControles.toLowerCase())
  );


  const handleSearchControlChange = (e) => {
    setSearchTermControles(e.target.value);
  };

  const [limitDate, setLimitDate] = useState(new Date()); // Estado para la fecha límite seleccionada
  const [limitDate2, setLimitDate2] = useState(new Date());
  const [limitDate3, setLimitDate3] = useState(new Date());
  const [limitDate4, setLimitDate4] = useState(new Date());
  
  useEffect(() => {
    const today = new Date();
    switch (periocity) {
      case 'Anual':
        setLimitDate(new Date(today.getFullYear(), 11, 31));
        break;
      case 'Semestral':
        setLimitDate(new Date(today.getFullYear(), 5, 30));
        setLimitDate2(new Date(today.getFullYear(), 11, 31));
        break;
      case 'Cuatrimestral':
        setLimitDate(new Date(today.getFullYear(), 3, 30));
        setLimitDate2(new Date(today.getFullYear(), 7, 31));
        setLimitDate3(new Date(today.getFullYear(), 11, 31));
        break;
      case 'Trimestral':
        setLimitDate(new Date(today.getFullYear(), 2, 31));
        setLimitDate2(new Date(today.getFullYear(), 5, 30));
        setLimitDate3(new Date(today.getFullYear(), 8, 30));
        setLimitDate4(new Date(today.getFullYear(), 11, 31));
        break;
      default:
        setLimitDate(today);
    }
  }, [periocity]);

  const fetchControles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getControlesData?id_empresa=${selectedEmpresa}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setControles(response.data.activo);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching controles:', error);
    }
  };


  useEffect(() => {
    fetchControles();
  }, [selectedEmpresa]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    

    if (!selectedControl ) {
      setErrorMessage('Debes seleccionar un control y un responsable');
      setLoading(false);
      return;
    }
    const limitDatesArray = [];
    limitDatesArray.push(limitDate.toISOString().split('T')[0]);

    if (periocity === 'Semestral' || periocity === 'Cuatrimestral' || periocity === 'Trimestral') {
      limitDatesArray.push(limitDate2.toISOString().split('T')[0]);
    }
    if (periocity === 'Cuatrimestral' || periocity === 'Trimestral') {
      limitDatesArray.push(limitDate3.toISOString().split('T')[0]);
    }
    if (periocity === 'Trimestral') {
      limitDatesArray.push(limitDate4.toISOString().split('T')[0]);
    }

    const requestBody = {
      id_auditoria: selectedAuditoria,
      id_control: selectedControl,  // Aquí puedes enviar más ids si los seleccionas
      limit_dates: limitDatesArray
    };

    try {
      console.log('requestBody: ',requestBody);
      const response = await fetch('https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/insertControlAuditoria', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Incluye el token de autorización si es necesario
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
    } finally {
      setLoading(false);
    }
  };

  const handleControlClick = (controlId, Periocity, controlName) => {
    setPeriocity(Periocity);
    setSelectedControl(controlId); // Selecciona solo un control
    setSelectedControlName(controlName);
    if (selectedControl) {
      setErrorMessage('');
    }
  };


  if (!show) return null;

  return (
    <div className="popup-overlay">
      <div className="popup form_control" style={{height:'90%'}}>
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
        <form className="w-full mx-auto" onSubmit={handleSubmit}>
          <h4 className="h4_control_form text-lg font-semibold mb-5">NUEVO CONTROL</h4>
          <div className='div_pather w-full grid grid-cols-2'>
          <label className='riesgos_div'>
            <p>Controles Disponibles</p>
              <div className="[width:82%] mb-4 mx-auto">
                <input
                  type="text"
                  placeholder="Buscar controles..."
                  value={searchTermControles}
                  onChange={handleSearchControlChange}
                  className="block w-full py-2 px-4 border border-gray-500 rounded-xl "
                />
              </div>
            <div className='control_riesgos w-full'>
              {filteredControles.map(control => (
                <div 
                  key={control[0]} 
                  className={`riesgo-item ${selectedControl === control[0] ? 'selected' : ''}`} 
                  onClick={() => handleControlClick(control[0], control[4], control[1])}
                >
                  <strong>{control[1]}</strong>
                  <p>{control[2]}</p>
                </div>
              ))}
            </div>
          </label>
          <div className='flex flex-col align-middle items-center'>
            <p className='mb-6'>Fecha Límite - ({periocity})</p>
            {periocity === 'Anual' ? (
              <div>
                <div>
                  <DatePicker
                  selected={limitDate}
                  onChange={(date) => setLimitDate(date)}
                  dateFormat="yyyy-MM-dd"
                  className="date-picker bg-gray-300 p-2 rounded-lg text-center cursor-pointer"
                  required
                />
                </div>
              </div>
              ) : periocity === 'Semestral' ? 
              (
                <div>
                  <div className='flex flex-col gap-4'>
                    <div className='flex items-center justify-between w-full'>
                      <p className='font-bold mr-5'>{selectedControlName} - S1</p>
                      <DatePicker
                        selected={limitDate}
                        onChange={(date) => setLimitDate(date)}
                        dateFormat="yyyy-MM-dd"
                        className="date-picker bg-gray-300 p-2 rounded-lg text-center cursor-pointer"
                        required
                      />
                    </div>
                    <div className='flex items-center justify-between w-full'>
                        <p className='font-bold mr-5'>{selectedControlName} - S2</p>
                        <DatePicker
                          selected={limitDate2}
                          onChange={(date) => setLimitDate2(date)}
                          dateFormat="yyyy-MM-dd"
                          className="date-picker bg-gray-300 p-2 rounded-lg text-center cursor-pointer"
                          required
                        />
                    </div>
                  </div>
                </div>

              ) : periocity === 'Cuatrimestral' ? 
              (
                <div>
                  <div className='flex flex-col gap-4'>
                    <div className='flex items-center justify-between w-full'>
                      <p className='font-bold mr-5'>{selectedControlName} - 1_Cuatr</p>
                        <DatePicker
                          selected={limitDate}
                          onChange={(date) => setLimitDate(date)}
                          dateFormat="yyyy-MM-dd"
                          className="date-picker bg-gray-300 p-2 rounded-lg text-center cursor-pointer"
                          required
                        />
                    </div>
                    <div className='flex items-center justify-between w-full'>
                      <p className='font-bold mr-5'>{selectedControlName} - 2_Cuatr</p>
                        <DatePicker
                          selected={limitDate2}
                          onChange={(date) => setLimitDate2(date)}
                          dateFormat="yyyy-MM-dd"
                          className="date-picker bg-gray-300 p-2 rounded-lg text-center cursor-pointer"
                          required
                        />
                    </div>
                    <div className='flex items-center justify-between w-full'>
                      <p className='font-bold mr-5'>{selectedControlName} - 3_Cuatr</p>
                        <DatePicker
                          selected={limitDate3}
                          onChange={(date) => setLimitDate3(date)}
                          dateFormat="yyyy-MM-dd"
                          className="date-picker bg-gray-300 p-2 rounded-lg text-center cursor-pointer"
                          required
                        />
                    </div>
                  </div>
                </div>
              ) : periocity === 'Trimestral' &&
              (
                <div>
                  <div className='flex flex-col gap-4'>
                    <div className='flex items-center justify-between w-full'>
                      <p className='font-bold mr-5'>{selectedControlName} - T1</p>
                      <DatePicker
                        selected={limitDate}
                        onChange={(date) => setLimitDate(date)}
                        dateFormat="yyyy-MM-dd"
                        className="date-picker bg-gray-300 p-2 rounded-lg text-center cursor-pointer"
                        required
                      />
                    </div>
                    <div className='flex items-center justify-between w-full'>
                      <p className='font-bold mr-5'>{selectedControlName} - T2</p>
                        <DatePicker
                          selected={limitDate2}
                          onChange={(date) => setLimitDate2(date)}
                          dateFormat="yyyy-MM-dd"
                          className="date-picker bg-gray-300 p-2 rounded-lg text-center cursor-pointer"
                          required
                        />
                    </div>
                    <div className='flex items-center justify-between w-full'>
                      <p className='font-bold mr-5'>{selectedControlName} - T3</p>
                        <DatePicker
                          selected={limitDate3}
                          onChange={(date) => setLimitDate3(date)}
                          dateFormat="yyyy-MM-dd"
                          className="date-picker bg-gray-300 p-2 rounded-lg text-center cursor-pointer"
                          required
                        />
                    </div>
                    <div className='flex items-center justify-between w-full'>
                    <p className='font-bold mr-5'>{selectedControlName} - T4</p>
                        <DatePicker
                          selected={limitDate4}
                          onChange={(date) => setLimitDate4(date)}
                          dateFormat="yyyy-MM-dd"
                          className="date-picker bg-gray-300 p-2 rounded-lg text-center cursor-pointer"
                          required
                        />
                    </div>
                  </div>
                </div>
              )
            }
            
          </div>
          </div>
          {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
          {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
          <Button
            type="submit"
            className={`button_control_submit text-black font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading || !!errorMessage}
          >
            {loading ? 'Cargando...' : 'Nuevo Control'}
          </Button>
        </form>

        {loading && (
          <div className="absolute top-0 left-0 w-full h-full bg-gray-400 bg-opacity-70 flex justify-center items-center z-10 rounded-3xl ">
            <div role="status">
              <svg aria-hidden="true" className="inline w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-yellow-400" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditoriaControlesForm;
