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

  // 🚀 REPARACIÓN 1: El menú inicia CERRADO en ambos. Solo abre/cierra al pulsar la hamburguesa.
  const handleToggleSidebarOriginal = (e) => {
    if (e) e.stopPropagation();
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('open');
    }
  };

  // 🚀 REPARACIÓN 2: Audio de bienvenida restaurado en el montado principal (Celular y Compu)
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

      {/* HEADER ORIGINAL COMPLETO */}
      <header className="app-header">
        <div className="header-left">
          <button id="menu-toggle" className="menu-toggle-btn" onClick={handleToggleSidebarOriginal}>
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

      <div className="app-layout">
        
        {/* SIDEBAR ORIGINAL CON SUS 9 OPCIONES INTACTAS */}
        <aside id="sidebar" className="sidebar">
          <h3 className="sidebar-title">Ejercicios de Práctica</h3>
          <ul className="sidebar-menu">
            <li className="menu-item" onClick={() => { setClicsMenuContador(prev => prev + 1); }}><span className="menu-number">1</span><span className="menu-text">Metodología</span></li>
            <li className="menu-item" onClick={() => { setClicsMenuContador(prev => prev + 1); }}><span className="menu-number">2</span><span className="menu-text">Alfabeto de fonemas</span></li>
            <li className={`menu-item ${currentPractice === '3' ? 'active' : ''}`} onClick={() => { setCurrentPractice('3'); setClicsMenuContador(prev => prev + 1); }}><span className="menu-number">3</span><span className="menu-text">Práctica 1: Vocales Cortas</span></li>
            <li className="menu-item" onClick={() => { setClicsMenuContador(prev => prev + 1); }}><span className="menu-number">4</span><span className="menu-text">Práctica 2: Diptóngos</span></li>
            <li className="menu-item" onClick={() => { setClicsMenuContador(prev => prev + 1); }}><span className="menu-number">5</span><span className="menu-text">Práctica 3: Consonantes</span></li>
            <li className="menu-item" onClick={() => { setClicsMenuContador(prev => prev + 1); }}><span className="menu-number">6</span><span className="menu-text">Primeros Grafemas</span></li>
            <li className="menu-item" onClick={() => { setClicsMenuContador(prev => prev + 1); }}><span className="menu-number">7</span><span className="menu-text">Sopa de letras</span></li>
            <li className="menu-item" onClick={() => { setClicsMenuContador(prev => prev + 1); }}><span className="menu-number">8</span><span className="menu-text">Flashcards significados</span></li>
            <li className="menu-item" onClick={() => { setClicsMenuContador(prev => prev + 1); }}><span className="menu-number">9</span><span className="menu-text">Frases</span></li>
          </ul>
        </aside>

        <main className="main-container">
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
