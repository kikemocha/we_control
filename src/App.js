// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Riesgos from './pages/Riesgos';
import Controles from './pages/Controles';
import Gestores from './pages/Gestores';
import Auditorias from './pages/Auditorias';
import Responsables from './pages/Responsables';
import Home from './pages/Home';
import './App.css';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} /> 
                    <Route path="riesgos" element={<Riesgos />} />
                    <Route path="controles" element={<Controles />} />
                    <Route path="gestores" element={<Gestores />} />
                    <Route path="auditorias" element={<Auditorias />} />
                    <Route path="responsables" element={<Responsables />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default App;
