CREATE TABLE "gbr_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"requesterId" varchar(255) NOT NULL,
	"recipientId" varchar(255) NOT NULL,
	"patient_name" varchar(255) NOT NULL,
	"patients_problem" text,
	"blood_group" varchar(10) NOT NULL,
	"hemoglobin_point" numeric(4, 2),
	"units_required" integer,
	"contact_persons_number" varchar(20) NOT NULL,
	"donation_date" date,
	"donation_time" varchar(10),
	"hospital_name" varchar(255) NOT NULL,
	"address" varchar(255),
	"upazila" text,
	"district" text,
	"division" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "donations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "donations" CASCADE;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" DROP CONSTRAINT "emergency_blood_requests_requester_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "blood_donations_processed_idx";--> statement-breakpoint
DROP INDEX "emergency_blood_group_idx";--> statement-breakpoint
DROP INDEX "emergency_status_idx";--> statement-breakpoint
DROP INDEX "emergency_requester_idx";--> statement-breakpoint
DROP INDEX "emergency_dashboard_idx";--> statement-breakpoint
ALTER TABLE "blood_donations" ALTER COLUMN "donorId" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ALTER COLUMN "status" SET DEFAULT 'Pending';--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ALTER COLUMN "requester_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ALTER COLUMN "requester_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "blood_donations" ADD COLUMN "created_by" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "blood_donations" ADD COLUMN "recipientId" varchar;--> statement-breakpoint
ALTER TABLE "blood_donations" ADD COLUMN "recipient_name" text;--> statement-breakpoint
ALTER TABLE "blood_donations" ADD COLUMN "hospital_name" text;--> statement-breakpoint
ALTER TABLE "blood_donations" ADD COLUMN "blood_group" text NOT NULL;--> statement-breakpoint
ALTER TABLE "blood_donations" ADD COLUMN "units_given" integer DEFAULT 450 NOT NULL;--> statement-breakpoint
ALTER TABLE "blood_donations" ADD COLUMN "status" text DEFAULT 'Pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "blood_donations" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "blood_donations" ADD COLUMN "rating" integer;--> statement-breakpoint
ALTER TABLE "blood_donations" ADD COLUMN "testimonials" text;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "responder_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "emergency_type" text DEFAULT 'null' NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "upazila" text NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "district" text NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "division" text NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "latitude" text;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "longitude" text;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "contact_person" text NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "reason" text NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "auto_approved" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "approval_type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "approved_by" integer;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "rejected_at" timestamp;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "rejected_by" integer;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "ip_address" text;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "device_info" text;--> statement-breakpoint
ALTER TABLE "gbr_requests" ADD CONSTRAINT "gbr_requests_requesterId_users_donorId_fk" FOREIGN KEY ("requesterId") REFERENCES "public"."users"("donorId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gbr_requests" ADD CONSTRAINT "gbr_requests_recipientId_users_donorId_fk" FOREIGN KEY ("recipientId") REFERENCES "public"."users"("donorId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "gbr_requester_idx" ON "gbr_requests" USING btree ("requesterId");--> statement-breakpoint
CREATE INDEX "gbr_recipient_idx" ON "gbr_requests" USING btree ("recipientId");--> statement-breakpoint
CREATE INDEX "gbr_blood_group_idx" ON "gbr_requests" USING btree ("blood_group");--> statement-breakpoint
ALTER TABLE "blood_donations" ADD CONSTRAINT "blood_donations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD CONSTRAINT "emergency_blood_requests_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD CONSTRAINT "emergency_blood_requests_rejected_by_users_id_fk" FOREIGN KEY ("rejected_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "emergency_blood_req_blood_group_idx" ON "emergency_blood_requests" USING btree ("blood_group");--> statement-breakpoint
CREATE INDEX "emergency_blood_req_status_idx" ON "emergency_blood_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "emergency_blood_req_urgency_idx" ON "emergency_blood_requests" USING btree ("emergency_type");--> statement-breakpoint
CREATE INDEX "emergency_management_idx" ON "emergency_blood_requests" USING btree ("blood_group","status","emergency_type");--> statement-breakpoint
CREATE INDEX "emergency_blood_req_user_idx" ON "emergency_blood_requests" USING btree ("requester_id");--> statement-breakpoint
CREATE INDEX "emergency_blood_req_created_idx" ON "emergency_blood_requests" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "blood_donations" DROP COLUMN "hospital";--> statement-breakpoint
ALTER TABLE "blood_donations" DROP COLUMN "volume";--> statement-breakpoint
ALTER TABLE "blood_donations" DROP COLUMN "processed";--> statement-breakpoint
ALTER TABLE "blood_donations" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "blood_donations" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" DROP COLUMN "contact_number";--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD CONSTRAINT "emergency_blood_requests_requester_id_unique" UNIQUE("requester_id");--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD CONSTRAINT "emergency_blood_requests_responder_id_unique" UNIQUE("responder_id");