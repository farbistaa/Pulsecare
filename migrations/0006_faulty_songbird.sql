CREATE TABLE "hospital" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"location" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" RENAME COLUMN "sender_id" TO "senderId";--> statement-breakpoint
ALTER TABLE "messages" RENAME COLUMN "recipient_id" TO "recipientId";--> statement-breakpoint
ALTER TABLE "testimonials" RENAME COLUMN "reviewer_id" TO "reviewerId";--> statement-breakpoint
ALTER TABLE "testimonials" RENAME COLUMN "reviewee_id" TO "revieweeId";--> statement-breakpoint
ALTER TABLE "donations" DROP CONSTRAINT "donations_donorId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_sender_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_recipient_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "testimonials" DROP CONSTRAINT "testimonials_reviewer_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "testimonials" DROP CONSTRAINT "testimonials_reviewee_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "messages_sender_idx";--> statement-breakpoint
DROP INDEX "messages_recipient_idx";--> statement-breakpoint
DROP INDEX "messages_conversation_idx";--> statement-breakpoint
DROP INDEX "testimonials_reviewer_idx";--> statement-breakpoint
DROP INDEX "testimonials_reviewee_idx";--> statement-breakpoint
ALTER TABLE "donations" ALTER COLUMN "donorId" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "donations" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN "recipientId" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stat" varchar(50);--> statement-breakpoint
CREATE INDEX "hospital_name_idx" ON "hospital" USING btree ("name");--> statement-breakpoint
CREATE INDEX "hospital_location_idx" ON "hospital" USING btree ("location");--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_donorId_users_donorId_fk" FOREIGN KEY ("donorId") REFERENCES "public"."users"("donorId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_recipientId_users_donorId_fk" FOREIGN KEY ("recipientId") REFERENCES "public"."users"("donorId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_users_donorId_fk" FOREIGN KEY ("senderId") REFERENCES "public"."users"("donorId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipientId_users_donorId_fk" FOREIGN KEY ("recipientId") REFERENCES "public"."users"("donorId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_reviewerId_users_donorId_fk" FOREIGN KEY ("reviewerId") REFERENCES "public"."users"("donorId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_revieweeId_users_donorId_fk" FOREIGN KEY ("revieweeId") REFERENCES "public"."users"("donorId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "messages_sender_idx" ON "messages" USING btree ("senderId");--> statement-breakpoint
CREATE INDEX "messages_recipient_idx" ON "messages" USING btree ("recipientId");--> statement-breakpoint
CREATE INDEX "messages_conversation_idx" ON "messages" USING btree ("senderId","recipientId");--> statement-breakpoint
CREATE INDEX "testimonials_reviewer_idx" ON "testimonials" USING btree ("reviewerId");--> statement-breakpoint
CREATE INDEX "testimonials_reviewee_idx" ON "testimonials" USING btree ("revieweeId");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_donorId_unique" UNIQUE("donorId");