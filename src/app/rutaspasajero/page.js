'use client';
import { useState, useRef, useEffect } from 'react';
import UserNavbar from '@/components/UserNavbar';
import useAuth from '@/lib/useAuth';

const VIAJES = [];

const UNIVERSIDADES = [
  'Universidad de Antioquia (UdeA)','Universidad Nacional – Medellín','Universidad EAFIT',
  'Universidad Pontificia Bolivariana (UPB)','ITM – Robledo','ITM – Fraternidad','ITM – Castilla',
  'Politécnico Colombiano Jaime Isaza Cadavid','Tecnológico de Antioquia (TdeA)','Universidad CES',
  'Universidad de Medellín (UdeM)','Universidad Autónoma Latinoamericana (UNAULA)',
  'Fundación Universitaria Luis Amigó (Funlam)','Universidad San Buenaventura Medellín',
  'Universidad Cooperativa de Colombia – Medellín','Corporación Universitaria Minuto de Dios (Uniminuto)',
  'Colegio Mayor de Antioquia','Institución Universitaria Pascual Bravo','SENA – Regional Antioquia',
  'Escuela de Ingeniería de Antioquia (EIA)'
];

const BARRIOS = [
  'Aranjuez','Robledo','Castilla','Doce de Octubre','Manrique',
  'Villa Hermosa','Buenos Aires','El Poblado','Laureles','Estadio',
  'Belén','Guayabal','San Javier','Altavista','La América',
  'Santa Cruz','Popular','Prado','Calvario','Bello',
  'Envigado','Itagüí','Sabaneta','La Estrella','Caldas',
  'Copacabana','Girardota','Barbosa','Medellín Centro'
];

function formatHora(h) {
  const [hh, mm] = h.split(':');
  const n = parseInt(hh);
  return `${n > 12 ? n - 12 : (n || 12)}:${mm} ${n >= 12 ? 'PM' : 'AM'}`;
}

