import React, { useState } from 'react';
import { signIn, fetchAuthSession, confirmSignIn } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Login.css';
import logo from '../we_control.png' ;


const LogIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState(''); // Nueva contraseña
  const [confirmNewPassword, setConfirmNewPassword] = useState(''); // Confirmación de la nueva contraseña
  const [error, setError] = useState(null);
  const [isNewPasswordRequired, setIsNewPasswordRequired] = useState(false); // Estado para mostrar el form de nueva contraseña
  const navigate = useNavigate();
  const { setToken, setCognitoId, fetchUserData } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const { isSignedIn, nextStep } = await signIn({username: email, password });

      if (isSignedIn) {
        const session = await fetchAuthSession(); // Obtén la sesión actual
        const token = session.tokens.accessToken;
        const idToken = localStorage.getItem(`CognitoIdentityServiceProvider.${token.payload.client_id}.${token.payload.sub}.idToken`);
        setToken(idToken); // Guarda el token en el contexto
        
        const id_cognito = token.payload.sub;
        setCognitoId(id_cognito);

        await fetchUserData(id_cognito, token.jwtToken);

        // Navega a la página principal
        navigate('/home');
      } else if (nextStep && nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setIsNewPasswordRequired(true); // Muestra el form de nueva contraseña
      } else {
        setError(`Debe completar el siguiente paso: ${nextStep.signInStep}`);
      }
    } catch (authError) {
      setError(authError.message || "Error al iniciar sesión.");
      console.error('Error signing in', authError);
    }
  };

  const handleNewPasswordSubmit = async (event) => {
    event.preventDefault();

    // Validar que la nueva contraseña y la confirmación coincidan
    if (newPassword !== confirmNewPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      // Completa el cambio de contraseña en Cognito
      const user = await signIn({ username: email, password });
      const result = await confirmSignIn({ 
        challengeResponse: newPassword,
        userAttributes: {} // Aquí puedes pasar cualquier atributo del usuario si es necesario
      });

      if (result.isSignedIn) {
        const session = await fetchAuthSession(); // Obtén la sesión actual
        const idToken = session.tokens.idToken;
        setToken(idToken); // Guarda el token en el contexto
        const id_cognito = idToken.payload.sub;
        setCognitoId(id_cognito);
        // Navega a la página principal
        navigate('/home');
      }
    } catch (error) {
      setError(error.message || "Error al cambiar la contraseña.");
      console.error('Error al cambiar la contraseña', error);
    }
  };

  return (
    <div className='login-container'>
      <div className='form_login'>
        <img src={logo} alt="" />
      {isNewPasswordRequired ? (
        <form onSubmit={handleNewPasswordSubmit}>
          <label>
            <p>Contraseña Actual</p>
            <input
              className='text-black'
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <label>
            <p>Nueva Contraseña</p>
            <input
              className='text-black'
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </label>
          <label>
            <p>Confirmar Nueva Contraseña</p>
            <input
              className='text-black'
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" className='change_passw_button text-black'>Cambiar <br /> Contraseña</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            <input
              className='text-black'
              placeholder='E-mail'
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            <input
              className='text-black'
              placeholder='Contraseña'
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" className='text-black'>Login</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
      )}
      </div>
    </div>
  );
};

export default LogIn;
