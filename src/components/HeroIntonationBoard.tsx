'use client';

import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';

interface HeroIntonationBoardProps {
  phrase: string;
  ipa?: string;
}

// Palabras funcionales reducidas en inglés americano
const FUNCTION_WORDS = new Set([
  'a', 'an', 'the', 'to', 'in', 'at', 'on', 'of', 'for', 'with', 'from', 'by',
  'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
  'do', 'does', 'did', 'have', 'has', 'had',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'its', 'our', 'their',
  'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must',
  'and', 'but', 'or', 'so', 'if', 'that', 'as', 'than'
]);

// Catálogo de símbolos IPA estándar
const IPA_SYMBOLS = [
  'ə', 'æ', 'ɪ', 'iː', 'ʊ', 'uː', 'ɑː', 'ɔː',
  'aɪ', 'eɪ', 'oʊ', 'aʊ', 'ɔɪ',
  'ɾ', 'θ', 'ð', 'ʃ', 'ʒ', 'tʃ', 'dʒ', 'ŋ', 'ˈ', 'ˌ'
];

interface WordLineGroup {
  words: { text: string; isStressed: boolean }[];
  lineIndex: number;
}

export const HeroIntonationBoard: React.FC<HeroIntonationBoardProps> = ({ phrase, ipa }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textContainerRef = useRef<HTMLHeadingElement>(null);

  // Estados de la pizarra
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [activeTool, setActiveTool] = useState<'pen' | 'eraser' | 'ipa'>('pen');
  const [selectedIpa, setSelectedIpa] = useState<string>('ə');
  const [penColor, setPenColor] = useState<string>('#f59e0b');
  const [strokeWidth, setStrokeWidth] = useState<number>(5); // 3 (fino), 6 (medio), 10 (grueso)
  const [isDrawing, setIsDrawing] = useState(false);

  // Historial para el botón Deshacer (Undo)
  const [historyStack, setHistoryStack] = useState<ImageData[]>([]);

  // Detección de líneas de texto físicas para la onda segmentada
  const [lineGroups, setLineGroups] = useState<WordLineGroup[]>([]);

  const words = phrase.trim().split(/\s+/).filter(Boolean);

  // Calcular en qué línea física cae cada palabra según su offsetTop
  useLayoutEffect(() => {
    if (!textContainerRef.current) return;
    const spans = textContainerRef.current.querySelectorAll<HTMLSpanElement>('span.word-span');
    if (spans.length === 0) return;

    const linesMap: { [offsetTop: number]: { text: string; isStressed: boolean }[] } = {};

    spans.forEach((span) => {
      const top = Math.round(span.offsetTop);
      const text = span.innerText.trim();
      const cleanWord = text.toLowerCase().replace(/[^a-z]/g, '');
      const isStressed = !FUNCTION_WORDS.has(cleanWord);

      if (!linesMap[top]) {
        linesMap[top] = [];
      }
      linesMap[top].push({ text, isStressed });
    });

    const calculatedGroups: WordLineGroup[] = Object.values(linesMap).map((wList, idx) => ({
      words: wList,
      lineIndex: idx,
    }));

    setLineGroups(calculatedGroups);
  }, [phrase]);

  // Generador de la curva de entonación para una línea específica
  const generateLineWavePath = (lineWords: { text: string; isStressed: boolean }[], isLastLine: boolean) => {
    const width = 800;
    const height = 90;
    const step = width / (lineWords.length + 1);

    const points = lineWords.map((item, idx) => {
      let y = item.isStressed ? 20 : 65;
      if (isLastLine && idx === lineWords.length - 1) {
        y = 75; // Caída tonal al final de la oración
      }
      return { x: (idx + 1) * step, y };
    });

    let path = `M 0,${height / 2}`;
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const prevX = i === 0 ? 0 : points[i - 1].x;
      const prevY = i === 0 ? height / 2 : points[i - 1].y;
      const cpx = prevX + (p.x - prevX) / 2;
      path += ` C ${cpx},${prevY} ${cpx},${p.y} ${p.x},${p.y}`;
    }

    const last = points[points.length - 1];
    path += ` C ${last.x + 40},${last.y} ${width - 30},65 ${width},65`;
    return path;
  };

  // Ajuste del tamaño del Canvas y redibujado de historial
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const canvas = canvasRef.current;
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [phrase, isAnnotating]);

  // Guardar estado actual en la pila de historial antes de un nuevo trazo
  const saveStateToHistory = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const currentState = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHistoryStack((prev) => [...prev.slice(-15), currentState]); // Guardamos hasta 15 pasos
  };

  // BOTÓN DESHACER (UNDO)
  const handleUndo = () => {
    if (!canvasRef.current || historyStack.length === 0) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const previousState = historyStack[historyStack.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setHistoryStack((prev) => prev.slice(0, prev.length - 1));
  };

  // BOTÓN ALTERNAR GROSOR
  const cycleStrokeWidth = () => {
    if (strokeWidth === 3) setStrokeWidth(6);
    else if (strokeWidth === 6) setStrokeWidth(10);
    else setStrokeWidth(3);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isAnnotating || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveStateToHistory();

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (activeTool === 'ipa') {
      ctx.save();
      ctx.font = 'bold 22px monospace';
      ctx.fillStyle = penColor;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText(`/${selectedIpa}/`, x - 15, y);
      ctx.restore();
      return;
    }

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isAnnotating || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = activeTool === 'eraser' ? 22 : strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = penColor;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    saveStateToHistory();
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden mb-6">
      
      {/* Botón de apertura de Pizarra */}
      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={() => setIsAnnotating(!isAnnotating)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
            isAnnotating
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700'
          }`}
        >
          <span>{isAnnotating ? '✕ Cerrar Pizarra' : '✏️ Modo Pizarra / Anotaciones'}</span>
        </button>
      </div>

      {/* Barra de herramientas flotante */}
      {isAnnotating && (
        <div className="mb-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-white shadow-xl animate-fadeIn space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTool('pen')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  activeTool === 'pen' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                ✏️ Trazo
              </button>

              {/* 🌟 BOTÓN PARA CAMBIAR GROSOR */}
              <button
                type="button"
                onClick={cycleStrokeWidth}
                className="px-3 py-1.5 rounded-lg font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition"
                title="Cambiar grosor del trazo"
              >
                Grosor: {strokeWidth === 3 ? 'Fino' : strokeWidth === 6 ? 'Medio' : 'Grueso'}
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('eraser')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  activeTool === 'eraser' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                🧹 Borrador
              </button>

              {/* 🌟 BOTÓN DESHACER (UNDO) */}
              <button
                type="button"
                onClick={handleUndo}
                disabled={historyStack.length === 0}
                className="px-3 py-1.5 rounded-lg font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-40 disabled:pointer-events-none"
                title="Revertir el último trazo"
              >
                ↩ Deshacer
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('ipa')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  activeTool === 'ipa' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                🔤 Estampar IPA (/{selectedIpa}/)
              </button>

              <button
                type="button"
                onClick={clearCanvas}
                className="px-2.5 py-1.5 rounded-lg font-semibold bg-rose-950/60 text-rose-300 border border-rose-800 hover:bg-rose-900 transition"
              >
                Limpiar todo
              </button>
            </div>

            {/* Selector de color de tinta */}
            {activeTool !== 'eraser' && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Color:</span>
                {[
                  { label: 'Ámbar', color: '#f59e0b' },
                  { label: 'Rojo', color: '#ef4444' },
                  { label: 'Esmeralda', color: '#10b981' },
                  { label: 'Cielo', color: '#38bdf8' },
                  { label: 'Blanco', color: '#ffffff' },
                ].map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => setPenColor(c.color)}
                    style={{ backgroundColor: c.color }}
                    className={`h-5 w-5 rounded-full border transition-transform ${
                      penColor === c.color ? 'scale-125 ring-2 ring-white' : 'opacity-80 hover:opacity-100'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Catálogo de símbolos IPA */}
          {activeTool === 'ipa' && (
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1.5 font-bold uppercase tracking-wider">
                Haz clic en un fonema y luego pulsa sobre la frase para colocarlo:
              </span>
              <div className="flex flex-wrap gap-1">
                {IPA_SYMBOLS.map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => setSelectedIpa(sym)}
                    className={`font-mono text-xs px-2.5 py-1 rounded-md transition ${
                      selectedIpa === sym
                        ? 'bg-amber-400 text-slate-950 font-black scale-110 shadow'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    /{sym}/
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTENEDOR DE LA FRASE: CON ONDA SEGMENTADA POR LÍNEA FÍSICA */}
      <div
        ref={containerRef}
        className="relative w-full p-6 md:p-8 rounded-2xl bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 shadow-inner select-none"
      >
        {/* 🌟 CAPA 0 (FONDO): ONDAS INDEPENDIENTES POR CADA LÍNEA FÍSICA */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex flex-col justify-around py-4 opacity-40 dark:opacity-50">
          {(lineGroups.length > 0 ? lineGroups : [{ words: words.map(w => ({ text: w, isStressed: true })), lineIndex: 0 }]).map((group, gIdx) => {
            const isLast = gIdx === lineGroups.length - 1;
            const linePath = generateLineWavePath(group.words, isLast);

            return (
              <div key={gIdx} className="w-full h-16 relative">
                <svg
                  viewBox="0 0 800 90"
                  preserveAspectRatio="none"
                  className="w-full h-full"
                >
                  <defs>
                    <linearGradient id={`lineGrad-${gIdx}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  <path
                    d={linePath}
                    fill="none"
                    stroke={`url(#lineGrad-${gIdx})`}
                    strokeWidth="10"
                    strokeLinecap="round"
                    className="blur-sm"
                  />
                  <path
                    d={linePath}
                    fill="none"
                    stroke={`url(#lineGrad-${gIdx})`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            );
          })}
        </div>

        {/* CAPA 1: TEXTO HERO */}
        <div className="relative z-10">
          <h2
            ref={textContainerRef}
            className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-relaxed drop-shadow-sm flex flex-wrap gap-x-2.5 gap-y-1"
          >
            {words.map((word, wIdx) => (
              <span key={wIdx} className="word-span inline-block">
                {word}
              </span>
            ))}
          </h2>
          {ipa && (
            <p className="font-mono text-base md:text-xl text-amber-600 dark:text-amber-400 mt-3 font-bold tracking-wide">
              {ipa}
            </p>
          )}
        </div>

        {/* CAPA 2: LIENZO TRANSPARENTE INTERACTIVO */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`absolute inset-0 z-20 w-full h-full transition-all ${
            isAnnotating ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'
          }`}
        />
      </div>

    </div>
  );
};