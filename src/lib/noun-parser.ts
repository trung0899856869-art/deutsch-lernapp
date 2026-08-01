// Parses German noun shorthand notation and computes display forms

const ARTIKEL_SHORT: Record<string, "der" | "die" | "das"> = {
  r: "der",
  e: "die",
  s: "das",
};

/**
 * Parse shorthand like "e. Wand, \"e" into structured fields.
 * Returns null if the input doesn't match the shorthand pattern.
 *
 * Shorthand format: "{artikel_letter}. {Grundform}, {plural_suffix}"
 * Examples:
 *   "e. Wand, \"e"   → die Wand, die Wände
 *   "r. Tisch, e"    → der Tisch, die Tische
 *   "s. Kind, er"    → das Kind, die Kinder
 */
export interface ParsedNoun {
  artikel: "der" | "die" | "das";
  grundform: string;
  pluralSuffix: string;
  pluralForm: string;
}

function applyUmlaut(word: string): string {
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

export function computePluralForm(grundform: string, suffix: string): string {
  const needsUmlaut = suffix.startsWith('"');
  const actualSuffix = needsUmlaut ? suffix.slice(1) : suffix;
  const stem = needsUmlaut ? applyUmlaut(grundform) : grundform;

  if (actualSuffix === "-") return stem;
  if (
    (actualSuffix === "en" || actualSuffix === "n" || actualSuffix === "nen") &&
    stem.endsWith("e")
  ) {
    return stem + actualSuffix.slice(1);
  }
  return stem + actualSuffix;
}

export function parseNounShorthand(input: string): ParsedNoun | null {
  // Pattern: "x. Word, suffix"
  const match = input.match(/^([res])\.\s*(.+?),\s*(.+)$/i);
  if (!match) return null;

  const artikelKey = match[1].toLowerCase() as "r" | "e" | "s";
  const artikel = ARTIKEL_SHORT[artikelKey];
  if (!artikel) return null;

  const grundform = match[2].trim();
  const pluralSuffix = match[3].trim();
  const pluralForm = computePluralForm(grundform, pluralSuffix);

  return { artikel, grundform, pluralSuffix, pluralForm };
}

/**
 * Format noun for display: "die Wand / die Wände"
 */
export function formatNounDisplay(
  artikel: string,
  grundform: string,
  pluralForm: string
): string {
  const pluralArtikel = "die";
  if (!pluralForm || pluralForm === grundform) {
    return `${artikel} ${grundform}`;
  }
  return `${artikel} ${grundform} / ${pluralArtikel} ${pluralForm}`;
}

/**
 * Generate Adjektiv declension table (4×3 = Nom/Akk/Dat/Gen × M/F/N for all 3 article types).
 * Returns a structured table for display.
 */
export interface DeklTable {
  headers: string[];
  rows: { kasus: string; values: string[] }[];
}

// [weak, mixed, strong] × Nom/Akk/Dat/Gen
const ADJ_ENDINGS: Record<string, [string, string, string][]> = {
  Maskulinum: [
    ["-e", "-er", "-er"], // Nom
    ["-en", "-en", "-en"], // Akk
    ["-en", "-en", "-em"], // Dat
    ["-en", "-en", "-en"], // Gen
  ],
  Femininum: [
    ["-e", "-e", "-e"],
    ["-e", "-e", "-e"],
    ["-en", "-en", "-er"],
    ["-en", "-en", "-er"],
  ],
  Neutrum: [
    ["-e", "-es", "-es"],
    ["-e", "-es", "-es"],
    ["-en", "-en", "-em"],
    ["-en", "-en", "-en"],
  ],
};

const KASUS = ["Nominativ", "Akkusativ", "Dativ", "Genitiv"];

export function getAdjektivDeklinationsTable(grundform: string): DeklTable {
  // Stem: remove trailing -e from adjective base for stem (e.g. "müde" → "müd")
  const stem =
    grundform.toLowerCase().endsWith("e") && grundform.length > 2
      ? grundform.slice(0, -1)
      : grundform.toLowerCase();

  const headers = ["Kasus", "Maskulinum (schwach/gemischt/stark)", "Femininum", "Neutrum"];
  const rows: DeklTable["rows"] = [];

  for (let i = 0; i < KASUS.length; i++) {
    const values: string[] = [];
    for (const genus of ["Maskulinum", "Femininum", "Neutrum"]) {
      const endings = ADJ_ENDINGS[genus][i];
      values.push(
        endings
          .map((e) => stem + e.slice(1)) // remove the "-" prefix from display
          .join(" / ")
      );
    }
    rows.push({ kasus: KASUS[i], values });
  }

  return { headers, rows };
}
