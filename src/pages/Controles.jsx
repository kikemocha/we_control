// src/pages/Cotroles.js
import {React, useState, useEffect} from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ControlesForm from '../form/ControlesForm';
import EditControlesForm from '../form/editForms/EditControlesForm';

const Controles = () => {
    const {selectedEmpresa, token, refreshAccessToken} = useAuth();
    const [data, setData] = useState({ activo: [], eliminado: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [controlesState, setControlesState] = useState('activo');

    const [showPopup, setShowPopup] = useState(false);
    const handleOpenPopup = () => setShowPopup(true);
    const handleClosePopup = () => setShowPopup(false);

    const handleCloseEditPopup = () => setshowEditPopup(false);
    const [showEditPopup, setshowEditPopup] = useState(false);
    const [selectedControl, setSelectedControl] = useState(null);
    const handleOpenEditPopup = (control) => {
        setSelectedControl(control);  // Guardar el item seleccionado
        setshowEditPopup(true);
    };

    const fetchData = async () => {
        try {
            const response = await axios.get("https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getControlesData?id_empresa="+selectedEmpresa,
                {headers: {
                    'Authorization': `Bearer ${token}`
                    }
                }
            );
            let data_clean = [];
            data_clean = response.data;
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
                            <div className='text'>Total de&nbsp;<strong>controles</strong>:</div>
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
                                    <thead>
                                        <tr className="table-row">
                                            <th>Número</th>
                                            <th>Nombre</th>
                                            <th>Riesgo Asociado</th>
                                            <th>Valor de Control</th>
                                            <th>Evidencias</th>
                                            <th>Periodicidad</th>
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
                            <div className='text'>Total de&nbsp;<strong>controles</strong>:</div>
                            <div className='number' style={{height : '70%', margin: 'auto', width:'50px', borderRadius:'30px'}}></div>
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
                            <div className="table-container">
                                <div>
                                
                                    <table className="card_table">
                                    <thead>
                                        <tr className="table-row">
                                            <th>Número</th>
                                            <th>Nombre</th>
                                            <th>Riesgo Asociado</th>
                                            <th>Valor de Control</th>
                                            <th>Evidencias</th>
                                            <th>Periodicidad</th>
                                            <th>Ajustes</th>
                                            
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {Array.from({ length: 1 }).map((_, index) => (
                                        <tr key={index} className="table-row">
                                            <td>Ha habido un problema con la red</td>
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


    return <div className='card_option'>
            <ControlesForm show={showPopup} onClose={handleClosePopup} fetchData={fetchData} actualControles={data.activo}/>
            {/* <button onClick={()=>{refreshAccessToken()}} >BUTTON</button> */}
            <div className='total_add'>
                <div className='flex'>
                    <div className={controlesState === 'eliminado' ? 'upper_box text-xs' : 'upper_box'}>
                        <div className='text'>Total de&nbsp;<strong>controles</strong> {controlesState === 'eliminado' && <p className='ml-2 text-red-800'>eliminados:</p>}</div>
                        <div className='number'>{controlesState === 'activo' ? data.activo.length : data.eliminado.length}</div>
                    </div>
                    <div className='paperbin'>
                        <svg
                            onClick={()=>{controlesState === 'activo' ? setControlesState('eliminado') : setControlesState('activo')}}
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth={1.5} 
                            stroke="currentColor" 
                            className={controlesState === 'activo' ? '' : 'selected'}>
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
                                    <thead className='no_main'>
                                        <tr className="table-row">
                                            <th>Número</th>
                                            <th className='w-1/5 overflow-x-hidden'>Riesgos Asociados</th>
                                            <th>Nombre</th>
                                            <th>Evidencias</th>
                                            <th>Periodicidad</th>
                                            <th>Tipo de Control</th>
                                            <th>Ajustes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {data[controlesState]
                                        .slice() // Hacer una copia para evitar mutar el estado original
                                        .sort((a, b) => {
                                            if (a[1] < b[1]) return -1; // Orden ascendente
                                            if (a[1] > b[1]) return 1;
                                            return 0;
                                        }).map((control, index) => (
                                            <tr key={index}>
                                                <td className="text-center font-bold border-t border-black h-16 text-sm py-2 px-5">{control[1]}</td>
                                                
                                                <td className="w-1/5 min-w-[200px] max-w-[200px] overflow-hidden whitespace-nowrap border-t border-black h-16 text-sm py-2 px-5 text-left">
                                                    <div className="flex justify-start items-center space-x-2 overflow-x-auto max-w-full align-middle">
                                                        {control[8].split(',').map((riesgo, index) => (
                                                            <div
                                                                key={index}
                                                                className="bg-primary px-3 py-2 rounded-full flex-shrink-0"
                                                            >
                                                                {riesgo}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="text-center border-t border-black h-16 text-sm py-2 px-5">{control[2]}</td>
                                                <td className="text-center border-t border-black h-16 text-sm py-2 px-5">{control[3]}</td>
                                                <td className="text-center border-t border-black h-16 text-sm py-2 px-5">{control[4]}</td>
                                                <td className="text-center border-t border-black h-16 text-sm py-2 px-5">{control[5]}</td>
                                                <td className="text-center border-t border-black h-16 text-sm py-2 px-5">
                                                        <svg 
                                                            xmlns="http://www.w3.org/2000/svg" 
                                                            fill="none" 
                                                            viewBox="0 0 24 24" 
                                                            strokeWidth="2.5" 
                                                            stroke="currentColor" 
                                                            className="bg-gray-400 bg-opacity-60 rounded-full p-1 cursor-pointer mx-auto size-8"
                                                            onClick={controlesState === 'activo' ? (e) => handleOpenEditPopup(control) : null}>
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
                {showEditPopup && selectedControl && (
                    <EditControlesForm
                        show={showEditPopup}
                        onClose={handleCloseEditPopup}
                        fetchData={fetchData}

                        id_control={selectedControl[0]}
                        name={selectedControl[2]}
                        numberName={selectedControl[1]}
                        riesgosAsociados={selectedControl[8]}
                        descriptionsAsociadas={selectedControl[9]}
                        evidences={selectedControl[3]}
                        periocity={selectedControl[4]}
                        value={selectedControl[5]}

                        data={data}
                    />

                )}
        
    </div>
};

export default Controles;
