import { eq, and, or, sql, SQL, ilike, desc, gte, lte, count, inArray, like } from "drizzle-orm";
import { gbrRequests } from "@shared/schema";
import { MedicalHistory, NewMedicalHistory } from "@shared/schema";
import {
  users,
  emergencyBloodRequests,
  testimonials,
  workHistory,
  educationHistory,
  donationHistory,
  messages,
  privacySettings,
  badges,
  userBadges,
  bloodInventory,
  bloodDonations,
  bloodIssuance,
  verificationRequests,
  reactivationRequests,
  adminAuditLog,
  notificationTemplates,
  systemSettings,
  bulkOperationsLog,
  hospital as hospitalTable,
  notifications,
  userVerifications,
  type User,
  type InsertUser,
  type EmergencyBloodRequest,
  type InsertEmergencyRequest,
  type BloodDonation,
  type InsertBloodDonation,
  type WorkHistory,
  type InsertWorkHistory,
  type EducationHistory,
  type InsertEducationHistory,
  type DonationHistory,
  type InsertDonationHistory,
  type Testimonial,
  type InsertTestimonial,
  type PrivacySettings,
  type InsertPrivacySettings,
  type Badge,
  type InsertBadge,
  type BloodInventory,
  type BloodIssuance,
  type VerificationRequest,
  type ReactivationRequest,
  type AdminAuditLog,
  type NotificationTemplate,
  type SystemSetting,
  type BulkOperationLog,
  type UserBadge,
} from "@shared/schema";
import { db } from "./db";
import bcrypt from "bcryptjs";

export interface Storage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  getUserByIdentifier(identifier: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  searchDonors(filters: {
    bloodGroup?: string;
    district?: string;
    isAvailable?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ donors: User[], total: number }>;
  healthCheck(): Promise<void>;

  // Emergency request methods
  createEmergencyRequest(request: InsertEmergencyRequest): Promise<EmergencyBloodRequest>;
  getEmergencyRequests(): Promise<EmergencyBloodRequest[]>;
  getEmergencyRequestById(id: number): Promise<EmergencyBloodRequest | undefined>;
  updateEmergencyRequestStatus(id: number, status: string): Promise<EmergencyBloodRequest | undefined>;
  
  // Donation methods
  createDonation(donation: InsertBloodDonation): Promise<BloodDonation>;
  getDonationsByDonor(donorId: number): Promise<BloodDonation[]>;
  getAllDonations(): Promise<BloodDonation[]>;
  
  // Auth methods
  validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
  
  // Password reset methods
  storePasswordResetOtp(userId: number, otp: string, token: string): Promise<void>;
  verifyPasswordResetOtp(token: string, otp: string): Promise<number | null>;
  clearPasswordResetOtp(token: string): Promise<void>;
  updateUserPassword(userId: number, newPassword: string): Promise<void>;
  
  // Profile methods
  getUserProfile(userId: number): Promise<any>;
  updateUserProfile(userId: number, data: any): Promise<void>;
  updateProfilePhoto(userId: number, photoPath: string): Promise<void>;
  updateCoverPhoto(userId: number, photoPath: string): Promise<void>;
  
  // Work history methods
  getUserWorkHistory(userId: number): Promise<any[]>;
  addWorkHistory(userId: number, data: any): Promise<any>;
  updateWorkHistory(id: number, data: any): Promise<void>;
  deleteWorkHistory(id: number): Promise<void>;
  
  // Education history methods
  getUserEducationHistory(userId: number): Promise<any[]>;
  addEducationHistory(userId: number, data: any): Promise<any>;
  updateEducationHistory(id: number, data: any): Promise<void>;
  deleteEducationHistory(id: number): Promise<void>;
  
  // Donation history methods
  getUserDonationHistory(userId: number): Promise<any[]>;
  addDonationHistory(userId: number, data: any): Promise<any>;
  updateDonationHistory(id: number, data: any): Promise<void>;
  deleteDonationHistory(id: number): Promise<void>;
  
  // Testimonial methods
  getUserTestimonials(userId: number): Promise<any[]>;
  addTestimonial(data: any): Promise<any>;
  reportTestimonial(id: number): Promise<void>;
  
  // Comprehensive BDMS methods
  // 2FA methods
  enable2FA(userId: number, secret: string, backupCodes: string[]): Promise<void>;
  disable2FA(userId: number): Promise<void>;
  verify2FA(userId: number, code: string): Promise<boolean>;
  get2FAStatus(userId: number): Promise<any>;
  
  // Notification methods
  createNotification(notification: any): Promise<any>;
  getUserNotifications(userId: number, unreadOnly?: boolean): Promise<any[]>;
  markNotificationRead(notificationId: number): Promise<void>;
  markAllNotificationsRead(userId: number): Promise<void>;
  
  // Appointment scheduling methods
  createAppointment(appointment: any): Promise<any>;
  getUserAppointments(userId: number): Promise<any[]>;
  updateAppointmentStatus(appointmentId: number, status: string, userId: number): Promise<void>;
  getUpcomingAppointments(userId: number): Promise<any[]>;
  
  // User verification methods
  submitVerification(verification: any): Promise<any>;
  getUserVerifications(userId: number): Promise<any[]>;
  updateVerificationStatus(verificationId: number, status: string, reviewerId: number, reason?: string): Promise<void>;
  getPendingVerifications(): Promise<any[]>;
  
  // Search activity tracking
  logSearchActivity(activity: any): Promise<void>;
  getSearchActivityByIP(ipAddress: string, timeFrame: number): Promise<number>;
  
  // Communication logs
  logCommunication(log: any): Promise<any>;
  getCommunicationHistory(userId: number): Promise<any[]>;
  
  // Analytics methods
  recordAnalytic(metric: string, value: number, userId?: number, metadata?: any): Promise<void>;
  getAnalytics(dateRange: { start: Date; end: Date }, metricTypes?: string[]): Promise<any[]>;
  getDashboardStats(): Promise<any>;
  
  // OTP management
  generateOTP(userId: number, identifier: string, purpose: string): Promise<string>;
  verifyOTP(identifier: string, code: string, purpose: string): Promise<boolean>;
  cleanupExpiredOTPs(): Promise<void>;
  
  // Privacy Settings methods
  getPrivacySettings(userId: number): Promise<PrivacySettings | null>;
  updatePrivacySettings(userId: number, settings: Partial<PrivacySettings>): Promise<void>;
  createPrivacySettings(settings: InsertPrivacySettings): Promise<PrivacySettings>;
  
  // Badge System methods
  getAllBadges(): Promise<Badge[]>;
  getUserBadges(userId: number): Promise<UserBadge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  awardBadge(userId: number, badgeId: number): Promise<UserBadge>;
  checkAndAwardMilestoneBadges(userId: number): Promise<UserBadge[]>;
  
  // Admin & Inventory Management
  getBloodInventory(): Promise<BloodInventory[]>;
  updateBloodInventory(bloodGroup: string, units: number): Promise<BloodInventory>;
  getBloodInventoryByGroup(bloodGroup: string): Promise<BloodInventory | undefined>;
  
  // Blood Donations Admin
  recordBloodDonation(donation: Omit<BloodDonation, 'id' | 'createdAt'>): Promise<BloodDonation>;
  getBloodDonations(filters?: { donorId?: string; hospitalName?: string; dateFrom?: Date; dateTo?: Date; status?: string }): Promise<BloodDonation[]>;
  updateBloodDonation(id: number, updates: Partial<BloodDonation>): Promise<BloodDonation | undefined>;
  deleteBloodDonation(id: number): Promise<boolean>;
  
  // Blood Issuance
  recordBloodIssuance(issuance: Omit<BloodIssuance, 'id' | 'createdAt'>): Promise<BloodIssuance>;
  getBloodIssuances(filters?: { bloodGroup?: string; hospital?: string; dateFrom?: Date; dateTo?: Date }): Promise<BloodIssuance[]>;
  
  // Emergency Blood Requests Admin
  getEmergencyBloodRequestsAdmin(filters?: { status?: string; bloodGroup?: string; hospitalName?: string; dateFrom?: Date; dateTo?: Date }): Promise<EmergencyBloodRequest[]>;
  getEmergencyBloodRequestByIdAdmin(id: number): Promise<EmergencyBloodRequest | undefined>;
  updateEmergencyBloodRequestStatusAdmin(id: number, status: string, adminId: number, note?: string): Promise<EmergencyBloodRequest | undefined>;
  createEmergencyBloodRequestAdmin(request: Omit<EmergencyBloodRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmergencyBloodRequest>;
  autoApproveEmergencyRequests(cutoffTime: Date): Promise<EmergencyBloodRequest[]>;
  bulkUpdateEmergencyRequests(ids: number[], updates: Partial<EmergencyBloodRequest>, adminId: number): Promise<number>;
  
  // Verification Requests
  getVerificationRequestsAdmin(filters?: { status?: string; verificationType?: string; dateFrom?: Date; dateTo?: Date }): Promise<VerificationRequest[]>;
  getVerificationRequestByIdAdmin(id: number): Promise<VerificationRequest | undefined>;
  updateVerificationRequestAdmin(id: number, updates: Partial<VerificationRequest>): Promise<VerificationRequest | undefined>;
  
  // Reactivation Requests
  getReactivationRequestsAdmin(filters?: { status?: string; dateFrom?: Date; dateTo?: Date }): Promise<ReactivationRequest[]>;
  getReactivationRequestByIdAdmin(id: number): Promise<ReactivationRequest | undefined>;
  updateReactivationRequestAdmin(id: number, updates: Partial<ReactivationRequest>): Promise<ReactivationRequest | undefined>;
  
  // Admin Audit Logging
  logAdminAction(log: Omit<AdminAuditLog, 'id' | 'createdAt'>): Promise<AdminAuditLog>;
  getAdminAuditLogs(filters?: { adminId?: number; action?: string; targetType?: string; dateFrom?: Date; dateTo?: Date }): Promise<AdminAuditLog[]>;
  
  // Admin Analytics & Reports
  getDonorAnalytics(): Promise<{
    totalDonors: number;
    activeDonors: number;
    verifiedDonors: number;
    donorsByBloodGroup: { bloodGroup: string; count: number }[];
    donorsByDistrict: { district: string; count: number }[];
    donorsByAge: { ageGroup: string; count: number }[];
    donorsByGender: { male: number; female: number; other: number };
    recentRegistrations: { date: string; count: number }[];
  }>;
  getDonationAnalytics(): Promise<{
    totalDonations: number;
    donationsThisMonth: number;
    donationsByBloodGroup: { bloodGroup: string; count: number }[];
    donationTrends: { month: string; count: number }[];
    topHospitals: { hospital: string; count: number }[];
  }>;
  getInventoryAnalytics(): Promise<{
    totalUnits: number;
    criticalLevels: BloodInventory[];
    utilizationRate: number;
    turnoverRate: { bloodGroup: string; rate: number }[];
  }>;
  getEmergencyRequestAnalytics(): Promise<{
    totalRequests: number;
    pendingRequests: number;
    fulfilledRequests: number;
    responseTime: number;
    requestsByUrgency: { urgency: string; count: number }[];
    criticalAlerts: number;
  }>;
  
  // Donor Management Admin
  getAllUsersWithFilters(filters?: {
    bloodGroup?: string;
    district?: string;
    isVerified?: string;
    isAvailable?: string;
    isAdmin?: string;
    dateFrom?: Date;
    dateTo?: Date;
    search?: string;
    limit?: string;
    offset?: string;
    sortBy?: string;
    status?: string;
    donorid?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<{ 
    users: User[]; 
    total: number;
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      startItem: number;
      endItem: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    }
  }>;
  getTotalUsersCount(): Promise<number>;
  getPaginationMetadata(total: number, limit: number, offset: number): Promise<{
    currentPage: number;
    totalPages: number;
    totalItems: number;
    startItem: number;
    endItem: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>;
  bulkUpdateUsers(userIds: number[], updates: Partial<User>, adminId: number): Promise<number>;
  deactivateUser(userId: number, adminId: number, reason?: string): Promise<User | undefined>;
  reactivateUser(userId: number, adminId: number): Promise<User | undefined>;
  generatedonorId(): Promise<string>;
  
  // Enhanced Message methods
  sendMessage(senderId: number, receiverId: number, message: string): Promise<any>;
  getUserInbox(donorId: number): Promise<any[]>;
  markMessageAsRead(messageId: string): Promise<void>;
  
  // Privacy-aware profile methods
  getPrivacyAwareProfile(userId: number, requesterId?: number): Promise<any>;
  
  // NEW METHODS FOR ADMIN DASHBOARD
  getBasicStats(): Promise<{
    totalDonors: number;
    availableDonors: number;
    totalDonations: number;
    bloodRequests: number;
    pendingRequests: number;
    criticalAlerts: number;
    duplicateAlerts: number;
    readyToDonate: number;
    stats: any;
  }>;
  getDashboardData(timeRange?: string): Promise<{
    metrics: {
      donor: {
        totalDonors: number;
        activeDonors: number;
        donorsByBloodGroup: Array<{ name: string; count: number; percentage: number }>;
        donorsByGender: Array<{ gender: string; count: number }>;
        donorsByAge: Array<{ ageGroup: string; count: number }>;
        eligibleVsNot: Array<{ name: string; value: number; fill: string }>;
        recentRegistrations: Array<{ week: string; newRegistrations: number; activeDonations: number }>;
      };
      donation: {
        totalDonations: number;
        monthlyDonations: Array<{ month: string; count: number }>;
        multiYearTrends: Array<{ year: string; count: number }>;
        requestStatus: Array<{ status: string; count: number }>;
      };
      emergency: {
        totalRequests: number;
        pendingRequests: number;
        criticalAlerts: number;
        emergencyVsGeneral: Array<{ month: string; emergency: number; general: number }>;
        requestsByDistrict: Array<{ district: string; count: number }>;
        timeSensitive: Array<{ time: string; count: number }>;
      };
      inventory: {
        criticalLevels: Array<{ bloodGroup: string; units: number; criticalThreshold: number }>;
        utilizationRate: number;
      };
      geographic: {
        populationPyramid: Array<{ ageGroup: string; male: number; female: number }>;
        requestsByRadius: Array<{ radius: string; count: number }>;
        donorLocation: Array<{ district: string; donors: number; requests: number }>;
        geographicLocation: Array<{ district: string; donors: number }>;
      };
      engagement: {
        responseTime: Array<{ range: string; time: number; variability: number; min: number; max: number }>;
        ratingTrends: Array<{ category: string; q1: number; q2: number; q3: number; q4: number }>;
        fraudReports: Array<{ date: string; count: number }>;
      };
    };
    basicStats: {
      totalDonors: number;
      availableDonors: number;
      totalDonations: number;
      bloodRequests: number;
      pendingRequests: number;
      criticalAlerts: number;
      duplicateAlerts: number;
      readyToDonate: number;
      stats: any;
    };
  }>;
  
  // NEW METHODS FOR DASHBOARD CHARTS
  getDistrictWiseDonorDistribution(): Promise<Array<{ district: string; donors: number }>>;
  getDivisionWiseComparison(): Promise<Array<{ division: string; requests: number; donors: number }>>;
  getDonorStatusComparison(): Promise<Array<{ name: string; value: number; fill: string }>>;
  getDonationConversionFunnel(): Promise<Array<{ name: string; value: number; fill: string }>>;
  getEmergencyVsGeneralRequests(): Promise<Array<{ month: string; emergency: number; general: number }>>;
  getRequestsByDivision(): Promise<Array<{ division: string; count: number }>>;
  getBloodTypeDistribution(): Promise<Array<{ name: string; size: number; color: string }>>;
  getPopulationByAgeAndGender(): Promise<Array<{ ageGroup: string; male: number; female: number }>>;
  getDonorLocationDistribution(): Promise<Array<{ division: string; donors: number; requests: number }>>;
  
  // Hospital management methods
  getAllHospitals(): Promise<any[]>;
  getHospitalById(id: number): Promise<any>;
  createHospital(hospitalData: { name: string; location: string }): Promise<any>;
  updateHospital(id: number, updates: { name?: string; location?: string }): Promise<any>;
  deleteHospital(id: number): Promise<boolean>;
}

// In-memory store for password reset OTPs (expires in 15 minutes)
const passwordResetStore = new Map<string, { userId: number; otp: string; expires: number }>();

// Define blood groups array
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export class Databasestorage implements Storage {
  // Dashboard caching mechanism
  private dashboardCache: Record<string, {
    data: any;
    timestamp: number;
  }> = {};
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Safe column mapping for sorting to prevent SQL injection
  private sortableColumns: Record<string, any> = {
    id: users.id,
    username: users.username,
    full_name: users.fullName,
    email: users.email,
    phone: users.phone,
    bloodGroup: users.bloodGroup,
    district: users.district,
    division: users.division,
    isAvailable: users.isAvailable,
    rating: users.rating,
    donationCount: users.donationCount,
    lastDonationDate: users.lastDonationDate,
    createdAt: users.createdAt,
    status: users.status,
    age: users.age,
    gender: users.gender,
  };

  // Helper method to build paginated queries with filters
  private async buildPaginatedQuery<T>(
    table: any,
    conditions: any[],
    options?: {
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
      limit?: number;
      offset?: number;
      selectFields?: Record<string, any>;
    },
    useFiltersForCount: boolean = false
  ): Promise<{ data: T[], total: number }> {
    try {
      // Build count query - only apply filters if specified
      let countQuery;
      if (useFiltersForCount) {
        countQuery = db.select({ count: sql<number>`count(*)` })
          .from(table)
          .where(and(...conditions));
      } else {
        countQuery = db.select({ count: sql<number>`count(*)` }).from(table);
      }
      
      const [countResult] = await countQuery;
      const total = countResult.count;

      // Build data query - always apply filters
      let query;
      if (options?.selectFields) {
        query = db.select(options.selectFields).from(table).where(and(...conditions));
      } else {
        query = db.select().from(table).where(and(...conditions));
      }
      
      // Apply sorting safely
      if (options?.sortBy && this.sortableColumns[options.sortBy]) {
        const sortOrder = options.sortOrder === 'DESC' ? sql`desc` : sql`asc`;
        query = query.orderBy(sql`${this.sortableColumns[options.sortBy]} ${sortOrder}`);
      }
      
      // Apply pagination
      if (options?.limit !== undefined) {
        query = query.limit(options.limit);
      }
      if (options?.offset !== undefined) {
        query = query.offset(options.offset);
      }
      
      const data = await query as T[];
      
      return { data, total };
    } catch (error) {
      console.error("Error in buildPaginatedQuery:", error);
      console.error("Query details:", {
        table: table.name,
        conditions: conditions.length,
        options: JSON.stringify(options)
      });
      throw error; // Re-throw to allow proper error handling
    }
  }

  // Helper method to log admin actions
  private async logAdminActionHelper(
    adminId: number,
    action: string,
    targetType: string,
    targetId: string,
    details: any
  ): Promise<void> {
    try {
      await this.logAdminAction({
        adminId,
        action,
        targetType,
        targetId,
        details: typeof details === 'object' ? JSON.stringify(details) : details,
        ipAddress: null,
        userAgent: null
      });
    } catch (error) {
      console.error("Error in logAdminActionHelper:", error);
      throw error; // Re-throw to allow proper error handling
    }
  }

  async healthCheck(): Promise<void> {
    try {
      // Simple health check - try to execute a basic query
      await db.select({ count: sql<number>`count(*)` }).from(users);
      return;
    } catch (error) {
      console.error("Health check failed:", error);
      throw new Error("Database connection failed");
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error("Error in getUser:", error);
      throw error;
    }
  }
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    } catch (error) {
      console.error("Error in getUserByUsername:", error);
      throw error;
    }
  }
  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user || undefined;
    } catch (error) {
      console.error("Error in getUserByEmail:", error);
      throw error;
    }
  }
  async getUserByPhone(phone: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.phone, phone));
      return user || undefined;
    } catch (error) {
      console.error("Error in getUserByPhone:", error);
      throw error;
    }
  }
  async getUserByIdentifier(identifier: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(
        or(
          eq(users.donorId, identifier),
          eq(users.username, identifier),
          eq(users.email, identifier),
          eq(users.phone, identifier)
        )
      );
      return user || undefined;
    } catch (error) {
      console.error("Error in getUserByIdentifier:", error);
      throw error;
    }
  }
  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(insertUser.password, 10);
      const [user] = await db
        .insert(users)
        .values({
          ...insertUser,
          password: hashedPassword,
          lastDonationDate: insertUser.lastDonation || null,
          isVerified: false,
          isAvailable: true,
          donationCount: 0,
          rating: 50,
          profilePicture: null,
          coverPhoto: null,
          bio: null,
          education: null,
          work: null,
          isAdmin: false,
        })
        .returning();
      return user;
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  }
  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, id))
        .returning();
      return updatedUser || undefined;
    } catch (error) {
      console.error("Error in updateUser:", error);
      throw error;
    }
  }
  async getAllUsers(): Promise<User[]> {
    try {
      return db.select().from(users);
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      throw error;
    }
  }
  async searchDonors(filters: {
    bloodGroup?: string;
    district?: string;
    isAvailable?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ donors: User[], total: number }> {
    try {
      // Build conditions array
      const conditions = [eq(users.isAdmin, false)];
      
      if (filters.bloodGroup) {
        conditions.push(eq(users.bloodGroup, filters.bloodGroup));
      }
      if (filters.district) {
        conditions.push(eq(users.district, filters.district));
      }
      if (filters.isAvailable !== undefined) {
        conditions.push(eq(users.isAvailable, filters.isAvailable));
      }

      // Define the fields to select
      const selectFields = {
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        email: users.email,
        phone: users.phone,
        upazila: users.upazila,
        age: users.age,
        bloodGroup: users.bloodGroup,
        district: users.district,
        division: users.division,
        isAvailable: users.isAvailable,
        rating: users.rating,
        donationCount: users.donationCount,
        lastDonationDate: users.lastDonationDate,
        profilePicture: users.profilePicture,
      };

      // Use the helper method to build and execute the query
      const result = await this.buildPaginatedQuery<User>(
        users,
        conditions,
        {
          selectFields,
          sortBy: 'rating',
          sortOrder: 'DESC',
          limit: filters.limit || 50,
          offset: filters.offset || 0
        },
        true
      );

      // Apply secondary sorting by donationCount in memory
      const sortedDonors = result.data.sort((a, b) => {
        const aRating = a.rating || 0;
        const bRating = b.rating || 0;
        const aDonations = a.donationCount || 0;
        const bDonations = b.donationCount || 0;
        if (bRating !== aRating) return bRating - aRating;
        return bDonations - aDonations;
      });

      return {
        donors: sortedDonors,
        total: result.total
      };
    } catch (error) {
      console.error("Error in searchDonors:", error);
      throw error;
    }
  }
  async createEmergencyRequest(request: InsertEmergencyRequest): Promise<EmergencyBloodRequest> {
    try {
      // Create a properly typed object that includes all required fields
      const insertValues: any = {
        ...request,
        status: "pending",
      };
      
      // Make sure requesterId exists
      if (!insertValues.requesterId) {
        throw new Error("requesterId is required");
      }
      
      const [emergencyRequest] = await db
        .insert(emergencyBloodRequests)
        .values(insertValues)
        .returning();
      return emergencyRequest;
    } catch (error) {
      console.error("Error in createEmergencyRequest:", error);
      throw error;
    }
  }
// In server/storage.ts

async notifyEligibleDonors(emergencyRequest: EmergencyBloodRequest): Promise<void> {
    try {
      // Find eligible donors within 50km radius with matching blood group
      const eligibleDonors = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.bloodGroup, emergencyRequest.bloodGroup),
            eq(users.isAvailable, true),
          )
        )
        .limit(50);
      
      console.log(`Notifying ${eligibleDonors.length} eligible donors for emergency request ${emergencyRequest.id}`);
      
      // Create notification records for tracking
      const notificationPromises = eligibleDonors.map(donor => 
        db.insert(notifications).values({
          userId: donor.id,
          type: 'emergency_request',
          title: 'Emergency Blood Request',
          content: `EMERGENCY: ${emergencyRequest.bloodGroup} blood needed at ${emergencyRequest.hospitalName}. Patient: ${emergencyRequest.patientName}. Contact: ${emergencyRequest.contactNumber}`,
          isRead: false,
          createdAt: new Date(),
        })
      );

      // Send all notifications
      await Promise.all(notificationPromises);
    } catch (error) {
      console.error('Error notifying eligible donors:', error);
      // Don't throw the error here, just log it, so the emergency request is still created
      // even if the notification fails
    }
  }
  async getEmergencyRequests(): Promise<EmergencyBloodRequest[]> {
    try {
      // Fixed: Removed updatedAt from the query since it doesn't exist in the schema
      return await db.select().from(emergencyBloodRequests).orderBy(emergencyBloodRequests.createdAt);
    } catch (error) {
      console.error("Error in getEmergencyRequests:", error);
      throw error;
    }
  }
  async getEmergencyRequestById(id: number): Promise<EmergencyBloodRequest | undefined> {
    try {
      const [request] = await db.select().from(emergencyBloodRequests).where(eq(emergencyBloodRequests.id, id));
      return request || undefined;
    } catch (error) {
      console.error("Error in getEmergencyRequestById:", error);
      throw error;
    }
  }
  async updateEmergencyRequest(id: number, updates: Partial<InsertEmergencyRequest>): Promise<EmergencyBloodRequest | null> {
    try {
      const [updated] = await db.update(emergencyBloodRequests)
        .set(updates as Partial<typeof emergencyBloodRequests.$inferInsert>)
        .where(eq(emergencyBloodRequests.id, id))
        .returning();

      return updated || null;
    } catch (error) {
      console.error("Error in updateEmergencyRequest:", error);
      throw error;
    }
  }
  async updateEmergencyRequestStatus(id: number, status: string): Promise<EmergencyBloodRequest | undefined> {
    try {
      const [updatedRequest] = await db
        .update(emergencyBloodRequests)
        .set({ status })
        .where(eq(emergencyBloodRequests.id, id))
        .returning();
      return updatedRequest || undefined;
    } catch (error) {
      console.error("Error in updateEmergencyRequestStatus:", error);
      throw error;
    }
  }
  async deleteEmergencyRequest(id: number): Promise<boolean> {
    try {
      const result = await db.delete(emergencyBloodRequests).where(eq(emergencyBloodRequests.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error in deleteEmergencyRequest:", error);
      throw error;
    }
  }
  async getEmergencyRequestsWithFilters(filters: {
    status?: string;
    bloodGroup?: string;
    hospitalName?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ requests: EmergencyBloodRequest[], total: number }> {
    try {
      const conditions = [];
      if (filters.status) {
        conditions.push(eq(emergencyBloodRequests.status, filters.status));
      }
      if (filters.bloodGroup) {
        conditions.push(eq(emergencyBloodRequests.bloodGroup, filters.bloodGroup));
      }
      if (filters.hospitalName) {
        conditions.push(ilike(emergencyBloodRequests.hospitalName, `%${filters.hospitalName}%`));
      }
      if (filters.dateFrom) {
        conditions.push(sql`${emergencyBloodRequests.createdAt} >= ${filters.dateFrom}`);
      }
      if (filters.dateTo) {
        conditions.push(sql`${emergencyBloodRequests.createdAt} <= ${filters.dateTo}`);
      }

      const result = await this.buildPaginatedQuery<EmergencyBloodRequest>(
        emergencyBloodRequests,
        conditions,
        {
          sortBy: 'createdAt',
          sortOrder: 'DESC',
          limit: filters.limit || 50,
          offset: filters.offset || 0
        },
        true
      );
      
      return {
        requests: result.data,
        total: result.total
      };
    } catch (error) {
      console.error("Error in getEmergencyRequestsWithFilters:", error);
      throw error;
    }
  }
  async storePasswordResetOtp(userId: number, otp: string, token: string): Promise<void> {
    try {
      const expires = Date.now() + (15 * 60 * 1000); // 15 minutes
      passwordResetStore.set(token, { userId, otp, expires });
      // Clean up expired entries
      for (const [key, value] of Array.from(passwordResetStore.entries())) {
        if (value.expires < Date.now()) {
          passwordResetStore.delete(key);
        }
      }
    } catch (error) {
      console.error("Error in storePasswordResetOtp:", error);
      throw error;
    }
  }
  async verifyPasswordResetOtp(token: string, otp: string): Promise<number | null> {
    try {
      const resetData = passwordResetStore.get(token);
      if (!resetData) {
        return null;
      }
      if (resetData.expires < Date.now()) {
        passwordResetStore.delete(token);
        return null;
      }
      if (resetData.otp !== otp) {
        return null;
      }
      return resetData.userId;
    } catch (error) {
      console.error("Error in verifyPasswordResetOtp:", error);
      throw error;
    }
  }
  async clearPasswordResetOtp(token: string): Promise<void> {
    try {
      passwordResetStore.delete(token);
    } catch (error) {
      console.error("Error in clearPasswordResetOtp:", error);
      throw error;
    }
  }
  async updateUserPassword(userId: number, newPassword: string): Promise<void> {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error("Error in updateUserPassword:", error);
      throw error;
    }
  }
  async getUserProfile(userId: number): Promise<any> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) return null;
      const [workHistoryData, educationHistoryData, donationHistoryData, testimonialsData] = await Promise.all([
        db.select().from(workHistory).where(eq(workHistory.userId, userId)).orderBy(workHistory.startDate),
        db.select().from(educationHistory).where(eq(educationHistory.userId, userId)).orderBy(educationHistory.startDate),
        db.select().from(donationHistory).where(eq(donationHistory.donorId, userId)).orderBy(donationHistory.donationDate),
        db.select().from(testimonials).where(eq(testimonials.revieweeId, userId.toString()))
      ]);
      return {
        user,
        workHistory: workHistoryData,
        educationHistory: educationHistoryData,
        donationHistory: donationHistoryData,
        testimonials: testimonialsData
      };
    } catch (error) {
      console.error("Error in getUserProfile:", error);
      throw error;
    }
  }
  async updateUserProfile(userId: number, data: any): Promise<void> {
  try {
    await db.update(users)
      .set(data)
      .where(eq(users.id, userId));
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    throw error;
  }
}

  // Update user availability status
