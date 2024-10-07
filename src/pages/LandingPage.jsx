// src/pages/Riesgos.js
import React, { useState } from 'react';    
import './LandingPage.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import logo from '../we_control.png'

const LandingPage = () => {
    
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [email, setEmail] = useState('');
    
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    const [isPopupVisible, setIsPopupVisible] = useState(false); // Estado para el popup
    const [popupMessage, setPopupMessage] = useState(''); // Mensaje del popup

    
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const requestBody = {
          name: name,
          subject: subject,
          email: email,
        };
    
        try {
          const response = await fetch('https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/sendEmail', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });
    
          const result = await response.json();
    
            if (response.ok) {
                setSuccessMessage(result.message);
                setErrorMessage('');
                setPopupMessage('Gracias por contactar con WeControol');
                setIsPopupVisible(true); // Mostrar el popup
                setName(''); // Limpiar los campos del formulario
                setEmail('');
                setSubject('');
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'  // Desplazamiento suave
                  });
            } else {
                setErrorMessage(result.message);
                setSuccessMessage('');
                setPopupMessage('Ha habido un error al enviar el formulario. Por favor, inténtalo de nuevo.');
                setIsPopupVisible(true); // Mostrar el popup
            }
        } catch (error) {
            setErrorMessage('Error al enviar los datos al servidor');
            setSuccessMessage('');
            setPopupMessage('Ha habido un error al enviar el formulario. Por favor, inténtalo de nuevo.');
            setIsPopupVisible(true); // Mostrar el popup
        }
    };
    const closePopup = () => {
        setIsPopupVisible(false);
        setPopupMessage('');
    };
    
    return (
    <div className='landing_page'>
        <header>
            <span>WE</span>CTRL
            <Link to="/login">
                <button className='login_button text-black'>LOG IN</button>
            </Link>
        </header>
        <div className='second_div'>
            <img src={logo} alt="" />
        </div>
        <div className='intro_page'>
        </div>
        <div className='contact_page'>
            <h3><span>CON</span>TACTO</h3>
            <div className='contact_div'>
                <form onSubmit={handleSubmit}>
                    <p>Nombre</p>
                    <input  
                        className='text-black'
                        type="text" 
                        name="name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)} 
                        required/>
                    <p>Email</p>
                    <input
                        className='text-black'
                        type="email" 
                        name="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} 
                        required/>
                    <p>Asunto</p>
                   <textarea 
                    id="subject" 
                    className='description'
                    name="subject" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)} 
                    required>

                    </textarea>
                    <input type="submit" value="Enviar" className='submit_contact'/>
                </form>
            </div>
        </div>
        <footer>

        </footer>
        {isPopupVisible && (
          <div className="popup-overlay">
            <div className="popup-contact">
              <button className="popup-close" onClick={closePopup}>
                <svg fill="none" viewBox="0 0 15 15" height="1.5em" width="1.5em">
                    <path
                        fill="currentColor"
                        fillRule="evenodd"
                        d="M11.782 4.032a.575.575 0 10-.813-.814L7.5 6.687 4.032 3.218a.575.575 0 00-.814.814L6.687 7.5l-3.469 3.468a.575.575 0 00.814.814L7.5 8.313l3.469 3.469a.575.575 0 00.813-.814L8.313 7.5l3.469-3.468z"
                        clipRule="evenodd"
                    />
                </svg>
              </button>
              <img src={logo} alt="" style={{height:'180px', margin: 'auto'}}/>
              <p>{popupMessage}</p>
            </div>
          </div>
        )}
    </div>
    );
};

export default LandingPage;
