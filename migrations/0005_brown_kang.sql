ALTER TABLE "emergency_requests" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "emergency_requests" CASCADE;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" DROP CONSTRAINT "emergency_blood_requests_request_id_unique";--> statement-breakpoint
ALTER TABLE "communication_logs" DROP CONSTRAINT "communication_logs_request_id_emergency_requests_id_fk";
--> statement-breakpoint
ALTER TABLE "donation_appointments" DROP CONSTRAINT "donation_appointments_request_id_emergency_requests_id_fk";
--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" DROP CONSTRAINT "emergency_blood_requests_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" DROP CONSTRAINT "emergency_blood_requests_approved_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" DROP CONSTRAINT "emergency_blood_requests_rejected_by_users_id_fk";
--> statement-breakpoint
DROP INDEX "emergency_blood_req_blood_group_idx";--> statement-breakpoint
DROP INDEX "emergency_blood_req_status_idx";--> statement-breakpoint
DROP INDEX "emergency_blood_req_urgency_idx";--> statement-breakpoint
DROP INDEX "emergency_management_idx";--> statement-breakpoint
DROP INDEX "emergency_blood_req_user_idx";--> statement-breakpoint
DROP INDEX "emergency_blood_req_created_idx";--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ALTER COLUMN "documents" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "patient_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "patient_age" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "units_required" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "hospital_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "doctor_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "hospital_address" text NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "required_by" text NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "contact_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "additional_info" text;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "is_critical" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD COLUMN "requester_id" integer;--> statement-breakpoint
ALTER TABLE "communication_logs" ADD CONSTRAINT "communication_logs_request_id_emergency_blood_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."emergency_blood_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation_appointments" ADD CONSTRAINT "donation_appointments_request_id_emergency_blood_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."emergency_blood_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD CONSTRAINT "emergency_blood_requests_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "emergency_blood_group_idx" ON "emergency_blood_requests" USING btree ("blood_group");--> statement-breakpoint
CREATE INDEX "emergency_status_idx" ON "emergency_blood_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "emergency_requester_idx" ON "emergency_blood_requests" USING btree ("requester_id");--> statement-breakpoint
CREATE INDEX "emergency_dashboard_idx" ON "emergency_blood_requests" USING btree ("blood_group","status");--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" DROP COLUMN "request_id";--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" DROP COLUMN "units_needed";--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" DROP COLUMN "hospital";--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" DROP COLUMN "contact_person";--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" DROP COLUMN "contact_phone";--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" DROP COLUMN "urgency_level";--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" DROP COLUMN "reason";--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" DROP COLUMN "location";--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" DROP COLUMN "latitude";--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" DROP COLUMN "longitude";--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" DROP COLUMN "auto_approved";--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" DROP COLUMN "approved_at";--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" DROP COLUMN "approved_by";--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" DROP COLUMN "rejected_at";--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" DROP COLUMN "rejected_by";--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" DROP COLUMN "rejection_reason";--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" DROP COLUMN "ip_address";--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" DROP COLUMN "device_info";--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" DROP COLUMN "updated_at";