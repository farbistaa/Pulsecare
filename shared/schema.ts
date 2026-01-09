import { pgTable, varchar, decimal, text, serial, integer, boolean, timestamp, jsonb, json, date,time, index, numeric } from "drizzle-orm/pg-core";
import { is, not, relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  bloodGroup: text("blood_group").notNull(),
  weight: integer("weight").notNull(),
  district: text("district").notNull(),
  upazila: text("upazila").notNull(),
  address: text("address").notNull(),
  isVerified: boolean("is_verified").default(false),
  isAvailable: boolean("is_available").default(true),
  isElgible: boolean("is_eligible").default(true),
  isActive: boolean("is_active").default(true),
  donationCount: integer("donation_count").default(0),
  rating: integer("rating").default(5),
  profilePicture: text("profile_picture"),
  coverPhoto: text("cover_photo"),
  bio: text("bio"),
  education: text("education"),
  work: text("work"),
  currentCity: text("current_city"),
  hometown: text("hometown"),
  socialLinks: jsonb("social_links").default('{}'),
  bloodDonationHistory: jsonb("blood_donation_history").default('[]'),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  donorId: varchar('donorId', { length: 255 }).unique(),
  isSystemCreated: boolean('is_system_created').default(false),
  status: varchar('status', { length: 50 }),
  age: integer('age'),
  hemoglobin: numeric('hemoglobin', { precision: 4, scale: 1 }),
  lastDonationDate: text('last_donation_date'),
  gender: text("gender"),
  division: varchar('division', { length: 256 }),
  stat: varchar('stat', { length: 50 }),
  data_processing: boolean('data_processing').notNull().default(false),
  marketing: boolean('marketing').notNull().default(false),
  emergency_contact: boolean('emergency_contact').notNull().default(false),
}, (t) => ({
  bloodGroupIdx: index("users_blood_group_idx").on(t.bloodGroup),
  districtIdx: index("users_district_idx").on(t.district),
  divisionIdx: index("users_division_idx").on(t.division),
  isAvailableIdx: index("users_is_available_idx").on(t.isAvailable),
  donorSearchIdx: index("users_donor_search_idx").on(t.bloodGroup, t.district, t.isAvailable),
}));

export const emergencyBloodRequests = pgTable("emergency_blood_requests", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isCritical: boolean("is_critical").default(false),
  status: text("status").notNull().default("pending"),
  requesterId: varchar("requester_id").references(() => users.id),
  responderId: varchar("responder_id").references(() => users.id),
  patientName: text("patient_name").notNull(),
  patientAge: integer("patient_age").notNull(),
  bloodGroup: text("blood_group").notNull(),
  unitsRequired: integer("units_required").notNull(),
  requiredBy: text("required_by").notNull(),
  emergencyType: text("emergency_type").default("null"),
  additionalInfo: text("additional_info"),
  hospitalName: text("hospital_name").notNull(),
  hospitalAddress: text("hospital_address").notNull(),
  upazila: text("upazila"),
  district: text("district"),
  division: text("division"),
  latitude: numeric("latitude"),
  longitude: numeric("longitude"),
  doctorName: text("doctor_name").notNull(),
  contactPerson: text("contact_person"),
  reason: text("reason"),
  documents: jsonb("documents"),
  autoApproved: boolean("auto_approved"),
  approvedAt: timestamp("approved_at"),
  approvalType: text("approval_type").$type<"system" | "admin">(),
  approvedBy: integer("approved_by").references(() => users.id),
  rejectedAt: timestamp("rejected_at"),
  rejectedBy: integer("rejected_by").references(() => users.id),
  rejectionReason: text("rejection_reason"),
  ipAddress: text("ip_address"),
  deviceInfo: text("device_info"),
  contactNumber: text("contact_number").notNull(),
}, (t) => ({
  bloodGroupIdx: index("emergency_blood_req_blood_group_idx").on(t.bloodGroup),
  statusIdx: index("emergency_blood_req_status_idx").on(t.status),
  urgencyLevelIdx: index("emergency_blood_req_urgency_idx").on(t.emergencyType),
  emergencyManagementIdx: index("emergency_management_idx").on(t.bloodGroup, t.status, t.emergencyType),
  userIdIdx: index("emergency_blood_req_user_idx").on(t.requesterId),
  createdAtIdx: index("emergency_blood_req_created_idx").on(t.createdAt),
}));

