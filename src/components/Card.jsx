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

    const [selectedYear, setSelectedYear] = useState(null);

    useEffect(() => {
        if (selectedEmpresa) {
          axios
            .get(
              "https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getYears/",
              { headers: { Authorization: `Bearer ${token}` } }
            )
            .then((response) => {
              // La API devuelve: [{"id_year": 1, "value": "2023"}, {"id_year": 2, "value": "2024"}, {"id_year": 3, "value": "2025"}]
              const yearsArray = response.data;
              if (Array.isArray(yearsArray) && yearsArray.length > 0) {
                const maxYearObj = yearsArray.reduce((prev, curr) =>
                  parseInt(prev.value, 10) > parseInt(curr.value, 10) ? prev : curr
                );
                setSelectedYear(maxYearObj.id_year);
              }
            })
            .catch((err) => console.error("Error fetching years:", err));
        }
      }, [selectedEmpresa, token]);
      

    useEffect(() => {
        if (!selectedEmpresa || !selectedYear) return;
        setLoading(true);
        const fetchData = async () => {
            
            try {
                const response = await axios.get(
                    `${apiURL}${selectedEmpresa}&id_year=${selectedYear}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
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
    }, [apiURL, selectedEmpresa, selectedYear, name, token]);

    if (loading) {
        return (
            <div className="card_main relative">
            <span>
              <h3>{name}</h3>
            </span>
            <div className={`card_content ${loading ? 'bg-gray-400 bg-opacity-70' : ''}`}>
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
      
            {/* Mostrar el spinner si está cargando */}
            {loading && (
              <div className="absolute rounded-3xl top-0 left-0 w-full h-full bg-gray-400 bg-opacity-70 flex justify-center items-center z-10">
                <div role="status">
                  <svg aria-hidden="true" className="inline w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-yellow-400" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                  </svg>
                </div>
              </div>
            )}
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
                                        <p className="text-center mx-auto">{cell}</p>
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