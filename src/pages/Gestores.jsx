// src/pages/Gestores.js
import {React, useState, useEffect} from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import GestoresForm from '../form/GestoresForm';

import EditPersonForm from '../form/editForms/EditPersonForm';

const Gestores = () => {
    const {selectedEmpresa, token} = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    if (loading) {
        return <div className='card_option'>
                    <div className='total_add'>
                        <div className='upper_box'>
                            <div className='text'>Total de&nbsp;<strong>gestores</strong>:</div>
                            <div className='number skeleton' style={{height : '70%', margin: 'auto', width:'50px', borderRadius:'30px'}}></div>
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
                                        <th>Título</th>
                                        <th>E-mail</th>
                                        <th>Ajustes</th>
                                    </tr>
                                    {Array.from({ length: 8 }).map((_, index) => (
                                        <tr key={index} className="table-row">
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
            <GestoresForm show={showPopup} onClose={handleClosePopup} fetchData={fetchData} actualGestores={data}/>
            <div className='total_add'>
                <div className='upper_box'>
                    <div className='text'>Total de&nbsp;<strong>gestores</strong>:</div>
                    <div className='number'>{data.length}</div>
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
                                <tr className="table-row">
                                    <th>Nombre</th>
                                    <th>Apellido</th>
                                    <th>Título</th>
                                    <th>E-mail</th>
                                    <th>Ajustes</th>
                                </tr>
                                {data.map((gestor, index) => (
                                    <tr key={index} className="table-row">
                                        <td><p className='text-center'>{gestor[2]}</p></td>
                                        <td><p className='text-center'>{gestor[9]}</p></td>
                                        <td><p className='text-center'>{gestor[5]}</p></td>
                                        <td><p className='text-center'>{gestor[4]}</p></td>
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
                        id_person={selectedGestor[0]} 
                        first_name={selectedGestor[2]} 
                        last_name={selectedGestor[9]} 
                        cargo={selectedGestor[5]}
                        email={selectedGestor[4]}
                        phone={selectedGestor[3]}
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
