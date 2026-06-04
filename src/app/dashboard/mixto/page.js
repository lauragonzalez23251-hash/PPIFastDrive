'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardMixto() {
    const router = useRouter();
    const [nombre, setNombre] = useState('');
    const [listo, setListo] = useState(false);

    useEffect(() => {
        const userId  = localStorage.getItem('userId');
        const userRol = parseInt(localStorage.getItem('userRol'));
        const userName = localStorage.getItem('userName');

        // Si no está logueado
        if (!userId) { router.push('/login'); return; }

        // Si no es rol mixto
        if (userRol !== 4) { router.push('/login'); return; }

        // Si ya eligió modo redirigir directamente
        const modoGuardado = localStorage.getItem('modoMixto');
        if (modoGuardado === 'conductor') {
            router.replace('/dashboard/conductor');
            return;
        } else if (modoGuardado === 'pasajero') {
            router.replace('/dashboard/pasajero');
            return;
        }

        // Si no ha elegido modo mostrar la pantalla de selección
        setNombre(userName || 'Usuario');
        setListo(true);
    }, []);

    function elegirModo(modo) {
        localStorage.setItem('modoMixto', modo);
        if (modo === 'conductor') {
            router.push('/dashboard/conductor');
        } else {
            router.push('/dashboard/pasajero');
        }
    }

    function cerrarSesion() {
        localStorage.clear();
        router.push('/login');
    }

    if (!listo) return null;

    return (
        <div style={{
            minHeight: '100vh', background: '#0d0f1a',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-nunito)'
        }}>
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <img src="/img/FastDrive.png" alt="FastDrive" style={{ height: '48px', marginBottom: '12px' }} />
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                    ¡Bienvenido, <strong style={{ color: 'white' }}>{nombre}</strong>!
                </p>
            </div>

            <h2 style={{ color: 'white', margin: '0 0 8px', fontSize: '1.4rem', textAlign: 'center' }}>
                ¿Cómo quieres usar FastDrive hoy?
            </h2>
            <p style={{ color: '#64748b', margin: '0 0 40px', fontSize: '0.9rem', textAlign: 'center' }}>
                Selecciona tu modo para esta sesión
            </p>

            <div style={{ display: 'flex', gap: '24px' }}>
                <div onClick={() => elegirModo('conductor')}
                    style={{
                        width: '260px', padding: '32px 24px', borderRadius: '20px',
                        background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                        border: '1px solid #4f46e5', cursor: 'pointer',
                        transition: 'all 0.2s', textAlign: 'center',
                        boxShadow: '0 4px 24px rgba(79,70,229,0.3)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🚗</div>
                    <h3 style={{ color: 'white', margin: '0 0 8px', fontSize: '1.2rem' }}>Modo Conductor</h3>
                    <p style={{ color: '#a5b4fc', margin: '0 0 20px', fontSize: '0.85rem', lineHeight: '1.5' }}>
                        Publica rutas, gestiona paradas y lleva estudiantes a su destino
                    </p>
                    <div style={{ background: '#4f46e5', color: 'white', padding: '10px 20px', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 700, display: 'inline-block' }}>
                        Entrar como Conductor →
                    </div>
                </div>

                <div onClick={() => elegirModo('pasajero')}
                    style={{
                        width: '260px', padding: '32px 24px', borderRadius: '20px',
                        background: 'linear-gradient(135deg, #052e16, #14532d)',
                        border: '1px solid #22c55e', cursor: 'pointer',
                        transition: 'all 0.2s', textAlign: 'center',
                        boxShadow: '0 4px 24px rgba(34,197,94,0.3)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎓</div>
                    <h3 style={{ color: 'white', margin: '0 0 8px', fontSize: '1.2rem' }}>Modo Pasajero</h3>
                    <p style={{ color: '#86efac', margin: '0 0 20px', fontSize: '0.85rem', lineHeight: '1.5' }}>
                        Busca viajes disponibles, reserva cupos y llega a tiempo a clase
                    </p>
                    <div style={{ background: '#22c55e', color: 'white', padding: '10px 20px', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 700, display: 'inline-block' }}>
                        Entrar como Pasajero →
                    </div>
                </div>
            </div>

            <button onClick={cerrarSesion}
                style={{ marginTop: '40px', background: 'none', border: '1px solid #334155', color: '#64748b', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                Cerrar sesión
            </button>
        </div>
    );
}