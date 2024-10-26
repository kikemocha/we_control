import React from 'react';

const Button = ({ children, onClick, className = '', disabled = false }) => (
  <button
    className={`
      bg-yellow-300 
      ${
      disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-orange-400 cursor-pointer'
    } text-black p-2 rounded-full text-md ${className}`}
    onClick={disabled ? undefined : onClick} // Evita el click si está deshabilitado
    disabled={disabled} // HTML prop para deshabilitar el botón
  >
    {children}
  </button>
);

export default Button;