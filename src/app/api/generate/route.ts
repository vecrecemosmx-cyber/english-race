import { NextResponse } from 'next/server';

// Modelos en orden jerárquico de respaldo (100% gratuitos)
const FALLBACK_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
];

interface SubtitleCue {
  text: string;
  start: number;
  duration: number;
}

// 1. Búsqueda en YouTube en vivo con filtro de subtítulos en inglés
async function searchYouTubeCandidateVideos(query: string): Promise<string[]> {
  try {
    // Parámetro sp=EgIoAQ%253D%253D fuerza el filtro de subtítulos (Closed Captions)
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' english')}&sp=EgIoAQ%253D%253D`;

    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
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

// 2. Descarga y parseo de subtítulos de un video específico
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
    console.warn(`Error al extraer subtítulos de video ${videoId}:`, error);
    return [];
  }
}

// 3. Cosecha continua de 250 a 280 palabras buscando en los candidatos
async function harvest250to280WordsFromYouTube(passionQuery: string) {
  console.log(`\n🔍 Buscando videos en YouTube en vivo para pasión: "${passionQuery}"...`);
  const candidateIds = await searchYouTubeCandidateVideos(passionQuery);

  if (candidateIds.length === 0) {
    console.warn('No se encontraron IDs de videos en YouTube.');
    return null;
  }

  // Iteramos sobre los candidatos hasta encontrar uno con subtítulos válidos
  for (let i = 0; i < candidateIds.length; i++) {
    const videoId = candidateIds[i];
    console.log(`  ➔ Probando candidato [${i + 1}/${candidateIds.length}]: ${videoId}...`);

    const cues = await fetchVideoSubtitles(videoId);
    if (cues.length === 0) continue;

    // Acumular palabras consecutivas
    let accumulatedWords: string[] = [];
    // Iniciamos en cue 1 o 2 para evitar introducciones mudas si hay suficientes cues
    const startIndex = cues.length > 5 ? 2 : 0;
    const startSeconds = Math.max(0, Math.floor(cues[startIndex].start));
    let endSeconds = startSeconds;

    for (let c = startIndex; c < cues.length; c++) {
      const cue = cues[c];
      const wordsInCue = (cue.text || '').trim().split(/\s+/).filter(Boolean);
      accumulatedWords.push(...wordsInCue);
      endSeconds = Math.floor(cue.start + cue.duration);

      if (accumulatedWords.length >= 250) {
        if (accumulatedWords.length > 280) {
          accumulatedWords = accumulatedWords.slice(0, 275);
        }
        break;
      }
    }

    if (accumulatedWords.length >= 150) { // Si logramos una masa crítica de palabras
      console.log(`✓ ¡Éxito en YouTube! Cosechadas ${accumulatedWords.length} palabras del video https://youtube.com/watch?v=${videoId} (${startSeconds}s a ${endSeconds}s)`);
      return {
        videoId,
        startSeconds,
        endSeconds,
        wordCount: accumulatedWords.length,
        rawTranscriptText: accumulatedWords.join(' '),
      };
    }
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'El texto de meta/pasión es requerido' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Falta la variable GEMINI_API_KEY en las variables de entorno' },
        { status: 500 }
      );
    }

    // 1. Cosechar directamente de YouTube en vivo
    const youtubeSegment = await harvest250to280WordsFromYouTube(text);

    const sourceContextText = youtubeSegment?.rawTranscriptText
      ? `TRANSCRIPCIÓN REAL DE YOUTUBE (${youtubeSegment.wordCount} PALABRAS COSECHADAS EN VIVO):\n"${youtubeSegment.rawTranscriptText}"`
      : `TEXTO BASE DEL ESTUDIANTE:\n"${text}"`;

    // 2. Prompt con el Filtro Lingüístico Estricto (Sin tecnicismos, sin jerga, sin metáforas)
    const systemPrompt = `
You are an expert American English pedagogue and linguist specialized in teaching native Spanish speakers.
The student has shared their dreams/passions: "${text}".
Here is the authentic spoken audio segment directly from YouTube (${youtubeSegment?.wordCount || 260} words):
${sourceContextText}

PEDAGOGICAL & LINGUISTIC RULES (MANDATORY):
1. PLAIN ENGLISH FILTER:
   - Rewrite and summarize what was heard in the video segment using STRICTLY simple, clear, everyday General American English.
   - ABSOLUTELY NO technical jargon or domain-specific complexity.
   - ABSOLUTELY NO slang, confusing colloquialisms, or abstract concepts.
   - ABSOLUTELY NO metaphors or idioms. The meaning must be 100% transparent and literal.
2. FORMATS:
   - "summaryParagraph": A continuous paragraph of 2-3 sentences summarizing the spoken segment in simple plain English.
   - "sentences": Break down the summary into short, simple action sentences for line-by-line study.
3. FOR EACH SENTENCE in "sentences":
   - "id": "phrase_1", "phrase_2", etc.
   - "text": Complete sentence in simple American English.
   - "coreStructure": The anchor lexical frame / fixed [Subject + Verb/Action] base (e.g. "I want to build", "You need to learn").
   - "targetComplement": The specific ending slot of the sentence (e.g. "good projects", "new tools").
   - "ipa": Accurate General American phonetics in IPA format (e.g. "/aɪ wɑːnt tuː bɪld gʊd ˈprɑːdʒɛkts/").
   - "cefrDefinition": Simplified explanation in English ONLY using exclusively basic A1-A2 vocabulary (no Spanish).
   - "collocations": Exactly 5 substitution pattern frames keeping the [Subject + Verb] base intact and varying only the ending with simple everyday words.
   - "layer2":
     - "keyword": core verb or adjective.
     - "partOfSpeech": "verb", "adjective", etc.
     - "semanticCategory": "physical_action_or_creation", "gradable_adjective_adverb", "derived_complex_word", or "noun_object_or_role".
     - "primaryTechnique": {"type": "sensory_mini_story", "title": "Action in Context (Mental Image)", "content": "Vivid sensory description in simple English..."}.
     - "secondaryTechnique": {"type": "opposite_trigger", "title": "Opposite Situation (Contrast)", "oppositeWord": "the true antonym", "contrastPhrases": ["Contrast sentence 1 in plain English.", "Contrast sentence 2."]}.
     - "youtubeContextQuery": Natural query to find this spoken.

Return ONLY the raw JSON object, without markdown formatting.
`;

    let parsedData: any = null;
    let lastErrorDetails: string = '';

    // 3. Cascada de modelos Gemini tolerante a saturación 503
    for (const model of FALLBACK_MODELS) {
      try {
        console.log(`Llamando a modelo: ${model}...`);
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
        });

        if (!geminiRes.ok) {
          const errText = await geminiRes.text();
          console.warn(`⚠️ Modelo ${model} no disponible (HTTP ${geminiRes.status}).`);
          lastErrorDetails = errText;
          continue;
        }

        const geminiData = await geminiRes.json();
        const rawContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (rawContent) {
          parsedData = JSON.parse(rawContent);
          console.log(`✓ Generación exitosa con: ${model}`);
          break;
        }
      } catch (err: any) {
        console.warn(`⚠️ Excepción con ${model}:`, err.message);
        lastErrorDetails = err.message;
      }
    }

    if (!parsedData) {
      return NextResponse.json(
        { error: 'Ningún modelo de Gemini estuvo disponible temporalmente.', details: lastErrorDetails },
        { status: 502 }
      );
    }

    return NextResponse.json({
      userInputOriginal: text,
      summaryParagraph: parsedData.summaryParagraph,
      sentences: parsedData.sentences,
      videoSegment: youtubeSegment ? {
        videoId: youtubeSegment.videoId,
        startSeconds: youtubeSegment.startSeconds,
        endSeconds: youtubeSegment.endSeconds,
        wordCount: youtubeSegment.wordCount,
        rawTranscript: youtubeSegment.rawTranscriptText,
      } : null,
    });

  } catch (error: any) {
    console.error('Error general en /api/generate:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}