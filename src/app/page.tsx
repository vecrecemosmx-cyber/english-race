'use client';

import React, { useState, useEffect } from 'react';

export default function EnglishRacePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [inputGoal, setInputGoal] = useState('');
  const [summaryType, setSummaryType] = useState<'normal' | 'short'>('normal');
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [activeLayer2Id, setActiveLayer2Id] = useState<string | null>(null);

  // Inicializar tema guardado
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

  const handleLearn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputGoal.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputGoal, summaryType }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al conectar');
      setData(json);
      setIsFormCollapsed(true);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9; // Cadencia óptima pedagógica
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* 1. Barra de Navegación y Botón Selector de Tema */}
      <header className={`border-b backdrop-blur-md sticky top-0 z-50 transition-colors ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-amber-500 dark:from-sky-400 dark:to-amber-300">
              English Race
            </span>
            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${darkMode ? 'bg-blue-900/50 text-blue-300 border border-blue-700/50' : 'bg-blue-100 text-blue-800'}`}>
              MVP
            </span>
          </div>

          {/* Botón Selector Claro / Oscuro */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              darkMode 
                ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-750' 
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
            title="Cambiar tema visual"
          >
            {darkMode ? (
              <>
                <span className="text-sm">🌙</span>
                <span>Modo Noche</span>
              </>
            ) : (
              <>
                <span className="text-sm">☀️</span>
                <span>Modo Día</span>
              </>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* 2. Formulario de Metas / Botón Colapsado */}
        {isFormCollapsed ? (
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-md">
              Meta activa: <span className="font-semibold text-slate-800 dark:text-slate-200">"{inputGoal}"</span>
            </p>
            <button
              onClick={() => setIsFormCollapsed(false)}
              className="text-xs font-semibold px-4 py-2 rounded-xl border border-blue-500/30 text-blue-600 dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all"
            >
              ✍ Introducir otro texto para aprender
            </button>
          </div>
        ) : (
          <div className={`p-6 rounded-3xl border shadow-xl mb-8 transition-all ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'}`}>
            <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
              ¿Qué sueñas o deseas expresar en inglés?
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Escribe tus metas o pasiones en español o inglés cotidiano. La IA descompondrá tu lenguaje con fonética, colocaciones y contexto.
            </p>

            <form onSubmit={handleLearn} className="space-y-4">
              <textarea
                value={inputGoal}
                onChange={(e) => setInputGoal(e.target.value)}
                placeholder="Ejemplo: Quiero construir aplicaciones web modernas y viajar por todo el mundo..."
                rows={3}
                className={`w-full p-4 rounded-2xl text-sm border outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                  darkMode 
                    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Resumen:</label>
                  <select
                    value={summaryType}
                    onChange={(e: any) => setSummaryType(e.target.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg border outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-700'
                    }`}
                  >
                    <option value="normal">Normal (2-3 oraciones)</option>
                    <option value="short">Corto (1-2 oraciones)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 shadow-md shadow-orange-500/25 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Analizando lenguaje...' : 'Aprender ➔'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 3. Panel de Resultados Pedagógicos */}
        {data && (
          <div className="space-y-6">
            
            {/* Resumen Párrafo Contextual */}
            <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900/60 border-blue-900/30' : 'bg-blue-50/60 border-blue-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                  Contextual Paragraph
                </span>
                <button
                  onClick={() => playAudio(data.summaryParagraph)}
                  className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm transition-all"
                >
                  🔊 Escuchar Párrafo
                </button>
              </div>
              <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                {data.summaryParagraph}
              </p>
            </div>

            {/* Lista de Frases Descompuestas */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Frases de Acción para Estudiar
              </h2>

              {data.sentences?.map((sentence: any, idx: number) => {
                const isLayer2Open = activeLayer2Id === sentence.id;

                return (
                  <div
                    key={sentence.id || idx}
                    className={`p-6 rounded-3xl border transition-all ${
                      darkMode 
                        ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700' 
                        : 'bg-white border-slate-200 shadow-sm hover:border-blue-200'
                    }`}
                  >
                    {/* Texto Principal y Botones de Acción */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            {sentence.text}
                          </span>
                        </div>
                        {/* Fonética IPA Americana */}
                        <span className="inline-block font-mono text-xs px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                          {sentence.ipa}
                        </span>
                      </div>

                      {/* Botones de Audio y Estudio */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => playAudio(sentence.text)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-1 shadow-sm"
                        >
                          🔊 Audio
                        </button>
                        <button
                          onClick={() => navigator.clipboard.writeText(sentence.text)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                            darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Copiar
                        </button>
                      </div>
                    </div>

                    {/* Descomposición Sintáctica: CoreStructure + TargetComplement */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 text-xs">
                      <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Core Structure</span>
                        <span className="font-semibold text-blue-600 dark:text-sky-400">{sentence.coreStructure}</span>
                      </div>
                      <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Target Complement</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">{sentence.targetComplement}</span>
                      </div>
                    </div>

                    {/* Definición Simplificada CEFR A1-A2 */}
                    <div className="mb-4">
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        <span className="font-bold text-slate-800 dark:text-slate-200">Significado (A1-A2): </span>
                        {sentence.cefrDefinition}
                      </p>
                    </div>

                    {/* Colocaciones de sustitución (5 variaciones) */}
                    {sentence.collocations && (
                      <div className="mb-4">
                        <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-2">
                          Collocations (Patrones de sustitución):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {sentence.collocations.map((col: string, cIdx: number) => (
                            <button
                              key={cIdx}
                              onClick={() => playAudio(col)}
                              className={`text-xs px-3 py-1 rounded-full border transition-all ${
                                darkMode 
                                  ? 'bg-blue-950/40 border-blue-800/50 text-blue-200 hover:border-amber-400/60' 
                                  : 'bg-blue-50 border-blue-200 text-blue-900 hover:border-blue-400'
                              }`}
                            >
                              {col}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Botón Desplegable Capa 2: "No entendí completamente" */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                      <button
                        onClick={() => setActiveLayer2Id(isLayer2Open ? null : sentence.id)}
                        className={`text-xs font-semibold px-4 py-1.5 rounded-xl border transition-all ${
                          isLayer2Open
                            ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                            : darkMode
                            ? 'border-slate-700 text-slate-400 hover:text-amber-300'
                            : 'border-slate-300 text-slate-600 hover:text-orange-600'
                        }`}
                      >
                        {isLayer2Open ? '▲ Ocultar profundización' : '▼ No entendí completamente'}
                      </button>
                    </div>

                    {/* Capa 2: Panel de Verificación Contextual */}
                    {isLayer2Open && sentence.layer2 && (
                      <div className={`mt-4 p-5 rounded-2xl border space-y-4 transition-all ${
                        darkMode ? 'bg-slate-950 border-amber-500/30' : 'bg-amber-50/50 border-amber-200'
                      }`}>
                        <div className="border-b border-amber-500/20 pb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            Capa 2: Profundización Pedagógica
                          </span>
                        </div>

                        {/* Técnica 1: Mini historia */}
                        {sentence.layer2.primaryTechnique && (
                          <div className="text-xs">
                            <span className="font-bold block mb-1 text-slate-800 dark:text-slate-200">
                              🎬 {sentence.layer2.primaryTechnique.title}:
                            </span>
                            <p className="text-slate-600 dark:text-slate-400 italic">
                              "{sentence.layer2.primaryTechnique.content}"
                            </p>
                          </div>
                        )}

                        {/* Técnica 2: Situación opuesta */}
                        {sentence.layer2.secondaryTechnique && (
                          <div className="text-xs">
                            <span className="font-bold block mb-1 text-slate-800 dark:text-slate-200">
                              ⚡ {sentence.layer2.secondaryTechnique.title}:
                            </span>
                            <p className="text-slate-600 dark:text-slate-400 mb-1">
                              Antónimo: <span className="font-bold text-amber-600 dark:text-amber-400">{sentence.layer2.secondaryTechnique.oppositeWord}</span>
                            </p>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                              {sentence.layer2.secondaryTechnique.contrastPhrases?.map((cp: string, cpIdx: number) => (
                                <li key={cpIdx}>{cp}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Búsqueda sugerida para YouGlish / YouTube */}
                        {sentence.layer2.youtubeContextQuery && (
                          <div className="pt-2 text-xs flex items-center justify-between border-t border-amber-500/20">
                            <span className="text-slate-500 dark:text-slate-400">
                              Búsqueda en transcripciones: <code className="font-mono text-blue-600 dark:text-sky-400">"{sentence.layer2.youtubeContextQuery}"</code>
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}