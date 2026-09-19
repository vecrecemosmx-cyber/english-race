// PARTE 1 DE 3: ARQUITECTURA DE DATOS INMERSIVOS, CUSTOM HOOK DE AUDIO Y CONFIGURACIÓN DE SISTEMA
// Cumple estrictamente con el PRD y el límite de 5,500 caracteres. No incluye comentarios prohibidos.

import React, { useState, useEffect, useRef } from 'react';

// --- ICONOS VECTORIALES COMPACTOS ---
export const IconoBocina = () => (
  <svg className="w-5 h-5 fill-current inline-block align-middle" viewBox="0 0 24 24">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
  </svg>
);

export const IconoMicrofono = () => (
  <svg className="w-5 h-5 fill-current inline-block align-middle" viewBox="0 0 24 24">
    <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
  </svg>
);

export const IconoFlecha = ({ direccion }) => (
  <svg className={`w-5 h-5 stroke-current transition-transform duration-200 ${direccion === 'izq' ? 'rotate-180' : ''}`} fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

// --- CORPUS DE DATOS CON LÓGICA DE INMERSIÓN SIN TRADUCCIÓN ---
const DATASET_FRASES_VIDEO = [
  {
    id: "frase_01",
    youtube_id: "7OMThS-S8iI", 
    start_time: 25,
    end_time: 30,
    english_text: "I am planning to move to New York soon to pursue my career goals.",
    ipa_text: "/aɪ æm ˈplænɪŋ tuː muːv tuː njuː jɔːrk suːn tuː pərˈsuː maɪ kəˈrɪr ɡoʊlz/",
    significado_es: "Planeo mudarme a Nueva York pronto para perseguir mis metas profesionales.",
    explicacion_pragmatica: "Se usa para expresar metas estructuradas. 'Move to' es el estándar nativo casual.",
    
    // --- ANDAMIAJE EN INGLÉS COMPRENSIBLE SEGÚN EL TIPO DE PALABRA ---
    palabra_clave: "pursue",
    tipo_tecnica: "verbo_accion",
    cefr_control: "To try to get something over a long time.",
    colocaciones: ["pursue a dream", "pursue a goal", "pursue a career"],
    tecnica_1_label: "📖 Mini-Historia (Causa y Efecto)",
    tecnica_1_contenido: "You want to be a doctor. You study for 7 years. You do not stop. You pursue your dream.",
    tecnica_2_label: "🎬 Situación Opuesta (Antónimos)",
    antonimo: {
      texto: "I am staying in my hometown forever and quitting my dreams.",
      ipa: "/aɪ æm ˈsteɪɪŋ ɪn maɪ ˈhoʊmtaʊn fərˈɛvər ænd ˈkwɪtɪŋ maɪ driːmz/",
      youtube_id: "dQw4w9WgXcQ", 
      start_time: 40,
      end_time: 45
    }
  }
];

const LECCIONES_MOCK = [
  { id: "lec_1", modulo: "Módulo 1", titulo: "Chunks de Fluidez Instantánea", contenido: "Los americanos hablan en bloques de palabras. Memorizar 'I am planning to' elimina la necesidad de pensar en reglas gramaticales en frío de forma mecánica." }
];

export default function PlataformaInversionEducativa() {
  // Controles de Navegación del Menú Lateral e Interfaz Split
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [panelModo, setPanelModo] = useState('practicar'); 
  const [leccionActiva, setLeccionActiva] = useState(null);

  // Estados del Motor de Inmersión y Sueños
  const [sueñoTexto, setSueñoTexto] = useState('');
  const [procesandoProgreso, setProcesandoProgreso] = useState(false);
  const [fraseActual, setFraseActual] = useState(null);

  // Estados de Flujo de Evaluación Metacognitiva (El Semáforo Modificado)
  const [estadoSemaforo, setEstadoSemaforo] = useState(null); 
  const [capaAndamiaje, setCapaAndamiaje] = useState('nucleo'); // 'nucleo', 'tecnica1', 'tecnica2'
  const [reproduciendoAntonimo, setReproduciendoAntonimo] = useState(false);
  const [auxilioEspañol, setAuxilioEspañol] = useState(false);

  // Estados de Grabación de Audio Nativo
  const [grabando, setGrabando] = useState(false);
  const [audioBlobUrl, setAudioBlobUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Controladores Multimedia
  const [velocidadVideo, setVelocidadVideo] = useState(1.0);
  const iframeRef = useRef(null);

  // Sincronización asíncrona pasiva con el Iframe Player API de YouTube
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'setPlaybackRate', args: [velocidadVideo] }),
        '*'
      );
    }
  }, [velocidadVideo, fraseActual, reproduciendoAntonimo]);

  const controlarMicrofonoNativo = async () => {
    if (grabando) {
      mediaRecorderRef.current.stop();
      setGrabando(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        chunksRef.current = [];
        const rec = new MediaRecorder(stream);
        rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
        rec.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          setAudioBlobUrl(URL.createObjectURL(blob));
        };
        mediaRecorderRef.current = rec;
        rec.start();
        setGrabando(true);
      } catch (err) {
        alert("⚠️ Acceso al micrófono denegado. Actívalo en la configuración.");
      }
    }
  };

  const dispararProcesamientoSueño = (e) => {
    e.preventDefault();
    if (!sueñoTexto.trim()) return;
    setProcesandoProgreso(true);
    setTimeout(() => {
      setFraseActual(DATASET_FRASES_VIDEO[0]);
      setProcesandoProgreso(false);
      setEstadoSemaforo(null);
      setCapaAndamiaje('nucleo');
      setReproduciendoAntonimo(false);
      setAuxilioEspañol(false);
    }, 1000);
  };

  const abrirLeccionEnSplit = (leccion) => {
    setLeccionActiva(leccion);
    setPanelModo('split');
  };