export const hospital = pgTable("hospital", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  nameIdx: index("hospital_name_idx").on(t.name),
  locationIdx: index("hospital_location_idx").on(t.location),
}));

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: varchar("senderid").notNull().references(() => users.id, { onDelete: 'cascade' }),
  recipientId: varchar("recipientid").notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
   senderIdx: index("messages_sender_idx").on(t.senderId),
    recipientIdx: index("messages_recipient_idx").on(t.recipientId),
    isReadIdx: index("messages_is_read_idx").on(t.isRead),
    conversationIdx: index("messages_conversation_idx").on(t.senderId, t.recipientId),
}));

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  reviewerId: varchar("reviewerid").references(() => users.donorId),
  revieweeId: varchar("revieweeid").references(() => users.donorId),
  rating: integer("rating").notNull(),
  content: text("content").notNull(),
  mediaFiles: jsonb("media_files").default('[]'),
  isReported: boolean("is_reported").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  reviewerIdx: index("testimonials_reviewer_idx").on(t.reviewerId),
  revieweeIdx: index("testimonials_reviewee_idx").on(t.revieweeId),
  ratingIdx: index("testimonials_rating_idx").on(t.rating),
}));

export const workHistory = pgTable("work_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  company: text("company").notNull(),
  position: text("position").notNull(),
  city: text("city").notNull(),
  description: text("description"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  isCurrentJob: boolean("is_current_job").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  userIdIdx: index("work_history_user_idx").on(t.userId),
  startDateIdx: index("work_history_start_date_idx").on(t.startDate),
}));

export const educationHistory = pgTable("education_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  institutionName: text("institution_name").notNull(),
  educationLevel: text("education_level").notNull(),
  major: text("major").notNull(),
  institutionType: text("institution_type").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  isGraduated: boolean("is_graduated").default(false),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  userIdIdx: index("education_history_user_idx").on(t.userId),
  institutionNameIdx: index("education_history_name_idx").on(t.institutionName),
}));

export const donationHistory = pgTable("donation_history", {
  id: serial("id").primaryKey(),
  donorId: integer("donorId").references(() => users.id).notNull(),
  hospitalName: text("hospital_name").notNull(),
  hospitalLocation: text("hospital_location").notNull(),
  donationDate: text("donation_date").notNull(),
  donationType: text("donation_type").notNull(),
  donationVolume: integer("donation_volume").notNull(),
  donationUnit: text("donation_unit").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  userIdIdx: index("donation_history_user_Idx").on(t.donorId),
  donationDateIdx: index("donation_history_date_Idx").on(t.donationDate),
  donationTypeIdx: index("donation_history_type_Idx").on(t.donationType),
}));

export const medicalHistory = pgTable("medical_history", {
  id: serial("id").primaryKey(),
  donorId: varchar("donorId", { length: 255 }).references(() => users.donorId, { onDelete: "cascade" }).notNull(),
  healthStatus: text("health_status").notNull().default('Healthy'),
  systolic: integer("systolic"),
  diastolic: integer("diastolic"),
  lastChecked: timestamp("last_checked"),
  chronicConditions: jsonb("chronic_conditions").default('[]'),
  vaccinations: jsonb("vaccinations").default('[]'),
  smokingStatus: varchar("smoking_status", { length: 50 }).default('not_specified'),
  alcoholConsumption: varchar("alcohol_consumption", { length: 50 }).default('not_specified'),
  drugUse: varchar("drug_use", { length: 50 }).default('not_specified'),
  allergies: jsonb("allergies").default('[]'),
  currentMedications: jsonb("current_medications").default('[]'),
  importantNotes: text("important_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => ({
  donorIdIdx: index("medical_history_donor_Id_idx").on(t.donorId),
}));
export type MedicalHistory = typeof medicalHistory.$inferSelect;
export type NewMedicalHistory = typeof medicalHistory.$inferInsert;

