// Nueva Pantalla Raíz de Bienvenida y Gateway
// Guardar exactamente en: src/app/page.js (Longitud segura)

'use client';

import React from 'react';
import Link from 'next/link';

export default function HomeGateway() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* EFECTO DE LUZ DE AMBIENTE INMERSIVO EN EL FONDO */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none select-none" />

      {/* CONTENEDOR CENTRAL DE BIENVENIDA */}
      <div className="max-w-xl w-full text-center flex flex-col items-center gap-6 z-10 animate-fade-in">
        
        {/* ETIQUETA DE ESTADO ACADÉMICO */}
        <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-sky-950 text-sky-400 px-3 py-1.5 rounded-full border border-sky-900/60 shadow-md">
          EFA Global Platform
        </span>

        {/* LOGOTIPO / TÍTULO PRINCIPAL REDONDEADO */}
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mt-2 leading-none">
          English For All
        </h1>

        {/* SUBTÍTULO PEDAGÓGICO */}
        <p className="text-sm sm:text-base font-bold text-slate-400 leading-relaxed max-w-md">
          Acelerador de fluidez instantánea basado en inmersión directa en video nativo, conciencia fónica e IA vectorial.
        </p>

        {/* BOTÓN PREMIUM DE ACCESO AL DASHBOARD INTERACTIVO */}
        <div className="w-full max-w-xs mt-4">
          <Link href="/student" prefetch={true} className="block w-full py-4 px-6 bg-sky-600 hover:bg-sky-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-sky-500/10 hover:shadow-sky-500/20 text-center transition-all duration-200 transform active:scale-[0.98] border border-sky-400/20">
            Ingresar a Practicar ➔
          </Link>
        </div>

        {/* NOTA AL PIE DE LA ARQUITECTURA */}
        <p className="text-[10px] font-mono font-bold text-slate-600 tracking-wider mt-8 select-none">
          Direct Method System • Next.js + Supabase Vectorial v3.0
        </p>
      </div>

    </div>
  );
}
