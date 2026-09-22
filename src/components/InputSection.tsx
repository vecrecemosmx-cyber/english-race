'use client';

import React, { useState } from 'react';

interface InputSectionProps {
  onProcess: (text: string) => void;
  isLoading: boolean;
}

// Sugerencias de pasiones para romper el bloqueo de la hoja en blanco
const PASSION_SUGGESTIONS = [
  {
    label: '🎵 Música y Conciertos',
    text: 'Me apasiona la música, aprender a tocar instrumentos, componer canciones y asistir a festivales en vivo.',
  },
  {
    label: '🚀 Tecnología y Software',
    text: 'Me apasiona la tecnología, crear aplicaciones web modernas, la inteligencia artificial y el desarrollo de software.',
  },
  {
    label: '✈️ Viajes y Culturas',
    text: 'Mi sueño es viajar por todo el mundo, conocer diferentes culturas, hablar con personas locales y probar nueva gastronomía.',
  },
  {
    label: '💼 Negocios y Emprendimiento',
    text: 'Quiero liderar proyectos innovadores, crear mi propia empresa y construir soluciones que impacten positivamente a las personas.',
  },
  {
    label: '🎨 Arte y Creatividad',
    text: 'Disfruto el diseño visual, la fotografía, la pintura y explorar nuevas formas de expresión artística y audiovisual.',
  },
];

export const InputSection: React.FC<InputSectionProps> = ({ onProcess, isLoading }) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onProcess(inputText.trim());
  };

  // Atajo de teclado ergonómico: Ctrl + Enter o Cmd + Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <section className="rounded-3xl border-2 transition-all p-6 md:p-8 shadow-xl bg-white dark:bg-slate-900 border-blue-500/20 dark:border-blue-800/40 shadow-blue-500/5">
      
      {/* 1. Encabezado pedagógico */}
      <div className="mb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-blue-800/50 mb-3">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          Aprende con tus pasiones reales
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
          Aquí verás un video relacionado con lo que escribiste y te facilitaremos el entendimiento del idioma.
        </h1>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-2">
          Escribe tus metas, sueños, pasiones o actividades que más disfrutas. Localizaremos un orador nativo hablando de ello y desglosaremos su lenguaje para que lo domines paso a paso.
        </p>
        <span className="inline-block mt-2 text-xs font-semibold text-blue-600 dark:text-sky-400">
          💡 Puedes escribir libremente en español o en inglés.
        </span>
      </div>

      {/* 2. Píldoras de inspiración rápida (Chips clicables) */}
      <div className="mb-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
          O elige una temática para inspirarte:
        </span>
        <div className="flex flex-wrap gap-2">
          {PASSION_SUGGESTIONS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => setInputText(item.text)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/40 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-sky-300 hover:border-blue-400 active:scale-95 disabled:opacity-50"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Formulario principal con atajo y botón de limpieza */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ejemplo: Me apasiona la música, crear aplicaciones web modernas, viajar y conocer diferentes culturas..."
            rows={4}
            maxLength={1000}
            disabled={isLoading}
            className="w-full p-4 md:p-5 pb-8 rounded-2xl text-sm md:text-base border outline-none transition-all resize-none bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 disabled:opacity-50"
          />

          {/* Botón de Limpieza Rápida si hay texto */}
          {inputText && !isLoading && (
            <button
              type="button"
              onClick={() => setInputText('')}
              className="absolute top-3 right-3 text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1 rounded-md bg-slate-200/60 dark:bg-slate-800/80 transition"
              title="Borrar texto"
            >
              ✕ Limpiar
            </button>
          )}

          {/* Contador de caracteres y ayuda de atajo */}
          <div className="absolute bottom-2.5 right-4 flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 select-none">
            <span className="hidden sm:inline">Presiona <strong>Ctrl + Enter</strong> para enviar</span>
            <span>{inputText.length}/1000</span>
          </div>
        </div>

        {/* 4. Botón de Acción Principal */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm md:text-base text-slate-950 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 active:scale-95 shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Localizando video y procesando lenguaje...</span>
              </>
            ) : (
              <>
                <span>Aprender Ahora</span>
                <span className="text-lg leading-none">➔</span>
              </>
            )}
          </button>
        </div>
      </form>

    </section>
  );
};