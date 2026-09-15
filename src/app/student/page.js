'use client';

import { useSession, signOut, SessionProvider } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// IMPORTACIÓN DE LAS PIEZAS DEL ROMPECABEZAS (Las conectamos al centro)
import PracticaVocales from './components/PracticaVocales';

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
  
  // --- ESTADOS DE CONTROL GLOBALES (INTEGRALES DEL ORIGINAL) ---
  const [currentPractice, setCurrentPractice] = useState('3'); 
  const [currentFonema, setCurrentFonema] = useState('ə'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1.25);
  const [clicsMenuContador, setClicsMenuContador] = useState(0);

  // 🚀 REGLA DE RESPONSIVIDAD: SCROLL AUTOMÁTICO INICIAL EN CELULARES (ORIGINAL)
  useEffect(() => {
    if (status === "authenticated") {
      const esCelular = window.matchMedia("(max-width: 768px)").matches;
      if (esCelular) {
        setTimeout(() => {
          const contenedorPregunta = document.getElementById('instruction-card-root');
          if (contenedorPregunta) {
            contenedorPregunta.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 600);
      }
    }
  }, [status]);

  // 🚀 REPRODUCCIÓN EXCLUSIVA PARA NUEVOS USUARIOS VÍA LOCALSTORAGE (ORIGINAL)
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      const emailLimpio = session.user.email.toLowerCase().trim();
      const llaveMemoria = `efa_welcome_played_${emailLimpio}`;
      const yaEscuchoBienvenida = localStorage.getItem(llaveMemoria);
      
      if (!yaEscuchoBienvenida) {
        const timer = setTimeout(() => {
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const guion = "Bienvenido a la práctica de hoy, el objetivo de este ejercicio es crear conciencia fonológica del idioma inglés. Elige el fonema que quieres practicar hoy y comencemos.";
            const utterance = new SpeechSynthesisUtterance(guion);
            utterance.lang = 'es-MX';
            window.speechSynthesis.speak(utterance);
            localStorage.setItem(llaveMemoria, "true");
          }
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [status, session]);

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

      {/* HEADER ORIGINAL COMPLETO */}
      <header className="app-header flex items-center justify-between px-4 h-16 bg-white border-b border-slate-200 fixed top-0 left-0 right-0 z-50 shadow-sm">
        <div className="header-left flex items-center gap-3">
          <button 
            id="menu-toggle" 
            className="menu-toggle-btn p-2 rounded-xl hover:bg-slate-100 flex flex-col justify-center items-center gap-1 w-10 h-10 transition-colors"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <span className={`w-5 h-0.5 bg-slate-700 block transition-all duration-300 ${isSidebarOpen ? 'transform rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`w-5 h-0.5 bg-slate-700 block transition-all duration-300 ${isSidebarOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-5 h-0.5 bg-slate-700 block transition-all duration-300 ${isSidebarOpen ? 'transform -rotate-45 -translate-y-1.5' : ''}`}></span>
          </button>
          <div className="logo font-black text-xl text-sky-600 tracking-tight">English For All</div>
        </div>

        <div className="avatar w-10 h-10 rounded-full flex items-center justify-center bg-[#F2C83B] text-black font-bold cursor-pointer transition-transform active:scale-95" onClick={() => signOut({ callbackUrl: "/" })} title="Haz clic para Cerrar Sesión">
          {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </header>

      <div className="app-layout flex pt-16 min-h-[calc(100vh-64px)] relative overflow-x-hidden">
        
        {/* MENÚ LATERAL IZQUIERDO CON LAS 9 OPCIONES ORIGINALES INTACTAS */}
        <aside 
          id="sidebar" 
          className={`sidebar fixed top-16 left-0 h-[calc(100vh-64px)] bg-white border-r border-slate-200 z-40 transition-all duration-300 ease-in-out shadow-xl w-64 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <h3 className="sidebar-title p-4 font-black text-xs uppercase text-slate-400 tracking-widest border-b border-slate-50">Ejercicios de Práctica</h3>
          <ul className="sidebar-menu flex flex-col gap-1 px-3 mt-3">
            <li className="menu-item p-3 rounded-2xl cursor-pointer text-slate-600 hover:bg-slate-50 font-bold flex gap-3 items-center" onClick={() => { setClicsMenuContador(prev => prev + 1); setIsSidebarOpen(false); }}><span className="w-6 h-6 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black">1</span><span>Metodología</span></li>
            <li className="menu-item p-3 rounded-2xl cursor-pointer text-slate-600 hover:bg-slate-50 font-bold flex gap-3 items-center" onClick={() => { setClicsMenuContador(prev => prev + 1); setIsSidebarOpen(false); }}><span className="w-6 h-6 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black">2</span><span>Alfabeto de fonemas</span></li>
            <li className={`menu-item p-3 rounded-2xl cursor-pointer font-bold flex gap-3 items-center transition-all ${currentPractice === '3' ? 'bg-sky-50 text-sky-600 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`} onClick={() => { setCurrentPractice('3'); setClicsMenuContador(prev => prev + 1); setIsSidebarOpen(false); }}><span className="w-6 h-6 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black">3</span><span>Práctica 1: Vocales Cortas</span></li>
            <li className="menu-item p-3 rounded-2xl cursor-pointer text-slate-600 hover:bg-slate-50 font-bold flex gap-3 items-center" onClick={() => { setClicsMenuContador(prev => prev + 1); setIsSidebarOpen(false); }}><span className="w-6 h-6 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black">4</span><span>Práctica 2: Diptóngos</span></li>
            <li className="menu-item p-3 rounded-2xl cursor-pointer text-slate-600 hover:bg-slate-50 font-bold flex gap-3 items-center" onClick={() => { setClicsMenuContador(prev => prev + 1); setIsSidebarOpen(false); }}><span className="w-6 h-6 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black">5</span><span>Práctica 3: Consonantes</span></li>
            <li className="menu-item p-3 rounded-2xl cursor-pointer text-slate-600 hover:bg-slate-50 font-bold flex gap-3 items-center" onClick={() => { setClicsMenuContador(prev => prev + 1); setIsSidebarOpen(false); }}><span className="w-6 h-6 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black">6</span><span>Primeros Grafemas</span></li>
            <li className="menu-item p-3 rounded-2xl cursor-pointer text-slate-600 hover:bg-slate-50 font-bold flex gap-3 items-center" onClick={() => { setClicsMenuContador(prev => prev + 1); setIsSidebarOpen(false); }}><span className="w-6 h-6 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black">7</span><span>Sopa de letras</span></li>
            <li className="menu-item p-3 rounded-2xl cursor-pointer text-slate-600 hover:bg-slate-50 font-bold flex gap-3 items-center" onClick={() => { setClicsMenuContador(prev => prev + 1); setIsSidebarOpen(false); }}><span className="w-6 h-6 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black">8</span><span>Flashcards significados</span></li>
            <li className="menu-item p-3 rounded-2xl cursor-pointer text-slate-600 hover:bg-slate-50 font-bold flex gap-3 items-center" onClick={() => { setClicsMenuContador(prev => prev + 1); setIsSidebarOpen(false); }}><span className="w-6 h-6 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black">9</span><span>Frases</span></li>
          </ul>
        </aside>

        {/* Overlay translúcido para cerrar el sidebar */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-30 transition-opacity md:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* CONTENEDOR PRINCIPAL: EXCLUSIVO Y RESPONSIVO EN ANCHO COMPLETO */}
        <main className="main-container flex-1 p-4 md:p-8 w-full mx-auto transition-all duration-300 flex flex-col justify-start items-center">
          {currentPractice === '3' && (
            <PracticaVocales 
              userEmail={session?.user?.email} 
              globalSpeed={audioSpeed} 
              setGlobalSpeed={setAudioSpeed}
              menuClics={clicsMenuContador}
            />
          )}
        </main>

      </div>
    </div>
  );
}
