'use client';

import { useSession, signOut, SessionProvider } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

// COMPONENTE CONTENEDOR PRINCIPAL (Envoltura Obligatoria para NextAuth)
export default function TeacherDashboard() {
  return (
    <SessionProvider>
      <TeacherDashboardLayout />
    </SessionProvider>
  );
}

function TeacherDashboardLayout() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // CONTROLES DE FILTRADO Y MÓDULOS DE VISTA
  const [selectedGroup, setSelectedGroup] = useState("Grupo A");
  const [selectedStudent, setSelectedStudent] = useState("todos");
  const [viewMode, setViewMode] = useState("recomendador"); // Opciones: recomendador, tablero, matriz, lineaTiempo, solicitudes

  // SOLICITUDES DE ACCESO REALES TRAÍDAS DE SUPABASE
  const [solicitudesEspera, setSolicitudesEspera] = useState([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  const [metricasReales, setMetricasReales] = useState([]);
  const [loadingMetricas, setLoadingMetricas] = useState(true);

  // 🚀 ESTADO NUEVO: Controla el proceso de carga individual de cada botón de aprobación
  const [procesandoAprovacionId, setProcesandoAprovacionId] = useState(null);

  // Redirección de seguridad: Si no está autenticado, vuelve al Login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // LÓGICA: Consulta en tiempo real los correos que solicitaron acceso
  const cargarSolicitudesReales = async () => {
    setLoadingSolicitudes(true);
    try {
      const res = await fetch('/api/get-solicitudes');
      if (res.ok) {
        const data = await res.json();
        setSolicitudesEspera(data.solicitudes || []);
      }
    } catch (err) {
      console.error("Error al conectar con la base de datos de espera:", err);
    } finally {
      setLoadingSolicitudes(false);
    }
  };

  // Disparador automático para refrescar las solicitudes cuando entres a esa pestaña
  useEffect(() => {
    if (viewMode === "solicitudes") {
      cargarSolicitudesReales();
    }
  }, [viewMode]);

  // 🚀 REGLA NUEVA: FUNCIÓN CENTRALIZADA PARA APROBAR USUARIOS EN TIEMPO REAL
  const handleAprobarAccesoUsuario = async (idSolicitud, emailUsuario) => {
    if (!idSolicitud || !emailUsuario) return;
    
    // Bloqueamos el botón correspondiente para evitar doble clic
    setProcesandoAprovacionId(idSolicitud);

    try {
      // ✈️ TRANSMISIÓN REAL: Enviamos el paquete de aprobación a tu API de Supabase
      const respuesta = await fetch('/api/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idSolicitud, email: emailUsuario.toLowerCase().trim() })
      });

      if (respuesta.ok) {
        // ACTUALIZACIÓN VISUAL ATÓMICA: Removemos el correo aprobado del buzón del profesor de inmediato
        setSolicitudesEspera((listaPrev) => listaPrev.filter((item) => item.id !== idSolicitud));
        alert(`✓ El usuario ${emailUsuario} ha sido agregado con éxito a la lista blanca y ya puede ingresar.`);
      } else {
        const dataError = await respuesta.json();
        alert(`🚨 Error al aprobar: ${dataError.error || "Ocurrió un problema en el servidor."}`);
      }
    } catch (err) {
      console.error("🚨 Error crítico en la conexión física de aprobación:", err);
      alert("🚨 Error de red: No se pudo completar la aprobación en Supabase.");
    } finally {
      // Liberamos el estado de carga
      setProcesandoAprovacionId(null);
    }
  };

  // LOGICA: EXPORTADOR NATIVO A ARCHIVO CSV (Lista de Espera)
  const exportarListaEsperaCSV = () => {
    if (solicitudesEspera.length === 0) {
      alert("⚠️ No hay correos registrados en la lista de espera para exportar.");
      return;
    }

    let contenidoCSV = "Email;Fecha de Solicitud\n";
    solicitudesEspera.forEach(solicitud => {
      const fechaFormateada = new Date(solicitud.fecha_solicitud).toLocaleString('es-MX');
      contenidoCSV += `${solicitud.email};${fechaFormateada}\n`;
    });

    const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const urlDescarga = URL.createObjectURL(blob);
    const vinculoFantasma = document.createElement("a");
    vinculoFantasma.setAttribute("href", urlDescarga);
    vinculoFantasma.setAttribute("download", `lista_de_espera_efa.csv`);
    vinculoFantasma.style.visibility = 'hidden';
    document.body.appendChild(vinculoFantasma);
    vinculoFantasma.click();
    document.body.removeChild(vinculoFantasma);
  };

  return (
    <>
        {/* VISTA: CONTROL DE LA LISTA DE ESPERA Y EXPORTACIÓN REAL */}
        {viewMode === "solicitudes" && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex-wrap gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">Buzón de Solicitudes Pendientes</h3>
                <p className="text-xs text-slate-500">Usuarios externos que intentaron acceder a la Beta Privada y solicitan tu autorización.</p>
              </div>
              <button
                onClick={exportarListaEsperaCSV}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-full shadow-sm active:scale-95 transition-all"
              >
                📥 Exportar Lista (.CSV)
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              {loadingSolicitudes ? (
                <div className="p-8 text-center text-sm font-semibold text-slate-500 animate-pulse">Consultando datos verídicos en Supabase...</div>
              ) : solicitudesEspera.length === 0 ? (
                <div className="p-8 text-center text-sm font-semibold text-slate-500">No hay solicitudes de acceso pendientes por el momento.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th scope="col" className="px-6 py-4">Correo Electrónico Externo</th>
                        <th scope="col" className="px-6 py-4">Fecha e Hora de Registro</th>
                        {/* 🚀 NUEVA COLUMNA DE ACCIONES DOCENTES */}
                        <th scope="col" className="px-6 py-4 text-center">Acción Administrativa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 border-t border-slate-100">
                      {solicitudesEspera.map((solicitud) => (
                        <tr key={solicitud.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-800">{solicitud.email}</td>
                          <td className="px-6 py-4 font-medium text-slate-500">
                            {new Date(solicitud.fecha_solicitud).toLocaleString('es-MX')}
                          </td>
                          {/* 🚀 BOTÓN DE APROBACIÓN INTEGRADO AL LADO DEL CORREO */}
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleAprobarAccesoUsuario(solicitud.id, solicitud.email)}
                              disabled={procesandoAprovacionId !== null}
                              className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-sm transform active:scale-95 ${
                                procesandoAprovacionId === solicitud.id
                                  ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed animate-pulse'
                                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
                              }`}
                            >
                              {procesandoAprovacionId === solicitud.id ? "Aprobando..." : "✓ Aprobar Acceso"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
    </>
  );
}
