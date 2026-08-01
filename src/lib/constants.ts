export const WORTART_COLORS = {
  Substantiv: {
    badge: "bg-blue-100 text-blue-800",
    underline: "border-blue-500",
    dot: "bg-blue-500",
  },
  Verb: {
    badge: "bg-red-100 text-red-800",
    underline: "border-red-500",
    dot: "bg-red-500",
  },
  Adjektiv: {
    badge: "bg-yellow-100 text-yellow-800",
    underline: "border-yellow-500",
    dot: "bg-yellow-500",
  },
  Adverb: {
    badge: "bg-purple-100 text-purple-800",
    underline: "border-purple-500",
    dot: "bg-purple-500",
  },
  Präposition: {
    badge: "bg-orange-100 text-orange-800",
    underline: "border-orange-500",
    dot: "bg-orange-500",
  },
  Phrase: {
    badge: "bg-green-100 text-green-800",
    underline: "border-green-500",
    dot: "bg-green-500",
  },
} as const;

export type Wortart = keyof typeof WORTART_COLORS;

export const WORTART_LIST: Wortart[] = [
  "Substantiv",
  "Verb",
  "Adjektiv",
  "Adverb",
  "Präposition",
  "Phrase",
];
