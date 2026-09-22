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
    <section className="mb-8 rounded-3xl border-2 transition-all p-6 md:p-8 shadow-xl bg-white dark:bg-slate-900 border-blue-500/20 dark:border-blue-800/40 shadow-blue-500/5">
      
      {/* Cabecera de la Frase Hero */}
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400 mb-3">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          Foco de Estudio Principal
        </span>
        <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800 font-bold">
          General American English
        </span>
      </div>

      {/* Frase Hero + Fonética IPA + Botón Audio */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
            {sentence.text}
          </h2>
          <p className="font-mono text-base md:text-lg text-amber-600 dark:text-amber-400 mt-1 font-semibold">
            {sentence.ipa}
          </p>
        </div>

        <button
          onClick={handlePlayAudio}
          className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md shrink-0 active:scale-95 ${
            isPlaying
              ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-300 dark:ring-amber-500/30'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
          }`}
          title="Escuchar en inglés americano nativo"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <span>{isPlaying ? 'Reproduciendo...' : 'Pronunciación'}</span>
        </button>
      </div>

      {/* Definición Simplificada CEFR A1-A2 (Sin traducción al español) */}
      <div className="mb-6 rounded-2xl p-5 border bg-slate-50 dark:bg-slate-950/60 border-slate-200/80 dark:border-slate-800">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
          Significado en Contexto (CEFR Control - English only)
        </span>
        <p className="text-base md:text-lg text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
          {sentence.cefrDefinition}
        </p>
      </div>

      {/* Colocaciones de Sustitución */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Claves Pragmáticas: Cómo usar esta estructura para más situaciones
        </h3>
        <div className="flex flex-wrap gap-2">
          {sentence.collocations.map((colloc, idx) => (
            <button
              key={idx}
              onClick={() => handlePlayCollocation(colloc)}
              className="group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold border transition-all bg-blue-50/60 hover:bg-blue-100/80 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 border-blue-200 dark:border-blue-800/60 text-blue-900 dark:text-blue-200"
              title="Click para escuchar variación"
            >
              <span>{colloc}</span>
              <span className="opacity-40 group-hover:opacity-100 text-xs">🔊</span>
            </button>
          ))}
        </div>
      </div>

      {/* Botón "No entendí completamente" */}
      <div className="pt-2">
        <button
          onClick={() => setShowLayer2(!showLayer2)}
          className={`w-full md:w-auto px-6 py-3 rounded-xl border-2 font-bold text-xs md:text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-sm ${
            showLayer2
              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20'
              : 'border-dashed border-amber-400/80 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/60'
          }`}
        >
          <span>{showLayer2 ? '▲ Ocultar técnicas y video' : '💡 No entendí completamente (Ver Video)'}</span>
        </button>
      </div>

      {/* Capa 2 Adaptativa: Pasa la estructura y abre el reproductor */}
      {showLayer2 && (
        <div className="mt-6">
          <Layer2Adaptive 
            targetPhrase={sentence.text}
            coreStructure={sentence.coreStructure}
            targetComplement={sentence.targetComplement}
            collocations={sentence.collocations}
            layer2={sentence.layer2} 
            onClose={() => setShowLayer2(false)} 
          />
        </div>
      )}
    </section>
  );
};