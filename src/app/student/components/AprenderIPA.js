'use client';

import { useState } from "react";
import { IconoBocina } from '@/Iconos';

export default function AprenderIpa() {
  const [activeCard, setActiveCard] = useState(null);

  const ipaData = [
    { id: 1, symbol: "ə", name: "Schwa", desc: "El sonido vocálico más común en inglés. Es corto, relajado y neutro. Aparece en sílabas no acentuadas.", word: "about", example: "/əˈbaʊt/" },
    { id: 2, symbol: "ɪ", name: "I corta", desc: "Vocal corta producida con los labios relajados. No es una 'i' del español extendida.", word: "pink", example: "/pɪŋk/" },
    { id: 3, symbol: "æ", name: "Ash", desc: "Sonido abierto entre la 'a' y la 'e'. Requiere abrir la boca ampliamente hacia abajo.", word: "sand", example: "/sænd/" },
    { id: 4, symbol: "θ", name: "Theta", desc: "Consonante sorda fricativa. Se produce colocando la punta de la lengua entre los dientes sin vibrar.", word: "think", example: "/θɪŋk/" }
  ];

  const handlePlayIPA = (texto) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-2" id="instruction-card-root">
      <div className="instruction-card bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-center">
        <p className="instruction-text text-xl font-bold text-slate-800">Alfabeto Fonético Internacional (IPA) — Guía Visual</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {ipaData.map((item) => (
          <div 
            key={item.id} 
            onClick={() => setActiveCard(item.id)}
            className={`bg-white p-5 rounded-3xl border transition-all duration-200 shadow-sm cursor-pointer hover:border-sky-400 ${activeCard === item.id ? 'border-sky-500 ring-2 ring-sky-500/10' : 'border-slate-200'}`}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex flex-col">
                <span className="text-4xl font-black text-sky-600 mb-1">/{item.symbol}/</span>
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">{item.name}</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handlePlayIPA(item.word); }}
                className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 hover:bg-sky-50 hover:text-sky-600 transition-colors text-slate-500"
              >
                <IconoBocina />
              </button>
            </div>
            
            {/* 🚀 REQUISITO: TEXTO GRANDE FIJADO ESTRICTAMENTE A MÁXIMO DOS LÍNEAS */}
            <p className="text-slate-600 text-sm mt-3 line-clamp-2 min-h-[40px]" title={item.desc}>
              {item.desc}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs font-bold">
              <span className="text-slate-400">Palabra clave: <span className="text-slate-700 underline">{item.word}</span></span>
              <span className="text-sky-600 font-black">{item.example}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
