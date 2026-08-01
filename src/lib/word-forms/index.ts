import { getNounForms } from "./noun-forms";
import { getVerbForms } from "./verb-forms";
import { getAdjectiveForms } from "./adjective-forms";
import type { Wortart } from "../constants";

export interface WordFormInput {
  wortart: Wortart;
  grundform: string;
  // Noun
  artikel?: string;
  pluralSuffix?: string;
  // Verb
  partizip2?: string;
  praesensEr?: string;
  praeteritum?: string;
  // Adjective
  komparativ?: string;
  superlativ?: string;
}

/**
 * Returns all lowercase inflected forms for a vocabulary entry.
 * Used to populate the word_forms table at save time.
 */
export function getAllWordForms(input: WordFormInput): string[] {
  const { wortart, grundform } = input;
  const base = grundform.toLowerCase();

  switch (wortart) {
    case "Substantiv":
      return getNounForms({
        artikel: (input.artikel as "der" | "die" | "das") ?? "das",
        grundform,
        pluralSuffix: input.pluralSuffix ?? "-",
      });

    case "Verb":
      return getVerbForms({
        grundform,
        partizip2: input.partizip2 ?? `ge${base}t`,
        praesensEr: input.praesensEr,
        praeteritum: input.praeteritum,
      });

    case "Adjektiv":
      return getAdjectiveForms({
        grundform,
        komparativ: input.komparativ,
        superlativ: input.superlativ,
      });

    case "Adverb":
    case "Präposition":
    case "Phrase":
      // These don't inflect — just return the base form
      return [base];

    default:
      return [base];
  }
}

export { getNounForms } from "./noun-forms";
export { getVerbForms } from "./verb-forms";
export { getAdjectiveForms } from "./adjective-forms";
