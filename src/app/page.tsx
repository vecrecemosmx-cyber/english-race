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

  // Estado 1: Controla si el estudiante ya presionó "Aprender" al menos una vez
  const [hasLearned, setHasLearned] = useState(false);

  // Estado 2: Controla si el formulario está colapsado u oculto tras generar
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);

  // Manejador del disparador "Aprender"
  const handleProcessInput = (text: string, type: SummaryType) => {
    setIsLoading(true);

    setTimeout(() => {
      setData((prev) => ({
        ...prev,
        userInputOriginal: text,
        summaryType: type,
      }));
      // 1. Activamos la visualización de los resultados
      setHasLearned(true);
      // 2. Colapsamos el contenedor de entrada
      setIsInputCollapsed(true);
      setIsLoading(false);

      // Desplazamiento suave al inicio de los resultados
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  };

  // Manejador del botón "Estudiar frase" de la lista
  const handleSelectPhrase = (phrase: SentenceItem) => {
    setSelectedSentence(phrase);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-slate-100/60 text-slate-900 pb-16">
      {/* Barra de Cabecera */}
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
        {/* ============================================================ */}
        {/* FASE 1: ENTRADA DE DATOS (Visible al inicio o al expandir)   */}
        {/* ============================================================ */}
        {!hasLearned ? (
          // Estado Inicial: ÚNICAMENTE se muestra el formulario de entrada
          <InputSection onProcess={handleProcessInput} isLoading={isLoading} />
        ) : isInputCollapsed ? (
          // Estado Colapsado: Solo el botón para volver a ingresar otro texto
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setIsInputCollapsed(false)}
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white border-2 border-indigo-200 hover:border-indigo-400 text-indigo-700 font-bold text-sm shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <span>✍ Introducir otro texto para aprender</span>
            </button>
          </div>
        ) : (
          // Estado Expandido (cuando el usuario quiere editar o escribir otro texto tras haber generado)
          <div className="mb-8">
            <InputSection onProcess={handleProcessInput} isLoading={isLoading} />
          </div>
        )}

        {/* ============================================================ */}
        {/* FASE 2: RESULTADOS (Solo se muestran tras pulsar "Aprender") */}
        {/* ============================================================ */}
        {hasLearned && (
          <div className="transition-all animate-fadeIn">
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
        )}
      </div>
    </main>
  );
}