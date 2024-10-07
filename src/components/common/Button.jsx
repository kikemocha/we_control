// src/components/common/Button.jsx
import React from 'react';

const Button = ({ children, onClick, className = '' }) => (
  <button className={`bg-yellow-300 hover:bg-orange-400 text-black p-2 rounded-full text-md ${className} `} onClick={onClick}>
    {children}
  </button>
);

export default Button;
