import React, { useState, useRef, useEffect } from 'react';
import { DeleteObjectCommand, PutObjectCommand, GetObjectCommand} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const MAX_SIMPLE_UPLOAD_SIZE = 5 * 1024 ** 3;

const FileUpload = ({data, onClose}) => {
  const { token, userData, s3Client, awsCredentials, expirationTime, refreshAccessToken } = useAuth();
  const [archives, setArchives] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeSkewError, setTimeSkewError] = useState(null);

  const [fileProgress, setFileProgress] = useState({});
  
  const fileInputRef = useRef(null);

  useEffect(()=>{
    if(archives.length !== 0 & uploadError === 'Por favor, selecciona un archivo primero.'){
      setUploadError('');
    }
  },[archives])

  const getPresignedDownloadUrl = async ({key, expiresIn = 3600 }) => {
    const command = new GetObjectCommand({
      Bucket: 'wecontrolbucket',
      Key: key,
    });
  
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  };

  useEffect(() => {
    if (Array.isArray(data.archives)) {
      setArchives(
        data.archives.map(key => ({ key }))
      );
    }

    if (data.archives.length === 1) {
      const fileKey = data.archives[0];
      if (fileKey && fileKey.endsWith('.pdf')) {
        const fetchFileUrl = async () => {
          try {
            console.log('Archivo clave:', fileKey);
            const fileUrl = await getPresignedDownloadUrl({key:fileKey});
            setPreviewUrl(fileUrl);  // Establecer la URL del archivo PDF
          } catch (error) {
            console.error('Error obteniendo la presigned URL:', error);
            alert('Hubo un error al generar la URL para descargar el archivo');
          }
        };
        fetchFileUrl();
      }
    }
  }, [data.archives]);

  const sanitizeFileName = (name) => {
    return name
      .normalize('NFD')
      .replace(/[^\w.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
  };

  const getFileKey = (file) => {
    const despachoId = userData.despacho_id;
    const empresaId = userData.belongs_to;
    const userId = userData.id;
    const pathPrefix = `${despachoId}/${empresaId}/${userId}`;
    const originalName = file.name;
    const fileExtension = originalName.substring(originalName.lastIndexOf('.') + 1);
    const baseFileName = originalName.substring(0, originalName.lastIndexOf('.'));
    const uniqueId = uuidv4();
    const cleanFileName = sanitizeFileName(baseFileName);
    const maxLength = 255;
    const totalFixedLength = pathPrefix.length + 1 + uniqueId.length + 1 + fileExtension.length + 1;
    const availableLength = maxLength - totalFixedLength;
    const truncatedFileName = cleanFileName.substring(0, availableLength);
    const fileKey = `${pathPrefix}/${uniqueId}_${truncatedFileName}.${fileExtension}`;
    return fileKey;
  };


  const handleFileChange = async e => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setLoading(true);
    if ( archives.length === 0 && files.length === 1 && files[0].type === 'application/pdf'){
      const file = files[0];
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
    for (const file of files) {
      const key = getFileKey(file);
      setArchives(old => [...old, { key }])
      setFileProgress(fp => ({ ...fp, [key]: 0 }))
      try {
        await uploadOne({ file, key });
      } catch (err) {
        console.error(`Error subiendo ${file.name}:`, err);
        setUploadError(`Error al subir ${file.name}`);
      }
    }
    setLoading(false);  
    e.target.value = null;
  };

  const handleDrop = e => {
    e.preventDefault();
    handleFileChange({ target: { files: e.dataTransfer.files } });
  };

  const handleClickAddFile = () => {
    fileInputRef.current.click();
  };


  const uploadOne = async ({ file, key }) => {
    if (!awsCredentials?.AccessKeyId) {
      await refreshAccessToken();
      if (!awsCredentials?.AccessKeyId) throw new Error('No AWS creds');
    }
    try{
      if (file.size <= MAX_SIMPLE_UPLOAD_SIZE) {

        const arrayBuffer = await file.arrayBuffer();

        const cmd = new PutObjectCommand({
          Bucket: "wecontrolbucket",
          Key: key,
          ContentType: file.type
        });
        const signedUrl = await getSignedUrl(s3Client, cmd, { expiresIn: 3600 });
        await axios.put(signedUrl, file, {
          headers: { "Content-Type": file.type },
          onUploadProgress: evt => {
            const pct = Math.round((evt.loaded / evt.total) * 100);
            setFileProgress(fp => ({ ...fp, [key]: pct }));
          }
      }); 
      } else {
        console.log(`${key} demasiado largo para PutObject`);
      }
    } catch(e){
      console.log('Error: ',e);
    }
    
  

    const body = {
      id_control: data.id_control,
      id_auditoria: data.id_auditoria,
      archive: key,
      order: data.order,
    };
    console.log('SUBE: ',body);
    const res = await fetch(
      'https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/UpdateControlAuditoria',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) throw new Error('API error');
  };

  const handleDeleteFile = async (index, key) => {
    if (!window.confirm('¿Seguro que quieres eliminar este archivo?')) return;
    setLoading(true);
    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: 'wecontrolbucket',
          Key: key
        })
      );

      const body = {
        id_control: data.id_control,
        id_auditoria: data.id_auditoria,
        order: data.order,
        archiveKey: key
      };
      const res = await fetch(
        'https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/deleteFile',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(body)
        }
      );
      if (!res.ok) console.error('Error en API deleteFile');
      setArchives(prev => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error('Error eliminando archivo:', err);
      alert('Error eliminando archivo');
    } finally {
      setLoading(false);
    }
  };


  if (timeSkewError) {
    return (
      <div className="popup-overlay">
        <div className="popup_img p-4 bg-yellow-100 text-yellow-800 rounded text-center">
          {timeSkewError}
          <button onClick={onClose} className="mt-4 popup-button">Cerrar</button>
        </div>
      </div>
    );
  }

  return (
  <div className='h-full w-full'>
    <div className="h-full w-full px-6 flex flex-col">
      <h4 className='text-xl font-bold mt-8 text-center'>Subir Archivo</h4>
      {!archives || archives.length === 0 ? (
        <div
          className="flex items-center justify-center w-full h-3/4 mt-5"
          onClick={handleClickAddFile}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            border: '2px dashed gray',
            borderRadius: '8px',
            padding: '1rem',
            backgroundColor: '#f9f9f9',
            cursor: 'pointer'
          }}
        >
          <div className="flex flex-col items-center justify-center">
            <svg className="w-8 h-8 mb-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click para subir</span> o arrastra un archivo
            </p>
            <p className="text-xs text-gray-500">PDFs aceptados</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      ) : archives.length === 1 && previewUrl ? (
        // Un solo archivo: mostrar preview con botón para agregar más
        <div className="pt-6 h-full w-full flex flex-col">
          <iframe
            src={previewUrl}
            title="Vista previa del PDF"
            width="100%"
            height="90%"
            className='rounded-3xl border-2 border-solid border-gray-300'
          ></iframe>
          <div className="flex flex-col justify-center items-center mt-5">
            <button className="h-10 w-10 rounded-full bg-primary text-xl font-bold" onClick={handleClickAddFile}>
              +
            </button>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="size-12 text-red-600 cursor-pointer absolute right-12 bottom-24"
            onClick={() => handleDeleteFile(0, archives[0].key)}
            >
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </div>
      ) : (
        <div className='h-full w-full'>
          <div className='h-[80%] w-full relative pt-12'>
            <div className='pointer-events-none absolute bottom-0 h-10 left-0 z-10  w-full bg-gradient-to-t from-white to-transparent'></div>
            <div className='overflow-auto h-full'>
              <ul className='px-24 pb-12'>
                {archives.map(({ key, file }, index) => {
                  const pct = fileProgress[key] ?? 0;
                  return (
                    <li key={key} className='bg-gray-400 bg-opacity-35 w-[90%] mx-auto h-20 my-4 rounded-xl relative'>
                    <div
                      className={`absolute bottom-0 left-0 h-2 rounded-b-xl transition-all duration-200 ${
                        pct === 100 ? 'bg-green-500' : 'bg-primary'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                    <div className='h-full relative flex'>
                      <p
                        className='text-blue-700 underline cursor-pointer my-auto mx-auto overflow-hidden text-ellipsis px-12'
                        onClick={async () => {
                          try {
                            const url = await getPresignedDownloadUrl({ key });
                            window.open(url, '_blank');
                          } catch (error) {
                            console.error('Error obteniendo la presigned URL:', error);
                            alert('Hubo un error al generar la URL para descargar el archivo');
                          }
                        }}
                      >
                        {key.split('_').slice(1).join('_')}
                      </p>
                      
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="size-6 text-red-600 cursor-pointer absolute right-4 bottom-7"
                        onClick={() => handleDeleteFile(index, key)}
                        >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                      
                    </div>
                  </li> 
                  )
                })}
              </ul>
            </div>
            <div className="absolute flex justify-center mt-10 right-1/2">
              <button className={`h-10 w-10 rounded-full ${loading? 'bg-gray-300 cursor-default' : 'bg-primary cursor-pointer'} text-xl font-bold`} onClick={handleClickAddFile}>
                {loading
                  ? (
                    <div role="status" className='h-full w-full flex items-center justify-center'>
                        <svg aria-hidden="true" className="w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-primary" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                        </svg>
                        <span className="sr-only">Loading...</span>
                    </div>
                  )
                  : '+'
                }
              </button>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>
      )}
      {uploadError && <div style={{ color: 'red' }}>{uploadError}</div>}
    </div>
  </div>
  );
};

export default FileUpload;
