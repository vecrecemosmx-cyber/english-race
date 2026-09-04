'use client';

import { useSession, signOut, SessionProvider } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// IMPORTACIÓN OFICIAL CONFIRMADA: Con alias absoluto y mayúsculas exactas
import { IconoBocina, IconoNota } from '@/Iconos';

// BASES DE DATOS OFICIALES CARGADAS LOCALMENTE (HOMOLOGADAS)
import datasetP1 from '../database_practice1.json';
import datasetP2 from '../database_practice2.json';
import datasetP3 from '../database_practice3.json';

// COMPONENTE CONTENEDOR PRINCIPAL (Envoltura Obligatoria para NextAuth)
export default function Home() {
  return (
    <SessionProvider>
      <PlataformaFonica />
    </SessionProvider>
  );
}

// NUEVO COMPONENTE MAESTRO DE LA APLICACIÓN
function PlataformaFonica() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // --- ESTADOS DE CONTROL GLOBALES (SINCRONIZADOS ORIGINALES) ---
  const [currentPractice, setCurrentPractice] = useState('3'); 
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
  const answerInputRef = useRef(null);

  // --- ⏱️ REFERENCIAS Y ESTADOS PARA CAPTURA INVISIBLE DE TIEMPOS ---
  const startTimeWordRef = useRef(null);     
  const startTimeQuestionRef = useRef(null); 
  const [isPracticeStarted, setIsPracticeStarted] = useState(false);
  const [clicsMenuContador, setClicsMenuContador] = useState(0);
  const [tiemposPreguntas, setTiemposPreguntas] = useState({});
  const [respuestasInputs, setRespuestasInputs] = useState({});

  // Estado para simular visualmente la caja intermitente cuando el alumno pasa el mouse (Hover)
  const [hoveredSoundsCount, setHoveredSoundsCount] = useState(null);

  // Rango dinámico exacto basado en tu palabra más larga: "Comfortable" (9 sonidos)
  const totalFonicButtons = [3, 4, 5, 6, 7, 8, 9];
  
  // Mapeos oficiales originales para traducir los IDs de tus menús desplegables
  const mappingP1 = { "1": "ə", "2": "ɪ", "3": "ɛ", "4": "æ", "5": "ʌ" };
  const mappingP2 = { "1": "aɪ", "2": "eɪ", "3": "ɔɪ", "4": "aʊ", "5": "oʊ" };

  // NUEVO REORDENAMIENTO DE PREGUNTAS SOLICITADO
  const questionsTexts = (currentPractice === '3' || currentPractice === '4')
    ? [
        "1. ¿Cuántos fonemas consonantes tiene?",
        "2. ¿Cuántos fonemas vocales tiene?",
        "3. ¿Cuántos sonidos componen la palabra?",
        "4. ¿En qué sílaba está el énfasis o acento?",
        "5. ¿En qué sílaba está la vocal que estamos practicando?"
      ]
    : [
        "1. ¿Cuántos fonemas consonantes tiene?",
        "2. ¿Cuántos fonemas vocales tiene?",
        "3. ¿Cuántos sonidos componen la palabra?",
        "4. ¿En qué sílaba está el énfasis o acento?",
        "5. Elige el fonema correcto.",
        "6. Selecciona todos los fonemas vocales que escuchas."
      ];

  // Ruta local para reproducir los audios fónicos desde public/audio/
  const baseAudioUrl = "/audio/";
  const vocalAudioFiles = { 
    "ə": "PHONEME-DUST.mp3", "ɪ": "PHONEME-PINK.mp3", "ɛ": "PHONEME-RED.mp3", "æ": "PHONEME-SAND.mp3", "ʌ": "PHONEME-CUP.mp3",
    "aɪ": "buy.mp3", "eɪ": "bay.mp3", "ɔɪ": "boy.mp3", "aʊ": "cow.mp3", "oʊ": "saw.mp3"
  };

  // Lista de los 21 fonemas para la pregunta 6 (Botonera Práctica 3)
  const vocalOptionsP2 = [
    "ɪ", "ʌ", "ʊ", "ə", "ɒ", "æ", "e", "i:", "ɑ:", "u:", "ɜ:", "ɔ:", 
    "aɪ", "eɪ", "ɔɪ", "aʊ", "oʊ", "ɑːr", "ɜːr", "ɔːr", "ər"
  ];

  // Redirección de seguridad si el usuario no está autenticado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // --- FILTRADO DINÁMICO REAL DE PALABRAS POR ID NUMÉRICO SEGÚN TU DATASET ORIGINAL ---
  const obtenerPalabrasFiltradas = () => {
    if (currentPractice === '3') {
      const filtradasCrudas = datasetP1.filter(item => {
        const symbol = mappingP1[String(item.fonema_id)] || item.fonema_simbolo;
        return symbol === currentFonema;
      });
      return filtradasCrudas.map(item => ({
        word: item.word, f: String(item.f), fc: String(item.fc), fv: String(item.fv), stress: String(item.stress), posVocal: String(item.posVocal)
      }));
    } else if (currentPractice === '4') {
      const filtradasCrudas = datasetP2.filter(item => {
        const symbol = mappingP2[String(item.fonema_id)] || item.fonema_simbolo;
        return symbol === currentFonema;
      });
      return filtradasCrudas.map(item => ({
        word: item.word, f: String(item.f), fc: String(item.fc), fv: String(item.fv), stress: String(item.stress), posVocal: String(item.posVocal)
      }));
    } else {
      const filtradasCrudas = datasetP3.filter(item => String(item.fonema_id) === String(currentFonema));
      return filtradasCrudas.map(item => ({
        word: item.word, f: String(item.f), fc: String(item.fc), fv: String(item.fv), stress: String(item.stress), consonant: String(item.consonant), vocalesIPA: String(item.vocalesIPA)
      }));
    }
  };

  const palabrasFiltradas = obtenerPalabrasFiltradas();
  const currentData = palabrasFiltradas[currentWordIndex] || null;

  // Lógica original de enfoque automático al cambiar de pregunta o palabra
  useEffect(() => {
    if (status === "authenticated" && answerInputRef.current && currentQuestionIndex > 2 && currentQuestionIndex < 5) {
      answerInputRef.current.focus();
    }
  }, [currentQuestionIndex, currentWordIndex, currentFonema, status]);

  // Restablecimiento original del fonema base al conmutar de práctica fónica
  useEffect(() => {
    if (currentPractice === '3') {
      setCurrentFonema('ə');
    } else if (currentPractice === '4') {
      setCurrentFonema('aɪ');
    } else {
      setCurrentFonema('1');
    }
    resetEntireExercise();
  }, [currentPractice]);

  // NUEVA REGLA UNIFICADA: Ahora cierra el menú lateral de inmediato al pulsar una opción
  const forzarOcultarSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');
  };

  const resetEntireExercise = () => {
    setCurrentQuestionIndex(0);
    setStudentAnswer('');
    setStudentSelectedVocals([]);
    setShowFeedback(false);
    setErrorMessage('');
    setHasAnsweredCorrectly(false);
  };

  // --- REPRODUCCIÓN AUDIO LOCAL ORIGINAL ---
  const handlePlayWordAudio = (e) => {
    if (e) e.preventDefault();
    if (answerInputRef.current && currentQuestionIndex > 2 && currentQuestionIndex < 5) answerInputRef.current.focus();
    if (!currentData) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanWord = currentData.word.replace(/\(.*\)/, "").trim();
      const utterance = new SpeechSynthesisUtterance(cleanWord);
      utterance.lang = 'en-US';
      utterance.rate = audioSpeed;
      window.speechSynthesis.speak(utterance);

      // CRONÓMETRO INVISIBLE: Arranca al presionar "Palabra" por primera vez en el reto
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
    if (currentPractice !== '3' && currentPractice !== '4') return;
    const fileName = vocalAudioFiles[currentFonema];
    if (fileName) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      const vocalAudio = new Audio(baseAudioUrl + fileName);
      vocalAudio.play().catch(err => console.log("Error al cargar .mp3 en public/audio/ :", err));
    }
  };

  // --- REGISTRO SILENCIOSO DE MICRO-PASOS PARA EL PROFESOR ---
  const registrarMétricaPreguntaOculta = (textoRespuesta) => {
    if (!startTimeQuestionRef.current) return;
    const ahora = Date.now();
    const segundosInvertidos = Math.round((ahora - startTimeQuestionRef.current) / 1000);
    const qKey = `q${currentQuestionIndex + 1}`;

    setTiemposPreguntas(prev => ({ ...prev, [`${qKey}_tiempo`]: segundosInvertidos }));
    setRespuestasInputs(prev => ({ ...prev, [`${qKey}_input`]: String(textoRespuesta) }));
    startTimeQuestionRef.current = ahora; 
  };

  // --- MOTOR DE EVALUACIÓN MULTI-CASO AJUSTADO AL NUEVO ORDEN DE PREGUNTAS ---
  const handleCheckAnswer = (e, valorBotonP5 = null) => {
    if (e) e.preventDefault();
    if (!currentData) return;

    let value = studentAnswer.trim();
    let isCorrect = false;
    let successNote = "";

    if (currentQuestionIndex < 4) {
      let isTwoDigitQuestion = (currentQuestionIndex === 2); 
      let isValidFormat = isTwoDigitQuestion ? /^[0-9]{1,2}$/.test(value) : /^[0-9]$/.test(value);

      if (value === "") { 
        setErrorMessage("⚠️ Elige o escribe tu respuesta antes de comprobar."); 
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
        case 0: // Nueva Q1: Consonantes
          correctValue = currentData.fc; 
          successNote = `¡Correcto! Tiene ${currentData.fc} sonidos consonantes.`; 
          break;
        case 1: // Nueva Q2: Vocales
          correctValue = currentData.fv; 
          successNote = `¡Muy bien! Tiene ${currentData.fv} sonidos vocálicos.`; 
          break;
        case 2: // Nueva Q3: Sonidos Totales
          correctValue = currentData ? String(currentData.f) : ""; 
          successNote = `¡Excelente! Esta palabra está compuesta por ${correctValue} sonidos.`; 
          break;
        case 3: // Q4 original: Stress
          correctValue = currentData.stress; 
          successNote = `¡Exacto! El acento o énfasis está en la sílaba ${currentData.stress}.`; 
          break;
      }
      isCorrect = (value === correctValue);
      if (isCorrect) registrarMétricaPreguntaOculta(value);
    } 
    else if (currentQuestionIndex === 4) {
      if (currentPractice === '3' || currentPractice === '4') {
        if (value === "") { setErrorMessage("⚠️ Escribe tu respuesta antes de comprobar."); setShowFeedback(false); return; }
        const dbValue = currentData.posVocal;
        if (dbValue.length === 2) {
          const digitoA = dbValue.charAt(0);
          const digitoB = dbValue.charAt(1);
          if (value === digitoA || value === digitoB) {
            isCorrect = true;
            successNote = `¡Felicidades! La vocal /${currentFonema}/ se ubica en la sílaba ${value}. Recuerda responder todos los lugares donde aparece pues en este caso también aparece en la sílaba ${value === digitoA ? digitoB : digitoA}.`;
          }
        } else {
          isCorrect = (value === dbValue);
          if (isCorrect) successNote = `¡Felicidades! La vocal /${currentFonema}/ se ubica en la posición: ${dbValue}.`;
        }
        if (isCorrect) registrarMétricaPreguntaOculta(value);
      } else {
        if (!valorBotonP5) return;
        const consonantLimpia = currentData.consonant.replace(/\\/g, "");
        isCorrect = (valorBotonP5 === consonantLimpia);
        if (isCorrect) {
          successNote = `¡Excelente elección! El fonema consonántico correcto de la palabra es ${consonantLimpia}.`;
          registrarMétricaPreguntaOculta(valorBotonP5);
        }
      }
    } 
    else if (currentQuestionIndex === 5 && currentPractice === '5') {
      if (studentSelectedVocals.length === 0) {
        setErrorMessage("⚠️ Selecciona al menos un fonema vocal de la cuadrícula antes de comprobar.");
        setShowFeedback(false);
        return;
      }
      setErrorMessage("");

      const limpiarFormato = (txt) => txt.replace(/\\|\/|\s/g, "").replace(/:/g, "ː");
      const normalizarFonema = (fonema) => {
        const textoLimpio = limpiarFormato(fonema);
        const equivalencias = { "a": "aː", "e": "eː", "i": "iː", "ɔ": "ɔː", "u": "uː" };
        return equivalencias[textoLimpio] || textoLimpio;
      };

      const vocalesLimpiasJson = currentData.vocalesIPA.split(",").map(v => normalizarFonema(v));
      const vocalesSeleccionadasEstudiante = studentSelectedVocals.map(v => normalizarFonema(v));

      const todosEstan = vocalesLimpiasJson.every(v => vocalesSeleccionadasEstudiante.includes(v));
      const longitudIgual = vocalesLimpiasJson.length === vocalesSeleccionadasEstudiante.length;
      
      isCorrect = (todosEstan && longitudIgual);
      if (isCorrect) {
        const vocalesOriginalesVisibles = currentData.vocalesIPA.replace(/\\/g, "");
        successNote = `¡Felicidades! Has identificado correctamente todos los fonemas vocales presentes: ${vocalesOriginalesVisibles}.`;
        registrarMétricaPreguntaOculta(studentSelectedVocals.join(", "));
      }
    }

    setHasAnsweredCorrectly(isCorrect);
    setFeedbackIsCorrect(isCorrect);
    setFeedbackSuccessNote(successNote);
    setShowFeedback(true);
  };

  // --- NAVEGACIÓN Y DISPARADORES DE EMISIÓN DE MÉTRICAS ---
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
      const segundosTotalesPalabra = Math.round((Date.now() - startTimeWordRef.current) / 1000);
      const dataMétricasOcultas = {
        studentEmail: session?.user?.email || "alumno@student.com",
        practica_activa: currentPractice,
        palabra: currentData?.word,
        tiempo_total_palabra_segundos: segundosTotalesPalabra,
        clics_menu: clicsMenuContador,
        tiempos_por_pregunta: tiemposPreguntas,
        respuestas_exactas: respuestasInputs,
        timestamp: new Date().toISOString()
      };

      console.log("✈️ Paquete de métricas invisibles emitido con éxito:", dataMétricasOcultas);

      setIsPracticeStarted(false);
      setTiemposPreguntas({});
      setRespuestasInputs({});
      setClicsMenuContador(0);

      const totalWordsInBlock = palabrasFiltradas.length;
      if (totalWordsInBlock > 0) {
        setCurrentWordIndex((currentWordIndex < totalWordsInBlock - 1) ? currentWordIndex + 1 : 0);
      }
      resetEntireExercise();
      alert(`📝 Siguiente reto cargado. Presiona 'Palabra' para practicar.`);
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
      startTimeQuestionRef.current = Date.now(); 
    }
  };

  const changeFonemaDropdown = (e) => {
    const nuevoFonema = e.target.value;
    setStudentAnswer('');
    setErrorMessage('');
    setShowFeedback(false);
    setHasAnsweredCorrectly(false);
    setIsPracticeStarted(false);
    setCurrentFonema(nuevoFonema);
    setCurrentWordIndex(0);
    setCurrentQuestionIndex(0);
    setStudentSelectedVocals([]);
  };

  const toggleVocalSelection = (vocal) => {
    if (studentSelectedVocals.includes(vocal)) {
      setStudentSelectedVocals(studentSelectedVocals.filter(v => v !== vocal));
    } else {
      setStudentSelectedVocals([...studentSelectedVocals, vocal]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && currentQuestionIndex > 2 && currentQuestionIndex < 5) {
      if (!hasAnsweredCorrectly) {
        handleCheckAnswer(e);
      } else {
        handleNextQuestion(e);
      }
    }
  };

  // ==========================================================================
  // RENDERIZADOR MEJORADO: NUEVA PREGUNTA 3 (SONIDOS TOTALES - ANTES Q1)
  // ==========================================================================
  const renderBotoneraFichasPregunta3 = () => {
    const limiteIluminado = hoveredSoundsCount || (studentAnswer ? parseInt(studentAnswer) : 0);

    return (
      <div className="w-full flex flex-col items-center gap-6 p-4 bg-zinc-50/50 rounded-3xl border border-zinc-100 animate-fade-in">
        <span className="response-title !text-xs !tracking-widest">Selecciona el número de sonidos que escuchas</span>
        <div className="flex flex-wrap justify-center gap-3">
          {totalFonicButtons.map((numero) => (
            <button
              key={numero}
              type="button"
              disabled={hasAnsweredCorrectly}
              onMouseEnter={() => !hasAnsweredCorrectly && setHoveredSoundsCount(numero)}
              onMouseLeave={() => !hasAnsweredCorrectly && setHoveredSoundsCount(null)}
              onClick={(e) => {
                setStudentAnswer(String(numero));
                if (!hasAnsweredCorrectly) {
                  handleCheckAnswer(e);
                }
              }}
              className={`w-12 h-12 rounded-full font-black text-base border-2 transition-all flex items-center justify-center transform active:scale-95 ${
                studentAnswer === String(numero)
                  ? 'bg-sky-600 border-sky-600 text-white shadow-md'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:border-sky-500 hover:text-sky-600 hover:bg-sky-50/50'
              } ${hasAnsweredCorrectly ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {numero}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-2 min-h-[36px] items-center max-w-full">
          {Array.from({ length: 9 }).map((_, idx) => {
            const numeroBloque = idx + 1;
            const estaIluminado = numeroBloque <= limiteIluminado;
            return (
              <div
                key={idx}
                className={`w-8 h-8 rounded-lg border-2 transition-all duration-300 ${
                  estaIluminado
                    ? 'border-sky-500 bg-sky-500/20 shadow-sm scale-105'
                    : 'border-zinc-200 border-dashed bg-zinc-100/30'
                }`}
              />
            );
          })}
        </div>
        
        {!(hoveredSoundsCount || studentAnswer) && (
          <span className="text-xs text-zinc-400 font-medium italic animate-pulse block text-center">
            Elige una opción para previsualizar los bloques acústicos.
            <br />
            <span className="mt-1 block text-zinc-500 font-semibold">
              Presta atención al sonido, no a la escritura de la palabra.
            </span>
          </span>
        )}
      </div>
    );
  };

  // ==========================================================================
  // RENDERIZADOR PARA LA NUEVA PREGUNTA 1: CONTEO DE CONSONANTES (RANGO 1-7)
  // ==========================================================================
  const renderBotoneraConsonantesPregunta1 = () => {
    const botonesConsonantes = [1, 2, 3, 4, 5, 6, 7];
    return (
      <div className="w-full flex flex-col items-center gap-4 p-4 bg-zinc-50/50 rounded-3xl border border-zinc-100 animate-fade-in">
        <span className="response-title !text-xs !tracking-widest">¿Cuántos fonemas consonantes tiene?</span>
        <div className="flex flex-wrap justify-center gap-2">
          {botonesConsonantes.map((numero) => (
            <button
              key={numero}
              type="button"
              disabled={hasAnsweredCorrectly}
              onClick={(e) => {
                setStudentAnswer(String(numero));
                if (!hasAnsweredCorrectly) handleCheckAnswer(e);
              }}
              className={`w-12 h-12 rounded-full font-black text-base border-2 transition-all flex items-center justify-center transform active:scale-95 ${
                studentAnswer === String(numero)
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/30'
              } ${hasAnsweredCorrectly ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {numero}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // ==========================================================================
  // RENDERIZADOR PARA LA NUEVA PREGUNTA 2: CONTEO DE VOCALES (RANGO 1-5)
  // ==========================================================================
  const renderBotoneraVocalesPregunta2 = () => {
    const botonesVocales = [1, 2, 3, 4, 5];
    return (
      <div className="w-full flex flex-col items-center gap-4 p-4 bg-zinc-50/50 rounded-3xl border border-zinc-100 animate-fade-in">
        <span className="response-title !text-xs !tracking-widest">¿Cuántos fonemas vocales tiene?</span>
        <div className="flex flex-wrap justify-center gap-2">
          {botonesVocales.map((numero) => (
            <button
              key={numero}
              type="button"
              disabled={hasAnsweredCorrectly}
              onClick={(e) => {
                setStudentAnswer(String(numero));
                if (!hasAnsweredCorrectly) handleCheckAnswer(e);
              }}
              className={`w-12 h-12 rounded-full font-black text-base border-2 transition-all flex items-center justify-center transform active:scale-95 ${
                studentAnswer === String(numero)
                  ? 'bg-sky-600 border-sky-600 text-white shadow-md'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:border-sky-500 hover:text-sky-600 hover:bg-sky-50/30'
              } ${hasAnsweredCorrectly ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {numero}
            </button>
          ))}
        </div>
      </div>
    );
  };

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

      <header className="app-header">
        <div className="header-left">
          <button id="menu-toggle" className="menu-toggle-btn" onClick={(e) => { e.stopPropagation(); document.getElementById('sidebar')?.classList.toggle('open'); }}>
            <span className="hamburger-line"></span><span className="hamburger-line"></span><span className="hamburger-line"></span>
          </button>
          <div className="logo">English For All</div>
        </div>

        <div className="progress-container">
          <div className="progress-bar-bg">
            <div id="progress-bar" className="progress-bar-fill" style={{ width: `${((currentQuestionIndex + 1) / ((currentPractice === '3' || currentPractice === '4') ? 5 : 6)) * 100}%` }}></div>
          </div>
          <span id="progress-text" className="progress-text">Pregunta {currentQuestionIndex + 1} de {(currentPractice === '3' || currentPractice === '4') ? 5 : 6}</span>
        </div>

        <div className="avatar" onClick={() => signOut({ callbackUrl: "/" })} style={{ cursor: 'pointer', backgroundColor: '#F2C83B', color: '#000000', fontWeight: 'bold' }} title="Haz clic para Cerrar Sesión">
          {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </header>

      <div className="app-layout">
        <aside id="sidebar" className="sidebar">
          <h3 className="sidebar-title">Ejercicios de Práctica</h3>
          <ul className="sidebar-menu">
            <li className="menu-item" id="menu-metodologia" onClick={() => { setClicsMenuContador(prev => prev + 1); forzarOcultarSidebar(); }}><span className="menu-number">1</span><span className="menu-text">Metodología.</span></li>
            <li className="menu-item" id="menu-alfabeto" onClick={() => { setClicsMenuContador(prev => prev + 1); forzarOcultarSidebar(); }}><span className="menu-number">2</span><span className="menu-text">Alfabeto de fonemas (sonidos).</span></li>
            <li className={`menu-item ${currentPractice === '3' ? 'active' : ''}`} id="menu-practica-1" onClick={() => { setCurrentPractice('3'); setClicsMenuContador(prev => prev + 1); forzarOcultarSidebar(); }}><span className="menu-number">3</span><span className="menu-text">Práctica 1 Listening De Vocales Cortas.</span></li>
            <li className={`menu-item ${currentPractice === '4' ? 'active' : ''}`} id="menu-diptongos" onClick={() => { setCurrentPractice('4'); setClicsMenuContador(prev => prev + 1); setCurrentWordIndex(0); setCurrentQuestionIndex(0); setShowFeedback(false); setHasAnsweredCorrectly(false); setStudentAnswer(''); forzarOcultarSidebar(); }}><span className="menu-number">4</span><span className="menu-text">Práctica 2 Listening de Diptóngos.</span></li>
            <li className={`menu-item ${currentPractice === '5' ? 'active' : ''}`} id="menu-practica-2" onClick={() => { setCurrentPractice('5'); setClicsMenuContador(prev => prev + 1); setCurrentWordIndex(0); setCurrentQuestionIndex(0); setShowFeedback(false); setHasAnsweredCorrectly(false); setStudentAnswer(''); forzarOcultarSidebar(); }}><span className="menu-number">5</span><span className="menu-text">Práctica 3 Listening de Consonantes.</span></li>
            <li className="menu-item" id="menu-grafemas" onClick={() => { setClicsMenuContador(prev => prev + 1); forzarOcultarSidebar(); }}><span className="menu-number">6</span><span className="menu-text">Primeros Grafemas.</span></li>
            <li className="menu-item" id="menu-sopa" onClick={() => { setClicsMenuContador(prev => prev + 1); forzarOcultarSidebar(); }}><span className="menu-number">7</span><span className="menu-text">Sopa de letras.</span></li>
            <li className="menu-item" id="menu-flashcards" onClick={() => { setClicsMenuContador(prev => prev + 1); forzarOcultarSidebar(); }}><span className="menu-number">8</span><span className="menu-text">Flashcards significados.</span></li>
            <li className="menu-item" id="menu-frases" onClick={() => { setClicsMenuContador(prev => prev + 1); forzarOcultarSidebar(); }}><span className="menu-number">9</span><span className="menu-text">Frases.</span></li>
          </ul>
        </aside>

        <main className="main-container">
          <div className="instruction-card">
            <p id="instruction-text" className="instruction-text">{questionsTexts[currentQuestionIndex]}</p>
          </div>

          <div className="practice-card unified-media-card">
            <div className="w-full flex justify-center pb-2">
              {currentPractice === '3' ? (
                <select id="fonema-select" className="font-dropdown-top w-full max-w-[320px] text-center" value={currentFonema} onChange={changeFonemaDropdown}>
                  <option value="ə">Fonema /ə/</option>
                  <option value="ɪ">Fonema /ɪ/</option>
                  <option value="ɛ">Fonema /ɛ/</option>
                  <option value="æ">Fonema /æ/</option>
                  <option value="ʌ">Fonema /ʌ/</option>
                </select>
              ) : currentPractice === '4' ? (
                <select id="fonema-select" className="font-dropdown-top w-full max-w-[320px] text-center" value={currentFonema} onChange={changeFonemaDropdown}>
                  <option value="aɪ">Fonema /aɪ/</option>
                  <option value="eɪ">Fonema /eɪ/</option>
                  <option value="ɔɪ">Fonema /ɔɪ/</option>
                  <option value="aʊ">Fonema /aʊ/</option>
                  <option value="oʊ">Fonema /oʊ/</option>
                </select>
              ) : (
                <select id="fonema-select" className="font-dropdown-top w-full max-w-[320px] text-center" value={currentFonema} onChange={changeFonemaDropdown}>
                  <option value="1">Grafemas de /θ/ vs /ð/</option>
                  <option value="2">Grafemas de /ʧ/ vs /ʤ/</option>
                  <option value="3">Grafemas de /ʤ/ vs /j/</option>
                  <option value="4">Grafemas de /ʃ/ vs /ʒ/</option>
                </select>
              )}
            </div>

            <div className="media-buttons-row">
              <div className="media-column-left">
                <button id="play-word-btn" onClick={handlePlayWordAudio} className="audio-btn"><IconoBocina /><span>Palabra</span></button>
              </div>
              <div className="media-column-right">
                <button id="play-vocal-btn" onClick={handlePlayVocalAudio} className={`audio-btn vocal-btn ${(currentPractice !== '3' && currentPractice !== '4') ? 'btn-disabled opacity-40 cursor-not-allowed' : ''}`} disabled={currentPractice !== '3' && currentPractice !== '4'}><IconoNota /><span>Vocal</span></button>
              </div>
            </div>

            <div className="media-slider-row">
              <div className="interactive-wave-box">
                <div className="wave-container"><div className="wave-bar"></div><div className="wave-bar"></div><div className="wave-bar"></div><div className="wave-bar"></div><div className="wave-bar"></div></div>
                <input type="range" min="0.5" max="2.0" step="0.25" id="speed-slider" value={audioSpeed} onChange={(e) => setAudioSpeed(parseFloat(e.target.value))} className="over-wave-slider" />
                <span id="speed-bubble" className="speed-bubble-indicator">{audioSpeed.toFixed(2)}x</span>
              </div>
            </div>
          </div>

          {currentPractice === '5' && currentQuestionIndex === 4 ? (
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm text-center flex flex-col gap-4">
              <span className="response-title block mb-2">Selecciona el fonema correcto</span>
              <div className="flex gap-4 justify-center">
                {currentFonema === '1' && (
                  <>
                    <button onClick={(e) => handleCheckAnswer(e, "/θ/")} className="check-green-btn !bg-sky-600 hover:!bg-sky-700 !px-8" disabled={hasAnsweredCorrectly}>/θ/</button>
                    <button onClick={(e) => handleCheckAnswer(e, "/ð/")} className="check-green-btn !bg-sky-600 hover:!bg-sky-700 !px-8" disabled={hasAnsweredCorrectly}>/ð/</button>
                  </>
                )}
                {currentFonema === '2' && (
                  <>
                    <button onClick={(e) => handleCheckAnswer(e, "/ʧ/")} className="check-green-btn !bg-sky-600 hover:!bg-sky-700 !px-8" disabled={hasAnsweredCorrectly}>/ʧ/</button>
                    <button onClick={(e) => handleCheckAnswer(e, "/ʤ/")} className="check-green-btn !bg-sky-600 hover:!bg-sky-700 !px-8" disabled={hasAnsweredCorrectly}>/ʤ/</button>
                  </>
                )}
                {currentFonema === '3' && (
                  <>
                    <button onClick={(e) => handleCheckAnswer(e, "/ʤ/")} className="check-green-btn !bg-sky-600 hover:!bg-sky-700 !px-8" disabled={hasAnsweredCorrectly}>/ʤ/</button>
                    <button onClick={(e) => handleCheckAnswer(e, "/j/")} className="check-green-btn !bg-sky-600 hover:!bg-sky-700 !px-8" disabled={hasAnsweredCorrectly}>/j/</button>
                  </>
                )}
                {currentFonema === '4' && (
                  <>
                    <button onClick={(e) => handleCheckAnswer(e, "/ʃ/")} className="check-green-btn !bg-sky-600 hover:!bg-sky-700 !px-8" disabled={hasAnsweredCorrectly}>/ʃ/</button>
                    <button onClick={(e) => handleCheckAnswer(e, "/ʒ/")} className="check-green-btn !bg-sky-600 hover:!bg-sky-700 !px-8" disabled={hasAnsweredCorrectly}>/ʒ/</button>
                  </>
                )}
              </div>
              {errorMessage && <p className="error-text text-center mt-2">{errorMessage}</p>}
            </div>
          ) : (currentPractice === '5' && currentQuestionIndex === 5) ? (
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col gap-4">
              <span className="response-title">Selecciona las vocales presentes</span>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[180px] overflow-y-auto p-2 border border-zinc-100 rounded-xl bg-zinc-50">
                {vocalOptionsP2.map(vocal => (
                  <button key={vocal} type="button" onClick={() => !hasAnsweredCorrectly && toggleVocalSelection(`/${vocal}/`)} className={`p-2 rounded-lg text-sm font-bold border transition-all ${studentSelectedVocals.includes(`/${vocal}/`) ? 'bg-sky-600 border-sky-600 text-white shadow-sm' : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'} ${hasAnsweredCorrectly ? 'cursor-not-allowed opacity-70' : ''}`} disabled={hasAnsweredCorrectly}>/{vocal}/</button>
                ))}
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-100">
                <div className="flex-1">{errorMessage && <p className="error-text">{errorMessage}</p>}</div>
                <button onClick={handleCheckAnswer} className={`check-green-btn ${hasAnsweredCorrectly ? 'btn-disabled' : ''}`} disabled={hasAnsweredCorrectly}>Comprobar Selección</button>
              </div>
            </div>
          ) : currentQuestionIndex === 0 ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm w-full">
              {renderBotoneraConsonantesPregunta1()}
            </div>
          ) : currentQuestionIndex === 1 ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm w-full">
              {renderBotoneraVocalesPregunta2()}
            </div>
          ) : currentQuestionIndex === 2 ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm w-full">
              {renderBotoneraFichasPregunta3()}
            </div>
          ) : (
            <div className="response-card split-response-card">
              <div className="response-left-pane">
                <span className="response-title">Tu Respuesta</span>
                <input type="text" id="student-answer" ref={answerInputRef} value={studentAnswer} disabled={hasAnsweredCorrectly} onChange={(e) => { setStudentAnswer(e.target.value); if (errorMessage !== "") setErrorMessage(""); }} onKeyPress={handleKeyPress} placeholder="Escribe aquí..." className={`response-input ${errorMessage ? 'input-invalid' : ''}`} />
                <p id="error-message" className="error-text">{errorMessage}</p>
              </div>
              <div className="response-divider-line"></div>
              <div className="response-right-pane">
                <button id="check-answer-btn" onClick={handleCheckAnswer} className={`check-green-btn ${hasAnsweredCorrectly ? 'btn-disabled' : ''}`} disabled={hasAnsweredCorrectly}>Comprobar</button>
              </div>
            </div>
          )}

          {showFeedback && (
            <div id="feedback-card" className="feedback-card">
              <span className="feedback-title">Resultado de la evaluación:</span>
              <div id="feedback-phrase" className="feedback-phrase">
                {feedbackIsCorrect ? <span className="word-correct">{feedbackSuccessNote}</span> : <>Tu respuesta no es correcta. ¡Inténtalo de nuevo!</>}
              </div>
              <div id="tip-text" className="tip-box">
                {feedbackIsCorrect ? "Recuerda que esta práctica se trata de poner atención a los sonidos no a los grafemas." : (currentQuestionIndex === 5 ? "Revisa con calma cada una de las sílabas de la palabra al escucharla de manera lenta con el deslizador." : "Recuerda que los diptongos o las vocales compuestas cuentan como 1 sonido. Tampoco te olvides de utilizar la técnica de eliminación de sonidos.")}
              </div>
            </div>
          )}

          <div className="navigation-buttons" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '16px' }}>
            <button id="prev-btn" onClick={handlePreviousQuestion} className={`back-question-btn ${currentQuestionIndex === 0 ? 'hidden' : ''}`} style={{ flex: 1 }}>← Anterior</button>
            <button id="action-btn" onClick={handleNextQuestion} className={`next-btn ${!hasAnsweredCorrectly ? 'btn-disabled' : ''}`} disabled={!hasAnsweredCorrectly} style={{ flex: 2 }}>
              {currentQuestionIndex === ((currentPractice === '3' || currentPractice === '4') ? 5 : 6) - 1 ? "SIGUIENTE PALABRA ➔" : "SIGUIENTE PREGUNTA ➔"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
