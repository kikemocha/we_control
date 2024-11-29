// src/pages/Riesgos.js
import {React, useState, useEffect} from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import RiesgosForm from '../form/RiesgosForm';
import EditRiesgosForm from '../form/editForms/EditRiesgosForm';

const Riesgos = () => {
    const {selectedEmpresa, token} = useAuth();
    const [data, setData] = useState({ activo: [], eliminado: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [riesgosState, setRiesgosState] = useState('activo');
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
    const [selectedRiesgo, setSelectedRiesgo] = useState(null); // Riesgo seleccionado para editar
    const handleOpenEditPopup = (riesgo) => {
        setSelectedRiesgo(riesgo);  // Guardar el item seleccionado
        setshowEditPopup(true);
      };
    const handleCloseEditPopup = () => setshowEditPopup(false);

    const [showPopup, setShowPopup] = useState(false);
    const handleOpenPopup = () => setShowPopup(true);
    const handleClosePopup = () => setShowPopup(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getRiesgosData?id_empresa=${selectedEmpresa}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setData(response.data);
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
                        <div className='flex'>
                            <div className={riesgosState === 'eliminado' ? 'upper_box text-xs' : 'upper_box'}>
                                    <div className='text'>Total de&nbsp;<strong>riesgos</strong> {riesgosState === 'eliminado' && <p className='ml-2 text-red-800'>eliminados:</p>}</div>
                                    <div className='number'>{riesgosState === 'activo' ? data.activo.length : data.eliminado.length}</div>
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
                                        <thead>
                                            <tr className="table-row">
                                                <th>Número de Riesgo</th>
                                                <th>Descripción</th>
                                                <th>Valor de Riesgo Inherente</th>
                                                <th>Nº Controles Asociados</th>
                                                <th>Valor de Riesgo Residual</th>
                                                <th>Ajustes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
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
                                        </tbody>                                    
                                </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
    }

    if (!data.activo) {
        return <div className='card_option'>
                    <div className='total_add'>
                        <div className='upper_box'>
                            <div className='text'>Total de&nbsp;<strong>riesgos</strong>:</div>
                            <div className='number' style={{height : '70%', margin: 'auto', width:'50px', borderRadius:'30px'}}></div>
                        </div>
                        <div onClick={handleOpenPopup} style={{height : '40px', width : '40px'}}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6" >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </div>
                    </div>
                    <div className='responsable_home'>
                        <div className='responsable_main'>
                            <div className="table-container">
                                <div>
                                    <table className="card_table">
                                        <thead>
                                            <tr className="table-row">
                                                <th>Número de Riesgo</th>
                                                <th>Descripción</th>
                                                <th>Valor de Riesgo Inherente</th>
                                                <th>Nº Controles Asociados</th>
                                                <th>Valor de Riesgo Residual</th>
                                                <th>Ajustes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.from({ length: 1 }).map((_, index) => (
                                            <tr key={index} className="table-row">
                                                <td> Ha habido un problema con la red</td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                
                                            </tr>
                                            ))}
                                        </tbody>                                    
                                </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
    }
    

    return <div className='card_option'>
            <RiesgosForm show={showPopup} onClose={handleClosePopup} fetchData={fetchData} messagePopUp={handleCloseMessagePopUp} actualRiesgos={data.activo}/>
            <div className='total_add'>
                <div className='flex'>
                <div className={riesgosState === 'eliminado' ? 'upper_box text-xs' : 'upper_box'}>
                        <div className='text'>Total de&nbsp;<strong>riesgos</strong> {riesgosState === 'eliminado' && <p className='ml-2 text-red-800'>eliminados:</p>}</div>
                        <div className='number'>{riesgosState === 'activo' ? data.activo.length : data.eliminado.length}</div>
                    </div>
                    <div className='paperbin'>
                        <svg
                            onClick={()=>{riesgosState === 'activo' ? setRiesgosState('eliminado') : setRiesgosState('activo')}}
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth={1.5} 
                            stroke="currentColor" 
                            className={riesgosState === 'activo' ? '' : 'selected'}>
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
                <div className='flex'>
                    <div className='responsable_home'>
                        <div className='responsable_main'>
                            <div className="table-container">
                                <div>
                                    <table className='card_table'>
                                        <thead className='no_main'>
                                            <tr className="table-row">
                                                <th>Número de Riesgo</th>
                                                <th>Nombre</th>
                                                <th>Valor de Riesgo Inherente</th>
                                                <th>Nº Controles Asociados</th>
                                                <th>Valor de Riesgo Residual</th>
                                                <th>Ajustes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {data[riesgosState]
                                        .slice() // Hacer una copia para evitar mutar el estado original
                                        .sort((a, b) => {
                                            const numA = parseInt(a[1].match(/\d+/), 10); // Convertir a número
                                            const numB = parseInt(b[1].match(/\d+/), 10); // Convertir a número
                                            return numA - numB; // Orden ascendente
                                        })
                                        .map((riesgos, index) => (
                                            <tr key={index} className="table-row">
                                                <td className='riesgos_controles'><div className='bg-primary'>{riesgos[1]}</div></td>
                                                <td><p className='text-center'>{riesgos[2]}</p></td>
                                                <td><p className='text-center'>{riesgos[3]}</p></td>
                                                <td><p className='text-center'>{ (riesgos[4] && riesgos[4] !== 'None' ? riesgos[4].split(',').length : 0) }</p></td>
                                                <td style={{ fontWeight: 700, textAlign:'center' }} className={
                                                    (riesgos[5] === 'None' ? riesgos[3] : riesgos[5]) <= 1 ? 'text-green-700' : 
                                                    (riesgos[5] === 'None' ? riesgos[3] : riesgos[5]) > 1 && (riesgos[5] === 'None' ? riesgos[3] : riesgos[5]) <= 2 ? 'text-blue-500' :
                                                    (riesgos[5] === 'None' ? riesgos[3] : riesgos[5]) > 2 && (riesgos[5] === 'None' ? riesgos[3] : riesgos[5]) <= 3 ? 'text-yellow-600' :
                                                    (riesgos[5] === 'None' ? riesgos[3] : riesgos[5]) > 3 && (riesgos[5] === 'None' ? riesgos[3] : riesgos[5]) <= 4 ? 'text-red-500' :
                                                    (riesgos[5] === 'None' ? riesgos[3] : riesgos[5]) > 4 && (riesgos[5] === 'None' ? riesgos[3] : riesgos[5]) <= 5 ? 'text-black' : ''
                                                    }>
                                                    {riesgos[5] === 'None' ? riesgos[3] : riesgos[5]}
                                                </td>
                                                <td>
                                                    <svg 
                                                        xmlns="http://www.w3.org/2000/svg" 
                                                        fill="none" 
                                                        viewBox="0 0 24 24" 
                                                        strokeWidth="2.5" 
                                                        stroke="currentColor" 
                                                        className="size-8 mx-auto" 
                                                        onClick={riesgosState === 'activo' ? (e) => handleOpenEditPopup(riesgos) : null}>
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
                    </div>
                    <div className='absolute right-0 h-56 ml-4' style={{'width' : '8vw'}}>
                                    <div ><p className='w-full text-center mb-3'>Riesgo</p></div>
                                    <div className='flex mb-2'><div className='bg-black w-12 h-3 rounded-full'></div><p className='ml-2 text-black text-sm'>Muy Alto</p></div>
                                    <div className='flex mb-2'><div className='bg-red-500 w-12 h-3 rounded-full'></div><p className='ml-2 text-red-500 text-sm'>Alto</p></div>
                                    <div className='flex mb-2'><div className='bg-yellow-600 w-12 h-3 rounded-full'></div><p className='ml-2 text-yellow-600 text-sm'>Medio</p></div>
                                    <div className='flex mb-2'><div className='bg-blue-500 w-12 h-3 rounded-full'></div><p className='ml-2 text-blue-500 text-sm'>Bajo</p></div>
                                    <div className='flex mb-2'><div className='bg-green-700 w-12 h-3 rounded-full'></div><p className='ml-2 text-green-700 text-sm'>Muy Bajo</p></div>
                                    
                    </div>
                </div>
                ) : (
                    <div> No data ...</div>
                )}
                {showEditPopup && selectedRiesgo && (
                    <EditRiesgosForm
                        show={showEditPopup}
                        onClose={handleCloseEditPopup}
                        fetchData={fetchData}
                        id_riesgo={selectedRiesgo[0]} 
                        numberName={selectedRiesgo[1]} 
                        description={selectedRiesgo[2]} 
                        riesgoValue={selectedRiesgo[3]}
                        messagePopUp={handleCloseMessagePopUp}
                        actualRiesgos={data}
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

export default Riesgos;
