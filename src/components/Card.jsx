import {React, useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import './Card.css';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Card = ({name, singularName, href, index, apiURL}) => {
    const { selectedEmpresa } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(apiURL+selectedEmpresa);
                let data_clean = [];
                if (name === 'Gestores'){
                    data_clean = response.data.map(item => [item[2], item[4]])
                }
                else if (name === 'Controles'){
                    data_clean = response.data.map(item => [item[1], item[2], item[3], item[5], item[7]])
                }
                else if (name === 'Riesgos'){
                    data_clean = response.data.map(item => [item[1], item[3], item[7], item[7].split(',').length])
                }
                else if (name === 'Auditorías'){
                    data_clean = response.data.map(item => [item[1], Math.floor(parseInt(item[2],10)/parseInt(item[1],10))+'%' ])
                }
                else if (name === 'Responsables'){
                    data_clean = response.data.map(item => [item[2],item[5],item[4]])
                }
                else{
                    data_clean = response.data
                }
                setData(data_clean);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [apiURL]);
    if (loading) {
        return <div>Loading...</div>;
    }
    
    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="card_main">
    <span>
        <h3>{name}</h3>
    </span>
    <div className="card_content">
        <p>{data.length} {name} activos</p>
        <div className="table-container">
            <table className="card_table">
                <thead>
                    <tr className="table-row">
                        {index.map((header, idx) => (
                            <th className='no-top' key={idx}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, idx) => (
                        <tr key={idx} className="table-row">
                            {row.map((cell, cellIdx) => (
                                <td key={cellIdx}>{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="div_button_Card">
            <Link to={`/${href}`} className="button_Card">+ Nuevo {singularName}</Link>
        </div>
    </div>
</div>
    );
};
export default Card;