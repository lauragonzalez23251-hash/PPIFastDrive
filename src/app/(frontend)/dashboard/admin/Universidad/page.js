"use client";
import { useState, useEffect } from "react";

export default function UniversidadesAdminPage() {
  const [unis, setUnis] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(false); // false = Crear, true = Editar
  
  // Form States
  const [nitUni, setNitUni] = useState("");
  const [nombreUni, setNombreUni] = useState("");
  const [direccionUni, setDireccionUni] = useState("");

  const cargarUniversidades = async () => {
    try {
      const res = await fetch("/api/admin/universidades");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUnis(data);
    } catch (error) {
      alert("Error al cargar universidades");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarUniversidades(); }, []);

  const abrirModal = (uni = null) => {
    if (uni) {
      setEditando(true);
      setNitUni(uni.nit_uni);
      setNombreUni(uni.nombre_uni);
      setDireccionUni(uni.direccion_uni || "");
    } else {
      setEditando(false);
      setNitUni("");
      setNombreUni("");
      setDireccionUni("");
    }
    setModalAbierto(true);
  };

  const manejarGuardar = async (e) => {
    e.preventDefault();
    // Si edita, la URL lleva el nit en la ruta dinámica. Si crea, va a la raíz.
    const url = editando ? `/api/admin/universidades/${nitUni}` : "/api/admin/universidades";
    const metodo = editando ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nit_uni: nitUni, nombre_uni: nombreUni, direccion_uni: direccionUni }),
      });

      if (res.ok) {
        setModalAbierto(false);
        cargarUniversidades();
      } else {
        const err = await res.json();
        alert(err.error || "Ocurrió un error");
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  const manejarEliminar = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar esta institución?")) return;
    try {
      const res = await fetch(`/api/admin/universidades/${id}`, { method: "DELETE" });
      if (res.ok) cargarUniversidades();
      else {
        const err = await res.json();
        alert(err.error || "Error al eliminar");
      }
    } catch (error) {
      alert("Error de comunicación");
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ color: "#2c3e50", margin: 0 }}>Gestión de Universidades</h2>
          <p style={{ color: "#7f8c8d", margin: "5px 0 0 0" }}>Controla las instituciones autorizadas para el carpooling</p>
        </div>
        <button onClick={() => abrirModal()} style={{ backgroundColor: "#2ecc71", color: "white", border: "none", padding: "10px 15px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
          + Nueva Universidad
        </button>
      </div>

      {cargando ? <p>Cargando instituciones...</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <thead>
            <tr style={{ backgroundColor: "#34495e", color: "white", textAlign: "left" }}>
              <th style={{ padding: "12px" }}>NIT</th>
              <th style={{ padding: "12px" }}>Nombre Institución</th>
              <th style={{ padding: "12px" }}>Dirección Sede</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {unis.map((uni) => (
              <tr key={uni.nit_uni} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "12px", fontWeight: "600" }}>{uni.nit_uni}</td>
                <td style={{ padding: "12px" }}>{uni.nombre_uni}</td>
                <td style={{ padding: "12px", color: "#7f8c8d" }}>{uni.direccion_uni || "No especificada"}</td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  <button onClick={() => abrirModal(uni)} style={{ backgroundColor: "#3498db", color: "white", border: "none", padding: "5px 10px", borderRadius: "3px", marginRight: "8px", cursor: "pointer" }}>Editar</button>
                  <button onClick={() => manejarEliminar(uni.nit_uni)} style={{ backgroundColor: "#e74c3c", color: "white", border: "none", padding: "5px 10px", borderRadius: "3px", cursor: "pointer" }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalAbierto && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ backgroundColor: "white", padding: "25px", borderRadius: "8px", width: "400px" }}>
            <h3 style={{ marginTop: 0, color: "#2c3e50" }}>{editando ? "Modificar Datos" : "Registrar Universidad"}</h3>
            <form onSubmit={manejarGuardar}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>NIT / Código Identificador:</label>
                <input type="text" value={nitUni} onChange={(e) => setNitUni(e.target.value)} disabled={editando} placeholder="Ej: 890980040-1" required style={{ width: "93%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: editando ? "#f5f5f5" : "white" }} />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Nombre de la Universidad:</label>
                <input type="text" value={nombreUni} onChange={(e) => setNombreUni(e.target.value)} placeholder="Ej: UNIVERSIDAD DE ANTIOQUIA" required style={{ width: "93%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Dirección Principal:</label>
                <input type="text" value={direccionUni} onChange={(e) => setDireccionUni(e.target.value)} placeholder="Ej: Calle 67 # 53 - 108" style={{ width: "93%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "end", gap: "10px" }}>
                <button type="button" onClick={() => setModalAbierto(false)} style={{ backgroundColor: "#95a5a6", color: "white", border: "none", padding: "8px 15px", borderRadius: "4px", cursor: "pointer" }}>Cancelar</button>
                <button type="submit" style={{ backgroundColor: "#2ecc71", color: "white", border: "none", padding: "8px 15px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}