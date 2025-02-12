// RiesgosForm.js
import React, { useState, useEffect } from 'react';
import './Popup.css'; // Asegúrate de tener los estilos
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

import Button from '../components/common/Button';
import Input from '../components/common/Input';
import SelectInput from '../components/common/SelectInput';

const ControlesForm = ({ show, onClose, fetchData, actualControles, selectedYear }) => {
  const {selectedEmpresa, token} = useAuth();
  const [controlName, setControlName] = useState('');
  const [numberName, setNumberName] = useState('');
  const [evidences, setEvidences] = useState('');
  const [periocity, setPeriocity] = useState('Anual');
  const [valueControl, setValueControl] = useState('Específico');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [loading, setLoading] = useState(false);

  const [riesgos, setRiesgos] = useState([]); // Estado para almacenar los riesgos disponibles
  const [selectedRiesgos, setSelectedRiesgos] = useState([]); // Estado para almacenar los riesgos seleccionados

  const [responsables, setResponsables] = useState([]); // Estado para almacenar los responsables disponibles
  const [selectedResponsable, setSelectedResponsable] = useState([]); // Estado para almacenar el responsable seleccionado
  const [searchTermResponsables, setSearchTermResponsables] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (show) {
      if (actualControles.length > 0) {
        const maxNumber = Math.max(...actualControles.map(control => parseInt(control[1].replace('C', ''), 10) || 0));
        setNumberName((maxNumber + 1).toString());
      } else {
        setNumberName('1');
      }
    }
  }, [show, actualControles]);
  
  const filteredRiesgos = riesgos.filter((riesgo) =>
    riesgo[2].toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredResponsables = responsables.filter((responsable) =>
    responsable.name.toLowerCase().includes(searchTermResponsables.toLowerCase()) |
    responsable.email.toLowerCase().includes(searchTermResponsables.toLowerCase()) 
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  const handleSearchResponsablesChange = (e) => {
    setSearchTermResponsables(e.target.value);
  };

  const handleNumberNameChange = (e) => {
    const newValue = e.target.value;
    setNumberName(newValue);
    checkControlName(newValue);
  };

  useEffect(() => {
    if (show && valueControl === 'Transversal' && riesgos.length > 0) {
      setSelectedRiesgos(riesgos.map(riesgo => riesgo[0]));
    }
  }, [show, valueControl, riesgos]);

  useEffect(() => {
    if (selectedRiesgos.length > 0) {
      setErrorMessage('');
    }
  }, [selectedRiesgos]);

  useEffect(() => {
    if (valueControl === 'Transversal') {
      // Selecciona todos los riesgos si es Transversal
      setSelectedRiesgos(riesgos.map(riesgo => riesgo[0]));
    } else if (valueControl === 'Específico') {
      // Deselecciona todos los riesgos si es Específico
      setSelectedRiesgos([]);
    }
  }, [valueControl, riesgos]);

  const checkControlName = (newNumberName) => {
    // Obtenemos todos los primeros elementos de actualRiesgos
    const primerosElementos = actualControles.map(subarray => subarray[1]);

    // Comprobamos si el valor existe en el array
    if (primerosElementos.includes('C' + newNumberName)) {
        setErrorMessage('Este Control ya existe');
    } else {
        setErrorMessage(''); // Limpiar el mensaje de error si no existe
    }
  };

  const resetValues = () =>{
    setControlName('');
    setEvidences('');
    setPeriocity('Anual');
    setValueControl('Específico');
    setSelectedRiesgos([]);
    setSelectedResponsable([]);
    setSearchTerm('');
    setSearchTermResponsables('');
  }
  const handleClose = () =>{
    resetValues();
    onClose();
  }
  const fetchResponsables = async () => {
    setLoading(true);
    try {
        const response = await axios.get(
            `https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getResponsablesData?id_empresa=${selectedEmpresa}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        // Verifica que la API devuelve un array antes de setearlo en el estado
        if (Array.isArray(response.data)) {
            setResponsables(response.data);
        } else {
            console.warn("API no devolvió un array de responsables:", response.data);
            setResponsables([]); // Evita que el estado tenga un valor incorrecto
        }
    } catch (error) {
        console.error('Error fetching responsables:', error);
        setResponsables([]); // Evita que sea null si hay error
    } finally {
        setLoading(false);
    }
};


  const fetchRiesgos = async () => {
    try {
      const response = await axios.get(`https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getRiesgosData?id_empresa=${selectedEmpresa}&id_year=${selectedYear}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setRiesgos(response.data.activo);
    } catch (error) {
      console.error('Error fetching riesgos:', error);
    }
  };
  useEffect(() => {
    fetchResponsables();
    fetchRiesgos();
  }, [selectedEmpresa]);


  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    if (selectedRiesgos.length === 0) {
      setErrorMessage('Debes seleccionar al menos un riesgo');
      setLoading(false);
      return;
    }

    const requestBody = {
      number_name: 'C'+numberName,
      name: controlName,
      evidences: evidences,
      periodicity: periocity,
      valueControl: valueControl,
      riesgos: selectedRiesgos, // Incluir los IDs de los riesgos seleccionados
      belongs_to: selectedEmpresa,
      id_responsable: selectedResponsable
    };

    try {
      const response = await fetch('https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/insertControl', {
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
        handleClose();
      } else {
        setErrorMessage(result.message);
        setSuccessMessage('');
      }
    } catch (error) {
      setErrorMessage('Error al enviar los datos al servidor');
      setSuccessMessage('');
    } finally{
      resetValues();
      setLoading(false);
    }
  };

  const handleRiesgoClick = (riesgoId) => {
    setSelectedRiesgos(prevSelectedRiesgos => 
      prevSelectedRiesgos.includes(riesgoId) 
        ? prevSelectedRiesgos.filter(id => id !== riesgoId) 
        : [...prevSelectedRiesgos, riesgoId]
    );
  };

  const handleResponsableClick = (responsableId) => {
    setSelectedResponsable(responsableId); // Selecciona solo un responsable
    if (selectedResponsable & filteredRiesgos) {
      setErrorMessage('');
    }
  };


  const periocity_options = [
    { value: 'Anual', label: 'Anual' },
    { value: 'Semestral', label: 'Semestral' },
    { value: 'Cuatrimestral', label: 'Cuatrimestral' },
    { value: 'Trimestral', label: 'Trimestral' },
  ];

  const value_control_options = [
    { value: 'Transversal', label: 'Transversal' },
    { value: 'Específico', label: 'Específico' },
  ];

  if (!show) return null;

  return (
    <div className="popup-overlay">
      <div className="popup form_control" style={{ width: '100%', maxWidth: '1500px' }}>
        <button className="popup-close" onClick={handleClose}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <form className="w-full mx-auto " onSubmit={handleSubmit}>
            <h4 className="text-lg font-semibold mb-5">NUEVO CONTROL</h4>
            <div className='grid grid-cols-3 h-full w-full '>
              <div className="w-full p-4 px-8 flex flex-col justify-around">
                <Input
                  label="Número de control"
                  type="number"
                  name="number_name"
                  value={numberName}
                  onChange={handleNumberNameChange}
                  required
                  className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 peer"
                />
                <Input
                  label="Nombre"
                  type="text"
                  name="name"
                  value={controlName}
                  onChange={(e) => setControlName(e.target.value)}
                  required
                  className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 peer"
                />
                <Input
                  label="Evidencias"
                  type="text"
                  name="evidences"
                  value={evidences}
                  onChange={(e) => setEvidences(e.target.value)}
                  required
                  className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                />
                <div className="grid md:grid-cols-2 md:gap-6">
                  <SelectInput
                    label="Periodicidad"
                    type="text"
                    name="periocity"
                    value={periocity}
                    onChange={(e) => setPeriocity(e.target.value)}
                    required
                    className="block py-2.5 px-0 w-full text-md text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 peer"
                    options={periocity_options}
                  />
                  <SelectInput
                    label="Valor de Control"
                    type="text"
                    name="valueControl"
                    value={valueControl}
                    onChange={(e) => setValueControl(e.target.value)}
                    required
                    className="block py-2.5 px-0 w-full text-md text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 peer"
                    options={value_control_options}
                  />
                </div>
              </div>
            <label className='riesgos_div'>
              <div className='m-auto w-full'>
                <p>Riesgos Asociados</p>
                <div className="[width:82%] mb-4 mx-auto">
                  <input
                    type="text"
                    placeholder="Buscar riesgos..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="block w-full py-2 px-4 border border-gray-500 rounded-xl "
                  />
                </div>
                <div className='control_riesgos'>
                  {filteredRiesgos.map(riesgo => (
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
              </div>
            </label>
            <label className='riesgos_div'>
              <div className='m-auto w-full'>
                <p>Responsables</p>
                <div className="[width:82%] mb-4 mx-auto">
                  <input
                    type="text"
                    placeholder="Buscar responsables..."
                    value={searchTermResponsables}
                    onChange={handleSearchResponsablesChange}
                    className="block w-full py-2 px-4 border border-gray-500 rounded-xl "
                  />
                </div>
                <div className='control_riesgos'>
                    {filteredResponsables.map(responsable => (
                    <div 
                      key={responsable.id_user} 
                      className={`riesgo-item ${selectedResponsable === responsable.id_user ? 'selected' : ''}`} 
                      onClick={() => handleResponsableClick(responsable.id_user)}
                    >
                      <strong>{responsable.name}</strong>
                      <p>{responsable.email}</p>
                    </div>
                  ))}
                </div>
              </div>
            </label>
          </div>
          
          <Button
              type="submit"
              className={`text-black font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loading || Boolean(errorMessage)} // Deshabilita si loading es true o si errorMessage tiene un valor
          >
              {loading ? 'Cargando...' : 'Nuevo Control'}
          </Button>
        </form>
        {
          errorMessage ? (
            <p className='h-7 text-center' style={{ color: 'red' }}>{errorMessage}</p>
            ): (
              <p className='h-7'></p>
            )}
          {
          successMessage ? 
          (
          <p className='h7' style={{ color: 'green' }}>{successMessage}</p>

          ):(
            <p className='h7'></p>
          )
        }
        {loading && (
          <div className="absolute rounded-3xl top-0 left-0 w-full h-full bg-gray-400 bg-opacity-70 flex justify-center items-center z-10">
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

export default ControlesForm;