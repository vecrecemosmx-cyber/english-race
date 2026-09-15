'use client';

import { useState, useEffect, useRef } from "react";
import { IconoBocina, IconoNota } from '@/Iconos';
import datasetP1 from '../../database_practice1.json';

export default function PracticaVocales({ userEmail }) {
  // --- ESTADOS DE CONTROL SINCRONIZADOS ORIGINALES ---
  const [currentFonema, setCurrentFonema] = useState('ə'); 
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState('');
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

  const mappingP1 = { "1": "ə", "2": "ɪ", "3": "ɛ", "4": "æ", "5": "ʌ" };
  const questionsTexts = [
    "1. ¿Cuántos sonidos forman la palabra?",
    "2. ¿Cuántos fonemas consonantes tiene?",
    "3. ¿Cuántos fonemas vocales tiene?",
    "4. ¿En qué sílaba está el énfasis?",
    "5. ¿En qué sílaba está la vocal que estamos practicando?"
  ];

  const baseAudioUrl = "/audio/";
  const vocalAudioFiles = { "ə": "PHONEME-DUST.mp3", "ɪ": "PHONEME-PINK.mp3", "ɛ": "PHONEME-RED.mp3", "æ": "PHONEME-SAND.mp3", "ʌ": "PHONEME-CUP.mp3" };

  const palabrasFiltradas = datasetP1.filter(item => {
    return (mappingP1[String(item.fonema_id)] || item.fonema_simbolo) === currentFonema;
  }).map(item => ({
    word: item.word, f: String(item.f), fc: String(item.fc), fv: String(item.fv), stress: String(item.stress), posVocal: String(item.posVocal)
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
    setShowFeedback(false);
    setErrorMessage('');
    setHasAnsweredCorrectly(false);
    setIsFonicExpanded(false);
    setSavedFonicBlocks(0);
    setTriggerShake(false);
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

  const handlePlayVocalAudio = (e) => {
    if (e) e.preventDefault();
    const fileName = vocalAudioFiles[currentFonema];
    if (fileName) {
      const vocalAudio = new Audio(baseAudioUrl + fileName);
      vocalAudio.play().catch(err => console.log("Error al cargar .mp3 fónico:", err));
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

  const handleCheckAnswer = (e, valorDirectoBoton = null) => {
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
      if (value === "") { setErrorMessage("⚠️ Elige tu respuesta antes de comprobar."); setShowFeedback(false); return; }
      const dbValue = String(currentData.posVocal).trim();
      if (dbValue.length === 2) {
        const digitoA = dbValue.charAt(0);
        const digitoB = dbValue.charAt(1);
        if (value === digitoA || value === digitoB) {
          isCorrect = true;
          successNote = `¡Felicidades! La vocal /${currentFonema}/ se ubica en la sílaba ${value}. También aparece en la sílaba ${value === digitoA ? digitoB : digitoA}.`;
        }
      } else {
        isCorrect = (value === dbValue);
        if (isCorrect) successNote = `¡Felicidades! La vocal /${currentFonema}/ se ubica en la posición: ${dbValue}.`;
      }
      if (isCorrect) registrarMétricaPreguntaOculta(value);
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

    if (currentQuestionIndex < 4) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setStudentAnswer("");
      setShowFeedback(false);
      setHasAnsweredCorrectly(false);
      setTriggerShake(false);
    } 
    else {
      const segundosTotalesPalabra = Math.round((Date.now() - startTimeWordRef.current) / 1000);
      const dataMétricasOcultas = {
        studentEmail: userEmail || "alumno@student.com",
        practica_activa: "3",
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
        console.log("✈️ Datos fónicos de vocales guardados en Supabase.");
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

  const handlePreviousQuestion = (e) => {
    if (e) e.preventDefault();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setStudentAnswer("");
      setShowFeedback(false);
      setHasAnsweredCorrectly(false);
      setErrorMessage("");
      setTriggerShake(false);
      startTimeQuestionRef.current = Date.now(); 
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
            <option value="ə">Fonema /ə/</option>
            <option value="ɪ">Fonema /ɪ/</option>
            <option value="ɛ">Fonema /ɛ/</option>
            <option value="æ">Fonema /æ/</option>
            <option value="ʌ">Fonema /ʌ/</option>
          </select>
        </div>

        <div className="media-buttons-row grid grid-cols-2 gap-4">
          <button 
            onClick={handlePlayWordAudio} 
            className="audio-btn bg-sky-600 text-white p-3 rounded-xl flex items-center justify-center gap-2 font-bold"
          >
            <IconoBocina />
            <span>Palabra</span>
          </button>
          
          <button 
            onClick={handlePlayVocalAudio} 
            className="audio-btn vocal-btn bg-slate-100 text-slate-700 p-3 rounded-xl flex items-center justify-center gap-2 font-bold"
          >
            <IconoNota />
            <span>Vocal</span>
          </button>
        </div>

        <div className="media-slider-row mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="interactive-wave-box flex flex-col gap-2">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>Velocidad</span>
              <span>{audioSpeed.toFixed(2)}x</span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="2.0" 
              step="0.25" 
              value={audioSpeed} 
              onChange={(e) => setAudioSpeed(parseFloat(e.target.value))} 
              className="w-full accent-sky-600" 
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN EVALUADORA DINÁMICA: PREGUNTA 1 (SONIDOS) */}
      {currentQuestionIndex === 0 ? (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-2">
            {(isFonicExpanded ? [3,4,5,6,7,8,9,10,11,12] : [3,4,5,6]).map((num) => (
              <button 
                key={num} 
                type="button" 
                disabled={hasAnsweredCorrectly} 
                onMouseEnter={() => !hasAnsweredCorrectly && setHoveredSoundsCount(num)}
                onMouseLeave={() => !hasAnsweredCorrectly && setHoveredSoundsCount(null)}
                onClick={(e) => handleCheckAnswer(e, num)} 
                className={`w-12 h-12 rounded-full font-black border-2 ${
                  studentAnswer === String(num) ? 'bg-sky-600 border-sky-600 text-white' : 'bg-white border-zinc-200 text-zinc-700'
                }`}
              >
                {num}
              </button>
            ))}
            {!isFonicExpanded && (
              <button 
                type="button" 
                onClick={() => setIsFonicExpanded(true)} 
                className="w-12 h-12 rounded-full font-black border-2 border-zinc-300 text-zinc-500"
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

      {/* SECCIÓN EVALUADORA DINÁMICA: PREGUNTAS 2 Y 3 (CONSONANTES Y VOCALES) */}
      {(currentQuestionIndex === 1 || currentQuestionIndex === 2) ? (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-2">
            {(currentQuestionIndex === 1 ? [1, 2, 3, 4, 5, 6, 7] : [1, 2, 3, 4, 5]).map((num) => (
              <button 
                key={num} 
                type="button" 
                disabled={hasAnsweredCorrectly} 
                onClick={(e) => handleCheckAnswer(e, num)} 
                className={`w-12 h-12 rounded-full font-black border-2 transition-all ${
                  studentAnswer === String(num) 
                    ? (currentQuestionIndex === 1 ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-sky-600 border-sky-600 text-white') 
                    : 'bg-white border-zinc-200 text-zinc-700 hover:border-slate-400'
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

      {/* SECCIÓN EVALUADORA DINÁMICA: PREGUNTAS 4 Y 5 (SÍLABAS Y ÉNFASIS) */}
      {(currentQuestionIndex === 3 || currentQuestionIndex === 4) ? (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-2">
            {["1", "2", "3", "4", "5"].map((num) => (
              <button 
                key={num} 
                type="button" 
                disabled={hasAnsweredCorrectly} 
                onClick={(e) => handleCheckAnswer(e, num)} 
                className={`py-3 px-6 rounded-full font-black flex items-baseline border-2 transition-all ${
                  studentAnswer === num 
                    ? (currentQuestionIndex === 3 ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-sky-600 border-sky-600 text-white') 
                    : 'bg-white border-zinc-200 text-zinc-700 hover:border-slate-400'
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

      {errorMessage && (
        <p className="text-red-500 font-bold text-center animate-pulse text-sm mt-2">
          {errorMessage}
        </p>
      )}

      {showFeedback && (
        <div 
          id="feedback-card" 
          className={`feedback-card bg-zinc-50 p-5 rounded-2xl border transition-all mt-2 ${
            triggerShake ? 'animacion-error-shake border-red-200 bg-red-50/30' : 'border-zinc-200'
          }`}
        >
          <p className="font-bold text-slate-700">
            {feedbackIsCorrect ? feedbackSuccessNote : "Tu respuesta no es correcta. ¡Inténtalo de nuevo!"}
          </p>
        </div>
      )}

      {/* BARRA DE NAVEGACIÓN Y AVANCE DE PREGUNTAS */}
      <div className="navigation-buttons flex justify-between gap-4 mt-4">
        <button 
          onClick={handlePreviousQuestion} 
          className={`back-question-btn p-3 bg-slate-200 text-slate-700 rounded-xl font-bold flex-1 hover:bg-slate-300 transition-colors ${
            currentQuestionIndex === 0 ? 'hidden' : ''
          }`}
        >
          ← Anterior
        </button>
        <button 
          id="action-btn" 
          onClick={handleNextQuestion} 
          disabled={!hasAnsweredCorrectly} 
          className={`next-btn p-3 rounded-xl font-bold flex-1 text-center transition-all ${
            !hasAnsweredCorrectly 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60' 
              : 'bg-slate-800 text-white hover:bg-slate-900 active:scale-[0.99]'
          }`}
        >
          {currentQuestionIndex === 4 ? "SIGUIENTE PALABRA ➔" : "SIGUIENTE PREGUNTA ➔"}
        </button>
      </div>

    </div>
  );
}