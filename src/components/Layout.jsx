// src/components/Layout.js
import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import './Layout.css';

const Layout = () => {
    return (
        <div>
            <Helmet>
                <title>We Controol</title>
            </Helmet>
            <div className="layout-container">
            <Sidebar />
            <div className="content">
                <Navbar />
                <div className="content-padding">
                    <Outlet />
                </div>
            </div>
        </div>
        </div>
    );
};

export default Layout;
