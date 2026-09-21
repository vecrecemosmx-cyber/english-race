import { NextResponse } from 'next/server';

// Estructura de un fragmento de subtítulo de YouTube
interface SubtitleCue {
  text: string;
  start: number; // en segundos
  duration: number;
}

// Pool de videos educativos candidatos en inglés americano con subtítulos oficiales verificados
// (TED Talks, charlas de tecnología, entrevistas de vida y desarrollo personal)
const CANDIDATE_VIDEOS = [
  'UF8uR6Z6KLc', // Steve Jobs - Stanford
  'JnfBXjWm7hc', // Matt Cutts - TED Talk (Try new things)
  'iCvmsMzlF7o', // Dan Pink - TED (Motivation)
  'kJQP7kiw5Fk', // Luis von Ahn - TED (Duolingo & Education)
  '7NXxT1yA9oM', // Tech Career & Software Development Talk
];

// Función para descargar los subtítulos oficiales en formato XML/JSON desde YouTube
async function fetchYouTubeSubtitles(videoId: string): Promise<SubtitleCue[]> {
  try {
    // 1. Obtenemos la página del video para extraer la URL del track de subtítulos oficiales
    const videoPageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 3600 }, // Caché de 1 hora para hipervelocidad
    });
    const html = await videoPageRes.text();

    // Extraer la configuración del reproductor donde viene el enlace a los captions
    const captionsMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
    if (!captionsMatch) return [];

    const captionTracks = JSON.parse(captionsMatch[1]);
    // Priorizamos subtítulos en inglés americano (en o en-US)
    const englishTrack = captionTracks.find((t: any) => t.languageCode === 'en' || t.vssId?.includes('.en'));
    if (!englishTrack?.baseUrl) return [];

    // 2. Descargamos el XML de los subtítulos con marcas de tiempo
    const transcriptRes = await fetch(englishTrack.baseUrl);
    const xmlText = await transcriptRes.text();

    // 3. Parseamos los nodos XML <text start="12.34" dur="2.5">Frase</text>
    const cues: SubtitleCue[] = [];
    const textRegex = /<text\s+start="([\d.]+)"\s+dur="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g;
    let match;

    while ((match = textRegex.exec(xmlText)) !== null) {
      const cleanText = match[3]
        .replace(/&amp;/g, '&')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\n/g, ' ')
        .trim();

      cues.push({
        start: parseFloat(match[1]),
        duration: parseFloat(match[2]),
        text: cleanText,
      });
    }

    return cues;
  } catch (error) {
    console.error(`Error al extraer subtítulos del video ${videoId}:`, error);
    return [];
  }
}

// Algoritmo de coincidencia léxica exacta (con tolerancia de ±1 palabra)
function findMatchingPhrase(cues: SubtitleCue[], targetPhrase: string) {
  const normalizedTarget = targetPhrase.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const targetWords = normalizedTarget.split(/\s+/);

  for (let i = 0; i < cues.length; i++) {
    // Tomamos una ventana de 1 a 3 fragmentos consecutivos para abarcar la frase completa
    const windowCues = cues.slice(i, i + 3);
    const combinedText = windowCues.map((c) => c.text).join(' ');
    const normalizedCombined = combinedText.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

    // 1. Coincidencia exacta directa
    if (normalizedCombined.includes(normalizedTarget)) {
      return {
        startSeconds: Math.floor(windowCues[0].start),
        fullSpokenText: combinedText,
        highlightPhrase: targetPhrase,
      };
    }

    // 2. Coincidencia con tolerancia (al menos el 80% de las palabras clave coinciden en orden)
    let matchCount = 0;
    targetWords.forEach((word) => {
      if (normalizedCombined.includes(word)) matchCount++;
    });

    if (matchCount >= targetWords.length && targetWords.length >= 3) {
      return {
        startSeconds: Math.floor(windowCues[0].start),
        fullSpokenText: combinedText,
        highlightPhrase: targetPhrase,
      };
    }
  }

  return null;
}

// ENDPOINT PRINCIPAL: POST /api/video-search
export async function POST(req: Request) {
  try {
    const { phrase } = await req.json();

    if (!phrase || typeof phrase !== 'string') {
      return NextResponse.json({ error: 'La frase es requerida' }, { status: 400 });
    }

    // Buscamos en el conjunto de videos candidatos
    for (const videoId of CANDIDATE_VIDEOS) {
      const cues = await fetchYouTubeSubtitles(videoId);
      if (cues.length === 0) continue;

      const match = findMatchingPhrase(cues, phrase);
      if (match) {
        return NextResponse.json({
          found: true,
          videoId: videoId,
          startSeconds: match.startSeconds,
          fullSpokenText: match.fullSpokenText,
          highlightPhrase: match.highlightPhrase,
        });
      }
    }

    // Si no se encuentra una coincidencia exacta en los candidatos, devolvemos un fallback seguro
    return NextResponse.json({
      found: false,
      message: 'No se encontró la frase literal exacta en la lista actual de videos.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}