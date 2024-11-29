import {React, useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import './Card.css';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Card = ({name, singularName, href, index, apiURL}) => {
    const { selectedEmpresa, token } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            
            try {
                const response = await axios.get(apiURL+selectedEmpresa, {headers: {'Authorization': `Bearer ${token}`,}});
                let data_clean = [];
                if (name === 'Gestores'){
                    data_clean = response.data.activo.map(item => [item.name, item.email])
                }
                else if (name === 'Controles'){
                    data_clean = response.data.activo.map(item => [item[1], item[2], item[3], item[5], item[8]])
                }
                else if (name === 'Riesgos'){
                    data_clean = response.data.activo.map(item => [item[1], item[3], item[4].split(',').length, item[5] === 'None' ? (item[3]) : item[5]])
                }
                else if (name === 'Seguimientos y Auditorías'){
                    console.log('AUDITORIAs')
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
        return (
          <div className="card_main">
            <span>
              <h3>{name}</h3>
            </span>
            <div className="card_content skeleton">
              <div className="table-container">
                <table className="card_table">
                <thead>
                <tr className="table-row">
                        <th className='no-top'></th>
                    </tr>
                </thead>
                  <tbody>
                    {Array.from({ length: 5 }).map((_, rowIdx) => (
                      <tr key={rowIdx} className="table-row"><td></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
    }
    
    if (error) {
        return <div className="card_main">
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
                                    <tr className="table-row">
                                        {Array.from({ length: data.length }).map((_, idx) => (
                                            <td></td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="div_button_Card">
                            <Link to={`/${href}`} className="button_Card">+ Nuevo {singularName}</Link>
                        </div>
                    </div>
                </div>;
    }

    return (
        <div className="relative h-full w-full xl:p-0 2xl:p-3">
            <span>
                <h3 className="md:text-xs xl:text-xs 2xl:text-lg font-semibold">{name}</h3>
            </span>
            <div className="relative bg-gray-100 h-full w-11/12 mx-auto border border-black py-3" style={{borderRadius:'40px'}}>
                <p className="mt-2 ml-5 md:text-xxs xl:text-xs 2xl:text-sm">{data.length} {name} activos</p>
                <div className="relative h-5/6 overflow-y-auto no-scrollbar rounded-xl overflow-x-auto">
                    <table className="w-full text-center no-scrollbar">
                        <thead>
                            <tr className="border-b border-black">
                                {index.map((header, idx) => (
                                    <th className="py-2 px-4 md:text-xxs xl:text-xs 2xl:text-sm font-medium" key={idx}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                        {data
                        .slice() // Hacemos una copia para no mutar el estado original
                        .sort((a, b) => {
                            // Extraer la parte de texto (primera columna)
                            const letraA = a[0][0];
                            const letraB = b[0][0];
                
                            const numeroA = parseInt(a[0].slice(1), 10);
                            const numeroB = parseInt(b[0].slice(1), 10);
                
                            // Comparar por letra y luego por número
                            if (letraA < letraB) return -1;
                            if (letraA > letraB) return 1;
                            return numeroA - numeroB;
                        })
                        .map((row, idx) => (
                        <tr key={idx} className="border-t border-black">
                        {row.map((cell, cellIdx) => (
                            <td
                                key={cellIdx}
                                className={`py-2 px-4 h-16 md:text-xxs lg:text-xxs xl:text-xs 2xl:text-sm text-center ${
                                    name === 'Controles' && cellIdx === 4
                                        ? 'w-1/5 min-w-[200px] max-w-[200px] overflow-hidden whitespace-nowrap text-left'
                                        : ''
                                }`}
                            >
                                {/* Renderizamos un div con scroll horizontal para la columna de riesgos */}
                                {name === 'Controles' && cellIdx === 4 ? (
                                    <div className="flex justify-start items-center space-x-2 overflow-x-auto max-w-full align-middle">
                                        {cell}
                                    </div>
                                ) : (
                                    cell
                                )}
                            </td>
                        ))}
                    </tr>
                    ))}
                        </tbody>
                    </table>
                </div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex justify-center items-center h-1/5">
                    <Link 
                        to={`/${href}`} 
                        className="text-black bg-primary font-bold rounded-full no-underline text-center md:text-xs xl:text-xs 2xl:text-sm md:px-4 md:py-3 2xl:px-6 2xl:py-4"
                    >
                        + Nuevo {singularName}
                    </Link>
                </div>
            </div>
        </div>
    );
};
export default Card;