'use client';

import { useSession, signOut, SessionProvider } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// COMPONENTE CONTENEDOR PRINCIPAL (Envoltura Obligatoria para NextAuth)
export default function TeacherDashboard() {
  return (
    <SessionProvider>
      <TeacherDashboardLayout />
    </SessionProvider>
  );
}

// COMPONENTE INTERNO CON LA ARQUITECTURA DE CONTROL DOCENTE
function TeacherDashboardLayout() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // CONTROLES DE FILTRADO Y MÓDULOS DE VISTA
  const [selectedGroup, setSelectedGroup] = useState("Grupo A");
  const [selectedStudent, setSelectedStudent] = useState("todos");
  const [viewMode, setViewMode] = useState("recomendador"); // Opciones: recomendador, tablero, matriz, lineaTiempo

  // Redirección de seguridad: Si no está autenticado, vuelve al Login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // DATASET PEDAGÓGICO AVANZADO: Estructura de analíticas para las 4 vistas fónicas
  const studentsMetrics = [
    {
      id: "std-01",
      name: "Carlos Mendoza",
      email: "carlos.mendoza@example.com",
      wordsCompletedToday: 12,
      correctAnswers: 34,
      wrongAnswers: 6,
      totalActiveTime: "1h 15m",
      
      // Métricas Generales de Navegación
      sectionClicks: { vocabulario: 14, fonemas: 22, polisilabas: 8 },
      timePerSection: { vocabulario: "25m", fonemas: "40m", polisilabas: "10m" },
      
      // Diagnóstico Cognitivo (Para Tablero Visual y Radar Fonético)
      vocalAccuracy: 40,      // % de éxito en sonidos vocálicos (Muestra debilidad)
      consonantAccuracy: 90,  // % de éxito en sonidos consonánticos (Muestra fortaleza)
      stressAccuracy: 50,     // % de éxito identificando el acento o énfasis (Stress)
      masteredPhonemes: ["/ə/", "/æ/", "/θ/"],
      criticalPhonemes: ["/ɪ/", "/ʌ/", "/ð/"],
      riskOfFrustration: false,

      // Línea de Tiempo Fónica (Detalle Micro-pasos de la última palabra)
      lastWordPracticed: "Thought",
      questionsTimeline: [
        { qNum: 1, label: "Sonidos totales", timeTaken: "3s", isCorrect: true, input: "3" },
        { qNum: 2, label: "Consonantes", timeTaken: "4s", isCorrect: true, input: "2" },
        { qNum: 3, label: "Vocales", timeTaken: "5s", isCorrect: true, input: "1" },
        { qNum: 4, label: "Énfasis (Stress)", timeTaken: "28s", isCorrect: false, input: "2" },
        { qNum: 5, label: "Fonema correcto", timeTaken: "12s", isCorrect: true, input: "/θ/" }
      ]
    },
    {
      id: "std-02",
      name: "Ana María Silva",
      email: "ana.silva@example.com",
      wordsCompletedToday: 4,
      correctAnswers: 12,
      wrongAnswers: 14,
      totalActiveTime: "42m",
      
      sectionClicks: { vocabulario: 30, fonemas: 12, polisilabas: 4 },
      timePerSection: { vocabulario: "28m", fonemas: "12m", polisilabas: "2m" },
      
      vocalAccuracy: 85,
      consonantAccuracy: 45,
      stressAccuracy: 30,
      masteredPhonemes: ["/æ/", "/aɪ/", "/eɪ/"],
      criticalPhonemes: ["/ʧ/", "/ʤ/", "/ʃ/"],
      riskOfFrustration: true, // Alerta psicológica: Tiempos altos, baja precisión reciente

      lastWordPracticed: "Beautiful",
      questionsTimeline: [
        { qNum: 1, label: "Sonidos totales", timeTaken: "14s", isCorrect: false, input: "6" },
        { qNum: 2, label: "Consonantes", timeTaken: "18s", isCorrect: false, input: "4" },
        { qNum: 3, label: "Vocales", timeTaken: "9s", isCorrect: true, input: "3" },
        { qNum: 4, label: "Énfasis (Stress)", timeTaken: "35s", isCorrect: false, input: "1" },
        { qNum: 5, label: "Fonema correcto", timeTaken: "22s", isCorrect: false, input: "/j/" }
      ]
    }
  ];

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-semibold text-slate-600 animate-pulse">Cargando panel docente modular...</p>
      </div>
    );
  }

  return (
    <div className="plataforma-body min-h-screen flex flex-col bg-slate-50">
      
      {/* HEADER PRINCIPAL DEL DASHBOARD */}
      <header className="app-header">
        <div className="header-left">
          <span className="logo font-bold text-xl tracking-tight text-sky-600">
            English For All <span className="text-xs font-semibold uppercase bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md ml-2">Panel de Control Docente</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">{session?.user?.name || "Profesor Administrador"}</p>
            <p className="text-xs text-slate-500">Rol: Administrador Pedagógico</p>
          </div>
          <div className="avatar cursor-pointer" title="Cerrar sesión" onClick={() => signOut({ callbackUrl: "/" })}>P</div>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6">
        
        {/* FILTROS SUPERIORES DE GRUPO Y ALUMNO */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Análisis Inteligente del Aula</h1>
            <p className="text-sm text-slate-500">Métricas accionables de neuroeducación y pedagogía fónica aplicada.</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <select className="font-dropdown-top text-sm w-full sm:w-auto" value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
              <option value="Grupo A">Grupo A (Intermedio)</option>
              <option value="Grupo B">Grupo B (Cero Absoluto)</option>
            </select>
            <select className="font-dropdown-top text-sm w-full sm:w-auto" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
              <option value="todos">Todos los alumnos (Grupo)</option>
              {studentsMetrics.map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* BOTONES INTERRUPTORES DE CAMBIO DE VISTA (UI MODULAR) */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
          <button onClick={() => setViewMode("recomendador")} className={`px-4 py-2.5 rounded-full text-xs uppercase tracking-wider font-bold transition-all ${viewMode === "recomendador" ? "bg-sky-600 text-white shadow-sm" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}>
            🧠 Recomendador Pedagógico (ZDP)
          </button>
          <button onClick={() => setViewMode("tablero")} className={`px-4 py-2.5 rounded-full text-xs uppercase tracking-wider font-bold transition-all ${viewMode === "tablero" ? "bg-sky-600 text-white shadow-sm" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}>
            🧭 Tablero Visual Diagnóstico
          </button>
          <button onClick={() => setViewMode("matriz")} className={`px-4 py-2.5 rounded-full text-xs uppercase tracking-wider font-bold transition-all ${viewMode === "matriz" ? "bg-sky-600 text-white shadow-sm" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}>
            📊 Matriz Analítica (Tabla)
          </button>
          <button onClick={() => setViewMode("lineaTiempo")} className={`px-4 py-2.5 rounded-full text-xs uppercase tracking-wider font-bold transition-all ${viewMode === "lineaTiempo" ? "bg-sky-600 text-white shadow-sm" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}>
            ⏱️ Línea de Tiempo (Micro-pasos)
          </button>
        </div>

        {/* RENDERS DINÁMICOS BASADOS EN EL MÓDULO SELECCIONADO */}
        
        {/* VISTA 1: EL RECOMENDADOR PEDAGÓGICO */}
        {viewMode === "recomendador" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            <div className="md:col-span-2 flex flex-col gap-4">
              <div className="bg-orange-50 border-l-4 border-orange-500 p-5 rounded-r-2xl shadow-sm">
                <h3 className="text-base font-bold text-orange-800 flex items-center gap-2">⚠️ Alerta de Frustración Inmediata (ZDP Crítica)</h3>
                {studentsMetrics.filter(s => s.riskOfFrustration && (selectedStudent === "todos" || s.id === selectedStudent)).map(s => (
                  <p key={s.id} className="text-sm text-orange-700 mt-2 font-medium">
                    <strong>{s.name}</strong> está estancada. Sus tiempos de duda en patrones rítmicos de palabras polisílabas se triplicaron (promedio de {s.questionsTimeline[3].timeTaken}). <em>Acción sugerida: Detener tareas mecánicas individuales; requiere intervención explícita de división silábica con estímulos corporales (aplausos).</em>
                  </p>
                ))}
                {selectedStudent !== "todos" && !studentsMetrics.find(s => s.id === selectedStudent)?.riskOfFrustration && (
                  <p className="text-sm text-slate-600 mt-2">Este estudiante mantiene una curva de tolerancia al error estable. No hay riesgo detectado.</p>
                )}
              </div>
              <div className="bg-sky-50 border-l-4 border-sky-500 p-5 rounded-r-2xl shadow-sm">
                <h3 className="text-base font-bold text-sky-800">👥 Agrupamiento Inteligente Recomendado para Trabajo en Pares</h3>
                <p className="text-sm text-sky-700 mt-2 leading-relaxed">
                  Para la sesión colaborativa de hoy, sienta a <strong>Carlos Mendoza</strong> (90% en consonantes, 40% en vocales) junto a <strong>Ana María Silva</strong> (45% en consonantes, 85% en vocales). La tutoría entre pares equilibrará los desbalances de discriminación auditiva de forma natural.
                </p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-3">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">🚨 Fonema Crítico del Grupo</h3>
              <div className="bg-red-50 p-4 rounded-2xl text-center border border-red-100">
                <span className="text-4xl font-black text-red-600 font-mono">/ð/</span>
                <p className="text-xs font-bold text-red-800 uppercase mt-2">Confusión por Grafema</p>
                <p className="text-sm text-slate-600 mt-2 leading-tight">El 75% del aula confunde la aproximante dental sonora con la oclusiva en palabras de la Práctica 3. Dedicar los primeros 3 minutos a modelado de espejo labiodental.</p>
              </div>
            </div>
          </div>
        )}

        {/* VISTA 2: EL TABLERO PEDAGÓGICO VISUAL */}
        {viewMode === "tablero" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
            {studentsMetrics.filter(s => selectedStudent === "todos" || s.id === selectedStudent).map(student => (
              <div key={student.id} className="md:col-span-12 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6 flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-slate-800">{student.name}</h3>
                  <p className="text-xs text-slate-400 font-medium mb-4">{student.email}</p>
                  <div className="flex flex-col gap-2">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-500 mb-1"><span>Reconocimiento de Vocales</span><span>{student.vocalAccuracy}%</span></div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="bg-sky-500 h-full rounded-full" style={{ width: `${student.vocalAccuracy}%` }}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-500 mb-1"><span>Reconocimiento de Consonantes</span><span>{student.consonantAccuracy}%</span></div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full rounded-full" style={{ width: `${student.consonantAccuracy}%` }}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-500 mb-1"><span>Identificación de Énfasis (Stress)</span><span>{student.stressAccuracy}%</span></div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="bg-amber-500 h-full rounded-full" style={{ width: `${student.stressAccuracy}%` }}></div></div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 justify-center">
                  {/* Corregido usando entidades HTML para evitar el error de Unexpected Token */}
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">🟩 Fonemas Dominados (&gt;85%)</span>
                  <div className="flex flex-wrap gap-2">{student.masteredPhonemes.map(p => <span key={p} className="bg-emerald-50 text-emerald-700 font-mono text-sm font-black px-3 py-1 rounded-xl border border-emerald-100">{p}</span>)}</div>
                </div>
                <div className="flex flex-col gap-2 justify-center">
                  {/* Corregido usando entidades HTML para evitar el error de Unexpected Token */}
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">🟥 Fonemas Críticos (&lt;50%)</span>
                  <div className="flex flex-wrap gap-2">{student.criticalPhonemes.map(p => <span key={p} className="bg-red-50 text-red-700 font-mono text-sm font-black px-3 py-1 rounded-xl border border-red-100">{p}</span>)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VISTA 3: LA MATRIZ ANALÍTICA DE RENDIMIENTO (TABLA GENERAL) */}
        {viewMode === "matriz" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th scope="col" className="px-6 py-4">Estudiante</th>
                    <th scope="col" className="px-6 py-4">Tiempo Activo</th>
                    <th scope="col" className="px-6 py-4">Clicks Menú</th>
                    <th scope="col" className="px-6 py-4">Aciertos (OK)</th>
                    <th scope="col" className="px-6 py-4">Errores (Fail)</th>
                    <th scope="col" className="px-6 py-4">Precisión Fónica</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 border-t border-slate-100">
                  {studentsMetrics
                    .filter(s => selectedStudent === "todos" || s.id === selectedStudent)
                    .map(student => {
                      const totalQuestions = student.correctAnswers + student.wrongAnswers;
                      const globalAccuracy = totalQuestions > 0 ? Math.round((student.correctAnswers / totalQuestions) * 100) : 0;
                      const totalClicks = student.sectionClicks.vocabulario + student.sectionClicks.fonemas + student.sectionClicks.polisilabas;

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-800">{student.name}</div>
                            <div className="text-xs text-slate-400">{student.email}</div>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-700">{student.totalActiveTime}</td>
                          <td className="px-6 py-4 text-slate-500">{totalClicks} clics</td>
                          <td className="px-6 py-4"><span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{student.correctAnswers}</span></td>
                          <td className="px-6 py-4"><span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">{student.wrongAnswers}</span></td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-800">{globalAccuracy}%</span>
                              <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${globalAccuracy >= 70 ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{ width: `${globalAccuracy}%` }}></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VISTA 4: LA LÍNEA DE TIEMPO FÓNICA (DETALLE MICRO-PASOS) */}
        {viewMode === "lineaTiempo" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {studentsMetrics
              .filter(s => selectedStudent === "todos" || s.id === selectedStudent)
              .map(student => (
                <div key={student.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 gap-2">
                    <div>
                      <h2 className="text-base font-bold text-slate-800">{student.name}</h2>
                      <p className="text-xs text-slate-400">Análisis detallado del último reto: <strong className="text-sky-600 font-semibold">"{student.lastWordPracticed}"</strong></p>
                    </div>
                    <span className="bg-slate-100 text-slate-700 font-bold text-xs px-3 py-1 rounded-full">Sesión: {student.totalActiveTime}</span>
                  </div>

                  {/* Renderizado de Micro-pasos (Tiempos por Pregunta) */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {student.questionsTimeline.map(step => (
                      <div key={step.qNum} className={`p-4 rounded-2xl border text-center flex flex-col justify-between gap-1 shadow-sm transition-all ${
                        step.isCorrect ? 'bg-white border-slate-200 hover:border-emerald-200' : 'bg-orange-50/50 border-orange-100'
                      }`}>
                        <div>
                          <span className="text-2xl font-black block text-slate-300 font-mono">Q{step.qNum}</span>
                          <span className="text-xs font-bold text-slate-500 block leading-tight mb-2">{step.label}</span>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-400">Ingresó:</div>
                          <code className="text-xs font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 block max-w-full truncate">{step.input || "(vacío)"}</code>
                          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs font-bold">
                            <span className="text-slate-400">⏱️ {step.timeTaken}</span>
                            <span className={step.isCorrect ? 'text-emerald-600' : 'text-orange-600'}>
                              {step.isCorrect ? '✔ OK' : '❌ Fail'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

      </main>
    </div>
  );
}
