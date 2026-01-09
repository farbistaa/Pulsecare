ALTER TABLE "blood_donations" RENAME COLUMN "donor_id" TO "donorId";--> statement-breakpoint
ALTER TABLE "donation_appointments" RENAME COLUMN "donor_id" TO "donorId";--> statement-breakpoint
ALTER TABLE "donations" RENAME COLUMN "donor_id" TO "donorId";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "donor_id" TO "donorId";--> statement-breakpoint
ALTER TABLE "donation_appointments" DROP CONSTRAINT "donation_appointments_donor_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "donations" DROP CONSTRAINT "donations_donor_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "blood_donations_donor_idx";--> statement-breakpoint
DROP INDEX "appointments_donor_idx";--> statement-breakpoint
DROP INDEX "donations_donor_id_idx";--> statement-breakpoint
ALTER TABLE "donation_appointments" ADD CONSTRAINT "donation_appointments_donorId_users_id_fk" FOREIGN KEY ("donorId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_donorId_users_id_fk" FOREIGN KEY ("donorId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blood_donations_donorIdx" ON "blood_donations" USING btree ("donorId");--> statement-breakpoint
CREATE INDEX "appointments_donorIdx" ON "donation_appointments" USING btree ("donorId");--> statement-breakpoint
CREATE INDEX "donations_donorId_idx" ON "donations" USING btree ("donorId");