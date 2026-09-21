import { EducationalContentResponse } from '@/types';

export const mockEducationalData: EducationalContentResponse = {
  userInputOriginal: "Quiero ser un desarrollador de software y viajar por el mundo aprendiendo nuevas culturas.",
  summaryType: "short",
  summaryParagraph: "I want to build modern software and explore different countries while working remotely.",
  sentences: [
    {
      id: "phrase_1",
      text: "I want to build modern software.",
      ipa: "/aɪ wɑːnt tuː bɪld ˈmɑːdərn ˈsɔːftwer/",
      cefrDefinition: "To make computer programs that people can use on phones or computers today.",
      collocations: [
        "I want to build a career",
        "I want to build a company",
        "I want to build a project",
        "I want to build a healthy life",
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
        youtubeContextQuery: "Steve Jobs talk build great work",
        videoContext: {
          videoId: "UF8uR6Z6KLc", // Steve Jobs - Stanford
          startSeconds: 474, // En el segundo 474 pronuncia exactamente la frase:
          endSeconds: 485,
          targetPhrase: "The only way to do great work is to love what you do.",
          contextNote: "Frase literal del orador conectada a la construcción de proyectos y software"
        }
      }
    },
    {
      id: "phrase_2",
      text: "I want to explore different countries.",
      ipa: "/aɪ wɑːnt tuː ɪkˈsplɔːr ˈdɪfrənt ˈkʌntriz/",
      cefrDefinition: "To travel to places that are completely new to you to see how people live.",
      collocations: [
        "I want to explore new cities",
        "I want to explore different cultures",
        "I want to explore career opportunities",
        "I want to explore remote islands",
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
        youtubeContextQuery: "Matt Cutts try something new for 30 days TED",
        videoContext: {
          videoId: "JnfBXjWm7hc", // Matt Cutts - TED Talk
          startSeconds: 22, // En el segundo 22 pronuncia exactamente:
          endSeconds: 32,
          targetPhrase: "Think about something you've always wanted to add to your life and try it.",
          contextNote: "Frase literal del orador motivando a dar el paso y explorar nuevas experiencias"
        }
      }
    }
  ]
};