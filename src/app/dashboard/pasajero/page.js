'use client';
import UserNavbar from '@/components/UserNavbar';
import useAuth from '@/lib/useAuth';

export default function DashboardPasajero() {
    const { nombre, idRol, listo, cerrarSesion } = useAuth([3]);

    if (!listo) return null;

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <UserNavbar nombre={nombre} idRol={idRol} onCerrarSesion={cerrarSesion} />

            <div style={{ padding: '40px' }}>
                <h1>¡Hola, {nombre}! 👋</h1>

                <section style={{ background: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '1px solid #86efac' }}>
                    <h2 style={{ color: '#166534' }}>Panel de Pasajero</h2>
                    <p>Busca conductores disponibles para tu ruta.</p>
                    <button style={{ padding: '12px 24px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                        <i className="bi bi-search"></i> Buscar viajes
                    </button>
                </section>
            </div>
        </div>
    );
}