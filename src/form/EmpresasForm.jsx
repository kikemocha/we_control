// RiesgosForm.js
import React, { useState, useEffect } from 'react';
import './Popup.css'; // Asegúrate de tener los estilos
import { useAuth } from '../context/AuthContext';

import Button from '../components/common/Button';
import Input from '../components/common/Input';



const EmpresasForm = ({ show, onClose, fetchData }) => {
  const {cognitoId, token} = useAuth();
  const [EmpresaName, setEmpresaName] = useState('');
  const [EmpresaEmail, setEmpresaEmail] = useState('');
  const [EmpresaPhone, setEmpresaPhone] = useState('');
  const [EmpresaWeb, setEmpresaWeb] = useState('');

  const [EmpresaValorEspecifico, setEmpresaValorEspecifico] = useState('');
  const [EmpresaValorTransversal, setEmpresaValorTransversal] = useState('');

  const [loading, setLoading] = useState(false);


  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();


    const requestBody = {
      name: EmpresaName,
      cognito_id: cognitoId,
      email: EmpresaEmail,
      phone: EmpresaPhone,
      web: EmpresaWeb,
      valor_especifico: EmpresaValorEspecifico,
      valor_transversal: EmpresaValorTransversal,
    };

    try {
      const response = await fetch('https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/insertEmpresa', {
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
        fetchData(); // Recargar la lista de empresas
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
      onClose();
    }
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
        <form className="form_controles px-40"onSubmit={handleSubmit}>
          <h4>NUEVA EMPRESA</h4>
          <Input
              label="Nombre Empresa"
              type="text"
              name="name"
              value={EmpresaName}
              onChange={(e) => setEmpresaName(e.target.value)}
              required
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            />
          <div className='w-full'>
            <h4 className='mb-2 font-bold'>Contacto</h4>
            <Input
              label="e-mail"
              type="text"
              name="email"
              value={EmpresaEmail}
              onChange={(e) => setEmpresaEmail(e.target.value)}
              required
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            />
            <Input
              label="Web"
              type="text"
              name="web"
              value={EmpresaWeb}
              onChange={(e) => setEmpresaWeb(e.target.value)}
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            />
            <Input
              label="Teléfono"
              type="text"
              name="phone"
              value={EmpresaPhone}
              onChange={(e) => setEmpresaPhone(e.target.value)}
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            />
          </div>
          <h4 className='mb-2 font-bold'>Valor Controles</h4>
          <div className="grid md:grid-cols-2 md:gap-6">
            <Input
                label="Valor específico"
                type="number"
                name="valor_especifico"
                value={EmpresaValorEspecifico}
                onChange={(e) => setEmpresaValorEspecifico(e.target.value)}
                step=".01"
                required
                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              />
            <Input
              label="Valor transversal"
              type="number"
              name="valor_transversal"
              value={EmpresaValorTransversal}
              onChange={(e) => setEmpresaValorTransversal(e.target.value)}
              step=".01"
              required
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            />
          </div>
          <br />
          <div></div>
          {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
          {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
          <button type="submit">{loading ? 'Cargando...' : 'Nueva Empresa'}</button>
        </form>
        {loading && (
          <div className="rounded-3xl absolute top-0 left-0 w-full h-full bg-gray-400 bg-opacity-70 flex justify-center items-center z-10">
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

export default EmpresasForm;