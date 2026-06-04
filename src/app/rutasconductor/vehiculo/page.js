'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserNavbar from '@/components/UserNavbar';
import useAuth from '@/lib/useAuth';
import usePermisos from '@/lib/usePermisos';       // ← NUEVO
import SinPermiso from '@/components/SinPermiso';  // ← NUEVO

export default function VehiculoPage() {
    const { nombre, idRol, listo, cerrarSesion } = useAuth([2, 4]);
    const { puedeLeer, puedeActualizar, cargando: cargandoPermisos } = usePermisos(); // ← NUEVO
    const router = useRouter();
    const [vehiculo, setVehiculo] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [editando, setEditando] = useState(false);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [form, setForm] = useState({
        marca_veh: '', modelo_veh: '', color_veh: '',
        anno_creacion_veh: '', numero_soat_veh: '', total_cupos_veh: ''
    });

    useEffect(() => {
        if (listo) cargarVehiculo();
    }, [listo]);

    async function cargarVehiculo() {
        setCargando(true);
        try {
            const userId = localStorage.getItem('userId');
            const res = await fetch(`/api/conductor/vehiculo?userId=${userId}`);
            const data = await res.json();
            setVehiculo(data);
            if (data) {
                setForm({
                    marca_veh:         data.marca_veh         || '',
                    modelo_veh:        data.modelo_veh        || '',
                    color_veh:         data.color_veh         || '',
                    anno_creacion_veh: data.anno_creacion_veh || '',
                    numero_soat_veh:   data.numero_soat_veh   || '',
                    total_cupos_veh:   data.total_cupos_veh   || ''
                });
            }
        } catch { console.error('Error cargando vehículo'); }
        finally { setCargando(false); }
    }

    async function guardarCambios(e) {
        e.preventDefault();
        setLoading(true);
        setMsg('');
        try {
            const userId = localStorage.getItem('userId');
            const res = await fetch(`/api/conductor/vehiculo?userId=${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    anno_creacion_veh: Number(form.anno_creacion_veh),
                    total_cupos_veh:   Number(form.total_cupos_veh),
                })
            });
            const data = await res.json();
            if (res.ok) {
                setEditando(false);
                cargarVehiculo();
                setMsg('✅ Vehículo actualizado correctamente');
            } else {
                setMsg(`❌ ${data.error}`);
            }
        } catch { setMsg('❌ Error de conexión'); }
        finally { setLoading(false); }
    }

    // ← GUARDS en orden correcto
    if (!listo || cargandoPermisos) return null;

    // ← BLOQUEO si no puede leer
    if (!puedeLeer) return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <UserNavbar nombre={nombre} idRol={idRol} onCerrarSesion={cerrarSesion} />
            <SinPermiso />
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <UserNavbar nombre={nombre} idRol={idRol} onCerrarSesion={cerrarSesion} />
            <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
                <button onClick={() => router.back()}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', marginBottom: '16px', fontSize: '0.85rem' }}>
                    ← Volver
                </button>
                <h1 style={{ margin: '0 0 24px', color: '#1e293b' }}>Mi Vehículo</h1>

                {msg && (
                    <div style={{ padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem',
                        background: msg.includes('✅') ? '#dcfce7' : '#fee2e2',
                        color: msg.includes('✅') ? '#16a34a' : '#dc2626' }}>
                        {msg}
                    </div>
                )}

                {cargando ? <p>Cargando...</p> : !vehiculo ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '3rem' }}>🚗</div>
                        <p style={{ color: '#64748b', marginTop: '12px' }}>No tienes vehículo registrado</p>
                    </div>
                ) : (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>

                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                                    🚗
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, color: '#1e293b' }}>{vehiculo.marca_veh} {vehiculo.modelo_veh}</h2>
                                    <span style={{
                                        display: 'inline-block', marginTop: '4px',
                                        padding: '2px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700,
                                        background: '#dcfce7', color: '#16a34a'
                                    }}>
                                        {vehiculo.estado?.nombre_estado}
                                    </span>
                                </div>
                            </div>
                            {/* ← Solo muestra botón Editar si puede actualizar */}
                            {!editando && puedeActualizar && (
                                <button onClick={() => setEditando(true)}
                                    style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                                    ✏️ Editar
                                </button>
                            )}
                        </div>

                        {/* Vista o Edición */}
                        {!editando ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {[
                                    { label: '🪪 Placa',   value: vehiculo.placa_veh },
                                    { label: '🎨 Color',   value: vehiculo.color_veh },
                                    { label: '📅 Año',     value: vehiculo.anno_creacion_veh },
                                    { label: '💺 Cupos',   value: `${vehiculo.total_cupos_veh} cupos` },
                                    { label: '🛡️ SOAT',   value: vehiculo.numero_soat_veh },
                                    { label: '🏷️ Modelo', value: vehiculo.modelo_veh },
                                ].map(item => (
                                    <div key={item.label} style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>{item.label}</div>
                                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '1.1rem' }}>{item.value || '—'}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // ← Solo muestra formulario si puede actualizar
                            puedeActualizar ? (
                                <form onSubmit={guardarCambios}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                        {[
                                            { label: 'Marca',  key: 'marca_veh',         type: 'text',   placeholder: 'Ej: Renault' },
                                            { label: 'Modelo', key: 'modelo_veh',        type: 'text',   placeholder: 'Ej: Sandero' },
                                            { label: 'Color',  key: 'color_veh',         type: 'text',   placeholder: 'Ej: Gris' },
                                            { label: 'Año',    key: 'anno_creacion_veh', type: 'number', placeholder: 'Ej: 2020' },
                                            { label: 'SOAT',   key: 'numero_soat_veh',   type: 'text',   placeholder: 'Número SOAT' },
                                            { label: 'Cupos',  key: 'total_cupos_veh',   type: 'number', placeholder: 'Ej: 4' },
                                        ].map(field => (
                                            <div key={field.key}>
                                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
                                                    {field.label}
                                                </label>
                                                <input type={field.type} value={form[field.key]}
                                                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                                                    placeholder={field.placeholder}
                                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '0.9rem' }} />
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                        <button type="button" onClick={() => { setEditando(false); setMsg(''); }}
                                            style={{ padding: '10px 16px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                            Cancelar
                                        </button>
                                        <button type="submit" disabled={loading}
                                            style={{ padding: '10px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No tienes permiso para editar el vehículo.</p>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}