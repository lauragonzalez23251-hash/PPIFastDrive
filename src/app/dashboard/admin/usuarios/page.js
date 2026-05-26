'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import useAdminAuth from '@/lib/useAdminAuth';

export default function UsuariosAdminPage() {
    const { nombre, listo } = useAdminAuth();
    const [solicitudes, setSolicitudes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [mensaje, setMensaje] = useState('');
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

    useEffect(() => { cargarSolicitudes(); }, []);

    async function cargarSolicitudes() {
        setCargando(true);
        try {
            const res = await fetch('/api/admin/solicitudes');
            const data = await res.json();
            setSolicitudes(data);
        } catch (error) { console.error("Error:", error); }
        finally { setCargando(false); }
    }

    async function procesarSolicitud(id, accion) {
        try {
            const res = await fetch(`/api/admin/solicitudes/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accion, mensaje })
            });
            if (res.ok) {
                setMensaje('');
                setUsuarioSeleccionado(null);
                cargarSolicitudes();
                alert(`Solicitud ${accion === 'aprobar' ? 'aprobada' : 'rechazada'} con éxito.`);
            } else {
                alert("Error al procesar la solicitud.");
            }
        } catch (error) { alert("Error de conexión."); }
    }

    if (!listo || cargando) return null;

    return (
        <div suppressHydrationWarning style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <AdminSidebar />
            <main style={{ marginLeft: '240px', flex: 1, padding: '40px', background: '#f8fafc' }}>
                <h1 style={{ fontSize: '1.4rem', margin: '0 0 24px', color: '#1e293b' }}>¡Hola, {nombre}! 👋</h1>
                <h2 style={{ color: '#1e293b', marginBottom: '20px' }}>Solicitudes Pendientes ({solicitudes.length})</h2>
                {solicitudes.length === 0 ? <p>No hay solicitudes.</p> : solicitudes.map(u => (
                    <div key={u.id_user} style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ margin: '0 0 4px' }}>{u.nombre}</h3>
                                <p style={{ margin: '2px 0', fontSize: '0.85rem' }}>Correo: {u.correo}</p>
                                <p style={{ margin: '2px 0', fontSize: '0.85rem' }}>Documento: {u.documento} | Celular: {u.celular}</p>
                                <span style={{ display: 'inline-block', marginTop: '8px', padding: '2px 10px', borderRadius: '99px', background: '#e0e7ff', color: '#4338ca', fontSize: '0.75rem', fontWeight: 600 }}>
                                    {u.rol} — {u.perfil}
                                </span>
                                {/* ← AGREGA AQUÍ */}
                                {u.foto_perf && (
                                    <div style={{ marginTop: '12px' }}>
                                        <img src={u.foto_perf} alt="Foto perfil"
                                            style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
                                    </div>
                                )}

                                {u.certificado && (
                                    <div style={{ marginTop: '8px' }}>
                                        <a href={u.certificado} target="_blank" rel="noopener noreferrer"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', color: '#16a34a', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 600 }}>
                                            📄 Ver Certificado
                                        </a>
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                                <button onClick={() => procesarSolicitud(u.id_user, 'aprobar')}
                                    style={{ padding: '8px 16px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                    ✅ Aprobar
                                </button>
                                <button onClick={() => setUsuarioSeleccionado(u.id_user)}
                                    style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                    ❌ Rechazar
                                </button>
                            </div>
                        </div>
                        {usuarioSeleccionado === u.id_user && (
                            <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                                <label style={{ color: '#64748b', fontSize: '0.85rem' }}>Motivo del rechazo:</label>
                                <textarea rows={3} value={mensaje} onChange={e => setMensaje(e.target.value)}
                                    placeholder="Ej: La licencia adjunta está vencida..."
                                    style={{ width: '100%', marginTop: '8px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', resize: 'vertical' }} />
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                    <button onClick={() => procesarSolicitud(u.id_user, 'rechazar')}
                                        style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                        Confirmar Rechazo
                                    </button>
                                    <button onClick={() => { setUsuarioSeleccionado(null); setMensaje(''); }}
                                        style={{ padding: '8px 16px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '8px', cursor: 'pointer', color: '#64748b' }}>
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </main>
        </div>
    );
}