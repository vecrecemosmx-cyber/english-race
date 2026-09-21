'use client';

import React, { useState } from 'react';
import { SentenceItem } from '@/types';
import { audioService } from '@/services/audioService';
import { Layer2Adaptive } from './Layer2Adaptive';

interface HeroPhraseProps {
  sentence: SentenceItem;
}

export const HeroPhrase: React.FC<HeroPhraseProps> = ({ sentence }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLayer2, setShowLayer2] = useState(false);

  const handlePlayAudio = () => {
    setIsPlaying(true);
    audioService.speak(
      sentence.text,
      () => setIsPlaying(true),
      () => setIsPlaying(false),
      () => setIsPlaying(false)
    );
  };

  const handlePlayCollocation = (text: string) => {
    audioService.speak(text);
  };

  return (
    <section className="mb-8 rounded-3xl bg-white border-2 border-indigo-500/20 p-6 md:p-8 shadow-xl shadow-indigo-100/50">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3">
        <span>Foco de Estudio Principal</span>
        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">
          American English
        </span>
      </div>

      {/* FRASE EN TAMAÑO PROTAGONISTA (Hero) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {sentence.text}
          </h2>
          <p className="font-mono text-base md:text-lg text-slate-500 mt-1">
            {sentence.ipa}
          </p>
        </div>

        {/* Botón de Pronunciación */}
        <button
          onClick={handlePlayAudio}
          className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm transition-all shadow-sm shrink-0 ${
            isPlaying
              ? 'bg-amber-500 text-white ring-4 ring-amber-200'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
          }`}
          title="Listen in American English"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <span>{isPlaying ? 'Reproduciendo...' : 'Pronunciación'}</span>
        </button>
      </div>

      {/* 1. Definición Simplificada por Niveles (CEFR A1-A2) */}
      <div className="mb-6 bg-slate-50 rounded-2xl p-5 border border-slate-200/80">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Significado en Contexto (CEFR Control - English only)
          </span>
        </div>
        <p className="text-base text-slate-800 font-medium leading-relaxed">
          {sentence.cefrDefinition}
        </p>
      </div>

      {/* 2. Claves de Contexto Pragmático (Colocaciones de Sustitución) */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Claves Pragmáticas: Cómo usar esta estructura para más situaciones
        </h3>
        <div className="flex flex-wrap gap-2">
          {sentence.collocations.map((colloc, idx) => (
            <button
              key={idx}
              onClick={() => handlePlayCollocation(colloc)}
              className="group flex items-center gap-2 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-800 hover:text-indigo-900 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition"
              title="Click to listen"
            >
              <span>{colloc}</span>
              <span className="opacity-40 group-hover:opacity-100 text-xs">🔊</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Botón de auxilio cognitivo "No entendí completamente" */}
      <div className="pt-2">
        <button
          onClick={() => setShowLayer2(!showLayer2)}
          className="w-full md:w-auto px-5 py-2.5 rounded-xl border border-dashed border-indigo-300 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100/70 font-semibold text-xs tracking-wide transition flex items-center justify-center gap-2"
        >
          <span>{showLayer2 ? '▲ Ocultar técnicas' : '💡 No entendí completamente'}</span>
        </button>
      </div>

      {/* Capa 2 Adaptativa */}
      {showLayer2 && (
        <Layer2Adaptive 
          layer2={sentence.layer2} 
          onClose={() => setShowLayer2(false)} 
        />
      )}
    </section>
  );
};