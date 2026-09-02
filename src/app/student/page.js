'use client';

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function StudentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // =========================================================
  // ESTADOS Y REFERENCIAS ORIGINALES DEL COMPONENTE
  // =========================================================
  const [activeMenu, setActiveMenu] = useState(1); // Tema seleccionado en el menú lateral
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [fontSize, setFontSize] = useState("text-xl");
  
  // Estados para el motor de ejercicios y evaluaciones
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [feedback, setFeedback] = useState(null); // Estructura: { isCorrect: boolean, msg: string }
  const [isPracticeStarted, setIsPracticeStarted] = useState(false);

  // Redirección de seguridad si el usuario no está autenticado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Simulación de datasets locales correspondientes a tus 3 prácticas principales
  const mockDataset = {
    1: [
      { id: 1, word: "Apple", IPA: "/ˈæp.əl/", audioText: "Apple" },
      { id: 2, word: "Cat", IPA: "/kæt/", audioText: "Cat" }
    ],
    2: [
      { id: 1, word: "Thought", IPA: "/θɔːt/", audioText: "Thought" },
      { id: 2, word: "Through", IPA: "/θruː/", audioText: "Through" }
    ],
    3: [
      { id: 1, word: "Beautiful", IPA: "/ˈbjuː.tɪ.fəl/", audioText: "Beautiful" },
      { id: 2, word: "Comfortable", IPA: "/ˈkʌm.fə.tə.bəl/", audioText: "Comfortable" }
    ]
  };

  const currentQuestions = mockDataset[activeMenu] || mockDataset[1];
  const currentQuestion = currentQuestions[currentWordIndex] || currentQuestions[0];

  // =========================================================
  // FUNCIONES MULTIMEDIA Y MANEJADORES DE AUDIO
  // =========================================================
  const handleListenWord = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Detener audios previos
      const utterance = new SpeechSynthesisUtterance(currentQuestion.audioText);
      utterance.lang = 'en-US';
      utterance.rate = playbackSpeed;
      window.speechSynthesis.speak(utterance);
      
      // Activamos el inicio de la práctica si no se había hecho antes
      if (!isPracticeStarted) {
        setIsPracticeStarted(true);
      }
    } else {
      alert("Tu navegador no soporta síntesis de voz.");
    }
  };

  const handleVerifyAnswer = () => {
    if (!userInput.trim()) {
      setErrorMessage("Por favor, escribe una respuesta antes de verificar.");
      return;
    }
    setErrorMessage("");

    const isCorrect = userInput.trim().toLowerCase() === currentQuestion.word.toLowerCase();
    if (isCorrect) {
      setFeedback({
        isCorrect: true,
        msg: `¡Excelente! La palabra "${currentQuestion.word}" es correcta.`
      });
    } else {
      setFeedback({
        isCorrect: false,
        msg: `Inténtalo de nuevo. Tu respuesta: "${userInput}"`
      });
    }
  };

  const handleNextQuestion = () => {
    setFeedback(null);
    setUserInput("");
    setIsPracticeStarted(false);
    
    if (currentWordIndex < currentQuestions.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
    } else {
      alert("¡Has terminado todos los retos de esta sección!");
      setCurrentWordIndex(0);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-semibold text-slate-600 animate-pulse">Cargando plataforma...</p>
      </div>
    );
  }

  return (
    <div className="plataforma-body min-h-screen flex flex-col">
      
      {/* =========================================================
         APP HEADER (CABECERA DE LA APLICACIÓN)
         ========================================================= */}
      <header className="app-header">
        <div className="header-left">
          <button 
            className="menu-toggle-btn" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Abrir menú"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
          <span className="logo">English For All</span>
        </div>

        {/* Barra de Progreso Global */}
        <div className="progress-container hidden md:flex">
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${((currentWordIndex + 1) / currentQuestions.length) * 100}%` }}
            ></div>
          </div>
          <span className="progress-text">
            {currentWordIndex + 1} de {currentQuestions.length}
          </span>
        </div>

        {/* Control de tamaño de tipografía y Avatar del Usuario */}
        <div className="flex items-center gap-4">
          <select 
            className="font-dropdown-top"
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
          >
            <option value="text-base">Letra Chica</option>
            <option value="text-xl">Letra Mediana</option>
            <option value="text-3xl">Letra Grande</option>
          </select>

          <div 
            className="avatar cursor-pointer" 
            title="Cerrar sesión"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
          </div>
        </div>
      </header>

      {/* =========================================================
         APP LAYOUT (DISPOSICIÓN GENERAL DEL SITIO)
         ========================================================= */}
      <div className="app-layout">
        
        {/* SIDEBAR IZQUIERDO (MENÚ DE NAVEGACIÓN ENTRE TEMAS) */}
        <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
          <h2 className="sidebar-title">Módulos de Práctica</h2>
          <ul className="sidebar-menu">
            <li 
              className={`menu-item ${activeMenu === 1 ? "active" : ""}`}
              onClick={() => { setActiveMenu(1); setCurrentWordIndex(0); setFeedback(null); setUserInput(""); }}
            >
              <span className="menu-number">1</span>
              <span>Vocabulario Básico</span>
            </li>
            <li 
              className={`menu-item ${activeMenu === 2 ? "active" : ""}`}
              onClick={() => { setActiveMenu(2); setCurrentWordIndex(0); setFeedback(null); setUserInput(""); }}
            >
              <span className="menu-number">2</span>
              <span>Fonemas Complejos</span>
            </li>
            <li 
              className={`menu-item ${activeMenu === 3 ? "active" : ""}`}
              onClick={() => { setActiveMenu(3); setCurrentWordIndex(0); setFeedback(null); setUserInput(""); }}
            >
              <span className="menu-number">3</span>
              <span>Palabras Polisílabas</span>
            </li>
          </ul>
        </aside>

        {/* =========================================================
           ÁREA CENTRAL DE TRABAJO (MAIN CONTAINER)
           ========================================================= */}
        <main className="main-container">
          
          {/* Tarjeta de Instrucción Fonética */}
          <div className="instruction-card">
            <h3 className={`instruction-text ${fontSize}`}>
              Escucha atentamente el audio y escribe la palabra que corresponde al fonema: <strong className="text-sky-600 ml-2">{currentQuestion.IPA}</strong>
            </h3>
          </div>

          {/* Tarjeta de Práctica y Control de Audio */}
          <div className="practice-card">
            <div className="unified-media-card w-full">
              <div className="media-buttons-row">
                <div className="media-column-left">
                  {/* Botón Palabra */}
                  <button className="audio-btn" onClick={handleListenWord}>
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                    <span>Escuchar Palabra</span>
                  </button>
                </div>

                <div className="media-column-right">
                  {/* Onda de sonido reactiva/animada */}
                  <div className="interactive-wave-box">
                    <div className="wave-container">
                      <div className="wave-bar"></div>
                      <div className="wave-bar"></div>
                      <div className="wave-bar"></div>
                      <div className="wave-bar"></div>
                      <div className="wave-bar"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Control Deslizador de Velocidad */}
              <div className="media-slider-row relative">
                <input 
                  type="range" 
                  min="0.5" 
                  max="1.5" 
                  step="0.25"
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                  className="over-wave-slider" 
                />
                <span className="speed-bubble-indicator">
                  Velocidad: {playbackSpeed}x
                </span>
              </div>
            </div>
          </div>

          {/* Tarjeta de Entrada de Respuesta */}
          <div className="response-card split-response-card">
            <div className="response-left-pane">
              <label className="response-title">Tu Respuesta en Inglés</label>
              <input 
                type="text" 
                className={`response-input ${errorMessage ? 'input-invalid' : ''}`}
                placeholder="Escribe aquí lo que escuchaste..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={!!feedback}
              />
              {errorMessage && <p className="error-text">{errorMessage}</p>}
            </div>

            <div className="response-right-pane">
              <button 
                className={`check-green-btn ${!userInput.trim() ? 'btn-disabled' : ''}`}
                onClick={handleVerifyAnswer}
                disabled={!!feedback}
              >
                Verificar Respuesta
              </button>
            </div>
          </div>

          {/* Bloque de Retroalimentación Activa y Navegación */}
          {feedback && (
            <div className="feedback-card animate-fade-in">
              <span className="feedback-title">Resultado de la Evaluación:</span>
              <p className={`feedback-phrase ${feedback.isCorrect ? 'word-correct' : 'word-error'}`}>
                {feedback.msg}
              </p>
              
              <div className="navigation-buttons mt-4">
                <button 
                  className="next-btn w-full"
                  onClick={handleNextQuestion}
                >
                  Siguiente Palabra / Reto &rarr;
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