export const twoFactorAuth = pgTable('two_factor_auth', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  isEnabled: boolean('is_enabled').default(false).notNull(),
  secret: text('secret'),
  backupCodes: json('backup_codes').$type<string[]>().default([]),
  enabledAt: timestamp('enabled_at'),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  userIdIdx: index("two_factor_auth_user_idx").on(t.userId),
  isEnabledIdx: index("two_factor_auth_enabled_idx").on(t.isEnabled),
}));

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  data: json('data'),
  isRead: boolean('is_read').default(false).notNull(),
  channels: json('channels').$type<string[]>().default(['web']).notNull(),
  deliveryStatus: json('delivery_status').$type<Record<string, 'pending' | 'sent' | 'failed'>>().default({}),
  scheduledFor: timestamp('scheduled_for'),
  sentAt: timestamp('sent_at'),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  userIdIdx: index("notifications_user_id_idx").on(t.userId),
  isReadIdx: index("notifications_is_read_idx").on(t.isRead),
  notificationCenterIdx: index("notification_center_idx").on(t.userId, t.isRead),
  typeIdx: index("notifications_type_idx").on(t.type),
}));

export const donationAppointments = pgTable('donation_appointments', {
  id: serial('id').primaryKey(),
  donorId: integer('donorId').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  seekerId: integer('seeker_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  requestId: integer('request_id').references(() => emergencyBloodRequests.id, { onDelete: 'cascade' }),
  appointmentDate: timestamp('appointment_date').notNull(),
  appointmentTime: text('appointment_time').notNull(),
  location: text('location').notNull(),
  hospitalName: text('hospital_name').notNull(),
  status: text('status').default('scheduled').notNull(),
  donorConfirmedAt: timestamp('donor_confirmed_at'),
  seekerConfirmedAt: timestamp('seeker_confirmed_at'),
  completedAt: timestamp('completed_at'),
  cancelledAt: timestamp('cancelled_at'),
  cancellationReason: text('cancellation_reason'),
  notes: text('notes'),
  googleCalendarEventId: text('google_calendar_event_id'),
  remindersSent: integer('reminders_sent').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  donorIdIdx: index("appointments_donorIdx").on(t.donorId),
  seekerIdIdx: index("appointments_seeker_idx").on(t.seekerId),
  statusIdx: index("appointments_status_idx").on(t.status),
  appointmentDateIdx: index("appointments_date_idx").on(t.appointmentDate),
  appointmentStatusIdx: index("appointments_status_date_idx").on(t.status, t.appointmentDate),
}));

export const userVerifications = pgTable('user_verifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  verificationType: text('verification_type').notNull(),
  documentType: text('document_type'),
  documentNumber: text('document_number'),
  documentImages: json('document_images').$type<string[]>().default([]),
  status: text('status').default('pending').notNull(),
  reviewedBy: integer('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  rejectionReason: text('rejection_reason'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  userIdIdx: index("user_verifications_user_idx").on(t.userId),
  statusIdx: index("user_verifications_status_idx").on(t.status),
  verificationTypeIdx: index("user_verifications_type_idx").on(t.verificationType),
}));

export const searchActivity = pgTable('search_activity', {
  id: serial('id').primaryKey(),
  ipAddress: text('ip_address').notNull(),
  userAgent: text('user_agent'),
  searchQuery: text('search_query'),
  searchFilters: json('search_filters'),
  resultCount: integer('result_count').default(0),
  sessionId: text('session_id'),
  userId: integer('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  userIdIdx: index("search_activity_user_idx").on(t.userId),
  sessionIdIdx: index("search_activity_session_idx").on(t.sessionId),
  createdAtIdx: index("search_activity_created_idx").on(t.createdAt),
}));

