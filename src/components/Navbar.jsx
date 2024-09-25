// src/components/Navbar.js
import React from 'react';
import './Layout.css';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { name, surname, profileImg } = useAuth();

    return (
        <div className="navbar">
            <div className="search-container">
                <input type="text" placeholder="Buscar controles, riesgos, responsables, auditorías" />
                <svg className='search-icon' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>

            </div>
            <div className="user-info">
                { profileImg ? (
                    <div> img </div>
                ): (
                    <div class="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden rounded-full bg-gray-600">
                        <span class="text-sm font-medium text-white">{name[0].toUpperCase()}{surname[0].toUpperCase()}</span>
                    </div>
                )}
                
                <div>{name}</div>
            </div>
        </div>
    );
};

export default Navbar;
