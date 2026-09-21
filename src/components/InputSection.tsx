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
      recognition.lang = 'es-ES';
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
    <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm mb-8 transition-all">
      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Selector de Resumen */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
            Formato de Resumen:
          </span>
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setSummaryType('normal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                summaryType === 'short'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resumen corto
            </button>
          </div>
        </div>

        {/* PROPUESTA A: Banner Integrado de Acción (Pregunta y Botón con igual relevancia visual) */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group w-full flex flex-col sm:flex-row items-center justify-between gap-4 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-white to-indigo-50/90 border-2 border-indigo-200 hover:border-indigo-400 shadow-sm hover:shadow-md transition-all text-left active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-lg shadow-sm group-hover:scale-105 transition">
                💡
              </span>
              <div>
                <p className="text-base md:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                  ¿Cómo aprendo a comunicar esto en inglés?
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  Generar resumen interactivo y desglose pedagógico por frases
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 group-hover:bg-indigo-700 text-white font-bold text-sm shadow transition shrink-0">
              <span>{isLoading ? 'Procesando...' : 'Aprender'}</span>
              <span className="text-base group-hover:translate-x-1 transition">➜</span>
            </div>
          </button>
        </div>
      </form>
    </div>
  );
};