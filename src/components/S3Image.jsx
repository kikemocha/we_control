import React, { useEffect, useState } from 'react';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { useAuth } from '../context/AuthContext';

const S3Image = ({ bucketName, imgkey, token }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const { awsCredentials } = useAuth();

  useEffect(() => {
    const fetchAwsCredentialsAndImage = async () => {
      try {
        // console.log('AWS Credentials:', awsCredentials); 
        // console.log('Bucket Name:', bucketName); 
        // console.log('Key:', imgkey); 

        // Paso 2: Configurar el cliente S3
        const s3Client = new S3Client({
          region: 'eu-west-1',
          credentials: {
            accessKeyId: awsCredentials.AccessKeyId,
            secretAccessKey: awsCredentials.SecretAccessKey,
            sessionToken: awsCredentials.SessionToken,
          },
        });

        const encodedImgKey = encodeURIComponent(imgkey);

        // Paso 3: Obtener la URL firmada de S3
        const command = new GetObjectCommand({ Bucket: bucketName, Key: imgkey , ResponseContentType: 'application/pdf'});
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        
        // Paso 4: Establecer la URL de la imagen
        setImageUrl(url);
        setLoading(false);
      } catch (err) {
        setError('No tienes permisos para ver esta imagen o hubo un problema.');
        console.error('Error fetching image from S3:', err);
      }
    };

    fetchAwsCredentialsAndImage();
  }, [bucketName, imgkey, token, awsCredentials]);

  if (error) {
    return <p>{error}</p>;
  }

  if (loading) {
    return <p>Cargando imagen...</p>; // Puedes reemplazarlo con un spinner si prefieres
  }

  return imageUrl ? <iframe src={imageUrl} title="PDF desde S3" width="100%" height="600px"></iframe> : <p>Cargando imagen...</p>;
};

export default S3Image;
