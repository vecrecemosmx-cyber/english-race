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
  const [copiedParagraph, setCopiedParagraph] = useState(false);
  const [copiedPhraseId, setCopiedPhraseId] = useState<string | null>(null);

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

  // Copiar Párrafo Completo
  const handleCopyParagraph = async () => {
    try {
      await navigator.clipboard.writeText(summaryParagraph);
      setCopiedParagraph(true);
      setTimeout(() => setCopiedParagraph(false), 2000);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  // Copiar Frase Individual
  const handleCopyPhrase = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPhraseId(id);
      setTimeout(() => setCopiedPhraseId(null), 2000);
    } catch (err) {
      console.error('Error al copiar frase:', err);
    }
  };

  return (
    <section className="space-y-6">
      {/* 1. Formato Párrafo con botón de Copiar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Resumen en Párrafo
          </h3>
          <div className="flex items-center gap-3">
            {/* Botón Copiar Párrafo */}
            <button
              onClick={handleCopyParagraph}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
                copiedParagraph
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Copiar párrafo completo"
            >
              <span>{copiedParagraph ? '✔ ¡Copiado!' : '📋 Copiar párrafo'}</span>
            </button>

            {/* Botón Escuchar Párrafo */}
            <button
              onClick={handlePlayFullParagraph}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>{playingSentenceId === 'full_paragraph' ? '🔊 Escuchando...' : '▶ Escuchar todo'}</span>
            </button>
          </div>
        </div>
        <p className="text-base md:text-lg text-slate-800 font-normal leading-relaxed">
          {summaryParagraph}
        </p>
      </div>

      {/* 2. Formato Lista con botones de Copiar y Estudiar Frase */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
          Resumen en Frases Cortas (Desglose de Aprendizaje)
        </h3>
        <div className="space-y-3">
          {sentences.map((phrase, index) => {
            const isSelected = phrase.id === currentSelectedId;
            const isCopied = copiedPhraseId === phrase.id;

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
                  {/* Botón Copiar Frase */}
                  <button
                    onClick={() => handleCopyPhrase(phrase.id, phrase.text)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1 ${
                      isCopied
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                    title="Copiar frase al portapapeles"
                  >
                    <span>{isCopied ? '✔ Copiado' : '📋 Copiar'}</span>
                  </button>

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