import React, { useEffect, useState } from 'react';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { useAuth } from '../context/AuthContext';

const S3Image = ({ bucketName, imgkey, token }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [error, setError] = useState(null);
  
    const { awsCredentials } = useAuth();
    useEffect(() => {
        const fetchAwsCredentialsAndImage = async () => {
        try {
            console.log('AWS Credentials:', awsCredentials); // Verifica las credenciales
            console.log('Bucket Name:', bucketName); // Verifica que el nombre del bucket es correcto
            console.log('Key:', imgkey); // Verifica que la clave no esté vacía o sea undefined

            // Paso 2: Configurar el cliente S3
            const s3Client = new S3Client({
            region: 'eu-west-1',
            credentials: {
                accessKeyId: awsCredentials.AccessKeyId,
                secretAccessKey: awsCredentials.SecretAccessKey,
                sessionToken: awsCredentials.SessionToken, // Opcional, si se requiere
            },
            });

            // Paso 3: Obtener la URL firmada de S3
            const command = new GetObjectCommand({ Bucket: bucketName, Key: imgkey });
            const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            
            // Paso 4: Establecer la URL de la imagen
            setImageUrl(url);
        } catch (err) {
            // Si ocurre algún error, establecer el mensaje de error
            setError('No tienes permisos para ver esta imagen o hubo un problema.');
            console.error('Error fetching image from S3:', err);
        }
    };

    fetchAwsCredentialsAndImage();
  }, [bucketName, imgkey, token]);

  if (error) {
    return <p>{error}</p>;
  }

  return imageUrl ? <img src={imageUrl} alt="Imagen desde S3" /> : <p>Cargando imagen...</p>;
};

export default S3Image;
