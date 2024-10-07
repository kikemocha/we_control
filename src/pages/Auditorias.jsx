// src/pages/Adutorias.jsx
import {React, useState, useEffect} from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AuditoriaForm from '../form/AuditoriaForm';
import AuditoriaControlesForm from '../form/AuditoriaControlForm';

import ShowFile from '../form/ShowFile';

const Auditorias = () => {
    const { selectedEmpresa, token } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAuditoria, setSelectedAuditoria] = useState(null);
    const [selectedAuditoriaName, setSelectedAuditoriaName] = useState(null);
    const [AuditoriaData, setAuditoriaData] = useState(null);
    
    const [showPopup, setShowPopup] = useState(false);
    const [popupFormType, setPopupFormType] = useState(''); // Nuevo estado para controlar qué formulario mostrar



    const [showIMGPopup, setshowIMGPopup] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null); // Estado para almacenar la imgkey seleccionada
    const [selectedBucket, setSelectedBucket] = useState(null); // Estado para almacenar el bucketName seleccionado
    const [selectedAuditoriaIMG, setSelectedAuditoriaIMG] = useState(null);
    const [selectedControlIMG, setSelectedControlIMG] = useState(null);
    const [selectedStateIMG, setSelectedStateIMG] = useState(null);
    const [selectedControlName, setSelectedControlName] = useState(null);
    
    

    // Función para abrir el popup y almacenar el archivo y bucket seleccionados
    const handleShowFile = (fileKey, bucket, id_auditoria, id_control, state, control_name) => {
        setSelectedFile(fileKey);
        setSelectedBucket(bucket);
        setSelectedAuditoriaIMG(id_auditoria);
        setSelectedControlIMG(id_control);
        setSelectedStateIMG(state);
        setSelectedControlName(control_name)
        setshowIMGPopup(true); // Abrir el popup
    };


    const handleOpenPopup = (formType) => {
        setShowPopup(true);
        setPopupFormType(formType); // Establecer el tipo de formulario a mostrar
    };
    const handleClosePopup = () => {
        setShowPopup(false);
        setPopupFormType(''); // Restablecer el tipo de formulario cuando se cierra el popup
    };


    const handleAuditoria = (id_auditoria, name) => {
        setSelectedAuditoria(id_auditoria);
        setSelectedAuditoriaName(name);
    };
    const handleReset = () => {
        setSelectedAuditoria(null);
        setSelectedAuditoriaName(null);
        setAuditoriaData([]);
      }

    
    const fetchAuditoriaData = async () => {
        if (selectedAuditoria) {
            try {
                const response = await axios.get(`https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getAuditoriaData?id_auditoria=${selectedAuditoria}`,
                    {headers : {
                        'Authorization' : `Bearer ${token}`
                    }}
                );
                setAuditoriaData(response.data);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        }
    };
    const fetchData = async () => {
        try {
            const response = await axios.get("https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getAuditorias?id_empresa="+selectedEmpresa,
                {headers : {
                    'Authorization' : `Bearer ${token}`
                }}
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
        fetchAuditoriaData();
        fetchData();
    }, [selectedAuditoria]);

    
    if (loading) {
        return <div className='card_option'>
                    <div className='total_add'>
                        <div className='upper_box'>
                            <div className='text'>Total de&nbsp;<strong>auditorías</strong>:</div>
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
                                        <th>Progreso</th>
                                        <th>Fecha de Creación</th>
                                        <th>Detalle</th>
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
        {selectedAuditoria? (
            <div>  
                <div>
                    <svg 
                    className='close-icon'
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
                <h3>{selectedAuditoriaName}</h3>
                    {AuditoriaData ? (
                        <div>
                            {popupFormType === 'control' && (
                                <AuditoriaControlesForm show={showPopup} onClose={handleClosePopup} fetchData={fetchAuditoriaData} selectedAuditoria={selectedAuditoria}/>
                            )}
                            {popupFormType === 'auditoria' && (
                                <AuditoriaForm show={showPopup} onClose={handleClosePopup} fetchData={fetchData} />
                            )}
                            <div className='total_add'>
                                <div className='upper_box'>
                                    <div className='text'>Total de controles:</div>
                                    <div className='number'>{AuditoriaData.length}</div>
                                </div>
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
                            </div>
                            <div className='responsable_home'>
                                <div className='responsable_main'>
                                    <div className="table-container">
                                        <div>
                                            <table className="card_table">
                                            <thead className='no_main'>
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
                                                {AuditoriaData.map((control, index) => (
                                                <tr key={index} className="table-row">
                                                    <td>{control[0]}</td>
                                                    <td>{control[1]}</td>
                                                    <td>{control[2]}</td>
                                                    <td>{control[3]}</td>
                                                    <td>{control[4]}</td>
                                                    <td className="archive_responsable">
                                                    <div className={control[5] === 'None' ? '' : 'archive'}>
                                                        {control[5] === 'None' ? (
                                                            <p>None</p>
                                                        ) : (
                                                            <p
                                                            onClick={control[5] !== 'None' ? () => handleShowFile(control[5], `empresa-${control[7]}`,control[8],control[9],control[6], control[0]) : null}
                                                            style={{ cursor: control[5] !== 'None' ? 'pointer' : 'default' }} // Cambiar el cursor para indicar si es clicable
                                                            >
                                                                {control[5].split('/').slice(1).join('')}
                                                            </p>
                                                            

                                                        )}
                                                        
                                                    </div>
                                                    </td>
                                                    <td className={control[6] === 'Denegado' ? 'text-red-500' : control[6] === 'Verificado' ? 'text-green-600' : ''}>{control[6] === 'Denegado' ? 'No Validado' : control[6]}</td>
                                                </tr>
                                                ))}
                                            </tbody>
                                            </table>
                                        </div>
                                        {showIMGPopup && (
                                                        <div>
                                                            <ShowFile
                                                            show={showIMGPopup}
                                                            onClose={() => setshowIMGPopup(false)} // Cerrar el popup
                                                            imgkey={selectedFile} // Pasar la imgkey almacenada en el estado
                                                            bucketName={selectedBucket} // Pasar el bucketName almacenado en el estado
                                                            id_auditoria={selectedAuditoriaIMG}
                                                            id_control={selectedControlIMG}
                                                            state={selectedStateIMG}
                                                            fetchData={fetchAuditoriaData}
                                                            control_name={selectedControlName}
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
                                <div className='upper_box'>
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
                                    <AuditoriaForm show={showPopup} onClose={handleClosePopup} fetchData={fetchData} />
                                )}
                        </div>
                    )}
        </div>
        ):(
        <div>
                {popupFormType === 'auditoria' && (
                    <AuditoriaForm show={showPopup} onClose={handleClosePopup} fetchData={fetchData} />
                )}
                {popupFormType === 'control' && (
                    <AuditoriaControlesForm show={showPopup} onClose={handleClosePopup} fetchData={fetchAuditoriaData} />
                )}
            <div className='total_add'>
                <div className='upper_box'>
                    <div className='text'>Total de&nbsp;<strong>auditorías</strong>:</div>
                    <div className='number'>{data.length}</div>
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
                            <tr className="table-row">
                                <th>Nombre</th>
                                <th>Progreso</th>
                                <th>Fecha de Creación</th>
                                <th>Detalle</th>
                            </tr>
                            {data.map((auditoria, index) => (
                                <tr key={index} className="table-row">
                                <td>{auditoria[1]}</td>
                                <td>{Math.floor(auditoria[3] / auditoria[2])}%</td>
                                <td>{auditoria[4]}</td>
                                <td >
                                    <svg
                                        onClick={() => handleAuditoria(auditoria[0], auditoria[1])}
                                        viewBox="0 0 1024 1024"
                                        fill="currentColor"
                                        height="2em"
                                        width="2em"
                                        className='mx-auto'
                                        >
                                        <path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0011.6 0l43.6-43.5a8.2 8.2 0 000-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z" />
                                    </svg>
                                </td>
                                </tr>
                            ))}
                        </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        )}
    </div>
};

export default Auditorias;
