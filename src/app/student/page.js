'use client';

import { useSession, signOut, SessionProvider } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// COMPONENTE CONTENEDOR PRINCIPAL (Envoltura Obligatoria para NextAuth)
export default function StudentPage() {
  return (
    <SessionProvider>
      <StudentLayout />
    </SessionProvider>
  );
}

// COMPONENTE INTERNO CON EL MOTOR FÓNICO Y CAPTURA DE MÉTRICAS
function StudentLayout() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ---------------------------------------------------------
  // ESTADOS Y REFERENCIAS ORIGINALES DEL COMPONENTE
  // ---------------------------------------------------------
  const [currentPractice, setCurrentPractice] = useState('3'); // '3' = P1, '4' = P2, '5' = P3
  const [currentFonema, setCurrentFonema] = useState('ə'); 
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [studentSelectedVocals, setStudentSelectedVocals] = useState([]); 
  const [errorMessage, setErrorMessage] = useState('');
  const [hasAnsweredCorrectly, setHasAnsweredCorrectly] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSuccessNote, setFeedbackSuccessNote] = useState('');
  const [feedbackIsCorrect, setFeedbackIsCorrect] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1.25);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const fontSize = "text-xl"; // Tamaño base unificado
  const answerInputRef = useRef(null);

  // ---------------------------------------------------------
  // ⏱️ NUEVAS REFERENCIAS Y ESTADOS PARA CAPTURA INVISIBLE
  // ---------------------------------------------------------
  const startTimeWordRef = useRef(null);     // Tiempo inicial al dar click en "Palabra"
  const startTimeQuestionRef = useRef(null); // Tiempo inicial de la pregunta actual
  const [isPracticeStarted, setIsPracticeStarted] = useState(false);
  const [clicsMenuContador, setClicsMenuContador] = useState(0);

  // Acumuladores de micro-pasos (Tiempos por pregunta en segundos)
  const [tiemposPreguntas, setTiemposPreguntas] = useState({});
  // Acumuladores de las respuestas exactas que ingresa el alumno
  const [respuestasInputs, setRespuestasInputs] = useState({});

  // Mapeos y preguntas de tus tres datasets oficiales
  const mappingP1 = { "1": "ə", "2": "ɪ", "3": "ɛ", "4": "æ", "5": "ʌ" };
  const mappingP2 = { "1": "aɪ", "2": "eɪ", "3": "ɔɪ", "4": "aʊ", "5": "oʊ" };

  const questionsTexts = (currentPractice === '3' || currentPractice === '4')
    ? [
        "1. ¿Cuántos sonidos componen la palabra?",
        "2. ¿Cuántos fonemas consonantes tiene?",
        "3. ¿Cuántos fonemas vocales tiene?",
        "4. ¿En qué sílaba está el énfasis o acento?",
        "5. ¿En qué sílaba está la vocal que estamos practicando?"
      ]
    : [
        "1. ¿Cuántos sonidos componen la palabra?",
        "2. ¿Cuántos fonemas consonantes tiene?",
        "3. ¿Cuántos fonemas vocales tiene?",
        "4. ¿En qué sílaba está el énfasis o acento?",
        "5. Elige el fonema correcto.",
        "6. Selecciona todos los fonemas vocales que escuchas."
      ];

  // Simulación homologada de tus bases de datos JSON internas
  const mockDatasetP1 = [{ word: "Dust", fonema_id: 1, f: "4", fc: "3", fv: "1", stress: "1", posVocal: "1" }];
  const mockDatasetP2 = [{ word: "Buy", fonema_id: 1, f: "2", fc: "1", fv: "1", stress: "1", posVocal: "1" }];
  const mockDatasetP3 = [{ word: "Think", fonema_id: 1, f: "4", fc: "3", fv: "1", stress: "1", consonant: "/θ/", vocalesIPA: "/ɪ/" }];

  const obtenerPalabrasFiltradas = () => {
    if (currentPractice === '3') return mockDatasetP1;
    if (currentPractice === '4') return mockDatasetP2;
    return mockDatasetP3;
  };

  const palabrasFiltradas = obtenerPalabrasFiltradas();
  const currentData = palabrasFiltradas[currentWordIndex] || null;

  // Redirección de seguridad
  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  // Manejadores multimedia con disparador de cronómetro oculto
  const handlePlayWordAudio = (e) => {
    if (e) e.preventDefault();
    if (answerInputRef.current) answerInputRef.current.focus();
    if (!currentData) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentData.word);
      utterance.lang = 'en-US';
      utterance.rate = audioSpeed;
      window.speechSynthesis.speak(utterance);

      // CRONÓMETRO INVISIBLE: Arranca al presionar el botón "Palabra" por primera vez
      if (!isPracticeStarted) {
        const ahora = Date.now();
        startTimeWordRef.current = ahora;
        startTimeQuestionRef.current = ahora;
        setIsPracticeStarted(true);
      }
    }
  };

  const handlePlayVocalAudio = (e) => {
    if (e) e.preventDefault();
    alert("Reproduciendo sonido de la vocal aislada...");
  };

  // ---------------------------------------------------------
  // ⏱️ FUNCIÓN INTERNA DE REGISTRO INVISIBLE DE MICRO-PASOS
  // ---------------------------------------------------------
  const registrarMétricaPreguntaOculta = (textoRespuesta) => {
    if (!startTimeQuestionRef.current) return;
    
    const ahora = Date.now();
    const tiempoInvertidoMs = ahora - startTimeQuestionRef.current;
    const segundosInvertidos = Math.round(tiempoInvertidoMs / 1000);
    const qKey = `q${currentQuestionIndex + 1}`;

    // Almacenamos el tiempo y el input de forma silenciosa
    setTiemposPreguntas(prev => ({ ...prev, [`${qKey}_tiempo`]: segundosInvertidos }));
    setRespuestasInputs(prev => ({ ...prev, [`${qKey}_input`]: String(textoRespuesta) }));

    // Reiniciamos el cronómetro interno para la siguiente pregunta (Q + 1)
    startTimeQuestionRef.current = ahora;
  };

  // ---------------------------------------------------------
  // MOTOR DE EVALUACIÓN MULTI-CASO CON RECOLECCIÓN DE DATOS
  // ---------------------------------------------------------
  const handleCheckAnswer = (e, valorBotonP5 = null) => {
    if (e) e.preventDefault();
    if (!currentData) return;

    let value = studentAnswer.trim();
    let isCorrect = false;
    let successNote = "";

    // CASO A: EVALUACIÓN DE LAS PREGUNTAS GENERALES 1 A 4
    if (currentQuestionIndex < 4) {
      let isTwoDigitQuestion = (currentQuestionIndex === 0);
      let isValidFormat = isTwoDigitQuestion ? /^[0-9]{1,2}$/.test(value) : /^[0-9]$/.test(value);

      if (value === "") { 
        setErrorMessage("⚠️ Escribe tu respuesta antes de comprobar."); 
        setShowFeedback(false);
        return; 
      } 
      if (!isValidFormat) { 
        setErrorMessage(isTwoDigitQuestion ? "⚠️ Ingresa un número de 1 o 2 dígitos." : "⚠️ Ingresa un número de un solo dígito (0-9)."); 
        setShowFeedback(false);
        return; 
      }

      setErrorMessage("");
      let correctValue = "";
      switch(currentQuestionIndex) {
        case 0: correctValue = currentData.f; successNote = `¡Excelente! Sonido correcto.`; break;
        case 1: correctValue = currentData.fc; successNote = `¡Correcto! Consonantes identificadas.`; break;
        case 2: correctValue = currentData.fv; successNote = `¡Muy bien! Vocales identificadas.`; break;
        case 3: correctValue = currentData.stress; successNote = `¡Exacto! Énfasis o acento correcto.`; break;
      }
      isCorrect = (value === correctValue);
      
      // REGISTRO INVISIBLE: Si es correcta, capturamos la métrica del paso antes de avanzar
      if (isCorrect) registrarMétricaPreguntaOculta(value);
    } 
    // CASO B: EVALUACIÓN DE LA PREGUNTA 5
    else if (currentQuestionIndex === 4) {
      if (currentPractice === '3' || currentPractice === '4') {
        if (value === "") { setErrorMessage("⚠️ Escribe tu respuesta antes de comprobar."); setShowFeedback(false); return; }
        isCorrect = (value === currentData.posVocal);
        if (isCorrect) {
          successNote = `¡Felicidades! Posición de la vocal correcta.`;
          registrarMétricaPreguntaOculta(value);
        }
      } else {
        if (!valorBotonP5) return;
        isCorrect = (valorBotonP5 === currentData.consonant);
        if (isCorrect) {
          successNote = `¡Excelente elección fonética!`;
          registrarMétricaPreguntaOculta(valorBotonP5);
        }
      }
    } 
    // CASO C: EVALUACIÓN DE LA PREGUNTA 6 (PRÁCTICA 3)
    else if (currentQuestionIndex === 5 && currentPractice === '5') {
      if (studentSelectedVocals.length === 0) {
        setErrorMessage("⚠️ Selecciona al menos un fonema vocal antes de comprobar.");
        setShowFeedback(false);
        return;
      }
      setErrorMessage("");
      // Simulación de acierto para mantener flujo intacto
      isCorrect = true; 
      successNote = `¡Felicidades! Todos los fonemas vocales identificados.`;
      if (isCorrect) registrarMétricaPreguntaOculta(studentSelectedVocals.join(", "));
    }

    setHasAnsweredCorrectly(isCorrect);
    setFeedbackIsCorrect(isCorrect);
    setFeedbackSuccessNote(successNote);
    setShowFeedback(true);
  };

  // NAVEGACIÓN Y CIERRE DEL RETO TOTAL DE LA PALABRA
  const handleNextQuestion = (e) => {
    if (e) e.preventDefault();
    if (!hasAnsweredCorrectly) return;

    const maxPreguntas = (currentPractice === '3' || currentPractice === '4') ? 5 : 6;

    if (currentQuestionIndex < maxPreguntas - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setStudentAnswer("");
      setStudentSelectedVocals([]);
      setShowFeedback(false);
      setHasAnsweredCorrectly(false);
    } else {
      // -----------------------------------------------------------------
      // 📦 PAQUETE FINAL: Se empaquetan las métricas recolectadas de forma invisible
      // -----------------------------------------------------------------
      const tiempoTotalPalabraMs = Date.now() - startTimeWordRef.current;
      const segundosTotalesPalabra = Math.round(tiempoTotalPalabraMs / 1000);

      const objetoMetricasFinalInvisible = {
        studentEmail: session?.user?.email || "anonimo@student.com",
        practica_activa: currentPractice,
        palabra: currentData?.word,
        tiempo_total_palabra_segundos: segundosTotalesPalabra,
        clics_menu: clicsMenuContador,
        tiempos_por_pregunta: tiemposPreguntas,
        respuestas_exactas: respuestasInputs,
        timestamp: new Date().toISOString()
      };

      // Simulación de envío silencioso al backend
      console.log("✈️ Enviando métricas invisibles al panel docente de forma segura:", objetoMetricasFinalInvisible);

      // Limpieza e inicialización de estados para la siguiente palabra
      setIsPracticeStarted(false);
      setTiemposPreguntas({});
      setRespuestasInputs({});
      setClicsMenuContador(0);

      const totalWordsInBlock = palabrasFiltradas.length;
      if (totalWordsInBlock > 0) {
        setCurrentWordIndex((currentWordIndex < totalWordsInBlock - 1) ? currentWordIndex + 1 : 0);
      }
      
      setCurrentQuestionIndex(0);
      setStudentAnswer('');
      setStudentSelectedVocals([]);
      setShowFeedback(false);
      setErrorMessage('');
      setHasAnsweredCorrectly(false);
      alert(`📝 Siguiente palabra cargada de forma limpia.`);
    }
  };

  const handlePreviousQuestion = (e) => {
    if (e) e.preventDefault();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setStudentAnswer("");
      setStudentSelectedVocals([]);
      setShowFeedback(false);
      setHasAnsweredCorrectly(false);
      setErrorMessage("");
      // Al retroceder, reiniciamos la marca de tiempo de la pregunta para no alterar el cronómetro
      startTimeQuestionRef.current = Date.now();
    }
  };

  const changeFonemaDropdown = (e) => {
    setCurrentFonema(e.target.value);
    setCurrentWordIndex(0);
    setIsPracticeStarted(false);
    setCurrentQuestionIndex(0);
    setStudentAnswer('');
    setShowFeedback(false);
    setHasAnsweredCorrectly(false);
  };

  const toggleVocalSelection = (vocal) => {
    if (studentSelectedVocals.includes(vocal)) {
      setStudentSelectedVocals(studentSelectedVocals.filter(v => v !== vocal));
    } else {
      setStudentSelectedVocals([...studentSelectedVocals, vocal]);
    }
  };

  return (
    <div className="plataforma-body w-full min-h-screen text-[#1E293B]" style={{ fontFamily: 'var(--font-redondeada), sans-serif' }}>

      {/* APP HEADER */}
      <header className="app-header">
        <div className="header-left">
          <button className="menu-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <span className="hamburger-line"></span><span className="hamburger-line"></span><span className="hamburger-line"></span>
          </button>
          <div className="logo">English For All</div>
        </div>

        {/* Barra de Progreso Dinámica */}
        <div className="progress-container">
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${((currentQuestionIndex + 1) / ((currentPractice === '3' || currentPractice === '4') ? 5 : 6)) * 100}%` }}></div>
          </div>
          <span className="progress-text">Pregunta {currentQuestionIndex + 1} de {(currentPractice === '3' || currentPractice === '4') ? 5 : 6}</span>
        </div>

        <div className="avatar cursor-pointer" onClick={() => signOut({ callbackUrl: "/" })} title="Haz clic para Cerrar Sesión">
          {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </header>

      <div className="app-layout">
        {/* MENÚ LATERAL IZQUIERDO CON REGISTRO INVISIBLE DE CLICS */}
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <h3 className="sidebar-title">Ejercicios de Práctica</h3>
          <ul className="sidebar-menu">
            <li className="menu-item" onClick={() => setClicsMenuContador(prev => prev + 1)}><span className="menu-number">1</span><span className="menu-text">Metodología</span></li>
            <li className="menu-item" onClick={() => setClicsMenuContador(prev => prev + 1)}><span className="menu-number">2</span><span className="menu-text">Alfabeto de fonemas</span></li>
            
            <li className={`menu-item ${currentPractice === '3' ? 'active' : ''}`} onClick={() => { setCurrentPractice('3'); setClicsMenuContador(prev => prev + 1); setCurrentWordIndex(0); setCurrentQuestionIndex(0); setShowFeedback(false); setHasAnsweredCorrectly(false); }}>
              <span className="menu-number">3</span><span className="menu-text">Práctica 1 (Vocales Cortas)</span>
            </li>

            <li className={`menu-item ${currentPractice === '4' ? 'active' : ''}`} onClick={() => { setCurrentPractice('4'); setClicsMenuContador(prev => prev + 1); setCurrentWordIndex(0); setCurrentQuestionIndex(0); setShowFeedback(false); setHasAnsweredCorrectly(false); }}>
              <span className="menu-number">4</span><span className="menu-text">Práctica 2 (Diptongos)</span>
            </li>

            <li className={`menu-item ${currentPractice === '5' ? 'active' : ''}`} onClick={() => { setCurrentPractice('5'); setClicsMenuContador(prev => prev + 1); setCurrentWordIndex(0); setCurrentQuestionIndex(0); setShowFeedback(false); setHasAnsweredCorrectly(false); }}>
              <span className="menu-number">5</span><span className="menu-text">Práctica 3 (Consonantes)</span>
            </li>
          </ul>
        </aside>

        {/* ÁREA CENTRAL DE TRABAJO */}
        <main className="main-container">
          <div className="instruction-card">
            <p className="instruction-text text-center w-full">{questionsTexts[currentQuestionIndex]}</p>
          </div>

          <div className="practice-card unified-media-card">
            <div className="w-full flex justify-center pb-2">
              <select className="font-dropdown-top w-full max-w-[320px] text-center" value={currentFonema} onChange={changeFonemaDropdown}>
                {currentPractice === '3' ? (
                  <><option value="ə">Fonema /ə/</option><option value="ɪ">Fonema /ɪ/</option><option value="ɛ">Fonema /ɛ/</option></>
                ) : currentPractice === '4' ? (
                  <><option value="aɪ">Fonema /aɪ/</option><option value="eɪ">Fonema /eɪ/</option></>
                ) : (
                  <><option value="1">Grafemas de /θ/ vs /ð/</option></>
                )}
              </select>
            </div>

            <div className="media-buttons-row">
              <div className="media-column-left">
                <button onClick={handlePlayWordAudio} className="audio-btn"><span>🔊 Palabra</span></button>
              </div>
              <div className="media-column-right">
                <button onClick={handlePlayVocalAudio} className="audio-btn vocal-btn"><span>🎵 Vocal</span></button>
              </div>
            </div>

            <div className="media-slider-row">
              <div className="interactive-wave-box">
                <div className="wave-container"><div className="wave-bar"></div><div className="wave-bar"></div><div className="wave-bar"></div></div>
                <input type="range" min="0.5" max="2.0" step="0.25" value={audioSpeed} onChange={(e) => setAudioSpeed(parseFloat(e.target.value))} className="over-wave-slider" />
                <span className="speed-bubble-indicator">{audioSpeed.toFixed(2)}x</span>
              </div>
            </div>
          </div>

          {/* CONTROL DINÁMICO DE ENTRADA / RESPUESTAS INTERACTIVAS */}
          {currentPractice === '5' && currentQuestionIndex === 4 ? (
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm text-center flex flex-col gap-4">
              <span className="response-title block mb-2">Selecciona el fonema correcto</span>
              <div className="flex gap-4 justify-center">
                <button onClick={(e) => handleCheckAnswer(e, "/θ/")} className="check-green-btn !bg-sky-600 hover:!bg-sky-700 !px-8" disabled={hasAnsweredCorrectly}>/θ/</button>
                <button onClick={(e) => handleCheckAnswer(e, "/ð/")} className="check-green-btn !bg-sky-600 hover:!bg-sky-700 !px-8" disabled={hasAnsweredCorrectly}>/ð/</button>
              </div>
              {errorMessage && <p className="error-text text-center mt-2">{errorMessage}</p>}
            </div>
          ) : (currentPractice === '5' && currentQuestionIndex === 5) ? (
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col gap-4">
              <span className="response-title">Selecciona las vocales presentes</span>
              <div className="flex gap-2 justify-center">
                <button onClick={() => !hasAnsweredCorrectly && toggleVocalSelection("/ɪ/")} className={`p-3 rounded-xl border text-sm font-bold ${studentSelectedVocals.includes("/ɪ/") ? 'bg-sky-600 text-white' : 'bg-white'}`}>/ɪ/</button>
              </div>
              <div className="flex justify-end mt-2">
                <button onClick={handleCheckAnswer} className="check-green-btn" disabled={hasAnsweredCorrectly}>Comprobar Selección</button>
              </div>
            </div>
          ) : (
            <div className="response-card split-response-card">
              <div className="response-left-pane">
                <span className="response-title">Tu Respuesta</span>
                <input 
                  type="text" ref={answerInputRef} value={studentAnswer} disabled={hasAnsweredCorrectly}
                  onChange={(e) => setStudentAnswer(e.target.value)} placeholder="Escribe aquí..." className={`response-input ${errorMessage ? 'input-invalid' : ''}`}
                />
                <p className="error-text">{errorMessage}</p>
              </div>
              <div className="response-divider-line"></div>
              <div className="response-right-pane">
                <button onClick={handleCheckAnswer} className="check-green-btn" disabled={hasAnsweredCorrectly}>Comprobar</button>
              </div>
            </div>
          )}

          {/* SECCIÓN DE FEEDBACK ACTIVO */}
          {showFeedback && (
            <div className="feedback-card">
              <div className="feedback-phrase">
                {feedbackIsCorrect ? <span className="word-correct">{feedbackSuccessNote}</span> : <>Tu respuesta no es correcta. ¡Inténtalo de nuevo!</>}
              </div>
            </div>
          )}

          {/* BOTONES DE NAVEGACIÓN */}
          <div className="navigation-buttons" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '16px' }}>
            <button onClick={handlePreviousQuestion} className={`back-question-btn ${currentQuestionIndex === 0 ? 'hidden' : ''}`} style={{ flex: 1 }}>← Anterior</button>
            <button onClick={handleNextQuestion} className={`next-btn ${!hasAnsweredCorrectly ? 'btn-disabled' : ''}`} disabled={!hasAnsweredCorrectly} style={{ flex: 2 }}>
              {currentQuestionIndex === ((currentPractice === '3' || currentPractice === '4') ? 5 : 6) - 1 ? "SIGUIENTE PALABRA ➔" : "SIGUIENTE PREGUNTA ➔"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
