// src/components/Navbar.js
import React, {useState, useRef, useEffect } from 'react';
import './Layout.css';
import { useAuth } from '../context/AuthContext';
import Input from './common/Input';
import Button from './common/Button';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import PhotoPopup from './CroppingImg';

const Navbar = () => {
    const {role, userData, token, fetchUserData, cognitoId, selectedEmpresa, selectedEmpresaName, searchQuery, setSearchQuery} = useAuth();
    const location = useLocation();

    const [loading, setLoading] = useState(false)
    const [messageError, setMessageError] = useState('');
    const [messageSucess, setSuccesMessage] = useState('');
    const [message, messagePopUp] = useState('');

    const [idPerson, setIdPerson] = useState(userData.id ? userData.id : '');
    const [firstName, setFirstName] = useState(userData.name ? userData.name : '');
    const [lastName, setLastName] = useState(userData.surname ? userData.surname : '');
    const [cargoPerson, setCargoPerson] = useState(userData.role ? userData.role : '');
    const [emailPerson, setEmail] = useState(userData.email ? userData.email : '');
    const [phonePerson, setPhonePerson] = useState(userData.phone ? userData.phone : '');


    const [profilePopUp, setProfilePopUp] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [categorySelected, setcategorySelected ] = useState('Todas las Categorías')

    const [showChangePassword, setShowChangePassword] = useState(false);
    const [actualPassword, setActualPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [reNewPassword, setReNewPassword] = useState('');
    const [showActualPassword, setShowActualPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [isHovered, setIsHovered] = useState(false);
    const [showPhotoPopUp, setShowPhotoPopUp] = useState(false);


    useEffect(() => {
        let newCategory = 'Todas las Categorías';
    
        if (location.pathname.includes('riesgos')) {
            newCategory = 'Riesgos';
        } else if (location.pathname.includes('controles')) {
            newCategory = 'Controles';
        } else if (location.pathname.includes('gestores')) {
            newCategory = 'Gestores';
        } else if (location.pathname.includes('responsables')) {
            newCategory = 'Responsables';
        } else if (
            location.pathname.includes('auditorias') ||
            location.pathname.includes('seguimientos')
        ) {
            newCategory = 'Auditorías y Seguimientos';
        } else {
            newCategory = 'Todas las Categorías';
        }
        setSearchQuery('');
        // Si la categoría es "Todas las Categorías", manejar dependiendo de la empresa seleccionada
        if (newCategory === 'Todas las Categorías') {
            if (!selectedEmpresa) {
                newCategory = 'Empresas'; // No hay empresa seleccionada
            } else {
                newCategory = 'Home'; // Hay empresa seleccionada
            }
        }
    
        setcategorySelected(newCategory);
    }, [location.pathname, role, selectedEmpresa]);
    
    

    useEffect(() => {
        // Si userData es null, intenta obtener los datos del usuario
        if (!userData) {
            console.log('UserData is null, fetching user data...');
            fetchUserData(cognitoId, token);
        }
    }, [userData, fetchUserData, cognitoId, token]);

    const onClose = () =>{
        setLoading(false);
        setProfilePopUp(false);
        onClosePasswd();
    }
    const onClosePasswd = () => {
        setMessageError('');
        setShowChangePassword(false);
        setActualPassword('');
        setNewPassword('');
        setReNewPassword('');
        setShowActualPassword(false);
        setShowNewPassword(false);
        setSuccesMessage('');
    }

    const handleEdit = async (e) => {
        setLoading(true);
        e.preventDefault();
    
        const requestBody = {
          firstName: firstName,
          lastName: lastName,
          cargoPerson: cargoPerson,
          id_person: idPerson,
          phone: phonePerson
        };
    
        try {
          const response = await fetch('https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/updateUser', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
          });
    
          if (response.ok) {
            onClose();
            setLoading(false);
            messagePopUp('Gestor editado correctamente', 'success');
            userData.name = firstName;
            userData.surname = lastName;
            userData.phone = phonePerson;
          } else{
            messagePopUp('Error editando el riesgo', 'error')
          }
        } catch (error) {
          console.log(error);
        } finally{
          setLoading(false);

          onClosePasswd();
        }
    }
    const updateProfileImage = async (newImg) => {
        setLoading(true);
        const requestBody = {
          firstName,
          lastName,
          cargoPerson,
          id_person: idPerson,
          phone: phonePerson,
          profileImg: newImg, // Se asume que el backend espera "profileImg"
        };
    
        try {
          const response = await fetch(
            "https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/updateUser",
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(requestBody),
            }
          );
    
          if (response.ok) {
            messagePopUp("Perfil actualizado correctamente", "success");
          } else {
            messagePopUp("Error actualizando el perfil", "error");
          }
        } catch (error) {
          console.error(error);
          messagePopUp("Error actualizando el perfil", "error");
        } finally {
          setLoading(false);
        }
      };

    const changePassword = async () => {
        setLoading(true);
        setMessageError('');
        // Validar que ambas contraseñas coinciden
        if (newPassword !== reNewPassword) {
            console.log('Las contraseñas no coinciden');
            setMessageError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }
    
        try {
            // Definir el cuerpo de la solicitud con las contraseñas
            const requestBody = {
                currentpassword: actualPassword,  // La contraseña actual proporcionada por el usuario
                newpassword: newPassword,        // Nueva contraseña ingresada por el usuario
            };
    
            // Configurar los headers con el token de autorización
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Asegúrate de que el token esté disponible en tu estado
                }
            };
    
            // Enviar la solicitud POST a la API Gateway
            const response = await axios.post(
                'https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/changeUserPasswd',
                requestBody,
                config
            );
            const data = await response.data;

            // Manejar la respuesta de la API
            if (response.status === 200) {
                setSuccesMessage("Contraseña actualizada correctamente");
            } else {
                throw new Error(data.body || 'Error desconocido al cambiar la contraseña');
            }
    
        } catch (error) {
            if (error.response && error.response.data) {
                // Verifica si la respuesta contiene el mensaje de error esperado
                if (error.response.data.includes("Password must have symbol characters")) {
                    setMessageError("La contraseña debe contener caracteres especiales.");
                } else if (error.response.data.includes("Invalid current password")) {
                    setMessageError("La contraseña actual no es correcta.");
                } else {
                    setMessageError(error.response.data);
                }
            } else {
                // Manejo de errores genéricos
                setMessageError("Error desconocido. Por favor, intenta nuevamente.");
            }
        } finally {
            setLoading(false);
        }
    };


    useEffect(() =>{
        if (role === 'responsable'){
            setcategorySelected('Controles')    
        }
    }, [categorySelected])
    


    return (
        <div className="navbar">
            {selectedEmpresaName}
            {profilePopUp && (
                <div 
                className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-40"
                onClick={() => onClose()}  // Cierra el popup al hacer clic fuera
              >
                <div 
                  className="w-1/2 h-4/5 bg-white rounded-3xl shadow-xl p-8 relative"
                  onClick={(e) => e.stopPropagation()}  // Evita el cierre al hacer clic dentro
                >
                    <button className="popup-close" onClick={() => setProfilePopUp(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <h2 className="text-2xl font-bold text-gray-800 text-center">Perfil</h2>
                    <div className='w-full h-full'>
                        <div>
                            <div className='flex flex-col items-center justify-center h-full pt-12'>
                                { userData.img && userData.img !== 'null'? (
                                    <div> {userData.img} </div>
                                ): (
                                    <div 
                                        className="relative inline-flex items-center justify-center w-36 h-36 overflow-hidden rounded-full bg-gray-600"
                                        onMouseEnter={() => setIsHovered(true)}
                                        onMouseLeave={() => setIsHovered(false)}
                                    >
                                        {isHovered ? (
                                            <div 
                                                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer"
                                                onClick={() => {setShowPhotoPopUp(true)}}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-10 text-white">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                                                </svg>
                                            </div>
                                        ) : (
                                            <span className="text-4xl font-medium text-white">
                                            {userData.name && userData.surname
                                                ? userData.name[0].toUpperCase() + userData.surname[0].toUpperCase()
                                                : ""}
                                            </span>
                                        )}

                                    </div>
                                )}
                                <p className='text-gray-500 mt-2 text-sm'>
                                    {userData.is_gestor ? (
                                        <p>gestor</p>
                                    ) : userData.is_responsable ? (
                                        <p>responsable</p>
                                    ) : (
                                        <p>admin</p>
                                    )}
                                </p>
                            </div>
                            <div className='pt-12 px-12 flex flex-col gap-4'>
                                <div className='grid grid-cols-2 gap-8'>
                                    <Input
                                    label="Nombre"
                                    type="text"
                                    name="name"
                                    value={firstName}
                                    onChange={(e) => {setFirstName(e.target.value)}}
                                    required
                                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                    />
                                    <Input
                                        label="Apellido"
                                        type="text"
                                        name="surname"
                                        value={lastName}
                                        onChange={(e) => {setLastName(e.target.value)}}
                                        required
                                        className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                    />
                                </div>
                            
                            <Input
                                label="Teléfono"
                                type="text"
                                name="phone"
                                value={phonePerson}
                                onChange={(e) => {setPhonePerson(e.target.value)}}
                                required
                                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                            />
                            <Input
                                label="email"
                                type="email"
                                name="email"
                                value={emailPerson}
                                onChange={(e) => {e.preventDefault();}}
                                disabled={true}
                                required
                                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                            />
                            <Input
                                label="role"
                                type="text"
                                name="role"
                                value={userData.role}
                                onChange={(e) => {e.preventDefault();}}
                                disabled={true}
                                required
                                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                            />

                            </div>
                            <div className='h-full w-full flex justify-around items-center align-middle'>
                            <Button
                                onClick={(e)=>{handleEdit(e)}}
                                className={`text-black font-bold text-sm w-40 h-14 px-5 py-2.5 text-center ${
                                loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                disabled={loading}
                            >
                                {loading ? 'Cargando...' : 'Editar'}
                            </Button>
                            <Button
                                onClick={(e)=>{e.preventDefault(); setShowChangePassword(true)}}
                                className={`text-black font-bold text-sm w-40 h-14 px-5 py-2.5 text-center ${
                                loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                disabled={loading}
                            >
                                {loading ? 'Cargando...' : 'Cambiar Contraseña'}
                            </Button>
                            </div>
                        </div>

                    </div>
                </div>
                    {showChangePassword &&(
                        <div className='relative ml-12 w-1/4 h-1/2 bg-white rounded-xl' onClick={(e) => e.stopPropagation()}>
                        <button className="popup-close" onClick={(e)=>{ e.preventDefault(); onClosePasswd(false);}}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        <form className="max-w-xl mx-auto w-full flex flex-col justify-around h-full ">
                            <h4 className="text-md font-semibold mt-5 mb-5 text-center">Cambiar Contraseña</h4>
                            <div className='w-8/12 mx-auto relative'>
                                {/* Contraseña Actual */}
                                <div className="relative">
                                    <Input
                                    label="Contraseña Actual"
                                    type={showActualPassword ? 'text' : 'password'}
                                    name="actualPassword"
                                    value={actualPassword}
                                    onChange={(e) => setActualPassword(e.target.value)}
                                    required
                                    labelsize='text-sm'
                                    className="text-sm block mb-8 py-2.5 px-0 w-full text-gray-900 bg-transparent border-0 border-b-2 border-gray-300"
                                    />
                                    <div 
                                    className="absolute right-4 top-1/3 text-black cursor-pointer"
                                    >
                                    {showActualPassword ? (
                                        <svg 
                                        onClick={() => {setShowActualPassword(false)}} 
                                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 cursor-pointer z-99 absolute right-4 top-1/4 text-black">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                      </svg>
                                    ) : (
                                        <svg
                                            onClick={() => {setShowActualPassword(true)}} 
                                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 cursor-pointer z-99 absolute right-4 top-1/4 text-black">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>
                                    )}
                                    </div>
                                </div>

                                {/* Nueva Contraseña */}
                                <div className="relative">
                                    <Input
                                    label="Nueva Contraseña"
                                    type={showNewPassword ? 'text' : 'password'}
                                    name="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    labelsize='text-sm'
                                    className="text-sm block mb-8 py-2.5 px-0 w-full text-gray-900 bg-transparent border-0 border-b-2 border-gray-300"
                                    />
                                    <div 
                                    className="absolute right-4 top-1/3 text-black cursor-pointer"
                                    >
                                    {showNewPassword ? (
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
                                    )}
                                    </div>
                                </div>

                                {/* Repite la contraseña */}
                                <Input
                                    label="Repita la contraseña"
                                    type="password"
                                    name="reNewPassword"
                                    value={reNewPassword}
                                    onChange={(e) => setReNewPassword(e.target.value)}
                                    required
                                    labelsize='text-sm'
                                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300"
                                />
                            </div>
                            <button
                                onClick={(e)=>{e.preventDefault(); changePassword()}}
                                className='text-black bg-primary text-sm font-bold w-40 h-14 px-2 rounded-full mx-auto'
                                disabled={loading}
                            >
                            {loading ? 'Cargando...' : <p>Cambiar <br />Contraseña</p>}
                            </button>
                            {messageSucess ? (
                                <p className="mt-2 text-xs text-green-500 font-semibold text-center">
                                    {messageSucess}
                                </p>
                            ) : messageError ? (
                                <p className="mt-2 text-xs text-red-500 font-semibold text-center">
                                    {messageError}
                                </p>
                            ): (
                                <p className="mt-2">
                                    
                                </p>
                            )}
                        </form>
                        </div>
                    )}
              </div>

            )}
            <div className='w-1/2'>
                {categorySelected !== 'Home' & categorySelected !== 'Auditorías y Seguimientos' ? (
                    <form className="w-full mx-auto relative">
                    <div className="flex md:h-3 lg:h-6 xl:h-8 h-full">
                        <div className="relative w-full">
                            <input
                            type="search"
                            id="search-dropdown"
                            className="block md:h-3 lg:h-6 xl:h-8 2xl:h-12 py-2.5 px-6  w-full z-20 lg:text-xxs lg:text-xs xl:text-sm 2xl:text-md  text-black bg-gray-200 focus:bg-gray-300 rounded-full focus:outline-none focus:ring-0 focus:border-none"
                            placeholder={`Buscar ${categorySelected}`}
                            value={searchQuery} // Enlazar el valor del input con el contexto
                            onChange={(e) => setSearchQuery(e.target.value)} // Actualizar el estado global
                            />
                            
                            <div className="absolute top-2 right-3 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                                    className="size-8 text-black cursor-pointer">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            </div>

                        </div>
                        
                    </div>
                </form>
                ): (<p></p>)}
            </div>

            <div className="user-info cursor-pointer" onClick={()=>{setProfilePopUp(true)}}>
                { userData.img && userData.img !== 'null'? (
                    <div> {userData.img} </div>
                ): (
                    <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden rounded-full bg-gray-600">
                        <span className="text-sm font-medium text-white">
                                {userData.name && userData.surname ? userData.name[0].toUpperCase() + userData.surname[0].toUpperCase() : ''}
                            </span>
                    </div>
                )}
                
                <div>{userData.name}</div>
            </div>
            <PhotoPopup
                show={showPhotoPopUp}
                setShow={setShowPhotoPopUp}
                img={userData.img}
                setImg={(newImg) => {
                    userData.img = newImg;
                    updateProfileImage(newImg);
                  }}
            />
        </div>
        
    );
};

export default Navbar;
