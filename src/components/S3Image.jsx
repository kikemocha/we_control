import React, { useEffect, useState } from 'react';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { useAuth } from '../context/AuthContext';

const S3Image = ({ imgkey, className }) => {
  const {token, s3Client} = useAuth()
  const bucketName = 'wecontrolbucket';
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const { awsCredentials } = useAuth();

  useEffect(() => {
    const fetchAwsCredentialsAndImage = async () => {
      try {
        // Paso 3: Obtener la URL firmada de S3
        const command = new GetObjectCommand({ Bucket: bucketName, Key: imgkey});
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        
        // Paso 4: Establecer la URL de la imagen
        setImageUrl(url);
        
      } catch (err) {
        setError('No tienes permisos para ver esta imagen o hubo un problema.');
        console.error('Error fetching image from S3:', err);
      } finally{
        setLoading(false);  
      }
    };

    fetchAwsCredentialsAndImage();
  }, [bucketName, imgkey, token, awsCredentials]);

  if (!s3Client) return <p>Cargando configuración de S3...</p>;
  if (!imgkey) return <p>No hay imagen para mostrar.</p>;
  if (error) return <p>{error}</p>;
  if (loading) return <div className="skeleton w-full h-full"></div>;

  const isPdf = imgkey.toLowerCase().endsWith('.pdf');
  console.log('URL: ', imageUrl)
  return isPdf ? (
    <iframe src={imageUrl} title="PDF desde S3" className={`${className} w-full h-full`} />
  ) : (
    <img src={imageUrl} alt="Imagen desde S3" className={`${className} object-contain w-full h-full`} />
  );
};

export default S3Image;
