'use client';

import { useSession, signOut, SessionProvider } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// IMPORTACIÓN DE LAS PIEZAS DEL ROMPECABEZAS (COMPONENTES MODULARES)
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
  
  const [currentPractice, setCurrentPractice] = useState('3'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

  // 🚀 REPARACIÓN B: RESTAURACIÓN DEL AUDIO DE BIENVENIDA AUTOMÁTICO EN ESPAÑOL
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email && currentPractice !== 'ipa') {
      const emailLimpio = session.user.email.toLowerCase().trim();
      const llaveMemoria = `efa_welcome_played_${emailLimpio}`;
      const yaEscuchoBienvenida = localStorage.getItem(llaveMemoria);
      
      if (!yaEscuchoBienvenida) {
        const timer = setTimeout(() => {
          try {
            window.speechSynthesis.cancel();
            const guion = "Bienvenido a la práctica de hoy, el objetivo de este ejercicio es crear conciencia fonológica del idioma inglés. Elige el fonema que quieres practicar hoy y comencemos.";
            const utterance = new SpeechSynthesisUtterance(guion);
            utterance.lang = 'es-MX';
            window.speechSynthesis.speak(utterance);
            localStorage.setItem(llaveMemoria, "true");
          } catch (err) {
            console.log("Error en audio automático:", err);
          }
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [status, session, currentPractice]);

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
    <div className="plataforma-body w-full min-h-screen bg-slate-50 text-[#1E293B]" style={{ fontFamily: 'var(--font-redondeada), sans-serif' }}>
      
      {/* 🚀 REPARACIÓN 1: HEADER CON HAMBURGUESA VINCULADA AL ESTADO REACTIVO */}
      <header className="app-header fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-16 bg-white border-b border-slate-200 shadow-sm">
        <div className="header-left flex items-center gap-3">
          <button 
            id="menu-toggle" 
            aria-label="Abrir menú"
            className="menu-toggle-btn p-2 rounded-xl hover:bg-slate-100 flex flex-col justify-center items-center gap-1 w-10 h-10 transition-colors"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <span className={`w-5 h-0.5 bg-slate-700 block transition-all duration-300 ${isSidebarOpen ? 'transform rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`w-5 h-0.5 bg-slate-700 block transition-all duration-300 ${isSidebarOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-5 h-0.5 bg-slate-700 block transition-all duration-300 ${isSidebarOpen ? 'transform -rotate-45 -translate-y-1.5' : ''}`}></span>
          </button>
          <div className="logo font-black text-xl text-sky-600 tracking-tight">English For All</div>
        </div>

        <div className="avatar w-10 h-10 rounded-full flex items-center justify-center bg-[#F2C83B] text-black font-bold cursor-pointer transition-transform active:scale-95" onClick={() => signOut({ callbackUrl: "/" })} title="Cerrar Sesión">
          {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </header>

      <div className="app-layout flex pt-16 min-h-screen relative overflow-x-hidden">
        
        {/* 🚀 REPARACIÓN 1 CON OVERLAY: MENÚ LATERAL IZQUIERDO OCULTO POR DEFECTO EN AMBOS */}
        <aside 
          id="sidebar" 
          className={`sidebar fixed top-16 left-0 h-[calc(100vh-64px)] bg-white border-r border-slate-200 z-40 transition-all duration-300 ease-in-out shadow-xl w-64 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <h3 className="sidebar-title p-4 font-black text-xs uppercase text-slate-400 tracking-widest border-b border-slate-50">Menú de Prácticas</h3>
          <ul className="sidebar-menu flex flex-col gap-1 px-3 mt-3">
            <li className={`menu-item p-3 rounded-2xl cursor-pointer font-bold flex gap-3 items-center transition-all ${currentPractice === '3' ? 'bg-sky-50 text-sky-600 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`} onClick={() => { setCurrentPractice('3'); setIsSidebarOpen(false); }}>
              <span className="w-6 h-6 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black">3</span>
              <span>Práctica 1: Vocales Cortas</span>
            </li>
            <li className={`menu-item p-3 rounded-2xl cursor-pointer font-bold flex gap-3 items-center transition-all ${currentPractice === '4' ? 'bg-sky-50 text-sky-600 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`} onClick={() => { setCurrentPractice('4'); setIsSidebarOpen(false); }}>
              <span className="w-6 h-6 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black">4</span>
              <span>Práctica 2: Diptongos</span>
            </li>
            <li className={`menu-item p-3 rounded-2xl cursor-pointer font-bold flex gap-3 items-center transition-all ${currentPractice === '5' ? 'bg-sky-50 text-sky-600 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`} onClick={() => { setCurrentPractice('5'); setIsSidebarOpen(false); }}>
              <span className="w-6 h-6 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black">5</span>
              <span>Práctica 3: Consonantes</span>
            </li>
            
            {/* OPCIÓN ADICIONAL EN EL MENÚ */}
            <li className={`menu-item p-3 rounded-2xl cursor-pointer flex gap-3 items-center border transition-all ${currentPractice === 'ipa' ? 'bg-emerald-50 text-emerald-700 font-black border-emerald-200 shadow-sm' : 'text-slate-600 border-transparent hover:bg-slate-50'}`} onClick={() => { setCurrentPractice('ipa'); setIsSidebarOpen(false); }}>
              <span className="w-6 h-6 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">10</span>
              <span>Aprender a leer inglés en IPA</span>
            </li>
          </ul>
        </aside>

        {/* Capa traslúcida oscura para cerrar el menú en móviles o compu al hacer clic fuera */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-30 transition-opacity" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* 🚀 REPARACIÓN COMPU RESPONSIVA: CONTENEDOR ANCHO NO LIMITADO EN MONITOR GRANDE */}
        <main className="main-container flex-1 p-4 md:p-8 w-full max-w-none md:max-w-7xl mx-auto transition-all duration-300 flex flex-col justify-start items-center">
          {currentPractice === '3' && <PracticaVocales userEmail={session?.user?.email} />}
          {currentPractice === '4' && <PracticaDiptongos userEmail={session?.user?.email} />}
          {currentPractice === '5' && <PracticaConsonantes userEmail={session?.user?.email} />}
          {currentPractice === 'ipa' && <AprenderIpa />}
        </main>

      </div>
    </div>
  );
}
