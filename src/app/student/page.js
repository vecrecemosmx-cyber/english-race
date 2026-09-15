'use client';

import { useSession, signOut, SessionProvider } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// IMPORTACIÓN DE LAS PIEZAS DEL ROMPECABEZAS (Las crearemos a continuación)
import PracticaVocales from './components/PracticaVocales.js';
import PracticaDiptongos from './components/PracticaDiptongos.js';
import PracticaConsonantes from './components/PracticaConsonantes.js';
import AprenderIpa from './components/AprenderIPA.js';

export default function Home() {
  return (
    <SessionProvider>
      <PlataformaFonicaMaestra />
    </SessionProvider>
  );
}

function PlataformaFonicaMaestra() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Estado que define qué pieza del rompecabezas se renderiza activa
  const [currentPractice, setCurrentPractice] = useState('3'); // '3', '4', '5' o 'ipa'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Fijo en falso por defecto

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#F2C83B]">
        <div className="text-xl font-bold text-black uppercase tracking-widest animate-pulse">
          Cargando plataforma...
        </div>
      </div>
    );
  }

  return (
    <div className="plataforma-body w-full min-h-screen text-[#1E293B]" style={{ fontFamily: 'var(--font-redondeada), sans-serif' }}>
      
      {/* HEADER COMPACTO Y CONTROLADO */}
      <header className="app-header flex items-center justify-between px-4 h-16 bg-white border-b border-slate-200">
        <div className="header-left flex items-center gap-3">
          <button 
            id="menu-toggle" 
            className="menu-toggle-btn p-2 rounded-lg hover:bg-slate-100 flex flex-col gap-1"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <span className="w-5 h-0.5 bg-slate-700 block"></span>
            <span className="w-5 h-0.5 bg-slate-700 block"></span>
            <span className="w-5 h-0.5 bg-slate-700 block"></span>
          </button>
          <div className="logo font-bold text-xl text-sky-600">English For All</div>
        </div>

        <div className="avatar w-10 h-10 rounded-full flex items-center justify-center bg-[#F2C83B] text-black font-bold cursor-pointer" onClick={() => signOut({ callbackUrl: "/" })} title="Cerrar Sesión">
          {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </header>

      <div className="app-layout flex relative min-h-[calc(100vh-64px)]">
        
        {/* MENÚ LATERAL IZQUIERDO: Controlado 100% por el estado reactivo */}
        <aside 
          id="sidebar" 
          className={`sidebar fixed top-16 left-0 h-[calc(100vh-64px)] bg-white border-r border-slate-200 z-40 transition-all duration-300 transform ${
            isSidebarOpen ? 'translate-x-0 w-64 block shadow-lg' : '-translate-x-full w-0 hidden'
          }`}
        >
          <h3 className="sidebar-title p-4 font-bold text-xs uppercase text-slate-400 tracking-wider">Ejercicios</h3>
          <ul className="sidebar-menu flex flex-col gap-1 px-2">
            <li className={`menu-item p-3 rounded-xl cursor-pointer font-medium flex gap-2 items-center ${currentPractice === '3' ? 'bg-sky-50 text-sky-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}`} onClick={() => { setCurrentPractice('3'); setIsSidebarOpen(false); }}>
              <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-xs font-bold">3</span>
              <span>Práctica 1: Vocales Cortas</span>
            </li>
            <li className={`menu-item p-3 rounded-xl cursor-pointer font-medium flex gap-2 items-center ${currentPractice === '4' ? 'bg-sky-50 text-sky-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}`} onClick={() => { setCurrentPractice('4'); setIsSidebarOpen(false); }}>
              <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-xs font-bold">4</span>
              <span>Práctica 2: Diptongos</span>
            </li>
            <li className={`menu-item p-3 rounded-xl cursor-pointer font-medium flex gap-2 items-center ${currentPractice === '5' ? 'bg-sky-50 text-sky-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}`} onClick={() => { setCurrentPractice('5'); setIsSidebarOpen(false); }}>
              <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-xs font-bold">5</span>
              <span>Práctica 3: Consonantes</span>
            </li>
            
            {/* 🚀 NUEVA OPCIÓN SOLICITADA EN EL MENÚ */}
            <li className={`menu-item p-3 rounded-xl cursor-pointer flex gap-2 items-center border border-dashed ${currentPractice === 'ipa' ? 'bg-emerald-50 text-emerald-700 font-black border-emerald-300' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`} onClick={() => { setCurrentPractice('ipa'); setIsSidebarOpen(false); }}>
              <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">10</span>
              <span>Aprender a leer inglés en IPA</span>
            </li>
          </ul>
        </aside>

        {/* CONTENEDOR PRINCIPAL: Renderiza dinámicamente la pieza del rompecabezas activa */}
        <main className={`main-container flex-1 p-4 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
          {currentPractice === '3' && <PracticaVocales userEmail={session?.user?.email} />}
          {currentPractice === '4' && <PracticaDiptongos userEmail={session?.user?.email} />}
          {currentPractice === '5' && <PracticaConsonantes userEmail={session?.user?.email} />}
          {currentPractice === 'ipa' && <AprenderIpa />}
        </main>

      </div>
    </div>
  );
}
