'use client';

import React, { useState } from 'react';
import { mockEducationalData } from '@/data/mockData';
import { EducationalContentResponse, SentenceItem, SummaryType } from '@/types';
import { InputSection } from '@/components/InputSection';
import { HeroPhrase } from '@/components/HeroPhrase';
import { SummaryView } from '@/components/SummaryView';

export default function Home() {
  // Estado inicial alimentado con los datos pedagógicos acordados
  const [data, setData] = useState<EducationalContentResponse>(mockEducationalData);
  // Frase actualmente seleccionada para el Hero (por defecto la primera)
  const [selectedSentence, setSelectedSentence] = useState<SentenceItem>(
    mockEducationalData.sentences[0]
  );
  const [isLoading, setIsLoading] = useState(false);

  // Manejador del botón "Aprender"
  const handleProcessInput = (text: string, type: SummaryType) => {
    setIsLoading(true);
    // Simulación de respuesta inmediata. En la siguiente iteración conectaremos Gemini aquí.
    setTimeout(() => {
      setData((prev) => ({
        ...prev,
        userInputOriginal: text,
        summaryType: type,
      }));
      setIsLoading(false);
    }, 300);
  };

  // Manejador del botón "Estudiar frase" de la lista
  const handleSelectPhrase = (phrase: SentenceItem) => {
    setSelectedSentence(phrase);
    // Desplazamiento suave hacia arriba para enfocar la atención
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-slate-100/60 text-slate-900 pb-16">
      {/* Barra de cabecera */}
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
            Plataforma Activa
          </span>
        </div>
      </header>

      {/* Contenedor Principal */}
      <div className="max-w-5xl mx-auto px-4 pt-8">
        {/* Sección de Entrada */}
        <InputSection onProcess={handleProcessInput} isLoading={isLoading} />

        {/* 1. Elemento Protagonista (Hero Phrase) */}
        {selectedSentence && (
          <HeroPhrase sentence={selectedSentence} />
        )}

        {/* 2. Resumen en Párrafo y Lista de Frases */}
        {data && (
          <SummaryView
            summaryParagraph={data.summaryParagraph}
            sentences={data.sentences}
            currentSelectedId={selectedSentence.id}
            onSelectPhrase={handleSelectPhrase}
          />
        )}
      </div>
    </main>
  );
}