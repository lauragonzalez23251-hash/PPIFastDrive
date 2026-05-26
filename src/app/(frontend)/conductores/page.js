'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import './conductores.css';

const BARRIOS = [
  'Aranjuez','Robledo','Castilla','Doce de Octubre','Manrique',
  'Villa Hermosa','Buenos Aires','El Poblado','Laureles','Estadio',
  'Belén','Guayabal','San Javier','Altavista','La América',
  'Santa Cruz','Popular','Prado','Calvario','Bello',
  'Envigado','Itagüí','Sabaneta','La Estrella','Caldas',
  'Copacabana','Girardota','Barbosa','Medellín Centro'
];

const UNIVERSIDADES = [
  'Universidad de Antioquia (UdeA)','Universidad Nacional – Medellín','Universidad EAFIT',
  'Universidad Pontificia Bolivariana (UPB)','ITM – Robledo',
  'Politécnico Colombiano Jaime Isaza Cadavid','Tecnológico de Antioquia (TdeA)',
  'Universidad de Medellín (UdeM)'
];

function formatHora(h) {
  if (!h) return '';
  const [hh, mm] = h.split(':');
  const hour = parseInt(hh);
  return `${hour > 12 ? hour - 12 : hour}:${mm} ${hour >= 12 ? 'PM' : 'AM'}`;
}

