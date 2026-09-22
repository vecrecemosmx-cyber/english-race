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

// Lista ultrarrápida de Stopwords (Español e Inglés) para purgar palabras vacías
const STOPWORDS = new Set([
  'cuando', 'estaba', 'porque', 'entonces', 'habia', 'había', 'como', 'pero', 'para',
  'este', 'esta', 'estos', 'estas', 'aquel', 'aquella', 'mi', 'mis', 'tu', 'tus',
  'su', 'sus', 'nuestro', 'nuestra', 'que', 'los', 'las', 'del', 'por', 'con',
  'sin', 'sobre', 'tras', 'hacia', 'desde', 'hasta', 'para', 'segun', 'según',
  'entre', 'donde', 'dónde', 'quien', 'quién', 'cual', 'cuál', 'algo', 'nada',
  'mucho', 'poco', 'todo', 'toda', 'todos', 'todas', 'cada', 'otro', 'otra',
  'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'a', 'an', 'is',
  'was', 'were', 'be', 'been', 'have', 'had', 'has', 'do', 'did', 'does', 'can',
  'could', 'will', 'would', 'should', 'my', 'your', 'our', 'their', 'his', 'her',
  'its', 'it', 'they', 'we', 'you', 'i', 'me', 'him', 'us', 'them', 'about',
  'after', 'all', 'also', 'any', 'because', 'but', 'by', 'from', 'here', 'how',
  'if', 'into', 'just', 'like', 'many', 'more', 'most', 'much', 'no', 'not',
  'now', 'only', 'other', 'out', 'over', 'some', 'such', 'than', 'that', 'then',
  'there', 'these', 'this', 'those', 'through', 'time', 'very', 'what', 'when',
  'where', 'which', 'while', 'who', 'why'
]);

// 1. EXTRACTOR SEMÁNTICO HIPERVELOZ (< 2 ms)
function extractCoreKeywordsFromStory(story: string): string {
  const words = story
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'¡!¿\n\r]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOPWORDS.has(w));

  if (words.length === 0) return 'inspiration life goals';

  // Contar frecuencia de palabras relevantes
  const frequencyMap: { [word: string]: number } = {};
  for (const word of words) {
    frequencyMap[word] = (frequencyMap[word] || 0) + 1;
  }

  // Ordenar por mayor frecuencia y seleccionar las 2 o 3 principales
  const topKeywords = Object.entries(frequencyMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => entry[0]);

  return topKeywords.join(' ');
}

// 2. BÚSQUEDA PÚBLICA EN YOUTUBE CON FILTRO CC
async function searchYouTubeCandidateVideos(query: string): Promise<string[]> {
  try {
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
      if (candidateIds.length >= 3) break; // Tomamos los 3 primeros para paralelismo
    }

    return candidateIds;
  } catch (err) {
    console.error('Error buscando candidatos en YouTube:', err);
    return [];
  }
}

// 3. DESCARGA DE SUBTÍTULOS DE UN VIDEO ESPECÍFICO
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
  } catch {
    return [];
  }
}

// Procesa una lista de cues para armar el bloque de 250 a 280 palabras
function extractSliceFromCues(videoId: string, cues: SubtitleCue[]) {
  if (!cues || cues.length === 0) return null;

  let accumulatedWords: string[] = [];
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

  if (accumulatedWords.length < 120) return null;

  return {
    videoId,
    startSeconds,
    endSeconds,
    wordCount: accumulatedWords.length,
    rawTranscriptText: accumulatedWords.join(' '),
  };
}

// 4. COSECHADOR CONCURRENTE EN PARALELO
async function harvestConcurrently(searchQuery: string) {
  const candidateIds = await searchYouTubeCandidateVideos(searchQuery);
  if (candidateIds.length === 0) return null;

  // Consultamos los 3 candidatos simultáneamente en paralelo
  const subtitlePromises = candidateIds.map(async (id) => {
    const cues = await fetchVideoSubtitles(id);
    return extractSliceFromCues(id, cues);
  });

  const results = await Promise.allSettled(subtitlePromises);

  // Retornamos el primer candidato exitoso
  for (const res of results) {
    if (res.status === 'fulfilled' && res.value !== null) {
      return res.value;
    }
  }

  return null;
}

export async function POST(req: Request) {
  const t0 = performance.now();
  console.log(`\n==================================================`);
  console.log(`⚡ INICIANDO PIPELINE HIPERVELOZ DE CONTENIDO`);

  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'El texto es requerido' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Falta la variable GEMINI_API_KEY en las variables de entorno' },
        { status: 500 }
      );
    }

    // PASO 1: Extracción semántica instantánea (< 2ms)
    const tExtractStart = performance.now();
    const searchKeywords = extractCoreKeywordsFromStory(text);
    const tExtractEnd = performance.now();
    console.log(`⏱️ [Paso 1] Extracción temática de la historia: ${(tExtractEnd - tExtractStart).toFixed(2)} ms`);
    console.log(`   ➔ Ideas centrales identificadas: "${searchKeywords}"`);

    // PASO 2: Cosecha concurrente en YouTube
    const tYoutubeStart = performance.now();
    const youtubeSegment = await harvestConcurrently(searchKeywords);
    const tYoutubeEnd = performance.now();
    console.log(`⏱️ [Paso 2] Cosecha concurrente en YouTube: ${(tYoutubeEnd - tYoutubeStart).toFixed(2)} ms`);

    if (youtubeSegment) {
      console.log(`   ➔ Video localizado: https://youtube.com/watch?v=${youtubeSegment.videoId} (${youtubeSegment.wordCount} palabras)`);
    } else {
      console.warn(`   ⚠️ YouTube no devolvió subtítulos inmediatos. Continuando con el texto del alumno.`);
    }

    const sourceContextText = youtubeSegment?.rawTranscriptText
      ? `TRANSCRIPCIÓN REAL DE YOUTUBE (${youtubeSegment.wordCount} PALABRAS COSECHADAS):\n"${youtubeSegment.rawTranscriptText}"`
      : `TEXTO BASE DEL ESTUDIANTE:\n"${text}"`;

    // PASO 3: Generación pedagógica estructurada con Gemini
    const tGeminiStart = performance.now();
    const systemPrompt = `
You are an expert American English pedagogue and linguist specialized in teaching native Spanish speakers.
The student has shared their personal story/passions: "${text}".
Here is the authentic spoken audio segment from a related native YouTube video (${youtubeSegment?.wordCount || 260} words):
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

    for (const model of FALLBACK_MODELS) {
      try {
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
          lastErrorDetails = errText;
          continue;
        }

        const geminiData = await geminiRes.json();
        const rawContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (rawContent) {
          parsedData = JSON.parse(rawContent);
          break;
        }
      } catch (err: any) {
        lastErrorDetails = err.message;
      }
    }

    const tGeminiEnd = performance.now();
    console.log(`⏱️ [Paso 3] Generación pedagógica estructurada (Gemini): ${(tGeminiEnd - tGeminiStart).toFixed(2)} ms`);

    const tTotal = performance.now();
    console.log(`==================================================`);
    console.log(`🚀 TIEMPO TOTAL DE RESPUESTA: ${((tTotal - t0) / 1000).toFixed(2)} segundos`);
    console.log(`==================================================\n`);

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