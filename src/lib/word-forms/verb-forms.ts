// Generates all lowercase conjugated forms of a German verb

export interface VerbInfo {
  grundform: string; // infinitive, e.g. "sehen"
  partizip2: string; // e.g. "gesehen"
  praesensEr?: string; // irregular er/sie/es present, e.g. "sieht"
  praeteritum?: string; // ich-form Präteritum, e.g. "sah"
}

// Standard present tense endings for regular verbs: -e, -st, -t, -en, -t, -en
const PRAESENS_ENDINGS = ["e", "st", "t", "en", "t", "en"];
// Präteritum endings for strong verbs (no -e for ich/er forms)
const PRAETERITUM_STRONG = ["", "st", "", "en", "t", "en"];
// Präteritum endings for weak verbs
const PRAETERITUM_WEAK = ["te", "test", "te", "ten", "tet", "ten"];

function getStem(infinitive: string): string {
  if (infinitive.endsWith("eln")) return infinitive.slice(0, -3) + "l";
  if (infinitive.endsWith("ern")) return infinitive.slice(0, -3) + "r";
  if (infinitive.endsWith("en")) return infinitive.slice(0, -2);
  if (infinitive.endsWith("n")) return infinitive.slice(0, -1);
  return infinitive;
}

export function getVerbForms(info: VerbInfo): string[] {
  const { grundform, partizip2, praesensEr, praeteritum } = info;
  const forms = new Set<string>();

  const infinitive = grundform.toLowerCase();
  forms.add(infinitive);

  // Infinitive with "zu" — skip (handled by substring match)

  // Partizip II
  const p2 = partizip2.toLowerCase();
  forms.add(p2);

  // Stem for regular conjugation
  const stem = getStem(infinitive);

  // Präsens — regular endings
  for (const ending of PRAESENS_ENDINGS) {
    let form = stem + ending;
    // -t-endings: if stem ends in -d/-t/-m/-n (with consonant before), insert -e-
    if (
      (ending === "st" || ending === "t") &&
      (stem.endsWith("d") ||
        stem.endsWith("t") ||
        (stem.endsWith("m") && !/[lrmnw]/.test(stem.slice(-2, -1))) ||
        (stem.endsWith("n") && !/[lrmnw]/.test(stem.slice(-2, -1))))
    ) {
      form = stem + "e" + ending;
    }
    forms.add(form.toLowerCase());
  }

  // Override er/sie/es form if irregular
  if (praesensEr) {
    forms.add(praesensEr.toLowerCase());
    // du-form: usually praesensEr with -st (e.g. siehst), except if ends in s/ß/x/z
    const erStem = praesensEr.toLowerCase();
    if (
      !erStem.endsWith("s") &&
      !erStem.endsWith("ß") &&
      !erStem.endsWith("x") &&
      !erStem.endsWith("z")
    ) {
      forms.add(erStem + "st");
    } else {
      forms.add(erStem + "t");
    }
  }

  // Präteritum
  if (praeteritum) {
    const pratStem = praeteritum.toLowerCase();
    // Detect strong verb: Präteritum stem ≠ present stem
    const isStrong = pratStem !== stem + "te";
    const endings = isStrong ? PRAETERITUM_STRONG : PRAETERITUM_WEAK;
    for (const ending of endings) {
      forms.add((pratStem + ending).toLowerCase());
    }
  }

  // Imperativ Singular (= stem, often +e for -d/-t stems)
  forms.add(stem.toLowerCase());

  // Common separable prefix handling: if verb contains separator "-"
  // e.g. "an-rufen" → "ruf ... an" — skip for now, handled via substring

  return Array.from(forms);
}
