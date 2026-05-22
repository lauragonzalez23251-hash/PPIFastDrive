'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // <--- 1. IMPORTANTE: Importa el router

export default function DashboardPasajero() {
  const [nombre, setNombre] = useState('');
  const router = useRouter(); // <--- 2. IMPORTANTE: Define la constante del router

  useEffect(() => {
    const userId = localStorage.getItem('userId');

    // Verificación de seguridad
    if (!userId) {
      router.push('/login');
    } else {
      setNombre(localStorage.getItem('userName') || 'Estudiante');
    }
  }, [router]); // <--- 3. Buena práctica: Incluye router en las dependencias

  return (
    <div className="dashboard-container" style={{ padding: '40px' }}>
      <h1>¡Hola, {nombre}! </h1>
      <p>¿A qué sede te diriges hoy?</p>

      {/* Resto de tu código de interfaz... */}
      <div className="search-section" style={{ marginTop: '30px' }}>
        <input
          type="text"
          placeholder="Ej: Universidad de Antioquia / Nacional..."
          style={{ padding: '12px', width: '300px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <button style={{ padding: '12px 20px', marginLeft: '10px', backgroundColor: '#2ecc8a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Buscar Viajes
        </button>
      </div>
    </div>
  );
}