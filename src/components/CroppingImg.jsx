import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "../context/AuthContext";

// Función para obtener el blob de la imagen recortada
const getCroppedImgBlob = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => {
    image.onload = resolve;
  });
  const canvas = document.createElement("canvas");
  const diameter = pixelCrop.width; // Asumimos un recorte cuadrado para la forma circular
  canvas.width = diameter;
  canvas.height = diameter;
  const ctx = canvas.getContext("2d");

  // Crear una región circular
  ctx.beginPath();
  ctx.arc(diameter / 2, diameter / 2, diameter / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  // Dibujar la imagen recortada en el canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    diameter,
    diameter,
    0,
    0,
    diameter,
    diameter
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      blob.name = "cropped.jpeg";
      resolve(blob);
    }, "image/jpeg");
  });
};

// Función para subir la imagen recortada a S3
async function uploadCroppedImageToS3(croppedBlob, awsCredentials, userData) {
    const s3Client = new S3Client({
        region: "eu-west-1",
        credentials: {
        accessKeyId: awsCredentials.AccessKeyId,
        secretAccessKey: awsCredentials.SecretAccessKey,
        sessionToken: awsCredentials.SessionToken,
        },
    });
    console.log(userData)
    const bucketName = "empresa-" + userData.belongs_to; // Ajusta según tu lógica
    const uuid = uuidv4();
    const fileKey = `${userData.name.split(" ")[0]}/${uuid}_cropped.jpeg`;
    const params = {
        Bucket: bucketName,
        Key: fileKey,
        Body: croppedBlob,
        ContentType: croppedBlob.type,
    };
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return fileKey;
}

export default function PhotoPopup({ show = false, setShow, img = null, setImg }) {
  const { awsCredentials, userData } = useAuth();
  const [imageSrc, setImageSrc] = useState(null);
  const [cropping, setCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Maneja la selección de un archivo de imagen
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result);
        setCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  // Aplica el recorte, sube la imagen croppeada a S3 y actualiza el estado
  const showCropComplete = async () => {
    try {
      const croppedBlob = await getCroppedImgBlob(imageSrc, croppedAreaPixels);
      const fileKey = await uploadCroppedImageToS3(croppedBlob, awsCredentials, userData);
      setImg(fileKey); // O guarda la URL resultante según tu implementación
      setCropping(false);
      setImageSrc(null);
      setShow(false);
    } catch (error) {
      console.error(error);
    }
  };

  // Elimina la imagen
  const handleDelete = () => {
    setImg(null);
    setShow(false);
  };

  // Al hacer clic fuera, se limpia la imagen seleccionada
  const handleOverlayClick = () => {
    setImageSrc(null);
    setCropping(false);
    setShow(false);
  };

  return (
    <>
      {show && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleOverlayClick}
        >
          <div
            className="w-1/3 h-3/5 bg-white rounded-3xl shadow-xl p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {img && !cropping ? (
              <div className="flex flex-col items-center">
                <img
                  src={img}
                  alt="User"
                  className="w-40 h-40 rounded-full object-cover mb-4"
                />
                <button
                  className="mb-2 px-4 py-2 bg-red-500 text-white rounded flex items-center gap-2"
                  onClick={handleDelete}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                  Borrar Imagen
                </button>
                <label className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded">
                  Cambiar Imagen
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            ) : (
              <>
                {cropping && imageSrc ? (
                  <div className="relative w-full h-full">
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      cropShape="round"
                      showGrid={false}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                      <button
                        className="px-4 py-2 bg-green-500 text-white rounded"
                        onClick={showCropComplete}
                      >
                        Recortar Imagen
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <label className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded">
                      Subir Imagen
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
