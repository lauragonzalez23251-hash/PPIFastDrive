'use client';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand">FASTDRIVE</Link>
        <ul className="nav-links">
          <li><Link href="/" className="nav-link active">Inicio</Link></li>
          <li><Link href="/conductores" className="nav-link">Conductores</Link></li>
          <li><Link href="/pasajeros" className="nav-link">Pasajeros</Link></li>
          <li><Link href="/contactanos" className="nav-link">Contáctanos</Link></li>
          <li><Link href="/login" className="btn-nav-login">Inicia Sesión</Link></li>
          <li><Link href="/" className="nav-link"><i className="bi bi-house-fill fs-5"></i></Link></li>
        </ul>
      </div>
    </nav>
  );
}