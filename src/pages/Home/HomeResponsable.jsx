import React, {useEffect, useState} from "react";

import { useAuth } from '../../context/AuthContext';
import axios from "axios";

import FileUploadPopup from "../../form/UploadFile";
import ShowFile from "../../form/ShowFile";
import { setConflictHandler } from "aws-amplify/in-app-messaging";


const HomeResponsable = ({UserInfo, getUserData, handleCloseMessagePopUp}) => {
    const {role, cognitoId, token, configureAwsCredentials} = useAuth();
    const [loading, setLoading] = useState(false);

    const [showUploadPopup, setShowUploadPopup] = useState(false);
    const [showIMGPopup, setshowIMGPopup] = useState(false);

    const [UserAuditoriaData, setUserAuditoriaData] = useState(null);
    const [selectedControl, setSelectedControl] = useState(null);

    const handleUpload = async (file) => {
        // Aquí va tu lógica de carga de archivos usando S3
    };
    
    const [imgkey, setImgKey] = useState(null);
    const [bucketName, setBucketName] = useState(null);
    const [controlName, setControlName] = useState(null);
    const [messageAdmin, setMessageAdmin] = useState(null);
    const [id_control, setIdControl] = useState(null);
    const [id_auditoria, setIdAuditoria] = useState(null);

    const handleShowIMGPopup = (riesgo) =>{
        setImgKey(riesgo[7])
        setBucketName(`empresa-${riesgo[10]}`)
        setControlName(riesgo[1])
        setMessageAdmin(riesgo[11])
        setIdControl(riesgo[0])
        setIdAuditoria(riesgo[9])
        setshowIMGPopup(true)
    };

    const fetchUserAuditoriaData = async () => {
        try {
            const response = await axios.get("https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getUserAuditoriaData?id_cognito="+cognitoId,
              {headers : {
                'Authorization' : `Bearer ${token}`
              }}
            );
            let data_clean = [];
            data_clean = response.data
            setUserAuditoriaData(data_clean);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
      };
    useEffect(()=>{
        fetchUserAuditoriaData();
    },[])

    return (
        <div className='responsable_home'>
            { UserInfo ? (
                <div className='responsable_main'>
                    <div className='length-responsable'>
                    Controles Asociados: {UserInfo.data.riesgos.length}
                    </div>
                    <div className='card_option'>
                        <div className="table-container">
                        {UserInfo && UserInfo.data && UserInfo.data.riesgos ? (
                            <div>
                                <table className="card_table">
                                    <tr className="table-row">
                                    <th>Número de Control</th>
                                    <th>Nombre</th>
                                    <th>Evidencias</th>
                                    <th>Responsable</th>
                                    <th>Fecha límite</th>
                                    <th>Fecha de creación</th>
                                    <th>Archivos subidos</th>
                                    <th>Estado</th>
                                    </tr>
                                    {UserInfo.data.riesgos.map((riesgo, index) => (
                                    <tr key={index} className="table-row">
                                        {console.log(riesgo)}
                                        <td>{riesgo[1]}</td>
                                        <td>{riesgo[2]}</td>
                                        <td>{riesgo[3]}</td>
                                        <td>{riesgo[4]}</td>
                                        <td>{riesgo[5]}</td>
                                        <td>{riesgo[6]}</td>
                                        <td className='archive_responsable'>
                                        <div className={riesgo[7] === 'None' ? '' : 'archive mx-auto'}>
                                            {riesgo[7] === 'None' ? (
                                                <>
                                                <button className='archive_button' onClick={() => {
                                                        setShowUploadPopup(true);
                                                        setSelectedControl(riesgo);
                                                    }
                                                }>Subir Archivo</button>
                                                <FileUploadPopup
                                                    show={showUploadPopup}
                                                    onClose={() => setShowUploadPopup(false)}
                                                    onUpload={handleUpload}
                                                    selectedControl={selectedControl}
                                                    selectedAuditoria={riesgo[9]}
                                                    userData = {UserAuditoriaData}
                                                    fetchData={getUserData}
                                                />
                                                </>
                                            ) : (
                                                <>
                                                <p onClick={() => handleShowIMGPopup(riesgo)}>{riesgo[7].split('/').slice(1).join('')}</p>
                                                <ShowFile
                                                    show={showIMGPopup}
                                                    onClose={() => setshowIMGPopup(false)}
                                                    imgkey={imgkey} // Pasamos el Key del archivo
                                                    bucketName={bucketName}
                                                    control_name={controlName}
                                                    message_admin= {messageAdmin}
                                                    fetchData={getUserData}
                                                    id_control={id_control}
                                                    id_auditoria={id_auditoria}
                                                />
                                                </>
                                            )}
                                            </div>
                                        </td>
                                        <td className={riesgo[8] === 'Denegado' ? 'text-red-500' : ''}>{riesgo[8] === 'Denegado' ? ('No Validado'): (riesgo[8])}</td>
                                    </tr>
                                    ))}
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
                        <p>Controles Asociados: 
                            <div className='number skeleton' style={{height : '70%', margin: 'auto', width:'50px', borderRadius:'30px'}}></div>
                        </p>
                    </div>
                    <div className='card_option'>
                        <div className="table-container skeleton">
                            <div>
                            <table className="card_table">
                                <tr className="table-row">
                                <th>Número de Control</th>
                                <th>Nombre</th>
                                <th>Evidencias</th>
                                <th>Responsable</th>
                                <th>Fecha límite</th>
                                <th>Fecha de creación</th>
                                <th>Archivos subidos</th>
                                <th>Estado</th>
                                </tr>
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
                            </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
)};

export default HomeResponsable;