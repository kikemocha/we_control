import React, { useState, useEffect} from 'react';
import { signIn, fetchAuthSession, confirmSignIn } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';
import logo from '../we_control.png' ;
import { signOut } from 'aws-amplify/auth';


import Button from '../components/common/Button';



const LogIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState(''); // Nueva contraseña
  const [confirmNewPassword, setConfirmNewPassword] = useState(''); // Confirmación de la nueva contraseña
  const [error, setError] = useState(null);
  const [isNewPasswordRequired, setIsNewPasswordRequired] = useState(false); // Estado para mostrar el form de nueva contraseña
  const navigate = useNavigate();
  const [token, setJWTToken] = useState(null);
  const { setToken, setAccessToken, setRefreshToken, setCognitoId, fetchUserData, fetchAwsCredentials } = useAuth();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificamos que el token no sea null o undefined
    if (token) {
      const fetchAWS = async () => {
        try {
          await fetchAwsCredentials(token);
        } catch (error) {
          console.error('Error fetching AWS credentials:', error);
        }
      };
      fetchAWS();
    }
  }, [token]);

  const handleSubmit = async (event, providedPassword = null) => {
    if (event) event.preventDefault();
    setLoading(true);
  
    try {
      // Usa la contraseña proporcionada si existe, de lo contrario usa la del estado.
      const passwordToUse = providedPassword || password;
      const { isSignedIn, nextStep } = await signIn({ username: email, password: passwordToUse });
  
      if (isSignedIn) {
        const session = await fetchAuthSession(); // Obtén la sesión actual
        const token = session.tokens.accessToken;
        const cognitoId = token.payload.sub;
  
        const appClientId = '3p4sind7orh97u1urvh9fktpmr'; // ID de tu App Client
        const accessToken = localStorage.getItem(`CognitoIdentityServiceProvider.${appClientId}.${cognitoId}.accessToken`);
        const refreshToken = localStorage.getItem(`CognitoIdentityServiceProvider.${appClientId}.${cognitoId}.refreshToken`);
        const idToken = localStorage.getItem(`CognitoIdentityServiceProvider.${appClientId}.${cognitoId}.idToken`);
  
        setToken(idToken); // Guarda el token en el contexto
        setJWTToken(idToken);
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        setCognitoId(cognitoId);
  
        await fetchUserData(cognitoId, idToken);
  
        // Navega a la página principal
        navigate('/home');
      } else if (nextStep && nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setIsNewPasswordRequired(true); // Muestra el formulario de nueva contraseña
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
                className={`block py-2.5 px-2 w-full text-lg text-black bg-transparent border-0 rounded-full border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-yellow-300 peer`}
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
              {/* Input field */}
              <input
                type="password"
                name="new_password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder=" "
                className={`block py-2.5 px-2 w-full text-lg text-black bg-transparent border-0 rounded-full border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-yellow-300 peer`}
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
              {/* Input field */}
              <input
                type="password"
                name="new_password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                placeholder=" "
                className={`block py-2.5 px-2 w-full text-lg text-black bg-transparent border-0 rounded-full border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-yellow-300 peer`}
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
      ) : (
        <form onSubmit={handleSubmit} className='h-96 w-96'>
            <div className="relative z-0 w-full mb-6 group bg-white rounded-full">
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

            <div className="relative z-0 w-full mb-6 group bg-white rounded-full">
              {/* Input field */}
              <input
                type="password"
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
            className={`text-black w-48 mx-auto my-auto bg-yellow-400 font-bold rounded-full text-xl px-5 py-2.5 text-center ${
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
