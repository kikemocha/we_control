// src/components/Navbar.js
import React, {useState, useRef, useEffect } from 'react';
import './Layout.css';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { name, role, surname, profileImg, expirationTime, signOut } = useAuth();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [categorySelected, setcategorySelected ] = useState('Todas las Categorías')

    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    }
    const closeDropdown = (category) => {
        setcategorySelected(category);
        setIsDropdownOpen(false);
      };

    useEffect(() =>{
        if (role === 'responsable'){
            setcategorySelected('Controles')    
        }
    }, [categorySelected])
    
    useEffect(() => {
        const handleClickOutside = (event) => {
          // Si el clic ocurre fuera del dropdownRef, cierra el dropdown
          if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsDropdownOpen(false);
          }
        };  
        // Agregar el evento click al document
        document.addEventListener('mousedown', handleClickOutside);

        // Limpiar el evento cuando el componente se desmonta
        return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);


    return (
        <div className="navbar">
            <div className='w-1/2'>
                <form className="w-full mx-auto relative">
                    <div className="flex md:h-3 lg:h-6 xl:h-8 h-full">

                        <div className="relative w-full ">
                            <input
                            type="search"
                            id="search-dropdown"
                            className="block md:h-3 lg:h-6 xl:h-8 2xl:h-12 py-2.5 px-6  w-full z-20 lg:text-xxs lg:text-xs xl:text-sm 2xl:text-md  text-gray-900 bg-gray-50 rounded-s-full focus:border-none focus:ring-none"
                            placeholder={categorySelected === 'Todas las Categorías' ? ("Busca Riesgos, Controles, Gestores, Auditorías...") : (`Buscar ${categorySelected}`)}
                            required
                            />
                        </div>
                        <button
                            id="dropdown-button"
                            // Si el role no es "responsable", habilitamos el evento onClick
                            onClick={role !== 'responsable' ? toggleDropdown : null}
                            className={`xl:h-8 2xl:h-12 flex-shrink-0 z-10 w-56 inline-flex items-center py-2.5 px-4 lg:text-xs xl:text-sm 2xl:text-md font-medium text-center text-gray-900 bg-yellow-100 rounded-e-full ${
                                role !== 'responsable' ? 'hover:bg-orange-400 focus:ring-2 focus:outline-none focus:ring-orange-300 cursor-pointer' : 'cursor-default'
                            }`}
                            type="button"
                            style={{
                                cursor: role === 'responsable' ? 'default' : 'pointer'  // Cambia el cursor dependiendo del rol
                            }}
                        >
                            <p className='w-full'>{categorySelected}</p>
                            {role !== 'responsable' && (
                                <svg
                                    className="w-2.5 h-2.5 ms-2.5"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 10 6"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="m1 1 4 4 4-4"
                                    />
                                </svg>
                            )}
                        </button>
                        {role !== 'responsable' ? (
                            <div
                            ref={dropdownRef}
                            id="dropdown"
                            className={` z-10 top-12 right-0 ${isDropdownOpen ? 'absolute' : 'hidden'} bg-white divide-y divide-gray-100 rounded-lg shadow w-48`}
                        >
                            
                            <ul className="py-2 text-sm text-black" aria-labelledby="dropdown-button">
                            <li>
                                <button 
                                    type="button" 
                                    className={`inline-flex w-full px-4 py-2 mr-1 mb-2 rounded ${categorySelected === 'Todas las Categorías' ? 'bg-gray-400 text-white' : 'hover:bg-gray-700 hover:text-white'}`} 
                                    onClick={() => closeDropdown('Todas las Categorías')} >
                                    <p className='text-center w-full'>Todas las Categorías</p>
                                </button>
                            </li>
                            <li>
                                <button 
                                    type="button" 
                                    className={`inline-flex w-full px-4 py-2 mr-1 mb-2 rounded ${categorySelected === 'Riesgos' ? 'bg-gray-400 text-white' : 'hover:bg-gray-700 hover:text-white'}`} 
                                    onClick={() => closeDropdown('Riesgos')}>
                                    <p className='text-center w-full'>Riesgos</p>
                                </button>
                            </li>
                            <li>
                                <button 
                                    type="button" 
                                    className={`inline-flex w-full px-4 py-2 mr-1 mb-2 rounded ${categorySelected === 'Controles' ? 'bg-gray-400 text-white' : 'hover:bg-gray-700 hover:text-white'}`} 
                                    onClick={() => closeDropdown('Controles')}>
                                    <p className='text-center w-full'>Controles</p>
                                </button>
                            </li>
                            <li>
                                <button 
                                    type="button" 
                                    className={`inline-flex w-full px-4 py-2 mr-1 mb-2 rounded ${categorySelected === 'Gestores' ? 'bg-gray-400 text-white' : 'hover:bg-gray-700 hover:text-white'}`} 
                                    onClick={() => closeDropdown('Gestores')}>
                                    <p className='text-center w-full'>Gestores</p>
                                </button>
                            </li>
                            <li>
                                <button 
                                    type="button" 
                                    className={`inline-flex w-full px-4 py-2 mr-1 rounded ${categorySelected === 'Auditorías y Seguimientos' ? 'bg-gray-400 text-white' : 'hover:bg-gray-700 hover:text-white'}`} 
                                    onClick={() => closeDropdown('Auditorías y Seguimientos')}>
                                <p className='text-center w-full'>Auditorías y Seguimientos</p>
                                </button>
                            </li>
                            </ul>
                        </div>
                        ): (
                            <div></div>
                        )}
                        
                    </div>
                </form>
            </div>

            <div className="user-info">
                { profileImg && profileImg !== 'null'? (
                    <div> {profileImg} </div>
                ): (
                    <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden rounded-full bg-gray-600">
                        <span className="text-sm font-medium text-white">
                                {name && surname ? name[0].toUpperCase() + surname[0].toUpperCase() : ''}
                            </span>
                    </div>
                )}
                
                <div>{name}</div>
            </div>
        </div>
    );
};

export default Navbar;
