ALTER TABLE "users" RENAME COLUMN "donorId" TO "donorId";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_donorId_unique";--> statement-breakpoint
ALTER TABLE "gbr_requests" DROP CONSTRAINT "gbr_requests_requesterid_users_donorId_fk";
--> statement-breakpoint
ALTER TABLE "gbr_requests" DROP CONSTRAINT "gbr_requests_recipientId_users_donorId_fk";
--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_senderid_users_donorId_fk";
--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_recipientId_users_donorId_fk";
--> statement-breakpoint
ALTER TABLE "testimonials" DROP CONSTRAINT "testimonials_reviewerid_users_donorId_fk";
--> statement-breakpoint
ALTER TABLE "testimonials" DROP CONSTRAINT "testimonials_revieweeid_users_donorId_fk";
--> statement-breakpoint
ALTER TABLE "gbr_requests" ADD CONSTRAINT "gbr_requests_requesterid_users_donorId_fk" FOREIGN KEY ("requesterid") REFERENCES "public"."users"("donorId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gbr_requests" ADD CONSTRAINT "gbr_requests_recipientId_users_donorId_fk" FOREIGN KEY ("recipientId") REFERENCES "public"."users"("donorId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderid_users_donorId_fk" FOREIGN KEY ("senderid") REFERENCES "public"."users"("donorId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipientId_users_donorId_fk" FOREIGN KEY ("recipientId") REFERENCES "public"."users"("donorId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_reviewerid_users_donorId_fk" FOREIGN KEY ("reviewerid") REFERENCES "public"."users"("donorId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_revieweeid_users_donorId_fk" FOREIGN KEY ("revieweeid") REFERENCES "public"."users"("donorId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_donorId_unique" UNIQUE("donorId");