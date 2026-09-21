'use client';

import React, { useState } from 'react';
import { SummaryType } from '@/types';

interface InputSectionProps {
  onProcess: (text: string, type: SummaryType) => void;
  isLoading?: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onProcess, isLoading }) => {
  const [inputText, setInputText] = useState(
    'Quiero ser un desarrollador de software y viajar por el mundo aprendiendo nuevas culturas.'
  );
  const [summaryType, setSummaryType] = useState<SummaryType>('short');
  const [isRecording, setIsRecording] = useState(false);

  // Grabación básica con Web Speech Recognition nativa
  const handleToggleRecord = () => {
    if (typeof window === 'undefined') return;
    
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tu navegador no tiene activado el dictado por voz. Puedes escribir tu texto en el recuadro.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES'; // O es-MX según corresponda
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsRecording(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onProcess(inputText, summaryType);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm mb-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">
            ¿Cuáles son tus metas de vida, sueños, pasiones o intereses?
          </label>
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ejemplo: Quiero emprender un negocio digital, hablar inglés con fluidez y vivir cerca de la playa..."
              rows={3}
              className="w-full rounded-2xl border border-slate-300 p-4 text-sm md:text-base text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition resize-none"
            />
            {/* Botón de dictado por voz */}
            <button
              type="button"
              onClick={handleToggleRecord}
              className={`absolute bottom-3 right-3 p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
              title="Dictar por audio"
            >
              <span>{isRecording ? '● Grabando...' : '🎤 Dictar'}</span>
            </button>
          </div>
        </div>

        {/* Selector de Resumen (Normal o Corto) */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Tipo de Resumen:
            </span>
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setSummaryType('normal')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  summaryType === 'normal'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Resumen normal
              </button>
              <button
                type="button"
                onClick={() => setSummaryType('short')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  summaryType === 'short'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Resumen corto
              </button>
            </div>
          </div>

          {/* Pregunta y Botón Aprender */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs md:text-sm font-semibold text-slate-700">
              ¿Cómo aprendo a comunicar esto en inglés?
            </span>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md transition shrink-0"
            >
              {isLoading ? 'Procesando...' : 'Aprender'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};