'use client';

import React, { useState, useEffect } from 'react';
import { mockEducationalData } from '@/data/mockData';
import { EducationalContentResponse, SentenceItem } from '@/types';
import { InputSection } from '@/components/InputSection';
import { MainVideoSegmentPlayer } from '@/components/MainVideoSegmentPlayer';
import { HeroPhrase } from '@/components/HeroPhrase';
import { SummaryView } from '@/components/SummaryView';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [data, setData] = useState<any>(mockEducationalData);
  const [selectedSentence, setSelectedSentence] = useState<SentenceItem>(
    mockEducationalData.sentences[0]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasLearned, setHasLearned] = useState(false);
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);
  const [activeInputGoal, setActiveInputGoal] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inicialización de tema Claro / Oscuro con memoria local
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // MANEJADOR DIRECTO Y BLINDADO
  const handleProcessInput = async (text: string) => {
    if (!text || !text.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setActiveInputGoal(text.trim());

    try {
      console.log('🚀 Enviando petición a /api/generate con texto:', text.trim());

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Error del servidor (${res.status})`);
      }

      const generatedData = await res.json();
      console.log('✓ Respuesta recibida con éxito:', generatedData);

      setData(generatedData);

      if (generatedData.sentences && generatedData.sentences.length > 0) {
        setSelectedSentence(generatedData.sentences[0]);
      }

      setHasLearned(true);
      setIsInputCollapsed(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Error al procesar entrada:', err);
      setErrorMessage(
        err.message || 'Hubo un inconveniente al conectar con el servidor. Verifica que GEMINI_API_KEY esté activa.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPhrase = (phrase: SentenceItem) => {
    setSelectedSentence(phrase);
    window.scrollTo({ top: 250, behavior: 'smooth' });
  };

  return (
    <main className={`min-h-screen transition-colors duration-300 pb-16 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Cabecera con selector Modo Día / Noche */}
      <header className={`border-b backdrop-blur-md sticky top-0 z-50 transition-colors ${
        darkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/80'
      }`}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-amber-500 text-white font-black text-sm shadow-md shadow-blue-500/20">
              ER
            </span>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
              English Race <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-sky-300">MVP</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
              ● IA Activa
            </span>

            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                darkMode 
                  ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700' 
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
              title="Cambiar modo visual"
            >
              {darkMode ? <span>🌙 Noche</span> : <span>☀️ Día</span>}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-8">
        
        {/* Banner de error si ocurre alguno */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-sm font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Formulario inicial / Barra colapsada */}
        {!hasLearned ? (
          <InputSection onProcess={handleProcessInput} isLoading={isLoading} />
        ) : isInputCollapsed ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 shadow-sm">
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 truncate max-w-lg">
              Meta activa: <strong className="text-slate-900 dark:text-white">"{activeInputGoal}"</strong>
            </p>
            <button
              onClick={() => setIsInputCollapsed(false)}
              className="px-5 py-2.5 rounded-xl border border-blue-500/40 text-blue-700 dark:text-sky-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 font-bold text-xs shadow-sm transition-all"
            >
              ✍ Escribir otra meta o pasión
            </button>
          </div>
        ) : (
          <div className="mb-8">
            <InputSection onProcess={handleProcessInput} isLoading={isLoading} />
          </div>
        )}

        {/* 2. SECUENCIA PEDAGÓGICA POST-APRENDIZAJE */}
        {hasLearned && (
          <div className="transition-all animate-fadeIn space-y-8">
            
            {/* 🌟 PASO A: REPRODUCTOR DEL VIDEO AUTÉNTICO (250-280 PALABRAS) */}
            {data?.videoSegment && (
              <MainVideoSegmentPlayer segment={data.videoSegment} />
            )}

            {/* 🌟 PASO B: HERO PHRASE CON ONDA MULTI-LÍNEA Y PIZARRA IPA INTERACTIVA */}
            {selectedSentence && (
              <HeroPhrase sentence={selectedSentence} />
            )}

            {/* 🌟 PASO C: RESUMEN Y FRASES DE ESTUDIO CON CAPA 2 */}
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