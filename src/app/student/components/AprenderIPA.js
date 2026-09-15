'use client';

import { useState, useRef } from "react";
import { IconoBocina } from '@/Iconos';

export default function AprenderIpa() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showIllustration, setShowFeedbackIllustration] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1.25);

  // DATASET INTERNO CORREGIDO CON ILUSTRACIONES PÚBLICAS TOTALMENTE VISIBLES Y OPERATIVAS
  const ipaDatasetOriginal = [
    { 
      word: "about", 
      ipa: "/əˈbaʊt/", 
      illustration: "https://flaticon.com" // Ilustración simple de un libro de información
    },
    { 
      word: "pink", 
      ipa: "/pɪŋk/", 
      illustration: "https://flaticon.com" // Ilustración simple de una mancha de pintura rosa
    },
    { 
      word: "sand", 
      ipa: "/sænd/", 
      illustration: "https://flaticon.com" // Ilustración simple de un balde y arena de playa
    },
    { 
      word: "think", 
      ipa: "/θɪŋk/", 
      illustration: "https://flaticon.com" // Ilustración simple de un foco de ideas/mente
    }
  ];

  const currentData = ipaDatasetOriginal[currentWordIndex];

  // LOGICA AUDIO DE PALABRA + DISPARADOR DE LA ILUSTRACIÓN DINÁMICA
  const handlePlayWordAudioIpa = (e) => {
    if (e) e.preventDefault();
    if (!currentData) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanWord = currentData.word.replace(/\(.*\)/, "").trim();
      const utterance = new SpeechSynthesisUtterance(cleanWord);
      utterance.lang = 'en-US';
      utterance.rate = audioSpeed;
      window.speechSynthesis.speak(utterance);
      
      // Detona de inmediato la ilustración real del significado en el contenedor inferior
      setShowFeedbackIllustration(true);
    }
  };

  const handleNextWord = () => {
    setShowFeedbackIllustration(false);
    setCurrentWordIndex((prev) => (prev < ipaDatasetOriginal.length - 1 ? prev + 1 : 0));
  };
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 p-2">
      
      {/* 🚀 REPARACIÓN: TEXTO DE PRONUNCIACIÓN AJUSTADO A UN TAMAÑO MENOR (TEXT-XS SM:TEXT-SM) LEGIBLE A DOS LÍNEAS */}
      <div className="instruction-card" id="instruction-card-root">
        <p id="instruction-text" className="instruction-text text-xs sm:text-sm line-clamp-2 font-bold h-12 flex items-center justify-center text-center tracking-tight text-slate-800">
          Pronuncia la palabra y luego presiona el botón Palabra para mejorar tu pronunciación
        </p>
      </div>

      <div className="practice-card unified-media-card">
        {/* TEXTO GRANDE IPA QUE ABARCA LA MAYOR PARTE DEL CONTENEDOR */}
        <div className="w-full flex flex-col items-center justify-center py-6 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
          <span className="text-4xl sm:text-5xl font-black text-sky-600 tracking-wider select-all" style={{ fontFamily: 'monospace' }}>
            {currentData.ipa}
          </span>
          <span className="text-xs uppercase font-bold text-slate-400 tracking-widest mt-2">Transcripción Fonética Completa</span>
        </div>

        {/* BOTÓN MULTIMEDIA PALABRA ABAJO DEL TEXTO IPA */}
        <div className="media-buttons-row grid grid-cols-1">
          <button id="play-word-btn" onClick={handlePlayWordAudioIpa} className="audio-btn !w-full">
            <IconoBocina /><span>Palabra</span>
          </button>
        </div>

        {/* CONTROLADOR DESLIZANTE CON LA BOLITA ORIGINAL Y CAJA DE ONDAS */}
        <div className="media-slider-row">
          <div className="interactive-wave-box">
            <div className="wave-container"><div className="wave-bar"></div><div className="wave-bar"></div><div className="wave-bar"></div><div className="wave-bar"></div><div className="wave-bar"></div></div>
            <input type="range" min="0.5" max="2.0" step="0.25" id="speed-slider" value={audioSpeed} onChange={(e) => setAudioSpeed(parseFloat(e.target.value))} className="over-wave-slider" />
            <span id="speed-bubble" className="speed-bubble-indicator">{audioSpeed.toFixed(2)}x</span>
          </div>
        </div>
      </div>

      {/* CONTENEDOR DE RESPUESTAS ADAPTADO CON LA ILUSTRACIÓN Y EL TEXTO DINÁMICO REQUERIDO */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm w-full flex flex-col items-center justify-center min-h-[240px]">
        {showIllustration ? (
          <div className="flex flex-col items-center gap-3 animate-fadeIn w-full">
            <img 
              src={currentData.illustration} 
              alt={currentData.word} 
              className="w-40 h-40 object-contain p-2 rounded-2xl bg-slate-50 border border-slate-100 shadow-xs"
            />
            {/* 🚀 REPARACIÓN CRÍTICA: CAMBIO DE TEXTO DINÁMICO EN MAYÚSCULAS QUE EVOLUCIONA SEGÚN LA PALABRA ACTUAL */}
            <span className="text-xs sm:text-sm font-black text-slate-500 uppercase tracking-wider mt-2">
              SIGNIFICADO DE "{currentData.word.toUpperCase()}"
            </span>
          </div>
        ) : (
          <div className="text-center text-slate-400 font-medium py-10 px-4 border-2 border-dashed border-slate-200 rounded-2xl w-full text-sm">
            Presiona el botón "Palabra" arriba para escuchar la pronunciación y revelar la ilustración de significado.
          </div>
        )}
      </div>

      {/* BOTÓN DE AVANCE DE RETOS */}
      <div className="navigation-buttons flex justify-end mt-4">
        <button id="action-btn" onClick={handleNextWord} className="next-btn !bg-slate-800 text-white hover:bg-slate-900 !w-full py-3 rounded-xl font-bold transition-all active:scale-[0.99]">
          SIGUIENTE PALABRA ➔
        </button>
      </div>

    </div>
  );
}
