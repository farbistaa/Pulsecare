ALTER TABLE "donation_history" DROP CONSTRAINT "donation_history_user_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "education_history_type_idx";--> statement-breakpoint
DROP INDEX "donation_history_user_idx";--> statement-breakpoint
ALTER TABLE "donation_history" ADD COLUMN "donorId" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "donation_history" ADD COLUMN "donation_volume" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "donation_history" ADD COLUMN "donation_unit" text NOT NULL;--> statement-breakpoint
ALTER TABLE "education_history" ADD COLUMN "education_level" text NOT NULL;--> statement-breakpoint
ALTER TABLE "education_history" ADD COLUMN "major" text NOT NULL;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "user_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "donation_history" ADD CONSTRAINT "donation_history_donorId_users_id_fk" FOREIGN KEY ("donorId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "education_history_name_idx" ON "education_history" USING btree ("institution_name");--> statement-breakpoint
CREATE INDEX "donation_history_user_idx" ON "donation_history" USING btree ("donorId");--> statement-breakpoint
ALTER TABLE "donation_history" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "donation_history" DROP COLUMN "donation_picture";--> statement-breakpoint
ALTER TABLE "education_history" DROP COLUMN "course";