import { EducationalContentResponse } from '@/types';

export const mockEducationalData: EducationalContentResponse = {
  userInputOriginal: "Quiero ser un desarrollador de software y viajar por el mundo aprendiendo nuevas culturas.",
  summaryType: "short",
  summaryParagraph: "I want to build modern software and explore different countries while working remotely.",
  sentences: [
    {
      id: "phrase_1",
      text: "I want to build modern software.",
      coreStructure: "I want to build",
      targetComplement: "modern software",
      ipa: "/aɪ wɑːnt tuː bɪld ˈmɑːdərn ˈsɔːftwer/",
      cefrDefinition: "To make computer programs that people can use on phones or computers today.",
      collocations: [
        "I want to build software",
        "I want to build a company",
        "I want to build a career",
        "I want to build a project",
        "I want to build a brand"
      ],
      layer2: {
        keyword: "build",
        partOfSpeech: "verb",
        semanticCategory: "physical_action_or_creation",
        primaryTechnique: {
          type: "sensory_mini_story",
          title: "Action in Context (Mental Image)",
          content: "You sit at your desk, connect lines of code like digital bricks, and test each piece until a brand-new application works smoothly on your screen."
        },
        secondaryTechnique: {
          type: "opposite_trigger",
          title: "Opposite Situation (Contrast)",
          oppositeWord: "destroy / tear down",
          contrastPhrases: [
            "I destroy what I start when I give up too early.",
            "Careless mistakes tear down valuable work."
          ]
        },
        youtubeContextQuery: "Reid Hoffman Stanford build software",
        videoContext: {
          videoId: "PX8i8fcC5NQ", // Reid Hoffman en Stanford (2012)
          startSeconds: 1013,     // Minuto 16:53 exacto
          endSeconds: 1025,
          targetPhrase: "I want to build software",
          fullSpokenText: "Because I was like, no, no, I want to build software, and that, McKinsey is not the path for doing that.",
          highlightPhrase: "I want to build software",
          contextNote: "Reid Hoffman (fundador de LinkedIn) pronunciando la estructura exacta en Stanford"
        }
      }
    },
    {
      id: "phrase_2",
      text: "I want to explore different countries.",
      coreStructure: "I want to explore",
      targetComplement: "different countries",
      ipa: "/aɪ wɑːnt tuː ɪkˈsplɔːr ˈdɪfrənt ˈkʌntriz/",
      cefrDefinition: "To travel to places that are completely new to you to see how people live.",
      collocations: [
        "I want to explore new cities",
        "I want to explore the world",
        "I want to explore different cultures",
        "I want to explore career opportunities",
        "I want to explore new ideas"
      ],
      layer2: {
        keyword: "explore",
        partOfSpeech: "verb",
        semanticCategory: "physical_action_or_creation",
        primaryTechnique: {
          type: "sensory_mini_story",
          title: "Action in Context (Mental Image)",
          content: "You land at an airport in a foreign country, hold a map, and walk through vibrant streets full of unfamiliar sounds, smells, and signs."
        },
        secondaryTechnique: {
          type: "opposite_trigger",
          title: "Opposite Situation (Contrast)",
          oppositeWord: "stay behind / isolate",
          contrastPhrases: [
            "I stay home and never experience the world.",
            "Fear forces people to isolate themselves from reality."
          ]
        },
        youtubeContextQuery: "explore different cultures travel vlog",
        videoContext: {
          videoId: "bO7SFz05dG0",
          startSeconds: 45,
          endSeconds: 58,
          targetPhrase: "explore different cultures",
          fullSpokenText: "When you travel, you want to explore different cultures and experience how people live.",
          highlightPhrase: "explore different cultures",
          contextNote: "Viajero nativo usando la colocación en contexto real"
        }
      }
    }
  ]
};