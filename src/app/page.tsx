'use client';

import React, { useState } from 'react';
import { mockEducationalData } from '@/data/mockData';
import { EducationalContentResponse, SentenceItem, SummaryType } from '@/types';
import { InputSection } from '@/components/InputSection';
import { HeroPhrase } from '@/components/HeroPhrase';
import { SummaryView } from '@/components/SummaryView';

export default function Home() {
  const [data, setData] = useState<EducationalContentResponse>(mockEducationalData);
  const [selectedSentence, setSelectedSentence] = useState<SentenceItem>(
    mockEducationalData.sentences[0]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasLearned, setHasLearned] = useState(false);
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // MANEJADOR REAL CONECTADO A GEMINI
  const handleProcessInput = async (text: string, type: SummaryType) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Llamada en vivo a Gemini a través de nuestro endpoint seguro
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, summaryType: type }),
      });

      if (!res.ok) {
        throw new Error('Error al generar el contenido con Gemini.');
      }

      const generatedData: EducationalContentResponse = await res.json();

      setData(generatedData);
      // Seleccionamos por defecto la primera frase como Hero
      if (generatedData.sentences && generatedData.sentences.length > 0) {
        setSelectedSentence(generatedData.sentences[0]);
      }

      setHasLearned(true);
      setIsInputCollapsed(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        'Hubo un inconveniente al generar con Gemini. Verifica que tu clave GEMINI_API_KEY esté en .env.local.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Manejador de "Estudiar frase"
  const handleSelectPhrase = (phrase: SentenceItem) => {
    setSelectedSentence(phrase);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-slate-100/60 text-slate-900 pb-16">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-sm">
              ER
            </span>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              English Race <span className="text-xs font-medium text-indigo-600">MVP</span>
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            IA Activa (Gemini)
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-8">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
            ⚠️ {errorMessage}
          </div>
        )}

        {!hasLearned ? (
          <InputSection onProcess={handleProcessInput} isLoading={isLoading} />
        ) : isInputCollapsed ? (
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setIsInputCollapsed(false)}
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white border-2 border-indigo-200 hover:border-indigo-400 text-indigo-700 font-bold text-sm shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <span>✍ Introducir otro texto para aprender</span>
            </button>
          </div>
        ) : (
          <div className="mb-8">
            <InputSection onProcess={handleProcessInput} isLoading={isLoading} />
          </div>
        )}

        {hasLearned && (
          <div className="transition-all animate-fadeIn">
            {selectedSentence && (
              <HeroPhrase sentence={selectedSentence} />
            )}

            {data && (
              <SummaryView
                summaryParagraph={data.summaryParagraph}
                sentences={data.sentences}
                currentSelectedId={selectedSentence.id}
                onSelectPhrase={handleSelectPhrase}
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}