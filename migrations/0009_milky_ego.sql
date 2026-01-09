ALTER TABLE "blood_donations" DROP CONSTRAINT "blood_donations_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "blood_donations" DROP COLUMN "created_by";