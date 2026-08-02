import {
  sqliteTable,
  text,
  integer,
  real,
  index,
} from "drizzle-orm/sqlite-core";

const newId = () => crypto.randomUUID();
const now = () => new Date();

// ─── Vokabeln ────────────────────────────────────────────────────────────────

export const vokabeln = sqliteTable(
  "vokabeln",
  {
    id: text("id").primaryKey().$defaultFn(newId),
    wortart: text("wortart").notNull(),
    grundform: text("grundform").notNull(),
    bedeutung: text("bedeutung").notNull(),

    // Substantiv fields
    artikel: text("artikel"),
    pluralSuffix: text("plural_suffix"),
    pluralForm: text("plural_form"),

    // Verb fields
    verbtyp: text("verbtyp"),      // "normal" | "trennbar" | "untrennbar"
    praefixVerb: text("praefix_verb"), // e.g. "an" for "anrufen"
    partizip2: text("partizip2"),
    hilfsverb: text("hilfsverb"),
    praesensIch: text("praesens_ich"),
    praesensDu: text("praesens_du"),
    praesensEr: text("praesens_er"),
    praesensWir: text("praesens_wir"),
    praesensIhr: text("praesens_ihr"),
    praesensSie: text("praesens_sie"),
    praeteritum: text("praeteritum"),

    // Adjektiv/Adverb fields
    komparativ: text("komparativ"),
    superlativ: text("superlativ"),

    // Shared optional fields
    beispiel: text("beispiel"),
    notes: text("notes"),
    tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
    synonyme: text("synonyme", { mode: "json" }).$type<string[]>().default([]),
    antonyme: text("antonyme", { mode: "json" }).$type<string[]>().default([]),
    extraFields: text("extra_fields", { mode: "json" })
      .$type<Record<string, unknown>>()
      .default({}),

    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(now)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(now)
      .notNull(),
  },
  (t) => [
    index("vokabeln_wortart_idx").on(t.wortart),
    index("vokabeln_grundform_idx").on(t.grundform),
  ]
);

// ─── Vokabeln SRS (SM-2 state) ───────────────────────────────────────────────

export const vokabelnSrs = sqliteTable("vokabeln_srs", {
  id: text("id").primaryKey().$defaultFn(newId),
  vokabelId: text("vokabel_id")
    .notNull()
    .references(() => vokabeln.id, { onDelete: "cascade" }),
  interval: integer("interval").default(1).notNull(),
  repetition: integer("repetition").default(0).notNull(),
  efactor: real("efactor").default(2.5).notNull(),
  dueDate: text("due_date").notNull(),
  lastReviewed: integer("last_reviewed", { mode: "timestamp" }),
});

// ─── SRS Review History ──────────────────────────────────────────────────────

export const srsReviews = sqliteTable(
  "srs_reviews",
  {
    id: text("id").primaryKey().$defaultFn(newId),
    vokabelId: text("vokabel_id")
      .notNull()
      .references(() => vokabeln.id, { onDelete: "cascade" }),
    quality: integer("quality").notNull(),
    reviewedAt: integer("reviewed_at", { mode: "timestamp" }).$defaultFn(now).notNull(),
  },
  (t) => [index("srs_reviews_vokabel_idx").on(t.vokabelId)]
);

// ─── Word Forms Index (pre-computed for text highlighting) ───────────────────

export const wordForms = sqliteTable(
  "word_forms",
  {
    id: text("id").primaryKey().$defaultFn(newId),
    vokabelId: text("vokabel_id")
      .notNull()
      .references(() => vokabeln.id, { onDelete: "cascade" }),
    form: text("form").notNull(),
  },
  (t) => [index("word_forms_form_idx").on(t.form)]
);

// ─── Grammatik ───────────────────────────────────────────────────────────────

