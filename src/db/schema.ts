import {
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const languageEnum = pgEnum("language", [
  "javascript",
  "typescript",
  "python",
  "rust",
  "go",
  "java",
  "cpp",
  "c",
  "csharp",
  "php",
  "ruby",
  "swift",
  "kotlin",
  "sql",
  "html",
  "css",
  "json",
  "yaml",
  "bash",
  "markdown",
  "plaintext",
]);

export const verdictEnum = pgEnum("verdict", [
  "legendary_disaster",
  "needs_serious_help",
  "mediocre_at_best",
  "getting_there",
  "actually_decent",
]);

export const issueSeverityEnum = pgEnum("issue_severity", [
  "critical",
  "warning",
  "good",
]);

export const submissions = pgTable("submissions", {
  id: uuid().primaryKey().defaultRandom(),
  code: text().notNull(),
  language: languageEnum().notNull(),
  lineCount: integer().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const roasts = pgTable("roasts", {
  id: uuid().primaryKey().defaultRandom(),
  submissionId: uuid()
    .notNull()
    .unique()
    .references(() => submissions.id, { onDelete: "cascade" }),
  score: numeric({ precision: 3, scale: 1 }).notNull(),
  verdict: verdictEnum().notNull(),
  roastQuote: text().notNull(),
  suggestedFix: text(),
  modelUsed: varchar({ length: 100 }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const roastIssues = pgTable("roast_issues", {
  id: uuid().primaryKey().defaultRandom(),
  roastId: uuid()
    .notNull()
    .references(() => roasts.id, { onDelete: "cascade" }),
  severity: issueSeverityEnum().notNull(),
  title: varchar({ length: 120 }).notNull(),
  description: text().notNull(),
  order: integer().notNull().default(0),
});

export const rateLimitWindows = pgTable("rate_limit_windows", {
  keyHash: varchar({ length: 128 }).primaryKey(),
  windowStartedAt: timestamp({ withTimezone: true }).notNull(),
  count: integer().notNull().default(0),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export type InsertSubmission = typeof submissions.$inferInsert;
export type SelectSubmission = typeof submissions.$inferSelect;
export type InsertRoast = typeof roasts.$inferInsert;
export type SelectRoast = typeof roasts.$inferSelect;
export type InsertRoastIssue = typeof roastIssues.$inferInsert;
export type SelectRoastIssue = typeof roastIssues.$inferSelect;
export type InsertRateLimitWindow = typeof rateLimitWindows.$inferInsert;
export type SelectRateLimitWindow = typeof rateLimitWindows.$inferSelect;
