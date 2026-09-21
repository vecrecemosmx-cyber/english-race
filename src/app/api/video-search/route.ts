import { NextResponse } from 'next/server';

interface SubtitleCue {
  text: string;
  start: number;
  duration: number;
}

// 1. Búsqueda en YouTube filtrando solo videos con subtítulos/Closed Captions (CC)
async function searchYouTubeCandidateVideos(phrase: string): Promise<string[]> {
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      `"${phrase}"`
    )}&sp=EgIoAQ%253D%253D`;

    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 300 },
    });

    const html = await res.text();
    const videoIdMatches = html.matchAll(/\/watch\?v=([a-zA-Z0-9_-]{11})/g);
    const candidateIds: string[] = [];

    for (const match of videoIdMatches) {
      const id = match[1];
      if (!candidateIds.includes(id)) {
        candidateIds.push(id);
      }
      if (candidateIds.length >= 4) break; // Límite de candidatos para mantener hipervelocidad
    }

    return candidateIds;
  } catch (err) {
    console.error('Error buscando candidatos en YouTube:', err);
    return [];
  }
}

// 2. Descarga de subtítulos oficiales en inglés
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

// 3. Algoritmo de coincidencia estricta (Ventana de subtítulos)
function findExactPhraseInCues(cues: SubtitleCue[], targetPhrase: string) {
  const cleanTarget = targetPhrase
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();

  if (!cleanTarget) return null;

  for (let i = 0; i < cues.length; i++) {
    const windowCues = cues.slice(i, i + 4);
    const combinedSpoken = windowCues.map((c) => c.text).join(' ');
    const cleanCombined = combinedSpoken
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim();

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

// Función auxiliar para inspeccionar una lista de candidatos
async function testPhraseCandidates(phraseToSearch: string) {
  const candidateIds = await searchYouTubeCandidateVideos(phraseToSearch);
  for (const videoId of candidateIds) {
    const cues = await fetchVideoSubtitles(videoId);
    if (cues.length === 0) continue;

    const match = findExactPhraseInCues(cues, phraseToSearch);
    if (match) {
      return {
        videoId,
        startSeconds: match.startSeconds,
        fullSpokenText: match.fullSpokenText,
        highlightPhrase: match.highlightPhrase,
      };
    }
  }
  return null;
}

// ENDPOINT PRINCIPAL: Cascada (Frase principal -> Colocaciones una por una -> Cero resultados)
export async function POST(req: Request) {
  try {
    const { phrase, collocations } = await req.json();

    if (!phrase || typeof phrase !== 'string') {
      return NextResponse.json({ error: 'La frase es requerida' }, { status: 400 });
    }

    // PASO 1: Intentar con la Frase Principal
    const exactMatch = await testPhraseCandidates(phrase);
    if (exactMatch) {
      return NextResponse.json({
        found: true,
        matchType: 'exact_phrase',
        matchedPhrase: phrase,
        videoId: exactMatch.videoId,
        startSeconds: exactMatch.startSeconds,
        fullSpokenText: exactMatch.fullSpokenText,
        highlightPhrase: phrase,
      });
    }

    // PASO 2: Cascada por cada una de las Colocaciones en orden
    if (collocations && Array.isArray(collocations) && collocations.length > 0) {
      for (const colloc of collocations) {
        if (!colloc || typeof colloc !== 'string') continue;

        const collocMatch = await testPhraseCandidates(colloc);
        if (collocMatch) {
          // ESTADO B: Encontrada en una colocación similar
          return NextResponse.json({
            found: true,
            matchType: 'collocation_match',
            matchedPhrase: colloc,
            videoId: collocMatch.videoId,
            startSeconds: collocMatch.startSeconds,
            fullSpokenText: collocMatch.fullSpokenText,
            highlightPhrase: colloc,
          });
        }
      }
    }

    // PASO 3: ESTADO C — Ninguna coincidencia
    return NextResponse.json({
      found: false,
      matchType: 'none',
      message: 'No se encontró ninguna coincidencia en video para esta frase ni para sus colocaciones.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}