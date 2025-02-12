// src/pages/Responsables.js
import {React, useState, useEffect} from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ResponsablesForm from '../form/ResponsablesForm';


const Responsables = () => {
    const {selectedEmpresa, token, searchQuery} = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showPopup, setShowPopup] = useState(false);
    const handleOpenPopup = () => setShowPopup(true);
    const handleClosePopup = () => setShowPopup(false);


    const fetchData = async () => {
        try {
            const response = await axios.get("https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getResponsablesData?id_empresa="+selectedEmpresa,
                {headers : {
                    'Authorization' : `Bearer ${token}`
                }}
            );
            let data_clean = [];
            data_clean = response.data
            console.log('getResponsablesData: ',data_clean)
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
    

    const filteredResponsables = data.filter((responsable) =>
        responsable.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        responsable.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        responsable.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        responsable.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    
    if (loading) {
        return <div className='card_option'>
                    <div className='total_add'>
                        <div className='upper_box'>
                            <div className='text'>Total de&nbsp;<strong>responsables</strong>:</div>
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
                                        <th>Teléfono</th>
                                        <th>Título</th>
                                        <th>E-mail</th>
                                        <th>Controles Asignados</th>
                                        <th>Ajustes</th>
                                    </tr>
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
                                </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
    }

    return <div className='card_option'>
            <ResponsablesForm show={showPopup} onClose={handleClosePopup} fetchData={fetchData}/>
            <div className='total_add'>
                <div className='upper_box'>
                    <div className='text'>Total de&nbsp;<strong>responsables</strong>:</div>
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
                                    <th>Nombre</th>
                                    <th>Apellido</th>
                                    <th>Teléfono</th>
                                    <th>Título</th>
                                    <th>E-mail</th>
                                    <th>Controles Asignados</th>
                                    {/* <th>Ajustes</th> */}
                                </tr>
                                {filteredResponsables.map((responsable, index) => (
                                    <tr key={index} className="table-row">
                                        <td>{responsable.name}</td>
                                        <td>{responsable.surname}</td>
                                        <td>{responsable.phone}</td>
                                        <td>{responsable.role}</td>
                                        <td>{responsable.email}</td>
                                        <td>{responsable.cuenta}</td>
                                        {/* <td className='flex align-middle justify-center'>
                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                height="2.5em"
                                                width="2.5em"
                                                >
                                                <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                            </svg>
                                        </td> */}
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
