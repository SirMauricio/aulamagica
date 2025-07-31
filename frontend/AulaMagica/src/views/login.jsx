import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom'; 
import "../viewsEstilos/login.css";
import logo from '../assets/logoAula.png';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secondStep, setSecondStep] = useState(false);
  const [userId, setUserId] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const { login } = useAuth();
  const [rol, setRol] = useState('');
  
  const navigate = useNavigate(); 

  useEffect(() => {
    document.body.classList.add('login-page');
    return () => document.body.classList.remove('login-page');
  }, []);

  const iniciarSesion = async () => {
    try {
    const response = await axios.post("http://localhost:5000/login/",
      {
        correo: email.trim(),
        contrasena: password,
      }
    );


      if (response.data.status) {
        setUserId(response.data.respuesta.id_usuario);
        setRol(response.data.respuesta.rol);
        setSecondStep(true);
      } else {
        alert("Correo o contraseña incorrectos.");
      }
    } catch (error) {
      console.error("Error al autenticar:", error);
      alert("Error al conectar con el servidor.");
    }
  };

  const confirmarCodigo = async () => {
    try {
      const response = await axios.post("http://localhost:5000/login/confirmar",  {
        id: userId,
        codigo: securityCode,
      });

      if (response.data.status) {
        login({ id_usuario: userId, rol });

        // Navegar según rol, sin recargar página
        if (rol === 1) {
          navigate(`/users/${userId}`);
        } else {
          navigate('/formulario');
        }
      } else {
        alert("Código incorrecto.");
      }
    } catch (error) {
      console.error("Error al confirmar código:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Completa todos los campos.");
    iniciarSesion();
  };

  return (
    <div className="App">
      <div className="login-box mt-8 mb-8">
        <img
          className="logito"
          src={logo}
          alt="Formulario Web Logo"
        />
        <h1 className="project-title">Aula Mágica</h1>
        <h2>Inicio de Sesión</h2>
        {!secondStep && <p className="font-bold text-sm text-gray-500">Accede con tus credenciales</p>}

        <form onSubmit={handleSubmit}>
          {!secondStep ? (
            <>
              <div className="user-box">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <label>Correo Electrónico</label>
              </div>
              <div className="user-box">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <label>Contraseña</label>
              </div>
            </>
          ) : (
            <div className="user-box">
              <input type="text" value={securityCode} onChange={(e) => setSecurityCode(e.target.value)} required />
              <label>Código enviado a tu correo</label>
            </div>
          )}

          <button
            type="button"
            className="login-button"
            onClick={secondStep ? confirmarCodigo : iniciarSesion}
          >
            {secondStep ? "Confirmar Código" : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