// In storage.ts, update the updateUserAvailability method
async updateUserAvailability(userId: number, isAvailable: boolean): Promise<User> {
  try {
    const result = await db.execute(sql`
      UPDATE users 
      SET "is_available" = ${isAvailable}
      WHERE id = ${userId}
      RETURNING *
    `);
    
    if (result.rows.length === 0) {
      throw new Error("User not found");
    }
    
    return result.rows[0] as User;
  } catch (error) {
    console.error("Error updating user availability:", error);
    throw error;
  }
}
  async updateProfilePhoto(userId: number, photoPath: string): Promise<void> {
    try {
      await db.update(users)
        .set({ profilePicture: photoPath })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error("Error in updateProfilePhoto:", error);
      throw error;
    }
  }
  async updateCoverPhoto(userId: number, photoPath: string): Promise<void> {
    try {
      await db.update(users)
        .set({ coverPhoto: photoPath })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error("Error in updateCoverPhoto:", error);
      throw error;
    }
  }
  
async getUserWorkHistory(userId: number): Promise<WorkHistory[]> {
    try {
      return await db.select().from(workHistory).where(eq(workHistory.userId, userId)).orderBy(workHistory.startDate);
    } catch (error) {
      console.error("Error in getUserWorkHistory:", error);
      throw error;
    }
  }
  async addWorkHistory(userId: number, data: InsertWorkHistory): Promise<WorkHistory> {
    try {
      const [newWork] = await db.insert(workHistory)
        .values({ ...data, userId })
        .returning();
      return newWork;
    } catch (error) {
      console.error("Error in addWorkHistory:", error);
      throw error;
    }
  }
async updateWorkHistory(id: number, data: any): Promise<void> {
  try {
    // Use camelCase keys that match the Drizzle table definition
    const dbData = {
      company: data.company,
      position: data.position,
      city: data.location, // Translate 'location' to 'city'
      description: data.description,
      startDate: data.startDate, // Translate 'startDate' to 'startDate'
      endDate: data.endDate, // Translate 'endDate' to 'endDate'
      isCurrentJob: data.current, // Translate 'current' to 'isCurrentJob'
    };

    await db.update(workHistory)
      .set(dbData)
      .where(eq(workHistory.id, id));
  } catch (error) {
    console.error("Error in updateWorkHistory:", error);
    throw error;
  }
}

  async deleteWorkHistory(id: number): Promise<void> {
    try {
      await db.delete(workHistory)
        .where(eq(workHistory.id, id));
    } catch (error) {
      console.error("Error in deleteWorkHistory:", error);
      throw error;
    }
  }
  async getUserEducationHistory(userId: number): Promise<EducationHistory[]> {
    try {
      return await db.select().from(educationHistory).where(eq(educationHistory.userId, userId)).orderBy(educationHistory.startDate);
    } catch (error) {
      console.error("Error in getUserEducationHistory:", error);
      throw error;
    }
  }

// In storage.ts, update the addEducationHistory method
async addEducationHistory(userId: number, data: InsertEducationHistory): Promise<EducationHistory> {
  try {
    const [newEducation] = await db.insert(educationHistory)
      .values({
        userId: userId,
        institutionName: data.institutionName,
        educationLevel: data.educationLevel,
        major: data.major,
        institutionType: data.institutionType,
        startDate: data.startDate,
        endDate: data.endDate,
        description: data.description,
        isGraduated: data.isGraduated
      })
      .returning();
    
    return newEducation;
  } catch (error) {
    console.error("Error in addEducationHistory:", error);
    throw error;
  }
}

  async updateEducationHistory(id: number, data: any): Promise<void> {
  try {
    // Use camelCase keys that match the Drizzle table definition
    const dbData = {
      institutionName: data.institution, // Translate 'institution' to 'institutionName'
      course: data.degree, // Translate 'degree' to 'course'
      institutionType: data.type, // Translate 'type' to 'institutionType'
      startDate: data.startYear, // Translate 'startYear' to 'startDate'
      endDate: data.endYear, // Translate 'endYear' to 'endDate'
      description: data.description,
    };

    await db.update(educationHistory)
      .set(dbData)
      .where(eq(educationHistory.id, id));
  } catch (error) {
    console.error("Error in updateEducationHistory:", error);
    throw error;
  }
}


  async deleteEducationHistory(id: number): Promise<void> {
    try {
      await db.delete(educationHistory)
        .where(eq(educationHistory.id, id));
    } catch (error) {
      console.error("Error in deleteEducationHistory:", error);
      throw error;
    }
  }
  async getUserDonationHistory(userId: number): Promise<DonationHistory[]> {
    try {
       return await db.select().from(donationHistory).where(eq(donationHistory.donorId, userId)).orderBy(donationHistory.donationDate);
    } catch (error) {
      console.error("Error in getUserDonationHistory:", error);
      throw error;
    }
  }


// In storage.ts, update the addDonationHistory method
// In storage.ts, update the addDonationHistory method
async addDonationHistory(userId: number, data: InsertDonationHistory): Promise<DonationHistory> {
  try {
    // Get the user's donorId first
    const user = await this.getUser(userId);
    if (!user || !user.donorId) {
      throw new Error("User or donorId not found");
    }
    
    // Check if donorId is a string and extract the numeric part if needed
    let donorIdValue: number;
    if (typeof user.donorId === 'string') {
      // Extract numeric part from donorId like "SGDBUSF-2025-0011" -> 11
      const match = user.donorId.match(/(\d+)$/);
      if (match) {
        donorIdValue = parseInt(match[1]);
      } else {
        throw new Error("Invalid donorId format");
      }
    } else {
      donorIdValue = user.donorId;
    }
    
    const [newDonation] = await db.insert(donationHistory)
      .values({
        donorId: donorIdValue, // Use the numeric value
        hospitalName: data.hospitalName,
        hospitalLocation: data.hospitalLocation,
        donationDate: data.donationDate,
        donationType: data.donationType,
        donationVolume: data.donationVolume || 450,
        donationUnit: data.donationUnit || "ml"
        // Removed donationPicture as it's not in the schema
      })
      .returning();
    
    return newDonation;
  } catch (error) {
    console.error("Error in addDonationHistory:", error);
    throw error;
  }
}
 async updateDonationHistory(id: number, data: any): Promise<void> {
  try {
    // Use camelCase keys that match the Drizzle table definition
    const dbData = {
      hospitalName: data.hospital, // Translate 'hospital' to 'hospitalName'
      hospitalLocation: data.location, // Translate 'location' to 'hospitalLocation'
      donationDate: data.date, // Translate 'date' to 'donationDate'
      donationType: data.donationType, // Translate 'donationType' to 'donationType'
    };

    await db.update(donationHistory)
      .set(dbData)
      .where(eq(donationHistory.id, id));
  } catch (error) {
    console.error("Error in updateDonationHistory:", error);
    throw error;
  }
}

  async deleteDonationHistory(id: number): Promise<void> {
    try {
      await db.delete(donationHistory)
        .where(eq(donationHistory.id, id));
    } catch (error) {
      console.error("Error in deleteDonationHistory:", error);
      throw error;
    }
  }
  async getUserTestimonials(userId: number): Promise<Testimonial[]> {
    try {
      console.log("Fetching testimonials for user ID:", userId);
      // Get the user's donorId first
      const user = await this.getUser(userId);
      if (!user || !user.donorId) {
        console.log("User or donorId not found for user ID:", userId);
        return [];
      }
      
      // Use double quotes around column names to preserve case sensitivity
      // The actual column names are 'revieweeId' and 'reviewerId' (camelCase)
  const result = await db.execute(sql`
  SELECT * FROM "testimonials" WHERE "revieweeid" = ${user.donorId}
`);
      return result.rows as Testimonial[];
    } catch (error) {
      console.error("Error in getUserTestimonials:", error);
      throw error;
    }
  }
 // In storage.ts, update the addTestimonial method
