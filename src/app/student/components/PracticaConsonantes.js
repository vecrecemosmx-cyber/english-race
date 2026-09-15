'use client';

import { useState, useEffect, useRef } from "react";
import { IconoBocina, IconoNota } from '@/Iconos';
import datasetP3 from '../../database_practice3.json';

export default function PracticaConsonantes({ userEmail }) {
  // --- ESTADOS DE CONTROL SINCRONIZADOS ORIGINALES ---
  const [currentFonema, setCurrentFonema] = useState('1'); 
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
  const [triggerShake, setTriggerShake] = useState(false);
  const [hoveredSoundsCount, setHoveredSoundsCount] = useState(null);
  const [isFonicExpanded, setIsFonicExpanded] = useState(false);
  const [savedFonicBlocks, setSavedFonicBlocks] = useState(0);

  // --- REFERENCIAS Y ESTADOS ANALÍTICOS (MICRO-PASOS) ---
  const startTimeWordRef = useRef(null);     
  const startTimeQuestionRef = useRef(null); 
  const [isPracticeStarted, setIsPracticeStarted] = useState(false);
  const [clicsMenuContador, setClicsMenuContador] = useState(0);
  const [tiemposPreguntas, setTiemposPreguntas] = useState({});
  const [respuestasInputs, setRespuestasInputs] = useState({});
  const answerInputRef = useRef(null);

  // Rangos numéricos explícitos declarados correctamente con corchetes
  const botonesRangoFonic = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const botonesRangoFonicCorto =[3, 4, 5, 6];
  const botonesConsonantes =[1, 2, 3, 4, 5, 6, 7];
  const botonesVocales =[1, 2, 3, 4, 5];

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
    setCurrentFonema(e.target.value);
    setCurrentWordIndex(0);
    resetEntireExercise();
  };

  const resetEntireExercise = () => {
    setCurrentQuestionIndex(0);
    setStudentAnswer('');
    setStudentSelectedVocals([]);
    setShowFeedback(false);
    setErrorMessage('');
    setHasAnsweredCorrectly(false);
    setIsFonicExpanded(false);
    setSavedFonicBlocks(0);
    setTriggerShake(false);
  };

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

  const registrarMétricaPreguntaOculta = (textoRespuesta) => {
    if (!startTimeQuestionRef.current) return;
    const ahora = Date.now();
    const segundosInvertidos = Math.round((ahora - startTimeQuestionRef.current) / 1000);
    const qKey = `q${currentQuestionIndex + 1}`;

    setTiemposPreguntas(prev => ({ ...prev, [`${qKey}_tiempo`]: segundosInvertidos }));
    setRespuestasInputs(prev => ({ ...prev, [`${qKey}_input`]: String(textoRespuesta) }));
    startTimeQuestionRef.current = ahora; 
  };

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
        case 0:
          correctValue = String(currentData.f).trim(); 
          successNote = `¡Excelente! Esta palabra está compuesta por ${correctValue} sonidos.`; 
          break;
        case 1:
          correctValue = String(currentData.fc).trim(); 
          successNote = `¡Correcto! Tiene ${correctValue} sonidos consonantes.`; 
          break;
        case 2:
          correctValue = String(currentData.fv).trim(); 
          successNote = `¡Muy bien! Tiene ${currentData.fv} sonidos vocálicos.`; 
          break;
        case 3:
          correctValue = String(currentData.stress).trim(); 
          successNote = `¡Exacto! El acento o énfasis está en la sílaba ${correctValue}.`; 
          break;
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
      if (studentSelectedVocals.length === 0) { setErrorMessage("⚠️ Selecciona al menos un fonema vocal."); setShowFeedback(false); return; }
      setErrorMessage("");
      const limpiarFormato = (txt) => txt.replace(/\\|\/|\s/g, "").replace(/:/g, "ː");
      const normalizarFonema = (fonema) => { const tl = limpiarFormato(fonema); return { "a": "aː", "e": "eː", "i": "iː", "ɔ": "ɔː", "u": "uː" }[tl] || tl; };
      const vocalesLimpiasJson = currentData.vocalesIPA.split(",").map(v => normalizarFonema(v));
      const vocalesSeleccionadasEstudiante = studentSelectedVocals.map(v => normalizarFonema(v));
      isCorrect = (vocalesLimpiasJson.every(v => vocalesSeleccionadasEstudiante.includes(v)) && vocalesLimpiasJson.length === vocalesLimpiasJson.length);
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

    setTimeout(() => {
      const el = document.getElementById(isCorrect ? 'action-btn' : 'feedback-card');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: isCorrect ? 'center' : 'nearest' });
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
    } 
    else {
      const segundosTotalesPalabra = Math.round((Date.now() - startTimeWordRef.current) / 1000);
      const dataMétricasOcultas = {
        studentEmail: userEmail || "alumno@student.com",
        practica_activa: "5",
        palabra: currentData?.word,
        tiempo_total_palabra_segundos: segundosTotalesPalabra,
        clics_menu: clicsMenuContador,
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
      setClicsMenuContador(0);
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
      alert(`📝 Siguiente reto cargado. Presiona 'Palabra' para practicar.`);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 p-2">
      <div className="instruction-card bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-center">
        <p className="instruction-text text-xl font-bold">{questionsTexts[currentQuestionIndex]}</p>
      </div>

      <div className="practice-card unified-media-card bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4 items-center">
          <select 
            id="fonema-select" 
            className="font-dropdown-top w-full text-center h-10 font-bold border border-zinc-200 rounded-xl" 
            value={currentFonema} 
            onChange={changeFonemaDropdown}
          >
            <option value="1">Grafemas de /θ/ vs /ð/</option>
            <option value="2">Grafemas de /ʧ/ vs /ʤ/</option>
            <option value="3">Grafemas de /ʤ/ vs /j/</option>
            <option value="4">Grafemas de /ʃ/ vs /ʒ/</option>
          </select>
        </div>

        <div className="media-buttons-row grid grid-cols-1 gap-4">
          <button onClick={handlePlayWordAudio} className="audio-btn bg-sky-600 text-white p-3 rounded-xl flex items-center justify-center gap-2 font-bold"><IconoBocina /><span>Palabra</span></button>
        </div>

        <div className="media-slider-row mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="interactive-wave-box flex flex-col gap-2">
            <div className="flex justify-between text-xs font-bold text-slate-500"><span>Velocidad</span><span>{audioSpeed.toFixed(2)}x</span></div>
            <input type="range" min="0.5" max="2.0" step="0.25" value={audioSpeed} onChange={(e) => setAudioSpeed(parseFloat(e.target.value))} className="w-full accent-sky-600" />
          </div>
        </div>
      </div>

      {/* RENDERIZADO DINÁMICO DE RESPUESTAS SEGÚN EL ÍNDICE DE PREGUNTA */}
      {currentQuestionIndex === 0 ? (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-2">
            {botonesRangoFonic.filter(n => isFonicExpanded || n <= 6).map((num) => (
              <button 
                key={num} 
                type="button" 
                disabled={hasAnsweredCorrectly} 
                onMouseEnter={() => !hasAnsweredCorrectly && setHoveredSoundsCount(num)} 
                onMouseLeave={() => !hasAnsweredCorrectly && setHoveredSoundsCount(null)} 
                onClick={(e) => handleCheckAnswer(e, null, num)} 
                className={`w-12 h-12 rounded-full font-black border-2 transition-all ${
                  studentAnswer === String(num) ? 'bg-sky-600 border-sky-600 text-white' : 'bg-white border-zinc-200 text-zinc-700 hover:border-sky-500'
                }`}
              >
                {num}
              </button>
            ))}
            {!isFonicExpanded && (
              <button 
                type="button" 
                onClick={() => setIsFonicExpanded(true)} 
                className="w-12 h-12 rounded-full font-black border-2 border-zinc-300 text-zinc-500 hover:border-sky-500"
              >
                +
              </button>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {Array.from({ length: isFonicExpanded ? 12 : 6 }).map((_, idx) => (
              <div 
                key={idx} 
                className={`w-8 h-8 rounded-lg border-2 ${
                  idx < (hoveredSoundsCount || parseInt(studentAnswer) || 0) ? 'border-sky-500 bg-sky-500/20 shadow-sm' : 'border-zinc-200 border-dashed bg-zinc-100/30'
                }`} 
              />
            ))}
          </div>
        </div>
      ) : null}

      {(currentQuestionIndex === 1 || currentQuestionIndex === 2) ? (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-2">
            {(currentQuestionIndex === 1 ? botonesConsonantes : botonesVocales).map((num) => (
              <button 
                key={num} 
                type="button" 
                disabled={hasAnsweredCorrectly} 
                onClick={(e) => handleCheckAnswer(e, null, num)} 
                className={`w-12 h-12 rounded-full font-black border-2 transition-all ${
                  studentAnswer === String(num) ? (currentQuestionIndex === 1 ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-sky-600 border-sky-600 text-white') : 'bg-white border-zinc-200 text-zinc-700 hover:border-slate-400'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          {savedFonicBlocks > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-2 pt-2 border-t w-full">
              {Array.from({ length: savedFonicBlocks }).map((_, idx) => (
                <div key={idx} className="w-8 h-8 rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-100/50" />
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* SECCIÓN EVALUADORA DINÁMICA: PREGUNTA 4 (SÍLABAS Y ÉNFASIS) */}
      {currentQuestionIndex === 3 ? (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-2">
            {["1", "2", "3", "4", "5"].map((num) => (
              <button 
                key={num} 
                type="button" 
                disabled={hasAnsweredCorrectly} 
                onClick={(e) => handleCheckAnswer(e, null, num)} 
                className={`py-3 px-6 rounded-full font-black flex items-baseline border-2 transition-all ${
                  studentAnswer === num ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-zinc-200 text-zinc-700 hover:border-slate-400'
                }`}
              >
                <span className="text-base font-black leading-none">{num}</span>
                <span className="lowercase text-[10px] font-bold ml-0.5 leading-none select-none opacity-85">
                  {num === "1" || num === "3" ? "era" : num === "2" ? "da" : "ta"}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* SECCIÓN EVALUADORA DINÁMICA: PREGUNTA 5 (BOTONES DE FONEMAS PARES) */}
      {currentQuestionIndex === 4 ? (
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm text-center flex flex-col gap-4">
          <div className="flex gap-4 justify-center">
            {currentFonema === '1' && (
              <>
                <button onClick={(e) => handleCheckAnswer(e, "/θ/")} className="py-3 px-8 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-sm transition-all" disabled={hasAnsweredCorrectly}>/θ/</button>
                <button onClick={(e) => handleCheckAnswer(e, "/ð/")} className="py-3 px-8 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-sm transition-all" disabled={hasAnsweredCorrectly}>/ð/</button>
              </>
            )}
            {currentFonema === '2' && (
              <>
                <button onClick={(e) => handleCheckAnswer(e, "/ʧ/")} className="py-3 px-8 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-sm transition-all" disabled={hasAnsweredCorrectly}>/ʧ/</button>
                <button onClick={(e) => handleCheckAnswer(e, "/ʤ/")} className="py-3 px-8 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-sm transition-all" disabled={hasAnsweredCorrectly}>/ʤ/</button>
              </>
            )}
            {currentFonema === '3' && (
              <>
                <button onClick={(e) => handleCheckAnswer(e, "/ʤ/")} className="py-3 px-8 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-sm transition-all" disabled={hasAnsweredCorrectly}>/ʤ/</button>
                <button onClick={(e) => handleCheckAnswer(e, "/j/")} className="py-3 px-8 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-sm transition-all" disabled={hasAnsweredCorrectly}>/j/</button>
              </>
            )}
            {currentFonema === '4' && (
              <>
                <button onClick={(e) => handleCheckAnswer(e, "/ʃ/")} className="py-3 px-8 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-sm transition-all" disabled={hasAnsweredCorrectly}>/ʃ/</button>
                <button onClick={(e) => handleCheckAnswer(e, "/ʒ/")} className="py-3 px-8 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-sm transition-all" disabled={hasAnsweredCorrectly}>/ʒ/</button>
              </>
            )}
          </div>
        </div>
      ) : null}

      {/* SECCIÓN EVALUADORA DINÁMICA: PREGUNTA 6 (REJILLA DE SELECCIÓN MULTIPLE VOCAL) */}
      {currentQuestionIndex === 5 ? (
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col gap-4">
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[140px] overflow-y-auto p-2 border border-zinc-100 rounded-xl bg-zinc-50">
            {vocalOptionsP2.map(vocal => (
              <button 
                key={vocal} 
                type="button" 
                onClick={() => toggleVocalSelection(`/${vocal}/`)} 
                className={`p-2 rounded-lg text-sm font-bold border transition-all ${
                  studentSelectedVocals.includes(`/${vocal}/`) ? 'bg-sky-600 border-sky-600 text-white shadow-sm' : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                } ${hasAnsweredCorrectly ? 'cursor-not-allowed opacity-70' : ''}`} 
                disabled={hasAnsweredCorrectly}
              >
                /{vocal}/
              </button>
            ))}
          </div>
          <div className="flex justify-end mt-2">
            <button onClick={(e) => handleCheckAnswer(e)} className={`py-2 px-5 text-xs uppercase tracking-wider font-bold rounded-xl text-white bg-emerald-500 shadow-sm transition-all ${hasAnsweredCorrectly ? 'opacity-40 cursor-not-allowed' : 'hover:bg-emerald-600 active:scale-[0.98]'}`} disabled={hasAnsweredCorrectly}>Comprobar Selección</button>
          </div>
        </div>
      ) : null}

      {errorMessage && <p className="text-red-500 font-bold text-center text-sm mt-2 animate-pulse">{errorMessage}</p>}

      {showFeedback && (
        <div id="feedback-card" className={`feedback-card bg-zinc-50 p-5 rounded-2xl border transition-all mt-2 ${triggerShake ? 'animacion-error-shake border-red-200 bg-red-50/30' : 'border-zinc-200'}`}>
          <p className="font-bold text-slate-700">{feedbackIsCorrect ? feedbackSuccessNote : "Tu respuesta no es correcta. ¡Inténtalo de nuevo!"}</p>
        </div>
      )}

      {/* BARRA DE NAVEGACIÓN Y AVANCE DE PREGUNTAS EN CONSONANTES */}
      <div className="navigation-buttons flex justify-between gap-4 mt-4">
        <button onClick={() => { if (currentQuestionIndex > 0) { setCurrentQuestionIndex(currentQuestionIndex - 1); resetEntireExercise(); } }} className={`back-question-btn p-3 bg-slate-200 text-slate-700 rounded-xl font-bold flex-1 hover:bg-slate-300 transition-colors ${currentQuestionIndex === 0 ? 'hidden' : ''}`}>← Anterior</button>
        <button id="action-btn" onClick={handleNextQuestion} disabled={!hasAnsweredCorrectly} className={`next-btn p-3 rounded-xl font-bold flex-1 text-center transition-all ${!hasAnsweredCorrectly ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60' : 'bg-slate-800 text-white hover:bg-slate-900 active:scale-[0.99]'}`}>{currentQuestionIndex === 5 ? "SIGUIENTE PALABRA ➔" : "SIGUIENTE PREGUNTA ➔"}</button>
      </div>
    </div>
  );
}
