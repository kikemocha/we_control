// src/pages/Responsables.js
import {React, useState, useEffect} from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Responsables = () => {
    const {selectedEmpresa} = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getResponsablesData?id_empresa="+selectedEmpresa);
                let data_clean = [];
                data_clean = response.data
                setData(data_clean);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedEmpresa]);
    

    if (loading) {
        return <div>Loading...</div>; // Indicador de carga mientras se obtienen los datos
    }

    return <div className='card_option'>
            <h3>Gestores</h3>
            <div className='upper_box'>
                <div className='text'>Total de&nbsp;<strong>gestores</strong>:</div>
                <div className='number'>{data.length}</div>
            </div>
            {data ? (
                <div className='responsable_home'>
                    <div className='responsable_main'>
                        <div className="table-container">
                            <div>
                                <table className="card_table">
                                <tr className="table-row">
                                    <th>Nombre</th>
                                    <th>Teléfono</th>
                                    <th>Título</th>
                                    <th>E-mail</th>
                                    <th>Controles Asignados</th>
                                    <th>Ajustes</th>
                                </tr>
                                {data.map((responsable, index) => (
                                    <tr key={index} className="table-row">
                                        <td>{responsable[2]}</td>
                                        <td>{responsable[3]}</td>
                                        <td>{responsable[5]}</td>
                                        <td>{responsable[4]}</td>
                                        <td>{responsable[9]}</td>
                                        <td>
                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                height="2.5em"
                                                width="2.5em"
                                                >
                                                <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
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
        
    </div>
};

export default Responsables;
