import { useRouter } from 'next/navigation';

export default function DashboardConductor() {
    const { nombre, idRol, listo, cerrarSesion } = useAuth([2, 4]);
    const router = useRouter();

    if (!listo) return null;

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <UserNavbar nombre={nombre} idRol={idRol} onCerrarSesion={cerrarSesion} />
            <div style={{ padding: '40px' }}>
                <h1>¡Hola, {nombre}! 👋</h1>
                <section style={{ background: '#f0f9ff', padding: '20px', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                    <h2 style={{ color: '#0369a1' }}>Panel de Conductor</h2>
                    <p>Gestiona tus rutas y viajes.</p>
                    <button onClick={() => router.push('/app-conductor')}
                        style={{ padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                        🚗 Mis Rutas
                    </button>
                </section>
            </div>
        </div>
    );
}