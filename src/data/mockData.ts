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
        youtubeContextQuery: "Steve Jobs Stanford speech build company",
        videoContext: {
          videoId: "UF8uR6Z6KLc", // Steve Jobs Commencement Address
          startSeconds: 524,
          endSeconds: 545,
          targetPhrase: "I want to build modern software.",
          contextNote: "Authentic speaker talking about building meaningful work."
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
        youtubeContextQuery: "Matt Cutts TED Talk try new things",
        videoContext: {
          videoId: "JnfBXjWm7hc", // Matt Cutts TED Talk - 100% libre para inserción
          startSeconds: 22,
          endSeconds: 42,
          targetPhrase: "I want to explore different countries.",
          contextNote: "Speaker sharing the experience of stepping out to explore new challenges."
        }
      }
    }
  ]
};