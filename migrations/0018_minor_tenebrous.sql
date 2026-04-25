CREATE TABLE "user_activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"action" text NOT NULL,
	"details" text,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "donation_history_user_idx";--> statement-breakpoint
DROP INDEX "donation_history_date_idx";--> statement-breakpoint
DROP INDEX "donation_history_type_idx";--> statement-breakpoint
DROP INDEX "medical_history_donor_id_idx";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_name_change_date" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deletion_scheduled_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "notify_donation_reminder" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "notify_emergency_requests" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "notify_appointment_alerts" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user_activity_logs" ADD CONSTRAINT "user_activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_activity_logs_user_idx" ON "user_activity_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_activity_logs_created_idx" ON "user_activity_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "donation_history_user_Idx" ON "donation_history" USING btree ("donorId");--> statement-breakpoint
CREATE INDEX "donation_history_date_Idx" ON "donation_history" USING btree ("donation_date");--> statement-breakpoint
CREATE INDEX "donation_history_type_Idx" ON "donation_history" USING btree ("donation_type");--> statement-breakpoint
CREATE INDEX "medical_history_donorId_idx" ON "medical_history" USING btree ("donorId");