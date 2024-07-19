// src/pages/Riesgos.js
import React from 'react';
import Card from '../components/Card';
import './Home.css';

const Home = () => {
    return (
    <div className='home_main'>
        <h3>Hola Admin</h3>
        <span>Crea los riesgos y controles</span>
        <div className='home_hub'>
            <div className={'big_card'}>
                <Card
                    name='Riesgos'
                    singularName='riesgo'
                    href='riesgos'
                    index = {['Nombre', 'Puntuación', 'Controles asociados', 'Número de controles asociados']}
                    list={[['R1',0.05,'C1,C2,C5','3'],['R2',0.2,'C1,C2,C3',3],['R3',0.05,'-','-']]}
                />
            </div>
            <div className={'small_card'}>
                <Card
                    name='Gestores'
                    singularName='gestor'
                    href='gestores'
                    index = {['Nombre','E-mail']}
                    list={[['Pepe Pérez','gestor@empresa.com']]}
                />
            </div>
            <div className={'big_card'}>
                <Card
                    name='Controles'
                    singularName='control'
                    href='controles'
                    index = {['Número', 'Nombre', 'Evidencias', 'Periodicidad', 'Auditorías en uso']}
                    list={[['C1','Segregación funciones compras','Trazabilidad programa SAP','Anual',1],['C2','Código de conducta','Procolo vigente','Trimestral',1],['C3','Política antifraude y anticorrupción','Protocolo vigente','Anual','-']]}
                />
            </div>
            <div className={'small_card'}>
                <Card
                    name='Auditorías'
                    singularName='auditoría'
                    href='auditorias'
                    index = {['Nombre', 'Progreso', 'Riesgo']}
                    list={[[2023,98+'%',20+'%'],[2024,8+'%',90+'%']]}
                />
            </div>
        </div>
    </div>
    );
};

export default Home;
