CREATE TYPE "public"."issue_severity" AS ENUM('critical', 'warning', 'good');--> statement-breakpoint
CREATE TYPE "public"."language" AS ENUM('javascript', 'typescript', 'python', 'rust', 'go', 'java', 'cpp', 'c', 'csharp', 'php', 'ruby', 'swift', 'kotlin', 'sql', 'html', 'css', 'json', 'yaml', 'bash', 'markdown', 'plaintext');--> statement-breakpoint
CREATE TYPE "public"."verdict" AS ENUM('legendary_disaster', 'needs_serious_help', 'mediocre_at_best', 'getting_there', 'actually_decent');--> statement-breakpoint
CREATE TABLE "roast_issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roast_id" uuid NOT NULL,
	"severity" "issue_severity" NOT NULL,
	"title" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"score" numeric(3, 1) NOT NULL,
	"verdict" "verdict" NOT NULL,
	"roast_quote" text NOT NULL,
	"suggested_fix" text,
	"model_used" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roasts_submissionId_unique" UNIQUE("submission_id")
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"language" "language" NOT NULL,
	"line_count" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "roast_issues" ADD CONSTRAINT "roast_issues_roast_id_roasts_id_fk" FOREIGN KEY ("roast_id") REFERENCES "public"."roasts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roasts" ADD CONSTRAINT "roasts_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;