// src/components/Layout.js
import React, {useEffect} from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import './Layout.css';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    const {expirationTime, signOut} = useAuth();
    useEffect(() => {
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible' && expirationTime) {
            const now = new Date().getTime();
            const expTime = new Date(expirationTime).getTime();
            console.log(`Verificando token: ahora = ${now}, expiración = ${expTime}`);
            if (now > expTime) {
              console.log("El token ha expirado, cerrando sesión...");
              alert("Tu sesión ha expirado!, vuelve a iniciar sesión");
              signOut();
            }
          }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
          document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
      }, [expirationTime, signOut]);
      

    return (
        <div>
            <Helmet>
                <title>We Controol</title>
            </Helmet>
            <div className="layout-container">
                <Sidebar />
                <div className="content min-h-screen flex flex-col">
                    <Navbar />
                    <div className="content-padding flex-grow overflow-hidden">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layout;
