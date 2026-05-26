'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; 

export default function DashboardConductor() {
  const router = useRouter(); 
  const [rol, setRol] = useState(null);
  const [nombre, setNombre] = useState(''); 
  const [modo, setModo] = useState('conductor');

  useEffect(() => {
    const userRol = localStorage.getItem('userRol');
    const userId = localStorage.getItem('userId');

    // Verificamos si el usuario está logueado
    if (!userId || !userRol) {
      router.push('/login');
    } else {
      setRol(parseInt(userRol));
      setNombre(localStorage.getItem('userName') || 'Conductor');
    }
  }, [router]);

  return (
    <div className="dashboard-container" style={{ padding: '40px' }}>
      <h1>¡Hola, {nombre}! 👋</h1>

      {/* BARRA DE CAMBIO DE ROL (Solo visible para el Mixto = 4) */}
      {rol === 4 && (
        <div className="role-switcher" style={{ background: '#e0e7ff', padding: '15px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #c7d2fe' }}>
          <span style={{ color: '#4338ca', fontWeight: 'bold' }}>
            🌟 Modo Mixto: Estás visualizando como {modo}
          </span>
          <button
            onClick={() => setModo(modo === 'conductor' ? 'pasajero' : 'conductor')}
            style={{
              marginLeft: '20px',
              padding: '8px 16px',
              cursor: 'pointer',
              backgroundColor: '#4338ca',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600'
            }}
          >
            Cambiar a modo {modo === 'conductor' ? 'Pasajero' : 'Conductor'}
          </button>
        </div>
      )}

      {/* CONTENIDO DINÁMICO */}
      {modo === 'conductor' ? (
        <section className="seccion-conductor" style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ color: '#1e293b' }}>Panel de Conductor</h2>
          <p>Gestiona tus rutas hacia la UdeA o la Nacional.</p>
          <button style={{ padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' }}>
            <i className="bi bi-plus-circle"></i> Crear nueva ruta
          </button>
        </section>
      ) : (
        <section className="seccion-pasajero" style={{ background: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '1px solid #dcfce7' }}>
          <h2 style={{ color: '#166534' }}>Panel de Pasajero</h2>
          <p>Busca conductores que salgan hoy desde Copacabana.</p>
          <button style={{ padding: '12px 24px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' }}>
            <i className="bi bi-search"></i> Buscar viajes disponibles
          </button>
        </section>
      )}

      {/* BOTÓN DE CERRAR SESIÓN (Opcional pero recomendado) */}
      <button
        onClick={() => { localStorage.clear(); router.push('/login'); }}
        style={{ marginTop: '50px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
      >
        Cerrar sesión de forma segura
      </button>
    </div>
  );
}