export default function ConductoresPage() {
  const [trips, setTrips] = useState([]);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef(null);

  // Wizard state
  const [wizardStep, setWizardStep] = useState('origen'); // 'origen' | 'destino' | 'done'
  const [tipoOrigen, setTipoOrigen] = useState('');
  const [tipoDestino, setTipoDestino] = useState('');
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');

  // Form state
  const [hora, setHora] = useState('');
  const [aporte, setAporte] = useState('');
  const [cupos, setCupos] = useState('4');

  function showToast(msg) {
    setToast(msg);
    setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 3000);
  }

  function resetWizard() {
    setWizardStep('origen');
    setTipoOrigen('');
    setTipoDestino('');
    setOrigen('');
    setDestino('');
    setHora('');
    setAporte('');
    setCupos('4');
  }

  function confirmarOrigen(valor) {
    if (!valor) return;
    setOrigen(valor);
    setWizardStep('destino');
    setTipoDestino('');
  }

  function confirmarDestino(valor) {
    if (!valor) return;
    setDestino(valor);
    setWizardStep('done');
  }

  function publicarViaje() {
    if (!origen || !destino || !hora || !aporte) {
      showToast('⚠️ Por favor completa todos los campos');
      return;
    }
    setTrips(prev => [...prev, { id: Date.now(), origen, destino, hora, aporte, cupos }]);
    resetWizard();
    showToast('✅ Viaje publicado exitosamente');
  }

  function eliminarViaje(id) {
    setTrips(prev => prev.filter(t => t.id !== id));
    showToast('🗑️ Viaje eliminado');
  }

  function editarViaje(id) {
    setTrips(prev => prev.filter(t => t.id !== id));
    resetWizard();
    showToast('✏️ Ahora crea el viaje con los nuevos datos');
  }

  function handleAporteBlur() {
    const v = aporte.replace(/[^0-9]/g, '');
    if (v) setAporte('$' + parseInt(v).toLocaleString('es-CO') + ' COP');
  }

  function scrollToForm() {
    document.getElementById('formCard')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="conductores-page">
      <Navbar />

      <main className="conductores-main">
        <div className="panel-grid">

          {/* Card Agregar Viaje */}
          <div className="card" id="formCard">
            <h2 className="card-title">Agregar Viaje</h2>

            {/* WIZARD */}
            {wizardStep !== 'done' && (
              <div className="ruta-section">
                <div className="ruta-label">
                  <i className="bi bi-map-fill"></i> Define tu ruta
                </div>

                {/* PASO ORIGEN */}
                {wizardStep === 'origen' && (
                  <div className="ruta-step">
                    <p className="ruta-pregunta">¿Desde dónde <b>sale</b> tu viaje?</p>
                    <div className="ruta-tipo-btns">
                      <button className={`ruta-tipo-btn ${tipoOrigen === 'barrio' ? 'selected' : ''}`}
                        onClick={() => setTipoOrigen('barrio')}>
                        <span>🏘️</span> Barrio / Sector
                      </button>
                      <button className={`ruta-tipo-btn ${tipoOrigen === 'universidad' ? 'selected' : ''}`}
                        onClick={() => setTipoOrigen('universidad')}>
                        <span>🎓</span> Universidad
                      </button>
                    </div>
                    {tipoOrigen && (
                      <div className="ruta-select-wrap">
                        <span className="ruta-select-lbl">
                          {tipoOrigen === 'barrio' ? '🏘️ Selecciona el barrio o sector' : '🎓 Selecciona la universidad'}
                        </span>
                        <select className="ruta-select" onChange={e => confirmarOrigen(e.target.value)} defaultValue="">
                          <option value="">-- Elige una opción --</option>
                          {(tipoOrigen === 'barrio' ? BARRIOS : UNIVERSIDADES).map(i => (
                            <option key={i} value={i}>{i}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* PASO DESTINO */}
                {wizardStep === 'destino' && (
                  <div className="ruta-step">
                    <p className="ruta-pregunta">Desde <b>{origen}</b> ✅<br />¿Cuál es el <b>destino</b>?</p>
                    <div className="ruta-tipo-btns">
                      <button className={`ruta-tipo-btn ${tipoDestino === 'barrio' ? 'selected' : ''}`}
                        onClick={() => setTipoDestino('barrio')}>
                        <span>🏘️</span> Barrio / Sector
                      </button>
                      <button className={`ruta-tipo-btn ${tipoDestino === 'universidad' ? 'selected' : ''}`}
                        onClick={() => setTipoDestino('universidad')}>
                        <span>🎓</span> Universidad
                      </button>
                    </div>
                    {tipoDestino && (
                      <div className="ruta-select-wrap">
                        <span className="ruta-select-lbl">
                          {tipoDestino === 'barrio' ? '🏘️ Selecciona el barrio o sector' : '🎓 Selecciona la universidad'}
                        </span>
                        <select className="ruta-select" onChange={e => confirmarDestino(e.target.value)} defaultValue="">
                          <option value="">-- Elige una opción --</option>
                          {(tipoDestino === 'barrio' ? BARRIOS : UNIVERSIDADES).map(i => (
                            <option key={i} value={i}>{i}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* CHIP de ruta confirmada */}
            {wizardStep === 'done' && (
              <div className="ruta-chip">
                <i className="bi bi-geo-alt-fill" style={{ color: '#4f46e5' }}></i>
                <div className="ruta-chip-text">
                  <span>{origen}</span> <i className="bi bi-arrow-right"></i> <span>{destino}</span>
                </div>
                <button className="ruta-chip-edit" onClick={resetWizard}>✏️ Cambiar</button>
              </div>
            )}

            {/* Campos extra */}
            {wizardStep === 'done' && (
              <>
                <div className="form-group">
                  <label>Hora de Salida:</label>
                  <input type="time" value={hora} onChange={e => setHora(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Aporte por Persona:</label>
                  <input type="text" value={aporte} placeholder="Ej: $3.000 COP"
                    onChange={e => setAporte(e.target.value)}
                    onBlur={handleAporteBlur} />
                </div>
                <div className="form-group">
                  <label>Cupos Disponibles:</label>
                  <select value={cupos} onChange={e => setCupos(e.target.value)}>
                    {[1,2,3,4,5,6].map(n => (
                      <option key={n} value={n}>{n} cupo{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <button className="btn-primary btn-publish" onClick={publicarViaje}>
                  ✓ Publicar Viaje
                </button>
              </>
            )}
          </div>

          {/* Card Mis Viajes */}
          <div className="card trips-card">
            <h2 className="card-title">
              Mis Viajes <span className="trips-count">({trips.length})</span>
            </h2>
            {trips.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🚘</span>
                <span className="empty-text">No tienes viajes publicados. ¡Crea uno!</span>
              </div>
            ) : (
              <div className="trip-list">
                {trips.map(t => (
                  <div key={t.id} className="trip-item">
                    <div>
                      <div className="trip-route">
                        {t.origen} <span className="trip-arrow">→</span> {t.destino}
                      </div>
                      <div className="trip-meta">
                        <span className="trip-badge">🕐 {formatHora(t.hora)}</span>
                        <span className="trip-badge">💵 {t.aporte}</span>
                        <span className="trip-badge">💺 {t.cupos} cupo{t.cupos > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="trip-actions">
                      <button className="btn-icon edit" onClick={() => editarViaje(t.id)}>✏️</button>
                      <button className="btn-icon" onClick={() => eliminarViaje(t.id)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Cómo funciona */}
      <section className="how-section">
        <div className="how-container">
          <h2 className="how-title">CÓMO <span>FUNCIONA</span></h2>
          <p className="how-sub">Publica tu primer viaje en menos de un minuto</p>
          <div className="steps-grid">
            {[
              { n: 1, title: 'Regístrate', desc: 'Crea tu cuenta como conductor y verifica tu identidad para unirte a la plataforma.' },
              { n: 2, title: 'Crea tu ruta', desc: 'Ingresa tu barrio de origen, universidad de destino, hora de salida y aporte por persona.' },
              { n: 3, title: 'Publica el viaje', desc: 'Con un clic tu viaje queda visible para los estudiantes de tu ruta que buscan cupo.' },
              { n: 4, title: '¡A conducir!', desc: 'Recoge a tus pasajeros, genera ingresos extra y ayuda a tu comunidad universitaria.' },
            ].map(s => (
              <div key={s.n} className="step-card">
                <div className="step-num">{s.n}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>¿LISTO PARA <span>DESPEGAR</span>?</h2>
        <p>Únete a cientos de conductores que ya generan ingresos con FastDrive.</p>
        <button className="btn-primary cta-btn" onClick={scrollToForm}>
          <i className="bi bi-rocket-takeoff-fill"></i> COMENZAR AHORA
        </button>
      </section>

      <Footer />

      {/* Toast */}
      <div className={`toast ${toastVisible ? 'show' : ''}`}>
        <span>{toast}</span>
      </div>
    </div>
  );
}