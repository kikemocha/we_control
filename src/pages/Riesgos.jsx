// src/pages/Riesgos.js
import {React, useState, useEffect} from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import RiesgosForm from '../form/RiesgosForm';

const Riesgos = () => {
    const {selectedEmpresa} = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showPopup, setShowPopup] = useState(false);
    const handleOpenPopup = () => setShowPopup(true);
    const handleClosePopup = () => setShowPopup(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getRiesgosData?id_empresa=${selectedEmpresa}`, {
                headers: {
                    'Authorization': `Bearer `
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
                    <h3>Riesgos</h3>
                    <div className='total_add'>
                        <div className='upper_box'>
                            <div className='text'>Total de&nbsp;<strong>riesgos</strong>:</div>
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
                                        <th>Número de Riesgo</th>
                                        <th>Descripción</th>
                                        <th>Valor de Riesgo Inherente</th>
                                        <th>Fecha de Creación</th>
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
            <RiesgosForm show={showPopup} onClose={handleClosePopup} fetchData={fetchData}/>
            <h3>Riesgos</h3>
            <div className='total_add'>
                <div className='upper_box'>
                    <div className='text'>Total de&nbsp;<strong>riesgos</strong>:</div>
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
                                    <th>Número de Riesgo</th>
                                    <th>Descripción</th>
                                    <th>Valor de Riesgo Inherente</th>
                                    <th>Fecha de Creación</th>
                                </tr>
                                {data.map((riesgos, index) => (
                                    <tr key={index} className="table-row">
                                        <td className='riesgos_controles'><div>{riesgos[1]}</div></td>
                                        <td>{riesgos[2]}</td>
                                        <td>{riesgos[3]}</td>
                                        <td>{riesgos[5]}</td>
                                    </tr>
                                ))}
                                
                            </table>
                            </div>
                        </div>
                    </div>
                </div>) : (
                    <div> No data ...</div>
                )}
    </div>
};

export default Riesgos;
