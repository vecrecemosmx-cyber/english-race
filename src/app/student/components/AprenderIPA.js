'use client';

import { useState, useEffect, useRef } from "react";
import { IconoBocina } from '@/Iconos';

// CARGA DE DATASET OFICIAL
import datasetP1 from '../../database_practice1.json';

export default function AprenderIpa() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [audioSpeed, setAudioSpeed] = useState(1.25);
  const [showIllustration, setShowIllustration] = useState(false);
  const audioContextRef = useRef(null);

  // BASE DE DATOS FONÉTIQUICA ACADÉMICA E ILUSTRACIONES MINIMALISTAS DE RESPALDO
  const diccionarioIpa = {
    "allow": { ipa: "/əˈlaʊ/", img: "https://unsplash.com" },
    "company": { ipa: "/ˈkʌm.pə.ni/", img: "https://unsplash.com" },
    "problem": { ipa: "/ˈprɑː.bləm/", img: "https://unsplash.com" },
    "system": { ipa: "/ˈsɪs.təm/", img: "https://unsplash.com" },
    "important": { ipa: "/ɪmˈpɔːr.tənt/", img: "https://unsplash.com" },
    "provide": { ipa: "/prəˈvaɪd/", img: "https://unsplash.com" },
    "society": { ipa: "/səˈsaɪ.ə.t̬i/", img: "https://unsplash.com" }
  };

  // Mapeamos el listado plano completo de palabras
  const palabras = datasetP1.map(item => item.word);
  const wordTarget = palabras[currentWordIndex] || "system";
  const wordKey = wordTarget.toLowerCase().trim();

  // Obtenemos los metadatos fónicos confiables o un fallback por si no existe en el diccionario temporal
  const datosFonicos = diccionarioIpa[wordKey] || { 
    ipa: `/${wordTarget.toLowerCase()}/`, 
    img: "https://unsplash.com" 
  };

  // Limpiamos la ilustración cada vez que el estudiante cambie de palabra
  useEffect(() => {
    setShowIllustration(false);
  }, [currentWordIndex]);

  const handlePlayWordAudio = (e) => {
    if (e) e.preventDefault();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanWord = wordTarget.replace(/\(.*\)/, "").trim();
      const utterance = new SpeechSynthesisUtterance(cleanWord);
      utterance.lang = 'en-US';
      utterance.rate = audioSpeed;
      window.speechSynthesis.speak(utterance);
      
      // LÓGICA SOLICITADA: Al presionar Palabra, se revela la ilustración explicativa
      setShowIllustration(true);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 animate-fade-in p-2 sm:p-4">
      
      {/* 📋 CONTENEDOR DE LA PREGUNTA CON LIMITACIÓN ESTRICTA A 2 LÍNEAS */}
      <div id="instruction-card-root" className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-center">
        <p className="font-black text-slate-800 tracking-tight leading-tight text-xl sm:text-2xl md:text-3xl line-clamp-2 overflow-hidden">
          Pronuncia la palabra y luego presiona el botón Palabra para mejorar tu pronunciación
        </p>
      </div>

      {/* 🔤 CONTENEDOR CENTRAL: VERSIÓN IPA, BOTÓN Y DESLIZADOR */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center gap-6 min-h-[220px]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Transcripción Fonética Oficial (IPA)</span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-sky-600 font-mono tracking-wide break-words max-w-full px-2">
            {datosFonicos.ipa}
          </h2>
        </div>

        {/* CONTROLES MULTIMEDIA AGRUPADOS ABAJO DEL TEXTO */}
        <div className="w-full max-w-md flex flex-col gap-4 mt-2">
          <button 
            id="play-word-btn" 
            onClick={handlePlayWordAudio} 
            className="w-full h-14 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-sm transition-all transform active:scale-95"
          >
            <IconoBocina />
            <span>Escuchar Palabra</span>
          </button>

          {/* DESLIZADOR DE VELOCIDAD */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>Velocidad de reproducción</span>
              <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded-md font-mono">{audioSpeed.toFixed(2)}x</span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="2.0" 
              step="0.25" 
              value={audioSpeed} 
              onChange={(e) => setAudioSpeed(parseFloat(e.target.value))} 
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600" 
            />
          </div>
        </div>
      </div>

      {/* 🖼️ CONTENEDOR DE RESPUESTAS ADAPTADO A ILUSTRACIÓN INTERACTIVA */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center min-h-[200px] flex flex-col items-center justify-center gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Significado Visual Ilustrado</span>
        
        {showIllustration ? (
          <div className="animate-fade-in flex flex-col items-center gap-2">
            <div className="w-36 h-36 rounded-2xl overflow-hidden border-4 border-slate-50 shadow-sm bg-slate-100 flex items-center justify-center">
              <img 
                src={datosFonicos.img} 
                alt={`Ilustración de ${wordTarget}`}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = "https://unsplash.com"; }}
              />
            </div>
            <span className="text-xl font-black text-slate-700 capitalize tracking-tight">"{wordTarget}"</span>
          </div>
        ) : (
          <p className="text-sm font-medium text-slate-400 italic max-w-xs mx-auto leading-relaxed">
            La ilustración del significado aparecerá automáticamente en esta zona tras presionar el botón "Escuchar Palabra".
          </p>
        )}
      </div>

      {/* BOTÓN DE NAVEGACIÓN ENTRE PALABRAS */}
      <div className="flex justify-end mt-2">
        <button 
          onClick={() => setCurrentWordIndex((prev) => (prev < palabras.length - 1 ? prev + 1 : 0))}
          className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-all shadow-sm active:scale-95"
        >
          Siguiente Palabra ➔
        </button>
      </div>

    </div>
  );
}
