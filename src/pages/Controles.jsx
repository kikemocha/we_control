// src/pages/Cotroles.js
import {React, useState, useEffect} from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ControlesForm from '../form/ControlesForm';


const Controles = () => {
    const {selectedEmpresa} = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showPopup, setShowPopup] = useState(false);
    const handleOpenPopup = () => setShowPopup(true);
    const handleClosePopup = () => setShowPopup(false);


    const fetchData = async () => {
        try {
            const response = await axios.get("https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getControlesData?id_empresa="+selectedEmpresa);
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
        return <div>Loading...</div>; // Indicador de carga mientras se obtienen los datos
    }

    return <div className='card_option'>
            <ControlesForm show={showPopup} onClose={handleClosePopup} fetchData={fetchData}/>
            <h3>Controles</h3>
            <div className='total_add'>
                <div className='upper_box'>
                    <div className='text'>Total de&nbsp;<strong>controles</strong>:</div>
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
                                    <th>Número</th>
                                    <th>Riesgos Asociados</th>
                                    <th>Nombre</th>
                                    <th>Evidencias</th>
                                    <th>Periodicidad</th>
                                    <th>Valor de Control</th>
                                </tr>
                                {data.map((control, index) => (
                                    <tr key={index} className="table-row">
                                        <td>{control[1]}</td>
                                        <td className='riesgos_controles'>
                                        {control[7].split(',').map((riesgo, index) => (
                                            <div>{riesgo}</div>
                                        ))}
                                        </td>
                                        <td>{control[2]}</td>
                                        <td>{control[3]}</td>
                                        <td>{control[4]}</td>
                                        <td>{control[5]}</td>
                                    </tr>
                                ))}
                            </table>
                            </div>
                        </div>
                    </div>
                </div>) : (
                    <div> Loading ...</div>
                )}
        
    </div>
};

export default Controles;