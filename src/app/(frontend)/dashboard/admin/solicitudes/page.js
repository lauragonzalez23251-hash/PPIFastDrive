'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SolicitudesUsuariosPage() {
    const router = useRouter();
    const [solicitudes, setSolicitudes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [mensaje, setMensaje] = useState('');
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

    useEffect(() => {
        // Validación de Seguridad
        const userId  = localStorage.getItem('userId');
        const userRol = localStorage.getItem('userRol');
        if (!userId || userRol !== '1') {
            router.push('/login');
            return;
        }
        cargarSolicitudes();
    }, [router]);

    async function cargarSolicitudes() {
        setCargando(true);
        try {
            const res = await fetch('/api/admin/solicitudes');
            if (res.ok) {
                const data = await res.json();
                setSolicitudes(data);
            }
        } catch (error) {
            console.error("Error cargando solicitudes:", error);
        } finally {
            setCargando(false);
        }
    }

   async function procesarSolicitud(id, accion) {
    try {
       
        const res = await fetch(`/api/admin/solicitudes/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                accion: accion, 
                mensaje: mensaje // Aquí viaja el motivo del rechazo al backend
            })
        });

        if (res.ok) {
            alert(`Usuario ${accion === 'aprobar' ? 'aprobado' : 'rechazado'} correctamente.`);
            setMensaje(''); 
            setUsuarioSeleccionado(null); 
            cargarSolicitudes(); // Recargamos la lista
        } else {
            const err = await res.json();
            alert(err.error || "Error al procesar la acción");
        }
    } catch (error) {
        console.error("Error procesando solicitud:", error);
        alert("Error en la conexión con el servidor");
    }
}

    const menuItems = [
        { id: 'inicio',        icono: 'bi-house-fill',           label: 'Inicio',        ruta: '/dashboard/admin' },
        { id: 'usuarios',      icono: 'bi-people-fill',          label: 'Usuarios',      ruta: '/dashboard/admin/usuarios' },
        { id: 'perfiles',      icono: 'bi-person-badge-fill',    label: 'Perfiles',      ruta: '#' },
        { id: 'permisos',      icono: 'bi-shield-lock-fill',     label: 'Permisos',      ruta: '#' },
        { id: 'menus',         icono: 'bi-list-ul',              label: 'Menús',         ruta: '/dashboard/admin/menus' },
        { id: 'universidades', icono: 'bi-building-fill',        label: 'Universidades', ruta: '/dashboard/admin/universidades' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            
            {/* SIDEBAR */}
            <aside style={{
                width: '240px', background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)',
                padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '8px',
                position: 'fixed', height: '100vh',
            }}>
                <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                    <h2 style={{ color: '#a5b4fc', fontSize: '1.2rem', margin: 0 }}>
                        <i className="bi bi-speedometer2"></i> FastDrive
                    </h2>
                    <p style={{ color: '#6366f1', fontSize: '0.75rem', margin: '4px 0 0' }}>Panel Administrador</p>
                </div>

                {menuItems.map(item => (
                    <Link key={item.id} href={item.ruta}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 14px', borderRadius: '8px', textDecoration: 'none',
                            background: item.id === 'usuarios' ? '#4f46e5' : 'transparent',
                            color: item.id === 'usuarios' ? 'white' : '#a5b4fc',
                            fontWeight: item.id === 'usuarios' ? '600' : '400',
                            fontSize: '0.9rem', transition: 'all 0.2s',
                        }}>
                        <i className={`bi ${item.icono}`}></i>
                        {item.label}
                    </Link>
                ))}

                <button
                    onClick={() => { localStorage.clear(); router.push('/login'); }}
                    style={{
                        marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 14px', borderRadius: '8px', border: 'none',
                        cursor: 'pointer', background: 'transparent', color: '#f87171', fontSize: '0.9rem',
                    }}>
                    <i className="bi bi-box-arrow-left"></i> Cerrar sesión
                </button>
            </aside>

            {/* CONTENIDO DE SOLICITUDES */}
            <main style={{ marginLeft: '240px', flex: 1, padding: '40px', background: '#f8fafc' }}>
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '1.6rem', color: '#1e293b', margin: 0 }}>
                        Solicitudes Pendientes ({solicitudes.length})
                    </h1>
                    <p style={{ color: '#64748b', margin: '4px 0 0' }}>Valida la documentación de los nuevos integrantes</p>
                </div>

                {cargando ? (
                    <p style={{ color: '#64748b' }}>Cargando solicitudes...</p>
                ) : solicitudes.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <p style={{ fontSize: '1.2rem', margin: 0 }}>🎉 ¡Al día!</p>
                        <p style={{ marginTop: '4px', fontSize: '0.9rem' }}>No hay solicitudes de verificación pendientes por el momento.</p>
                    </div>
                ) : (
                    solicitudes.map(u => (
                        <div key={u.id_user} style={{
                            background: 'white', borderRadius: '12px', padding: '20px',
                            marginBottom: '16px', border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 4px', color: '#1e293b' }}>{u.nombre}</h3>
                                    <p style={{ margin: '4px 0', color: '#64748b', fontSize: '0.85rem' }}>
                                        <strong>Correo:</strong> {u.correo}
                                    </p>
                                    <p style={{ margin: '4px 0', color: '#64748b', fontSize: '0.85rem' }}>
                                        <strong>Documento:</strong> {u.documento} &nbsp;|&nbsp; <strong>Celular:</strong> {u.celular || 'No registra'}
                                    </p>
                                    <span style={{
                                        display: 'inline-block', marginTop: '8px',
                                        padding: '4px 12px', borderRadius: '99px',
                                        background: '#e0e7ff', color: '#4338ca',
                                        fontSize: '0.75rem', fontWeight: 600
                                    }}>
                                        {u.rol} — {u.perfil}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                                    <button
                                        onClick={() => { if(confirm(`¿Aprobar la cuenta de ${u.nombre}?`)) convert_call: procesarSolicitud(u.id_user, 'aprobar'); }}
                                        style={{
                                            padding: '8px 16px', borderRadius: '8px', border: 'none',
                                            background: '#22c55e', color: 'white', cursor: 'pointer',
                                            fontWeight: 600, fontSize: '0.85rem'
                                        }}>
                                        Aprobar
                                    </button>
                                    <button
                                        onClick={() => setUsuarioSeleccionado(u.id_user)}
                                        style={{
                                            padding: '8px 16px', borderRadius: '8px', border: 'none',
                                            background: '#ef4444', color: 'white', cursor: 'pointer',
                                            fontWeight: 600, fontSize: '0.85rem'
                                        }}>
                                        Rechazar
                                    </button>
                                </div>
                            </div>

                            {/* Formulario de Motivo del Rechazo */}
                            {usuarioSeleccionado === u.id_user && (
                                <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                                    <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                        Especifica el motivo del rechazo:
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={mensaje}
                                        onChange={e => setMensaje(e.target.value)}
                                        placeholder="Ej: La foto del documento de identidad no se encuentra legible..."
                                        style={{
                                            width: '98%', marginTop: '8px', padding: '10px',
                                            borderRadius: '8px', border: '1px solid #e2e8f0',
                                            fontSize: '0.85rem', resize: 'vertical', fontFamily: 'sans-serif'
                                        }}
                                    />
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        <button
                                            onClick={() => procesarSolicitud(u.id_user, 'rechazar')}
                                            disabled={!mensaje.trim()}
                                            style={{
                                                padding: '8px 16px', borderRadius: '8px', border: 'none',
                                                background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 600,
                                                opacity: mensaje.trim() ? 1 : 0.5
                                            }}>
                                            Confirmar Rechazo
                                        </button>
                                        <button
                                            onClick={() => { setUsuarioSeleccionado(null); setMensaje(''); }}
                                            style={{
                                                padding: '8px 16px', borderRadius: '8px',
                                                border: '1px solid #e2e8f0', background: 'white',
                                                cursor: 'pointer', color: '#64748b'
                                            }}>
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </main>
        </div>
    );
}