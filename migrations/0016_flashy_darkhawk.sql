ALTER TABLE "medical_history" RENAME COLUMN "donor_id" TO "donorId";--> statement-breakpoint
ALTER TABLE "medical_history" RENAME COLUMN "major_conditions" TO "health_status";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "is_elgible" TO "is_eligible";--> statement-breakpoint
ALTER TABLE "medical_history" DROP CONSTRAINT "medical_history_donor_id_users_donorId_fk";
--> statement-breakpoint
DROP INDEX "medical_history_donor_id_idx";--> statement-breakpoint
ALTER TABLE "medical_history" ADD CONSTRAINT "medical_history_donorId_users_donorId_fk" FOREIGN KEY ("donorId") REFERENCES "public"."users"("donorId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "medical_history_donor_id_idx" ON "medical_history" USING btree ("donorId");