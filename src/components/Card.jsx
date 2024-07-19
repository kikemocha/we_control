import React from "react";
import { Link } from 'react-router-dom';
import './Card.css';

const Card = ({name, singularName, href, index, list}) => {
    return (
        <div className="card_main">
            <span>
                <h3>{name}</h3>
            </span>
            <div className="card_content">
                <p>{list.length} {name} activos</p>
                <table className="card_table">
                    <thead>
                        <tr>
                            {index.map((header, idx) => (
                                <th key={idx}>{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((row, idx) => (
                            <tr key={idx}>
                                {row.map((cell, cellIdx) => (
                                    <td key={cellIdx}>{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="div_button_Card">
                    <Link to={`/${href}`} className="button_Card" >+ Nuevo {singularName}</Link>
                </div>
            </div>
        </div>
    );
};
export default Card;