'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// ==========================================
// 1. USUARIOS
// ==========================================
function SeccionUsuarios() {
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
                alert("Error al procesar la solicitud en el servidor.");
            }
        } catch (error) { alert("Error de conexión al procesar la solicitud."); }
    }

    if (cargando) return <p>Cargando solicitudes...</p>;

    return (
        <div>
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
        </div>
    );
}

// ==========================================
// 2. CRUD GENÉRICO
// ==========================================
function CrudBasico({ titulo, endpoint, campoId, campoNombre, labelInput, placeholder }) {
    const [lista, setLista] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [nombre, setNombre] = useState('');
    const [editandoId, setEditandoId] = useState(null);

    useEffect(() => { cargarDatos(); }, []);

    async function cargarDatos() {
        setCargando(true);
        try {
            const res = await fetch(endpoint);
            const data = await res.json();
            setLista(Array.isArray(data) ? data : []);
        } catch (error) { console.error(error); }
        finally { setCargando(false); }
    }

    async function guardarDato(e) {
        e.preventDefault();
        const url = editandoId ? `${endpoint}/${editandoId}` : endpoint;
        const method = editandoId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [campoNombre]: nombre })
            });
            if (res.ok) {
                setNombre('');
                setEditandoId(null);
                cargarDatos();
            } else {
                const err = await res.json();
                alert(err.error || 'Error al guardar');
            }
        } catch (error) { alert('Error de conexión'); }
    }

    async function eliminarDato(id) {
        if (!confirm('¿Seguro que deseas eliminar este registro?')) return;
        try {
            const res = await fetch(`${endpoint}/${id}`, { method: 'DELETE' });
            if (res.ok) cargarDatos();
            else alert('No se puede eliminar: está siendo usado.');
        } catch (error) { alert('Error al eliminar'); }
    }

    if (cargando) return <p>Cargando {titulo.toLowerCase()}...</p>;

    return (
        <div>
            <h2 style={{ color: '#1e293b', marginBottom: '20px' }}>CRUD de {titulo}</h2>

            <form onSubmit={guardarDato} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{labelInput}</label>
                    <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required placeholder={placeholder}
                        style={{ width: '100%', marginTop: '6px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                </div>
                <button type="submit" style={{ padding: '10px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                    {editandoId ? 'Actualizar' : 'Crear'}
                </button>
                {editandoId && (
                    <button type="button" onClick={() => { setEditandoId(null); setNombre(''); }}
                        style={{ padding: '10px 14px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                        Cancelar
                    </button>
                )}
            </form>

            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '12px 16px' }}>ID</th>
                            <th style={{ padding: '12px 16px' }}>Nombre</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lista.map(item => {
                            const idReal     = item[campoId];
                            const nombreReal = item[campoNombre];
                            return (
                                <tr key={idReal} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '12px 16px' }}>{idReal}</td>
                                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{nombreReal}</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        <button onClick={() => { setEditandoId(idReal); setNombre(nombreReal); }}
                                            style={{ background: '#e0e7ff', border: 'none', color: '#4f46e5', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '16px' }}>
                                            ✏️ Editar
                                        </button>
                                        <button onClick={() => eliminarDato(idReal)}
                                            style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                                            🗑️ Eliminar
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ==========================================
// 3. DASHBOARD PRINCIPAL
// ==========================================
export default function DashboardAdmin() {
    const router = useRouter();
    const [nombre, setNombre] = useState('');
    const [seccionActiva, setSeccionActiva] = useState('inicio');

    useEffect(() => {
        const userId  = localStorage.getItem('userId');
        const userRol = localStorage.getItem('userRol');
        if (!userId || !userRol || userRol !== '1') {
            router.push('/login');
            return;
        }
        setNombre(localStorage.getItem('userName') || 'Administrador');
    }, [router]);

    const menuItems = [
        { id: 'inicio',        label: 'Inicio'        },
        { id: 'usuarios',      label: 'Usuarios'      },
        { id: 'roles',         label: 'Roles'         },
        { id: 'estados',       label: 'Estados'       },
        { id: 'perfiles',      label: 'Perfiles'      },
        { id: 'menus',         label: 'Menús'         },
        { id: 'universidades', label: 'Universidades' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>

            {/* SIDEBAR */}
            <aside style={{ width: '240px', background: '#2e2b5c', padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '8px', position: 'fixed', height: '100vh' }}>
                <div style={{ marginBottom: '30px', textAlign: 'center', color: 'white' }}>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>FastDrive</h2>
                    <p style={{ fontSize: '0.75rem', margin: '4px 0 0', opacity: 0.7 }}>Panel Administrador</p>
                </div>
                {menuItems.map(item => (
                    <button key={item.id} onClick={() => setSeccionActiva(item.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: seccionActiva === item.id ? '#4f46e5' : 'transparent',
                            color: 'white', textAlign: 'left', fontSize: '0.9rem'
                        }}>
                        {item.label}
                    </button>
                ))}
                <button onClick={() => { localStorage.clear(); router.push('/login'); }}
                    style={{ marginTop: 'auto', padding: '10px', background: 'transparent', color: '#f87171', border: 'none', cursor: 'pointer' }}>
                    Cerrar sesión
                </button>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <main style={{ marginLeft: '240px', flex: 1, padding: '40px', background: '#f8fafc' }}>
                <h1 style={{ fontSize: '1.6rem', margin: '0 0 30px' }}>¡Hola, {nombre}! 👋</h1>

                {seccionActiva === 'inicio' && (
                    <p style={{ color: '#64748b' }}>Selecciona una opción del menú lateral para comenzar.</p>
                )}

                {seccionActiva === 'usuarios' && <SeccionUsuarios />}

                {seccionActiva === 'roles' && (
                    <CrudBasico titulo="Roles" endpoint="/api/admin/roles"
                        campoId="id_rol" campoNombre="nombre_rol"
                        labelInput="Nombre del Rol" placeholder="Ej: Conductor" />
                )}

                {seccionActiva === 'estados' && (
                    <CrudBasico titulo="Estados" endpoint="/api/admin/estados"
                        campoId="id_estado" campoNombre="nombre_estado"
                        labelInput="Nombre del Estado" placeholder="Ej: Activo" />
                )}

                {seccionActiva === 'perfiles' && (
                    <CrudBasico titulo="Perfiles" endpoint="/api/admin/perfiles"
                        campoId="codigo_perfil" campoNombre="nombre_perfil"
                        labelInput="Nombre del Perfil" placeholder="Ej: Estudiante Poli" />
                )}

                {seccionActiva === 'menus' && (
                    <CrudBasico titulo="Menús" endpoint="/api/admin/menus"
                        campoId="codigo_menu" campoNombre="nombre_menu"
                        labelInput="Nombre del Menú" placeholder="Ej: Dashboard" />
                )}

                {seccionActiva === 'universidades' && (
                    <CrudBasico titulo="Universidades" endpoint="/api/admin/universidades"
                        campoId="nit_uni" campoNombre="nombre_uni"
                        labelInput="Nombre de la Universidad" placeholder="Ej: UdeA" />
                )}
            </main>
        </div>
    );
}