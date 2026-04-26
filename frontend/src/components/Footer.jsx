import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="siteFooter">
      <div className="footerContent">
        <div className="footerSection">
          <h4>Információk</h4>
          <ul>
            <li><Link to="/privacy-policy">Adatvédelmi tájékoztató</Link></li>
            <li><Link to="/terms-of-service">Általános Szerződési Feltételek</Link></li>
            <li><Link to="/about-us">Rólunk</Link></li>
          </ul>
        </div>
        <div className="footerSection">
          <h4>Elérhetőségek</h4>
          <ul>
            <li>Email: info@digitaldepot.hu</li>
            <li>Telefon: +36 30 123 4567</li>
            <li>Cím: 1234 Budapest, Példa utca 1.</li>
          </ul>
        </div>
      </div>
      <div className="footerBottom">
        <p>&copy; {new Date().getFullYear()} DigitalDepot. Minden jog fenntartva.</p>
      </div>
    </footer>
  );
}