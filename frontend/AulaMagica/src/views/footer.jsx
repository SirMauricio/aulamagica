import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import '../viewsEstilos/footer.css';

const Footer = () => {
  const location = useLocation();

  // Ocultar el footer en la página de login (/)
  if (location.pathname === '/') {
    return null;
  }

  return (
    <footer className="footer-container">
      <p>&copy; 2025 FormularioWeb - Todos los derechos reservados</p>
      <Link to="/privacidad" className="footer-link">
        Política de Privacidad
      </Link>
    </footer>
  );
};

export default Footer;
