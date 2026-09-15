'use client';

import { useSession, signOut, SessionProvider } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// IMPORTACIÓN DE LAS PIEZAS DEL ROMPECABEZAS (COMPONENTES MODULARES)
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
  
  const [currentPractice, setCurrentPractice] = useState('3'); 
  const [currentFonema, setCurrentFonema] = useState('ə'); 
  const [audioSpeed, setAudioSpeed] = useState(1.25);
  const [clicsMenuContador, setClicsMenuContador] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sincronización reactiva del botón de hamburguesa único
  const handleToggleSidebarUnificado = (e) => {
    if (e) e.stopPropagation();
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Scroll automático inicial a la pregunta
  useEffect(() => {
    if (status === "authenticated") {
      setTimeout(() => {
        const contenedorPregunta = document.getElementById('instruction-card-root');
        if (contenedorPregunta) {
          contenedorPregunta.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 800); 
    }
  }, [status]);

  // Audio de bienvenida automático en español original
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email && currentPractice !== 'ipa') {
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
    <div className="plataforma-body w-full min-h-screen text-[#1E293B]" style={{ fontFamily: 'var(--font-redondeada), sans-serif' }}>

      {/* HEADER ORIGINAL UNIFICADO (Totalmente visible y en su lugar) */}
      <header className="app-header">
        <div className="header-left">
          <button id="menu-toggle" className="menu-toggle-btn" onClick={handleToggleSidebarUnificado}>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
          <div className="logo">English For All</div>
        </div>

        <div className="avatar" onClick={() => signOut({ callbackUrl: "/" })} style={{ cursor: 'pointer', backgroundColor: '#F2C83B', color: '#000000', fontWeight: 'bold' }} title="Haz clic para Cerrar Sesión">
          {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </header>

      {/* Flujo de layout original respetado para no romper el Header */}
      <div className="app-layout">
        
        {/* SIDEBAR ORIGINAL VINCULADO */}
        <aside 
          id="sidebar" 
          className={`sidebar transition-all duration-300 overflow-hidden ${
            isSidebarOpen ? 'open block w-64' : 'w-0 -translate-x-full opacity-0 invisible'
          }`}
        >
          <h3 className="sidebar-title">Ejercicios de Práctica</h3>
          <ul className="sidebar-menu">
            <li className="menu-item" id="menu-metodologia" onClick={() => { setClicsMenuContador(prev => prev + 1); setIsSidebarOpen(false); }}><span className="menu-number">1</span><span className="menu-text">Metodología.</span></li>
            <li className="menu-item" id="menu-alfabeto" onClick={() => { setClicsMenuContador(prev => prev + 1); setIsSidebarOpen(false); }}><span className="menu-number">2</span><span className="menu-text">Alfabeto de fonemas (sonidos).</span></li>
            <li className={`menu-item ${currentPractice === '3' ? 'active' : ''}`} id="menu-practica-1" onClick={() => { setCurrentPractice('3'); setClicsMenuContador(prev => prev + 1); setIsSidebarOpen(false); setTimeout(() => { document.getElementById('instruction-card-root')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100); }}><span className="menu-number">3</span><span className="menu-text">Práctica 1 Listening De Vocales Cortas.</span></li>
            <li className="menu-item" id="menu-diptongos" onClick={() => { setClicsMenuContador(prev => prev + 1); setIsSidebarOpen(false); }}><span className="menu-number">4</span><span className="menu-text">Práctica 2 Listening de Diptóngos.</span></li>
            <li className="menu-item" id="menu-practica-2" onClick={() => { setClicsMenuContador(prev => prev + 1); setIsSidebarOpen(false); }}><span className="menu-number">5</span><span className="menu-text">Práctica 3 Listening de Consonantes.</span></li>
            <li className="menu-item" id="menu-grafemas" onClick={() => { setClicsMenuContador(prev => prev + 1); setIsSidebarOpen(false); }}><span className="menu-number">6</span><span className="menu-text">Primeros Grafemas.</span></li>
            <li className="menu-item" id="menu-sopa" onClick={() => { setClicsMenuContador(prev => prev + 1); setIsSidebarOpen(false); }}><span className="menu-number">7</span><span className="menu-text">Sopa de letras.</span></li>
            <li className="menu-item" id="menu-flashcards" onClick={() => { setClicsMenuContador(prev => prev + 1); setIsSidebarOpen(false); }}><span className="menu-number">8</span><span className="menu-text">Flashcards significados.</span></li>
            <li className="menu-item" id="menu-frases" onClick={() => { setClicsMenuContador(prev => prev + 1); setIsSidebarOpen(false); }}><span className="menu-number">9</span><span className="menu-text">Frases.</span></li>
          </ul>
        </aside>

        {/* 🚀 REPARACIÓN DE CENTRADO SIMÉTRICO: El alineamiento balanceado se aplica aquí dentro sin alterar la estructura externa */}
        <main className={`main-container transition-all duration-300 w-full flex flex-col items-center justify-start`}>
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