export const communicationLogs = pgTable('communication_logs', {
  id: serial('id').primaryKey(),
  fromUserId: integer('from_user_id').references(() => users.id, { onDelete: 'cascade' }),
  toUserId: integer('to_user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  requestId: integer('request_id').references(() => emergencyBloodRequests.id),
  communicationType: text('communication_type').notNull(),
  status: text('status').notNull(),
  duration: integer('duration'),
  content: text('content'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  fromUserIdIdx: index("comm_logs_from_user_idx").on(t.fromUserId),
  toUserIdIdx: index("comm_logs_to_user_idx").on(t.toUserId),
  communicationTypeIdx: index("comm_logs_type_idx").on(t.communicationType),
  statusIdx: index("comm_logs_status_idx").on(t.status),
}));

export const systemAnalytics = pgTable('system_analytics', {
  id: serial('id').primaryKey(),
  metricType: text('metric_type').notNull(),
  metricValue: integer('metric_value').default(1).notNull(),
  userId: integer('user_id').references(() => users.id),
  metadata: json('metadata'),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
  createdDate: date('created_date').defaultNow().notNull(),
}, (t) => ({
  metricTypeIdx: index("analytics_metric_type_idx").on(t.metricType),
  createdDateIdx: index("analytics_created_date_idx").on(t.createdDate),
  analyticsDashboardIdx: index("analytics_dashboard_idx").on(t.metricType, t.createdDate),
}));

export const otpCodes = pgTable('otp_codes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  identifier: text('identifier').notNull(),
  code: text('code').notNull(),
  purpose: text('purpose').notNull(),
  attempts: integer('attempts').default(0).notNull(),
  isUsed: boolean('is_used').default(false).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  userIdIdx: index("otp_codes_user_idx").on(t.userId),
  identifierIdx: index("otp_codes_identifier_idx").on(t.identifier),
  purposeIdx: index("otp_codes_purpose_idx").on(t.purpose),
  isUsedIdx: index("otp_codes_is_used_idx").on(t.isUsed),
  expiresAtIdx: index("otp_codes_expires_idx").on(t.expiresAt),
}));

export const privacySettings = pgTable("privacy_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  shareEmail: boolean("share_email").default(true).notNull(),
  sharePhone: boolean("share_phone").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  userIdIdx: index("privacy_settings_user_idx").on(t.userId),
}));

export const badges = pgTable("badges", {
  badgeId: serial("badge_id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  requirement: text("requirement").notNull(),
  description: text("description").notNull(),
  iconUrl: text("icon_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  typeIdx: index("badges_type_idx").on(t.type),
}));

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  badgeId: integer("badge_id").references(() => badges.badgeId).notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
}, (t) => ({
  userIdIdx: index("user_badges_user_idx").on(t.userId),
  badgeIdIdx: index("user_badges_badge_idx").on(t.badgeId),
  earnedAtIdx: index("user_badges_earned_at_idx").on(t.earnedAt),
}));

export const bloodInventory = pgTable("blood_inventory", {
  id: serial("id").primaryKey(),
  bloodGroup: text("blood_group").notNull(),
  units: integer("units").notNull().default(0),
  criticalThreshold: integer("critical_threshold").notNull().default(10),
  lastUpdated: timestamp("last_updated").defaultNow(),
}, (t) => ({
  bloodGroupIdx: index("inventory_blood_group_idx").on(t.bloodGroup),
}));

