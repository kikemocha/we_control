// src/pages/Riesgos.js
import React from 'react';

const Auditorias = () => {
    return <div className='main_action'>
        <h3>Auditorías</h3>
        <div className='upper_box'>
            <span>Auditorías</span>
            <div><p>Total de auditorías</p><span>3</span></div>
        </div>
        <div className='bottom_box'>
            <div className='bottom_box_top'>
                <p>Auditorías</p>
                <div>
                    <select name="" id="">
                        <option value="">por fecha</option>
                        <option value="">por nombre</option>
                        <option value="">Opción 2</option>
                        <option value="">Opción 1</option>
                        <option value="">Opción 2</option>
                    </select>
                    <a href="">Guardar</a>
                </div>
            </div>
        </div>
        
        </div>;
};

export default Auditorias;
