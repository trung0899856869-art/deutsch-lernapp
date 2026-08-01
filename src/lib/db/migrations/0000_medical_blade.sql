CREATE TABLE `grammatik` (
	`id` text PRIMARY KEY NOT NULL,
	`kategorie` text NOT NULL,
	`titel` text NOT NULL,
	`inhalt` text NOT NULL,
	`beispiele` text,
	`notes` text,
	`tags` text DEFAULT '[]',
	`extra_fields` text DEFAULT '{}',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `lesen_fragen` (
	`id` text PRIMARY KEY NOT NULL,
	`text_id` text NOT NULL,
	`frage` text NOT NULL,
	`antwort` text NOT NULL,
	`sort_order` integer DEFAULT 0,
	FOREIGN KEY (`text_id`) REFERENCES `lesen_texte`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `lesen_texte` (
	`id` text PRIMARY KEY NOT NULL,
	`titel` text NOT NULL,
	`inhalt` text NOT NULL,
	`niveau` text DEFAULT 'A2',
	`thema` text,
	`notes` text,
	`tags` text DEFAULT '[]',
	`extra_fields` text DEFAULT '{}',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `schreiben` (
	`id` text PRIMARY KEY NOT NULL,
	`thema` text NOT NULL,
	`inhalt` text NOT NULL,
	`korrektur` text,
	`notes` text,
	`tags` text DEFAULT '[]',
	`extra_fields` text DEFAULT '{}',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sprechen_dialoge` (
	`id` text PRIMARY KEY NOT NULL,
	`titel` text NOT NULL,
	`zeilen` text DEFAULT '[]' NOT NULL,
	`thema` text,
	`notes` text,
	`tags` text DEFAULT '[]',
	`extra_fields` text DEFAULT '{}',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sprechen_fragekarten` (
	`id` text PRIMARY KEY NOT NULL,
	`thema` text NOT NULL,
	`vokabel_hinweis` text,
	`musterfrage` text,
	`musterantwort` text,
	`notes` text,
	`tags` text DEFAULT '[]',
	`extra_fields` text DEFAULT '{}',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `vokabeln` (
	`id` text PRIMARY KEY NOT NULL,
	`wortart` text NOT NULL,
	`grundform` text NOT NULL,
	`bedeutung` text NOT NULL,
	`artikel` text,
	`plural_suffix` text,
	`plural_form` text,
	`partizip2` text,
	`hilfsverb` text,
	`praesens_er` text,
	`praeteritum` text,
	`komparativ` text,
	`superlativ` text,
	`beispiel` text,
	`notes` text,
	`tags` text DEFAULT '[]',
	`extra_fields` text DEFAULT '{}',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `vokabeln_wortart_idx` ON `vokabeln` (`wortart`);--> statement-breakpoint
CREATE INDEX `vokabeln_grundform_idx` ON `vokabeln` (`grundform`);--> statement-breakpoint
CREATE TABLE `vokabeln_srs` (
	`id` text PRIMARY KEY NOT NULL,
	`vokabel_id` text NOT NULL,
	`interval` integer DEFAULT 1 NOT NULL,
	`repetition` integer DEFAULT 0 NOT NULL,
	`efactor` real DEFAULT 2.5 NOT NULL,
	`due_date` text NOT NULL,
	`last_reviewed` integer,
	FOREIGN KEY (`vokabel_id`) REFERENCES `vokabeln`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `word_forms` (
	`id` text PRIMARY KEY NOT NULL,
	`vokabel_id` text NOT NULL,
	`form` text NOT NULL,
	FOREIGN KEY (`vokabel_id`) REFERENCES `vokabeln`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `word_forms_form_idx` ON `word_forms` (`form`);