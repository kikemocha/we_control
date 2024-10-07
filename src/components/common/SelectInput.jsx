import React from 'react';

const SelectInput = ({ label, name, value, onChange, required = false, options = [], className = '', defaultOption = 'Selecciona una opción' }) => (
  <div className="relative z-0 w-full mb-5 group">
    {/* Select field */}
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={`block py-2.5 px-0 w-full text-lg text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-yellow-300 peer ${className}`}
    >
      {/* Default option */}
      <option value="" disabled>{defaultOption}</option>
      
      {/* Render dynamic options */}
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    
    {/* Label that "floats" */}
    <label
      htmlFor={name}
      className="peer-focus:font-medium absolute text-lg text-gray-800 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
    >
      {label}
    </label>
  </div>
);

export default SelectInput;