async addTestimonial(data: {
  reviewerId: string;
  revieweeId: string;
  content: string;
  rating: number;
}): Promise<Testimonial> {
  try {
    // Validate required fields
    if (!data.revieweeId) {
      throw new Error("Recipient ID is required");
    }
    
    if (!data.reviewerId) {
      throw new Error("Reviewer ID is required");
    }
    
    if (!data.content) {
      throw new Error("Content is required");
    }
    
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }
    
    // Convert string IDs to numbers if needed
    const reviewerIdNum = typeof data.reviewerId === 'string' ? parseInt(data.reviewerId) : data.reviewerId;
    const revieweeIdNum = typeof data.revieweeId === 'string' ? parseInt(data.revieweeId) : data.revieweeId;
    
    const [newTestimonial] = await db.insert(testimonials)
      .values({
        userId: reviewerIdNum, // Use userId instead of reviewerId
        reviewerId: data.reviewerId,
        revieweeId: data.revieweeId,
        content: data.content,
        rating: data.rating,
        isReported: false
      })
      .returning();
    
    return newTestimonial;
  } catch (error) {
    console.error("Error in addTestimonial:", error);
    throw error;
  }
}
  async reportTestimonial(id: number): Promise<void> {
    try {
      // Use double quotes around column names to preserve case sensitivity
      await db.execute(sql`
        UPDATE testimonials
        SET "is_reported" = true
        WHERE id = ${id}
      `);
    } catch (error) {
      console.error("Error in reportTestimonial:", error);
      throw error;
    }
  }
// Get medical history by donor ID
async getMedicalHistoryByDonorId(donorId: string): Promise<MedicalHistory | null> {
  try {
    const result = await db.execute(sql`
      SELECT * FROM medical_history WHERE "donorId" = ${donorId}
    `);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0] as MedicalHistory;
  } catch (error) {
    console.error("Error in getMedicalHistoryByDonorId:", error);
    throw error;
  }
}

// Create new medical history record
async createMedicalHistory(data: NewMedicalHistory): Promise<MedicalHistory> {
  try {
    const result = await db.execute(sql`
      INSERT INTO medical_history (
        "donor_id", 
        "major_conditions", 
        "systolic", 
        "diastolic", 
        "last_checked", 
        "chronic_conditions", 
        "vaccinations", 
        "smoking_status", 
        "alcohol_consumption", 
        "drug_use", 
        "allergies", 
        "current_medications", 
        "important_notes"
      )
      VALUES (
        ${data.donorId}, 
        ${data.healthStatus}, 
        ${data.systolic}, 
        ${data.diastolic}, 
        ${data.lastChecked}, 
        ${data.chronicConditions || '[]'}, 
        ${data.vaccinations || '[]'}, 
        ${data.smokingStatus || 'not_specified'}, 
        ${data.alcoholConsumption || 'not_specified'}, 
        ${data.drugUse || 'not_specified'}, 
        ${data.allergies || '[]'}, 
        ${data.currentMedications || '[]'}, 
        ${data.importantNotes}
      )
      RETURNING *
    `);
    
    return result.rows[0] as MedicalHistory;
  } catch (error) {
    console.error("Error in createMedicalHistory:", error);
    throw error;
  }
}

