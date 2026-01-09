ALTER TABLE "emergency_blood_requests" DROP CONSTRAINT "emergency_blood_requests_requester_id_unique";--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" DROP CONSTRAINT "emergency_blood_requests_responder_id_unique";--> statement-breakpoint
ALTER TABLE "gbr_requests" DROP CONSTRAINT "gbr_requests_requesterId_users_donorId_fk";
--> statement-breakpoint
ALTER TABLE "gbr_requests" DROP CONSTRAINT "gbr_requests_recipientId_users_donorId_fk";
--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_senderId_users_donorId_fk";
--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_recipientId_users_donorId_fk";
--> statement-breakpoint
ALTER TABLE "testimonials" DROP CONSTRAINT "testimonials_reviewerId_users_donorId_fk";
--> statement-breakpoint
ALTER TABLE "testimonials" DROP CONSTRAINT "testimonials_revieweeId_users_donorId_fk";
--> statement-breakpoint
DROP INDEX "blood_donations_donorIdx";--> statement-breakpoint
DROP INDEX "gbr_requester_idx";--> statement-breakpoint
DROP INDEX "gbr_recipient_idx";--> statement-breakpoint
DROP INDEX "messages_sender_idx";--> statement-breakpoint
DROP INDEX "messages_recipient_idx";--> statement-breakpoint
DROP INDEX "messages_conversation_idx";--> statement-breakpoint
DROP INDEX "testimonials_reviewer_idx";--> statement-breakpoint
DROP INDEX "testimonials_reviewee_idx";--> statement-breakpoint
ALTER TABLE "blood_donations" ALTER COLUMN "hospital_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "blood_donations" ALTER COLUMN "donation_date" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "blood_donations" ALTER COLUMN "units_given" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "blood_donations" ALTER COLUMN "status" SET DEFAULT 'completed';--> statement-breakpoint
ALTER TABLE "blood_donations" ALTER COLUMN "donation_type" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "blood_donations" ALTER COLUMN "donation_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "blood_donations" ALTER COLUMN "hemoglobin" SET DATA TYPE numeric(4, 2);--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ALTER COLUMN "requester_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ALTER COLUMN "requester_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ALTER COLUMN "responder_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ALTER COLUMN "responder_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ALTER COLUMN "emergency_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ALTER COLUMN "upazila" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ALTER COLUMN "district" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ALTER COLUMN "division" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ALTER COLUMN "latitude" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ALTER COLUMN "longitude" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ALTER COLUMN "contact_person" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ALTER COLUMN "reason" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ALTER COLUMN "auto_approved" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ALTER COLUMN "approval_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "gbr_requests" ALTER COLUMN "donation_time" SET DATA TYPE time;--> statement-breakpoint
ALTER TABLE "blood_donations" ADD COLUMN "donorId" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "blood_donations" ADD COLUMN "recipientId" varchar;--> statement-breakpoint
ALTER TABLE "blood_donations" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "contact_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "gbr_requests" ADD COLUMN "requesterid" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "gbr_requests" ADD COLUMN "recipientId" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "senderid" varchar;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "recipientId" varchar;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "reviewerid" varchar;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "revieweeid" varchar;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD CONSTRAINT "emergency_blood_requests_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD CONSTRAINT "emergency_blood_requests_responder_id_users_id_fk" FOREIGN KEY ("responder_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gbr_requests" ADD CONSTRAINT "gbr_requests_requesterid_users_donorId_fk" FOREIGN KEY ("requesterid") REFERENCES "public"."users"("donorId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gbr_requests" ADD CONSTRAINT "gbr_requests_recipientId_users_donorId_fk" FOREIGN KEY ("recipientId") REFERENCES "public"."users"("donorId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderid_users_donorId_fk" FOREIGN KEY ("senderid") REFERENCES "public"."users"("donorId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipientId_users_donorId_fk" FOREIGN KEY ("recipientId") REFERENCES "public"."users"("donorId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_reviewerid_users_donorId_fk" FOREIGN KEY ("reviewerid") REFERENCES "public"."users"("donorId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_revieweeid_users_donorId_fk" FOREIGN KEY ("revieweeid") REFERENCES "public"."users"("donorId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blood_donations_donorIdx" ON "blood_donations" USING btree ("donorId");--> statement-breakpoint
CREATE INDEX "gbr_requester_idx" ON "gbr_requests" USING btree ("requesterid");--> statement-breakpoint
CREATE INDEX "gbr_recipient_idx" ON "gbr_requests" USING btree ("recipientId");--> statement-breakpoint
CREATE INDEX "messages_sender_idx" ON "messages" USING btree ("senderid");--> statement-breakpoint
CREATE INDEX "messages_recipient_idx" ON "messages" USING btree ("recipientId");--> statement-breakpoint
CREATE INDEX "messages_conversation_idx" ON "messages" USING btree ("senderid","recipientId");--> statement-breakpoint
CREATE INDEX "testimonials_reviewer_idx" ON "testimonials" USING btree ("reviewerid");--> statement-breakpoint
CREATE INDEX "testimonials_reviewee_idx" ON "testimonials" USING btree ("revieweeid");--> statement-breakpoint
ALTER TABLE "blood_donations" DROP COLUMN "donorId";--> statement-breakpoint
ALTER TABLE "blood_donations" DROP COLUMN "recipientId";--> statement-breakpoint
ALTER TABLE "gbr_requests" DROP COLUMN "requesterId";--> statement-breakpoint
ALTER TABLE "gbr_requests" DROP COLUMN "recipientId";--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "senderId";--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "recipientId";--> statement-breakpoint
ALTER TABLE "testimonials" DROP COLUMN "reviewerId";--> statement-breakpoint
ALTER TABLE "testimonials" DROP COLUMN "revieweeId";