export const bloodDonations = pgTable("blood_donations", {
  id: serial("id").primaryKey(),
  donorId: varchar("donorId").notNull(),
  recipientId: varchar("recipientId"),
  recipientName: text("recipient_name"),
  hospitalName: text("hospital_name").notNull(),
  donationDate: text("donation_date").notNull(),
  bloodGroup: text("blood_group").notNull(),
  unitsGiven: integer("units_given").notNull(),
  status: text("status").notNull().default("completed"),
  notes: text("notes"),
  rating: integer("rating"),
  testimonial: text("testimonial"),
  donationType: text("donation_type"),
  hemoglobin: numeric("hemoglobin", { precision: 4, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  donorIdIdx: index("blood_donations_donorIdx").on(t.donorId),
  donationDateIdx: index("blood_donations_date_idx").on(t.donationDate),
  donationTypeIdx: index("blood_donations_type_idx").on(t.donationType),
}));

export const bloodIssuance = pgTable("blood_issuance", {
  id: serial("id").primaryKey(),
  bloodGroup: text("blood_group").notNull(),
  units: integer("units").notNull(),
  recipient: text("recipient"),
  hospital: text("hospital").notNull(),
  purpose: text("purpose"),
  issuanceDate: timestamp("issuance_date").notNull(),
  adminId: integer("admin_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  bloodGroupIdx: index("blood_issuance_blood_group_idx").on(t.bloodGroup),
  issuanceDateIdx: index("blood_issuance_date_idx").on(t.issuanceDate),
  adminIdIdx: index("blood_issuance_admin_idx").on(t.adminId),
}));

export const gbrRequests = pgTable(
  'gbr_requests',
  {
    id: serial('id').primaryKey(),
    createdAt: timestamp('created_at').defaultNow(),
    requesterId: varchar('requesterid', { length: 255 })
      .notNull()
      .references(() => users.donorId, { onDelete: 'cascade' }),
    recipientId: varchar('recipientId', { length: 255 })
      .notNull()
      .references(() => users.donorId, { onDelete: 'cascade' }),
    patientName: varchar('patient_name', { length: 255 }).notNull(),
    patientsProblem: text('patients_problem'),
    bloodGroup: varchar('blood_group', { length: 10 }).notNull(),
    hemoglobinPoint: decimal('hemoglobin_point', { precision: 4, scale: 2 }),
    unitsRequired: integer('units_required'),
    contactPersonsNumber: varchar('contact_persons_number', { length: 20 }).notNull(),
    donationDate: date('donation_date'),
    donationTime: time('donation_time'),
    hospitalName: varchar('hospital_name', { length: 255 }).notNull(),
    address: varchar('address', { length: 255 }),
    upazila: text('upazila'),
    district: text('district'),
    division: varchar('division', { length: 255 }),
   },
  (t) => ({
    requesterIdx: index('gbr_requester_idx').on(t.requesterId),
    recipientIdx: index('gbr_recipient_idx').on(t.recipientId),
    bloodGroupIdx: index('gbr_blood_group_idx').on(t.bloodGroup),
  }),
);

export const verificationRequests = pgTable("verification_requests", {
  id: serial("id").primaryKey(),
  requestId: text("request_id").notNull().unique(),
  userId: integer("user_id").references(() => users.id).notNull(),
  verificationType: text("verification_type").notNull(),
  documents: text("documents"),
  reason: text("reason"),
  status: text("status").notNull().default("Pending"),
  adminId: integer("admin_id").references(() => users.id),
  adminNote: text("admin_note"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  userIdIdx: index("verification_requests_user_idx").on(t.userId),
  statusIdx: index("verification_requests_status_idx").on(t.status),
  verificationTypeIdx: index("verification_requests_type_idx").on(t.verificationType),
  createdAtIdx: index("verification_requests_created_idx").on(t.createdAt),
}));

export const reactivationRequests = pgTable("reactivation_requests", {
  id: serial("id").primaryKey(),
  requestId: text("request_id").notNull().unique(),
  userId: integer("user_id").references(() => users.id).notNull(),
  reason: text("reason").notNull(),
  documents: text("documents"),
  status: text("status").notNull().default("Pending"),
  adminId: integer("admin_id").references(() => users.id),
  adminNote: text("admin_note"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  userIdIdx: index("reactivation_requests_user_idx").on(t.userId),
  statusIdx: index("reactivation_requests_status_idx").on(t.status),
  createdAtIdx: index("reactivation_requests_created_idx").on(t.createdAt),
}));

export const adminAuditLog = pgTable("admin_audit_log", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").references(() => users.id).notNull(),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id"),
  details: text("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  adminIdIdx: index("admin_audit_log_admin_idx").on(t.adminId),
  actionIdx: index("admin_audit_log_action_idx").on(t.action),
  targetTypeIdx: index("admin_audit_log_target_type_idx").on(t.targetType),
  createdAtIdx: index("admin_audit_log_created_idx").on(t.createdAt),
}));

export const notificationTemplates = pgTable("notification_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  subject: text("subject"),
  template: text("template").notNull(),
  variables: text("variables"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => ({
  typeIdx: index("notification_templates_type_idx").on(t.type),
  isActiveIdx: index("notification_templates_is_active_idx").on(t.isActive),
}));

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  key: text("key").notNull(),
  value: text("value").notNull(),
  dataType: text("data_type").notNull().default("string"),
  description: text("description"),
  updatedBy: integer("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => ({
  categoryIdx: index("system_settings_category_idx").on(t.category),
  keyIdx: index("system_settings_key_idx").on(t.key),
}));

