// src/components/Layout.js
import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import './Layout.css';

const Layout = () => {
    return (
        <div>
            <Helmet>
                <title>We Control</title>
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
