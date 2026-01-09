CREATE TABLE "medical_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"donor_id" varchar(255) NOT NULL,
	"major_conditions" jsonb DEFAULT '[]',
	"systolic" integer,
	"diastolic" integer,
	"last_checked" timestamp,
	"chronic_conditions" jsonb DEFAULT '[]',
	"vaccinations" jsonb DEFAULT '[]',
	"smoking_status" varchar(50) DEFAULT 'not_specified',
	"alcohol_consumption" varchar(50) DEFAULT 'not_specified',
	"drug_use" varchar(50) DEFAULT 'not_specified',
	"allergies" jsonb DEFAULT '[]',
	"current_medications" jsonb DEFAULT '[]',
	"important_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "medical_history" ADD CONSTRAINT "medical_history_donor_id_users_donorId_fk" FOREIGN KEY ("donor_id") REFERENCES "public"."users"("donorId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "medical_history_donor_id_idx" ON "medical_history" USING btree ("donor_id");