export const bulkOperationsLog = pgTable("bulk_operations_log", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").references(() => users.id).notNull(),
  operation: text("operation").notNull(),
  targetType: text("target_type").notNull(),
  totalRecords: integer("total_records").notNull(),
  successCount: integer("success_count").notNull(),
  failureCount: integer("failure_count").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  adminIdIdx: index("bulk_operations_log_admin_idx").on(t.adminId),
  operationIdx: index("bulk_operations_log_operation_idx").on(t.operation),
  targetTypeIdx: index("bulk_operations_log_target_type_idx").on(t.targetType),
  createdAtIdx: index("bulk_operations_log_created_idx").on(t.createdAt),
}));

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  bloodDonations: many(bloodDonations),
  emergencyRequests: many(emergencyBloodRequests),
  workHistory: many(workHistory),
  educationHistory: many(educationHistory),
  donationHistory: many(donationHistory),
  testimonialsGiven: many(testimonials, { relationName: "reviewer" }),
  testimonialsReceived: many(testimonials, { relationName: "reviewee" }),
}));

export const bloodDonationsRelations = relations(bloodDonations, ({ one }) => ({
  donor: one(users, {
    fields: [bloodDonations.donorId],
    references: [users.donorId],
  }),
}));

export const emergencyRequestsRelations = relations(emergencyBloodRequests, ({ one }) => ({
  requester: one(users, {
    fields: [emergencyBloodRequests.requesterId],
    references: [users.id],
  }),
}));

export const workHistoryRelations = relations(workHistory, ({ one }) => ({
  user: one(users, {
    fields: [workHistory.userId],
    references: [users.id],
  }),
}));

export const educationHistoryRelations = relations(educationHistory, ({ one }) => ({
  user: one(users, {
    fields: [educationHistory.userId],
    references: [users.id],
  }),
}));

export const donationHistoryRelations = relations(donationHistory, ({ one }) => ({
  user: one(users, {
    fields: [donationHistory.donorId],
    references: [users.id],
  }),
}));

export const testimonialsRelations = relations(testimonials, ({ one }) => ({
  reviewer: one(users, {
    fields: [testimonials.reviewerId],
    references: [users.donorId],
    relationName: "reviewer",
  }),
  reviewee: one(users, {
    fields: [testimonials.revieweeId],
    references: [users.donorId],
    relationName: "reviewee",
  }),
}));

