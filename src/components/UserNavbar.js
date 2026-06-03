'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserNavbar({ nombre, idRol, onCerrarSesion }) {
    const router = useRouter();

    // Menú según rol
    const menuConductor = [
    { label: 'Inicio',       href: '/dashboard/conductor' },
    { label: 'Mis Rutas',    href: '/rutasconductor' },
    { label: 'Contactanos',  href: '/contactanos' },
];

const menuPasajero = [
    { label: 'Inicio',       href: '/dashboard/pasajero' },
    { label: 'Buscar Viaje', href: '/rutaspasajero' },
    { label: 'Contactanos',  href: '/contactanos' },
];

const menuMixto = [
    { label: 'Inicio',       href: '/dashboard/mixto' },
    { label: 'Mis Rutas',    href: '/rutasconductor' },
    { label: 'Buscar Viaje', href: '/rutaspasajero' },
    { label: 'Contactanos',  href: '/contactanos' },
];

    const menu = idRol === 2 ? menuConductor
               : idRol === 4 ? menuMixto
               : menuPasajero;

    return (
        <nav style={{
            background: '#1e1b4b', padding: '0 32px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', height: '60px',
            position: 'sticky', top: 0, zIndex: 100
        }}>
            <div style={{ color: '#a5b4fc', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src="/img/FastDrive.png"  style={{ height: '32px', width: 'auto' }} />
                FastDrive
            </div>

            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                {menu.map(item => (
                    <Link key={item.href} href={item.href} style={{
                        color: '#a5b4fc', textDecoration: 'none',
                        fontSize: '0.9rem', fontWeight: 500
                    }}>
                        {item.label}
                    </Link>
                ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>
                    👋 {nombre}
                </span>
                <button onClick={onCerrarSesion} style={{
                    background: 'transparent', border: '1px solid #f87171',
                    color: '#f87171', padding: '6px 14px', borderRadius: '8px',
                    cursor: 'pointer', fontSize: '0.85rem'
                }}>
                    Cerrar sesión
                </button>
            </div>
        </nav>
    );
}