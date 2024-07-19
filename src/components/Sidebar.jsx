// src/components/Sidebar.js
import React from 'react';
import { Link , useLocation } from 'react-router-dom';
import logo from '../we_control.png'

import './Layout.css';

const Sidebar = () => {

    const location = useLocation();

    return (
        <div className="sidebar">
            <Link to="/" ><img className='logo_sidebar' src={logo} alt="" /></Link>
            <ul>
                <li className={location.pathname === '/riesgos' ? 'link_activate' : ''}><Link to="/riesgos">Riesgos</Link></li>
                <li className={location.pathname === '/controles' ? 'link_activate' : ''}><Link to="/controles">Controles</Link></li>
                <li className={location.pathname === '/gestores' ? 'link_activate' : ''}><Link to="/gestores">Gestores</Link></li>
                <li className={location.pathname === '/auditorias' ? 'link_activate' : ''}><Link to="/auditorias">Auditorías</Link></li>
                <li className={location.pathname === '/responsables' ? 'link_activate' : ''}><Link to="/responsables">Responsables</Link></li>
            </ul>
        </div>
    );
};

export default Sidebar;
