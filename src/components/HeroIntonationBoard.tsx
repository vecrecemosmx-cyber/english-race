'use client';

import React, { useRef, useState, useEffect } from 'react';

interface HeroIntonationBoardProps {
  phrase: string;
  ipa?: string;
}

// Lista de palabras funcionales comunes que típicamente van reducidas en inglés americano
const FUNCTION_WORDS = new Set([
  'a', 'an', 'the', 'to', 'in', 'at', 'on', 'of', 'for', 'with', 'from', 'by',
  'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
  'do', 'does', 'did', 'have', 'has', 'had',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'its', 'our', 'their',
  'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must',
  'and', 'but', 'or', 'so', 'if', 'that', 'as', 'than'
]);

// Catálogo de símbolos IPA estándar en inglés americano
const IPA_SYMBOLS = [
  'ə', 'æ', 'ɪ', 'iː', 'ʊ', 'uː', 'ɑː', 'ɔː',
  'aɪ', 'eɪ', 'oʊ', 'aʊ', 'ɔɪ',
  'ɾ', 'θ', 'ð', 'ʃ', 'ʒ', 'tʃ', 'dʒ', 'ŋ', 'ˈ', 'ˌ'
];

export const HeroIntonationBoard: React.FC<HeroIntonationBoardProps> = ({ phrase, ipa }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Estados de la pizarra
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [activeTool, setActiveTool] = useState<'pen' | 'eraser' | 'ipa'>('pen');
  const [selectedIpa, setSelectedIpa] = useState<string>('ə');
  const [penColor, setPenColor] = useState<string>('#f59e0b'); // Ámbar por defecto
  const [isDrawing, setIsDrawing] = useState(false);

  // 1. Generador de la curva de entonación y stress de fondo
  const generateWavePath = () => {
    const words = phrase.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '';

    const width = 1000;
    const height = 180;
    const step = width / (words.length + 1);

    // Mapear alturas de stress
    const points = words.map((word, idx) => {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
      const isFunction = FUNCTION_WORDS.has(cleanWord);
      const isLastWord = idx === words.length - 1;

      // Las palabras de contenido tienen crestas altas (Y menor en SVG), las funcionales tienen valles
      let y = isFunction ? 125 : 45;
      
      // En oraciones declarativas americanas, la última palabra lleva el núcleo y una caída final
      if (isLastWord) {
        y = isFunction ? 140 : 65;
      }

      const x = (idx + 1) * step;
      return { x, y, isStressed: !isFunction };
    });

    // Iniciar el trazado suave
    let path = `M 0,${height / 2}`;
    
    // Curva de Bézier cúbica entre puntos
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const prevX = i === 0 ? 0 : points[i - 1].x;
      const prevY = i === 0 ? height / 2 : points[i - 1].y;
      const cp1x = prevX + (p.x - prevX) / 2;
      const cp2x = prevX + (p.x - prevX) / 2;

      path += ` C ${cp1x},${prevY} ${cp2x},${p.y} ${p.x},${p.y}`;
    }

    // Caída tonal final hacia el borde derecho
    const lastPoint = points[points.length - 1];
    path += ` C ${lastPoint.x + 50},${lastPoint.y} ${width - 50},150 ${width},150`;

    return path;
  };

  // 2. Ajuste responsivo del Canvas de dibujo
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const canvas = canvasRef.current;
      
      // Mantener resolución nítida
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [phrase, isAnnotating]);

  // 3. Manejadores de dibujo
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isAnnotating || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (activeTool === 'ipa') {
      // Estampar símbolo IPA exactamente donde hizo clic
      ctx.save();
      ctx.font = 'bold 22px monospace';
      ctx.fillStyle = penColor;
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
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

    ctx.lineWidth = activeTool === 'eraser' ? 18 : 3.5;
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
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const wavePath = generateWavePath();

  return (
    <div className="relative w-full rounded-2xl overflow-hidden mb-6">
      
      {/* Botón para alternar la Pizarra de Anotaciones en Vivo */}
      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={() => setIsAnnotating(!isAnnotating)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
            isAnnotating
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700'
          }`}
          title="Dibujar o colocar símbolos IPA en vivo"
        >
          <span>{isAnnotating ? '✕ Cerrar Pizarra' : '✏️ Modo Pizarra / Anotaciones'}</span>
        </button>
      </div>

      {/* Barra de herramientas flotante de la Pizarra */}
      {isAnnotating && (
        <div className="mb-3 p-3 rounded-2xl bg-slate-900 border border-slate-700 text-white shadow-xl animate-fadeIn space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            
            {/* Selector de Herramientas principales */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTool('pen')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  activeTool === 'pen' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                ✏️ Trazo libre
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

            {/* Colores de trazo */}
            {activeTool !== 'eraser' && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Tinta:</span>
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

          {/* Catálogo de Símbolos IPA clicables */}
          {activeTool === 'ipa' && (
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1.5 font-bold uppercase tracking-wider">
                Selecciona un símbolo y luego haz clic sobre la frase para estamparlo:
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

      {/* CONTENEDOR PRINCIPAL: ONDA DE FONDO + TEXTO HERO + CANVAS INTERACTIVO */}
      <div
        ref={containerRef}
        className="relative w-full min-h-[140px] md:min-h-[160px] p-6 md:p-8 rounded-2xl flex flex-col justify-center bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 shadow-inner select-none"
      >
        {/* ======================================================== */}
        {/* CAPA 0 (Fondo): ONDA DINÁMICA DE ENTONACIÓN Y STRESS     */}
        {/* ======================================================== */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <svg
            viewBox="0 0 1000 180"
            preserveAspectRatio="none"
            className="w-full h-full opacity-40 dark:opacity-50"
          >
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Sombra de la onda acústica */}
            <path
              d={wavePath}
              fill="none"
              stroke="url(#waveGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              className="blur-sm"
            />
            {/* Trazo nítido de la onda */}
            <path
              d={wavePath}
              fill="none"
              stroke="url(#waveGradient)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* ======================================================== */}
        {/* CAPA 1 (Medio): EL TEXTO HERO Y SU FONÉTICA              */}
        {/* ======================================================== */}
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight drop-shadow-sm">
            {phrase}
          </h2>
          {ipa && (
            <p className="font-mono text-base md:text-xl text-amber-600 dark:text-amber-400 mt-2 font-bold tracking-wide">
              {ipa}
            </p>
          )}
        </div>

        {/* ======================================================== */}
        {/* CAPA 2 (Frente): LIENZO TRANSPARENTE DE ANOTACIÓN VIVA  */}
        {/* ======================================================== */}
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

      {/* Indicador de ayuda pedagógica */}
      {isAnnotating && (
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-2">
          <span>💡 Dibuja libremente enlaces o selecciona un símbolo IPA para estamparlo sobre las palabras.</span>
          <span className="font-mono">Pizarra activa</span>
        </div>
      )}
    </div>
  );
};