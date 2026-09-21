import { NextResponse } from 'next/server';

interface SubtitleCue {
  text: string;
  start: number;
  duration: number;
}

// Búsqueda en YouTube con filtro CC
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
      if (candidateIds.length >= 4) break;
    }

    return candidateIds;
  } catch (err) {
    console.error('Error buscando candidatos en YouTube:', err);
    return [];
  }
}

// Descarga de subtítulos
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

// Comparación estricta con ventana deslizante
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

// Auxiliar para probar una cadena
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

// ENDPOINT PRINCIPAL: CASCADA DE 3 NIVELES
export async function POST(req: Request) {
  try {
    const { phrase, coreStructure, collocations } = await req.json();

    if (!phrase || typeof phrase !== 'string') {
      return NextResponse.json({ error: 'La frase es requerida' }, { status: 400 });
    }

    // ========================================================================
    // NIVEL 1: Probar frase original completa (Estructura base + final original)
    // Ej: "I want to build modern software"
    // ========================================================================
    const level1Match = await testPhraseCandidates(phrase);
    if (level1Match) {
      return NextResponse.json({
        found: true,
        matchType: 'exact_full',
        matchedPhrase: phrase,
        videoId: level1Match.videoId,
        startSeconds: level1Match.startSeconds,
        fullSpokenText: level1Match.fullSpokenText,
        highlightPhrase: phrase,
      });
    }

    // ========================================================================
    // NIVEL 2: Probar con los finales de las colocaciones en orden
    // Ej: "I want to build software", "I want to build a company"...
    // ========================================================================
    if (collocations && Array.isArray(collocations) && collocations.length > 0) {
      for (const colloc of collocations) {
        if (!colloc || typeof colloc !== 'string') continue;

        const level2Match = await testPhraseCandidates(colloc);
        if (level2Match) {
          return NextResponse.json({
            found: true,
            matchType: 'collocation_match',
            matchedPhrase: colloc,
            videoId: level2Match.videoId,
            startSeconds: level2Match.startSeconds,
            fullSpokenText: level2Match.fullSpokenText,
            highlightPhrase: colloc,
          });
        }
      }
    }

    // ========================================================================
    // NIVEL 3: Probar la ESTRUCTURA BÁSICA en solitario (Ancla acústica)
    // Ej: "I want to build"
    // ========================================================================
    const baseToSearch = coreStructure || phrase.split(' ').slice(0, 4).join(' ');
    if (baseToSearch && baseToSearch.trim().length > 3) {
      const level3Match = await testPhraseCandidates(baseToSearch);
      if (level3Match) {
        return NextResponse.json({
          found: true,
          matchType: 'core_structure_only',
          matchedPhrase: baseToSearch,
          videoId: level3Match.videoId,
          startSeconds: level3Match.startSeconds,
          fullSpokenText: level3Match.fullSpokenText,
          highlightPhrase: baseToSearch,
        });
      }
    }

    // ========================================================================
    // NIVEL 4: Cero coincidencias
    // ========================================================================
    return NextResponse.json({
      found: false,
      matchType: 'none',
      message: 'No se encontró ninguna coincidencia en video para esta frase, colocaciones ni estructura base.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}