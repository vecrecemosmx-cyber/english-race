import { NextResponse } from 'next/server';

interface SubtitleCue {
  text: string;
  start: number;
  duration: number;
}

// 1. Búsqueda dinámica en TODO YouTube con filtro de subtítulos oficiales (CC)
async function searchYouTubeCandidateVideos(phrase: string): Promise<string[]> {
  try {
    // El parámetro sp=EgIoAQ%253D%253D obliga a YouTube a mostrar únicamente videos con subtítulos/Closed Captions
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      `"${phrase}"`
    )}&sp=EgIoAQ%253D%253D`;

    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 300 }, // Caché de 5 min para optimizar peticiones
    });

    const html = await res.text();

    // Extraemos los IDs de video del objeto ytInitialData embebido en el HTML
    const videoIdMatches = html.matchAll(/\/watch\?v=([a-zA-Z0-9_-]{11})/g);
    const candidateIds: string[] = [];

    for (const match of videoIdMatches) {
      const id = match[1];
      if (!candidateIds.includes(id)) {
        candidateIds.push(id);
      }
      if (candidateIds.length >= 8) break; // Tomamos los 8 primeros resultados más relevantes
    }

    return candidateIds;
  } catch (err) {
    console.error('Error buscando candidatos en YouTube:', err);
    return [];
  }
}

// 2. Extracción de subtítulos oficiales en inglés de un video específico
async function fetchVideoSubtitles(videoId: string): Promise<SubtitleCue[]> {
  try {
    const videoPageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    const html = await videoPageRes.text();

    const captionsMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
    if (!captionsMatch) return [];

    const captionTracks = JSON.parse(captionsMatch[1]);
    // Priorizamos inglés (en, en-US)
    const englishTrack = captionTracks.find(
      (t: any) => t.languageCode === 'en' || t.vssId?.includes('.en')
    );
    if (!englishTrack?.baseUrl) return [];

    const transcriptRes = await fetch(englishTrack.baseUrl);
    const xmlText = await transcriptRes.text();

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
    return [];
  }
}

// 3. Algoritmo de coincidencia léxica: Ventana deslizante para capturar la frase completa
function findExactPhraseInCues(cues: SubtitleCue[], targetPhrase: string) {
  const cleanTarget = targetPhrase
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();

  if (!cleanTarget) return null;

  for (let i = 0; i < cues.length; i++) {
    // Unimos de 1 a 4 subtítulos contiguos para detectar frases largas que abarcan varios fragmentos
    const windowCues = cues.slice(i, i + 4);
    const combinedSpoken = windowCues.map((c) => c.text).join(' ');
    const cleanCombined = combinedSpoken
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim();

    // Verificación de coincidencia exacta de la frase hablada
    if (cleanCombined.includes(cleanTarget)) {
      return {
        startSeconds: Math.max(0, Math.floor(windowCues[0].start)),
        fullSpokenText: combinedSpoken,
        highlightPhrase: targetPhrase,
      };
    }
  }

  return null;
}

// Función orquestadora: Busca dinámicamente hasta dar con el primer resultado coincidente
async function processDynamicSearch(phrase: string) {
  const candidateIds = await searchYouTubeCandidateVideos(phrase);

  if (candidateIds.length === 0) {
    return {
      found: false,
      message: 'No se encontraron videos con subtítulos para esta búsqueda en YouTube.',
    };
  }

  // Inspeccionamos los candidatos en orden de relevancia devuelto por YouTube
  for (const videoId of candidateIds) {
    const cues = await fetchVideoSubtitles(videoId);
    if (cues.length === 0) continue;

    const match = findExactPhraseInCues(cues, phrase);
    if (match) {
      return {
        found: true,
        videoId: videoId,
        startSeconds: match.startSeconds,
        fullSpokenText: match.fullSpokenText,
        highlightPhrase: match.highlightPhrase,
        youtubeUrl: `https://www.youtube.com/watch?v=${videoId}&t=${match.startSeconds}s`,
      };
    }
  }

  return {
    found: false,
    message: `Se analizaron ${candidateIds.length} videos de YouTube pero ninguno contenía la frase hablada exacta.`,
  };
}

// Soporte para método POST
export async function POST(req: Request) {
  try {
    const { phrase } = await req.json();
    if (!phrase || typeof phrase !== 'string') {
      return NextResponse.json({ error: 'La frase es requerida' }, { status: 400 });
    }

    const result = await processDynamicSearch(phrase);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Soporte para método GET (Para pruebas directas en el navegador)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phrase = searchParams.get('phrase');

  if (!phrase) {
    return NextResponse.json({
      error: 'Parámetro ?phrase= es requerido. Ejemplo: /api/video-search?phrase=I want to build software',
    });
  }

  const result = await processDynamicSearch(phrase);
  return NextResponse.json(result);
}