import React, { useState } from 'react';

// 1. Estilos pedagógicos configurados para el aprendizaje de idiomas
const STYLES = [
  { id: 'coloquial', label: 'Coloquial / Cotidiano', desc: 'Cercano, amigable y natural, de tú a tú.' },
  { id: 'academica', label: 'Académico / Formal', desc: 'Formal, riguroso y en tercera persona.' },
  { id: 'infantil', label: 'Infantil / Lúdico', desc: 'Alegre, tierno y entusiasta.' },
  { id: 'poetica', label: 'Poético / Expresivo', desc: 'Lírico, sensible y evocador.' },
  { id: 'tecnica', label: 'Técnico / Pragmático', desc: 'Directo y orientado a objetivos.' },
  { id: 'cultural', label: 'Cultural / Global', desc: 'Centrado en tradiciones y contexto mundial.' }
];

export default function MetasEstudiante() {
  // Estados del componente
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || '');
  const [text, setText] = useState('');
  const [style, setStyle] = useState('coloquial');
  const [length, setLength] = useState('normal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{
    paragraphSummary: string;
    bulletPhrases: string[];
    keyKeywords?: string[];
  } | null>(null);
  const [copiedFormat, setCopiedFormat] = useState('');

  // Llamada a la API de Gemini
  const handleGenerate = async () => {
    if (!apiKey.trim()) {
      setError('Por favor ingresa tu Gemini API Key de Google AI Studio.');
      return;
    }
    if (!text.trim() || text.trim().length < 15) {
      setError('Escribe al menos una oración completa sobre tus metas.');
      return;
    }

    setLoading(true);
    setError('');

    const prompt = `Eres un asistente pedagógico para una plataforma de aprendizaje de idiomas.
El estudiante escribió sobre sus metas, sueños e intereses personales:
"""${text}"""

Genera el resumen de sus metas con el estilo "${style.toUpperCase()}" y longitud "${length.toUpperCase()}".
Debes responder SIEMPRE en dos formatos:
1. "paragraphSummary": Un resumen fluido en forma de párrafo continuo.
2. "bulletPhrases": Lista de 3 a 5 frases cortas y memorables ideales para tarjetas de diálogo y práctica oral.
3. "keyKeywords": 3 a 5 palabras clave identificadas.

Responde ÚNICAMENTE un objeto JSON válido con este esquema:
{
  "paragraphSummary": "...",
  "bulletPhrases": ["frase 1", "frase 2", "frase 3"],
  "keyKeywords": ["palabra 1", "palabra 2", "palabra 3"]
}`;

    try {
      // Usamos el modelo ultra rápido y económico de Gemini
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey.trim()}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7
          }
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || 'Error en la respuesta de Gemini');
      }

      const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(rawJson);
      setResult(parsed);
    } catch (err: any) {
      setError(err.message || 'Error al comunicarse con Gemini.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (content: string, formatName: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFormat(formatName);
    setTimeout(() => setCopiedFormat(''), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 font-sans text-stone-900">
      {/* Encabezado */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          Plataforma Educativa de Idiomas
        </span>
        <h1 className="text-2xl font-bold mt-2">Paso 1: Resumen de Metas del Estudiante</h1>
        <p className="text-stone-600 text-sm mt-1">
          Obtén el resumen pedagógico en dos formatos simultáneos: Párrafo continuo y Lista de frases cortas.
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
            Tu Gemini API Key (de Google AI Studio)
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Pega tu clave AIzaSy..."
            className="w-full border border-stone-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            ¿Cuáles son tus metas, sueños, gustos o pasatiempos?
          </label>
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ejemplo: Mi meta es ser bilingüe para trabajar en proyectos internacionales de conservación ambiental..."
            className="w-full border border-stone-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Selectores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Longitud</label>
            <select
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full border border-stone-300 rounded-lg p-2.5 text-sm bg-white"
            >
              <option value="normal">Normal (4 a 6 oraciones)</option>
              <option value="corto">Corto (2 a 3 oraciones concisas)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Estilo Pedagógico</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full border border-stone-300 rounded-lg p-2.5 text-sm bg-white"
            >
              {STYLES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition shadow-sm cursor-pointer"
        >
          {loading ? 'Generando resumen pedagógico...' : 'Generar Resumen de Metas'}
        </button>
      </div>

      {/* Resultados en los dos formatos */}
      {result && (
        <div className="space-y-4">
          {/* Formato 1: Párrafo continuo */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-base">Formato 1: Párrafo Continuo</h3>
              <button
                type="button"
                onClick={() => copyToClipboard(result.paragraphSummary, 'párrafo')}
                className="text-xs bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg font-medium text-stone-700 cursor-pointer"
              >
                {copiedFormat === 'párrafo' ? '¡Copiado!' : 'Copiar párrafo'}
              </button>
            </div>
            <p className="text-stone-800 text-sm leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-200">
              {result.paragraphSummary}
            </p>
          </div>

          {/* Formato 2: Lista de frases cortas */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-base">Formato 2: Lista de Frases Cortas</h3>
              <button
                type="button"
                onClick={() => copyToClipboard(result.bulletPhrases.join('\n'), 'frases')}
                className="text-xs bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg font-medium text-stone-700 cursor-pointer"
              >
                {copiedFormat === 'frases' ? '¡Copiado!' : 'Copiar frases'}
              </button>
            </div>
            <div className="space-y-2">
              {result.bulletPhrases?.map((phrase, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200 text-sm">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-stone-800">{phrase}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}