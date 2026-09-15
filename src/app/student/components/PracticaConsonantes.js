'use client';

import { useState, useEffect, useRef } from "react";
import { IconoBocina, IconoNota } from '@/Iconos';
import datasetP3 from '../../database_practice3.json';

export default function PracticaConsonantes({ userEmail, globalSpeed, setGlobalSpeed, menuClics }) {
  // --- ESTADOS DE CONTROL GLOBALES (SINCRONIZADOS ORIGINALES) ---
  const [currentFonema, setCurrentFonema] = useState('1'); 
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [studentSelectedVocals, setStudentSelectedVocals] = useState([]); // Selección múltiple Q6
  const [errorMessage, setErrorMessage] = useState('');
  const [hasAnsweredCorrectly, setHasAnsweredCorrectly] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSuccessNote, setFeedbackSuccessNote] = useState('');
  const [feedbackIsCorrect, setFeedbackIsCorrect] = useState(false);
  const [hoveredSoundsCount, setHoveredSoundsCount] = useState(null);
  const [isFonicExpanded, setIsFonicExpanded] = useState(false);
  const [savedFonicBlocks, setSavedFonicBlocks] = useState(0);
  const [triggerShake, setTriggerShake] = useState(false);

  // --- REFERENCIAS Y ESTADOS PARA CAPTURA INVISIBLE DE TIEMPOS (ORIGINAL) ---
  const startTimeWordRef = useRef(null);     
  const startTimeQuestionRef = useRef(null); 
  const [isPracticeStarted, setIsPracticeStarted] = useState(false);
  const [tiemposPreguntas, setTiemposPreguntas] = useState({});
  const [respuestasInputs, setRespuestasInputs] = useState({});
  const answerInputRef = useRef(null);

  // Rangos numéricos explícitos declarados correctamente con corchetes
  const botonesRangoFonic =[3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const botonesRangoFonicCorto =[3, 4, 5, 6];
  const botonesConsonantes =[1, 2, 3, 4, 5, 6, 7];
  const botonesVocales = [1, 2, 3, 4, 5];

  const questionsTexts = [
    "1. ¿Cuántos sonidos forman la palabra?",
    "2. ¿Cuántos fonemas consonantes tiene?",
    "3. ¿Cuántos fonemas vocales tiene?",
    "4. ¿En qué sílaba está el acento?",
    "5. Elige el fonema correcto.",
    "6. Selecciona todos los fonemas vocales que escuchas."
  ];

  const vocalOptionsP2 = [
    "ɪ", "ʌ", "ʊ", "ə", "ɒ", "æ", "e", "i:", "ɑ:", "u:", "ɜ:", "ɔ:", 
    "aɪ", "eɪ", "ɔɪ", "aʊ", "oʊ", "ɑːr", "ɜːr", "ɔːr", "ər"
  ];

  // --- FILTRADO DINÁMICO REAL DE CONSONANTES SEGÚN TU DATASET DE PRÁCTICA 3 ---
  const palabrasFiltradas = datasetP3.filter(item => {
    return String(item.fonema_id) === String(currentFonema);
  }).map(item => ({
    word: item.word, f: String(item.f), fc: String(item.fc), fv: String(item.fv), stress: String(item.stress), consonant: String(item.consonant), vocalesIPA: String(item.vocalesIPA)
  }));

  const currentData = palabrasFiltradas[currentWordIndex] || null;

  useEffect(() => {
    if (answerInputRef.current && currentQuestionIndex < 4) {
      answerInputRef.current.focus();
    }
  }, [currentQuestionIndex, currentWordIndex, currentFonema]);

  const changeFonemaDropdown = (e) => {
    const nuevoFonema = e.target.value;
    setStudentAnswer('');
    setStudentSelectedVocals([]);
    setErrorMessage('');
    setShowFeedback(false);
    setHasAnsweredCorrectly(false);
    setIsPracticeStarted(false);
    setHoveredSoundsCount(null);
    setTriggerShake(false);
    setIsFonicExpanded(false);
    setSavedFonicBlocks(0);
    setCurrentFonema(nuevoFonema);
    setCurrentWordIndex(0);
    setCurrentQuestionIndex(0);
  };

  // 🚀 RESTAURACIÓN: FUNCIÓN ORIGINAL PARA EL AGREGADO Y REMOCIÓN DE CASILLAS EN SELECCIÓN MÚLTIPLE (Q6)
  const toggleVocalSelection = (vocalFormateada) => {
    if (hasAnsweredCorrectly) return;
    if (errorMessage !== "") setErrorMessage("");
    setStudentSelectedVocals((prevSelected) => {
      if (prevSelected.includes(vocalFormateada)) {
        return prevSelected.filter((v) => v !== vocalFormateada);
      } else {
        return [...prevSelected, vocalFormateada];
      }
    });
  };

  const handlePlayInstructions = (e) => {
    if (e) e.preventDefault();
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const guionCompleto = "Bienvenido a la práctica de hoy, el objetivo de este ejercicio es crear conciencia fonológica del idioma inglés. Lo haremos primero con palabras y luego con frases. En este caso debes presionar el botón Palabra para escuchar una palabra en inglés y practicar el entendimiento de los sonidos consonantes y vocales uno por uno. Puedes acelerar la velocidad de reproducción conforme vayas mejorando o puedes disminuirla para cuando no entiendas bien la pronunciación. Por favor lee con atención y recuerda enfocarte en los sonidos y no en las letras que pudieras visualizar de forma automática al escuchar las palabras. Elige el fonema que quieres practicar hoy y comencemos.";
        const utterance = new SpeechSynthesisUtterance(guionCompleto);
        utterance.lang = 'es-MX';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        const voces = window.speechSynthesis.getVoices();
        const vozMx = voces.find(v => v.lang === 'es-MX' || v.lang.startsWith('es_MX'));
        if (vozMx) utterance.voice = vozMx;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.log("Error al reproducir instrucciones:", err);
      }
    }
  };

  const handlePlayWordAudio = (e) => {
    if (e) e.preventDefault();
    if (answerInputRef.current && currentQuestionIndex < 4) answerInputRef.current.focus();
    if (!currentData) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanWord = currentData.word.replace(/\(.*\)/, "").trim();
      const utterance = new SpeechSynthesisUtterance(cleanWord);
      utterance.lang = 'en-US';
      utterance.rate = globalSpeed;
      window.speechSynthesis.speak(utterance);

      if (!isPracticeStarted) {
        const ahora = Date.now();
        startTimeWordRef.current = ahora;
        startTimeQuestionRef.current = ahora;
        setIsPracticeStarted(true);
      }
    }
  };

  const registrarMétricaPreguntaOculta = (textoRespuesta) => {
    if (!startTimeQuestionRef.current) return;
    const ahora = Date.now();
    const segundosInvertidos = Math.round((ahora - startTimeQuestionRef.current) / 1000);
    const qKey = `q${currentQuestionIndex + 1}`;

    setTiemposPreguntas(prev => ({ ...prev, [`${qKey}_tiempo`]: segundosInvertidos }));
    setRespuestasInputs(prev => ({ ...prev, [`${qKey}_input`]: String(textoRespuesta) }));
    startTimeQuestionRef.current = ahora; 
  };

  // 🚀 RESTAURACIÓN: MOTOR EVALUADOR MULTICASO ORIGINAL COMPLETO (INCLUYE PARSEO IPA DE LA PREGUNTA 6)
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
        case 0: correctValue = String(currentData.f).trim(); successNote = `¡Excelente! Esta palabra está compuesta por ${correctValue} sonidos.`; break;
        case 1: correctValue = String(currentData.fc).trim(); successNote = `¡Correcto! Tiene ${correctValue} sonidos consonantes.`; break;
        case 2: correctValue = String(currentData.fv).trim(); successNote = `¡Muy bien! Tiene ${currentData.fv} sonidos vocálicos.`; break;
        case 3: correctValue = String(currentData.stress).trim(); successNote = `¡Exacto! El acento o énfasis está en la sílaba ${correctValue}.`; break;
      }
      
      isCorrect = (value === correctValue);
      if (isCorrect) {
        registrarMétricaPreguntaOculta(value);
        if (currentQuestionIndex === 0) setSavedFonicBlocks(parseInt(value));
      }
    } 
    else if (currentQuestionIndex === 4) {
      if (!valorBotonP5) return;
      const consonantLimpia = currentData.consonant.replace(/\\/g, "");
      isCorrect = (valorBotonP5 === consonantLimpia);
      if (isCorrect) {
        successNote = `¡Excelente elección! El fonema consonántico correcto de la palabra es ${consonantLimpia}.`;
        registrarMétricaPreguntaOculta(valorBotonP5);
      }
    } 
    else if (currentQuestionIndex === 5) {
      if (studentSelectedVocals.length === 0) { 
        setErrorMessage("⚠️ Selecciona al menos un fonema vocal."); 
        setShowFeedback(false); 
        return; 
      }
      setErrorMessage("");
      
      const limpiarFormato = (txt) => txt.replace(/\\|\/|\s/g, "").replace(/:/g, "ː");
      const normalizarFonema = (fonema) => {
        const tl = limpiarFormato(fonema);
        return { "a": "aː", "e": "eː", "i": "iː", "ɔ": "ɔː", "u": "uː" }[tl] || tl;
      };

      const vocalesLimpiasJson = currentData.vocalesIPA.split(",").map(v => normalizarFonema(v));
      const vocalesSeleccionadasEstudiante = studentSelectedVocals.map(v => normalizarFonema(v));

      isCorrect = (
        vocalesLimpiasJson.every(v => vocalesSeleccionadasEstudiante.includes(v)) && 
        vocalesLimpiasJson.length === vocalesSeleccionadasEstudiante.length
      );

      if (isCorrect) { 
        successNote = `¡Felicidades! Identificaste los fonemas vocales: ${currentData.vocalesIPA.replace(/\\/g, "")}.`; 
        registrarMétricaPreguntaOculta(studentSelectedVocals.join(", ")); 
      }
    }

    setHasAnsweredCorrectly(isCorrect);
    setFeedbackIsCorrect(isCorrect);
    setFeedbackSuccessNote(successNote);
    setShowFeedback(true);

    if (!isCorrect) {
      setTriggerShake(false);
      setTimeout(() => { setTriggerShake(true); }, 10);
    } else {
      setTriggerShake(false);
    }

    // SCROLLS ORIGINALES GARANTIZADOS AL COMPROBAR
    setTimeout(() => {
      if (isCorrect) {
        const botonSiguiente = document.getElementById('action-btn');
        if (botonSiguiente) botonSiguiente.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const tarjetaFeedback = document.getElementById('feedback-card');
        if (tarjetaFeedback) tarjetaFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 120);
  };

  const handleNextQuestion = async (e) => {
    if (e) e.preventDefault();
    if (!hasAnsweredCorrectly) return;

    if (currentQuestionIndex < 5) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setStudentAnswer("");
      setStudentSelectedVocals([]);
      setShowFeedback(false);
      setHasAnsweredCorrectly(false);
      setTriggerShake(false);

      setTimeout(() => {
        const contenedorPregunta = document.getElementById('instruction-card-root');
        if (contenedorPregunta) contenedorPregunta.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    } 
    else {
      const segundosTotalesPalabra = Math.round((Date.now() - startTimeWordRef.current) / 1000);
      const dataMétricasOcultas = {
        studentEmail: userEmail || "alumno@student.com",
        practica_activa: "5",
        palabra: currentData?.word,
        tiempo_total_palabra_segundos: segundosTotalesPalabra,
        clics_menu: menuClics,
        respuestas_exactas: respuestasInputs
      };

      try {
        await fetch('/api/save-metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataMétricasOcultas)
        });
        console.log("✈️ Datos fónicos de consonantes guardados en Supabase.");
      } catch (err) {
        console.error("🚨 Falló la transmisión de métricas:", err);
      }

      setIsPracticeStarted(false);
      setTiemposPreguntas({});
      setRespuestasInputs({});
      setStudentAnswer("");
      setHoveredSoundsCount(null);
      setTriggerShake(false);
      setStudentSelectedVocals([]);
      setShowFeedback(false);
      setHasAnsweredCorrectly(false);
      setIsFonicExpanded(false);
      setSavedFonicBlocks(0);

      if (palabrasFiltradas.length > 0) {
        setCurrentWordIndex((currentWordIndex < palabrasFiltradas.length - 1) ? currentWordIndex + 1 : 0);
      }
      setCurrentQuestionIndex(0);

      setTimeout(() => {
        const contenedorPregunta = document.getElementById('instruction-card-root');
        if (contenedorPregunta) contenedorPregunta.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);

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
      setTriggerShake(false);
      startTimeQuestionRef.current = Date.now(); 

      setTimeout(() => {
        const contenedorPregunta = document.getElementById('instruction-card-root');
        if (contenedorPregunta) contenedorPregunta.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 p-2">
      
      <div className="instruction-card" id="instruction-card-root">
        <p id="instruction-text" className="instruction-text">{questionsTexts[currentQuestionIndex]}</p>
      </div>

      <div className="practice-card unified-media-card">
        <div className="w-full grid grid-cols-2 gap-3 pb-2 items-center">
          <div className="w-full">
            <button
              id="play-instructions-btn"
              onClick={handlePlayInstructions}
              type="button"
              style={{ backgroundColor: '#F4F7FA', color: '#475569', fontSize: '13px', borderRadius: '12px' }}
              className="audio-btn hover:opacity-85 !font-black tracking-tight flex items-center justify-center gap-1 !py-2.5 !px-2 !w-full h-10 rounded-xl transition-all duration-200"
            >
              <div className="scale-75 flex items-center justify-center flex-shrink-0 text-[#475569]">
                <IconoBocina />
              </div>
              <span className="truncate">Instrucciones</span>
            </button>
          </div>

          <div className="w-full">
            <select 
              id="fonema-select" 
              className="font-dropdown-top !w-full text-center h-10 !py-1 !px-2 font-bold text-xs sm:text-sm border border-zinc-200 rounded-xl bg-white text-slate-800" 
              value={currentFonema} 
              onChange={changeFonemaDropdown}
            >
              <option value="1">Grafemas de /θ/ vs /ð/</option>
              <option value="2">Grafemas de /ʧ/ vs /ʤ/</option>
              <option value="3">Grafemas de /ʤ/ vs /j/</option>
              <option value="4">Grafemas de /ʃ/ vs /ʒ/</option>
            </select>
          </div>
        </div>

        <div className="media-buttons-row grid grid-cols-1">
          <button id="play-word-btn" onClick={handlePlayWordAudio} className="audio-btn !w-full"><IconoBocina /><span>Palabra</span></button>
        </div>

        <div className="media-slider-row">
          <div className="interactive-wave-box">
            <div className="wave-container"><div className="wave-bar"></div><div className="wave-bar"></div><div className="wave-bar"></div><div className="wave-bar"></div><div className="wave-bar"></div></div>
            <input type="range" min="0.5" max="2.0" step="0.25" id="speed-slider" value={globalSpeed} onChange={(e) => setGlobalSpeed(parseFloat(e.target.value))} className="over-wave-slider" />
            <span id="speed-bubble" className="speed-bubble-indicator">{globalSpeed.toFixed(2)}x</span>
          </div>
        </div>
      </div>

      {currentQuestionIndex === 0 ? (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm w-full flex flex-col items-center gap-6">
          <span className="response-title !text-xs !tracking-widest">Selecciona el número de sonidos.</span>
          <div className="flex flex-wrap justify-center gap-3">
            {botonesRangoFonic.filter(n => isFonicExpanded || n <= 6).map((numero) => (
              <button key={numero} type="button" disabled={hasAnsweredCorrectly} onMouseEnter={() => !hasAnsweredCorrectly && setHoveredSoundsCount(numero)} onMouseLeave={() => !hasAnsweredCorrectly && setHoveredSoundsCount(null)} onClick={(e) => { setStudentAnswer(String(numero)); if (!hasAnsweredCorrectly) handleCheckAnswer(e, null, String(numero)); }} className={`w-12 h-12 rounded-full font-black text-base border-2 transition-all flex items-center justify-center transform active:scale-95 ${studentAnswer === String(numero) ? 'bg-sky-600 border-sky-600 text-white shadow-md' : 'bg-white border-zinc-200 text-zinc-700 hover:border-sky-500 hover:text-sky-600 hover:bg-sky-50/50'} ${hasAnsweredCorrectly ? 'opacity-60 cursor-not-allowed' : ''}`}>{numero}</button>
            ))}
            {!isFonicExpanded && <button type="button" onClick={() => setIsFonicExpanded(true)} className="w-12 h-12 rounded-full font-black text-xl border-2 bg-white border-zinc-300 text-zinc-500 hover:border-sky-500 flex items-center justify-center transform active:scale-95">+</button>}
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2 min-h-[36px] items-center max-w-full">
            {Array.from({ length: isFonicExpanded ? 12 : 6 }).map((_, idx) => (
              <div key={idx} className={`w-8 h-8 rounded-lg border-2 transition-all duration-300 ${idx + 1 <= (hoveredSoundsCount || (studentAnswer ? parseInt(studentAnswer) : 0)) ? 'border-sky-500 bg-sky-500/20 shadow-sm scale-105' : 'border-zinc-200 border-dashed bg-zinc-100/30'}`} />
            ))}
          </div>
        </div>
      ) : (currentQuestionIndex === 1 || currentQuestionIndex === 2) ? (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm w-full flex flex-col items-center gap-4">
          <span className="response-title !text-xs !tracking-widest">{currentQuestionIndex === 1 ? '¿Cuántos fonemas consonantes tiene?' : '¿Cuántos fonemas vocales tiene?'}</span>
          <div className="flex flex-wrap justify-center gap-2">
            {(currentQuestionIndex === 1 ? botonesConsonantes : botonesVocales).map((numero) => (
              <button key={numero} type="button" disabled={hasAnsweredCorrectly} onClick={(e) => { setStudentAnswer(String(numero)); if (!hasAnsweredCorrectly) handleCheckAnswer(e, null, String(numero)); }} className={`w-12 h-12 rounded-full font-black text-base border-2 transition-all flex items-center justify-center transform active:scale-95 ${studentAnswer === String(numero) ? (currentQuestionIndex === 1 ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-sky-600 border-sky-600 text-white shadow-md') : 'bg-white border-zinc-200 text-zinc-700 hover:border-sky-500 hover:bg-sky-50/30'} ${hasAnsweredCorrectly ? 'opacity-60 cursor-not-allowed' : ''}`}>{numero}</button>
            ))}
          </div>
          {savedFonicBlocks > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-4 min-h-[36px] items-center border-t border-zinc-100 pt-4 w-full">
              {Array.from({ length: savedFonicBlocks }).map((_, idx) => <div key={idx} className="w-8 h-8 rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-100/50" />)}
            </div>
          )}
        </div>
      ) : currentQuestionIndex === 3 ? (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm w-full flex flex-col items-center gap-4">
          <span className="response-title !text-xs !tracking-widest">Selecciona la sílaba correcta</span>
          <div className="flex flex-wrap justify-center gap-2">
            {[{ n: "1", s: "era", v: "1" }, { n: "2", s: "da", v: "2" }, { n: "3", s: "era", v: "3" }, { n: "4", s: "ta", v: "4" }, { n: "5", s: "ta", v: "5" }].map((item) => (
              <button key={item.v} type="button" disabled={hasAnsweredCorrectly} onClick={(e) => { setStudentAnswer(item.v); if (!hasAnsweredCorrectly) handleCheckAnswer(e, null, item.v); }} className={`py-3 px-6 rounded-full font-black text-base border-2 transition-all transform active:scale-95 flex flex-row items-baseline justify-center leading-none ${studentAnswer === item.v ? 'bg-sky-600 border-sky-600 text-white shadow-md' : 'bg-white border-zinc-200 text-zinc-700 hover:border-sky-500 hover:bg-sky-50/20'} ${hasAnsweredCorrectly ? 'opacity-60 cursor-not-allowed' : ''}`}><span className="text-base font-black leading-none">{item.n}</span><span className="lowercase text-[10px] font-bold ml-0.5 leading-none select-none opacity-85">{item.s}</span></button>
            ))}
          </div>
        </div>
      ) : currentQuestionIndex === 4 ? (
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm text-center flex flex-col gap-4 w-full">
          <span className="response-title !text-xs !tracking-widest">Elige el fonema consonántico correcto</span>
          <div className="flex gap-4 justify-center">
            {currentFonema === '1' && (
              <>
                <button onClick={(e) => handleCheckAnswer(e, "/θ/")} className="py-3 px-8 bg-sky-600 text-white rounded-xl font-bold shadow-sm transform active:scale-95" disabled={hasAnsweredCorrectly}>/θ/</button>
                <button onClick={(e) => handleCheckAnswer(e, "/ð/")} className="py-3 px-8 bg-sky-600 text-white rounded-xl font-bold shadow-sm transform active:scale-95" disabled={hasAnsweredCorrectly}>/ð/</button>
              </>
            )}
            {currentFonema === '2' && (
              <>
                <button onClick={(e) => handleCheckAnswer(e, "/ʧ/")} className="py-3 px-8 bg-sky-600 text-white rounded-xl font-bold shadow-sm transform active:scale-95" disabled={hasAnsweredCorrectly}>/ʧ/</button>
                <button onClick={(e) => handleCheckAnswer(e, "/ʤ/")} className="py-3 px-8 bg-sky-600 text-white rounded-xl font-bold shadow-sm transform active:scale-95" disabled={hasAnsweredCorrectly}>/ʤ/</button>
              </>
            )}
            {currentFonema === '3' && (
              <>
                <button onClick={(e) => handleCheckAnswer(e, "/ʤ/")} className="py-3 px-8 bg-sky-600 text-white rounded-xl font-bold shadow-sm transform active:scale-95" disabled={hasAnsweredCorrectly}>/ʤ/</button>
                <button onClick={(e) => handleCheckAnswer(e, "/j/")} className="py-3 px-8 bg-sky-600 text-white rounded-xl font-bold shadow-sm transform active:scale-95" disabled={hasAnsweredCorrectly}>/j/</button>
              </>
            )}
            {currentFonema === '4' && (
              <>
                <button onClick={(e) => handleCheckAnswer(e, "/ʃ/")} className="py-3 px-8 bg-sky-600 text-white rounded-xl font-bold shadow-sm transform active:scale-95" disabled={hasAnsweredCorrectly}>/ʃ/</button>
                <button onClick={(e) => handleCheckAnswer(e, "/ʒ/")} className="py-3 px-8 bg-sky-600 text-white rounded-xl font-bold shadow-sm transform active:scale-95" disabled={hasAnsweredCorrectly}>/ʒ/</button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col gap-4 w-full">
          <span className="response-title !text-xs !tracking-widest">Selecciona los fonemas vocales presentes</span>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[140px] overflow-y-auto p-2 border border-zinc-100 rounded-xl bg-zinc-50">
            {vocalOptionsP2.map(vocal => (
              <button key={vocal} type="button" onClick={() => toggleVocalSelection(`/${vocal}/`)} className={`p-2 rounded-lg text-sm font-bold border transition-all ${studentSelectedVocals.includes(`/${vocal}/`) ? 'bg-sky-600 border-sky-600 text-white shadow-sm' : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'} ${hasAnsweredCorrectly ? 'cursor-not-allowed opacity-70' : ''}`} disabled={hasAnsweredCorrectly}>/{vocal}/</button>
            ))}
          </div>
          <div className="flex justify-end mt-2">
            <button onClick={(e) => handleCheckAnswer(e)} className={`py-2 px-5 text-xs uppercase tracking-wider font-bold rounded-xl text-white bg-emerald-500 shadow-sm ${hasAnsweredCorrectly ? 'opacity-40 cursor-not-allowed' : 'hover:bg-emerald-600 active:scale-[0.98]'}`} disabled={hasAnsweredCorrectly}>Comprobar Selección</button>
          </div>
        </div>
      )}

      {errorMessage && <p className="error-text text-center mt-2">{errorMessage}</p>}

      {showFeedback && (
        <div id="feedback-card" className="feedback-card">
          <span className="feedback-title">Resultado de la evaluación:</span>
          <div id="feedback-phrase" className={`feedback-phrase ${triggerShake ? 'animacion-error-shake' : ''}`}>
            {feedbackIsCorrect ? <span className="word-correct">{feedbackSuccessNote}</span> : <>Tu respuesta no es correcta. ¡Inténtalo de nuevo!</>}
          </div>
          <div id="tip-text" className="tip-box">
            {feedbackIsCorrect ? "Recuerda que esta práctica se trata de poner atención a los sonidos no a los grafemas." : "Recuerda que los diptongos o las vocales compuestas cuentan como 1 sonido. Tampoco te olvides de utilizar la técnica de eliminación de sonidos."}
          </div>
        </div>
      )}

      <div className="navigation-buttons" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '16px' }}>
        <button id="prev-btn" onClick={handlePreviousQuestion} className={`back-question-btn ${currentQuestionIndex === 0 ? 'hidden' : ''}`} style={{ flex: 1 }}>← Anterior</button>
        <button id="action-btn" onClick={handleNextQuestion} className={`next-btn ${!hasAnsweredCorrectly ? 'btn-disabled' : ''}`} disabled={!hasAnsweredCorrectly} style={{ flex: 2 }}>
          {currentQuestionIndex === 5 ? "SIGUIENTE PALABRA ➔" : "SIGUIENTE PREGUNTA ➔"}
        </button>
      </div>

    </div>
  );
}
