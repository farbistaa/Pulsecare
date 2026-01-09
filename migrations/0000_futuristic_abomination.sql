CREATE TABLE "admin_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_id" integer NOT NULL,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text,
	"details" text,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"badge_id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"requirement" text NOT NULL,
	"description" text NOT NULL,
	"icon_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blood_donations" (
	"id" serial PRIMARY KEY NOT NULL,
	"donor_id" text NOT NULL,
	"donation_date" timestamp NOT NULL,
	"hospital" text NOT NULL,
	"volume" integer DEFAULT 450 NOT NULL,
	"donation_type" text DEFAULT 'Whole Blood' NOT NULL,
	"hemoglobin" text,
	"processed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "blood_inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"blood_group" text NOT NULL,
	"units" integer DEFAULT 0 NOT NULL,
	"critical_threshold" integer DEFAULT 10 NOT NULL,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "blood_issuance" (
	"id" serial PRIMARY KEY NOT NULL,
	"blood_group" text NOT NULL,
	"units" integer NOT NULL,
	"recipient" text,
	"hospital" text NOT NULL,
	"purpose" text,
	"issuance_date" timestamp NOT NULL,
	"admin_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bulk_operations_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_id" integer NOT NULL,
	"operation" text NOT NULL,
	"target_type" text NOT NULL,
	"total_records" integer NOT NULL,
	"success_count" integer NOT NULL,
	"failure_count" integer NOT NULL,
	"details" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "communication_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_user_id" integer,
	"to_user_id" integer NOT NULL,
	"request_id" integer,
	"communication_type" text NOT NULL,
	"status" text NOT NULL,
	"duration" integer,
	"content" text,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donation_appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"donor_id" integer NOT NULL,
	"seeker_id" integer NOT NULL,
	"request_id" integer,
	"appointment_date" timestamp NOT NULL,
	"appointment_time" text NOT NULL,
	"location" text NOT NULL,
	"hospital_name" text NOT NULL,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"donor_confirmed_at" timestamp,
	"seeker_confirmed_at" timestamp,
	"completed_at" timestamp,
	"cancelled_at" timestamp,
	"cancellation_reason" text,
	"notes" text,
	"google_calendar_event_id" text,
	"reminders_sent" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donation_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"hospital_name" text NOT NULL,
	"hospital_location" text NOT NULL,
	"donation_date" text NOT NULL,
	"donation_type" text NOT NULL,
	"donation_picture" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "donations" (
	"id" serial PRIMARY KEY NOT NULL,
	"donor_id" integer NOT NULL,
	"recipient_name" text NOT NULL,
	"hospital_name" text NOT NULL,
	"donation_date" text NOT NULL,
	"blood_group" text NOT NULL,
	"units_given" integer NOT NULL,
	"status" text DEFAULT 'completed',
	"notes" text,
	"rating" integer,
	"testimonial" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "education_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"institution_name" text NOT NULL,
	"course" text NOT NULL,
	"institution_type" text NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text,
	"is_graduated" boolean DEFAULT false,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "emergency_blood_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" text NOT NULL,
	"user_id" integer,
	"blood_group" text NOT NULL,
	"units_needed" integer NOT NULL,
	"hospital" text NOT NULL,
	"contact_person" text NOT NULL,
	"contact_phone" text NOT NULL,
	"urgency_level" text DEFAULT 'high' NOT NULL,
	"status" text DEFAULT 'New' NOT NULL,
	"reason" text NOT NULL,
	"documents" text,
	"location" text NOT NULL,
	"latitude" text,
	"longitude" text,
	"auto_approved" boolean DEFAULT false,
	"approved_at" timestamp,
	"approved_by" integer,
	"rejected_at" timestamp,
	"rejected_by" integer,
	"rejection_reason" text,
	"ip_address" text,
	"device_info" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "emergency_blood_requests_request_id_unique" UNIQUE("request_id")
);
--> statement-breakpoint
CREATE TABLE "emergency_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_name" text NOT NULL,
	"patient_age" integer NOT NULL,
	"blood_group" text NOT NULL,
	"units_required" integer NOT NULL,
	"hospital_name" text NOT NULL,
	"doctor_name" text NOT NULL,
	"hospital_address" text NOT NULL,
	"required_by" text NOT NULL,
	"contact_number" text NOT NULL,
	"additional_info" text,
	"is_critical" boolean DEFAULT false,
	"status" text DEFAULT 'pending',
	"requester_id" integer,
	"documents" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" integer NOT NULL,
	"recipient_id" integer NOT NULL,
	"content" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notification_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"subject" text,
	"template" text NOT NULL,
	"variables" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"data" json,
	"is_read" boolean DEFAULT false NOT NULL,
	"channels" json DEFAULT '["web"]'::json NOT NULL,
	"delivery_status" json DEFAULT '{}'::json,
	"scheduled_for" timestamp,
	"sent_at" timestamp,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "otp_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"identifier" text NOT NULL,
	"code" text NOT NULL,
	"purpose" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "privacy_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"share_email" boolean DEFAULT true NOT NULL,
	"share_phone" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "privacy_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "reactivation_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" text NOT NULL,
	"user_id" integer NOT NULL,
	"reason" text NOT NULL,
	"documents" text,
	"status" text DEFAULT 'Pending' NOT NULL,
	"admin_id" integer,
	"admin_note" text,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "reactivation_requests_request_id_unique" UNIQUE("request_id")
);
--> statement-breakpoint
CREATE TABLE "search_activity" (
	"id" serial PRIMARY KEY NOT NULL,
	"ip_address" text NOT NULL,
	"user_agent" text,
	"search_query" text,
	"search_filters" json,
	"result_count" integer DEFAULT 0,
	"session_id" text,
	"user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"metric_type" text NOT NULL,
	"metric_value" integer DEFAULT 1 NOT NULL,
	"user_id" integer,
	"metadata" json,
	"recorded_at" timestamp DEFAULT now() NOT NULL,
	"created_date" date DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"data_type" text DEFAULT 'string' NOT NULL,
	"description" text,
	"updated_by" integer,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"reviewer_id" integer NOT NULL,
	"reviewee_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"content" text NOT NULL,
	"media_files" jsonb DEFAULT '[]',
	"is_reported" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "two_factor_auth" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"secret" text,
	"backup_codes" json DEFAULT '[]'::json,
	"enabled_at" timestamp,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"badge_id" integer NOT NULL,
	"earned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"verification_type" text NOT NULL,
	"document_type" text,
	"document_number" text,
	"document_images" json DEFAULT '[]'::json,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"password" text NOT NULL,
	"full_name" text NOT NULL,
	"date_of_birth" text NOT NULL,
	"blood_group" text NOT NULL,
	"weight" integer NOT NULL,
	"district" text NOT NULL,
	"upazila" text NOT NULL,
	"address" text NOT NULL,
	"last_donation_date" text,
	"is_verified" boolean DEFAULT false,
	"is_available" boolean DEFAULT true,
	"donation_count" integer DEFAULT 0,
	"rating" integer DEFAULT 5,
	"profile_picture" text,
	"cover_photo" text,
	"bio" text,
	"education" text,
	"work" text,
	"current_city" text,
	"hometown" text,
	"social_links" jsonb DEFAULT '{}',
	"blood_donation_history" jsonb DEFAULT '[]',
	"is_admin" boolean DEFAULT false,
	"gender" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "verification_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" text NOT NULL,
	"user_id" integer NOT NULL,
	"verification_type" text NOT NULL,
	"documents" text,
	"reason" text,
	"status" text DEFAULT 'Pending' NOT NULL,
	"admin_id" integer,
	"admin_note" text,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "verification_requests_request_id_unique" UNIQUE("request_id")
);
--> statement-breakpoint
CREATE TABLE "work_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"company" text NOT NULL,
	"position" text NOT NULL,
	"city" text NOT NULL,
	"description" text,
	"start_date" text NOT NULL,
	"end_date" text,
	"is_current_job" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "admin_audit_log" ADD CONSTRAINT "admin_audit_log_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blood_issuance" ADD CONSTRAINT "blood_issuance_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bulk_operations_log" ADD CONSTRAINT "bulk_operations_log_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_logs" ADD CONSTRAINT "communication_logs_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_logs" ADD CONSTRAINT "communication_logs_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_logs" ADD CONSTRAINT "communication_logs_request_id_emergency_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."emergency_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation_appointments" ADD CONSTRAINT "donation_appointments_donor_id_users_id_fk" FOREIGN KEY ("donor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation_appointments" ADD CONSTRAINT "donation_appointments_seeker_id_users_id_fk" FOREIGN KEY ("seeker_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation_appointments" ADD CONSTRAINT "donation_appointments_request_id_emergency_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."emergency_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation_history" ADD CONSTRAINT "donation_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_donor_id_users_id_fk" FOREIGN KEY ("donor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "education_history" ADD CONSTRAINT "education_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD CONSTRAINT "emergency_blood_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD CONSTRAINT "emergency_blood_requests_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_blood_requests" ADD CONSTRAINT "emergency_blood_requests_rejected_by_users_id_fk" FOREIGN KEY ("rejected_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_requests" ADD CONSTRAINT "emergency_requests_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "otp_codes" ADD CONSTRAINT "otp_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "privacy_settings" ADD CONSTRAINT "privacy_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactivation_requests" ADD CONSTRAINT "reactivation_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactivation_requests" ADD CONSTRAINT "reactivation_requests_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_activity" ADD CONSTRAINT "search_activity_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_analytics" ADD CONSTRAINT "system_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_reviewee_id_users_id_fk" FOREIGN KEY ("reviewee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factor_auth" ADD CONSTRAINT "two_factor_auth_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_badges_badge_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("badge_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_verifications" ADD CONSTRAINT "user_verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_verifications" ADD CONSTRAINT "user_verifications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_history" ADD CONSTRAINT "work_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;