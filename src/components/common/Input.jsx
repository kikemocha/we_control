import React from 'react';

const Input = ({ label, type, name, value, onChange, required = false, step = false, className = '', placeholder = '', disabled = false}) => (
  <div className="relative z-0 w-full mb-5 group">
    {/* Input field */}
    <input
      step={step}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      placeholder=" "
      className={`${disabled ? 'bg-gray-100 text-gray-600' : 'bg-transparent text-black'} rounded block py-2.5 px-2 w-full text-lg   border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-yellow-300 peer ${className}`}
    />
    {/* Label that "floats" */}
    <div className=" flex peer-focus:font-medium absolute text-lg text-gray-800 duration-300 transform -translate-y-9 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
      <label
        htmlFor={name}
        >
        {label}
      </label>
      <p className='text-gray-500 ml-5'>{placeholder}</p>
    </div>
    
  </div>
);

export default Input;