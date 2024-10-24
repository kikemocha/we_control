// GestoresForm.js
import React, { useState } from 'react';
import './Popup.css'; // Asegúrate de tener los estilos
import { useAuth, token } from '../context/AuthContext';

import Button from '../components/common/Button';
import Input from '../components/common/Input';

const GestoresForm = ({ show, onClose, fetchData, actualGestores}) => {
  const {selectedEmpresa, token} = useAuth();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [titulo, setTitulo] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleEmailChange = (e) => {
    const newValue = e.target.value;
    setEmail(newValue);
    checkEmail(newValue);
  };

  const checkEmail = (newEmail) => {
    // Obtenemos todos los primeros elementos de actualRiesgos
    const primerosElementos = actualGestores.map(subarray => subarray[4]);
    // Comprobamos si el valor existe en el array
    if (primerosElementos.includes(newEmail)) {
        setErrorMessage('Este email ya existe');
    } else {
        setErrorMessage(''); // Limpiar el mensaje de error si no existe
    }
  };


  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    const requestBody = {
      name: name,
      surname: surname,
      phone: phone,
      email: email,
      role: titulo,
      belongs_to: selectedEmpresa,
      is_responsable: false,
      is_gestor: true
    };

    try {
      
      const response = await fetch('https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/insertUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Incluye el token de autorización si es necesario
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (response.ok) {
        fetchData();
        setSuccessMessage(result.message);
        setErrorMessage('');
        onClose();
        
      } else {
        setErrorMessage(result.message);
        setSuccessMessage('');
      }
    } catch (error) {
      setErrorMessage('Error al enviar los datos al servidor');
      setSuccessMessage('');
    } finally{
      setLoading(false);
    };
  };
  if (!show) return null;

  return (
    <div className="popup-overlay">
      <div className="popup relative">
        {/* Botón para cerrar */}
        <button className="popup-close" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Contenido del formulario */}
        <form className="max-w-md mx-auto" onSubmit={handleSubmit}>
          <h4 className="text-lg font-semibold mb-5">NUEVO GESTOR</h4>

          <div className="grid md:grid-cols-2 md:gap-6">
            <Input
              label="Nombre"
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            />
            <Input
              label="Apellido"
              type="text"
              name="surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              required
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            />
          </div>
          
          <Input
            label="Email"
            placeholder="example@wecontrool.com"
            type="text"
            name="email"
            value={email}
            onChange={handleEmailChange}
            required
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 peer"
          />

          <div className="grid md:grid-cols-2 md:gap-6">
            <Input
              label="Cargo"
              placeholder="CTO, RRHH"
              type="text"
              name="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 peer"
            />
            <Input
              label="Teléfono"
              type="text"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 peer"
            />
          </div>
          {/* Botón de enviar */}
          <Button
              type="submit"
              className={`text-black font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loading || Boolean(errorMessage)} // Deshabilita si loading es true o si errorMessage tiene un valor
          >
              {loading ? 'Cargando...' : 'Nuevo Gestor'}
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
          <div className="absolute top-0 left-0 w-full h-full bg-gray-400 bg-opacity-70 flex justify-center items-center z-10 rounded-3xl">
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

export default GestoresForm;
