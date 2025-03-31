// src/components/MFAModal.jsx
import React, { useState, useEffect } from 'react';
import { setUpTOTP, verifyTOTPSetup, updateMFAPreference } from 'aws-amplify/auth';
import QRCode from "react-qr-code";
import Input from './common/Input';
import { useAuth } from '../context/AuthContext';

const MFAModal = ({ onClose, cognitoId }) => {
  const [setupUri, setSetupUri] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [message, setMessage] = useState('');
  const {setMfaEnable} = useAuth();

  useEffect(() => {
    const configureTOTP = async () => {
      try {
        const totpSetupDetails = await setUpTOTP();
        console.log('totpSetupDetails:', totpSetupDetails);
        const appName = 'WeControlApp'; // Cambia este valor por el nombre de tu aplicación
        const uri = totpSetupDetails.getSetupUri('WeControlApp', cognitoId || 'usuario');
        setSetupUri(uri);
      } catch (error) {
        console.error('Error setting up TOTP:', error);
        setMessage('Error al configurar MFA.');
      }
    };
    configureTOTP();
  }, []);

  const handleVerify = async () => {
    try {
      await verifyTOTPSetup({ code: verificationCode });
      await updateMFAPreference({ totp: 'PREFERRED' });

      // Aquí se llamará a la API para actualizar la BD
      // await fetch('https://TU_URL_DE_API_GATEWAY', { ... });

      setMessage('MFA activado correctamente.');
      setMfaEnable(true);
      onClose();
    } catch (error) {
      console.error('Error verifying TOTP setup:', error);
      setMessage('Error al verificar el código MFA.');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 p-6 z-50" onClick={(e) => e.stopPropagation()}>
      <div className="relative bg-white rounded-xl shadow-lg p-6 w-96" onClick={(e) => e.stopPropagation()}>
        <button 
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="red" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {setupUri ? (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-center text-lg font-semibold">
              Escanea el siguiente QR con tu app autenticadora:
            </p>
            <div className="p-2 border rounded flex align-middle justify-center items-center">
                <QRCode
                size={150}
                value={setupUri.toString()}
                viewBox="0 0 256 256"
                />
            </div>
            <div className="w-full">
              <Input
                label="Código de verificación"
                type="text"
                name="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <button 
              onClick={handleVerify} 
              className="mt-2 w-full bg-primary text-black font-semibold py-2 px-4 rounded-3xl"
            >
              Verificar
            </button>
            {message && <p className="text-center text-sm mt-2 text-green-600">{message}</p>}
          </div>
        ) : (
          <p className="text-center">Cargando...</p>
        )}
      </div>
    </div>
  );
};

export default MFAModal;
