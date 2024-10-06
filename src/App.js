import React, { useState, useEffect, Component } from 'react';
import logo from './logo.svg';
import { Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import LandingPage from './components/Landing';
import FilmsPage from './components/Films';
import CustomersPage from './components/Customers';

function App() {
  const navigate = useNavigate();

  const pageRedirect = (event) => {
    if (event.target.innerText == "Landing Page"){
      navigate('/');
    }
    else if (event.target.innerText == "Films Page"){
      navigate('/films');
    }
    else if (event.target.innerText == "Customers Page"){
      navigate('/customers');
    }
  };

  // The "HTML"
  return (
    <div className='App'>
      <header className='App-header'>
        {/* <img src={logo} className='App-logo' alt='logo' /> */}
        <h1 className='generic-center'>"Epic" "Movie" "Website"</h1>
        {/* <h2 className='generic-center'>MAKE THIS UPDATE WITH WHAT PAGE UR ON</h2> */}
        <table>
          <thead>
            <tr><td colSpan='5'>Navigate to:</td></tr>
          </thead>
          <tbody>
            <tr>
              <td className='fifth-width'>&nbsp;</td>
              <td className='fifth-width' onClick={pageRedirect}>Landing Page</td>
              <td className='fifth-width' onClick={pageRedirect}>Films Page</td>
              <td className='fifth-width' onClick={pageRedirect}>Customers Page</td>
              <td className='fifth-width'>&nbsp;</td>
            </tr>
          </tbody>
        </table>
      </header>
      {/* BODY STARTS HERE */}
      <body>
        <p>&nbsp;</p>
        <div className='content'>
          <Routes>
            <Route exact path='/' element={<LandingPage />} />
            <Route exact path='/films' element={<FilmsPage />} />
            <Route exact path='/customers' element={<CustomersPage />} />
          </Routes>
        </div>
      </body>
    </div>
  );
}

export default App;
