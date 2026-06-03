'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import UserNavbar from '@/components/UserNavbar';
import useAuth from '@/lib/useAuth';
import Estrellas from '@/components/Estrellas';

export default function DashboardPasajero() {
    const { nombre, idRol, listo, cerrarSesion } = useAuth([3, 4]);
    const router = useRouter();
    const fotoRef = useRef(null);

    const [perfil, setPerfil] = useState(null);
    const [calificacion, setCalificacion] = useState(null);
    const [perfilAbierto, setPerfilAbierto] = useState(false);
    const [editando, setEditando] = useState(false);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [fotoPreview, setFotoPreview] = useState(null);
    const [fotoPerfil, setFotoPerfil] = useState(null);
    const [ultimoViajeFinalizado, setUltimoViajeFinalizado] = useState(null);

    const [universidades, setUniversidades] = useState([]);
    const [todasUniversidades, setTodasUniversidades] = useState([]);
    const [modalUni, setModalUni] = useState(false);
    const [nitUniNueva, setNitUniNueva] = useState('');
    const [correoInstitucional, setCorreoInstitucional] = useState('');
    const [certificadoFile, setCertificadoFile] = useState(null);
    const certRef = useRef(null);
    const [form, setForm] = useState({
        nombre_user: '', primer_apellido: '', segundo_apellido: '',
        celular: '', nuevaContrasena: ''
    });

    useEffect(() => {
        if (listo) { cargarPerfil(); cargarCalificacion(); cargarUltimoViajeFinalizado(); cargarMisUniversidades();
        cargarTodasUniversidades(); }
    }, [listo]);

    async function cargarPerfil() {
        try {
            const userId = localStorage.getItem('userId');
            const res = await fetch(`/api/conductor/perfil?userId=${userId}`);
            const data = await res.json();
            setPerfil(data);
            setFotoPreview(data.foto_perf || null);
            setForm({
                nombre_user:      data.nombre_user      || '',
                primer_apellido:  data.primer_apellido  || '',
                segundo_apellido: data.segundo_apellido || '',
                celular:          data.celular          || '',
                nuevaContrasena:  ''
            });
        } catch { console.error('Error cargando perfil'); }
    }

    async function cargarCalificacion() {
        try {
            const userId = localStorage.getItem('userId');
            const res = await fetch(`/api/pasajero/calificaciones?userId=${userId}&tipo=pasajero`);
            const data = await res.json();
            setCalificacion(data);
        } catch { console.error('Error cargando calificación'); }
    }

    async function cargarMisUniversidades() {
    try {
        const userId = localStorage.getItem('userId');
        const res = await fetch(`/api/pasajero/universidades?userId=${userId}`);
        const data = await res.json();
        setUniversidades(Array.isArray(data) ? data : []);
        } catch { console.error('Error cargando universidades'); }
    }

    async function cargarTodasUniversidades() {
        try {
            const res = await fetch('/api/admin/universidades');
            const data = await res.json();
            setTodasUniversidades(Array.isArray(data) ? data : []);
        } catch { console.error('Error'); }
    }

    async function agregarUniversidad(e) {
            e.preventDefault();
            if (!nitUniNueva || !correoInstitucional) return;
            try {
                const userId = localStorage.getItem('userId');
                let certBase64 = null;
                if (certificadoFile) {
                    certBase64 = await fileToBase64(certificadoFile);
                }
                const res = await fetch('/api/pasajero/universidades', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId,
                        nitUni: nitUniNueva,
                        correoInstitucional,
                        certificadoBase64: certBase64
                    })
                });
                const data = await res.json();
                if (res.ok) {
                    setModalUni(false);
                    setNitUniNueva('');
                    setCorreoInstitucional('');
                    setCertificadoFile(null);
                    cargarMisUniversidades();
                    setMsg('✅ Solicitud enviada al administrador');
                } else {
                    setMsg(`❌ ${data.error}`);
                }
            } catch { setMsg('❌ Error de conexión'); }
        }
    async function cargarUltimoViajeFinalizado() {
    try {
            const userId = localStorage.getItem('userId');
            const res = await fetch(`/api/pasajero/viajes/finalizados?userId=${userId}`);
            const data = await res.json();
            console.log('Viajes finalizados:', data);
            // Busca si hay alguno sin calificar
            const pendiente = Array.isArray(data) ? data.find(v => !v.calificado) : null;
            setUltimoViajeFinalizado(pendiente || null);
        } catch { console.error('Error cargando viaje finalizado'); }
    }

    function handleFotoChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        setFotoPerfil(file);
        setFotoPreview(URL.createObjectURL(file));
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async function guardarCambios(e) {
        e.preventDefault();
        setLoading(true);
        setMsg('');
        try {
            const userId = localStorage.getItem('userId');
            let fotoBase64 = null;
            if (fotoPerfil) fotoBase64 = await fileToBase64(fotoPerfil);
            const res = await fetch(`/api/conductor/perfil?userId=${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, fotoPerfil: fotoBase64 })
            });
            const data = await res.json();
            if (res.ok) {
                setEditando(false);
                setFotoPerfil(null);
                cargarPerfil();
                setMsg('✅ Perfil actualizado');
            } else {
                setMsg(`❌ ${data.error}`);
            }
        } catch { setMsg('❌ Error de conexión'); }
        finally { setLoading(false); }
    }

    function formatFecha(fecha) {
        if (!fecha) return '—';
        return new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    if (!listo) return null;

    const tarjetas = [
        { id: 'viajes',         titulo: 'Buscar Viajes',    descripcion: 'Encuentra y reserva viajes disponibles', icono: '🚗', color: '#4f46e5', ruta: '/rutaspasajero' },
        //bloquea calificaciones si no hay viaje finalizado sin calificar
        {  id: 'calificaciones', titulo: 'Calificaciones', descripcion: ultimoViajeFinalizado  ? 'Tienes un viaje pendiente de calificar'  : 'No tienes viajes pendientes de calificar', icono: '⭐', color: '#f59e0b',  ruta: ultimoViajeFinalizado 
        ? `/rutaspasajero/calificaciones`   : '#'  },
        { id: 'historial',      titulo: 'Mis Reservas',     descripcion: 'Ver el historial de tus reservas',        icono: '📋', color: '#22c55e', ruta: '#' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <UserNavbar nombre={nombre} idRol={idRol} onCerrarSesion={cerrarSesion} />

            <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', margin: '0 0 4px', color: '#1e293b' }}>¡Hola, {nombre}! 👋</h1>
                        <p style={{ color: '#64748b', margin: 0 }}>¿A dónde vas hoy?</p>
                    </div>
                    <button onClick={() => setPerfilAbierto(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '99px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {fotoPreview
                                ? <img src={fotoPreview} alt="foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <span>👤</span>
                            }
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{nombre}</span>
                            {calificacion?.promedio && (
                                <Estrellas promedio={calificacion.promedio} total={calificacion.total} size="0.7rem" />
                            )}
                        </div>
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    {tarjetas.map(t => (
                        <div key={t.id}
                            onClick={() => t.ruta !== '#' && router.push(t.ruta)}
                            style={{
                                background: 'white', borderRadius: '16px', padding: '24px',
                                border: '1px solid #e2e8f0', cursor: t.ruta !== '#' ? 'pointer' : 'default',
                                transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                opacity: t.ruta === '#' ? 0.6 : 1
                            }}
                            onMouseEnter={e => { if (t.ruta !== '#') e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}
                        >
                            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{t.icono}</div>
                            <h2 style={{ margin: '0 0 6px', fontSize: '1rem', color: '#1e293b' }}>{t.titulo}</h2>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>{t.descripcion}</p>
                            {t.ruta !== '#' && <div style={{ marginTop: '12px', color: t.color, fontWeight: 600, fontSize: '0.8rem' }}>Ir →</div>}
                            {t.ruta === '#' && <div style={{ marginTop: '12px', color: '#94a3b8', fontSize: '0.75rem' }}>Próximamente</div>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Overlay */}
            {perfilAbierto && (
                <div onClick={() => setPerfilAbierto(false)}
                    style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 300 }} />
            )}

            {/* Panel deslizante perfil */}
            <div style={{
                position: 'fixed', top: 0, right: perfilAbierto ? 0 : '-420px',
                width: '400px', height: '100vh', background: 'white',
                boxShadow: '-4px 0 20px rgba(0,0,0,0.1)', zIndex: 300,
                transition: 'right 0.3s ease', overflowY: 'auto', padding: '24px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: '#1e293b' }}>Mi Perfil</h2>
                    <button onClick={() => setPerfilAbierto(false)}
                        style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1rem' }}>
                        ✕
                    </button>
                </div>

                {msg && (
                    <div style={{ padding: '8px 12px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.8rem',
                        background: msg.includes('✅') ? '#dcfce7' : '#fee2e2',
                        color: msg.includes('✅') ? '#16a34a' : '#dc2626' }}>
                        {msg}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ position: 'relative', marginBottom: '12px' }}>
                        <div onClick={() => editando && fotoRef.current?.click()}
                            style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #e2e8f0', cursor: editando ? 'pointer' : 'default', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {fotoPreview
                                ? <img src={fotoPreview} alt="foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <span style={{ fontSize: '2.5rem' }}>👤</span>
                            }
                        </div>
                        {editando && (
                            <button type="button" onClick={() => fotoRef.current?.click()}
                                style={{ position: 'absolute', bottom: 0, right: 0, background: '#4f46e5', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '0.7rem' }}>
                                ✏️
                            </button>
                        )}
                        <input ref={fotoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFotoChange} />
                    </div>
                    <h3 style={{ margin: '0 0 4px', color: '#1e293b', textAlign: 'center' }}>
                        {perfil ? `${perfil.nombre_user} ${perfil.primer_apellido}` : nombre}
                    </h3>
                    {calificacion && (
                        <Estrellas promedio={calificacion.promedio} total={calificacion.total} />
                    )}
                    {perfil && (
                        <span style={{ fontSize: '0.75rem', background: '#e0e7ff', color: '#4f46e5', padding: '2px 10px', borderRadius: '99px', fontWeight: 600, marginTop: '6px' }}>
                            {perfil.rol}
                        </span>
                    )}
                </div>

                {perfil && (
                    <div style={{ marginBottom: '16px' }}>
                        {[
                            { label: '🪪 Documento',  value: perfil.documento_identidad },
                            { label: '📧 Correo',     value: perfil.correo_personal_user },
                            { label: '🎂 Nacimiento', value: formatFecha(perfil.fecha_nacimiento_user) },
                        ].map(item => (
                            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{item.label}</span>
                                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>{item.value || '—'}</span>
                            </div>
                        ))}
                    </div>
                )}

                {!editando ? (
                    <>
                        {perfil && (
                            <div style={{ marginBottom: '16px' }}>
                                {[
                                    { label: '👤 Nombre',           value: perfil.nombre_user },
                                    { label: '👤 Primer Apellido',  value: perfil.primer_apellido },
                                    { label: '👤 Segundo Apellido', value: perfil.segundo_apellido },
                                    { label: '📱 Celular',          value: perfil.celular },
                                ].map(item => (
                                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{item.label}</span>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1e293b' }}>{item.value || '—'}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button onClick={() => setEditando(true)}
                            style={{ width: '100%', padding: '10px', background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                            ✏️ Editar Perfil
                        </button>
                    {/* Mis Universidades */}
                        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <h4 style={{ margin: 0, color: '#1e293b', fontSize: '0.9rem' }}>🎓 Mis Universidades</h4>
                                <button onClick={() => setModalUni(true)}
                                    style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                                    + Agregar
                                </button>
                            </div>

                            {universidades.length === 0 ? (
                                <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>No tienes universidades vinculadas</p>
                            ) : (
                                universidades.map(u => (
                                    <div key={u.nit_uni} style={{ padding: '8px 10px', borderRadius: '8px', background: '#f8fafc', marginBottom: '8px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#1e293b' }}>
                                            {u.universidad?.nombre_uni}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                                            {u.correo_institucional_une}
                                        </div>
                                        {u.certificado_estudio_une && (
                                            <a href={u.certificado_estudio_une} target="_blank"
                                                style={{ fontSize: '0.75rem', color: '#4f46e5', display: 'block', marginTop: '4px' }}>
                                                Ver certificado
                                            </a>
                                        )}
                                        <span style={{
                                            display: 'inline-block', marginTop: '4px',
                                            padding: '1px 8px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 600,
                                            background: u.estado?.nombre_estado === 'Verificada'           ? '#dcfce7' :
                                                        u.estado?.nombre_estado === 'Rechazada'            ? '#fee2e2' : '#fef3c7',
                                            color:      u.estado?.nombre_estado === 'Verificada'           ? '#16a34a' :
                                                        u.estado?.nombre_estado === 'Rechazada'            ? '#dc2626' : '#92400e'
                                        }}>
                                            {u.estado?.nombre_estado}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div> 
                        
                    </>
                ) : (
                    <form onSubmit={guardarCambios}>
                        {[
                            { label: 'Nombre',           key: 'nombre_user',      placeholder: 'Tu nombre' },
                            { label: 'Primer Apellido',  key: 'primer_apellido',  placeholder: 'Primer apellido' },
                            { label: 'Segundo Apellido', key: 'segundo_apellido', placeholder: 'Segundo apellido' },
                            { label: 'Celular',          key: 'celular',          placeholder: 'Ej: 300 123 4567' },
                        ].map(field => (
                            <div key={field.key} style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                                    {field.label}
                                </label>
                                <input type="text" value={form[field.key]}
                                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                                    placeholder={field.placeholder}
                                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '0.85rem' }} />
                            </div>
                        ))}
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                                Nueva Contraseña
                            </label>
                            <input type="password" value={form.nuevaContrasena}
                                onChange={e => setForm({ ...form, nuevaContrasena: e.target.value })}
                                placeholder="Dejar vacío para no cambiar"
                                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '0.85rem' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="button" onClick={() => { setEditando(false); setMsg(''); setFotoPreview(perfil?.foto_perf); }}
                                style={{ flex: 1, padding: '8px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                                Cancelar
                            </button>
                            <button type="submit" disabled={loading}
                                style={{ flex: 1, padding: '8px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                                {loading ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </form>

                )}
                {/* Modal agregar universidad */}
                    {modalUni && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 400 }}>
                            <div style={{ background: 'white', padding: '28px', borderRadius: '12px', width: '460px' }}>
                                <h3 style={{ margin: '0 0 4px', color: '#1e293b' }}>Agregar Universidad</h3>
                                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 20px' }}>
                                    La solicitud será revisada por un encargado y se te notificará por correo institucional una vez verificada o rechazada. Asegúrate de que el correo institucional sea correcto y que el certificado de matrícula sea legible.
                                </p>
                                <form onSubmit={agregarUniversidad}>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                                            Universidad *
                                        </label>
                                        <select value={nitUniNueva} onChange={e => setNitUniNueva(e.target.value)} required
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                            <option value="">Selecciona una universidad</option>
                                            {todasUniversidades
                                                .filter(u => !universidades.find(v => v.nit_uni === u.nit_uni))
                                                .map(u => (
                                                    <option key={u.nit_uni} value={u.nit_uni}>{u.nombre_uni}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                                            Correo Institucional *
                                        </label>
                                        <input type="email" value={correoInstitucional}
                                            onChange={e => setCorreoInstitucional(e.target.value)} required
                                            placeholder="tu.nombre@universidad.edu.co"
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                                            Certificado de matrícula (PDF o imagen)
                                        </label>
                                        <input ref={certRef} type="file" accept=".pdf,image/*"
                                            onChange={e => setCertificadoFile(e.target.files[0])}
                                            style={{ width: '100%', fontSize: '0.85rem' }} />
                                        {certificadoFile && (
                                            <p style={{ color: '#16a34a', fontSize: '0.78rem', margin: '4px 0 0' }}>
                                                ✅ {certificadoFile.name}
                                            </p>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button type="button" onClick={() => { setModalUni(false); setNitUniNueva(''); setCorreoInstitucional(''); setCertificadoFile(null); }}
                                            style={{ flex: 1, padding: '10px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                            Cancelar
                                        </button>
                                        <button type="submit"
                                            style={{ flex: 2, padding: '10px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                                            Enviar Solicitud
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
            </div>
        </div>
        
    );
}