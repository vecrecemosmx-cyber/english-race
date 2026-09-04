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
  // Estado para disparar y reiniciar la animación del temblor
  const [triggerShake, setTriggerShake] = useState(false);


  // --- ⏱️ REFERENCIAS Y ESTADOS PARA CAPTURA INVISIBLE DE TIEMPOS ---
  const startTimeWordRef = useRef(null);     
  const startTimeQuestionRef = useRef(null); 
  const [isPracticeStarted, setIsPracticeStarted] = useState(false);
  const [clicsMenuContador, setClicsMenuContador] = useState(0);
  const [tiemposPreguntas, setTiemposPreguntas] = useState({});
  const [respuestasInputs, setRespuestasInputs] = useState({});

  const [hoveredSoundsCount, setHoveredSoundsCount] = useState(null);

  // --- ESTADOS REORDENADOS Y NUEVAS PROPIEDADES DE BLOQUES ---
  const [isFonicExpanded, setIsFonicExpanded] = useState(false);
  
  // 🚀 NUEVO ESTADO: Guarda de manera fija los bloques que el estudiante respondió correctamente en la Q1
  const [savedFonicBlocks, setSavedFonicBlocks] = useState(0);

  // Estado para garantizar que el audio de bienvenida se reproduzca solo una vez al iniciar
  const [hasPlayedWelcome, setHasPlayedWelcome] = useState(false);

  // 🚀 NUEVO REQUERIMIENTO: DISPARADOR DE SCROLL AUTOMÁTICO INICIAL EN CELULARES
  useEffect(() => {
    if (status === "authenticated") {
      // Validamos si el ancho de la pantalla corresponde a un dispositivo móvil (menor a 768px)
      const esCelular = window.matchMedia("(max-width: 768px)").matches;
      if (esCelular) {
        setTimeout(() => {
          const contenedorPregunta = document.getElementById('instruction-card-root');
          if (contenedorPregunta) {
            contenedorPregunta.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 600); // Pequeño margen de tiempo para asegurar que el DOM de la plataforma cargó tras el login
      }
    }
  }, [status]);

  // 🚀 REGLA SOLICITADA: DESPLAZAMIENTO SUAVE AL CAMBIAR DE PRÁCTICA EN EL SIDEBAR
  useEffect(() => {
    // Si la plataforma ya cargó y detecta un cambio en la práctica seleccionada
    if (status === "authenticated" && currentPractice) {
      setTimeout(() => {
        const contenedorPregunta = document.getElementById('instruction-card-root');
        if (contenedorPregunta) {
          contenedorPregunta.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 250); // Margen de tiempo prudente para asegurar el renderizado del nuevo set de datos
    }
  }, [currentPractice, status]);

  // 🚀 REGLA DE OPTIMIZACIÓN: PRE-CALENTAMIENTO SILENCIOSO DE SPEECHSYNTHESIS
  useEffect(() => {
    // Despierta e inicializa el motor de voz en segundo plano al montar la plataforma
    if (status === "authenticated" && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // Limpia cualquier cola colgada
        
        // Enviamos una elisión o texto vacío para forzar al navegador a cargar el paquete 'en-US'
        const dummyUtterance = new SpeechSynthesisUtterance("");
        dummyUtterance.lang = 'en-US';
        dummyUtterance.volume = 0; // Volumen en cero absoluto para que sea imperceptible
        
        window.speechSynthesis.speak(dummyUtterance);
        console.log("⚡ Motor fónico SpeechSynthesis pre-calentado con éxito.");
      } catch (error) {
        console.log("Aviso de inicialización pasiva de audio:", error);
      }
    }
  }, [status]);

  // ==========================================================================
  // EFECTOS DE CONTROL AUTOMÁTICOS
  // ==========================================================================

  // 🚀 REGLA ACTUALIZADA: DISPARADOR AUTOMÁTICO DE INSTRUCCIONES AL INICIAR SESIÓN
  useEffect(() => {
    // Si el usuario está autenticado y aún no se han reproducido las instrucciones
    if (status === "authenticated" && !hasPlayedWelcome) {
      const timer = setTimeout(() => {
        handlePlayInstructions(); // Invoca la locución con el nuevo cierre integrado
        setHasPlayedWelcome(true); // Bloquea el estado para que ocurra una única vez por sesión
      }, 800); // Breve espera estratégica para garantizar el montado limpio de la interfaz
      
      return () => clearTimeout(timer);
    }
  }, [status, hasPlayedWelcome]);

  const mappingP1 = { "1": "ə", "2": "ɪ", "3": "ɛ", "4": "æ", "5": "ʌ" };
  const mappingP2 = { "1": "aɪ", "2": "eɪ", "3": "ɔɪ", "4": "aʊ", "5": "oʊ" };

  const questionsTexts = (currentPractice === '3' || currentPractice === '4')
    ? [
        "1. ¿Cuántos sonidos forman la palabra?",
        "2. ¿Cuántos fonemas consonantes tiene?",
        "3. ¿Cuántos fonemas vocales tiene?",
        "4. ¿En qué sílaba está el énfasis?",
        "5. ¿En qué sílaba está la vocal que estamos practicando?"
      ]
    : [
        "1. ¿Cuántos sonidos forman la palabra?",
        "2. ¿Cuántos fonemas consonantes tiene?",
        "3. ¿Cuántos fonemas vocales tiene?",
        "4. ¿En qué sílaba está el énfasis?",
        "5. Elige el fonema correcto.",
        "6. Selecciona todos los fonemas vocales que escuchas."
      ];

  const baseAudioUrl = "/audio/";
  const vocalAudioFiles = { 
    "ə": "PHONEME-DUST.mp3", "ɪ": "PHONEME-PINK.mp3", "ɛ": "PHONEME-RED.mp3", "æ": "PHONEME-SAND.mp3", "ʌ": "PHONEME-CUP.mp3",
    "aɪ": "buy.mp3", "eɪ": "bay.mp3", "ɔɪ": "boy.mp3", "aʊ": "cow.mp3", "oʊ": "saw.mp3"
  };

  const vocalOptionsP2 = [
    "ɪ", "ʌ", "ʊ", "ə", "ɒ", "æ", "e", "i:", "ɑ:", "u:", "ɜ:", "ɔ:", 
    "aɪ", "eɪ", "ɔɪ", "aʊ", "oʊ", "ɑːr", "ɜːr", "ɔːr", "ər"
  ];
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
    if (status === "authenticated" && answerInputRef.current && currentQuestionIndex < 4) {
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

  // REGLA SOLICITADA: Cierra el menú lateral de inmediato al pulsar una opción
  const forzarOcultarSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');
  };

  // 🚀 REGLA MEJORADA: RESET TOTAL, ABSOLUTO Y ATÓMICO AL CAMBIAR EL FONEMA
  const changeFonemaDropdown = (e) => {
    const nuevoFonema = e.target.value;
    
    // Limpieza absoluta de respuestas, errores y estados de evaluación
    setStudentAnswer('');
    setErrorMessage('');
    setShowFeedback(false);
    setHasAnsweredCorrectly(false);
    setIsPracticeStarted(false);
    setStudentSelectedVocals([]);
    
    // Limpieza de estados visuales y animaciones (Evita bloques coloreados fijos)
    setHoveredSoundsCount(null);
    setTriggerShake(false); // Apaga el temblor peculiar para el nuevo ejercicio
    setIsFonicExpanded(false);
    setSavedFonicBlocks(0); // Resetea por completo el candado de bloques Elkonin de la Q1
    
    // Regreso atómico al punto de partida inicial
    setCurrentFonema(nuevoFonema);
    setCurrentWordIndex(0);
    setCurrentQuestionIndex(0);
  };

  const resetEntireExercise = () => {
    setCurrentQuestionIndex(0);
    setStudentAnswer('');
    setStudentSelectedVocals([]);
    setShowFeedback(false);
    setErrorMessage('');
    setHasAnsweredCorrectly(false);
    setIsFonicExpanded(false);
    setSavedFonicBlocks(0); // Limpiamos el valor en el cambio de palabra completa
  };

  // 🚀 REGLA SOLICITADA: FUNCIÓN CENTRALIZADA PARA REPRODUCIR LAS INSTRUCCIONES (es-MX)
  const handlePlayInstructions = (e) => {
    if (e) e.preventDefault();
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // Detiene cualquier audio o palabra en reproducción

        const guionCompleto = "Bienvenido a la práctica de hoy, el objetivo de este ejercicio es crear conciencia fonológica del idioma inglés. Lo haremos primero con palabras y luego con frases. En este caso debes presionar el botón Palabra para escuchar una palabra en inglés y practicar el entendimiento de los sonidos consonantes y vocales uno por uno. Puedes acelerar la velocidad de reproducción conforme vayas mejorando o puedes disminuirla para cuando no entiendas bien la pronunciación. Por favor lee con atención y recuerda enfocarte en los sonidos y no en las letras que pudieras visualizar de forma automática al escuchar los sonidos. Elige el fonema que quieres practicar hoy y comencemos.";

        const utterance = new SpeechSynthesisUtterance(guionCompleto);
        utterance.lang = 'es-MX'; // Español de México estricto
        utterance.rate = 1.0;     // Velocidad natural de dictado instructivo
        utterance.pitch = 1.0;

        // Búsqueda proactiva de una voz mexicana en el navegador del alumno
        const voces = window.speechSynthesis.getVoices();
        const vozMx = voces.find(v => v.lang === 'es-MX' || v.lang.startsWith('es_MX'));
        if (vozMx) utterance.voice = vozMx;

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.log("Error al reproducir guion fónico instructivo:", err);
      }
    }
  };

  // --- REPRODUCCIÓN AUDIO LOCAL ORIGINAL ---
  const handlePlayWordAudio = (e) => {
    if (e) e.preventDefault();
    if (answerInputRef.current && currentQuestionIndex < 4) answerInputRef.current.focus();
    if (!currentData) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanWord = currentData.word.replace(/\(.*\)/, "").trim();
      const utterance = new SpeechSynthesisUtterance(cleanWord);
      utterance.lang = 'en-US';
      utterance.rate = audioSpeed;
      window.speechSynthesis.speak(utterance);

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
    startTimeQuestionRef.current = chrome || ahora; 
  };
  // --- MOTOR DE EVALUACIÓN MULTI-CASO ACTUALIZADO CON COPIADO DE RESPUESTA OK ---
  const handleCheckAnswer = (e, valorBotonP5 = null, valorDirectoBoton = null) => {
    if (e) e.preventDefault();
    if (!currentData) return;

    let value = valorDirectoBoton ? String(valorDirectoBoton).trim() : studentAnswer.trim();
    let isCorrect = false;
    let successNote = "";

    if (currentQuestionIndex < 4) {
      let isTwoDigitQuestion = (currentQuestionIndex === 0); 
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
        case 0: // Q1: Sonidos Totales
          correctValue = currentData ? String(currentData.f).trim() : ""; 
          successNote = `¡Excelente! Esta palabra está compuesta por ${correctValue} sonidos.`; 
          break;
        case 1: // Q2: Consonantes
          correctValue = currentData ? String(currentData.fc).trim() : ""; 
          successNote = `¡Correcto! Tiene ${correctValue} sonidos consonantes.`; 
          break;
        case 2: // Q3: Vocales
          correctValue = currentData ? String(currentData.fv).trim() : ""; 
          successNote = `¡Muy bien! Tiene ${currentData.fv} sonidos vocálicos.`; 
          break;
        case 3: // Q4: Stress
          correctValue = currentData ? String(currentData.stress).trim() : ""; 
          successNote = `¡Exacto! El acento o énfasis está en la sílaba ${correctValue}.`; 
          break;
      }
      
      isCorrect = (value === correctValue);
      if (isCorrect) {
        registrarMétricaPreguntaOculta(value);
        
        // 🚀 REGLA SOLICITADA: Si la respuesta de la pregunta 1 (índice 0) es correcta, guardamos el número de bloques
        if (currentQuestionIndex === 0) {
          setSavedFonicBlocks(parseInt(value));
        }
      }
    } 
    else if (currentQuestionIndex === 4) {
      if (currentPractice === '3' || currentPractice === '4') {
        if (value === "") { setErrorMessage("⚠️ Elige tu respuesta antes de comprobar."); setShowFeedback(false); return; }
        const dbValue = String(currentData.posVocal).trim();
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
      if (studentSelectedVocals.length === 0) { setErrorMessage("⚠️ Selecciona al menos un fonema vocal."); setShowFeedback(false); return; }
      setErrorMessage("");
      const limpiarFormato = (txt) => txt.replace(/\\|\/|\s/g, "").replace(/:/g, "ː");
      const normalizarFonema = (fonema) => { const tl = limpiarFormato(fonema); return { "a": "aː", "e": "eː", "i": "iː", "ɔ": "ɔː", "u": "uː" }[tl] || tl; };
      const vocalesLimpiasJson = currentData.vocalesIPA.split(",").map(v => normalizarFonema(v));
      const vocalesSeleccionadasEstudiante = studentSelectedVocals.map(v => normalizarFonema(v));
      isCorrect = (vocalesLimpiasJson.every(v => vocalesSeleccionadasEstudiante.includes(v)) && vocalesLimpiasJson.length === vocalesSeleccionadasEstudiante.length);
      if (isCorrect) { successNote = `¡Felicidades! Identificaste los fonemas vocales: ${currentData.vocalesIPA.replace(/\\/g, "")}.`; registrarMétricaPreguntaOculta(studentSelectedVocals.join(", ")); }
    }

    // Configuración de estados de evaluación globales
    setHasAnsweredCorrectly(isCorrect);
    setFeedbackIsCorrect(isCorrect);
    setFeedbackSuccessNote(successNote);
    setShowFeedback(true);

    // Activación controlada del efecto de temblor peculiar ante respuestas incorrectas
    if (!isCorrect) {
      setTriggerShake(false); // Reseteo momentáneo para clicks consecutivos
      setTimeout(() => {
        setTriggerShake(true); // Enciende animación de error
      }, 10);
    } else {
      setTriggerShake(false);
    }

    // 🚀 REGLA SOLICITADA: ENRUTAMIENTO INTELIGENTE DEL SCROLL AUTOMÁTICO
    setTimeout(() => {
      if (isCorrect) {
        // SI ES CORRECTA: Desplazamos directo al botón de "Siguiente" para agilizar navegación
        const botonSiguiente = document.getElementById('action-btn');
        if (botonSiguiente) {
          botonSiguiente.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        // SI ES INCORRECTA: Desplazamos únicamente hasta la tarjeta de feedback/error
        const tarjetaFeedback = document.getElementById('feedback-card');
        if (tarjetaFeedback) {
          tarjetaFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }, 120); // Margen de tiempo optimizado para esperar el pintado dinámico del DOM
  };

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

  // 🚀 REGLA SOLICITADA: RESTABLECIMIENTO Y DESPLAZAMIENTO SUAVE AL VOLVER A LA PREGUNTA ANTERIOR
  const handlePreviousQuestion = (e) => {
    if (e) e.preventDefault();
    if (currentQuestionIndex > 0) {
      // Retroceso en la secuencia de evaluación
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      
      // Limpieza atómica de respuestas anteriores y mensajes para el nuevo enfoque
      setStudentAnswer("");
      setStudentSelectedVocals([]);
      setShowFeedback(false);
      setHasAnsweredCorrectly(false);
      setErrorMessage("");
      setTriggerShake(false); // Apagamos cualquier rastro de animación de error
      
      // Captura invisible de tiempos reiniciada para la nueva métrica analítica
      startTimeQuestionRef.current = Date.now(); 

      // Desplazamiento automático de la pantalla hacia arriba (Anclaje de la pregunta)
      setTimeout(() => {
        const contenedorPregunta = document.getElementById('instruction-card-root');
        if (contenedorPregunta) {
          contenedorPregunta.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100); // Margen mínimo optimizado para esperar el cambio de estado en el renderizado
    }
  };

  // ==========================================================================
  // 🚀 ACTUALIZADO CON BOTÓN EXPANSOR (+): PREGUNTA 1 (SONIDOS TOTALES)
  // ==========================================================================
  const renderBotoneraFichasPregunta1 = () => {
    const limiteIluminado = hoveredSoundsCount || (studentAnswer ? parseInt(studentAnswer) : 0);
    
    // Regla de negocio: Si no está expandido muestra del 3 al 6, si pulsa "+" se abre del 3 al 12
    const botonesIniciales = [3, 4, 5, 6];
    const botonesExpandidos = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const rangoActivo = isFonicExpanded ? botonesExpandidos : botonesIniciales;

    // 🚀 REGLA SOLICITADA: Muestra 6 bloques iniciales fijados, si se expande con "+" muestra 12 totales
    const totalBloquesVisuales = isFonicExpanded ? 12 : 6;

    return (
      <div className="w-full flex flex-col items-center gap-6 p-4 bg-zinc-50/50 rounded-3xl border border-zinc-100 animate-fade-in">
        <span className="response-title !text-xs !tracking-widest">Selecciona el número de sonidos.</span>
        <div className="flex flex-wrap justify-center gap-3">
          {rangoActivo.map((numero) => (
            <button
              key={numero}
              type="button"
              disabled={hasAnsweredCorrectly}
              onMouseEnter={() => !hasAnsweredCorrectly && setHoveredSoundsCount(numero)}
              onMouseLeave={() => !hasAnsweredCorrectly && setHoveredSoundsCount(null)}
              onClick={(e) => {
                setStudentAnswer(String(numero));
                if (!hasAnsweredCorrectly) handleCheckAnswer(e, null, String(numero));
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
          
          {!isFonicExpanded && (
            <button
              type="button"
              disabled={hasAnsweredCorrectly}
              onClick={() => setIsFonicExpanded(true)}
              className="w-12 h-12 rounded-full font-black text-xl border-2 bg-white border-zinc-300 text-zinc-500 hover:border-sky-500 hover:text-sky-600 hover:bg-sky-50/50 flex items-center justify-center transform active:scale-95"
              title="Mostrar más números"
            >
              +
            </button>
          )}
        </div>

        {/* 🔲 BLOQUES ELKONIN DINÁMICOS (Muestra 6 o 12 según el estado del botón +) */}
        <div className="flex flex-wrap justify-center gap-2 mt-2 min-h-[36px] items-center max-w-full">
          {Array.from({ length: totalBloquesVisuales }).map((_, idx) => {
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
          <span className="text-xs text-zinc-500 font-semibold italic animate-pulse block text-center max-w-md leading-relaxed">
            "Usa los cuadros como apoyo visual y mental para darle espacio a cada sonido durante el ejercicio."
          </span>
        )}
      </div>
    );
  };

  // ==========================================================================
  // RENDERIZADOR ACTUALIZADO CORREGIDO: PREGUNTA 2 (CONTEO DE CONSONANTES 1-7)
  // ==========================================================================
  const renderBotoneraConsonantesPregunta2 = () => {
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
                if (!hasAnsweredCorrectly) handleCheckAnswer(e, null, String(numero));
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
        
        {/* 🚀 REGLA SOLICITADA: Bloques Elkonin persistentes basados en la respuesta guardada de la Q1 */}
        {savedFonicBlocks > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-4 min-h-[36px] items-center border-t border-zinc-100 pt-4 w-full">
            {Array.from({ length: savedFonicBlocks }).map((_, idx) => (
              <div key={idx} className="w-8 h-8 rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-100/50" />
            ))}
          </div>
        )}
      </div>
    );
  };
  // ==========================================================================
  // RENDERIZADOR ACTUALIZADO CORREGIDO: PREGUNTA 3 (CONTEO DE VOCALES RANGO 1-5)
  // ==========================================================================
  const renderBotoneraVocalesPregunta3 = () => {
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
                if (!hasAnsweredCorrectly) handleCheckAnswer(e, null, String(numero));
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

        {/* 🚀 REGLA SOLICITADA: Bloques Elkonin persistentes basados en la respuesta guardada de la Q1 */}
        {savedFonicBlocks > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-4 min-h-[36px] items-center border-t border-zinc-100 pt-4 w-full">
            {Array.from({ length: savedFonicBlocks }).map((_, idx) => (
              <div key={idx} className="w-8 h-8 rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-100/50" />
            ))}
          </div>
        )}
      </div>
    );
  };

  // ==========================================================================
  // RENDERIZADOR ACTUALIZADO SEGURO: PREGUNTAS 4 Y 5 (BOTONERA TEXTUAL)
  // ==========================================================================
  const renderBotoneraSilabicaPreguntas4y5 = () => {
    const opcionesSilabas = [
      { texto: "primera", valor: "1" },
      { texto: "segunda", valor: "2" },
      { texto: "tercera", valor: "3" },
      { texto: "cuarta",  valor: "4" },
      { texto: "quinta",   valor: "5" }
    ];

    return (
      <div className="w-full flex flex-col items-center gap-4 p-4 bg-zinc-50/50 rounded-3xl border border-zinc-100 animate-fade-in">
        <span className="response-title !text-xs !tracking-widest">Selecciona la sílaba correcta</span>
        <div className="flex flex-wrap justify-center gap-2">
          {opcionesSilabas.map((item) => (
            <button
              key={item.valor}
              type="button"
              disabled={hasAnsweredCorrectly}
              onClick={(e) => {
                setStudentAnswer(item.valor);
                if (!hasAnsweredCorrectly) handleCheckAnswer(e, null, item.valor);
              }}
              className={`px-5 py-3 rounded-full font-bold text-sm border-2 transition-all transform active:scale-95 capitalize ${
                studentAnswer === item.valor
                  ? 'bg-amber-500 border-amber-500 text-white shadow-md'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50/20'
              } ${hasAnsweredCorrectly ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {item.texto}
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
          {/* 🚀 ANCLAJE MÓVIL OPTIMIZADO: ID inyectado para el scroll automático en celulares */}
          <div className="instruction-card" id="instruction-card-root">
            <p id="instruction-text" className="instruction-text">{questionsTexts[currentQuestionIndex]}</p>
          </div>

          <div className="practice-card unified-media-card">
            {/* 🚀 DISTRIBUCIÓN SIMÉTRICA AL 50% FORZADA MEDIANTE ESTILOS EN LÍNEA DIRECTOS */}
            <div className="w-full grid grid-cols-2 gap-3 pb-2 items-center">
              
              {/* COLUMNA IZQUIERDA: Botón de Instrucciones (Forzado a color #F4F7FA y texto blanco) */}
              <div className="w-full">
                <button
                  id="play-instructions-btn"
                  onClick={handlePlayInstructions}
                  type="button"
                  // 💡 Usamos style para obligar al navegador a usar el fondo gris #F4F7FA, letras blancas y un tamaño de fuente pequeño ajustable
                  style={{
                    backgroundColor: '#475569',
                    color: '#FFFFFF',
                    fontSize: '12px', // Redúcelo aquí a '9px' o auméntalo a '11px' según necesites
                  }}
                  className="audio-btn hover:opacity-85 !font-black tracking-tight flex items-center justify-center gap-1 !py-2.5 !px-2 !w-full h-10 shadow-sm rounded-xl transition-all duration-200"
                  title="Volver a escuchar las instrucciones de bienvenida"
                >
                  {/* Icono de la bocina forzado a heredar el color blanco */}
                  <div className="scale-75 flex items-center justify-center flex-shrink-0 text-white fill-white stroke-white">
                    <IconoBocina />
                  </div>
                  <span className="truncate">Instrucciones</span>
                </button>
              </div>

              {/* COLUMNA DERECHA: Menú Desplegable (Ocupa la mitad exacta restante) */}
              <div className="w-full">
                {currentPractice === '3' ? (
                  <select 
                    id="fonema-select" 
                    className="font-dropdown-top !w-full text-center h-10 !py-1 !px-2 font-bold text-xs sm:text-sm border border-zinc-200 rounded-xl" 
                    value={currentFonema} 
                    onChange={changeFonemaDropdown}
                  >
                    <option value="ə">Fonema /ə/</option>
                    <option value="ɪ">Fonema /ɪ/</option>
                    <option value="ɛ">Fonema /ɛ/</option>
                    <option value="æ">Fonema /æ/</option>
                    <option value="ʌ">Fonema /ʌ/</option>
                  </select>
                ) : currentPractice === '4' ? (
                  <select 
                    id="fonema-select" 
                    className="font-dropdown-top !w-full text-center h-10 !py-1 !px-2 font-bold text-xs sm:text-sm border border-zinc-200 rounded-xl" 
                    value={currentFonema} 
                    onChange={changeFonemaDropdown}
                  >
                    <option value="aɪ">Fonema /aɪ/</option>
                    <option value="eɪ">Fonema /eɪ/</option>
                    <option value="ɔɪ">Fonema /ɔɪ/</option>
                    <option value="aʊ">Fonema /aʊ/</option>
                    <option value="oʊ">Fonema /oʊ/</option>
                  </select>
                ) : (
                  <select 
                    id="fonema-select" 
                    className="font-dropdown-top !w-full text-center h-10 !py-1 !px-2 font-bold text-xs sm:text-sm border border-zinc-200 rounded-xl" 
                    value={currentFonema} 
                    onChange={changeFonemaDropdown}
                  >
                    <option value="1">Grafemas de /θ/ vs /ð/</option>
                    <option value="2">Grafemas de /ʧ/ vs /ʤ/</option>
                    <option value="3">Grafemas de /ʤ/ vs /j/</option>
                    <option value="4">Grafemas de /ʃ/ vs /ʒ/</option>
                  </select>
                )}
              </div>

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
              {renderBotoneraFichasPregunta1()}
            </div>
          ) : currentQuestionIndex === 1 ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm w-full">
              {renderBotoneraConsonantesPregunta2()}
            </div>
          ) : currentQuestionIndex === 2 ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm w-full">
              {renderBotoneraVocalesPregunta3()}
            </div>
          ) : (currentQuestionIndex === 3 || (currentQuestionIndex === 4 && (currentPractice === '3' || currentPractice === '4'))) ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm w-full">
              {renderBotoneraSilabicaPreguntas4y5()}
            </div>
          ) : (
            <div className="response-card split-response-card">
              <div className="response-left-pane">
                <span className="response-title">Tu Respuesta</span>
                <input type="text" id="student-answer" ref={answerInputRef} value={studentAnswer} disabled={hasAnsweredCorrectly} onChange={(e) => { setStudentAnswer(e.target.value); if (errorMessage !== "") setErrorMessage(""); }} placeholder="Escribe aquí..." className={`response-input ${errorMessage ? 'input-invalid' : ''}`} />
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
              
              {/* 🚀 COMPONENTE MEJORADO: Inyecta la clase de temblor dinámicamente si triggerShake es true */}
              <div id="feedback-phrase" className={`feedback-phrase ${triggerShake ? 'animacion-error-shake' : ''}`}>
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
