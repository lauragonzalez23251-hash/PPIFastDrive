'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UserNavbar from '@/components/UserNavbar';
import useAuth from '@/lib/useAuth';

export default function DashboardMixto() {
    const { nombre, idRol, listo, cerrarSesion } = useAuth([4]);
    const [vista, setVista] = useState('conductor');
    const router = useRouter();

    if (!listo) return null;

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <UserNavbar nombre={nombre} idRol={idRol} onCerrarSesion={cerrarSesion} />

            <div style={{ padding: '40px' }}>
                <h1>¡Hola, {nombre}! 👋</h1>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>
                    Tienes acceso como conductor y pasajero. Elige tu modo:
                </p>

                {/* Selector de vista */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <button onClick={() => setVista('conductor')} style={{
                        padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        background: vista === 'conductor' ? '#3b82f6' : '#e2e8f0',
                        color: vista === 'conductor' ? 'white' : '#64748b', fontWeight: 600
                    }}>
                        🚗 Modo Conductor
                    </button>
                    <button onClick={() => setVista('pasajero')} style={{
                        padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        background: vista === 'pasajero' ? '#22c55e' : '#e2e8f0',
                        color: vista === 'pasajero' ? 'white' : '#64748b', fontWeight: 600
                    }}>
                        🎓 Modo Pasajero
                    </button>
                </div>

                {vista === 'conductor' && (
                    <section style={{ background: '#f0f9ff', padding: '20px', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                        <h2 style={{ color: '#0369a1' }}>Panel de Conductor</h2>
                        <p>Gestiona tus rutas y viajes.</p>
                        <button onClick={() => router.push('/app-conductor')}
                            style={{ padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                            🚗 Mis Rutas
                        </button>
                    </section>
                )}

                {vista === 'pasajero' && (
                    <section style={{ background: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '1px solid #86efac' }}>
                        <h2 style={{ color: '#166534' }}>Panel de Pasajero</h2>
                        <p>Busca conductores disponibles para tu ruta.</p>
                        <button onClick={() => router.push('/app-pasajero')}
                            style={{ padding: '12px 24px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                            🔍 Buscar Viajes
                        </button>
                    </section>
                )}
            </div>
        </div>
    );
}