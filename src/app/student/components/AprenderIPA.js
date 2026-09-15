'use client';

import { useState, useRef } from "react";
import { IconoBocina } from '@/Iconos';

export default function AprenderIpa() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showIllustration, setShowFeedbackIllustration] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1.25);

  // DATASET INTERNO CON NOTACIONES IPA COMPLETAS (STRESS, SILABAS, FONEMAS)
  const ipaDatasetOriginal = [
    { word: "about", ipa: "/əˈbaʊt/", desc: "about", illustration: "https://unsplash.com" }, // Libro / Conocer
    { word: "pink", ipa: "/pɪŋk/", desc: "pink color", illustration: "https://unsplash.com" },  // Color rosa abstracto
    { word: "sand", ipa: "/sænd/", desc: "sand beach", illustration: "https://unsplash.com" }, // Playa limpia
    { word: "think", ipa: "/θɪŋk/", desc: "idea think", illustration: "https://unsplash.com" } // Foco / Mente
  ];

  const currentData = ipaDatasetOriginal[currentWordIndex];

  // LOGICA AUDIO DE PALABRA + DISPARADOR DE LA ILUSTRACIÓN MULTIMEDIA SIMPLE
  const handlePlayWordAudioIpa = (e) => {
    if (e) e.preventDefault();
    if (!currentData) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentData.word);
      utterance.lang = 'en-US';
      utterance.rate = audioSpeed;
      window.speechSynthesis.speak(utterance);
      
      // Detona de inmediato la ilustración simple del significado en el contenedor de respuestas
      setShowFeedbackIllustration(true);
    }
  };

  const handleNextWord = () => {
    setShowFeedbackIllustration(false);
    setCurrentWordIndex((prev) => (prev < ipaDatasetOriginal.length - 1 ? prev + 1 : 0));
  };
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 p-2">
      
      {/* 🚀 REPARACIÓN: TEXTO DE PRONUNCIACIÓN AJUSTADO Y LIMITADO ESTRICTAMENTE A MÁXIMO DOS LÍNEAS */}
      <div className="instruction-card" id="instruction-card-root">
        <p id="instruction-text" className="instruction-text text-base sm:text-lg line-clamp-2 font-bold h-12 flex items-center justify-center text-center">
          Pronuncia la palabra y luego presiona el botón Palabra para mejorar tu pronunciación
        </p>
      </div>

      <div className="practice-card unified-media-card">
        {/* 🚀 REPARACIÓN: TEXTO GRANDE IPA ABARCANDO LA MAYOR PARTE DEL CONTENEDOR */}
        <div className="w-full flex flex-col items-center justify-center py-6 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
          <span className="text-4xl sm:text-5xl font-black text-sky-600 tracking-wider select-all" style={{ fontFamily: 'monospace' }}>
            {currentData.ipa}
          </span>
          <span className="text-xs uppercase font-bold text-slate-400 tracking-widest mt-2">Transcripción Fonética Completa</span>
        </div>

        {/* BOTÓN MULTIMEDIA CENTRADO ABAJO */}
        <div className="media-buttons-row grid grid-cols-1">
          <button id="play-word-btn" onClick={handlePlayWordAudioIpa} className="audio-btn !w-full">
            <IconoBocina /><span>Palabra</span>
          </button>
        </div>

        {/* CONTROLADOR DESLIZANTE CON LA BOLITA ORIGINAL Y CAJA DE ONDAS RESTAURADA */}
        <div className="media-slider-row">
          <div className="interactive-wave-box">
            <div className="wave-container"><div className="wave-bar"></div><div className="wave-bar"></div><div className="wave-bar"></div><div className="wave-bar"></div><div className="wave-bar"></div></div>
            <input type="range" min="0.5" max="2.0" step="0.25" id="speed-slider" value={audioSpeed} onChange={(e) => setAudioSpeed(parseFloat(e.target.value))} className="over-wave-slider" />
            <span id="speed-bubble" className="speed-bubble-indicator">{audioSpeed.toFixed(2)}x</span>
          </div>
        </div>
      </div>

      {/* CONTENEDOR DE RESPUESTAS ADAPTADO: PROYECTA UNA ILUSTRACIÓN SIMPLE DE SIGNIFICADO */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm w-full flex flex-col items-center justify-center min-h-[220px]">
        {showIllustration ? (
          <div className="flex flex-col items-center gap-3 animate-fadeIn w-full">
            <img 
              src={currentData.illustration} 
              alt={currentData.desc} 
              className="w-48 h-48 object-cover rounded-2xl border border-slate-200 shadow-xs"
            />
            <span className="text-xs uppercase tracking-widest font-black text-slate-400">Ilustración de Significado</span>
          </div>
        ) : (
          <div className="text-center text-slate-400 font-medium py-10 px-4 border-2 border-dashed border-slate-200 rounded-2xl w-full">
            Presiona el botón "Palabra" arriba para escuchar la pronunciación y revelar la ilustración de significado.
          </div>
        )}
      </div>

      {/* BOTÓN DE AVANCE DE PALABRAS DE LA PLANTILLA ORIGINAL */}
      <div className="navigation-buttons flex justify-end mt-4">
        <button id="action-btn" onClick={handleNextWord} className="next-btn !bg-slate-800 text-white hover:bg-slate-900 !w-full py-3 rounded-xl font-bold transition-all active:scale-[0.99]">
          SIGUIENTE PALABRA ➔
        </button>
      </div>

    </div>
  );
}
