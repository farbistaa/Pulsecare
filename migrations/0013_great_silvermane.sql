ALTER TABLE "messages" DROP CONSTRAINT "messages_senderid_users_donorId_fk";
--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_recipientId_users_donorId_fk";
--> statement-breakpoint
DROP INDEX "users_last_donation_date_idx";--> statement-breakpoint
DROP INDEX "messages_recipient_idx";--> statement-breakpoint
DROP INDEX "messages_conversation_idx";--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ALTER COLUMN "requester_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ALTER COLUMN "responder_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "senderid" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "recipientid" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "data_processing" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "marketing" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "emergency_contact" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderid_users_id_fk" FOREIGN KEY ("senderid") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipientid_users_id_fk" FOREIGN KEY ("recipientid") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "messages_recipient_idx" ON "messages" USING btree ("recipientid");--> statement-breakpoint
CREATE INDEX "messages_conversation_idx" ON "messages" USING btree ("senderid","recipientid");--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "recipientId";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "last_donation_date_date";