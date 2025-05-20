import React, { useState, useEffect} from 'react';
import { signIn, fetchAuthSession, confirmSignIn, signOut } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';
import logo from '../we_control.png' ;
import Button from '../components/common/Button';

const LogIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState(''); // Nueva contraseña
  const [confirmNewPassword, setConfirmNewPassword] = useState(''); // Confirmación de la nueva contraseña
  const [mfaCode, setMfaCode] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);

  const [error, setError] = useState(null);
  const [isNewPasswordRequired, setIsNewPasswordRequired] = useState(false); // Estado para mostrar el form de nueva contraseña
  const navigate = useNavigate();
  const { setToken, setAccessToken, refreshAccessToken, setCognitoId, fetchUserData, setMfaEnable} = useAuth();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword ] = useState(false);
  const [showNewPassword, setShowNewPassword ] = useState(false);
  const [showNewConfirmPassword, setShowNewConfirmPassword ] = useState(false);
  
  useEffect(() => {
    // Comprueba si alguno de los tokens o el role está presente en sessionStorage
    const isAuthenticated = sessionStorage.getItem('token')|| sessionStorage.getItem('accessToken')  || sessionStorage.getItem('refreshToken') ;
    const userRole = sessionStorage.getItem('role') !== 'null';

    if (isAuthenticated && userRole) {
      // Redirige a /home si la sesión está activa
      navigate('/home');
    }
  }, [navigate]);


  const handleSubmit = async (event, providedPassword = null) => {
    if (event) event.preventDefault();
    setLoading(true);
  
    try {
      // Usa la contraseña proporcionada si existe, de lo contrario usa la del estado.
      const passwordToUse = providedPassword || password;
      const { isSignedIn, nextStep } = await signIn({ username: email, password: passwordToUse });
  
      if (isSignedIn) {
        const session = await fetchAuthSession();
        const cognitoId = session.userSub;
        const accessToken = session.tokens.accessToken.toString();
        const idToken = session.tokens.idToken.toString();
  
        sessionStorage.setItem('accessToken', accessToken);
        sessionStorage.setItem('idToken', idToken);
        
        setToken(idToken);
        setAccessToken(accessToken);
        setCognitoId(cognitoId);

        await fetchUserData(cognitoId, idToken);
        await refreshAccessToken();
        navigate('/home');

      } else if (nextStep && (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_TOTP_CODE' ||
          nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_SMS_CODE')) {

          setMfaRequired(true);
        }else if (nextStep && nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
          setIsNewPasswordRequired(true); 
        } else {
          setError(`Debe completar el siguiente paso: ${nextStep.signInStep}`);
        }
    } catch (authError) {
      setError(authError.message || "Error al iniciar sesión.");
      console.error('Error signing in', authError);
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await confirmSignIn({ challengeResponse: mfaCode });
      if (result.isSignedIn) {
        const session = await fetchAuthSession();
        const cognitoId = session.userSub;
        const exp = session.tokens.idToken.payload.exp;

        const accessToken = session.tokens.accessToken.toString();
        const idToken = session.tokens.idToken.toString();
  
        sessionStorage.setItem('accessToken', accessToken);
        sessionStorage.setItem('idToken', idToken);
        
        setToken(idToken);
        setAccessToken(accessToken);
        setCognitoId(cognitoId);
        //setExpirationTime(new Date(exp * 1000));
        await fetchUserData(cognitoId, idToken);

        setMfaEnable(true);
        
        navigate('/home');
      } else {
        setError("MFA verification failed.");
      }
    } catch (error) {
      setError(error.message || "Error verifying MFA code.");
      console.error("Error verifying MFA code:", error);
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleNewPasswordSubmit = async (event) => {
    setLoading(true);
    event.preventDefault();
    
    // Validar que la nueva contraseña y la confirmación coincidan
    if (newPassword !== confirmNewPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false); // Detener el loading si las contraseñas no coinciden
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
        console.log('Contraseña cambiada con éxito, cerrando sesión para iniciar sesión con la nueva contraseña...');
        
        // Cierra la sesión actual antes de volver a iniciar sesión
        await signOut();
  
        // Llama a handleSubmit con la nueva contraseña para iniciar sesión nuevamente
        await handleSubmit(null, newPassword);
      } else {
        setError("No se pudo cambiar la contraseña.");
      }
    } catch (error) {
      setError(error.message || "Error al cambiar la contraseña.");
      console.error('Error al cambiar la contraseña', error);
    } finally {
      setLoading(false);
    }
  };
    
  

  return (
    <div className='login-container'>
      <div className='form_login'>
        <img src={logo} alt="" className={loading ? 'spin-slow' : ''}/>
      {isNewPasswordRequired ? (
        <form onSubmit={handleNewPasswordSubmit} className='h-96 w-96'>
            <div className="relative z-0 w-full mb-6 group bg-white rounded-full">
              {/* Input field */}
              <input
                type="text"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder=" "
                className={`block py-2.5 px-4 w-full text-lg text-black bg-transparent border-0 rounded-full border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-yellow-300 peer`}
              />
              {/* Label that "floats" */}
              <div className=" flex px-4 peer-focus:font-medium absolute text-lg text-gray-600 duration-300 transform -translate-y-9 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-9 peer-valid:text-white">
                <label
                  htmlFor={"password"}
                  >
                  Contraseña Actual
                </label>
                <p className='text-gray-500 ml-5'></p>
              </div>
            </div>
            <div className="relative z-0 w-full mb-6 group bg-white rounded-full">
              {newPassword && (
                showNewPassword ? (
                  <svg 
                    onClick={() => {setShowNewPassword(false)}} 
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 cursor-pointer z-99 absolute right-4 top-1/4 text-black">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg
                    onClick={() => {setShowNewPassword(true)}} 
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 cursor-pointer z-99 absolute right-4 top-1/4 text-black">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                  )     
              )}
              {/* Input field */}
              <input
                type={showNewPassword  ? 'text' : 'password'}
                name="new_password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder=" "
                className={`block py-2.5 px-4 w-full text-lg text-black bg-transparent border-0 rounded-full border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-yellow-300 peer`}
              />
              {/* Label that "floats" */}
              <div className=" flex px-4 peer-focus:font-medium absolute text-lg text-gray-600 duration-300 transform -translate-y-9 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-9 peer-valid:text-white">
                <label
                  htmlFor={"new_password"}
                  >
                  Nueva Contraseña
                </label>
                <p className='text-gray-500 ml-5'></p>
              </div>
              
            </div>
            <div className="relative z-0 w-full mb-6 group bg-white rounded-full">
              {confirmNewPassword && (
                showNewConfirmPassword ? (
                  <svg 
                    onClick={() => {setShowNewConfirmPassword(false)}} 
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 cursor-pointer z-99 absolute right-4 top-1/4 text-black">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg
                    onClick={() => {setShowNewConfirmPassword(true)}} 
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 cursor-pointer z-99 absolute right-4 top-1/4 text-black">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                  )     
              )}
              {/* Input field */}
              <input
                type={showNewConfirmPassword  ? 'text' : 'password'}
                name="new_password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                placeholder=" "
                className={`block py-2.5 px-4 w-full text-lg text-black bg-transparent border-0 rounded-full border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-yellow-300 peer`}
              />
              {/* Label that "floats" */}
              <div className=" flex px-4 peer-focus:font-medium absolute text-lg text-gray-600 duration-300 transform -translate-y-9 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-9 peer-valid:text-white">
                <label
                  htmlFor={"new_password"}
                  >
                  Confirmar Nueva Contraseña
                </label>
                <p className='text-gray-500 ml-5'></p>
              </div>
              
            </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <Button
            type="submit"
            className={`text-black w-72 h-16 mx-auto my-auto bg-yellow-400 font-bold rounded-full text-xl px-5 py-2.5 text-center ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Cambiar Contraseña'}
          </Button>
        </form>
      ) : mfaRequired ? (
        <form onSubmit={handleMfaSubmit} className="h-96 w-96">
          <div className="relative z-0 w-full mb-6 group bg-white rounded-full">
              {/* Input field */}
              <input
                label="Código MFA"
                type="text"
                name="mfaCode"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                required
                placeholder=" "
                className={`block py-2.5 px-4 w-full h-14 text-md text-black bg-transparent border-0 rounded-full border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-yellow-300 peer`}
              />
              {/* Label that "floats" */}
              <div className=" flex px-4 peer-focus:font-medium absolute text-lg text-gray-600 duration-300 transform -translate-y-9 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-9 peer-valid:text-white">
                <label
                  htmlFor={"email"}
                  >
                  Código Multifactor
                </label>
                <p className='text-gray-500 ml-5'></p>
              </div>
            </div>
          <Button
            type="submit"
            className={`text-black w-48 mx-auto my-auto bg-yellow-400 font-bold rounded-full text-xl px-5 py-2.5 text-center ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Enviar'}
          </Button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
      ) :  (
        <form onSubmit={handleSubmit} className='h-96 w-full flex items-center sm:w-96'>
            <div className="relative z-0 w-3/4 sm:w-full mb-6 group bg-white rounded-full">
              {/* Input field */}
              <input
                type="text"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder=" "
                className={`block py-2.5 px-4 w-full h-14 text-md text-black bg-transparent border-0 rounded-full border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-yellow-300 peer`}
              />
              {/* Label that "floats" */}
              <div className=" flex px-4 peer-focus:font-medium absolute text-lg text-gray-600 duration-300 transform -translate-y-9 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-9 peer-valid:text-white">
                <label
                  htmlFor={"email"}
                  >
                  e-mail
                </label>
                <p className='text-gray-500 ml-5'></p>
              </div>
              
            </div>

            <div className="relative z-0 w-3/4 sm:w-full mb-6 group bg-white rounded-full">
              {password && (
                showPassword ? (
                  <svg 
                    onClick={() => {setShowPassword(false)}} 
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 cursor-pointer z-99 absolute right-4 top-1/4 text-black">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg
                    onClick={() => {setShowPassword(true)}} 
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 cursor-pointer z-99 absolute right-4 top-1/4 text-black">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                  )     
              )}
              <input
                type={showPassword  ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder=" "
                className={`block py-2.5 px-4 w-full h-14 text-md text-black bg-transparent border-0 rounded-full border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-yellow-300 peer`}
              />

              {/* Label that "floats" */}
              <div className=" flex px-4 peer-focus:font-medium absolute text-lg text-gray-600 duration-300 transform -translate-y-9 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-9 peer-valid:text-white">
                <label
                  htmlFor={"password"}
                  >
                  Contraseña
                </label>
                <p className='text-gray-500 ml-5'></p>
              </div>
              
            </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <Button
            type="submit"
            className={`text-black w-48 mx-auto my-auto bg-primary font-bold rounded-full text-xl px-5 py-2.5 text-center ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'LogIn'}
          </Button>
        </form>
      )}
      </div>
    </div>
  );
};

export default LogIn;
