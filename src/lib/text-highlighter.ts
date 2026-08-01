import type { Wortart } from "./constants";

export interface HighlightedWord {
  text: string;
  wortart: Wortart | null;
  vokabelId: string | null;
  grundform: string | null;
}

export interface WordFormMatch {
  form: string;     // lowercased form
  wortart: Wortart;
  vokabelId: string;
  grundform: string;
}

/**
 * Splits text into tokens (words + whitespace/punctuation).
 * Returns an array of raw token strings.
 */
function tokenize(text: string): string[] {
  return text.split(/(\s+|[,.!?;:()\[\]"„"–—…]+)/);
}

/**
 * Annotates a plain text string with vocabulary matches.
 * formIndex: map from lowercased form → { wortart, vokabelId, grundform }
 */
export function highlightText(
  text: string,
  formIndex: Map<string, WordFormMatch>
): HighlightedWord[] {
  const tokens = tokenize(text);
  return tokens.map((token) => {
    // Only try to match alphabetic tokens
    const lower = token.toLowerCase();
    if (/[a-zäöüß]/.test(lower)) {
      const match = formIndex.get(lower);
      if (match) {
        return {
          text: token,
          wortart: match.wortart,
          vokabelId: match.vokabelId,
          grundform: match.grundform,
        };
      }
    }
    return { text: token, wortart: null, vokabelId: null, grundform: null };
  });
}

/**
 * Build a form → match index from an array of word form rows.
 */
export function buildFormIndex(
  rows: WordFormMatch[]
): Map<string, WordFormMatch> {
  const index = new Map<string, WordFormMatch>();
  for (const row of rows) {
    // If two words share the same form, first one wins (alphabetically by grundform)
    if (!index.has(row.form)) {
      index.set(row.form, row);
    }
  }
  return index;
}