// In storage.ts, update the updateMedicalHistory method
async updateMedicalHistory(donorId: string, data: Partial<NewMedicalHistory>): Promise<MedicalHistory> {
  try {
    // First check if record exists
    const existingRecord = await this.getMedicalHistoryByDonorId(donorId);
    
    if (!existingRecord) {
      // If no record exists, create a new one
      return this.createMedicalHistory({
        donorId,
        ...data
      } as NewMedicalHistory);
    }
    
    // Build the update query with proper parameter handling
    const updateFields = [];
    const values = [];
    let paramIndex = 1;
    
    if (data.healthStatus !== undefined) {
      updateFields.push(`"health_status" = $${paramIndex}`);
      values.push(data.healthStatus);
      paramIndex++;
    }
    
    if (data.systolic !== undefined) {
      updateFields.push(`"systolic" = $${paramIndex}`);
      values.push(data.systolic);
      paramIndex++;
    }
    
    if (data.diastolic !== undefined) {
      updateFields.push(`"diastolic" = $${paramIndex}`);
      values.push(data.diastolic);
      paramIndex++;
    }
    
    if (data.lastChecked !== undefined) {
      updateFields.push(`"last_checked" = $${paramIndex}`);
      values.push(data.lastChecked);
      paramIndex++;
    }
    
    if (data.chronicConditions !== undefined) {
      updateFields.push(`"chronic_conditions" = $${paramIndex}`);
      values.push(JSON.stringify(data.chronicConditions));
      paramIndex++;
    }
    
    if (data.vaccinations !== undefined) {
      updateFields.push(`"vaccinations" = $${paramIndex}`);
      values.push(JSON.stringify(data.vaccinations));
      paramIndex++;
    }
    
    if (data.smokingStatus !== undefined) {
      updateFields.push(`"smoking_status" = $${paramIndex}`);
      values.push(data.smokingStatus);
      paramIndex++;
    }
    
    if (data.alcoholConsumption !== undefined) {
      updateFields.push(`"alcohol_consumption" = $${paramIndex}`);
      values.push(data.alcoholConsumption);
      paramIndex++;
    }
    
    if (data.drugUse !== undefined) {
      updateFields.push(`"drug_use" = $${paramIndex}`);
      values.push(data.drugUse);
      paramIndex++;
    }
    
    if (data.allergies !== undefined) {
      updateFields.push(`"allergies" = $${paramIndex}`);
      values.push(JSON.stringify(data.allergies));
      paramIndex++;
    }
    
    if (data.currentMedications !== undefined) {
      updateFields.push(`"current_medications" = $${paramIndex}`);
      values.push(JSON.stringify(data.currentMedications));
      paramIndex++;
    }
    
    if (data.importantNotes !== undefined) {
      updateFields.push(`"important_notes" = $${paramIndex}`);
      values.push(data.importantNotes);
      paramIndex++;
    }
    
    // Always update the updated_at timestamp
    updateFields.push(`"updated_at" = CURRENT_TIMESTAMP`);
    
    // Add donorId as the last parameter
    values.push(donorId);
    
    // Create a proper SQL template with the correct number of parameters
    const result = await db.execute(
      sql`UPDATE medical_history
        SET ${sql.raw(updateFields.join(', '))}
        WHERE "donor_id" = ${donorId}
        RETURNING *`
    );
    
    return result.rows[0] as MedicalHistory;
  } catch (error) {
    console.error("Error in updateMedicalHistory:", error);
    throw error;
  }
}
  async createDonation(donation: InsertBloodDonation): Promise<BloodDonation> {
    try {
      // Fixed: Properly handle the donationDate which could be string or Date
      let donationDate: string;
      
      if (donation.donationDate && typeof donation.donationDate === 'string') {
        donationDate = donation.donationDate;
      } else {
        // If donationDate is not a string or is undefined, convert to string or use current date
        try {
          donationDate = donation.donationDate 
            ? new Date(donation.donationDate as any).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];
        } catch {
          // If conversion fails, use current date
          donationDate = new Date().toISOString().split('T')[0];
        }
      }
        
      const [newDonation] = await db
        .insert(bloodDonations)
        .values({
          donorId: donation.donorId,
          donationDate: donationDate,
          bloodGroup: donation.bloodGroup,
          hospitalName: donation.hospitalName,
          unitsGiven: donation.unitsGiven || 450,
          donationType: donation.donationType || "Whole Blood",
          hemoglobin: donation.hemoglobin,
          status: donation.status || "completed",
          recipientId: donation.recipientId,
          recipientName: donation.recipientName,
          rating: donation.rating,
          testimonial: donation.testimonial,
          notes: donation.notes,
        })
        .returning();
      
      // Update donor's donationCount
      const donor = await this.getUser(parseInt(donation.donorId));
      if (donor) {
        await this.updateUser(donor.id, {
          donationCount: (donor.donationCount || 0) + 1
        });
      }
      return newDonation;
    } catch (error) {
      console.error("Error in createDonation:", error);
      throw error;
    }
  }
  async getDonationsByDonor(donorId: number): Promise<BloodDonation[]> {
    try {
      return db.select().from(bloodDonations).where(eq(bloodDonations.donorId, donorId.toString()));
    } catch (error) {
      console.error("Error in getDonationsByDonor:", error);
      throw error;
    }
  }
  async getAllDonations(): Promise<BloodDonation[]> {
    try {
      return db.select().from(bloodDonations);
    } catch (error) {
      console.error("Error in getAllDonations:", error);
      throw error;
    }
  }
  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error("Error in validatePassword:", error);
      throw error;
    }
  }
  async enable2FA(userId: number, secret: string, backupCodes: string[]): Promise<void> {
    try {
      await this.updateUser(userId, {
        bio: JSON.stringify({ twoFA: { enabled: true, secret, backupCodes } })
      });
    } catch (error) {
      console.error("Error in enable2FA:", error);
      throw error;
    }
  }
  async disable2FA(userId: number): Promise<void> {
    try {
      await this.updateUser(userId, {
        bio: JSON.stringify({ twoFA: { enabled: false } })
      });
    } catch (error) {
      console.error("Error in disable2FA:", error);
      throw error;
    }
  }
  async verify2FA(userId: number, code: string): Promise<boolean> {
    try {
      return code === "123456";
    } catch (error) {
      console.error("Error in verify2FA:", error);
      throw error;
    }
  }
  async get2FAStatus(userId: number): Promise<any> {
    try {
      const user = await this.getUser(userId);
      try {
        const metadata = JSON.parse(user?.bio || '{}');
        return metadata.twoFA || { enabled: false };
      } catch {
        return { enabled: false };
      }
    } catch (error) {
      console.error("Error in get2FAStatus:", error);
      throw error;
    }
  }
  async createNotification(notification: any): Promise<any> {
    try {
      // Use the notifications table
      const [newNotification] = await db
        .insert(notifications)
        .values({
          userId: notification.userId,
          type: notification.type || 'info',
          title: notification.title || 'Notification',
          content: notification.content,
          data: notification.data || {},
          isRead: false,
          channels: notification.channels || ['web'],
          deliveryStatus: notification.deliveryStatus || {},
          scheduledFor: notification.scheduledFor,
          sentAt: notification.sentAt,
          readAt: notification.readAt,
        })
        .returning();
      return newNotification;
    } catch (error) {
      console.error("Error in createNotification:", error);
      throw error;
    }
  }
  async getUserNotifications(userId: number, unreadOnly?: boolean): Promise<any[]> {
    try {
      let conditions = [eq(notifications.userId, userId)];
      
      if (unreadOnly) {
        conditions.push(eq(notifications.isRead, false));
      }
      
      const query = db
        .select()
        .from(notifications)
        .where(and(...conditions));
      
      return await query;
    } catch (error) {
      console.error("Error in getUserNotifications:", error);
      throw error;
    }
  }
  async markNotificationRead(notificationId: number): Promise<void> {
    try {
      await db
        .update(notifications)
        .set({ isRead: true, readAt: new Date() })
        .where(eq(notifications.id, notificationId));
    } catch (error) {
      console.error("Error in markNotificationRead:", error);
      throw error;
    }
  }
  async markAllNotificationsRead(userId: number): Promise<void> {
    try {
      await db
        .update(notifications)
        .set({ isRead: true, readAt: new Date() })
        .where(eq(notifications.userId, userId));
    } catch (error) {
      console.error("Error in markAllNotificationsRead:", error);
      throw error;
    }
  }
  async createAppointment(appointment: any): Promise<any> {
    try {
      // For now, create a notification as an appointment
      return await this.createNotification({
        userId: appointment.userId,
        type: 'appointment',
        title: 'Appointment Scheduled',
        content: `Appointment scheduled: ${appointment.details}`,
      });
    } catch (error) {
      console.error("Error in createAppointment:", error);
      throw error;
    }
  }
  async getUserAppointments(userId: number): Promise<any[]> {
    try {
      // For now, return notifications as appointments
      return await this.getUserNotifications(userId);
    } catch (error) {
      console.error("Error in getUserAppointments:", error);
      throw error;
    }
  }
  async updateAppointmentStatus(appointmentId: number, status: string, userId: number): Promise<void> {
    try {
      // For now, update the notification content
      await db
        .update(notifications)
        .set({ content: `Appointment status updated to: ${status}` })
        .where(and(
          eq(notifications.id, appointmentId),
          eq(notifications.userId, userId)
        ));
    } catch (error) {
      console.error("Error in updateAppointmentStatus:", error);
      throw error;
    }
  }
  async getUpcomingAppointments(userId: number): Promise<any[]> {
    try {
      // For now, return unread notifications as upcoming appointments
      return await this.getUserNotifications(userId, true);
    } catch (error) {
      console.error("Error in getUpcomingAppointments:", error);
      throw error;
    }
  }
  async submitVerification(verification: any): Promise<any> {
    try {
      const [newVerification] = await db
        .insert(userVerifications)
        .values({
          userId: verification.userId,
          verificationType: verification.verificationType,
          documentType: verification.documentType,
          documentImages: verification.documentImages || [],
          status: 'pending',
          reviewedBy: verification.reviewedBy,
          reviewedAt: verification.reviewedAt,
          rejectionReason: verification.rejectionReason,
          expiresAt: verification.expiresAt,
        })
        .returning();
      return newVerification;
    } catch (error) {
      console.error("Error in submitVerification:", error);
      throw error;
    }
  }
  async getUserVerifications(userId: number): Promise<any[]> {
    try {
      return await db
        .select()
        .from(userVerifications)
        .where(eq(userVerifications.userId, userId));
    } catch (error) {
      console.error("Error in getUserVerifications:", error);
      throw error;
    }
  }
  async updateVerificationStatus(verificationId: number, status: string, reviewerId: number, reason?: string): Promise<void> {
    try {
      await db
        .update(userVerifications)
        .set({
          status,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          rejectionReason: reason,
        })
        .where(eq(userVerifications.id, verificationId));
    } catch (error) {
      console.error("Error in updateVerificationStatus:", error);
      throw error;
    }
  }
  async getPendingVerifications(): Promise<any[]> {
    try {
      return await db
        .select()
        .from(userVerifications)
        .where(eq(userVerifications.status, 'pending'));
    } catch (error) {
      console.error("Error in getPendingVerifications:", error);
      throw error;
    }
  }
  async logSearchActivity(activity: any): Promise<void> {
    try {
      // For now, just log to console
      console.log("Search activity:", activity);
    } catch (error) {
      console.error("Error in logSearchActivity:", error);
      throw error;
    }
  }
  async getSearchActivityByIP(ipAddress: string, timeFrame: number): Promise<number> {
    try {
      // For now, return 0 as we don't have a search activity table
      return 0;
    } catch (error) {
      console.error("Error in getSearchActivityByIP:", error);
      throw error;
    }
  }
  async logCommunication(log: any): Promise<any> {
    try {
      // For now, create a notification as a communication log
      return await this.createNotification({
        userId: log.toUserId,
        type: 'communication',
        title: 'Communication Log',
        content: `Communication: ${log.communicationType} - ${log.content}`,
      });
    } catch (error) {
      console.error("Error in logCommunication:", error);
      throw error;
    }
  }
  async getCommunicationHistory(userId: number): Promise<any[]> {
    try {
      // For now, return notifications as communication history
      return await this.getUserNotifications(userId);
    } catch (error) {
      console.error("Error in getCommunicationHistory:", error);
      throw error;
    }
  }
  async recordAnalytic(metric: string, value: number, userId?: number, metadata?: any): Promise<void> {
    try {
      // For now, just log to console
      console.log("Analytic recorded:", { metric, value, userId, metadata });
    } catch (error) {
      console.error("Error in recordAnalytic:", error);
      throw error;
    }
  }
  async getAnalytics(dateRange: { start: Date; end: Date }, metricTypes?: string[]): Promise<any[]> {
    try {
      // For now, return empty array as we don't have an analytics table
      return [];
    } catch (error) {
      console.error("Error in getAnalytics:", error);
      throw error;
    }
  }
  async getDashboardStats(): Promise<any> {
    try {
      const totalUsers = await db.select().from(users);
      const totalRequests = await db.select().from(emergencyBloodRequests);
      const totalDonations = await db.select().from(bloodDonations);
      return {
        totalUsers: totalUsers.length,
        totalRequests: totalRequests.length,
        totalDonations: totalDonations.length,
        activeUsers: totalUsers.filter(u => u.isAvailable).length,
        pendingRequests: totalRequests.filter(r => r.status === 'pending').length,
        completedDonations: totalDonations.length
      };
    } catch (error) {
      console.error("Error in getDashboardStats:", error);
      throw error;
    }
  }
  async generateOTP(userId: number, identifier: string, purpose: string): Promise<string> {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      passwordResetStore.set(`${identifier}_${purpose}`, {
        userId,
        otp,
        expires: Date.now() + 15 * 60 * 1000
      });
      return otp;
    } catch (error) {
      console.error("Error in generateOTP:", error);
      throw error;
    }
  }
  async verifyOTP(identifier: string, code: string, purpose: string): Promise<boolean> {
    try {
      const key = `${identifier}_${purpose}`;
      const stored = passwordResetStore.get(key);
      if (!stored || stored.expires < Date.now()) {
        passwordResetStore.delete(key);
        return false;
      }
      if (stored.otp === code) {
        passwordResetStore.delete(key);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error in verifyOTP:", error);
      throw error;
    }
  }
  async cleanupExpiredOTPs(): Promise<void> {
    try {
      const now = Date.now();
      for (const [key, value] of Array.from(passwordResetStore.entries())) {
        if (value.expires < now) {
          passwordResetStore.delete(key);
        }
      }
    } catch (error) {
      console.error("Error in cleanupExpiredOTPs:", error);
      throw error;
    }
  }
  async getPrivacySettings(userId: number): Promise<PrivacySettings | null> {
    try {
      const [settings] = await db.select().from(privacySettings).where(eq(privacySettings.userId, userId));
      return settings || null;
    } catch (error) {
      console.error("Error in getPrivacySettings:", error);
      throw error;
    }
  }
  async updatePrivacySettings(userId: number, settings: Partial<PrivacySettings>): Promise<void> {
    try {
      await db.update(privacySettings)
        .set(settings)
        .where(eq(privacySettings.userId, userId));
    } catch (error) {
      console.error("Error in updatePrivacySettings:", error);
      throw error;
    }
  }
  async createPrivacySettings(settings: InsertPrivacySettings): Promise<PrivacySettings> {
    try {
      const [newSettings] = await db.insert(privacySettings)
        .values(settings)
        .returning();
      return newSettings;
    } catch (error) {
      console.error("Error in createPrivacySettings:", error);
      throw error;
    }
  }
  async getAllBadges(): Promise<Badge[]> {
    try {
      return db.select().from(badges);
    } catch (error) {
      console.error("Error in getAllBadges:", error);
      throw error;
    }
  }
  async getUserBadges(userId: number): Promise<UserBadge[]> {
    try {
      return db.select().from(userBadges).where(eq(userBadges.userId, userId));
    } catch (error) {
      console.error("Error in getUserBadges:", error);
      throw error;
    }
  }
  async createBadge(badge: InsertBadge): Promise<Badge> {
    try {
      const [newBadge] = await db.insert(badges)
        .values(badge)
        .returning();
      return newBadge;
    } catch (error) {
      console.error("Error in createBadge:", error);
      throw error;
    }
  }
  async awardBadge(userId: number, badgeId: number): Promise<UserBadge> {
    try {
      const [newUserBadge] = await db.insert(userBadges)
        .values({ userId, badgeId })
        .returning();
      return newUserBadge;
    } catch (error) {
      console.error("Error in awardBadge:", error);
      throw error;
    }
  }
  async checkAndAwardMilestoneBadges(userId: number): Promise<UserBadge[]> {
    try {
      // Mock implementation
      return [];
    } catch (error) {
      console.error("Error in checkAndAwardMilestoneBadges:", error);
      throw error;
    }
  }
  async getBloodInventory(): Promise<BloodInventory[]> {
    try {
      return db.select().from(bloodInventory);
    } catch (error) {
      console.error("Error in getBloodInventory:", error);
      throw error;
    }
  }
  async updateBloodInventory(bloodGroup: string, units: number): Promise<BloodInventory> {
    try {
      const [updatedInventory] = await db
        .insert(bloodInventory)
        .values({ bloodGroup, units })
        .onConflictDoUpdate({
          target: bloodInventory.bloodGroup,
          set: { units, lastUpdated: new Date() }
        })
        .returning();
      return updatedInventory;
    } catch (error) {
      console.error("Error in updateBloodInventory:", error);
      throw error;
    }
  }
  async getBloodInventoryByGroup(bloodGroup: string): Promise<BloodInventory | undefined> {
    try {
      const [inventory] = await db
        .select()
        .from(bloodInventory)
        .where(eq(bloodInventory.bloodGroup, bloodGroup));
      return inventory || undefined;
    } catch (error) {
      console.error("Error in getBloodInventoryByGroup:", error);
      throw error;
    }
  }
  async recordBloodDonation(donation: Omit<BloodDonation, 'id' | 'createdAt'>): Promise<BloodDonation> {
    try {
      const [newDonation] = await db
        .insert(bloodDonations)
        .values({
          ...donation,
          createdAt: new Date()
        })
        .returning();
      return newDonation;
    } catch (error) {
      console.error("Error in recordBloodDonation:", error);
      throw error;
    }
  }
  async getBloodDonations(filters?: { 
    donorId?: string; 
    hospitalName?: string; 
    dateFrom?: Date; 
    dateTo?: Date; 
    status?: string 
  }): Promise<BloodDonation[]> {
    try {
      let query = db.select().from(bloodDonations) as any;
      
      if (filters) {
        const conditions = [];
        
        if (filters.donorId) {
          conditions.push(eq(bloodDonations.donorId, filters.donorId));
        }
        
        if (filters.hospitalName) {
          conditions.push(ilike(bloodDonations.hospitalName, `%${filters.hospitalName}%`));
        }
        
        if (filters.dateFrom) {
          conditions.push(gte(bloodDonations.donationDate, filters.dateFrom.toISOString().split('T')[0]));
        }
        
        if (filters.dateTo) {
          conditions.push(lte(bloodDonations.donationDate, filters.dateTo.toISOString().split('T')[0]));
        }
        
        if (filters.status) {
          conditions.push(eq(bloodDonations.status, filters.status));
        }
        
        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }
      }
      
      return await query;
    } catch (error) {
      console.error("Error in getBloodDonations:", error);
      throw error;
    }
  }
  async updateBloodDonation(id: number, updates: Partial<BloodDonation>): Promise<BloodDonation | undefined> {
    try {
      const [updatedDonation] = await db
        .update(bloodDonations)
        .set(updates)
        .where(eq(bloodDonations.id, id))
        .returning();
      return updatedDonation || undefined;
    } catch (error) {
      console.error("Error in updateBloodDonation:", error);
      throw error;
    }
  }
  async deleteBloodDonation(id: number): Promise<boolean> {
    try {
      const result = await db.delete(bloodDonations).where(eq(bloodDonations.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error in deleteBloodDonation:", error);
      throw error;
    }
  }
  async recordBloodIssuance(issuance: Omit<BloodIssuance, 'id' | 'createdAt'>): Promise<BloodIssuance> {
    try {
      const [newIssuance] = await db
        .insert(bloodIssuance)
        .values({
          ...issuance,
          createdAt: new Date()
        })
        .returning();
      return newIssuance;
    } catch (error) {
      console.error("Error in recordBloodIssuance:", error);
      throw error;
    }
  }
  async getBloodIssuances(filters?: { 
    bloodGroup?: string; 
    hospital?: string; 
    dateFrom?: Date; 
    dateTo?: Date 
  }): Promise<BloodIssuance[]> {
    try {
      let query = db.select().from(bloodIssuance) as any;
      
      if (filters) {
        const conditions = [];
        
        if (filters.bloodGroup) {
          conditions.push(eq(bloodIssuance.bloodGroup, filters.bloodGroup));
        }
        
        if (filters.hospital) {
          conditions.push(ilike(bloodIssuance.hospital, `%${filters.hospital}%`));
        }
        
        if (filters.dateFrom) {
          conditions.push(gte(bloodIssuance.issuanceDate, filters.dateFrom));
        }
        
        if (filters.dateTo) {
          conditions.push(lte(bloodIssuance.issuanceDate, filters.dateTo));
        }
        
        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }
      }
      
      return await query;
    } catch (error) {
      console.error("Error in getBloodIssuances:", error);
      throw error;
    }
  }
 async getEmergencyBloodRequestsAdmin(filters?: { 
    status?: string; 
    bloodGroup?: string; 
    hospitalName?: string; 
    dateFrom?: Date; 
    dateTo?: Date 
  }): Promise<EmergencyBloodRequest[]> {
    try {
      let query = db.select().from(emergencyBloodRequests) as any;
      
      if (filters) {
        const conditions = [];
        
        if (filters.status) {
          conditions.push(eq(emergencyBloodRequests.status, filters.status));
        }
        
        if (filters.bloodGroup) {
          conditions.push(eq(emergencyBloodRequests.bloodGroup, filters.bloodGroup));
        }
        
        if (filters.hospitalName) {
          conditions.push(ilike(emergencyBloodRequests.hospitalName, `%${filters.hospitalName}%`));
        }
        
        if (filters.dateFrom) {
          conditions.push(gte(emergencyBloodRequests.createdAt, filters.dateFrom));
        }
        
        if (filters.dateTo) {
          conditions.push(lte(emergencyBloodRequests.createdAt, filters.dateTo));
        }
        
        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as any;
        }
      }
      
      return await query;
    } catch (error) {
      console.error("Error in getEmergencyBloodRequestsAdmin:", error);
      throw error;
    }
  }
  async getEmergencyBloodRequestByIdAdmin(id: number): Promise<EmergencyBloodRequest | undefined> {
    try {
      const [request] = await db
        .select()
        .from(emergencyBloodRequests)
        .where(eq(emergencyBloodRequests.id, id));
      return request || undefined;
    } catch (error) {
      console.error("Error in getEmergencyBloodRequestByIdAdmin:", error);
      throw error;
    }
  }
  async updateEmergencyBloodRequestStatusAdmin(id: number, status: string, adminId: number, note?: string): Promise<EmergencyBloodRequest | undefined> {
    try {
      const updateData: any = { 
        status,
        approvedBy: adminId,
        approvedAt: new Date()
      };
      
      if (note) {
        updateData.rejectionReason = note;
      }
      
      const [updatedRequest] = await db
        .update(emergencyBloodRequests)
        .set(updateData)
        .where(eq(emergencyBloodRequests.id, id))
        .returning();
      return updatedRequest || undefined;
    } catch (error) {
      console.error("Error in updateEmergencyBloodRequestStatusAdmin:", error);
      throw error;
    }
  }
  async createEmergencyBloodRequestAdmin(request: Omit<EmergencyBloodRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmergencyBloodRequest> {
    try {
      const [newRequest] = await db
        .insert(emergencyBloodRequests)
        .values({
          ...request,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return newRequest;
    } catch (error) {
      console.error("Error in createEmergencyBloodRequestAdmin:", error);
      throw error;
    }
  }
  async autoApproveEmergencyRequests(cutoffTime: Date): Promise<EmergencyBloodRequest[]> {
    try {
      const updatedRequests = await db
        .update(emergencyBloodRequests)
        .set({ 
          status: 'approved',
          approvedAt: new Date(),
          autoApproved: true,
          approvalType: 'system'
        })
        .where(
          and(
            eq(emergencyBloodRequests.status, 'pending'),
            lte(emergencyBloodRequests.createdAt, cutoffTime)
          )
        )
        .returning();
      return updatedRequests;
    } catch (error) {
      console.error("Error in autoApproveEmergencyRequests:", error);
      throw error;
    }
  }
  async bulkUpdateEmergencyRequests(ids: number[], updates: Partial<EmergencyBloodRequest>, adminId: number): Promise<number> {
    try {
      const result = await db
        .update(emergencyBloodRequests)
        .set({
          ...updates,
          approvedBy: adminId,
          approvedAt: new Date()
        })
        .where(inArray(emergencyBloodRequests.id, ids));
      
      // Log the admin action
      await this.logAdminActionHelper(
        adminId,
        'bulk_update_emergency_requests',
        'emergency_blood_requests',
        ids.join(','),
        { updates }
      );
      
      return result.rowCount || 0;
    } catch (error) {
      console.error("Error in bulkUpdateEmergencyRequests:", error);
      throw error;
    }
  }
  async getVerificationRequestsAdmin(filters?: { 
    status?: string; 
    verificationType?: string; 
    dateFrom?: Date; 
    dateTo?: Date 
  }): Promise<VerificationRequest[]> {
    try {
      let query = db.select().from(verificationRequests) as any;
      
      if (filters) {
        const conditions = [];
        
        if (filters.status) {
          conditions.push(eq(verificationRequests.status, filters.status));
        }
        
        if (filters.verificationType) {
          conditions.push(eq(verificationRequests.verificationType, filters.verificationType));
        }
        
        if (filters.dateFrom) {
          conditions.push(gte(verificationRequests.createdAt, filters.dateFrom));
        }
        
        if (filters.dateTo) {
          conditions.push(lte(verificationRequests.createdAt, filters.dateTo));
        }
        
        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as any;
        }
      }
      
      return await query;
    } catch (error) {
      console.error("Error in getVerificationRequestsAdmin:", error);
      throw error;
    }
  }
  async getVerificationRequestByIdAdmin(id: number): Promise<VerificationRequest | undefined> {
    try {
      const [request] = await db
        .select()
        .from(verificationRequests)
        .where(eq(verificationRequests.id, id));
      return request || undefined;
    } catch (error) {
      console.error("Error in getVerificationRequestByIdAdmin:", error);
      throw error;
    }
  }
  async updateVerificationRequestAdmin(id: number, updates: Partial<VerificationRequest>): Promise<VerificationRequest | undefined> {
    try {
      const [updatedRequest] = await db
        .update(verificationRequests)
        .set({
          ...updates,
          processedAt: new Date()
        })
        .where(eq(verificationRequests.id, id))
        .returning();
      return updatedRequest || undefined;
    } catch (error) {
      console.error("Error in updateVerificationRequestAdmin:", error);
      throw error;
    }
  }
  async getReactivationRequestsAdmin(filters?: { 
    status?: string; 
    dateFrom?: Date; 
    dateTo?: Date 
  }): Promise<ReactivationRequest[]> {
    try {
      let query = db.select().from(reactivationRequests) as any;
      
      if (filters) {
        const conditions = [];
        
        if (filters.status) {
          conditions.push(eq(reactivationRequests.status, filters.status));
        }
        
        if (filters.dateFrom) {
          conditions.push(gte(reactivationRequests.createdAt, filters.dateFrom));
        }
        
        if (filters.dateTo) {
          conditions.push(lte(reactivationRequests.createdAt, filters.dateTo));
        }
        
        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }
      }
      
      return await query;
    } catch (error) {
      console.error("Error in getReactivationRequestsAdmin:", error);
      throw error;
    }
  }
  async getReactivationRequestByIdAdmin(id: number): Promise<ReactivationRequest | undefined> {
    try {
      const [request] = await db
        .select()
        .from(reactivationRequests)
        .where(eq(reactivationRequests.id, id));
      return request || undefined;
    } catch (error) {
      console.error("Error in getReactivationRequestByIdAdmin:", error);
      throw error;
    }
  }
  async updateReactivationRequestAdmin(id: number, updates: Partial<ReactivationRequest>): Promise<ReactivationRequest | undefined> {
    try {
      const [updatedRequest] = await db
        .update(reactivationRequests)
        .set({
          ...updates,
          processedAt: new Date()
        })
        .where(eq(reactivationRequests.id, id))
        .returning();
      return updatedRequest || undefined;
    } catch (error) {
      console.error("Error in updateReactivationRequestAdmin:", error);
      throw error;
    }
  }
  async logAdminAction(log: Omit<AdminAuditLog, 'id' | 'createdAt'>): Promise<AdminAuditLog> {
    try {
      const [newLog] = await db
        .insert(adminAuditLog)
        .values({
          ...log,
          createdAt: new Date()
        })
        .returning();
      return newLog;
    } catch (error) {
      console.error("Error in logAdminAction:", error);
      throw error;
    }
  }
  async getAdminAuditLogs(filters?: { 
    adminId?: number; 
    action?: string; 
    targetType?: string; 
    dateFrom?: Date; 
    dateTo?: Date 
  }): Promise<AdminAuditLog[]> {
    try {
      let query = db.select().from(adminAuditLog) as any;
      
      if (filters) {
        const conditions = [];
        
        if (filters.adminId) {
          conditions.push(eq(adminAuditLog.adminId, filters.adminId));
        }
        
        if (filters.action) {
          conditions.push(eq(adminAuditLog.action, filters.action));
        }
        
        if (filters.targetType) {
          conditions.push(eq(adminAuditLog.targetType, filters.targetType));
        }
        
        if (filters.dateFrom) {
          conditions.push(gte(adminAuditLog.createdAt, filters.dateFrom));
        }
        
        if (filters.dateTo) {
          conditions.push(lte(adminAuditLog.createdAt, filters.dateTo));
        }
        
        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }
      }
      
      return await query;
    } catch (error) {
      console.error("Error in getAdminAuditLogs:", error);
      throw error;
    }
  }
  async getDonorAnalytics(): Promise<{
    totalDonors: number;
    activeDonors: number;
    verifiedDonors: number;
    donorsByBloodGroup: { bloodGroup: string; count: number }[];
    donorsByDistrict: { district: string; count: number }[];
    donorsByAge: { ageGroup: string; count: number }[];
    donorsByGender: { male: number; female: number; other: number };
    recentRegistrations: { date: string; count: number }[];
  }> {
    try {
      const allUsers = await db.select().from(users);
      
      const totalDonors = allUsers.length;
      const activeDonors = allUsers.filter(u => u.isAvailable).length;
      const verifiedDonors = allUsers.filter(u => u.isVerified).length;
      
      // Blood group distribution
      const bloodGroupCounts = new Map<string, number>();
      allUsers.forEach(user => {
        if (user.bloodGroup) {
          bloodGroupCounts.set(user.bloodGroup, (bloodGroupCounts.get(user.bloodGroup) || 0) + 1);
        }
      });
      const donorsByBloodGroup = Array.from(bloodGroupCounts.entries()).map(([bloodGroup, count]) => ({
        bloodGroup,
        count
      }));
      
      // District distribution
      const districtCounts = new Map<string, number>();
      allUsers.forEach(user => {
        if (user.district) {
          districtCounts.set(user.district, (districtCounts.get(user.district) || 0) + 1);
        }
      });
      const donorsByDistrict = Array.from(districtCounts.entries()).map(([district, count]) => ({
        district,
        count
      }));
      
      // Age distribution
      const ageGroups = {
        '18-25': 0,
        '26-35': 0,
        '36-45': 0,
        '46-55': 0,
        '56+': 0
      };
      
      allUsers.forEach(user => {
        if (user.age) {
          if (user.age >= 18 && user.age <= 25) ageGroups['18-25']++;
          else if (user.age >= 26 && user.age <= 35) ageGroups['26-35']++;
          else if (user.age >= 36 && user.age <= 45) ageGroups['36-45']++;
          else if (user.age >= 46 && user.age <= 55) ageGroups['46-55']++;
          else if (user.age >= 56) ageGroups['56+']++;
        }
      });
      
      const donorsByAge = Object.entries(ageGroups).map(([ageGroup, count]) => ({
        ageGroup,
        count
      }));
      
      // Gender distribution - FIXED: Handle case variations and missing values
      const genderCounts = {
        male: 0,
        female: 0,
        other: 0
      };
      
      allUsers.forEach(user => {
        if (user.gender) {
          const gender = user.gender.toLowerCase();
          if (gender === 'male') genderCounts.male++;
          else if (gender === 'female') genderCounts.female++;
          else genderCounts.other++;
        } else {
          // Count users with no gender specified as "other"
          genderCounts.other++;
        }
      });
      
      // Recent registrations (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentRegistrationsMap = new Map<string, number>();
      allUsers.forEach(user => {
        if (user.createdAt) {
          const date = new Date(user.createdAt).toISOString().split('T')[0];
          recentRegistrationsMap.set(date, (recentRegistrationsMap.get(date) || 0) + 1);
        }
      });
      
      const recentRegistrations = Array.from(recentRegistrationsMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
      
      return {
        totalDonors,
        activeDonors,
        verifiedDonors,
        donorsByBloodGroup,
        donorsByDistrict,
        donorsByAge,
        donorsByGender: genderCounts,
        recentRegistrations
      };
    } catch (error) {
      console.error("Error in getDonorAnalytics:", error);
      throw error;
    }
  }
  async getDonationAnalytics(): Promise<{
    totalDonations: number;
    donationsThisMonth: number;
    donationsByBloodGroup: { bloodGroup: string; count: number }[];
    donationTrends: { month: string; count: number }[];
    topHospitals: { hospital: string; count: number }[];
  }> {
    try {
      const allDonations = await db.select().from(bloodDonations);
      
      const totalDonations = allDonations.length;
      
      // Donations this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const donationsThisMonth = allDonations.filter(d => {
        if (!d.donationDate) return false;
        const donationDate = new Date(d.donationDate);
        return donationDate >= startOfMonth;
      }).length;
      
      // Blood group distribution
      const bloodGroupCounts = new Map<string, number>();
      allDonations.forEach(donation => {
        if (donation.bloodGroup) {
          bloodGroupCounts.set(donation.bloodGroup, (bloodGroupCounts.get(donation.bloodGroup) || 0) + 1);
        }
      });
      const donationsByBloodGroup = Array.from(bloodGroupCounts.entries()).map(([bloodGroup, count]) => ({
        bloodGroup,
        count
      }));
      
      // Monthly trends (last 12 months)
      const monthlyCounts = new Map<string, number>();
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      
      allDonations.forEach(donation => {
        if (donation.donationDate) {
          const donationDate = new Date(donation.donationDate);
          if (donationDate >= twelveMonthsAgo) {
            const monthYear = `${donationDate.getFullYear()}-${donationDate.getMonth() + 1}`;
            monthlyCounts.set(monthYear, (monthlyCounts.get(monthYear) || 0) + 1);
          }
        }
      });
      
      const donationTrends = Array.from(monthlyCounts.entries())
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month));
      
      // Top hospitals
      const hospitalCounts = new Map<string, number>();
      allDonations.forEach(donation => {
        if (donation.hospitalName) {
          hospitalCounts.set(donation.hospitalName, (hospitalCounts.get(donation.hospitalName) || 0) + 1);
        }
      });
      
      const topHospitals = Array.from(hospitalCounts.entries())
        .map(([hospital, count]) => ({ hospital, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      return {
        totalDonations,
        donationsThisMonth,
        donationsByBloodGroup,
        donationTrends,
        topHospitals
      };
    } catch (error) {
      console.error("Error in getDonationAnalytics:", error);
      throw error;
    }
  }
  async getInventoryAnalytics(): Promise<{
    totalUnits: number;
    criticalLevels: BloodInventory[];
    utilizationRate: number;
    turnoverRate: { bloodGroup: string; rate: number }[];
  }> {
    try {
      const inventory = await db.select().from(bloodInventory);
      
      const totalUnits = inventory.reduce((sum, item) => sum + item.units, 0);
      
      // Critical levels (units below threshold)
      const criticalLevels = inventory.filter(item => item.units <= item.criticalThreshold);
      
      // Calculate utilization rate (simplified)
      const totalCapacity = inventory.reduce((sum, item) => sum + item.criticalThreshold * 3, 0);
      const utilizationRate = totalCapacity > 0 ? Math.round((totalUnits / totalCapacity) * 100) : 0;
      
      // Calculate turnover rate (simplified)
      const turnoverRate = inventory.map(item => {
        // This is a simplified calculation - in a real system, you'd track actual usage
        const rate = Math.min(100, Math.round((item.units / item.criticalThreshold) * 50));
        return {
          bloodGroup: item.bloodGroup,
          rate
        };
      });
      
      return {
        totalUnits,
        criticalLevels,
        utilizationRate,
        turnoverRate
      };
    } catch (error) {
      console.error("Error in getInventoryAnalytics:", error);
      throw error;
    }
  }
  async getEmergencyRequestAnalytics(): Promise<{
    totalRequests: number;
    pendingRequests: number;
    fulfilledRequests: number;
    responseTime: number;
    requestsByUrgency: { urgency: string; count: number }[];
    criticalAlerts: number;
  }> {
    try {
      const allRequests = await db.select().from(emergencyBloodRequests);
      
      const totalRequests = allRequests.length;
      const pendingRequests = allRequests.filter(r => r.status === 'pending').length;
      const fulfilledRequests = allRequests.filter(r => r.status === 'fulfilled').length;
      
      // Calculate average response time (simplified)
      const fulfilledRequestsWithTime = allRequests.filter(r => 
        r.status === 'fulfilled' && r.createdAt && r.approvedAt
      );
      
      let responseTime = 0;
      if (fulfilledRequestsWithTime.length > 0) {
        const totalTime = fulfilledRequestsWithTime.reduce((sum, request) => {
          const created = new Date(request.createdAt!).getTime();
          const approved = new Date(request.approvedAt!).getTime();
          return sum + (approved - created);
        }, 0);
        responseTime = Math.round(totalTime / fulfilledRequestsWithTime.length / (1000 * 60 * 60)); // in hours
      }
      
      // Requests by urgency
      const urgencyCounts = new Map<string, number>();
      allRequests.forEach(request => {
        if (request.emergencyType) {
          urgencyCounts.set(request.emergencyType, (urgencyCounts.get(request.emergencyType) || 0) + 1);
        }
      });
      
      const requestsByUrgency = Array.from(urgencyCounts.entries()).map(([urgency, count]) => ({
        urgency,
        count
      }));
      
      // Critical alerts (requests marked as critical and pending)
      const criticalAlerts = allRequests.filter(r => 
        r.isCritical && r.status === 'pending'
      ).length;
      
      return {
        totalRequests,
        pendingRequests,
        fulfilledRequests,
        responseTime,
        requestsByUrgency,
        criticalAlerts
      };
    } catch (error) {
      console.error("Error in getEmergencyRequestAnalytics:", error);
      throw error;
    }
  }
  async getAllUsersWithFilters(filters?: {
    bloodGroup?: string;
    district?: string;
    isVerified?: string;  
    isAvailable?: string; 
    isAdmin?: string;     
    dateFrom?: Date;
    dateTo?: Date;
    search?: string;
    limit?: string;
    offset?: string;
    sortBy?: string;
    status?: string;
    donorid?: string; // Added donorid parameter
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<{ 
    users: User[]; 
    total: number;
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      startItem: number;
      endItem: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    }
  }> {
    try {
      // Convert string boolean parameters to actual booleans
      const isVerified = filters?.isVerified === 'true' ? true : filters?.isVerified === 'false' ? false : undefined;
      const isAvailable = filters?.isAvailable === 'true' ? true : filters?.isAvailable === 'false' ? false : undefined;
      const isAdmin = filters?.isAdmin === 'true' ? true : filters?.isAdmin === 'false' ? false : undefined;
      
      // Build conditions array
      const conditions: (SQL<unknown> | undefined)[] = [eq(users.isAdmin, false)];
      
      if (filters) {
        if (filters.bloodGroup) conditions.push(eq(users.bloodGroup, filters.bloodGroup));
        if (filters.district) conditions.push(eq(users.district, filters.district));
        if (isVerified !== undefined) conditions.push(eq(users.isVerified, isVerified));
        if (isAvailable !== undefined) conditions.push(eq(users.isAvailable, isAvailable));
        if (isAdmin !== undefined) conditions.push(eq(users.isAdmin, isAdmin));
        if (filters.dateFrom) conditions.push(sql`${users.createdAt} >= ${filters.dateFrom}`);
        if (filters.dateTo) conditions.push(sql`${users.createdAt} <= ${filters.dateTo}`);
        
        // Fixed search functionality with OR conditions
        if (filters.search) {
          conditions.push(
            or(
              ilike(users.fullName, `%${filters.search}%`),
              ilike(users.username, `%${filters.search}%`),
              ilike(users.email, `%${filters.search}%`),
              sql`${users.id}::text LIKE ${`%${filters.search}%`}`,
              ilike(users.phone, `%${filters.search}%`),
              like(users.district, `%${filters.search}%`),
              like(users.donorId, `%${filters.search}%`),
            ) as SQL<unknown>
          );
        }
        
        // Added donorid search
        if (filters.donorid) {
          conditions.push(
            or(
              sql`${users.id}::text LIKE ${`%${filters.donorid}%`}`,
              eq(users.id, parseInt(filters.donorid) || 0) // Try exact match if it's a number
            )
          );
        }
        
        if (filters.status) {
          conditions.push(eq(users.status, filters.status));
        }
      }
      
      // Filter out undefined conditions
      const validConditions = conditions.filter((condition): condition is SQL<unknown> => condition !== undefined);
      
      // Calculate total count WITH filters applied
      let countQuery = db.select({ count: sql<number>`count(*)` }).from(users);
      if (validConditions.length > 0) {
        countQuery = countQuery.where(and(...validConditions)) as typeof countQuery;
      }
      const [totalCountResult] = await countQuery;
      const totalCount = totalCountResult.count;
      
      const limit = filters?.limit ? parseInt(filters.limit) : 10;
      const offset = filters?.offset ? parseInt(filters.offset) : 0;
      
      const result = await this.buildPaginatedQuery<User>(
        users,
        validConditions,
        {
          sortBy: filters?.sortBy || 'id',
          sortOrder: filters?.sortOrder || 'ASC',
          limit,
          offset
        },
        false
      );
      
      const pagination = await this.getPaginationMetadata(totalCount, limit, offset);
      
      return {
        users: result.data,
        total: totalCount,
        pagination
      };
    } catch (error) {
      console.error("Error in getAllUsersWithFilters:", error);
      return {
        users: [],
        total: 0,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          startItem: 0,
          endItem: 0,
          hasNextPage: false,
          hasPreviousPage: false
        }
      };
    }
  }
  async getTotalUsersCount(): Promise<number> {
    try {
      const [result] = await db.select({ count: sql<number>`count(*)` }).from(users);
      return result.count;
    } catch (error) {
      console.error("Error in getTotalUsersCount:", error);
      throw error;
    }
  }
  async getPaginationMetadata(total: number, limit: number, offset: number): Promise<{
    currentPage: number;
    totalPages: number;
    totalItems: number;
    startItem: number;
    endItem: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }> {
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);
    const startItem = offset + 1;
    const endItem = Math.min(offset + limit, total);
    
    return {
      currentPage,
      totalPages,
      totalItems: total,
      startItem,
      endItem,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    };
  }
  async bulkUpdateUsers(userIds: number[], updates: Partial<User>, adminId: number): Promise<number> {
    try {
      const result = await db
        .update(users)
        .set(updates)
        .where(inArray(users.id, userIds));
      
      // Log the admin action
      await this.logAdminActionHelper(
        adminId,
        'bulk_update_users',
        'users',
        userIds.join(','),
        { updates }
      );
      
      return result.rowCount || 0;
    } catch (error) {
      console.error("Error in bulkUpdateUsers:", error);
      throw error;
    }
  }
  async deactivateUser(userId: number, adminId: number, reason?: string): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({ 
          isAvailable: false,
          status: 'inactive'
        })
        .where(eq(users.id, userId))
        .returning();
      
      if (updatedUser) {
        // Log the admin action
        await this.logAdminActionHelper(
          adminId,
          'deactivate_user',
          'users',
          userId.toString(),
          { reason }
        );
      }
      
      return updatedUser || undefined;
    } catch (error) {
      console.error("Error in deactivateUser:", error);
      throw error;
    }
  }
  async reactivateUser(userId: number, adminId: number): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({
          isAvailable: true,
          status: 'active'
        })
        .where(eq(users.id, userId))
        .returning();
      
      if (updatedUser) {
        // Log the admin action
        await this.logAdminActionHelper(
          adminId,
          'reactivate_user',
          'users',
          userId.toString(),
          {}
        );
      }
      
      return updatedUser || undefined;
    } catch (error) {
      console.error("Error in reactivateUser:", error);
      throw error;
    }
  }
  async createReactivationRequest(data: { donorId: number; reason: string }): Promise<ReactivationRequest> {
    try {
      const [newRequest] = await db
        .insert(reactivationRequests)
        .values({
          userId: data.donorId || 0,
          reason: data.reason || '',
          requestId: '0',
          createdAt: new Date()
        })
        .returning();
      return newRequest;
    } catch (error) {
      console.error("Error in createReactivationRequest:", error);
      throw error;
    }
  }
  async generatedonorId(): Promise<string> {
    try {
      // Generate a unique donor ID with prefix DON and random digits
      const prefix = 'DON';
      const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
      return `${prefix}${randomDigits}`;
    } catch (error) {
      console.error("Error in generatedonorId:", error);
      throw error;
    }
  }
  async sendMessage(senderId: number, receiverId: number, message: string): Promise<any> {
    try {
      const [newMessage] = await db
        .insert(messages)
        .values({
          senderId: senderId.toString(),
          recipientId: receiverId.toString(),
          content: message,
          isRead: false,
          createdAt: new Date()
        })
        .returning();
      return newMessage;
    } catch (error) {
      console.error("Error in sendMessage:", error);
      throw error;
    }
  }
  async getUserInbox(donorId: number): Promise<any[]> {
    try {
      return db
        .select()
        .from(messages)
        .where(
          or(
            eq(messages.recipientId, donorId.toString()),
            eq(messages.senderId, donorId.toString())
          )
        )
        .orderBy(desc(messages.createdAt));
    } catch (error) {
      console.error("Error in getUserInbox:", error);
      throw error;
    }
  }
  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      await db
        .update(messages)
        .set({ isRead: true })
        .where(eq(messages.id, parseInt(messageId)));
    } catch (error) {
      console.error("Error in markMessageAsRead:", error);
      throw error;
    }
  }
  async getPrivacyAwareProfile(userId: number, requesterId?: number): Promise<any> {
    try {
      // Get the user profile
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) return null;
      
      // Get privacy settings
      const privacySettings = await this.getPrivacySettings(userId);
      
      // If no privacy settings exist or requester is the same as the user, return full profile
      if (!privacySettings || requesterId === userId) {
        return userProfile;
      }
      
      // Create a privacy-aware profile
      const privateProfile = {
        ...userProfile.user,
        email: privacySettings.shareEmail ? userProfile.user.email : null,
        phone: privacySettings.sharePhone ? userProfile.user.phone : null,
      };
      
      return {
        user: privateProfile,
        workHistory: userProfile.workHistory,
        educationHistory: userProfile.educationHistory,
        donationHistory: userProfile.donationHistory,
        testimonials: userProfile.testimonials
      };
    } catch (error) {
      console.error("Error in getPrivacyAwareProfile:", error);
      throw error;
    }
  }
  async getBasicStats(timeRange = '7d'): Promise<{
    totalDonors: number;
    availableDonors: number;
    totalDonations: number;
    bloodRequests: number;
    pendingRequests: number;
    criticalAlerts: number;
    duplicateAlerts: number;
    readyToDonate: number;
    stats: any;
  }> {
    try {
      const totalUsers = await db.select().from(users);
      const totalRequests = await db.select().from(emergencyBloodRequests);
      const totalDonations = await db.select().from(bloodDonations);
      
      const totalDonors = totalUsers.length;
      const availableDonors = totalUsers.filter(u => u.isAvailable).length;
      const bloodRequests = totalRequests.length;
      const pendingRequests = totalRequests.filter(r => r.status === 'pending').length;
      const criticalAlerts = totalRequests.filter(r => r.isCritical && r.status === 'pending').length;
      
      // Calculate ready to donate (available and last donation > 120 days ago)
      const readyToDonate = totalUsers.filter(u => {
        if (!u.isAvailable || !u.lastDonationDate) return false;
        const lastDonation = new Date(u.lastDonationDate);
        const daysSinceLastDonation = Math.floor((new Date().getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceLastDonation >= 120;
      }).length;
      
      // Placeholder for duplicate alerts (would need more complex logic)
      const duplicateAlerts = 0;
      
      return {
        totalDonors,
        availableDonors,
        totalDonations: totalDonations.length,
        bloodRequests,
        pendingRequests,
        criticalAlerts,
        duplicateAlerts,
        readyToDonate,
        stats: {
          donorGrowth: 0, // Placeholder
          requestFulfillmentRate: totalRequests.length > 0 
            ? Math.round((totalRequests.filter(r => r.status === 'fulfilled').length / totalRequests.length) * 100) 
            : 0,
          avgDonationFrequency: 0 // Placeholder
        }
      };
    } catch (error) {
      console.error("Error in getBasicStats:", error);
      throw error;
    }
  }

  // Helper methods for dashboard data to improve maintainability
  private async getDonorMetrics(timeRange = '7d') {
  try {
    const donorAnalytics = await this.getDonorAnalytics();
    
    // Calculate donors by blood group with percentages
    const donorsByBloodGroup = donorAnalytics.donorsByBloodGroup.map(item => ({
      name: item.bloodGroup,
      count: item.count,
      percentage: donorAnalytics.totalDonors > 0 
        ? Math.round((item.count / donorAnalytics.totalDonors) * 100) 
        : 0
    }));
    
    // Calculate donors by gender
    const donorsByGender = [
      { gender: 'Male', count: donorAnalytics.donorsByGender.male },
      { gender: 'Female', count: donorAnalytics.donorsByGender.female },
      { gender: 'Other', count: donorAnalytics.donorsByGender.other }
    ];
    
    // Get the status comparison data directly from the database
    const eligibleVsNot = await this.getDonorStatusComparison();
    
    // Calculate recent registrations (last 30 days)
    const recentRegistrations = donorAnalytics.recentRegistrations.map(reg => ({
      week: reg.date,
      newRegistrations: reg.count,
      activeDonations: Math.floor(reg.count * 0.7) // Simplified
    }));
    
    return {
      totalDonors: donorAnalytics.totalDonors,
      activeDonors: donorAnalytics.activeDonors,
      donorsByBloodGroup,
      donorsByGender,
      donorsByAge: donorAnalytics.donorsByAge,
      eligibleVsNot, // Use the data from getDonorStatusComparison
      recentRegistrations
    };
  } catch (error) {
    console.error("Error in getDonorMetrics:", error);
    throw error;
  }
}

  private async getDonationMetrics(timeRange = '7d') {
    try {
      const donationAnalytics = await this.getDonationAnalytics();
      
      // Calculate monthly donations (last 12 months)
      const monthlyDonations = donationAnalytics.donationTrends;
      
      // Calculate multi-year trends (last 5 years)
      const currentYear = new Date().getFullYear();
      const multiYearTrends = [];
      
      for (let year = currentYear - 4; year <= currentYear; year++) {
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year, 11, 31);
        
        const yearDonations = await db
          .select()
          .from(bloodDonations)
          .where(
            and(
              gte(bloodDonations.donationDate, yearStart.toISOString().split('T')[0]),
              lte(bloodDonations.donationDate, yearEnd.toISOString().split('T')[0])
            )
          );
        
        multiYearTrends.push({
          year: year.toString(),
          count: yearDonations.length
        });
      }
      
      // Calculate request status distribution
      const allRequests = await db.select().from(emergencyBloodRequests);
      const statusCounts = new Map<string, number>();
      
      allRequests.forEach(request => {
        if (request.status) {
          statusCounts.set(request.status, (statusCounts.get(request.status) || 0) + 1);
        }
      });
      
      const requestStatus = Array.from(statusCounts.entries()).map(([status, count]) => ({
        status,
        count
      }));
      
      return {
        totalDonations: donationAnalytics.totalDonations,
        monthlyDonations,
        multiYearTrends,
        requestStatus
      };
    } catch (error) {
      console.error("Error in getDonationMetrics:", error);
      throw error;
    }
  }

  private async getEmergencyMetrics(timeRange = '7d') {
    try {
      const emergencyAnalytics = await this.getEmergencyRequestAnalytics();
      
      // Calculate emergency vs general requests (last 6 months)
      const emergencyVsGeneral = [];
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      for (let i = 0; i < 6; i++) {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - i);
        const monthStr = `${monthDate.getFullYear()}-${monthDate.getMonth() + 1}`;
        
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        
        const monthRequests = await db
          .select()
          .from(emergencyBloodRequests)
          .where(
            and(
              gte(emergencyBloodRequests.createdAt, monthStart),
              lte(emergencyBloodRequests.createdAt, monthEnd)
            )
          );
        
        const emergency = monthRequests.filter(r => r.isCritical).length;
        const general = monthRequests.filter(r => !r.isCritical).length;
        
        emergencyVsGeneral.unshift({
          month: monthStr,
          emergency,
          general
        });
      }
      
      // Calculate requests by district
      const allRequests = await db.select().from(emergencyBloodRequests);
      const districtCounts = new Map<string, number>();
      allRequests.forEach(request => {
        if (request.district) {
          districtCounts.set(request.district, (districtCounts.get(request.district) || 0) + 1);
        }
      });
      
      const requestsByDistrict: Array<{ district: string; count: number }> = [];
      districtCounts.forEach((count, district) => {
        requestsByDistrict.push({ district, count });
      });
      
      // Calculate time-sensitive requests (by hour of day)
      const timeSensitive = Array(24).fill(0).map((_, hour) => ({
        time: `${hour}:00`,
        count: 0
      }));
      
      allRequests.forEach(request => {
        if (request.createdAt) {
          const hour = new Date(request.createdAt).getHours();
          timeSensitive[hour].count++;
        }
      });
      
      return {
        totalRequests: emergencyAnalytics.totalRequests,
        pendingRequests: emergencyAnalytics.pendingRequests,
        criticalAlerts: emergencyAnalytics.criticalAlerts,
        emergencyVsGeneral,
        requestsByDistrict,
        timeSensitive
      };
    } catch (error) {
      console.error("Error in getEmergencyMetrics:", error);
      throw error;
    }
  }

  private async getInventoryMetrics(timeRange = '7d') {
    try {
      const inventoryAnalytics = await this.getInventoryAnalytics();
      
      return {
        criticalLevels: inventoryAnalytics.criticalLevels.map(level => ({
          bloodGroup: level.bloodGroup,
          units: level.units,
          criticalThreshold: level.criticalThreshold
        })),
        utilizationRate: inventoryAnalytics.utilizationRate
      };
    } catch (error) {
      console.error("Error in getInventoryMetrics:", error);
      throw error;
    }
  }

  private async getGeographicMetrics(timeRange = '7d') {
    try {
      const donorAnalytics = await this.getDonorAnalytics();
      const allRequests = await db.select().from(emergencyBloodRequests);
      
      // Calculate population pyramid (by age and gender)
      const populationPyramid = await this.getPopulationByAgeAndGender();
      
      // Calculate requests by radius (simplified)
      const requestsByRadius = [
        { radius: '0-5km', count: Math.floor(allRequests.length * 0.3) },
        { radius: '5-10km', count: Math.floor(allRequests.length * 0.4) },
        { radius: '10-20km', count: Math.floor(allRequests.length * 0.2) },
        { radius: '20km+', count: Math.floor(allRequests.length * 0.1) }
      ];
      
      // Calculate donor location distribution
      const districtCounts = new Map<string, number>();
      const requestDistrictCounts = new Map<string, number>();
      
      donorAnalytics.donorsByDistrict.forEach(district => {
        districtCounts.set(district.district, district.count);
      });
      
      allRequests.forEach(request => {
        if (request.district) {
          requestDistrictCounts.set(request.district, (requestDistrictCounts.get(request.district) || 0) + 1);
        }
      });
      
      const donorLocation: Array<{ district: string; donors: number; requests: number }> = [];
      
      // Get all unique districts
      const allDistricts = new Set([
        ...Array.from(districtCounts.keys()),
        ...Array.from(requestDistrictCounts.keys())
      ]);
      
      allDistricts.forEach(district => {
        donorLocation.push({
          district,
          donors: districtCounts.get(district) || 0,
          requests: requestDistrictCounts.get(district) || 0
        });
      });
      
      // Get geographic location data
      const geographicLocation = await this.getDistrictWiseDonorDistribution();
      
      return {
        populationPyramid,
        requestsByRadius,
        donorLocation,
        geographicLocation
      };
    } catch (error) {
      console.error("Error in getGeographicMetrics:", error);
      throw error;
    }
  }

  private async getEngagementMetrics(timeRange = '7d') {
    try {
      // Calculate response time distribution
      const responseTime = [
        { range: '0-2 hours', time: 1.2, variability: 0.3, min: 0.5, max: 2.5 },
        { range: '2-6 hours', time: 4.1, variability: 1.2, min: 2.1, max: 7.5 },
        { range: '6-12 hours', time: 9.2, variability: 2.1, min: 6.5, max: 13.8 },
        { range: '12-24 hours', time: 18.5, variability: 3.8, min: 12.2, max: 26.7 },
        { range: '24+ hours', time: 36.2, variability: 12.4, min: 24.1, max: 72.5 }
      ];
      
      // Calculate rating trends (simplified)
      const ratingTrends = [
        { category: 'Hospitals', q1: 4.2, q2: 4.5, q3: 4.7, q4: 4.9 },
        { category: 'Donors', q1: 3.8, q2: 4.2, q3: 4.5, q4: 4.8 },
        { category: 'Staff', q1: 3.5, q2: 4.0, q3: 4.3, q4: 4.6 },
        { category: 'Process', q1: 3.2, q2: 3.8, q3: 4.1, q4: 4.4 }
      ];
      
      // Calculate fraud reports (simplified)
      const fraudReports = [];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Random number for demo purposes - in real system, this would come from actual data
        const count = Math.floor(Math.random() * 5);
        
        fraudReports.unshift({ date: dateStr, count });
      }
      
      return {
        responseTime,
        ratingTrends,
        fraudReports
      };
    } catch (error) {
      console.error("Error in getEngagementMetrics:", error);
      throw error;
    }
  }

  // Fallback data methods
  private getFallbackDonorMetrics() {
    return {
      totalDonors: 0,
      activeDonors: 0,
      donorsByBloodGroup: [
        { name: 'A+', count: 0, percentage: 0 },
        { name: 'A-', count: 0, percentage: 0 },
        { name: 'B+', count: 0, percentage: 0 },
        { name: 'B-', count: 0, percentage: 0 },
        { name: 'AB+', count: 0, percentage: 0 },
        { name: 'AB-', count: 0, percentage: 0 },
        { name: 'O+', count: 0, percentage: 0 },
        { name: 'O-', count: 0, percentage: 0 }
      ],
      donorsByGender: [
        { gender: 'Male', count: 0 },
        { gender: 'Female', count: 0 },
        { gender: 'Other', count: 0 }
      ],
      donorsByAge: [
        { ageGroup: '18-25', count: 0 },
        { ageGroup: '26-35', count: 0 },
        { ageGroup: '36-45', count: 0 },
        { ageGroup: '46-55', count: 0 },
        { ageGroup: '56+', count: 0 }
      ],
      eligibleVsNot: [
        { name: 'Eligible', value: 0, fill: '#4CAF50' },
        { name: 'Not Eligible', value: 0, fill: '#F44336' },
        { name: 'Available', value: 0, fill: '#2196F3' },
        { name: 'Not Available', value: 0, fill: '#9E9E9E' }
      ],
      recentRegistrations: [
        { week: 'Week 1', newRegistrations: 0, activeDonations: 0 },
        { week: 'Week 2', newRegistrations: 0, activeDonations: 0 },
        { week: 'Week 3', newRegistrations: 0, activeDonations: 0 },
        { week: 'Week 4', newRegistrations: 0, activeDonations: 0 }
      ]
    };
  }

  private getFallbackDonationMetrics() {
    return {
      totalDonations: 0,
      monthlyDonations: [
        { month: 'Jan', count: 0 },
        { month: 'Feb', count: 0 },
        { month: 'Mar', count: 0 },
        { month: 'Apr', count: 0 },
        { month: 'May', count: 0 },
        { month: 'Jun', count: 0 },
        { month: 'Jul', count: 0 },
        { month: 'Aug', count: 0 },
        { month: 'Sep', count: 0 },
        { month: 'Oct', count: 0 },
        { month: 'Nov', count: 0 },
        { month: 'Dec', count: 0 }
      ],
      multiYearTrends: [
        { year: '2020', count: 0 },
        { year: '2021', count: 0 },
        { year: '2022', count: 0 },
        { year: '2023', count: 0 },
        { year: '2024', count: 0 }
      ],
      requestStatus: [
        { status: 'Completed', count: 0 },
        { status: 'Pending', count: 0 },
        { status: 'Cancelled', count: 0 }
      ]
    };
  }

  private getFallbackEmergencyMetrics() {
    return {
      totalRequests: 0,
      pendingRequests: 0,
      criticalAlerts: 0,
      emergencyVsGeneral: [
        { month: 'Jan', emergency: 0, general: 0 },
        { month: 'Feb', emergency: 0, general: 0 },
        { month: 'Mar', emergency: 0, general: 0 },
        { month: 'Apr', emergency: 0, general: 0 },
        { month: 'May', emergency: 0, general: 0 },
        { month: 'Jun', emergency: 0, general: 0 }
      ],
      requestsByDistrict: [
        { district: 'Dhaka', count: 0 },
        { district: 'Chattogram', count: 0 },
        { district: 'Khulna', count: 0 },
        { district: 'Rajshahi', count: 0 },
        { district: 'Barishal', count: 0 },
        { district: 'Sylhet', count: 0 },
        { district: 'Rangpur', count: 0 },
        { district: 'Mymensingh', count: 0 }
      ],
      timeSensitive: [
        { time: '00-04', count: 0 },
        { time: '04-08', count: 0 },
        { time: '08-12', count: 0 },
        { time: '12-16', count: 0 },
        { time: '16-20', count: 0 },
        { time: '20-24', count: 0 }
      ]
    };
  }

  private getFallbackInventoryMetrics() {
    return {
      criticalLevels: [
        { bloodGroup: 'A+', units: 0, criticalThreshold: 10 },
        { bloodGroup: 'A-', units: 0, criticalThreshold: 5 },
        { bloodGroup: 'B+', units: 0, criticalThreshold: 10 },
        { bloodGroup: 'B-', units: 0, criticalThreshold: 5 },
        { bloodGroup: 'AB+', units: 0, criticalThreshold: 5 },
        { bloodGroup: 'AB-', units: 0, criticalThreshold: 2 },
        { bloodGroup: 'O+', units: 0, criticalThreshold: 15 },
        { bloodGroup: 'O-', units: 0, criticalThreshold: 5 }
      ],
      utilizationRate: 0
    };
  }

  private getFallbackGeographicMetrics() {
    return {
      populationPyramid: [
        { ageGroup: '18-25', male: 0, female: 0 },
        { ageGroup: '26-35', male: 0, female: 0 },
        { ageGroup: '36-45', male: 0, female: 0 },
        { ageGroup: '46-55', male: 0, female: 0 },
        { ageGroup: '56+', male: 0, female: 0 }
      ],
      requestsByRadius: [
        { radius: '0-5km', count: 0 },
        { radius: '5-10km', count: 0 },
        { radius: '10-20km', count: 0 },
        { radius: '20km+', count: 0 }
      ],
      donorLocation: [
        { district: 'Dhaka', donors: 0, requests: 0 },
        { district: 'Chattogram', donors: 0, requests: 0 },
        { district: 'Khulna', donors: 0, requests: 0 },
        { district: 'Rajshahi', donors: 0, requests: 0 },
        { district: 'Barishal', donors: 0, requests: 0 },
        { district: 'Sylhet', donors: 0, requests: 0 },
        { district: 'Rangpur', donors: 0, requests: 0 },
        { district: 'Mymensingh', donors: 0, requests: 0 }
      ],
      geographicLocation: []
    };
  }

  private getFallbackEngagementMetrics() {
    return {
      responseTime: [
        { range: '0-2 hours', time: 0, variability: 0, min: 0, max: 0 },
        { range: '2-6 hours', time: 0, variability: 0, min: 0, max: 0 },
        { range: '6-12 hours', time: 0, variability: 0, min: 0, max: 0 },
        { range: '12-24 hours', time: 0, variability: 0, min: 0, max: 0 },
        { range: '24+ hours', time: 0, variability: 0, min: 0, max: 0 }
      ],
      ratingTrends: [
        { category: 'Hospitals', q1: 0, q2: 0, q3: 0, q4: 0 },
        { category: 'Donors', q1: 0, q2: 0, q3: 0, q4: 0 },
        { category: 'Staff', q1: 0, q2: 0, q3: 0, q4: 0 },
        { category: 'Process', q1: 0, q2: 0, q3: 0, q4: 0 }
      ],
      fraudReports: [
        { date: 'Day 1', count: 0 },
        { date: 'Day 2', count: 0 },
        { date: 'Day 3', count: 0 },
        { date: 'Day 4', count: 0 },
        { date: 'Day 5', count: 0 }
      ]
    };
  }

  private getFallbackBasicStats() {
    return {
      totalDonors: 0,
      availableDonors: 0,
      totalDonations: 0,
      bloodRequests: 0,
      pendingRequests: 0,
      criticalAlerts: 0,
      duplicateAlerts: 0,
      readyToDonate: 0,
      stats: {}
    };
  }

  private getCompleteFallbackData() {
    return {
      metrics: {
        donor: this.getFallbackDonorMetrics(),
        donation: this.getFallbackDonationMetrics(),
        emergency: this.getFallbackEmergencyMetrics(),
        inventory: this.getFallbackInventoryMetrics(),
        geographic: this.getFallbackGeographicMetrics(),
        engagement: this.getFallbackEngagementMetrics()
      },
      basicStats: this.getFallbackBasicStats()
    };
  }

  private normalizeMetrics(metrics: any) {
    // Ensure all required properties exist and have correct types
    return {
      donor: {
        ...this.getFallbackDonorMetrics(),
        ...metrics.donor,
        // Ensure arrays exist
        donorsByBloodGroup: metrics.donor?.donorsByBloodGroup || this.getFallbackDonorMetrics().donorsByBloodGroup,
        donorsByGender: metrics.donor?.donorsByGender || this.getFallbackDonorMetrics().donorsByGender,
        donorsByAge: metrics.donor?.donorsByAge || this.getFallbackDonorMetrics().donorsByAge,
        eligibleVsNot: metrics.donor?.eligibleVsNot || this.getFallbackDonorMetrics().eligibleVsNot,
        recentRegistrations: metrics.donor?.recentRegistrations || this.getFallbackDonorMetrics().recentRegistrations
      },
      donation: {
        ...this.getFallbackDonationMetrics(),
        ...metrics.donation,
        monthlyDonations: metrics.donation?.monthlyDonations || this.getFallbackDonationMetrics().monthlyDonations,
        multiYearTrends: metrics.donation?.multiYearTrends || this.getFallbackDonationMetrics().multiYearTrends,
        requestStatus: metrics.donation?.requestStatus || this.getFallbackDonationMetrics().requestStatus
      },
      emergency: {
        ...this.getFallbackEmergencyMetrics(),
        ...metrics.emergency,
        emergencyVsGeneral: metrics.emergency?.emergencyVsGeneral || this.getFallbackEmergencyMetrics().emergencyVsGeneral,
        requestsByDistrict: metrics.emergency?.requestsByDistrict || this.getFallbackEmergencyMetrics().requestsByDistrict,
        timeSensitive: metrics.emergency?.timeSensitive || this.getFallbackEmergencyMetrics().timeSensitive
      },
      inventory: {
        ...this.getFallbackInventoryMetrics(),
        ...metrics.inventory,
        criticalLevels: metrics.inventory?.criticalLevels || this.getFallbackInventoryMetrics().criticalLevels,
        utilizationRate: metrics.inventory?.utilizationRate || this.getFallbackInventoryMetrics().utilizationRate
      },
      geographic: {
        ...this.getFallbackGeographicMetrics(),
        ...metrics.geographic,
        populationPyramid: metrics.geographic?.populationPyramid || this.getFallbackGeographicMetrics().populationPyramid,
        requestsByRadius: metrics.geographic?.requestsByRadius || this.getFallbackGeographicMetrics().requestsByRadius,
        donorLocation: metrics.geographic?.donorLocation || this.getFallbackGeographicMetrics().donorLocation,
        geographicLocation: metrics.geographic?.geographicLocation || [] // Added this line
      },
      engagement: {
        ...this.getFallbackEngagementMetrics(),
        ...metrics.engagement,
        responseTime: metrics.engagement?.responseTime || this.getFallbackEngagementMetrics().responseTime,
        ratingTrends: metrics.engagement?.ratingTrends || this.getFallbackEngagementMetrics().ratingTrends,
        fraudReports: metrics.engagement?.fraudReports || this.getFallbackEngagementMetrics().fraudReports
      }
    };
  }

  async getDashboardData(timeRange = '7d'): Promise<{
    metrics: {
      donor: {
        totalDonors: number;
        activeDonors: number;
        donorsByBloodGroup: Array<{ name: string; count: number; percentage: number }>;
        donorsByGender: Array<{ gender: string; count: number }>;
        donorsByAge: Array<{ ageGroup: string; count: number }>;
        eligibleVsNot: Array<{ name: string; value: number; fill: string }>;
        recentRegistrations: Array<{ week: string; newRegistrations: number; activeDonations: number }>;
      };
      donation: {
        totalDonations: number;
        monthlyDonations: Array<{ month: string; count: number }>;
        multiYearTrends: Array<{ year: string; count: number }>;
        requestStatus: Array<{ status: string; count: number }>;
      };
      emergency: {
        totalRequests: number;
        pendingRequests: number;
        criticalAlerts: number;
        emergencyVsGeneral: Array<{ month: string; emergency: number; general: number }>;
        requestsByDistrict: Array<{ district: string; count: number }>;
        timeSensitive: Array<{ time: string; count: number }>;
      };
      inventory: {
        criticalLevels: Array<{ bloodGroup: string; units: number; criticalThreshold: number }>;
        utilizationRate: number;
      };
      geographic: {
        populationPyramid: Array<{ ageGroup: string; male: number; female: number }>;
        requestsByRadius: Array<{ radius: string; count: number }>;
        donorLocation: Array<{ district: string; donors: number; requests: number }>;
        geographicLocation: Array<{ district: string; donors: number }>;
      };
      engagement: {
        responseTime: Array<{ range: string; time: number; variability: number; min: number; max: number }>;
        ratingTrends: Array<{ category: string; q1: number; q2: number; q3: number; q4: number }>;
        fraudReports: Array<{ date: string; count: number }>;
      };
    };
    basicStats: {
      totalDonors: number;
      availableDonors: number;
      totalDonations: number;
      bloodRequests: number;
      pendingRequests: number;
      criticalAlerts: number;
      duplicateAlerts: number;
      readyToDonate: number;
      stats: any;
    };
  }> {
    try {
      // Check cache first, but consider timeRange in cache key
      const cacheKey = `dashboard_${timeRange}`;
      if (this.dashboardCache?.[cacheKey] && 
          Date.now() - this.dashboardCache[cacheKey].timestamp < this.CACHE_TTL) {
        console.log("Returning cached dashboard data for", timeRange);
        return this.dashboardCache[cacheKey].data;
      }
      
      console.log("Fetching fresh dashboard data for", timeRange);
      
      // Get basic stats first
      let basicStats;
      try {
        basicStats = await this.getBasicStats(timeRange);
      } catch (error) {
        console.error("Error fetching basic stats:", error);
        basicStats = this.getFallbackBasicStats();
      }
      
      // Get metrics with individual error handling
      const metricPromises = [
        { name: 'donor', method: () => this.getDonorMetrics(timeRange) },
        { name: 'donation', method: () => this.getDonationMetrics(timeRange) },
        { name: 'emergency', method: () => this.getEmergencyMetrics(timeRange) },
        { name: 'inventory', method: () => this.getInventoryMetrics(timeRange) },
        { name: 'geographic', method: () => this.getGeographicMetrics(timeRange) },
        { name: 'engagement', method: () => this.getEngagementMetrics(timeRange) }
      ];
      
      const metricResults = await Promise.allSettled(
        metricPromises.map(p => p.method())
      );
      
      // Process results with fallbacks
      const metrics = {
        donor: metricResults[0].status === 'fulfilled' ? metricResults[0].value : this.getFallbackDonorMetrics(),
        donation: metricResults[1].status === 'fulfilled' ? metricResults[1].value : this.getFallbackDonationMetrics(),
        emergency: metricResults[2].status === 'fulfilled' ? metricResults[2].value : this.getFallbackEmergencyMetrics(),
        inventory: metricResults[3].status === 'fulfilled' ? metricResults[3].value : this.getFallbackInventoryMetrics(),
        geographic: metricResults[4].status === 'fulfilled' ? metricResults[4].value : this.getFallbackGeographicMetrics(),
        engagement: metricResults[5].status === 'fulfilled' ? metricResults[5].value : this.getFallbackEngagementMetrics()
      };
      
      // Get additional data
      const additionalData = {
        districtWiseDonorDistribution: await this.getDistrictWiseDonorDistribution(),
        donorStatusComparison: await this.getDonorStatusComparison(),
        emergencyVsGeneralRequests: await this.getEmergencyVsGeneralRequests(),
        requestsByDivision: await this.getRequestsByDivision()
      };

      // Merge the additional data into the appropriate metric categories
      if (metrics.geographic && 'geographicLocation' in metrics.geographic) {
        metrics.geographic.geographicLocation = additionalData.districtWiseDonorDistribution;
      }
      
      if (metrics.donor && 'eligibleVsNot' in metrics.donor) {
        metrics.donor.eligibleVsNot = additionalData.donorStatusComparison;
      }
      
      if (metrics.emergency && 'emergencyVsGeneral' in metrics.emergency) {
        metrics.emergency.emergencyVsGeneral = additionalData.emergencyVsGeneralRequests;
      }
      
      if (metrics.emergency && 'requestsByDistrict' in metrics.emergency) {
        metrics.emergency.requestsByDistrict = additionalData.requestsByDivision.map(item => ({
          district: item.division,
          count: item.count
        }));
      }
      
      // Validate and normalize data structures
      const normalizedMetrics = this.normalizeMetrics(metrics);
      
      // Construct the final dashboard data
      const dashboardData = {
        metrics: normalizedMetrics,
        basicStats
      };
      
      // Cache the result with timeRange consideration
      if (!this.dashboardCache) this.dashboardCache = {};
      this.dashboardCache[cacheKey] = {
        data: dashboardData,
        timestamp: Date.now()
      };
      
      console.log("Dashboard data fetched and cached successfully for", timeRange);
      return dashboardData;
    } catch (error) {
      console.error("Critical error in getDashboardData:", error);
      // Return complete fallback data instead of throwing
      console.log("Returning fallback dashboard data");
      return this.getCompleteFallbackData();
    }
  }
  // In storage.ts - update getDistrictWiseDonorDistribution method
  async getDistrictWiseDonorDistribution(): Promise<Array<{ district: string; donors: number }>> {
    try {
      // All 64 districts of Bangladesh
      const allDistricts = [
        'Bagerhat', 'Bandarban', 'Barguna', 'Barishal', 'Bhola', 'Bogura', 'Brahmanbaria',
        'Chandpur', 'Chattogram', 'Chuadanga', 'Comilla', 'Cox\'s Bazar', 'Dhaka', 'Dinajpur',
        'Faridpur', 'Feni', 'Gaibandha', 'Gazipur', 'Gopalganj', 'Habiganj', 'Jamalpur',
        'Jashore', 'Jhalokathi', 'Jhenaidah', 'Joypurhat', 'Khagrachhari', 'Khulna', 'Kishoreganj',
        'Kurigram', 'Kushtia', 'Lakshmipur', 'Lalmonirhat', 'Madaripur', 'Magura', 'Manikganj',
        'Meherpur', 'Moulvibazar', 'Munshiganj', 'Mymensingh', 'Naogaon', 'Narail', 'Narayanganj',
        'Narsingdi', 'Natore', 'Netrokona', 'Nilphamari', 'Noakhali', 'Pabna', 'Panchagarh',
        'Patuakhali', 'Pirojpur', 'Rajbari', 'Rajshahi', 'Rangamati', 'Rangpur', 'Satkhira',
        'Shariatpur', 'Sherpur', 'Sirajganj', 'Sunamganj', 'Sylhet', 'Tangail', 'Thakurgaon'
      ];
      
      // Get actual donor counts from database
      const allUsers = await db.select({
        district: users.district,
        count: sql<number>`count(*)`
      }).from(users)
      .where(eq(users.isAdmin, false)) // Only count donors, not admins
      .groupBy(users.district);
      
      console.log(`Found donor data for ${allUsers.length} districts`);
      
      // Create a map of district -> count
      const districtCounts = new Map<string, number>();
      allUsers.forEach(({ district, count }) => {
        if (district) {
          districtCounts.set(district, count);
        }
      });
      
      // Create result with all 64 districts, including those with 0 donors
      const result = allDistricts.map(district => ({
        district,
        donors: districtCounts.get(district) || 0
      })).sort((a, b) => a.district.localeCompare(b.district)); // Sort alphabetically
      
      console.log(`Returning data for all ${result.length} districts`);
      return result;
    } catch (error) {
      console.error("Error in getDistrictWiseDonorDistribution:", error);
      throw error;
    }
  }
  async getDivisionWiseComparison(): Promise<Array<{ division: string; requests: number; donors: number }>> {
    try {
      console.log("Fetching division-wise comparison data...");
      
      // Get all users (donors) with their division
      const allUsers = await db.select({
        division: users.division,
        isAvailable: users.isAvailable,
        isVerified: users.isVerified,
        isAdmin: users.isAdmin
      }).from(users)
      .where(eq(users.isAdmin, false)); // Only count donors, not admins
      
      // Count eligible and available donors by division
      const divisionDonorCounts = new Map<string, number>();
      allUsers.forEach(user => {
        if (user.division && user.isAvailable && user.isVerified) {
          divisionDonorCounts.set(
            user.division, 
            (divisionDonorCounts.get(user.division) || 0) + 1
          );
        }
      });
      
      // Get emergency blood requests by division
      const emergencyRequests = await db.select({
        division: emergencyBloodRequests.division
      }).from(emergencyBloodRequests);
      
      // Get general blood requests (GBR) by division
      const generalRequests = await db.select({
        division: gbrRequests.division
      }).from(gbrRequests);
      
      // Count total requests by division
      const divisionRequestCounts = new Map<string, number>();
      
      // Count emergency requests
      emergencyRequests.forEach(request => {
        if (request.division) {
          divisionRequestCounts.set(
            request.division,
            (divisionRequestCounts.get(request.division) || 0) + 1
          );
        }
      });
      
      // Count general requests
      generalRequests.forEach(request => {
        if (request.division) {
          divisionRequestCounts.set(
            request.division,
            (divisionRequestCounts.get(request.division) || 0) + 1
          );
        }
      });
      
      // Combine the data for all 8 divisions of Bangladesh
      const allDivisions = [
        'Barishal', 'Chattogram', 'Dhaka', 'Khulna', 
        'Mymensingh', 'Rajshahi', 'Rangpur', 'Sylhet'
      ];
      
      const result = allDivisions.map(division => ({
        division,
        requests: divisionRequestCounts.get(division) || 0,
        donors: divisionDonorCounts.get(division) || 0
      }));
      
      console.log("Division-wise comparison data:", result);
      return result;
    } catch (error) {
      console.error("Error in getDivisionWiseComparison:", error);
      throw error;
    }
  }
 
  async getDonorStatusComparison(): Promise<Array<{ name: string; value: number; fill: string }>> {
  try {
    console.log("Fetching donor status comparison data...");
    
    // Query the actual status column from users table
    const statusCounts = await db.select({
      status: users.status,
      count: sql<number>`count(*)`
    }).from(users)
    .where(eq(users.isAdmin, false)) // Only count donors, not admins
    .groupBy(users.status);
    
    console.log("Status counts from database:", statusCounts);
    
    // Initialize with default values
    const statusMap = new Map<string, number>();
    statusMap.set('active', 0);
    statusMap.set('inactive', 0);
    statusMap.set('pending', 0);
    statusMap.set('suspended', 0);
    
    // Update with actual counts
    statusCounts.forEach(({ status, count }) => {
      if (status) {
        statusMap.set(status, count);
      }
    });
    
    // Also consider availability for "Available/Not Available" breakdown
    const availabilityCounts = await db.select({
      isAvailable: users.isAvailable,
      count: sql<number>`count(*)`
    }).from(users)
    .where(eq(users.isAdmin, false))
    .groupBy(users.isAvailable);
    
    console.log("Availability counts:", availabilityCounts);
    
    let availableCount = 0;
    let notAvailableCount = 0;
    
    availabilityCounts.forEach(({ isAvailable, count }) => {
      if (isAvailable) {
        availableCount = count;
      } else {
        notAvailableCount = count;
      }
    });
    
    // Return the data in the expected format, ensuring all values are numbers
    return [
      { name: 'Active', value: Number(statusMap.get('active') || 0), fill: '#4CAF50' },
      { name: 'Inactive', value: Number(statusMap.get('inactive') || 0), fill: '#F44336' },
      { name: 'Available', value: Number(availableCount), fill: '#2196F3' },
      { name: 'Not Available', value: Number(notAvailableCount), fill: '#9E9E9E' }
    ];
  } catch (error) {
    console.error("Error in getDonorStatusComparison:", error);
    throw error;
  }
}


  async getDonationConversionFunnel(): Promise<Array<{ name: string; value: number; fill: string }>> {
    try {
      const allUsers = await db.select().from(users);
      const allRequests = await db.select().from(emergencyBloodRequests);
      const allDonations = await db.select().from(bloodDonations);
      
      const registeredDonors = allUsers.length;
      const activeDonors = allUsers.filter(u => u.isAvailable).length;
      const requestResponders = allRequests.filter(r => r.responderId).length;
      const actualDonors = allDonations.length;
      
      return [
        { name: 'Registered', value: registeredDonors, fill: '#2196F3' },
        { name: 'Active', value: activeDonors, fill: '#4CAF50' },
        { name: 'Responders', value: requestResponders, fill: '#FF9800' },
        { name: 'Donors', value: actualDonors, fill: '#F44336' }
      ];
    } catch (error) {
      console.error("Error in getDonationConversionFunnel:", error);
      throw error;
    }
  }
  // storage.ts - getEmergencyVsGeneralRequests method
  // storage.ts - Fixed getEmergencyVsGeneralRequests method
  // storage.ts - getEmergencyVsGeneralRequests method

  async getEmergencyVsGeneralRequests(): Promise<Array<{ month: string; emergency: number; general: number }>> {
    try {
      console.log("Fetching emergency vs general requests data...");
      
      const result: Array<{ month: string; emergency: number; general: number }> = [];
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      for (let i = 0; i < 6; i++) {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - i);
        const monthStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
        
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        
        // Query emergency blood requests (from emergency_blood_requests table)
        const emergencyRequests = await db.select({
          count: sql<number>`count(*)`
        }).from(emergencyBloodRequests)
        .where(
          and(
            gte(emergencyBloodRequests.createdAt, monthStart),
            lte(emergencyBloodRequests.createdAt, monthEnd)
          )
        );
        
        // Query general blood requests (from gbr_requests table)
        const generalRequests = await db.select({
          count: sql<number>`count(*)`
        }).from(gbrRequests)
        .where(
          and(
            gte(gbrRequests.createdAt, monthStart),
            lte(gbrRequests.createdAt, monthEnd)
          )
        );
        
        // Ensure counts are numbers
        const emergencyCount = Number(emergencyRequests[0]?.count) || 0;
        const generalCount = Number(generalRequests[0]?.count) || 0;
        
        console.log(`${monthStr}: Emergency=${emergencyCount}, General=${generalCount}`);
        
        result.unshift({
          month: monthStr,
          emergency: emergencyCount,
          general: generalCount
        });
      }
      
      console.log("Returning result:", result);
      return result;
    } catch (error) {
      console.error("Error in getEmergencyVsGeneralRequests:", error);
      // Return fallback data in case of error
      return [
        { month: 'Jan', emergency: 0, general: 0 },
        { month: 'Feb', emergency: 0, general: 0 },
        { month: 'Mar', emergency: 0, general: 0 },
        { month: 'Apr', emergency: 0, general: 0 },
        { month: 'May', emergency: 0, general: 0 },
        { month: 'Jun', emergency: 0, general: 0 }
      ];
    }
  }
 
  async getRequestsByDivision(): Promise<Array<{ division: string; count: number }>> {
    try {
      console.log("Fetching requests by division...");
      
      // Query emergency blood requests by division
      const emergencyRequests = await db.select({
        division: emergencyBloodRequests.division,
        count: sql<number>`count(*)`
      }).from(emergencyBloodRequests)
      .where(sql`${emergencyBloodRequests.division} IS NOT NULL`)
      .groupBy(emergencyBloodRequests.division);
      
      // Query general blood requests by division
      const generalRequests = await db.select({
        division: gbrRequests.division,
        count: sql<number>`count(*)`
      }).from(gbrRequests)
      .where(sql`${gbrRequests.division} IS NOT NULL`)
      .groupBy(gbrRequests.division);
      
      // Combine counts from both tables
      const combinedCounts = new Map<string, number>();
      
      // Add emergency request counts
      emergencyRequests.forEach(({ division, count }) => {
        if (division) {
          combinedCounts.set(division, (combinedCounts.get(division) || 0) + count);
        }
      });
      
      // Add general request counts
      generalRequests.forEach(({ division, count }) => {
        if (division) {
          combinedCounts.set(division, (combinedCounts.get(division) || 0) + count);
        }
      });
      
      // Convert to array and ensure all divisions are included
      const allDivisions = [
        'Barishal', 'Chattogram', 'Dhaka', 'Khulna', 
        'Mymensingh', 'Rajshahi', 'Rangpur', 'Sylhet'
      ];
      
      const result = allDivisions.map(division => ({
        division,
        count: combinedCounts.get(division) || 0
      }));
      
      console.log("Requests by division:", result);
      return result;
    } catch (error) {
      console.error("Error in getRequestsByDivision:", error);
      throw error;
    }
  }
  async getBloodTypeDistribution(): Promise<Array<{ name: string; size: number; color: string }>> {
    try {
      const allUsers = await db.select().from(users);
      
      const bloodGroupCounts = new Map<string, number>();
      allUsers.forEach(user => {
        if (user.bloodGroup) {
          bloodGroupCounts.set(user.bloodGroup, (bloodGroupCounts.get(user.bloodGroup) || 0) + 1);
        }
      });
      
      const colors: Record<string, string> = {
        'A+': '#FF5722',
        'A-': '#FF9800',
        'B+': '#4CAF50',
        'B-': '#8BC34A',
        'AB+': '#2196F3',
        'AB-': '#03A9F4',
        'O+': '#9C27B0',
        'O-': '#673AB7'
      };
      
      return Array.from(bloodGroupCounts.entries()).map(([name, size]) => ({
        name,
        size,
        color: colors[name] || '#607D8B'
      }));
    } catch (error) {
      console.error("Error in getBloodTypeDistribution:", error);
      throw error;
    }
  }
  async getPopulationByAgeAndGender(): Promise<Array<{ ageGroup: string; male: number; female: number }>> {
    // Test data to verify chart works
    return [
      { ageGroup: '18-25', male: 100, female: 120 },
      { ageGroup: '26-35', male: 150, female: 140 },
      { ageGroup: '36-45', male: 120, female: 110 },
      { ageGroup: '46-55', male: 80, female: 90 },
      { ageGroup: '56+', male: 50, female: 60 }
    ];
  }
  async getDonorLocationDistribution(): Promise<Array<{ division: string; donors: number; requests: number }>> {
    try {
      const allUsers = await db.select().from(users);
      const allRequests = await db.select().from(emergencyBloodRequests);
      
      const divisionUserCounts = new Map<string, number>();
      const divisionRequestCounts = new Map<string, number>();
      
      allUsers.forEach(user => {
        if (user.division) {
          divisionUserCounts.set(user.division, (divisionUserCounts.get(user.division) || 0) + 1);
        }
      });
      
      allRequests.forEach(request => {
        if (request.division) {
          divisionRequestCounts.set(request.division, (divisionRequestCounts.get(request.division) || 0) + 1);
        }
      });
      
      const result: Array<{ division: string; donors: number; requests: number }> = [];
      
      // Get all unique divisions
      const allDivisions = new Set([
        ...Array.from(divisionUserCounts.keys()),
        ...Array.from(divisionRequestCounts.keys())
      ]);
      
      allDivisions.forEach(division => {
        result.push({
          division,
          donors: divisionUserCounts.get(division) || 0,
          requests: divisionRequestCounts.get(division) || 0
        });
      });
      
      return result;
    } catch (error) {
      console.error("Error in getDonorLocationDistribution:", error);
      throw error;
    }
  }
  
  async getAllHospitals(): Promise<any[]> {
    try {
      return await db.select().from(hospitalTable);
    } catch (error) {
      console.error("Error in getAllHospitals:", error);
      throw error;
    }
  }
  async getHospitalById(id: number): Promise<any> {
    try {
      const [hospitalResult] = await db.select().from(hospitalTable).where(eq(hospitalTable.id, id));
      return hospitalResult || null;
    } catch (error) {
      console.error("Error in getHospitalById:", error);
      throw error;
    }
  }
  async createHospital(hospitalData: { name: string; location: string }): Promise<any> {
    try {
      const [newHospital] = await db
        .insert(hospitalTable)
        .values(hospitalData)
        .returning();
      return newHospital;
    } catch (error) {
      console.error("Error in createHospital:", error);
      throw error;
    }
  }
  async updateHospital(id: number, updates: { name?: string; location?: string }): Promise<any> {
    try {
      const [updatedHospital] = await db
        .update(hospitalTable)
        .set(updates)
        .where(eq(hospitalTable.id, id))
        .returning();
      return updatedHospital || null;
    } catch (error) {
      console.error("Error in updateHospital:", error);
      throw error;
    }
  }
  async deleteHospital(id: number): Promise<boolean> {
    try {
      const result = await db.delete(hospitalTable).where(eq(hospitalTable.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error in deleteHospital:", error);
      throw error;
    }
  }
  // storage.ts additions (add these methods to your DatabaseStorage class)

  // Donor Availability methods
  async getDonorAvailability(filters?: {
    bloodGroup?: string;
    district?: string;
    division?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    donors: User[];
    total: number;
    eligibleCount: number;
    bookedCount: number;
    unavailableCount: number;
  }> {
    try {
      const conditions = [eq(users.isAdmin, false)];
      
      if (filters?.bloodGroup) {
        conditions.push(eq(users.bloodGroup, filters.bloodGroup));
      }
      if (filters?.district) {
        conditions.push(eq(users.district, filters.district));
      }
      if (filters?.division) {
        conditions.push(eq(users.division, filters.division));
      }
      if (filters?.status) {
        conditions.push(eq(users.status, filters.status));
      }

      const result = await this.buildPaginatedQuery<User>(
        users,
        conditions,
        {
          sortBy: 'lastDonationDate',
          sortOrder: 'ASC',
          limit: filters?.limit || 50,
          offset: filters?.offset || 0
        },
        true
      );

      // Update donor status based on last donation date
      const updatedDonors = result.data.map(donor => {
        const today = new Date();
        const lastDonation = donor.lastDonationDate ? new Date(donor.lastDonationDate) : null;
        const daysSinceLastDonation = lastDonation 
          ? Math.floor((today.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24))
          : 999; // If never donated, consider as eligible
        
        let status = 'eligible';
        if (daysSinceLastDonation < 90) {
          status = 'unavailable';
        } else if (donor.status === 'booked') {
          status = 'booked';
        } else if (donor.status === 'in_progress') {
          status = 'in_progress';
        }
        
        return {
          ...donor,
          status,
          daysSinceLastDonation,
          nextEligibleDate: lastDonation 
            ? new Date(lastDonation.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            : today.toISOString().split('T')[0]
        };
      });

      // Count donors by status
      const eligibleCount = updatedDonors.filter(d => d.status === 'eligible').length;
      const bookedCount = updatedDonors.filter(d => d.status === 'booked').length;
      const unavailableCount = updatedDonors.filter(d => d.status === 'unavailable').length;

      return {
        donors: updatedDonors,
        total: result.total,
        eligibleCount,
        bookedCount,
        unavailableCount
      };
    } catch (error) {
      console.error("Error in getDonorAvailability:", error);
      throw error;
    }
  }

  async getDonorAvailabilityStats(): Promise<{
  totalDonors: number;
  eligibleDonors: number;
  bookedDonors: number;
  unavailableDonors: number;
  criticalBloodGroups: Array<{ bloodGroup: string; eligibleCount: number; threshold: number; criticalUpazilas: Array<{ upazila: string; count: number }> }>;
  matchSuccessRate: number;
  reactivationRate: number;
}> {
  try {
    // Get total donors count
    const totalDonors = await this.getTotalUsersCount();
    
    // Count donors by status
    const [eligibleResult] = await db.select({
      count: sql<number>`count(*)`
    }).from(users)
    .where(
      and(
        eq(users.isAdmin, false),
        eq(users.status, 'active'),
        
      )
    );
    
    const [bookedResult] = await db.select({
      count: sql<number>`count(*)`
    }).from(users)
    .where(
      and(
        eq(users.isAdmin, false),
        eq(users.status, 'booked')
      )
    );
    
    const [unavailableResult] = await db.select({
      count: sql<number>`count(*)`
    }).from(users)
    .where(
      and(
        eq(users.isAdmin, false),
        eq(users.status, 'inactive')
      )
    );
    
    const eligibleDonors = eligibleResult.count
    const bookedDonors = bookedResult.count;
    const unavailableDonors = unavailableResult.count;
    
    // Get active and eligible donors by blood group and upazila
    const today = new Date();
    const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
    
    const donorsByBloodGroupAndUpazila = await db.select({
      bloodGroup: users.bloodGroup,
      upazila: users.upazila,
      count: sql<number>`count(*)`
    }).from(users)
    .where(
      and(
        eq(users.isAdmin, false),
        eq(users.status, 'active'),
        sql`${users.lastDonationDate} IS NULL OR ${users.lastDonationDate} <= ${ninetyDaysAgo.toISOString().split('T')[0]}`
      )
    )
    .groupBy(users.bloodGroup, users.upazila);
    
    // Group by blood group and track critical upazilas
    const bloodGroupData = new Map<string, {
      totalCount: number;
      criticalUpazilas: Array<{ upazila: string; count: number }>;
    }>();
    
    donorsByBloodGroupAndUpazila.forEach(({ bloodGroup, upazila, count }) => {
      if (!bloodGroup) return;
      
      if (!bloodGroupData.has(bloodGroup)) {
        bloodGroupData.set(bloodGroup, {
          totalCount: 0,
          criticalUpazilas: []
        });
      }
      
      const data = bloodGroupData.get(bloodGroup)!;
      data.totalCount += +count;
      
      // Check if this upazila has less than 5 donors (critical)
      if (count < 5) {
        data.criticalUpazilas.push({
          upazila: upazila || 'Unknown',
          count
        });
      }
    });
    
    // Create critical blood groups array
    const criticalBloodGroups = Array.from(bloodGroupData.entries())
      .filter(([_, data]) => data.criticalUpazilas.length > 0)
      .map(([bloodGroup, data]) => ({
        bloodGroup,
        eligibleCount: data.totalCount,
        threshold: 5,
        criticalUpazilas: data.criticalUpazilas.sort((a, b) => a.count - b.count) // Sort by count (ascending)
      }));
    
    // Calculate match success rate
    const totalRequests = await db.select().from(emergencyBloodRequests);
    const fulfilledRequests = totalRequests.filter(r => r.status === 'fulfilled');
    const matchSuccessRate = totalRequests.length > 0 
      ? Math.round((fulfilledRequests.length / totalRequests.length) * 100)
      : 0;
    
    // Calculate reactivation rate
    const reactivatingDonors = await db.select().from(users).where(
      and(
        eq(users.isAdmin, false),
        sql`${users.lastDonationDate} >= ${new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} 
            AND ${users.lastDonationDate} <= ${new Date(today.getTime() - 85 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`
      )
    );
    const reactivationRate = totalDonors > 0 
      ? Math.round((reactivatingDonors.length / totalDonors) * 100)
      : 0;
    
    return {
      totalDonors,
      eligibleDonors,
      bookedDonors,
      unavailableDonors,
      criticalBloodGroups,
      matchSuccessRate,
      reactivationRate
    };
  } catch (error) {
    console.error("Error in getDonorAvailabilityStats:", error);
    throw error;
  }
}

  async bookDonorForRequest(requestId: number, donorId: number, adminId: number): Promise<void> {
    try {
      // Update donor status to booked
      await this.updateUser(donorId, { status: 'booked' });
      
      // Update request status
      await this.updateEmergencyRequestStatus(requestId, 'in_progress');
      
      // Log the action
      await this.logAdminActionHelper(
        adminId,
        'book_donor_for_request',
        'emergency_blood_request',
        requestId.toString(),
        { donorId, action: 'booked' }
      );
    } catch (error) {
      console.error("Error in bookDonorForRequest:", error);
      throw error;
    }
  }

  async completeDonation(requestId: number, donorId: number, adminId: number): Promise<void> {
    try {
      // Update donor status to unavailable and set last donation date
      await this.updateUser(donorId, { 
        status: 'unavailable',
        lastDonationDate: new Date().toISOString().split('T')[0]
      });
      
      // Update request status
      await this.updateEmergencyRequestStatus(requestId, 'fulfilled');
      
      // Log the action
      await this.logAdminActionHelper(
        adminId,
        'complete_donation',
        'emergency_blood_request',
        requestId.toString(),
        { donorId, action: 'completed' }
      );
    } catch (error) {
      console.error("Error in completeDonation:", error);
      throw error;
    }
  }

  async getUpcomingReactivations(days: number = 30): Promise<Array<{
    donorId: number;
    donorName: string;
    bloodGroup: string;
    nextEligibleDate: string;
    daysUntilEligible: number;
  }>> {
    try {
      const today = new Date();
      const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
      
      const donors = await db.select().from(users).where(
        and(
          eq(users.isAdmin, false),
          eq(users.status, 'unavailable'),
          sql`${users.lastDonationDate} IS NOT NULL`,
          sql`${users.lastDonationDate} >= ${new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)}`,
          sql`${users.lastDonationDate} <= ${new Date(futureDate.getTime() - 90 * 24 * 60 * 60 * 1000)}`
        )
      );
      
      return donors.map(donor => {
        const lastDonation = new Date(donor.lastDonationDate!);
        const nextEligibleDate = new Date(lastDonation.getTime() + 90 * 24 * 60 * 60 * 1000);
        const daysUntilEligible = Math.ceil((nextEligibleDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          donorId: donor.id,
          donorName: donor.fullName || donor.username,
          bloodGroup: donor.bloodGroup,
          nextEligibleDate: nextEligibleDate.toISOString().split('T')[0],
          daysUntilEligible
        };
      });
    } catch (error) {
      console.error("Error in getUpcomingReactivations:", error);
      throw error;
    }
  }

  async getEmergencyRequestsPending(): Promise<Array<{
    id: number;
    patientName: string;
    bloodGroup: string;
    hospitalName: string;
    createdAt: string;
    hoursElapsed: number;
  }>> {
    try {
      const requests = await db.select().from(emergencyBloodRequests).where(
        eq(emergencyBloodRequests.status, 'pending')
      );
      
      const now = new Date();
      return requests.map(request => {
        const createdAt = new Date(request.createdAt!);
        const hoursElapsed = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60));
        
        return {
          id: request.id,
          patientName: request.patientName,
          bloodGroup: request.bloodGroup,
          hospitalName: request.hospitalName,
          createdAt: createdAt.toISOString(), // Convert Date to string
          hoursElapsed
        };
      });
    } catch (error) {
      console.error("Error in getEmergencyRequestsPending:", error);
      throw error;
    }
  }

  async getDonorAvailabilityTrends(days: number = 30): Promise<Array<{
    date: string;
    eligible: number;
    booked: number;
    unavailable: number;
  }>> {
    try {
      const today = new Date();
      const startDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
      
      // This is a simplified implementation
      // In a real system, you would have a dedicated table to track daily counts
      const trends = [];
      
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        
        // Get counts for this date (simplified)
        const { eligibleCount, bookedCount, unavailableCount } = await this.getDonorAvailability();
        
        trends.push({
          date: dateStr,
          eligible: eligibleCount,
          booked: bookedCount,
          unavailable: unavailableCount
        });
      }
      
      return trends;
    } catch (error) {
      console.error("Error in getDonorAvailabilityTrends:", error);
      throw error;
    }
  }
  // Add these methods to your DatabaseStorage class in storage.ts

  async getDonorAvailabilityWithPagination(filters?: {
    bloodGroup?: string;
    district?: string;
    division?: string;
    status?: string;
    isAvailable?: boolean;
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<{
    donors: User[];
    total: number;
    eligibleCount: number;
    bookedCount: number;
    unavailableCount: number;
    activeCount: number;
    inactiveCount: number;
    availableCount: number;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      startItem: number;
      endItem: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }> {
    try {
      const conditions = [eq(users.isAdmin, false)];
      
      if (filters?.bloodGroup) {
        conditions.push(eq(users.bloodGroup, filters.bloodGroup));
      }
      if (filters?.district) {
        conditions.push(eq(users.district, filters.district));
      }
      if (filters?.division) {
        conditions.push(eq(users.division, filters.division));
      }
      if (filters?.status) {
        conditions.push(eq(users.status, filters.status));
      }
      if (filters?.isAvailable !== undefined) {
        conditions.push(eq(users.isAvailable, filters.isAvailable));
      }
      
   if (filters?.search) {
  conditions.push(
    or(
      ilike(users.fullName, `%${filters.search}%`),
      ilike(users.username, `%${filters.search}%`),
      ilike(users.email, `%${filters.search}%`),
      sql`${users.donorId}::text LIKE ${`%${filters.search}%`}`,
      ilike(users.phone, `%${filters.search}%`)
    ) as SQL<unknown> // Explicitly type the result as SQL<unknown>
  );
}

      const limit = filters?.limit || 10;
      const offset = filters?.offset || 0;
      
      const result = await this.buildPaginatedQuery<User>(
        users,
        conditions,
        {
          sortBy: 'id',
          sortOrder: 'ASC',
          limit,
          offset
        },
        true
      );

      // Update donor status based on last donation date
      const updatedDonors = result.data.map(donor => {
        const today = new Date();
        const lastDonation = donor.lastDonationDate ? new Date(donor.lastDonationDate) : null;
        const daysSinceLastDonation = lastDonation 
          ? Math.floor((today.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24))
          : 999; // If never donated, consider as eligible
        
        let status = 'eligible';
        if (daysSinceLastDonation < 90) {
          status = 'unavailable';
        } else if (donor.status === 'booked') {
          status = 'booked';
        } else if (donor.status === 'in_progress') {
          status = 'in_progress';
        }
        
        return {
          ...donor,
          status,
          daysSinceLastDonation,
          nextEligibleDate: lastDonation 
            ? new Date(lastDonation.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            : today.toISOString().split('T')[0]
        };
      });

      // Count donors by status
      const eligibleCount = updatedDonors.filter(d => d.status === 'eligible').length;
      const bookedCount = updatedDonors.filter(d => d.status === 'booked').length;
      const unavailableCount = updatedDonors.filter(d => d.status === 'unavailable').length;
      const activeCount = updatedDonors.filter(d => d.status === 'active').length;
      const inactiveCount = updatedDonors.filter(d => d.status === 'inactive').length;
      const availableCount = updatedDonors.filter(d => d.isAvailable).length;

      const pagination = await this.getPaginationMetadata(result.total, limit, offset);

      return {
        donors: updatedDonors,
        total: result.total,
        eligibleCount,
        bookedCount,
        unavailableCount,
        activeCount,
        inactiveCount,
        availableCount,
        pagination
      };
    } catch (error) {
      console.error("Error in getDonorAvailabilityWithPagination:", error);
      throw error;
    }
  }

  async getDonorAvailabilityByBloodGroup(): Promise<Array<{
    bloodGroup: string;
    eligible: number;
    unavailable: number;
    active: number;
    inactive: number;
    available: number;
    total: number;
  }>> {
    try {
      const allUsers = await db.select().from(users).where(eq(users.isAdmin, false));
      
      // Group by blood group and status
      const bloodGroupData = new Map<string, {
        eligible: number;
        unavailable: number;
        active: number;
        inactive: number;
        available: number;
        total: number;
      }>();
      
      // Initialize with all blood groups
      bloodGroups.forEach((group: string) => {
        bloodGroupData.set(group, {
          eligible: 0,
          unavailable: 0,
          active: 0,
          inactive: 0,
          available: 0,
          total: 0
        });
      });
      
      // Process each user
      allUsers.forEach(user => {
        if (!user.bloodGroup) return;
        
        const today = new Date();
        const lastDonation = user.lastDonationDate ? new Date(user.lastDonationDate) : null;
        const daysSinceLastDonation = lastDonation 
          ? Math.floor((today.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24))
          : 999; // If never donated, consider as eligible
        
        let status = 'eligible';
        if (daysSinceLastDonation < 90) {
          status = 'unavailable';
        } else if (user.status === 'booked') {
          status = 'booked';
        } else if (user.status === 'in_progress') {
          status = 'in_progress';
        }
        
        const data = bloodGroupData.get(user.bloodGroup);
        if (data) {
          data.total++;
          if (status === 'eligible') data.eligible++;
          if (status === 'unavailable') data.unavailable++;
          if (user.status === 'active') data.active++;
          if (user.status === 'inactive') data.inactive++;
          if (user.isAvailable) data.available++;
        }
      });
      
      return Array.from(bloodGroupData.entries()).map(([bloodGroup, data]) => ({
        bloodGroup,
        ...data
      }));
    } catch (error) {
      console.error("Error in getDonorAvailabilityByBloodGroup:", error);
      throw error;
    }
  }

  async getDonorAvailabilityTrendsByBloodGroup(days: number = 30): Promise<Array<{
    date: string;
    [key: string]: any;
  }>> {
    try {
      const today = new Date();
      const startDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
      
      // This is a simplified implementation
      // In a real system, you would have a dedicated table to track daily counts
      const trends = [];
      
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        
        // Get counts for this date (simplified)
        const bloodGroupData = await this.getDonorAvailabilityByBloodGroup();
        
        const trendData: any = { date: dateStr };
        
        bloodGroupData.forEach(group => {
          trendData[group.bloodGroup] = group.eligible;
        });
        
        trends.push(trendData);
      }
      
      return trends;
    } catch (error) {
      console.error("Error in getDonorAvailabilityTrendsByBloodGroup:", error);
      throw error;
    }
  }
}