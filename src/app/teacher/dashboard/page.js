'use client';

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Estados de navegación del panel del profesor
  const [selectedStudent, setSelectedStudent] = useState("todos");
  const [timeFilter, setTimeFilter] = useState("hoy");

  // Redirección de seguridad: Si no está autenticado, vuelve al Login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // DATASET SIMULADO: Estructura exacta basada en tus requerimientos de métricas
  const studentsMetrics = [
    {
      id: "std-01",
      name: "Carlos Mendoza",
      email: "carlos.mendoza@example.com",
      wordsCompletedToday: 12,
      correctAnswers: 34,
      wrongAnswers: 6,
      totalActiveTime: "1h 15m",
      sectionClicks: { vocabulario: 14, fonemas: 22, polisilabas: 8 },
      timePerSection: { vocabulario: "25m", fonemas: "40m", polisilabas: "10m" },
      recentAnswers: [
        { word: "Thought", studentInput: "thot", isCorrect: false, timeTaken: "12s" },
        { word: "Through", studentInput: "through", isCorrect: true, timeTaken: "8s" },
        { word: "Beautiful", studentInput: "beautiful", isCorrect: true, timeTaken: "15s" }
      ]
    },
    {
      id: "std-02",
      name: "Ana María Silva",
      email: "ana.silva@example.com",
      wordsCompletedToday: 15,
      correctAnswers: 42,
      wrongAnswers: 3,
      totalActiveTime: "58m",
      sectionClicks: { vocabulario: 30, fonemas: 12, polisilabas: 4 },
      timePerSection: { vocabulario: "38m", fonemas: "15m", polisilabas: "5m" },
      recentAnswers: [
        { word: "Apple", studentInput: "apple", isCorrect: true, timeTaken: "4s" },
        { word: "Cat", studentInput: "kat", isCorrect: false, timeTaken: "6s" },
        { word: "Comfortable", studentInput: "comfortable", isCorrect: true, timeTaken: "22s" }
      ]
    }
  ];

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-semibold text-slate-600 animate-pulse">Cargando panel docente...</p>
      </div>
    );
  }

  return (
    <div className="plataforma-body min-h-screen flex flex-col bg-slate-50">
      
      {/* =========================================================
         HEADER DEL DASHBOARD (CABECERA DOCENTE)
         ========================================================= */}
      <header className="app-header">
        <div className="header-left">
          <span className="logo font-bold text-xl tracking-tight text-sky-600">
            English For All <span className="text-xs font-semibold uppercase bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md ml-2">Panel Docente</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">{session?.user?.name || "Profesor Administrador"}</p>
            <p className="text-xs text-slate-500">{session?.user?.email || "docente@plataforma.com"}</p>
          </div>
          <div 
            className="avatar cursor-pointer" 
            title="Cerrar sesión"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            P
          </div>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6">
        
        {/* BARRA DE FILTROS Y HERRAMIENTAS */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Seguimiento de Alumnos</h1>
            <p className="text-sm text-slate-500">Monitorea el rendimiento, tiempos de respuesta y navegación en tiempo real.</p>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            {/* Selector de Alumno */}
            <select 
              className="font-dropdown-top text-sm w-full sm:w-auto"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="todos">Todos los alumnos</option>
              {studentsMetrics.map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>

            {/* Selector de Tiempo */}
            <select 
              className="font-dropdown-top text-sm w-full sm:w-auto"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="hoy">Métricas de Hoy</option>
              <option value="semana">Esta Semana</option>
              <option value="mes">Este Mes</option>
            </select>
          </div>
        </div>

        {/* =========================================================
           CONTENEDOR DE TARJETAS DE MÉTRICAS GLOBALES
           ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Palabras Terminadas</span>
            <span className="text-3xl font-extrabold text-slate-800">27</span>
            <span className="text-xs text-emerald-600 font-semibold mt-1">↑ Completadas hoy</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preguntas Correctas</span>
            <span className="text-3xl font-extrabold text-emerald-600">76</span>
            <span className="text-xs text-slate-400 mt-1">Efectividad global del grupo</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preguntas Incorrectas</span>
            <span className="text-3xl font-extrabold text-orange-500">9</span>
            <span className="text-xs text-slate-400 mt-1">Requieren reforzamiento fonético</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tiempo Activo Promedio</span>
            <span className="text-3xl font-extrabold text-sky-600">1h 06m</span>
            <span className="text-xs text-slate-400 mt-1">Permanencia por sesión activa</span>
          </div>
        </div>

        {/* =========================================================
           DETALLE COMPLETO Y REPORTE INDIVIDUAL
           ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUMNA IZQUIERDA Y CENTRAL: Bitácora de respuestas y Clics (2 columnas) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {studentsMetrics
              .filter(s => selectedStudent === "todos" || s.id === selectedStudent)
              .map(student => (
                <div key={student.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-2">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">{student.name}</h2>
                      <p className="text-xs text-slate-400">{student.email}</p>
                    </div>
                    <div className="flex gap-2 text-xs font-bold">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">Activo: {student.totalActiveTime}</span>
                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">{student.correctAnswers} OK</span>
                      <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full">{student.wrongAnswers} Error</span>
                    </div>
                  </div>

                  {/* SUBMÓDULO: Tiempos y clics por sección */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Comportamiento de Navegación</h3>
                    <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Vocabulario</p>
                        <p className="text-sm font-bold text-slate-700">{student.timePerSection.vocabulario} <span className="text-xs font-normal text-slate-400">({student.sectionClicks.vocabulario} clics)</span></p>
                      </div>
                      <div className="border-x border-slate-200">
                        <p className="text-xs text-slate-500 font-medium">Fonemas</p>
                        <p className="text-sm font-bold text-slate-700">{student.timePerSection.fonemas} <span className="text-xs font-normal text-slate-400">({student.sectionClicks.fonemas} clics)</span></p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Polisílabas</p>
                        <p className="text-sm font-bold text-slate-700">{student.timePerSection.polisilabas} <span className="text-xs font-normal text-slate-400">({student.sectionClicks.polisilabas} clics)</span></p>
                      </div>
                    </div>
                  </div>

                  {/* SUBMÓDULO: Historial exacto de respuestas */}
                  <div className="mt-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Historial de Respuestas Recientes</h3>
                    <div className="flex flex-col gap-2">
                      {student.recentAnswers.map((ans, index) => (
                        <div key={index} className="flex justify-between items-center text-sm p-2.5 rounded-xl border border-slate-100 bg-white">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                            <span className="font-semibold text-slate-700 w-24">Reto: "{ans.word}"</span>
                            <span className="text-slate-500">Ingresó: <code className="bg-slate-50 px-1.5 py-0.5 rounded text-xs font-mono">{ans.studentInput || "(vacío)"}</code></span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400 font-medium">Tardó: {ans.timeTaken}</span>
                            <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                              ans.isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-orange-100 text-orange-800"
                            }`}>
                              {ans.isCorrect ? "Correcta" : "Incorrecta"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* COLUMNA DERECHA: Resumen de Rendimiento de Alumnos (1 columna) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4 h-fit">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">Tabla de Posiciones Diario</h2>
            <div className="flex flex-col gap-3">
              {studentsMetrics.map((student, idx) => (
                <div key={student.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-400 w-4">#{idx + 1}</span>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{student.name}</p>
                      <p className="text-xs text-slate-400">{student.wordsCompletedToday} palabras listas</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    {Math.round((student.correctAnswers / (student.correctAnswers + student.wrongAnswers)) * 100)}% de éxito
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