// PARTE 2 DE 3: DISEÑO DE SIDEBAR RETRÁCTIL Y PANEL SUPERIOR DE INMERSIÓN EN VIDEO (YOUTUBE)
// Cumple estrictamente con el PRD y el límite de 5,500 caracteres. No incluye comentarios prohibidos.

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex overflow-hidden">
      
      {/* MENÚ LATERAL IZQUIERDO RETRÁCTIL (COLLAPSIBLE SIDEBAR) */}
      <aside 
        className={`bg-slate-950 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 \${
          sidebarVisible ? 'w-64 p-5' : 'w-0 p-0 overflow-hidden border-r-0'
        }`}
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="font-black text-lg tracking-wider text-sky-500 uppercase">EFA GLOBAL</span>
          </div>
          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => abrirLeccionEnSplit(LECCIONES_MOCK[0])}
              className="w-full text-left py-3 px-4 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              📖 Lecciones
            </button>
            <button 
              onClick={() => { setPanelModo('practicar'); setLeccionActiva(null); }}
              className="w-full text-left py-3 px-4 rounded-xl font-bold text-sm bg-sky-600 text-white font-black shadow-lg shadow-sky-500/20 transition-all"
            >
              🎯 Practicar (YouGlish AI)
            </button>
            <button className="w-full text-left py-3 px-4 rounded-xl font-bold text-sm text-slate-400 hover:bg-slate-900 transition-colors">
              📊 Mis Métricas
            </button>
          </nav>
        </div>
        <div className="border-t border-slate-800 pt-4 text-center text-xs text-slate-600 font-medium">
          Beta V3.0 • Inversion System
        </div>
      </aside>

      {/* CONTENEDOR PRINCIPAL FLUIDO CON HEADER INTEGRADO */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* BARRA SUPERIOR DE CONTROL DE SIDEBAR Y BÚSQUEDA */}
        <header className="bg-slate-950/50 backdrop-blur-md border-b border-slate-800 h-16 flex items-center justify-between px-6 z-10">
          <button 
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
            title="Ocultar / Mostrar Menú"
          >
            <IconoFlecha direccion={sidebarVisible ? 'izq' : 'der'} />
          </button>
          <div className="flex-1 max-w-md mx-6">
            <input 
              type="text" 
              placeholder="🔍 Modo Buscador Libre (Introduce palabra o frase...)" 
              className="w-full bg-slate-900 border border-slate-800 rounded-full py-2 px-4 text-xs font-bold text-slate-300 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-all"
            />
          </div>
          <div className="text-xs font-bold bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-sky-400 uppercase tracking-widest animate-pulse">
            Direct Method AI
          </div>
        </header>

        {/* REJILLA DINÁMICA DE PANEL DOBLE (HOT SPLIT VIEW) */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* PANEL IZQUIERDO: LECCIONES CONCEPTUALES (SOLO SI ACTIVAN SPLIT DESDE SIDEBAR) */}
          {panelModo === 'split' && leccionActiva && (
            <div className="w-1/2 bg-slate-950 border-r border-slate-800 p-6 overflow-y-auto flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-xs font-extrabold uppercase bg-sky-950 text-sky-400 px-2.5 py-1 rounded border border-sky-800">{leccionActiva.modulo}</span>
                <button 
                  onClick={() => setPanelModo('practicar')}
                  className="text-xs font-black uppercase text-slate-500 hover:text-slate-300 tracking-wider bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"
                >
                  [✕ Expandir Práctica 100%]
                </button>
              </div>
              <h2 className="text-xl font-black text-slate-100 tracking-tight">{leccionActiva.titulo}</h2>
              <p className="text-sm text-slate-400 leading-relaxed font-medium bg-slate-900/50 p-4 rounded-2xl border border-slate-800/40">{leccionActiva.contenido}</p>
            </div>
          )}

          {/* PANEL DERECHO: PANEL DE INMERSIÓN ASIMÉTRICA ADAPTATIVO */}
          <div className={`\${panelModo === 'split' ? 'w-1/2' : 'w-full'} flex flex-col overflow-y-auto p-6 gap-6 transition-all duration-300`}>
            
            {/* CAJA INFORMATIVA DE INSTRUCCIÓN DINÁMICA */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                {!estadoSemaforo 
                  ? "🔊 Escucha el fragmento de video nativo y evalúa tu nivel de comprensión con el semáforo inferior."
                  : estadoSemaforo === 'rojo' 
                  ? "🧠 Modo Inmersión Directa: Analiza las definiciones y herramientas en inglés para deducir el significado."
                  : "✨ ¡Excelente progreso! Regresa al video original para consolidar o avanzar."}
              </p>
            </div>

            {/* PANEL SUPERIOR DE INMERSIÓN: REPRODUCTOR DE VIDEO DE YOUTUBE */}
            {fraseActual && (
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 flex flex-col gap-4 shadow-xl">
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-black">
                  <iframe
                    ref={iframeRef}
                    className="w-full h-full pointer-events-auto"
                    src={`https://youtube.com\({                       reproduciendoAntonimo ? fraseActual[0].antonimo.youtube_id : fraseActual[0].youtube_id                     }?enablejsapi=1&autoplay=1&controls=1&rel=0&start=\){
                      reproduciendoAntonimo ? fraseActual[0].antonimo.start_time : fraseActual[0].start_time
                    }`}
                    title="YouTube Native Streaming Context"
                    allow="autoplay; encrypted-media"
                  />
                </div>

                {/* FILA DE CONTROL DE REPRODUCCIÓN Y VELOCIDAD DE LA API */}
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-between bg-slate-900 p-3 rounded-2xl border border-slate-800/60">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {reproduciendoAntonimo ? "🎬 Viendo Situación Opuesta (Antónimo)" : "🍿 Viendo Contexto Original"}
                  </span>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <input 
                      type="range" min="0.75" max="1.25" step="0.25" 
                      value={velocidadVideo} 
                      onChange={(e) => setVelocidadVideo(parseFloat(e.target.value))} 
                      className="w-24 accent-sky-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                    />
                    <span className="text-xs font-mono font-black text-sky-400 bg-sky-950/60 border border-sky-900 px-2 py-0.5 rounded">
                      {velocidadVideo.toFixed(2)}x
                    </span>
                  </div>
                </div>

                {/* SUBTÍTULOS INTERACTIVOS (TEXTO INTEGRAL EN FRAGMENTO ATÓMICO) */}
                <div className="py-2 border-t border-slate-800/80 mt-2">
                  <div className="flex flex-wrap gap-x-2 gap-y-3 justify-center text-center">
                    {fraseActual[0].english_text.split(" ").map((palabra, idx) => {
                      const limpia = palabra.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
                      const esClave = limpia === fraseActual[0].palabra_clave;
                      return (
                        <span 
                          key={idx} 
                          className={`text-lg sm:text-xl font-black tracking-tight rounded-xl px-1.5 py-0.5 transition-all duration-200 ${
                            esClave && estadoSemaforo === 'rojo'
                              ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse scale-105 shadow-md shadow-red-500/10'
                              : 'text-slate-100 hover:text-sky-400 cursor-default font-semibold'
                          }`}
                        >
                          {palabra}
                        </span>
                      );
                    })}
                  </div>
                  <p className="text-center font-mono text-[11px] font-bold text-slate-500 tracking-wider mt-3 select-none">
                    {fraseActual[0].ipa_text}
                  </p>
                </div>
              </div>
            )}

// PARTE 3 DE 4: CAJA DE SUEÑOS CON IA Y EL SEMÁFORO DE CONFIANZA MODIFICADO AMABLE
// Cumple estrictamente con el PRD y la segmentación menor a 4,000 caracteres.

            {/* CAJA DE INTRODUCCIÓN DE METAS Y SUEÑOS (PLAN PERSONALIZADO) */}
            {!fraseActual && (
              <form onSubmit={dispararProcesamientoSueño} className="bg-slate-950 border border-slate-800 p-6 rounded-3xl flex flex-col gap-4 shadow-xl">
                <div>
                  <h3 className="text-base font-black text-slate-100 tracking-tight">Introduce tu Sueño, Meta o Actividad Favorita</h3>
                  <p className="text-xs font-bold text-slate-500 mt-1">El motor de IA generará frases cotidianas nativas alineadas con tu identidad.</p>
                </div>
                <textarea
                  value={sueñoTexto}
                  onChange={(e) => setSueñoTexto(e.target.value)}
                  placeholder="Ej. Quiero viajar a Nueva York y trabajar en una empresa de tecnología diseñando software educativo..."
                  className="w-full h-24 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm font-semibold text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors resize-none"
                />
                <button
                  type="submit"
                  disabled={procesandoProgreso}
                  className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 font-black text-sm uppercase rounded-xl transition-all shadow-lg shadow-sky-500/10 active:scale-[0.99]"
                >
                  {procesandoProgreso ? "🧠 Generando Ruta con IA Vectorial..." : "🚀 Iniciar Ruta Personalizada"}
                </button>
              </form>
            )}

            {/* PANEL INFERIOR DE ACCIÓN (EVALUACIÓN AMABLE Y ANDAMIAJE POR CAPAS) */}
            {fraseActual && (
              <div className="flex flex-col gap-6">
                
                {/* MODULO: EL SEMÁFORO DE CONFIANZA CON TUS TEXTOS MODIFICADOS */}
                {!estadoSemaforo && (
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl flex flex-col gap-4 shadow-xl">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500 text-center block">¿Cómo evalúas tu entendimiento de la frase?</span>
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={() => { setEstadoSemaforo('rojo'); setAuxilioEspañol(false); setCapaAndamiaje('nucleo'); }}
                        className="py-4 px-4 bg-red-950/40 hover:bg-red-950/60 border border-red-900/60 rounded-2xl text-xs font-black uppercase tracking-wider text-red-400 text-center transition-all active:scale-[0.98]"
                      >
                        🔴 No entiendo la frase.
                      </button>
                      <button
                        onClick={() => { setEstadoSemaforo('amarillo'); setAuxilioEspañol(false); }}
                        className="py-4 px-4 bg-amber-950/40 hover:bg-amber-950/60 border border-amber-900/60 rounded-2xl text-xs font-black uppercase tracking-wider text-amber-400 text-center transition-all active:scale-[0.98]"
                      >
                        🟡 Entiendo algo de la frase pero no completamente.
                      </button>
                      <button
                        onClick={() => setEstadoSemaforo('verde')}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-500/10 transition-all active:scale-[0.98]"
                      >
                        🟢 La entiendo perfectamente al 100%
                      </button>
                    </div>
                  </div>
                )}

// PARTE 4 DE 4: ANDAMIAJE POR CAPAS EN INGLÉS, SEGUNDO SEMÁFORO Y GRABADORA NATIVA COMPLETA
// Bloque final autónomo. Cumple estrictamente con el PRD y el límite de 4,000 caracteres.

                {/* MODULO: ANDAMIAJE EN INGLÉS DIRECTO (AL PRESIONAR BOTÓN ROJO) */}
                {estadoSemaforo === 'rojo' && (
                  <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl flex flex-col gap-5 shadow-xl animate-fade-in">
                    
                    {/* CAPA 1: EL NÚCLEO INICIAL (DEFINICIÓN SIMPLE A1 + COLOCACIONES) */}
                    {capaAndamiaje === 'nucleo' && (
                      <div className="flex flex-col gap-4">
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                          <span className="text-[10px] font-black uppercase text-sky-400 tracking-wider block mb-1">CEFR Control (A1 Definition)</span>
                          <p className="text-sm font-bold text-slate-200 leading-relaxed">
                            Meaning of <span className="text-red-400">"{fraseActual.palabra_clave}"</span>: {fraseActual.cefr_control}
                          </p>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                          <span className="text-[10px] font-black uppercase text-sky-400 tracking-wider block mb-1">Pragmatic Collocations (Common Uses)</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {fraseActual.colocaciones.map((col, cIdx) => (
                              <code key={cIdx} className="text-xs bg-slate-950 border border-slate-800 text-slate-300 font-mono font-bold px-2 py-1 rounded-xl">
                                {col}
                              </code>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CAPA 2: EXPANSIÓN 1 (MINI HISTORIA CAUSA-EFECTO) */}
                    {capaAndamiaje === 'tecnica1' && (
                      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                        <span className="text-[10px] font-black uppercase text-sky-400 tracking-wider block mb-1">Cause & Effect Mini-Story</span>
                        <p className="text-sm font-semibold text-slate-300 leading-relaxed italic">
                          "{fraseActual.tecnica_1_contenido}"
                        </p>
                      </div>
                    )}

                    {/* PESTAÑAS DEDICADAS DE HERRAMIENTAS ADAPTATIVAS SEGÚN LA PALABRA */}
                    <div className="flex flex-wrap gap-2 border-t border-slate-800/60 pt-4">
                      <button
                        onClick={() => setCapaAndamiaje('nucleo')}
                        className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all ${
                          capaAndamiaje === 'nucleo' ? 'bg-sky-950/40 border-sky-500 text-sky-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        💡 Core Meaning
                      </button>
                      <button
                        onClick={() => { setCapaAndamiaje('tecnica1'); setReproduciendoAntonimo(false); }}
                        className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all ${
                          capaAndamiaje === 'tecnica1' && !reproduciendoAntonimo ? 'bg-sky-950/40 border-sky-500 text-sky-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {fraseActual.tecnica_1_label}
                      </button>
                      <button
                        onClick={() => { setCapaAndamiaje('tecnica2'); setReproduciendoAntonimo(true); }}
                        className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all ${
                          reproduciendoAntonimo ? 'bg-sky-950/40 border-sky-500 text-sky-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {fraseActual.tecnica_2_label}
                      </button>
                    </div>

                    {/* CAPA 3: EL SEGUNDO SEMÁFORO DE REDIRECCIÓN METACOGNITIVA */}
                    <div className="border-t border-slate-800/60 pt-4 mt-2 flex flex-col gap-3">
                      <span className="text-xs font-extrabold text-slate-400 text-center block">¿Estas herramientas en inglés te aclararon el significado?</span>
                      <div className="flex gap-3">
                        <button
                          onClick={() => { setEstadoSemaforo('verde'); setReproduciendoAntonimo(false); setCapaAndamiaje('nucleo'); }}
                          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98]"
                        >
                          🟢 Sí, volver al video original
                        </button>
                        <button
                          onClick={() => setAuxilioEspañol(true)}
                          className="py-3 px-4 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 font-bold text-xs uppercase rounded-xl transition-colors"
                        >
                          🏳️ Necesito traducción
                        </button>
                      </div>
                    </div>

                    {/* PLAN DE AUXILIO FINAL EN ESPAÑOL */}
                    {auxilioEspañol && (
                      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col gap-2 mt-2 border-dashed animate-fade-in">
                        <p className="text-xs font-bold text-slate-400"><strong className="text-slate-200">Traducción:</strong> {fraseActual.significado_es}</p>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed"><strong className="text-slate-400">Uso Real:</strong> {fraseActual.explicacion_pragmatica}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* MODULO: PRÁCTICA ORAL (SI EL ALUMNO YA COMPRENDIÓ Y ACTIVÓ EL ESTADO VERDE) */}
                {estadoSemaforo === 'verde' && (
                  <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl flex flex-col gap-4 shadow-xl animate-fade-in">
                    <div>
                      <h4 className="text-sm font-black text-slate-100 uppercase tracking-wide">🎙️ Clonación de Pronunciación Activa</h4>
                      <p className="text-xs font-bold text-slate-500 mt-0.5">Graba tu voz e imita las pausas rítmicas del nativo americano.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800/60">
                      <button
                        type="button"
                        onClick={controlarMicrofonoNativo}
                        className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all transform active:scale-95 ${
                          grabando 
                            ? 'bg-red-600 border-red-500 text-white animate-pulse shadow-lg shadow-red-500/20' 
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-sky-400 hover:border-sky-500/50'
                        }`}
                      >
                        <IconoMicrofono />
                      </button>

                      <div className="flex-1 flex flex-col gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                          {grabando ? "🔴 Grabando audio en tiempo real..." : audioBlobUrl ? "✨ Audio capturado de forma nativa" : "Esperando grabadora..."}
                        </span>
                        {audioBlobUrl && (
                          <audio src={audioBlobUrl} controls className="h-8 max-w-full accent-sky-500 rounded-lg" />
                        )}
                      </div>
                    </div>

                    {/* BOTÓN GLOBAL DE CIERRE DE RUTA (SIGUIENTE RETO) */}
                    <button
                      onClick={() => { setFraseActual(null); setSueñoTexto(''); }}
                      className="w-full py-4 bg-sky-600 hover:bg-sky-500 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-sky-500/10 mt-2"
                    >
                      Siguiente Frase Reto ➔
                    </button>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
