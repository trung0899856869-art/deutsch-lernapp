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

// ─── Adjektiv Deklination (3 separate tables) ────────────────────────────────

export interface AdjCell {
  article: string; // e.g. "der", "einen", "" for ohne Artikel
  stem: string;    // adjective stem without ending
  ending: string;  // ending to display in bold
}

export interface AdjDeklSection {
  title: string;
  subtitle: string;
  rows: Array<{ kasus: string; mask: AdjCell; fem: AdjCell; neut: AdjCell; plural: AdjCell }>;
}

const KASUS_SHORT = ["NOM", "AKK", "DAT", "GEN"] as const;

// Articles [NOM, AKK, DAT, GEN]
const BEST_ART = {
  mask:   ["der",  "den",   "dem",   "des"],
  fem:    ["die",  "die",   "der",   "der"],
  neut:   ["das",  "das",   "dem",   "des"],
  plural: ["die",  "die",   "den",   "der"],
};
const UNBEST_ART = {
  mask:   ["ein",   "einen",  "einem",  "eines"],
  fem:    ["eine",  "eine",   "einer",  "einer"],
  neut:   ["ein",   "ein",    "einem",  "eines"],
  plural: ["keine", "keine",  "keinen", "keiner"],
};

// Adjective endings [NOM, AKK, DAT, GEN]
const SCHWACH  = { mask: ["e","en","en","en"], fem: ["e","e","en","en"],  neut: ["e","e","en","en"],   plural: ["en","en","en","en"] };
const GEMISCHT = { mask: ["er","en","en","en"], fem: ["e","e","en","en"], neut: ["es","es","en","en"],  plural: ["en","en","en","en"] };
const STARK    = { mask: ["er","en","em","en"], fem: ["e","e","er","er"], neut: ["es","es","em","en"],  plural: ["e","e","en","er"] };

function buildSection(
  title: string,
  subtitle: string,
  articles: typeof BEST_ART | typeof UNBEST_ART | null,
  endings: typeof SCHWACH,
  stem: string
): AdjDeklSection {
  return {
    title,
    subtitle,
    rows: KASUS_SHORT.map((kasus, i) => ({
      kasus,
      mask:   { article: articles?.mask[i]   ?? "", stem, ending: endings.mask[i] },
      fem:    { article: articles?.fem[i]    ?? "", stem, ending: endings.fem[i] },
      neut:   { article: articles?.neut[i]   ?? "", stem, ending: endings.neut[i] },
      plural: { article: articles?.plural[i] ?? "", stem, ending: endings.plural[i] },
    })),
  };
}

export function getAdjektivDeklinationsTables(grundform: string): AdjDeklSection[] {
  // Remove trailing -e for stem (e.g. "müde" → "müd", "groß" → "groß")
  const stem =
    grundform.toLowerCase().endsWith("e") && grundform.length > 2
      ? grundform.slice(0, -1)
      : grundform.toLowerCase();

  return [
    buildSection("Bestimmter Artikel", "(dies-, jen-, jed-, manch-, welch-)", BEST_ART,   SCHWACH,   stem),
    buildSection("Unbestimmter Artikel", "(kein, mein, dein, sein, ihr, unser, euer)", UNBEST_ART, GEMISCHT, stem),
    buildSection("Ohne Artikel", "(einig-, wenig-, viel-, Zahlen)", null, STARK, stem),
  ];
}

// Legacy — kept for backward compat, prefer getAdjektivDeklinationsTables
export interface DeklTable {
  headers: string[];
  rows: { kasus: string; values: string[] }[];
}

export function getAdjektivDeklinationsTable(grundform: string): DeklTable {
  const tables = getAdjektivDeklinationsTables(grundform);
  const headers = ["Kasus", "Maskulinum", "Femininum", "Neutrum", "Plural"];
  const rows = tables[0].rows.map((row) => ({
    kasus: row.kasus,
    values: [
      row.mask.stem + row.mask.ending,
      row.fem.stem + row.fem.ending,
      row.neut.stem + row.neut.ending,
      row.plural.stem + row.plural.ending,
    ],
  }));
  return { headers, rows };
}