export default function PasajerosPage() {
  const [wizardStep, setWizardStep] = useState('origen');
  const [tipoOrigen, setTipoOrigen] = useState('');
  const [tipoDestino, setTipoDestino] = useState('');
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [filter, setFilter] = useState('todos');
  const [reserved, setReserved] = useState(new Set());
  const [visibleTrips, setVisibleTrips] = useState(VIAJES);
  const [searched, setSearched] = useState(true);
  const [activeTrip, setActiveTrip] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef(null);
  const {nombre, idRol, listo, cerrarSesion} = useAuth([3,4]);

  function showToast(msg) {
    setToast(msg);
    setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 3500);
  }

  function resetWizard() {
    setWizardStep('origen');
    setTipoOrigen('');
    setTipoDestino('');
    setOrigen('');
    setDestino('');
    setSearched(false);
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

  function getFiltered(org, dst, fil) {
    let lista = [...VIAJES];
    if (org)  lista = lista.filter(v => v.origen.toLowerCase().includes(org.toLowerCase()));
    if (dst)  lista = lista.filter(v => v.destino.toLowerCase().includes(dst.toLowerCase()));
    if (fil === 'manana')    lista = lista.filter(v => v.turno === 'manana');
    if (fil === 'tarde')     lista = lista.filter(v => v.turno === 'tarde');
    if (fil === 'cupos')     lista = lista.filter(v => v.cupos > 1);
    if (fil === 'economico') lista = lista.sort((a,b) => parseInt(a.aporte.replace(/\D/g,'')) - parseInt(b.aporte.replace(/\D/g,'')));
    return lista;
  }

  function buscarViajes() {
    if (!origen || !destino) { showToast('⚠️ Selecciona origen y destino'); return; }
    setVisibleTrips(getFiltered(origen, destino, filter));
    setSearched(true);
  }

  function handleFilter(fil) {
    setFilter(fil);
    setVisibleTrips(getFiltered(origen, destino, fil));
  }

  function openModal(id) {
    const v = VIAJES.find(x => x.id === id);
    if (!v) return;
    setActiveTrip(v);
    setModalOpen(true);
  }

  function confirmarReserva() {
    if (!activeTrip) return;
    setReserved(prev => new Set([...prev, activeTrip.id]));
    setModalOpen(false);
    setActiveTrip(null);
    showToast('✅ ¡Cupo reservado! Revisa tu correo para más detalles.');
  }

  useEffect(() => {
    const cards = document.querySelectorAll('.trip-card');
    requestAnimationFrame(() => cards.forEach(c => c.classList.add('visible')));
  }, [visibleTrips]);



  if(!listo) return null;
  return (
    <div style={{ background: '#eef0f7', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <UserNavbar nombre={nombre} idRol={idRol} onCerrarSesion={cerrarSesion} />

      <main className="pas-main">
        <div className="pas-grid">

          {/* Columna izquierda: Wizard */}
          <div className="pas-card">
            <h2 className="pas-card-title">
              <i className="bi bi-geo-alt-fill" style={{ color: '#5a5ef5' }}></i> Buscar Ruta
            </h2>

            {wizardStep !== 'done' && (
              <div className="ruta-section">
                <div className="ruta-label"><i className="bi bi-map-fill"></i> Define tu ruta</div>

                {wizardStep === 'origen' && (
                  <div className="ruta-step">
                    <p className="ruta-pregunta">¿Desde dónde <b>saldrás</b>?</p>
                    <div className="ruta-tipo-btns">
                      <button className={`ruta-tipo-btn ${tipoOrigen === 'barrio' ? 'selected' : ''}`}
                        onClick={() => setTipoOrigen('barrio')}>
                        <span className="btn-icon-emoji">🏘️</span> Barrio / Sector
                      </button>
                      <button className={`ruta-tipo-btn ${tipoOrigen === 'universidad' ? 'selected' : ''}`}
                        onClick={() => setTipoOrigen('universidad')}>
                        <span className="btn-icon-emoji">🎓</span> Universidad
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

                {wizardStep === 'destino' && (
                  <div className="ruta-step">
                    <p className="ruta-pregunta">Desde <b>{origen}</b> ✅<br />¿Cuál es tu <b>destino</b>?</p>
                    <div className="ruta-tipo-btns">
                      <button className={`ruta-tipo-btn ${tipoDestino === 'barrio' ? 'selected' : ''}`}
                        onClick={() => setTipoDestino('barrio')}>
                        <span className="btn-icon-emoji">🏘️</span> Barrio / Sector
                      </button>
                      <button className={`ruta-tipo-btn ${tipoDestino === 'universidad' ? 'selected' : ''}`}
                        onClick={() => setTipoDestino('universidad')}>
                        <span className="btn-icon-emoji">🎓</span> Universidad
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

            {wizardStep === 'done' && (
              <>
                <div className="ruta-chip">
                  <i className="bi bi-geo-alt-fill" style={{ color: '#4f46e5' }}></i>
                  <div className="ruta-chip-text">
                    <span>{origen}</span> <i className="bi bi-arrow-right"></i> <span>{destino}</span>
                  </div>
                  <button className="ruta-chip-edit" onClick={resetWizard}>✏️ Cambiar</button>
                </div>
                <button className="btn-buscar" onClick={buscarViajes}>
                  <i className="bi bi-search"></i> Buscar Viajes
                </button>
              </>
            )}
          </div>

          {/* Columna derecha: Viajes */}
          <div className="pas-card pas-trips-card">
            <h2 className="pas-card-title">
              Viajes Disponibles{' '}
              <span className="pas-trips-count">
                {searched ? `Mostrando ${visibleTrips.length} viaje${visibleTrips.length !== 1 ? 's' : ''}` : `(${VIAJES.length})`}
              </span>
            </h2>

            <div className="filters">
              {[['todos','Todos'],['manana','Mañana'],['tarde','Tarde'],['cupos','Con cupos'],['economico','Económico']].map(([val, label]) => (
                <button key={val} className={`filter-btn ${filter === val ? 'active' : ''}`}
                  onClick={() => handleFilter(val)}>{label}</button>
              ))}
            </div>

            <div className="trips-grid">
              {visibleTrips.map((v, i) => {
                const isR = reserved.has(v.id);
                const low = v.cupos <= 1;
                const stars = '★'.repeat(v.estrellas) + '☆'.repeat(5 - v.estrellas);
                const short = v.destino.length > 30 ? v.destino.substring(0, 28) + '…' : v.destino;
                return (
                  <div key={v.id} className="trip-card" style={{ transitionDelay: `${i * 55}ms` }}>
                    <div className="trip-header">
                      <div className="trip-route">
                        {v.origen}
                        <span className="trip-arrow-icon"><i className="bi bi-arrow-right"></i></span>
                        {v.destino.split('(')[0].trim()}
                      </div>
                      <span className={`cupos-badge ${low ? 'low' : ''}`}>
                        {v.cupos} cupo{v.cupos !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="trip-meta-row">
                      <div className="meta-chip"><i className="bi bi-clock-fill"></i>{formatHora(v.hora)}</div>
                      <div className="meta-chip"><i className="bi bi-cash-coin"></i>{v.aporte}</div>
                      <div className="meta-chip"><i className="bi bi-building"></i>{short}</div>
                    </div>
                    <div className="driver-row">
                      <div className="driver-avatar">{v.conductor.charAt(0)}</div>
                      <div>
                        <div className="driver-name">{v.conductor}</div>
                        <div className="driver-stars">{stars}</div>
                      </div>
                    </div>
                    <button className={`btn-reservar ${isR ? 'reserved' : ''}`}
                      onClick={() => openModal(v.id)} disabled={isR}>
                      {isR
                        ? <><i className="bi bi-check-circle-fill"></i> RESERVADO</>
                        : <><i className="bi bi-bookmark-fill"></i> RESERVAR CUPO</>}
                    </button>
                  </div>
                );
              })}
            </div>

            {visibleTrips.length === 0 && (
              <div className="empty-trips">
                <span className="empty-icon">🔍</span>
                <p>No se encontraron viajes para esa ruta.</p>
              </div>
            )}
          </div>
        </div>
      </main>

    

      {/* Modal */}
      <div className={`modal-overlay ${modalOpen ? 'open' : ''}`} onClick={e => { if (e.target.classList.contains('modal-overlay')) { setModalOpen(false); setActiveTrip(null); } }}>
        <div className="modal-box">
          <button className="modal-close" onClick={() => { setModalOpen(false); setActiveTrip(null); }}>
            <i className="bi bi-x-lg"></i>
          </button>
          <div className="modal-icon">🚗</div>
          <h3>CONFIRMAR VIAJE</h3>
          <p className="modal-sub">Estás a punto de reservar este cupo</p>
          {activeTrip && (
            <div className="modal-detail">
              <div className="modal-row"><span>Ruta</span><span>{activeTrip.origen} → {activeTrip.destino.split('(')[0].trim()}</span></div>
              <div className="modal-row"><span>Hora</span><span>{formatHora(activeTrip.hora)}</span></div>
              <div className="modal-row"><span>Aporte</span><span>{activeTrip.aporte}</span></div>
              <div className="modal-row"><span>Conductor</span><span>{activeTrip.conductor}</span></div>
              <div className="modal-row"><span>Cupos</span><span>{activeTrip.cupos} disponible{activeTrip.cupos !== 1 ? 's' : ''}</span></div>
            </div>
          )}
          <button className="btn-confirm" onClick={confirmarReserva}>
            <i className="bi bi-check-circle-fill"></i> CONFIRMAR RESERVA
          </button>
        </div>
      </div>

      {/* Toast */}
      <div className={`toast-fd ${toastVisible ? 'show' : ''}`}>{toast}</div>
    </div>
  );
}