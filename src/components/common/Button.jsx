// src/components/common/Button.jsx
import React from 'react';

const Button = ({ children, onClick, className = '' }) => (
  <button className={`bg-blue-500 hover:bg-blue-600 text-black p-2 rounded ${className}`} onClick={onClick}>
    {children}
  </button>
);

export default Button;
