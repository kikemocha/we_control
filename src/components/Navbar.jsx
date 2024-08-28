// src/components/Navbar.js
import React from 'react';
import './Layout.css';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { name } = useAuth();

    return (
        <div className="navbar">
            <div className="search-container">
                <input type="text" placeholder="Buscar controles, riesgos, responsables, auditorías" />
                <svg className='search-icon' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>

            </div>
            <div className="user-info">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="User" />
                <div>{name}</div>
            </div>
        </div>
    );
};

export default Navbar;
