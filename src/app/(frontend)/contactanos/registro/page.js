'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegistroPage() {
  const router = useRouter();
  const [rol, setRol] = useState('pasajero');
  const [nombre, setNombre] = useState('');
  const [primerApellido, setPrimerApellido] = useState('');
  const [segundoApellido, setSegundoApellido] = useState('');
  const [documento, setDocumento] = useState('');
  const [celular, setCelular] = useState('');
  const [fechaNac, setFechaNac] = useState('');
  const [emailInst, setEmailInst] = useState('');
  const [emailPers, setEmailPers] = useState('');
  const [pass, setPass] = useState('');
  const [nitUni, setNitUni] = useState(' 890.980.040-8'); // UdeA por defecto
  const [msg, setMsg] = useState({ tipo: '', texto: '' });

  function selectRol(r) {
    setRol(r);
    setMsg({ tipo: '', texto: '' });
  }

  async function doRegistro() {
    let idRol;
    if (rol === 'conductor') idRol = 2;
    else if (rol === 'pasajero') idRol = 3;
    else idRol = 4;

    // Conductor usa correo personal, pasajero y mixto usan correo institucional
    const email = rol === 'conductor' ? emailPers : emailInst;

    if (!nombre || !primerApellido || !segundoApellido || !documento || !celular || !fechaNac || !email || !pass) {
      setMsg({ tipo: 'error', texto: 'Por favor completa todos los campos.' });
      return;
    }

    try {
      const res = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          primer_apellido: primerApellido,
          segundo_apellido: segundoApellido,
          documento,
          celular,
          fechaNac,
          email,
          password: pass,
          idRol,
          nitUni
        })
      });

      const data = await res.json();
      console.log("Respuesta del servidor:", data);

      if (res.ok) {
        console.log("Usuario creado con ID:", data.userId);
        if (idRol === 2 || idRol === 4) {
          if (data.userId) {
            router.push(`/registro/Vehiculo?userId=${data.userId}`);
          } else {
            setMsg({ tipo: 'error', texto: 'Error: No se recibió el ID del usuario' });
          }
        } else {
          router.push('/login');
        }
      } else {
        setMsg({ tipo: 'error', texto: data.error || "Error en el registro" });
      }
    } catch (error) {
      console.error("Error:", error);
      setMsg({ tipo: 'error', texto: 'Error de conexión con el servidor' });
    }
  }

  return (
    <div className="registro-page">
      <div className="fd-card">
        <div className="fd-side">
          <div className="fd-icon-wrap">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-5h14v5z"/>
              <circle cx="7.5" cy="14.5" r="1.5" fill="currentColor"/>
              <circle cx="16.5" cy="14.5" r="1.5" fill="currentColor"/>
            </svg>
          </div>
          <div className="fd-logo">FastDrive</div>
          <div className="fd-tagline">Tu enlace universitario seguro</div>
        </div>

        <div className="fd-main">
          <div className="fd-title">Crear cuenta</div>

          {msg.texto && <div className={`fd-msg ${msg.tipo}`}>{msg.texto}</div>}

          <div className="fd-row">
            <div className="fd-field">
              <label className="fd-label">Nombre</label>
              <input className="fd-input" type="text" value={nombre}
                onChange={e => setNombre(e.target.value)} />
            </div>
            <div className="fd-field">
              <label className="fd-label">Primer Apellido</label>
              <input className="fd-input" type="text" value={primerApellido}
                onChange={e => setPrimerApellido(e.target.value)} />
            </div>

            <div className="fd-field">
              <label className="fd-label">Segundo Apellido</label>
              <input className="fd-input" type="text" value={segundoApellido}
                onChange={e => setSegundoApellido(e.target.value)} />
            </div>
          </div>

          <div className="fd-row">
            <div className="fd-field">
              <label className="fd-label">Documento</label>
              <input className="fd-input" type="text" value={documento}
                onChange={e => setDocumento(e.target.value)} />
            </div>
            <div className="fd-field">
              <label className="fd-label">Celular</label>
              <input className="fd-input" type="text" value={celular}
                onChange={e => setCelular(e.target.value)} />
            </div>
          </div>

          <div className="fd-field">
            <label className="fd-label">Fecha de Nacimiento</label>
            <input className="fd-input" type="date" value={fechaNac}
              onChange={e => setFechaNac(e.target.value)} />
          </div>

          {/* Universidad solo visible para pasajero y mixto */}
          {(rol === 'pasajero' || rol === 'mixto') && (
            <div className="fd-field">
              <label className="fd-label">Universidad</label>
              <select className="fd-input" value={nitUni}
                onChange={e => setNitUni(e.target.value)}>
                <option value=" 890.980.136-6">Politécnico Jaime Isaza Cadavid</option>
                <option value="800.036.781-1">Fundación Universitaria María Cano</option>
                <option value=" 890.980.040-8">Universidad de Antioquia</option>
                <option value="899.999.034-1">SENA</option>
                <option value="890980040-5">Universidad Nacional de Colombia</option>
                <option value="890.905.419-6">Tecnológico de Antioquia</option>
                <option value="890.980.153-1">Pascual Bravo</option>
                <option value="800.116.217-2">UNIMINUTO</option>
              </select>
            </div>
          )}

          <div className="fd-field">
            <div className="fd-label">Quiero ser</div>
            <div className="fd-role-wrap">
              <div className={`fd-role ${rol === 'pasajero' ? 'selected' : ''}`}
                onClick={() => selectRol('pasajero')}>Pasajero</div>
              <div className={`fd-role ${rol === 'conductor' ? 'selected' : ''}`}
                onClick={() => selectRol('conductor')}>Conductor</div>
              <div className={`fd-role ${rol === 'mixto' ? 'selected' : ''}`}
                onClick={() => selectRol('mixto')}>Mixto</div>
            </div>
          </div>

          <div className="fd-field">
            <label className="fd-label">
              Correo {rol === 'conductor' ? 'Personal' : 'Institucional'}
            </label>
            <input
              className="fd-input"
              type="email"
              placeholder={rol === 'conductor' ? 'ejemplo@gmail.com' : `ejemplo@${
                nitUni === ' 890.980.040-8' ? 'udea.edu.co' :
                nitUni === ' 890.980.136-6' ? 'elpoli.edu.co' :
                nitUni === '800.036.781-1'  ? 'fumc.edu.co' :
                nitUni === '899.999.034-1'  ? 'soy.sena.edu.co' :
                nitUni === '890980040-5'    ? 'unal.edu.co' :
                nitUni === '890.905.419-6'  ? 'tdea.edu.co' :
                nitUni === '890.980.153-1'  ? 'pascualbravo.edu.co' :
                'uniminuto.edu.co'
              }`}
              value={rol === 'conductor' ? emailPers : emailInst}
              onChange={e => rol === 'conductor'
                ? setEmailPers(e.target.value)
                : setEmailInst(e.target.value)}
            />
          </div>

          <div className="fd-field">
            <label className="fd-label">Contraseña</label>
            <input className="fd-input" type="password" value={pass}
              onChange={e => setPass(e.target.value)} />
          </div>

          <button className="fd-btn" onClick={doRegistro}>Siguiente Paso</button>

          <div className="fd-hint">
            ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
}