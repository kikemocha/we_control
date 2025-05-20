import React, { useState, useEffect} from 'react';
import  {useAuth} from "../context/AuthContext"
import FileManager from "../form/FileManager";
import axios from 'axios';

const MisControles = () => {
    const {token, cognitoId, awsCredentials, fetchAwsCredentials} = useAuth();
    const [loading, setLoading] = useState(false);
    const [showUploadPopup, setShowUploadPopup] = useState(false);
    const [showIMGPopup, setshowIMGPopup] = useState(false);
    const [selectedControl, setSelectedControl] = useState({});
    const [UserInfo, setUserInfo] = useState(null);
    const [imgkeys, setImgKeys] = useState(null);
    const [controlName, setControlName] = useState(null);
    const [messageAdmin, setMessageAdmin] = useState(null);
    const [id_control, setIdControl] = useState(null);
    const [id_auditoria, setIdAuditoria] = useState(null);
    const [orderControl, setOrderControl] = useState(null);

    
    const fetchUserData = async () => {
        try {
        setLoading(true)
        const response = await axios.get(
            'https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getUserData',
            {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                id_cognito: cognitoId,
                getControles: 'token'
            }
            }
        )
        setUserInfo(response.data)
        } catch (error) {
        console.error('Error fetching data:', error.response?.data || error.message)
        } finally {
        setLoading(false)
        }
    }

    useEffect(() => {
        // fetch both AWS creds and user data
        const loadAll = async () => {
        setLoading(true)
        await Promise.all([
            fetchUserData(),
            (async () => {
            if (!awsCredentials || !Object.keys(awsCredentials).length) {
                try {
                await fetchAwsCredentials(token)
                } catch (e) {
                console.error('AWS creds error', e)
                }
            }
            })()
        ])
        setLoading(false)
        }
        loadAll()
    }, [cognitoId, token, awsCredentials, fetchAwsCredentials])

    if (loading || !awsCredentials || !UserInfo) {
        return <div>Loading…</div>;
    }
    

    const handleShowIMGPopup = (riesgo, archivos) =>{
        setImgKeys(archivos)
        setControlName(riesgo[1])
        setMessageAdmin(riesgo[10])
        setIdControl(riesgo[0])
        setIdAuditoria(riesgo[9])
        setOrderControl(riesgo[11])
        setshowIMGPopup(true)
    };

    if (loading || !awsCredentials) {
        return <div className='responsable_main'>
        <div className='length-responsable'>
            <div>Controles Asociados: 
                <p className='number skeleton' style={{height : '70%', margin: 'auto', width:'50px', borderRadius:'30px'}}></p>
            </div>
        </div>
        <div className='card_option'>
            <div className="table-container skeleton">
                <div>
                <table className="card_table">
                    <thead>
                        <tr className="table-row">
                        <th>Número de Control</th>
                        <th>Nombre</th>
                        <th>Evidencias</th>
                        <th>Responsable</th>
                        <th>Fecha límite</th>
                        <th>Fecha de evidencias</th>
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
                            <td></td>
                        </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    </div>
    }


    return (
        <div className='responsable_home'>
            { UserInfo ? (
                <div className='w-full max-w-[90%] h-full'>
                    <div className='mb-6'>
                    Controles Asociados: {UserInfo.data.riesgos.length}
                    </div>
                    <div className='card_option h-full'>
                    <div className="table-container overflow-y-auto max-h-[70vh] p-">
                        {UserInfo && UserInfo.data && UserInfo.data.riesgos ? (
                            <div>
                            <table className="card_table">
                                <thead>
                                <tr className="table-row">
                                    <th>Número de Control</th>
                                    <th>Periodicidad</th>
                                    <th>Nombre</th>
                                    <th>Evidencias</th>
                                    <th>Responsable</th>
                                    <th>Fecha límite</th>
                                    <th>Última Modificación</th>
                                    <th>Archivos subidos</th>
                                    <th>Estado</th>
                                </tr>
                                </thead>
                                <tbody>
                                {UserInfo.data.riesgos.map((riesgo, index) => (
                                    <tr key={index} className="table-row">
                                        <td>{riesgo[1]}-{riesgo[11]}</td>
                                        <td>{riesgo[12]}</td>
                                        <td>{riesgo[2]}</td>
                                        <td>{riesgo[3]}</td>
                                        <td>{riesgo[4]}</td>
                                        <td>{riesgo[5] === 'None' ? '---' : riesgo[5]}</td>
                                        <td>{riesgo[6] === 'None' ? '---' : riesgo[6]}</td>
                                        <td className="archive_responsable">
                                        {(() => {
                                            const archivosStr = riesgo[7];
                                            const archivos = archivosStr && archivosStr !== 'None'
                                            ? archivosStr.split(',')
                                            : [];

 
                                            if (archivos.length === 0) {
                                                return (
                                                    <div>
                                                    <button
                                                        className="archive_button"
                                                        onClick={() => {
                                                        setShowUploadPopup(true);
                                                        setSelectedControl(riesgo);
                                                        console.log(riesgo)
                                                        }}
                                                    >
                                                        Subir Archivo
                                                    </button>
                                                    <FileManager
                                                        show={showUploadPopup}
                                                        onClose={() => setShowUploadPopup(false)}
                                                        fetchData={fetchUserData}
                                                        data={{
                                                            "id_control" : selectedControl[0],
                                                            "id_auditoria" : selectedControl[9],
                                                            "order" : selectedControl[11],
                                                            "archives" : [],
                                                            "id_user" : selectedControl[13]
                                                        }}
                                                        className={'bg-opacity-5'}
                                                    />
                                                    </div>
                                                );
                                            }
                                            return (
                                            <div className="archive mx-auto">
                                                <p
                                                onClick={() => handleShowIMGPopup(riesgo, archivos)}
                                                style={{ cursor: 'pointer' }}
                                                >
                                                {archivos.length === 1
                                                    ? '1 Archivo Subido'
                                                    : `${archivos.length} Archivos Subidos`}
                                                </p>
                                            </div>
                                            );
                                        })()}
                                        </td>

                                        <td className={riesgo[8] === 'Denegado' ? 'text-red-500' : ''}>
                                            {riesgo[8] === 'Denegado' ? 'No Validado' : riesgo[8]}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            </div>
                        ) : (
                            <div>No hay información disponible</div>
                        )}
                        </div>
                    </div>
                </div>
            ):(
                <div className='responsable_main'>
                    <div className='length-responsable'>
                        <div>Controles Asociados: 
                            <p className='number skeleton' style={{height : '70%', margin: 'auto', width:'50px', borderRadius:'30px'}}></p>
                        </div>
                    </div>
                    <div className='card_option'>
                        <div className="table-container skeleton">
                            <div>
                            <table className="card_table">
                                <thead>
                                    <tr className="table-row">
                                    <th>Número de Control</th>
                                    <th>Nombre</th>
                                    <th>Evidencias</th>
                                    <th>Responsable</th>
                                    <th>Fecha límite</th>
                                    <th>Fecha de evidencias</th>
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
                                        <td></td>
                                    </tr>
                                    ))}
                                </tbody>
                            </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showIMGPopup && (
                <FileManager
                    show={showIMGPopup}
                    onClose={() => setshowIMGPopup(false)}
                    fetchData={fetchUserData}
                    data={{
                        "archives" : imgkeys,
                        "control_name" : controlName,
                        "message_admin" : messageAdmin,
                        "id_control" : id_control,
                        "id_auditoria" : id_auditoria,
                        "order" : orderControl
                    }}
                />
            )}
            </div>
)
};

export default MisControles;
