'use client';

import React, { useState } from 'react';
import { SentenceItem } from '@/types';
import { audioService } from '@/services/audioService';

interface SummaryViewProps {
  summaryParagraph: string;
  sentences: SentenceItem[];
  currentSelectedId: string;
  onSelectPhrase: (sentence: SentenceItem) => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  summaryParagraph,
  sentences,
  currentSelectedId,
  onSelectPhrase,
}) => {
  const [playingSentenceId, setPlayingSentenceId] = useState<string | null>(null);

  const handlePlayPhrase = (id: string, text: string) => {
    setPlayingSentenceId(id);
    audioService.speak(
      text,
      () => setPlayingSentenceId(id),
      () => setPlayingSentenceId(null),
      () => setPlayingSentenceId(null)
    );
  };

  const handlePlayFullParagraph = () => {
    setPlayingSentenceId('full_paragraph');
    audioService.speak(
      summaryParagraph,
      () => setPlayingSentenceId('full_paragraph'),
      () => setPlayingSentenceId(null),
      () => setPlayingSentenceId(null)
    );
  };

  return (
    <section className="space-y-6">
      {/* 1. Formato Párrafo */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Resumen en Párrafo
          </h3>
          <button
            onClick={handlePlayFullParagraph}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>{playingSentenceId === 'full_paragraph' ? '🔊 Escuchando...' : '▶ Escuchar todo el párrafo'}</span>
          </button>
        </div>
        <p className="text-base md:text-lg text-slate-800 font-normal leading-relaxed">
          {summaryParagraph}
        </p>
      </div>

      {/* 2. Formato Lista de Frases Sencillas */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
          Resumen en Frases Cortas (Desglose de Aprendizaje)
        </h3>
        <div className="space-y-3">
          {sentences.map((phrase, index) => {
            const isSelected = phrase.id === currentSelectedId;
            return (
              <div
                key={phrase.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-200'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm md:text-base font-semibold text-slate-900">
                      {phrase.text}
                    </p>
                    <p className="font-mono text-xs text-slate-400">
                      {phrase.ipa}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {/* Botón Escuchar Pronunciación */}
                  <button
                    onClick={() => handlePlayPhrase(phrase.id, phrase.text)}
                    className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                    title="Escuchar pronunciación"
                  >
                    {playingSentenceId === phrase.id ? (
                      <span className="text-xs font-bold text-amber-600">🔊</span>
                    ) : (
                      <span className="text-xs">▶</span>
                    )}
                  </button>

                  {/* Botón Estudiar Frase */}
                  <button
                    onClick={() => onSelectPhrase(phrase)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-indigo-100 hover:text-indigo-800'
                    }`}
                  >
                    {isSelected ? 'Estudiando ahora' : 'Estudiar frase'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};