export const twoFactorAuthRelations = relations(twoFactorAuth, ({ one }) => ({
  user: one(users, {
    fields: [twoFactorAuth.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const donationAppointmentsRelations = relations(donationAppointments, ({ one }) => ({
  donor: one(users, {
    fields: [donationAppointments.donorId],
    references: [users.id],
    relationName: "donor",
  }),
  seeker: one(users, {
    fields: [donationAppointments.seekerId],
    references: [users.id],
    relationName: "seeker",
  }),
  request: one(emergencyBloodRequests, {
    fields: [donationAppointments.requestId],
    references: [emergencyBloodRequests.id],
  }),
}));

export const userVerificationsRelations = relations(userVerifications, ({ one }) => ({
  user: one(users, {
    fields: [userVerifications.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [userVerifications.reviewedBy],
    references: [users.id],
    relationName: "reviewer",
  }),
}));

export const searchActivityRelations = relations(searchActivity, ({ one }) => ({
  user: one(users, {
    fields: [searchActivity.userId],
    references: [users.id],
  }),
}));

export const communicationLogsRelations = relations(communicationLogs, ({ one }) => ({
  fromUser: one(users, {
    fields: [communicationLogs.fromUserId],
    references: [users.id],
    relationName: "fromUser",
  }),
  toUser: one(users, {
    fields: [communicationLogs.toUserId],
    references: [users.id],
    relationName: "toUser",
  }),
  request: one(emergencyBloodRequests, {
    fields: [communicationLogs.requestId],
    references: [emergencyBloodRequests.id],
  }),
}));

export const systemAnalyticsRelations = relations(systemAnalytics, ({ one }) => ({
  user: one(users, {
    fields: [systemAnalytics.userId],
    references: [users.id],
  }),
}));

export const otpCodesRelations = relations(otpCodes, ({ one }) => ({
  user: one(users, {
    fields: [otpCodes.userId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  donationCount: true,
  rating: true,
  isVerified: true,
  isAdmin: true,
  createdAt: true,
  donorId: true,
  isSystemCreated: true,
  status: true,
  age: true,
  hemoglobin: true,
  lastDonationDate: true,
  gender: true,
  division: true,
  stat: true,
}).extend({
  fullName: z.string()
    .min(1, "Full name is required")
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name must not exceed 50 characters")
    .regex(/^[A-Za-z\s]+$/, "Full name should only contain letters and spaces"),
  username: z.string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must not exceed 30 characters")
    .regex(/^[A-Za-z0-9_]+$/, "Username should only contain letters, numbers, and underscores"),
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phone: z.string()
    .min(1, "Phone number is required")
    .regex(/^(\+88)?01[3-9]\d{8}$/, "Please enter a valid Bangladeshi phone number"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must not exceed 50 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  dateOfBirth: z.string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const birth = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birth.getFullYear();
      return age >= 18 && age <= 65;
    }, "Age must be between 18 and 65 years"),
  weight: z.number()
    .min(30, "Weight must be at least 30 kg")
    .max(200, "Weight must not exceed 200 kg")
    .int("Weight must be a whole number"),
  address: z.string()
    .min(1, "Address is required")
    .min(10, "Address must be at least 10 characters")
    .max(200, "Address must not exceed 200 characters"),
  lastDonation: z.string().optional().refine((date) => {
    if (!date) return true;
    const lastDonation = new Date(date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastDonation.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 120;
  }, "Last donation must be at least 120 days ago"),
  terms: z.boolean().refine((val) => val === true, "You must accept the terms"),
  data_processing: z.boolean().refine((val) => val === true, {
    message: "Consent for data processing is required"
  }),
  marketing: z.boolean().refine((val) => val === true, {
    message: "Consent for marketing is required"
  }),
  emergency_contact: z.boolean().refine((val) => val === true, {
    message: "Consent for emergency contact is required"
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
  
});

// Create a new schema that includes all fields from the original plus the consent fields
const registerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  bloodGroup: z.string().min(1, "Blood group is required"),
  weight: z.number().min(50, "Weight must be at least 50kg"),
  district: z.string().min(1, "District is required"),
  upazila: z.string().min(1, "Upazila is required"),
  address: z.string().min(1, "Address is required"),
  lastDonation: z.string().optional(),
  terms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  }),
  data_processing: z.boolean(),
  marketing: z.boolean(),
  emergency_contact: z.boolean(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
export const loginSchema = z.object({
  identifier: z.string().min(1, "Username, email or phone is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export const insertEmergencyRequestSchema = createInsertSchema(emergencyBloodRequests).omit({
  id: true,
  requesterId: true,
  responderId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  requesterId: z.string(),
});

export const insertBloodDonationSchema = createInsertSchema(bloodDonations).omit({
  id: true,
  createdAt: true,
});

export const requestPasswordResetSchema = z.object({
  identifier: z.string().min(1, "Email or phone number is required"),
});

export const verifyPasswordResetSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password confirmation is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const insertWorkHistorySchema = createInsertSchema(workHistory).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  description: z.string().max(1000, "Description must not exceed 1000 characters").optional(),
});


export const insertEducationHistorySchema = createInsertSchema(educationHistory).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  degree: z.string(),
  institution: z.string(),
  startYear: z.string(),
  endYear: z.string().optional(),
  type: z.string(),
  description: z.string().max(1000).optional(),
});

export const insertDonationHistorySchema = createInsertSchema(donationHistory).omit({
  id: true,
  donorId: true,
  createdAt: true,
}).extend({
  // Make fields that are not in the edit form optional
  donationPicture: z.string().optional(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  isReported: true,
  createdAt: true,
}).extend({
  content: z.string().max(5000, "Testimonial must not exceed 5000 characters"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must not exceed 5"),
});


export const updateProfileSchema = z.object({
  bio: z.string().max(250, "Bio must not exceed 250 characters").optional(),
  currentCity: z.string().optional(),
  hometown: z.string().optional(),
  socialLinks: z.object({
    facebook: z.string().url().optional().or(z.literal("")),
    instagram: z.string().url().optional().or(z.literal("")),
    twitter: z.string().url().optional().or(z.literal("")),
    github: z.string().url().optional().or(z.literal("")),
    linkedin: z.string().url().optional().or(z.literal("")),
    portfolio: z.string().url().optional().or(z.literal("")),
  }).optional(),
});


// In your schema.ts file

// --- SCHEMAS FOR UPDATING (These are correct, match your frontend) ---
export const updateWorkHistorySchema = z.object({
  position: z.string().optional(),
  company: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  city: z.string().optional(),
  description: z.string().max(1000).optional(),
  isCurrentJob: z.boolean().optional(),
});


export const updateEducationHistorySchema = z.object({
  degree: z.string().optional(),
  institution: z.string().optional(),
  startYear: z.string().optional(),
  endYear: z.string().optional(),
  type: z.string().optional(),
  description: z.string().max(1000).optional(),
});

export const updateDonationHistorySchema = z.object({
  date: z.string().optional(),
  hospital: z.string().optional(),
  location: z.string().optional(),
  volume: z.string().optional(),
  donationType: z.string().optional(),
});




export const insertPrivacySettingsSchema = createInsertSchema(privacySettings).omit({
  id: true,
  createdAt: true,
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  badgeId: true,
  createdAt: true,
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  earnedAt: true,
});

export const insertBloodInventorySchema = createInsertSchema(bloodInventory).omit({ 
  id: true, 
  lastUpdated: true 
});

export const insertBloodIssuanceSchema = createInsertSchema(bloodIssuance).omit({ 
  id: true, 
  createdAt: true 
});

export const insertEmergencyBloodRequestSchema = createInsertSchema(emergencyBloodRequests).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertVerificationRequestSchema = createInsertSchema(verificationRequests).omit({ 
  id: true, 
  createdAt: true 
});

export const insertReactivationRequestSchema = createInsertSchema(reactivationRequests).omit({ 
  id: true, 
  createdAt: true 
});

export const insertAdminAuditLogSchema = createInsertSchema(adminAuditLog).omit({ 
  id: true, 
  createdAt: true 
});

export const insertNotificationTemplateSchema = createInsertSchema(notificationTemplates).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({ 
  id: true, 
  updatedAt: true 
});

export const insertBulkOperationLogSchema = createInsertSchema(bulkOperationsLog).omit({ 
  id: true, 
  createdAt: true 
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginRequest = z.infer<typeof loginSchema>;
export type EmergencyBloodRequest = typeof emergencyBloodRequests.$inferSelect;
export type NewEmergencyBloodRequest = typeof emergencyBloodRequests.$inferInsert;
export type InsertEmergencyRequest = z.infer<typeof insertEmergencyRequestSchema>;
export type BloodDonation = typeof bloodDonations.$inferSelect;
export type InsertBloodDonation = z.infer<typeof insertBloodDonationSchema>;
export type RequestPasswordReset = z.infer<typeof requestPasswordResetSchema>;
export type VerifyPasswordReset = z.infer<typeof verifyPasswordResetSchema>;
export type WorkHistory = typeof workHistory.$inferSelect;
export type InsertWorkHistory = z.infer<typeof insertWorkHistorySchema>;
export type EducationHistory = typeof educationHistory.$inferSelect;
export type InsertEducationHistory = z.infer<typeof insertEducationHistorySchema>;
export type DonationHistory = typeof donationHistory.$inferSelect;
export type InsertDonationHistory = z.infer<typeof insertDonationHistorySchema>;
export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type InsertPrivacySettings = typeof privacySettings.$inferInsert;
export type PrivacySettings = typeof privacySettings.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;
export type Badge = typeof badges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;
export type UserBadge = typeof userBadges.$inferSelect;
export type BloodInventory = typeof bloodInventory.$inferSelect;
export type BloodIssuance = typeof bloodIssuance.$inferSelect;
export type VerificationRequest = typeof verificationRequests.$inferSelect;
export type ReactivationRequest = typeof reactivationRequests.$inferSelect;
export type AdminAuditLog = typeof adminAuditLog.$inferSelect;
export type NotificationTemplate = typeof notificationTemplates.$inferSelect;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type BulkOperationLog = typeof bulkOperationsLog.$inferSelect;