ALTER TABLE "users" ADD COLUMN "donor_id" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_system_created" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "age" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "hemoglobin" numeric(4, 1);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_donation_date_date" text;