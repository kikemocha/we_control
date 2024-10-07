import React from 'react';

const CircularProgress = ({ value }) => {
  // Asegurar que el valor esté entre 0 y 1
  const safeValue = Math.min(Math.max(value, 0), 1);
  
  // Calcular el porcentaje
  const percentage = safeValue * 100;
  
  // Radio del círculo y cálculo de la circunferencia
  const radius = 35;
  const circumference = 2 * Math.PI * radius;

  // Calcular el dashoffset en base al porcentaje
  const dashoffset = circumference - (circumference * percentage) / 100;

  return (
    <div className="flex justify-center items-center">
      <svg className="w-24 h-24">
        {/* Círculo de fondo */}
        <circle
          className="text-gray-300"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50%"
          cy="50%"
        />
        {/* Círculo de progreso */}
        <circle
          className="text-blue-500"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50%"
          cy="50%"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }} // Animación
        />
        {/* Texto del porcentaje */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy=".3em"
          className="text-xl font-bold text-blue-500"
        >
          {Math.round(percentage)}%
        </text>
      </svg>
    </div>
  );
};

export default CircularProgress;
