'use client';

import { useSession, signOut, SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// COMPONENTE CONTENEDOR PRINCIPAL (Envoltura Obligatoria para NextAuth)
export default function RoleSelectionPage() {
  return (
    <SessionProvider>
      <RoleSelectionLayout />
    </SessionProvider>
  );
}

// COMPONENTE INTERNO CON LA INTERFAZ DE SELECCIÓN
function RoleSelectionLayout() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirección de seguridad: Si no está autenticado o no es tu correo administrador
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated" && session?.user?.email) {
      const email = session.user.email.toLowerCase().trim();
      // Si de alguna forma entra otro correo aquí, lo mandamos directo a estudiante
      if (email !== "vecrecemosmx@gmail.com") {
        router.push("/student");
      }
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-semibold text-slate-600 animate-pulse">Verificando credenciales de administrador...</p>
      </div>
    );
  }

  return (
    <div className="plataforma-body flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-2xl text-center flex flex-col gap-8">
        
        {/* Encabezado Informativo */}
        <div>
          <span className="logo font-bold text-xl tracking-tight text-sky-600 block mb-3">
            English For All
          </span>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase sm:text-4xl">
            Selector de Rol Docente
          </h1>
          <p className="text-sm font-medium text-slate-500 max-w-md mx-auto mt-2">
            Detectamos tu cuenta de administrador <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono text-xs">vecrecemosmx@gmail.com</code>. Por favor, elige cómo deseas ingresar hoy:
          </p>
        </div>

        {/* CONTENEDOR DE OPCIONES (Tarjetas de Selección) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* OPCIÓN A: ACCEDER COMO ESTUDIANTE */}
          <button
            onClick={() => router.push("/student")}
            className="flex flex-col items-center gap-4 p-8 rounded-3xl border-2 border-slate-200 bg-white shadow-sm transition-all hover:border-sky-500 hover:shadow-md text-center group active:scale-[0.98]"
          >
            <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-sky-500 group-hover:text-white">
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 transition-colors group-hover:text-sky-600">Entrar como Alumno</h2>
              <p className="text-xs text-slate-400 mt-1">Realiza las prácticas de listening, ajusta velocidades y evalúa fonemas.</p>
            </div>
          </button>

          {/* OPCIÓN B: ACCEDER COMO PROFESOR */}
          <button
            onClick={() => router.push("/teacher/dashboard")}
            className="flex flex-col items-center gap-4 p-8 rounded-3xl border-2 border-slate-200 bg-white shadow-sm transition-all hover:border-emerald-500 hover:shadow-md text-center group active:scale-[0.98]"
          >
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-emerald-500 group-hover:text-white">
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 transition-colors group-hover:text-emerald-600">Entrar como Profesor</h2>
              <p className="text-xs text-slate-400 mt-1">Revisa la bitácora de clics, respuestas exactas y tiempos del grupo.</p>
            </div>
          </button>

        </div>

        {/* Botón de salida para desloguearse */}
        <div className="border-t border-slate-200 pt-6">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider transition-colors"
          >
            ← Salir / Cerrar Sesión
          </button>
        </div>

      </div>
    </div>
  );
}
