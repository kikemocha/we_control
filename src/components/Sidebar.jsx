// src/components/Sidebar.js
import React from 'react';
import { Link , useLocation } from 'react-router-dom';
import logo from '../we_control.png'
import SignOutButton from './SignOut';
import './Layout.css';
import { useAuth, selectedEmpresa } from '../context/AuthContext';

const Sidebar = () => {
    const {role, selectedEmpresa, setSelectedEmpresa} = useAuth();
    const location = useLocation();
    console.log(role);
    return (
        <div className="sidebar">
          <Link to="/home">
            <img className="logo_sidebar mx-auto" src={logo} alt="" />
          </Link>
          {selectedEmpresa ? (
            <>
              {role === 'admin' && (
                <ul>
                  <li className={location.pathname === '/riesgos' ? 'link_activate' : ''}>
                    <Link to="/riesgos">Riesgos</Link>
                  </li>
                  <li className={location.pathname === '/controles' ? 'link_activate' : ''}>
                    <Link to="/controles">Controles</Link>
                  </li>
                  <li className={location.pathname === '/gestores' ? 'link_activate' : ''}>
                    <Link to="/gestores">Gestores</Link>
                  </li>
                  <li className={location.pathname === '/auditorias' ? 'link_activate' : ''}>
                    <Link to="/auditorias">Auditorías y<br /> Seguimientos</Link>
                  </li>
                </ul>
              )}
              {role === 'gestor' && (
                <ul>
                  <li className={location.pathname === '/riesgos' ? 'link_activate' : ''}>
                    <Link to="/riesgos">Riesgos</Link>
                  </li>
                  <li className={location.pathname === '/controles' ? 'link_activate' : ''}>
                    <Link to="/controles">Controles</Link>
                  </li>
                  <li className={location.pathname === '/auditorias' ? 'link_activate' : ''}>
                    <Link to="/auditorias">Seguimientos<br /> y Auditorías</Link>
                  </li>
                  <li className={location.pathname === '/responsables' ? 'link_activate' : ''}>
                    <Link to="/responsables">Responsables</Link>
                  </li>
                </ul>
              )}
              {role === 'responsable' && <div></div>}
            </>
          ) : (
            <div></div>
          )}
          <SignOutButton />
        </div>
      );
};

export default Sidebar;
