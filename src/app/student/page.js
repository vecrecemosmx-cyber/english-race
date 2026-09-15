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
  const [currentFonema, setCurrentFonema] = useState('ə'); 
  const [audioSpeed, setAudioSpeed] = useState(1.25);
  const [clicsMenuContador, setClicsMenuContador] = useState(0);

  // FUNCIÓN NATIVA ORIGINAL PARA MANEJAR EL TOGGLE DEL SIDEBAR EN CELULARES
  const handleToggleSidebarOriginal = (e) => {
    if (e) e.stopPropagation();
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('open');
    }
  };

  // SCROLL AUTOMÁTICO INICIAL AL NÚCLEO DE LA PREGUNTA
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

  // AUDIO DE BIENVENIDA AUTOMÁTICO EN ESPAÑOL ORIGINAL
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

      {/* LAYOUT ORIGINAL CON RESPONSIVIDAD INTEGRADA EN TU HOJA DE ESTILOS CSS */}
      <div className="app-layout">
        
        {/* SIDEBAR ORIGINAL CON SUS 9 OPCIONES IDÉNTICAS */}
        <aside id="sidebar" className="sidebar">
          <h3 className="sidebar-title">Ejercicios de Práctica</h3>
          <ul className="sidebar-menu">
            <li className="menu-item" id="menu-metodologia" onClick={() => { setClicsMenuContador(prev => prev + 1); document.getElementById('sidebar')?.classList.remove('open'); }}><span className="menu-number">1</span><span className="menu-text">Metodología.</span></li>
            <li className="menu-item" id="menu-alfabeto" onClick={() => { setClicsMenuContador(prev => prev + 1); document.getElementById('sidebar')?.classList.remove('open'); }}><span className="menu-number">2</span><span className="menu-text">Alfabeto de fonemas (sonidos).</span></li>
            <li className={`menu-item ${currentPractice === '3' ? 'active' : ''}`} id="menu-practica-1" onClick={() => { setCurrentPractice('3'); setClicsMenuContador(prev => prev + 1); document.getElementById('sidebar')?.classList.remove('open'); setTimeout(() => { document.getElementById('instruction-card-root')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100); }}><span className="menu-number">3</span><span className="menu-text">Práctica 1 Listening De Vocales Cortas.</span></li>
            <li className={`menu-item ${currentPractice === '4' ? 'active' : ''}`} id="menu-diptongos" onClick={() => { setCurrentPractice('4'); setClicsMenuContador(prev => prev + 1); document.getElementById('sidebar')?.classList.remove('open'); setTimeout(() => { document.getElementById('instruction-card-root')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100); }}><span className="menu-number">4</span><span className="menu-text">Práctica 2 Listening de Diptóngos.</span></li>
            <li className={`menu-item ${currentPractice === '5' ? 'active' : ''}`} id="menu-consonantes" onClick={() => { setCurrentPractice('5'); setClicsMenuContador(prev => prev + 1); document.getElementById('sidebar')?.classList.remove('open'); setTimeout(() => { document.getElementById('instruction-card-root')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100); }}><span className="menu-number">5</span><span className="menu-text">Práctica 3 Listening de Consonantes.</span></li>
            <li className={`menu-item ${currentPractice === '6' ? 'active' : ''}`} id="menu-aprender-ipa" onClick={() => { setCurrentPractice('6'); setClicsMenuContador(prev => prev + 1); document.getElementById('sidebar')?.classList.remove('open'); setTimeout(() => { document.getElementById('instruction-card-root')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100); }}><span className="menu-number">6</span><span className="menu-text">Aprender a leer IPA.</span></li>
            <li className="menu-item" id="menu-sopa" onClick={() => { setClicsMenuContador(prev => prev + 1); document.getElementById('sidebar')?.classList.remove('open'); }}><span className="menu-number">7</span><span className="menu-text">Sopa de letras.</span></li>
            <li className="menu-item" id="menu-flashcards" onClick={() => { setClicsMenuContador(prev => prev + 1); document.getElementById('sidebar')?.classList.remove('open'); }}><span className="menu-number">8</span><span className="menu-text">Flashcards significados.</span></li>
            <li className="menu-item" id="menu-frases" onClick={() => { setClicsMenuContador(prev => prev + 1); document.getElementById('sidebar')?.classList.remove('open'); }}><span className="menu-number">9</span><span className="menu-text">Frases.</span></li>
          </ul>
        </aside>

        {/* CONTENEDOR PRINCIPAL FLUIDO Y ORIGINAL */}
        <main className="main-container">
          {currentPractice === '3' && (
            <PracticaVocales 
              userEmail={session?.user?.email} 
              globalSpeed={audioSpeed} 
              setGlobalSpeed={setAudioSpeed}
              menuClics={clicsMenuContador}
            />
          )}
          
          {/* 🚀 AÑADIR ESTE BLOQUE PARA LA PRÁCTICA 2 */}
          {currentPractice === '4' && (
            <PracticaDiptongos 
              userEmail={session?.user?.email} 
              globalSpeed={audioSpeed} 
              setGlobalSpeed={setAudioSpeed}
              menuClics={clicsMenuContador}
            />
          )}
          {currentPractice === '5' && (
            <PracticaConsonantes userEmail={session?.user?.email} globalSpeed={audioSpeed} setGlobalSpeed={setAudioSpeed} menuClics={clicsMenuContador} />
          )}
                    {currentPractice === '5' && (
            <PracticaConsonantes userEmail={session?.user?.email} globalSpeed={audioSpeed} setGlobalSpeed={setAudioSpeed} menuClics={clicsMenuContador} />
          )}

          {currentPractice === 'ipa' && (
            <AprenderIpa />
          )}
        </main>

      </div>
    </div>
  );
}
