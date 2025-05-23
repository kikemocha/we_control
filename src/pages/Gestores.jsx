// src/pages/Gestores.js
import {React, useState, useEffect} from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import GestoresForm from '../form/GestoresForm';

import EditPersonForm from '../form/editForms/EditPersonForm';

const Gestores = () => {
    const {selectedEmpresa, token, searchQuery} = useAuth();
    const [data, setData] = useState({ activo: [], eliminado: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    const [gestoresState, setGestoresState] = useState('activo');

    const [showPopup, setShowPopup] = useState(false);
    const handleOpenPopup = () => setShowPopup(true);
    const handleClosePopup = () => setShowPopup(false);

    const [messagePopUp, setMessagePopUp] = useState('');
    const [messageStatePopUp, setMessageStatePopUp] = useState('');
    const [messageIsVisible, setMessageIsVisible] = useState(false);
    const [showMessagePopUp, setShowMessagePopUp] = useState(false);

    const handleCloseMessagePopUp = (message, messageState) => {
        setMessageStatePopUp(messageState); 
        setMessagePopUp(message); // Establece el mensaje que se mostrará
        setShowMessagePopUp(true); // Muestra el popup
        setMessageIsVisible(true); // Controla la animación de entrada
    
        // Después de 2 segundos, empieza la animación de salida y cierra el popup
        setTimeout(() => {
            setMessageIsVisible(false); // Activamos la animación de salida
          setTimeout(() => {
            setShowMessagePopUp(false); // Remueve el popup después de que la animación termine
            setMessagePopUp(''); // Limpia el mensaje
          }, 500); // 500 ms es la duración de la animación de salida
        }, 2000); // El popup permanece visible durante 2 segundos
    };


    const [showEditPopup, setshowEditPopup] = useState(false);
    const [selectedGestor, setSelectedGestor] = useState(null); // Riesgo seleccionado para editar
    const handleOpenEditPopup = (gestor) => {
        setSelectedGestor(gestor);  // Guardar el item seleccionado
        setshowEditPopup(true);
      };
    const handleCloseEditPopup = () => setshowEditPopup(false);


    
    const fetchData = async () => {
        try {
            const response = await axios.get("https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getGestoresData?id_empresa="+selectedEmpresa, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            let data_clean = [];
            data_clean = response.data
            setData(data_clean);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, [selectedEmpresa]);

    const filteredGestores = data[gestoresState].filter((gestor) =>
        gestor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||  // Nombre
        gestor.surname.toLowerCase().includes(searchQuery.toLowerCase()) || // Apellido
        gestor.role.toLowerCase().includes(searchQuery.toLowerCase()) || // Cargo
        gestor.email.toLowerCase().includes(searchQuery.toLowerCase()) || // Email
        gestor.phone.toLowerCase().includes(searchQuery.toLowerCase())  // Teléfono
    );

    
    if (loading | !data.activo) {
        return <div className='card_option'>
                    <div className='total_add'>
                        <div className='flex'>
                            <div className={gestoresState === 'eliminado' ? 'upper_box text-xs' : 'upper_box'}>
                                <div className='text'>Total de&nbsp;<strong>gestores</strong> {gestoresState === 'eliminado' && <p className='ml-2 text-red-800'>eliminados:</p>}</div>
                                    <div className='number skeleton' style={{height : '70%', margin: 'auto', width:'50px', borderRadius:'30px'}}></div>
                            </div>
                            <div className='paperbin'>
                                <svg
                                    onClick={()=>{gestoresState === 'activo' ? setGestoresState('eliminado') : setGestoresState('activo')}}
                                    xmlns="http://www.w3.org/2000/svg" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    strokeWidth={1.5} 
                                    stroke="currentColor" 
                                    className={gestoresState === 'activo' ? '' : 'selected'}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                            </div>
                        </div>
                        <div onClick={handleOpenPopup}>
                            <svg
                                viewBox="0 0 1024 1024"
                                fill="currentColor"
                                height="2em"
                                width="2em"
                                >
                                <defs>
                                    <style />
                                </defs>
                                <path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z" />
                                <path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z" />
                            </svg>
                        </div>
                    </div>
                    <div className='responsable_home'>
                        <div className='responsable_main'>
                            <div className="table-container skeleton">
                                <div>
                                    <table className="card_table">
                                    <tr className="table-row">
                                        <th>Nombre</th>
                                        <th>Apellido</th>
                                        <th>Cargo   </th>
                                        <th>E-mail</th>
                                        <th>Teléfono</th>
                                        <th>Ajustes</th>
                                    </tr>
                                    {Array.from({ length: 8 }).map((_, index) => (
                                        <tr key={index} className="table-row">
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                    ))}
                                </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
    }

    return <div className='card_option'>
            <GestoresForm show={showPopup} onClose={handleClosePopup} fetchData={fetchData} actualGestores={data.activo}/>
            <div className='total_add'>
                        <div className='flex'>
                            <div className={gestoresState === 'eliminado' ? 'upper_box text-xs' : 'upper_box'}>
                                <div className='text'>Total de&nbsp;<strong>gestores</strong> {gestoresState === 'eliminado' && <p className='ml-2 text-red-800'>eliminados:</p>}</div>
                                <div className='number'>{gestoresState === 'activo' ? data.activo.length : data.eliminado.length}</div>
                            </div>
                            <div className='paperbin'>
                                <svg
                                    onClick={()=>{gestoresState === 'activo' ? setGestoresState('eliminado') : setGestoresState('activo')}}
                                    xmlns="http://www.w3.org/2000/svg" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    strokeWidth={1.5} 
                                    stroke="currentColor" 
                                    className={gestoresState === 'activo' ? '' : 'selected'}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                            </div>
                        </div>
                        <div onClick={handleOpenPopup}>
                            <svg
                                viewBox="0 0 1024 1024"
                                fill="currentColor"
                                height="2em"
                                width="2em"
                                >
                                <defs>
                                    <style />
                                </defs>
                                <path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z" />
                                <path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z" />
                            </svg>
                        </div>
                    </div>
            {data ? (
                <div className='responsable_home'>
                    <div className='responsable_main'>
                        <div className="table-container">
                            <div>
                                <table className="card_table">
                                <thead>
                                <tr className="table-row">
                                    <th>Nombre</th>
                                    <th>Apellido</th>
                                    <th>Cargo   </th>
                                    <th>E-mail</th>
                                    <th>Teléfono</th>
                                    <th>Ajustes</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredGestores.map((gestor, index) => (
                                    <tr key={index} className="table-row">
                                        <td><p className='text-center'>{gestor.name}</p></td>
                                        <td><p className='text-center'>{gestor.surname}</p></td>
                                        <td><p className='text-center'>{gestor.role}</p></td>
                                        <td><p className='text-center'>{gestor.email}</p></td>
                                        <td><p className='text-center'>{gestor.phone}</p></td>
                                        <td>
                                        <svg
                                         
                                            xmlns="http://www.w3.org/2000/svg" 
                                            fill="none" 
                                            viewBox="0 0 24 24" 
                                            strokeWidth="2.5" 
                                            stroke="currentColor" 
                                            className="size-8 mx-auto"
                                            onClick={(e) => handleOpenEditPopup(gestor)}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                        </svg>

                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            </div>
                        </div>
                    </div>
                </div>) : (
                    <div> Loading ...</div>
                )}
        {showEditPopup && selectedGestor && (
                    <EditPersonForm

                        show={showEditPopup}
                        onClose={handleCloseEditPopup}
                        fetchData={fetchData}
                        id_cognito={selectedGestor.id_cognito}
                        id_person={selectedGestor.id_user} 
                        first_name={selectedGestor.name} 
                        last_name={selectedGestor.surname} 
                        cargo={selectedGestor.role}
                        email={selectedGestor.email}
                        phone={selectedGestor.phone}
                        messagePopUp={handleCloseMessagePopUp}
                        
                    />    
                )}
                {showMessagePopUp && (
                    <div
                    className={`fixed w-1/2 h-24 left-1/4 bottom-2 transform -translate-x-1/2 z-50 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                        messageIsVisible ? 'animate-fadeIn' : 'animate-fadeOut'
                      } ${messageStatePopUp === 'success' ? 'bg-green-400' : 'bg-red-400'}`}
                    style={{ zIndex: 99 }}
                    >
                    <button className="absolute right-2 top-2 text-red-600" onClick={() => setShowMessagePopUp(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <p className="text-black">{messagePopUp}</p>
                    </div>
                )}
    </div>
};

export default Gestores;
