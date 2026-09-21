export type SummaryType = 'normal' | 'short';

export type SemanticCategory = 
  | 'gradable_adjective_adverb'
  | 'derived_complex_word'
  | 'physical_action_or_creation'
  | 'physical_action_or_sound'
  | 'noun_object_or_role';

export interface BaseTechnique {
  type: string;
  title: string;
  content: string;
  scaleLevels?: { level: string; example: string }[];
  morphology?: { prefix?: string; root: string; suffix?: string; meaning: string };
}

export interface OppositeTrigger {
  type: 'opposite_trigger';
  title: string;
  oppositeWord: string;
  contrastPhrases: string[];
}

export interface VideoContextData {
  videoId: string;
  startSeconds: number;
  endSeconds?: number;
  targetPhrase: string;
  contextNote?: string;
}

export interface Layer2Data {
  keyword: string;
  partOfSpeech: string;
  semanticCategory: SemanticCategory;
  primaryTechnique: BaseTechnique;
  secondaryTechnique: OppositeTrigger;
  youtubeContextQuery: string;
  videoContext?: VideoContextData; // Configuración estilo YouGlish
}

export interface SentenceItem {
  id: string;
  text: string;
  ipa: string;
  cefrDefinition: string;
  collocations: string[]; // Marcos de sustitución [Sujeto + Acción + Variación]
  layer2: Layer2Data;
}

export interface EducationalContentResponse {
  userInputOriginal: string;
  summaryType: SummaryType;
  summaryParagraph: string;
  sentences: SentenceItem[];
}