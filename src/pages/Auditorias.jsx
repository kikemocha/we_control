// src/pages/Adutorias.jsx
import {React, useState, useEffect} from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AuditoriaForm from '../form/AuditoriaForm';
import AuditoriaControlesForm from '../form/AuditoriaControlForm';
import EditAuditoriaForm from '../form/editForms/EditAuditoriaForm';

import ShowFile from '../form/ShowFile';
import FileManager from "../form/FileManager";

const Auditorias = () => {
    const { selectedEmpresa, token } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAuditoria, setSelectedAuditoria] = useState(null);
    const [selectedAuditoriaName, setSelectedAuditoriaName] = useState(null);
    const [selectedAuditoriaState, setSelectedAuditoriaState] = useState(0);

    const [AuditoriaData, setAuditoriaData] = useState(null);

    const [selectedYear, setSelectedYear] = useState(null);
    const [years, setYears] = useState([]);
    
    const [showPopup, setShowPopup] = useState(false);
    const [popupFormType, setPopupFormType] = useState(''); // Nuevo estado para controlar qué formulario mostrar


    const handleCloseEditPopup = () => setshowEditPopup(false);
    const [showEditPopup, setshowEditPopup] = useState(false);
    const [selectedAuditoriaEdit, setSelectedAuditoriaEdit] = useState(null);
    const handleOpenEditPopup = (auditoria) => {
        setSelectedAuditoriaEdit(auditoria);  // Guardar el item seleccionado
        setshowEditPopup(true);
    };

    const [showIMGPopup, setshowIMGPopup] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState(null); // Estado para almacenar la imgkey seleccionada
    const [selectedAuditoriaIMG, setSelectedAuditoriaIMG] = useState(null);
    const [selectedControlOrder, setSelecteControlOrder] = useState(null);
    const [selectedControlIMG, setSelectedControlIMG] = useState(null);
    const [selectedStateIMG, setSelectedStateIMG] = useState(null);
    const [selectedControlName, setSelectedControlName] = useState(null);
    const [messageAdmin, setMessageAdmin] = useState(null);
    const [periodicity, setPeriodicity] = useState(null);
    

    // Función para abrir el popup y almacenar el archivo y bucket seleccionados
    const handleShowFile = (archivos, id_auditoria, id_control, state, order, control_name, message_admin, periodicity) => {
        setSelectedFiles(archivos);
        setSelectedAuditoriaIMG(id_auditoria);
        setSelectedControlIMG(id_control);
        setSelectedStateIMG(state);
        setSelectedControlName(control_name);
        setSelecteControlOrder(order);
        setshowIMGPopup(true);
        setMessageAdmin(message_admin);
        setPeriodicity(periodicity);
    };


    const handleOpenPopup = (formType) => {
        setShowPopup(true);
        setPopupFormType(formType); // Establecer el tipo de formulario a mostrar
    };
    const handleClosePopup = () => {
        setShowPopup(false);
        setPopupFormType(''); // Restablecer el tipo de formulario cuando se cierra el popup
    };


    const handleAuditoria = (id_auditoria, name, all_controls) => {
        setSelectedAuditoria(id_auditoria);
        setSelectedAuditoriaName(name);
        setSelectedAuditoriaState(all_controls);
    };
    const handleReset = () => {
        setSelectedAuditoria(null);
        setSelectedAuditoriaName(null);
        setSelectedAuditoriaState(false);
        setAuditoriaData([]);
      }

    
      const fetchAuditoriaData = async () => {
        if (!selectedAuditoria) return; // Evita ejecutar la solicitud si no hay auditoría seleccionada
    
        try {
            const response = await axios.get(
                `https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getAuditoriaData?id_auditoria=${selectedAuditoria}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            setAuditoriaData(response.data.activo);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };
    
    const fetchYear = async () => {
        try {
            setLoading(true);
            const response_years = await axios.get(
                `https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getYears/`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            setYears(response_years.data);
    
            // Solo cambiar el selectedYear si aún no tiene valor
            if (response_years.data.length > 0 && selectedYear === null) {
                setSelectedYear(response_years.data[response_years.data.length - 1].id_year);
            }
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };
    
    const fetchData = async () => {
        if (!selectedYear) return; // Previene la ejecución si selectedYear es null
        try {
            setLoading(true);
            const response = await axios.get(
                `https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getAuditorias?id_empresa=${selectedEmpresa}&id_year=${selectedYear}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
    
            // Convertir la respuesta en un array de objetos
            const formattedData = response.data.map(auditoria => ({
                id: auditoria[0], 
                name: auditoria[1], 
                totalControles: auditoria[2], 
                controlesVerificados: auditoria[3], 
                createDate: auditoria[4],
                all_controls : parseInt(auditoria[5]),
            }));
    
            setData(formattedData);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };
    
    
    useEffect(() => {
        const fetchAllData = async () => {
            await fetchYear();
            if (selectedYear) {
                await fetchData();
            }
            if (selectedAuditoria) {
                await fetchAuditoriaData();
            }
        };
    
        fetchAllData();
    }, [selectedAuditoria, selectedYear]); 
    
    const totalControls = AuditoriaData?.length || 0;
    const goodCount = AuditoriaData?.filter(control => control[6] === "Verificado").length || 0;
    const percentage = totalControls ? Math.floor((goodCount / totalControls) * 100) : 0;


    
    if (loading) {
        return <div className='card_option'>
                    <div className='total_add'>
                        <div className='upper_box text-xs'>
                            <div className='text'>Total de&nbsp;<strong>auditorías</strong>&nbsp;y&nbsp;<strong>seguimientos</strong></div>
                            {/* <div className='number skeleton' style={{height : '70%', margin: 'auto', width:'50px', borderRadius:'30px'}}></div> */}
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
                                        <th>Nombre</th>
                                        <th>Progreso</th>
                                        <th>Fecha de Creación</th>
                                        <th>Detalle</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {Array.from({ length: 8 }).map((_, index) => (
                                        <tr key={index} className="table-row">
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
        {selectedAuditoria? (
            <div>  
                <div >
                    <svg 
                    className='close-icon !z-30'
                    fill="none" 
                    viewBox="0 0 15 15" 
                    height="3em" 
                    width="3em" 
                    onClick={handleReset}
                    >
                    <path
                        fill="red"
                        fillRule="evenodd"
                        d="M11.782 4.032a.575.575 0 10-.813-.814L7.5 6.687 4.032 3.218a.575.575 0 00-.814.814L6.687 7.5l-3.469 3.468a.575.575 0 00.814.814L7.5 8.313l3.469 3.469a.575.575 0 00.813-.814L8.313 7.5l3.469-3.468z"
                        clipRule="evenodd"
                        stroke="red"
                        strokeWidth="0.6"  // Ajusta este valor para cambiar el grosor
                    />
                    </svg>
                </div>
                <div className='w-1/3 flex gap-4'>
                    <h3 className='my-auto'>{selectedAuditoriaName} </h3>
                    <div className="mt-2 w-full text-center">
                        <span>{percentage}%</span>
                        <div className="w-full bg-gray-200 rounded-full h-3  mt-1">
                            <div
                            className="bg-primary h-3 rounded-full"
                            style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
                    {AuditoriaData && !loading ? (
                        <div>
                            {popupFormType === 'control' && (
                                <AuditoriaControlesForm show={showPopup} onClose={handleClosePopup} fetchData={fetchAuditoriaData} selectedAuditoria={selectedAuditoria} id_year={selectedYear}/>
                            )}
                            {popupFormType === 'auditoria' && (
                                <AuditoriaForm show={showPopup} onClose={handleClosePopup} fetchData={fetchData} selectedYear={selectedYear}/>
                            )}
                            <div className='total_add'>
                                <div className='upper_box'>
                                    <div className='text'>Total de controles:</div>
                                    <div className='number'>{AuditoriaData.length}</div>
                                </div>
                                {selectedAuditoriaState === 0  &&(
                                    <div onClick={() => handleOpenPopup('control')}>
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
                                )}
                                
                            </div>
                            <div className='responsable_home'>
                                <div className='responsable_main'>
                                    <div className="table-container">
                                        <div>
                                            <table className="card_table">
                                                <thead className='no_main'>
                                                    <tr className="table-row">
                                                    <th>Número de Control</th>
                                                    <th>Periodicidad</th>
                                                    <th>Nombre</th>
                                                    <th>Responsable</th>
                                                    <th>Fecha límite</th>
                                                    <th>Fecha de evidencia</th>
                                                    <th>Archivos subidos</th>
                                                    <th>Estado</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {AuditoriaData.map((control, index) => (
                                                    <tr key={index} className="table-row">
                                                        <td>
                                                            {
                                                            control[9] === 'Anual' ? (
                                                                control[0]
                                                            ) : control[9] === 'Semestral' ? (
                                                                `${control[0]} - S${control[10]}`
                                                            ): control[9] === 'Cuatrimestral' ? (
                                                                `${control[0]} - ${control[10]}_Cuatr`
                                                            ): control[9] === 'Trimestral' && (
                                                                `${control[0]} - T${control[10]}`
                                                            )
                                                            }
                                                        </td>
                                                        <td>{control[9]}</td>
                                                        <td>{control[1]}</td>
                                                        <td>{control[2]}</td>
                                                        <td>{control[3]}</td>
                                                        <td>{control[4] == 'None' ? '---' : control[4]}</td>
                                                        <td className="archive_responsable">
                                                            {(() => {
                                                                const archivosStr = control[5];
                                                                const archivos = archivosStr && archivosStr !== 'None'
                                                                ? archivosStr.split(',')
                                                                : [];

                                                                return (
                                                                <div className={archivos.length === 0 ? '' : 'archive'}>
                                                                    {archivos.length === 0 ? (
                                                                    <p>---</p>
                                                                    ) : (
                                                            
                                                                    <div
                                                                        onClick={() => {
                                                                        handleShowFile(archivos, control[7], control[8], control[6], control[10], control[0], control[11], control[9]);
                                                                        }}
                                                                        style={{ cursor: 'pointer' }}
                                                                    >
                                                                        <p className='text-center mx-auto '>{archivos.length === 1 ? '1 Archivo Subido' : archivos.length+' Archivos Subidos'}</p>
                                                                    </div>
                                                                    )}
                                                                </div>
                                                                );
                                                            })()}
                                                        </td>
                                                        <td className={control[6] === 'Denegado' ? 'text-red-500' : control[6] === 'Verificado' ? 'text-green-600' : ''}>{control[6] === 'Denegado' ? 'No Validado' : control[6]}</td>
                                                    </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {showIMGPopup && (
                                                        <div>
                                                            <FileManager
                                                                show={showIMGPopup}
                                                                onClose={() => setshowIMGPopup(false)} // Cerrar el popup
                                                                fetchData={fetchAuditoriaData}
                                                                data={{
                                                                    'archives' : selectedFiles,
                                                                    'id_auditoria' : selectedAuditoriaIMG,
                                                                    'id_control' : selectedControlIMG,
                                                                    'order' : selectedControlOrder,
                                                                    'state' : selectedStateIMG,
                                                                    'control_name' : selectedControlName,
                                                                    'message_admin' : messageAdmin,
                                                                    'periodicity' : periodicity
                                                                }}
                                                                />
                                                        </div>
                                                    )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ):(
                        <div>
                            <div>
                                <div className='upper_box auditoria'>
                                    <div className='text'>Total de controles:</div>
                                    <div className='number skeleton' style={{height : '70%', margin: 'auto', width:'50px', borderRadius:'30px'}}></div>
                                </div>
                            </div>
                            <div className='responsable_home'>
                                <div className='responsable_main'>
                                    <div className="table-container skeleton">
                                        <div>
                                            <table className="card_table">
                                            <thead className='no_main skeleton'>
                                                <tr className="table-row">
                                                <th>Número de Control</th>
                                                <th>Nombre</th>
                                                <th>Responsable</th>
                                                <th>Fecha límite</th>
                                                <th>Fecha de creación</th>
                                                <th>Archivos subidos</th>
                                                <th>Estado</th>
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
                                {popupFormType === 'control' && (
                                    <AuditoriaControlesForm show={showPopup} onClose={handleClosePopup} fetchData={fetchData} />
                                )}
                                {popupFormType === 'auditoria' && (
                                    <AuditoriaForm show={showPopup} onClose={handleClosePopup} fetchData={fetchData} selectedYear={selectedYear}/>
                                )}
                        </div>
                    )}
        </div>
        ):(
        <div>
                {popupFormType === 'auditoria' && (
                    <AuditoriaForm show={showPopup} onClose={handleClosePopup} fetchData={fetchData} selectedYear={selectedYear}/>
                )}
                {popupFormType === 'control' && (
                    <AuditoriaControlesForm show={showPopup} onClose={handleClosePopup} fetchData={fetchAuditoriaData} />
                )}
            <div className='total_add'>
                <div className='upper_box auditoria text-xs'>
                    <div className='text'>Total de&nbsp;<strong>auditorías</strong>&nbsp;y&nbsp;<strong>seguimientos</strong></div>
                    <div className='number'>{data.length}</div>
                </div>
                <div className='flex flex-row justify-center w-full'>
                    <div>
                    <select 
                        id="year" 
                        className="w-36 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-orange-400 focus:border-orange-400 block p-2.5"
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        {years.length === 0 ? (
                            <option>Cargando...</option>
                        ) : (
                            years.map((year, index) => (
                                <option key={index} value={year.id_year}>{year.value}</option>
                            ))
                        )}
                    </select>
    
                    </div>
                </div>
                <div onClick={() => handleOpenPopup('auditoria')}>
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
                                    <th>Nombre</th>
                                    <th>Progreso</th>
                                    <th>Fecha de Creación</th>
                                    <th>Detalle</th>
                                </tr>
                                </thead>
                                <tbody>

                                {data.map((auditoria, index) => (
                                    <tr 
                                        key={index} className="table-row cursor-pointer hover:bg-gray-300"
                                        onClick={() => handleAuditoria(auditoria.id, auditoria.name, auditoria.all_controls)}
                                    >
                                        <td>{auditoria.name}</td>
                                        <td>
                                            <div className="flex flex-col gap-0">
                                                <span>
                                                {Math.floor(auditoria.controlesVerificados / auditoria.totalControles * 100) || 0}%
                                                </span>
                                                <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className="bg-primary h-3 rounded-full"
                                                    style={{
                                                    width: `${Math.floor(auditoria.controlesVerificados / auditoria.totalControles * 100) || 0}%`
                                                    }}
                                                ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{auditoria.createDate}</td>
                                        <td>
                                            <svg 
                                                xmlns="http://www.w3.org/2000/svg" 
                                                fill="none" 
                                                viewBox="0 0 24 24" 
                                                strokeWidth="2.5" 
                                                stroke="currentColor" 
                                                className="bg-gray-400 bg-opacity-60 rounded-full p-1 cursor-pointer mx-auto size-8"
                                                onClick={(e) => {e.stopPropagation(); handleOpenEditPopup(auditoria) }}>
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
            {showEditPopup &&
                <EditAuditoriaForm show={showEditPopup} onClose={()=>{setshowEditPopup(false)}} id_auditoria={selectedAuditoriaEdit.id} name={selectedAuditoriaEdit.name} fetchData={fetchData} audtoriasList={data.map(a => a.name)}/>
            }
        </div>
        
        )}
    </div>
};

export default Auditorias;
