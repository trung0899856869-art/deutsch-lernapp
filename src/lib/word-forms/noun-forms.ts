// Generates all lowercase forms of a German noun for text matching

export interface NounInfo {
  artikel: "der" | "die" | "das";
  grundform: string; // Nominativ Singular (without article)
  pluralSuffix: string; // "-" | "e" | '"e' | "er" | '"er' | "en" | "n" | "s" | "nen"
}

/**
 * Applies a plural suffix to a noun stem.
 * Prefix `"` means umlaut the last vowel in the stem.
 */
function applyUmlaut(word: string): string {
  // Umlaut: replace last a→ä, o→ö, u→ü, au→äu
  const umlautMap: [RegExp, string][] = [
    [/au(?=[^aeiouäöü]*$)/i, "äu"],
    [/a(?=[^aeiouäöü]*$)/i, "ä"],
    [/o(?=[^aeiouäöü]*$)/i, "ö"],
    [/u(?=[^aeiouäöü]*$)/i, "ü"],
  ];
  for (const [pattern, replacement] of umlautMap) {
    const result = word.replace(pattern, replacement);
    if (result !== word) return result;
  }
  return word;
}

function buildPlural(grundform: string, suffix: string): string {
  const needsUmlaut = suffix.startsWith('"');
  const actualSuffix = suffix.startsWith('"') ? suffix.slice(1) : suffix;
  const stem = needsUmlaut ? applyUmlaut(grundform) : grundform;

  if (actualSuffix === "-") return stem;
  // Remove trailing -e before adding -en/-er (e.g. Wanze → Wanzen, not Wanzeen)
  if (
    (actualSuffix === "en" || actualSuffix === "n" || actualSuffix === "nen") &&
    stem.endsWith("e")
  ) {
    return stem + actualSuffix.slice(1);
  }
  return stem + actualSuffix;
}

/**
 * Returns all lowercase inflected forms of a noun (Nom/Akk Sg + Pl).
 * Genitive/Dative case endings are minor and handled by substring match.
 */
export function getNounForms(info: NounInfo): string[] {
  const { grundform, pluralSuffix } = info;
  const sg = grundform.toLowerCase();
  const pl = buildPlural(grundform, pluralSuffix).toLowerCase();

  const forms = new Set<string>([sg]);

  // Genitiv Singular: +s (der/das) or unchanged (die)
  if (info.artikel === "der" || info.artikel === "das") {
    if (!sg.endsWith("s") && !sg.endsWith("ß")) {
      forms.add(sg + "s");
    }
    // Words ending in -s/-ß/-z get -es
    if (sg.endsWith("s") || sg.endsWith("ß") || sg.endsWith("z")) {
      forms.add(sg + "es");
    }
  }

  // Dativ Singular: add -e is archaic, skip

  if (pl && pl !== sg) {
    forms.add(pl);
    // Dativ Plural +n (unless already ends in -n or -s)
    if (!pl.endsWith("n") && !pl.endsWith("s")) {
      forms.add(pl + "n");
    }
  }

  return Array.from(forms);
}

/**
 * Parse noun shorthand notation into structured NounInfo.
 * Supports two formats:
 *   1. Shorthand: "e. Wand, \"e"  →  { artikel: "die", grundform: "Wand", pluralSuffix: '"e' }
 *   2. Full:      "die Wand, die Wände"  →  parsed by splitting
 */
export function parseNounShorthand(
  shorthand: string,
  grundform: string,
  artikel: string,
  pluralSuffix: string
): NounInfo {
  return {
    artikel: artikel as NounInfo["artikel"],
    grundform,
    pluralSuffix,
  };
}
