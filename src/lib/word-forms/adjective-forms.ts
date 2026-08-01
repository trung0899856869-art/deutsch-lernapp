// Generates all declined forms of a German adjective

export interface AdjectiveInfo {
  grundform: string; // positive form, e.g. "schön"
  komparativ?: string; // e.g. "schöner"
  superlativ?: string; // e.g. "am schönsten"
}

// Weak declension endings (after definite article der/die/das)
const WEAK: string[] = ["e", "en", "en", "en", "e", "en", "en", "en", "e", "en", "en", "en", "en", "en", "en", "en"];
// Strong declension endings (no article)
const STRONG: string[] = ["er", "en", "em", "en", "e", "er", "er", "en", "es", "en", "em", "en", "e", "er", "en", "en"];
// Mixed declension endings (after ein-words)
const MIXED: string[] = ["er", "en", "en", "en", "e", "en", "en", "en", "es", "en", "en", "en", "en", "en", "en", "en"];

function getStem(adj: string): string {
  // hoch → hoh- , dunkel → dunkel- (no change but loses -e- in some forms)
  if (adj === "hoch") return "hoh";
  if (adj.endsWith("el")) return adj.slice(0, -2) + "l"; // dunkel → dunkl
  if (adj.endsWith("er") && adj.length > 3) return adj; // teuer stays teuer (contracted in speech)
  return adj;
}

export function getAdjectiveForms(info: AdjectiveInfo): string[] {
  const { grundform, komparativ, superlativ } = info;
  const forms = new Set<string>();

  const base = grundform.toLowerCase();
  forms.add(base);

  const stem = getStem(base);

  // Collect all weak + strong + mixed endings
  const allEndings = new Set([...WEAK, ...STRONG, ...MIXED]);
  for (const ending of allEndings) {
    forms.add(stem + ending);
  }

  // Komparativ forms
  if (komparativ) {
    const komp = komparativ.toLowerCase();
    forms.add(komp);
    const kompStem = getStem(komp.endsWith("er") ? komp.slice(0, -2) : komp);
    for (const ending of allEndings) {
      forms.add(kompStem + "er" + ending);
    }
    // Prädikativer Komparativ: "schöner"
    forms.add(kompStem + "er");
  }

  // Superlativ forms — "am schönsten" or "schönst-"
  if (superlativ) {
    const sup = superlativ.toLowerCase().replace(/^am\s+/, "");
    forms.add(superlativ.toLowerCase());
    // sup may be "schönsten" — extract stem "schönst"
    const supStem = sup.endsWith("en") ? sup.slice(0, -2) : sup;
    for (const ending of allEndings) {
      forms.add(supStem + ending);
    }
    forms.add(supStem);
  }

  return Array.from(forms);
}