export const grammatik = sqliteTable("grammatik", {
  id: text("id").primaryKey().$defaultFn(newId),
  kategorie: text("kategorie").notNull(),
  titel: text("titel").notNull(),
  inhalt: text("inhalt").notNull(),
  beispiele: text("beispiele"),
  notes: text("notes"),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  extraFields: text("extra_fields", { mode: "json" })
    .$type<Record<string, unknown>>()
    .default({}),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(now)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(now)
    .notNull(),
});

export const grammatikSrs = sqliteTable("grammatik_srs", {
  id: text("id").primaryKey().$defaultFn(newId),
  grammatikId: text("grammatik_id")
    .notNull()
    .references(() => grammatik.id, { onDelete: "cascade" }),
  interval: integer("interval").default(1).notNull(),
  repetition: integer("repetition").default(0).notNull(),
  efactor: real("efactor").default(2.5).notNull(),
  dueDate: text("due_date").notNull(),
  lastReviewed: integer("last_reviewed", { mode: "timestamp" }),
});

// ─── Lesen Texte ─────────────────────────────────────────────────────────────

export const lesenTexte = sqliteTable("lesen_texte", {
  id: text("id").primaryKey().$defaultFn(newId),
  titel: text("titel").notNull(),
  inhalt: text("inhalt").notNull(),
  niveau: text("niveau").default("A2"),
  thema: text("thema"),
  notes: text("notes"),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  extraFields: text("extra_fields", { mode: "json" })
    .$type<Record<string, unknown>>()
    .default({}),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(now)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(now)
    .notNull(),
});

// ─── Lesen Fragen (comprehension questions per text) ─────────────────────────

export const lesenFragen = sqliteTable("lesen_fragen", {
  id: text("id").primaryKey().$defaultFn(newId),
  textId: text("text_id")
    .notNull()
    .references(() => lesenTexte.id, { onDelete: "cascade" }),
  frage: text("frage").notNull(),
  antwort: text("antwort").notNull(),
  // Multiple-choice fields (null for open-answer questions)
  optionen: text("optionen", { mode: "json" }).$type<string[]>(),
  korrektIndex: integer("korrekt_index"),
  aiGenerated: integer("ai_generated").default(0).notNull(),
  sortOrder: integer("sort_order").default(0),
});

// ─── Schreiben Journal ────────────────────────────────────────────────────────

export const schreiben = sqliteTable("schreiben", {
  id: text("id").primaryKey().$defaultFn(newId),
  thema: text("thema").notNull(),
  inhalt: text("inhalt").notNull(),
  korrektur: text("korrektur"),
  notes: text("notes"),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  extraFields: text("extra_fields", { mode: "json" })
    .$type<Record<string, unknown>>()
    .default({}),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(now)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(now)
    .notNull(),
});

// ─── Sprechen Dialoge ─────────────────────────────────────────────────────────

export const sprechenDialoge = sqliteTable("sprechen_dialoge", {
  id: text("id").primaryKey().$defaultFn(newId),
  titel: text("titel").notNull(),
  zeilen: text("zeilen", { mode: "json" })
    .$type<Array<{ sprecher: string; text: string }>>()
    .notNull()
    .default([]),
  thema: text("thema"),
  notes: text("notes"),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  extraFields: text("extra_fields", { mode: "json" })
    .$type<Record<string, unknown>>()
    .default({}),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(now)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(now)
    .notNull(),
});

// ─── Sprechen Fragekarten ─────────────────────────────────────────────────────

export const sprechenFragekarten = sqliteTable("sprechen_fragekarten", {
  id: text("id").primaryKey().$defaultFn(newId),
  thema: text("thema").notNull(),
  vokabelHinweis: text("vokabel_hinweis"),
  musterfrage: text("musterfrage"),
  musterantwort: text("musterantwort"),
  notes: text("notes"),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  extraFields: text("extra_fields", { mode: "json" })
    .$type<Record<string, unknown>>()
    .default({}),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(now)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(now)
    .notNull(),
});
