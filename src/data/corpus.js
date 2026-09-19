// Pieza 1 de 5: CORPUS DE DATOS RELACIONAL E INTERNACIONALIZABLE
// Guarda en: src/data/corpus.js (Longitud segura < 5500 caracteres)

export const DATASET_FRASES_VIDEO = [
  {
    id: "frase_01",
    youtube_id: "7OMThS-S8iI",
    start_time: 25,
    end_time: 30,
    english_text: "I am planning to move to New York soon to pursue my career goals.",
    ipa_text: "/aɪ æm ˈplænɪŋ tuː muːv tuː njuː jɔːrk suːn tuː pərˈsuː maɪ kəˈrɪr ɡoʊlz/",
    significado_es: "Planeo mudarme a Nueva York pronto para perseguir mis metas profesionales.",
    explicacion_pragmatica: "Se usa para expresar metas estructuradas en desarrollo. 'Move to' es el estándar casual nativo.",
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

export const LECCIONES_MOCK = [
  {
    id: "lec_1",
    modulo: "Módulo 1",
    titulo: "Chunks de Fluidez Instantánea",
    contenido: "Los americanos hablan en bloques de palabras. Memorizar 'I am planning to' elimina la necesidad de pensar en reglas gramaticales de forma mecánica."
  }
];
