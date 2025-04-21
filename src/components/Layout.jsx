// src/components/Layout.js
import React, {useEffect} from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import './Layout.css';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Layout = () => {
    const {token, signOut} = useAuth();
    useEffect(() => {
      const interceptor = axios.interceptors.response.use(
        res => res,
        err => {
          if (err.response?.status === 401) {
            alert('Tu sesión ha expirado! Vuelve a iniciar sesión.');
            signOut();
          }else{
            console.log('Token Correcto');
          }
          return Promise.reject(err);
        }
      );
      return () => {
        // limpiar interceptor al desmontar
        axios.interceptors.response.eject(interceptor);
      };
    }, [signOut]);

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
