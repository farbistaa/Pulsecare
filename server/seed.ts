import { db } from "./db";
import { users, donations, emergencyRequests, messages, testimonials } from "@shared/schema";
import { BANGLADESHI_NAMES, BANGLADESHI_CITIES, BLOOD_GROUPS, UNIVERSITIES, getRandomElement } from "@shared/constants";
import bcrypt from "bcryptjs";

function getRandomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

function getRandomPhoneNumber(): string {
  const prefixes = ['013', '014', '015', '016', '017', '018', '019'];
  const prefix = getRandomElement(prefixes);
  const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return `+880${prefix}${number}`;
}

async function seedDatabase() {
  try {
    console.log("🌱 Starting comprehensive database seeding with 2000+ users...");

    const saltRounds = 10;
    const defaultPasswordHash = await bcrypt.hash("password123", saltRounds);

    // Create admin user first
    const adminPassword = await bcrypt.hash("admin123", saltRounds);
    await db.insert(users).values({
      username: "admin",
      email: "admin@pulscare.com", 
      phone: "+8801700000000",
      password: adminPassword,
      fullName: "System Administrator",
      dateOfBirth: "1990-01-01",
      bloodGroup: "O+",
      weight: 70,
      district: "Dhaka",
      upazila: "Dhanmondi",
      address: "Admin Office, Dhaka",
      isAdmin: true,
      isVerified: true,
      isAvailable: false,
      donationCount: 0,
      rating: 50
    });

    console.log("✅ Admin user created");

    // Create comprehensive demo users in batches
    let totalUsersCreated = 0;
    for (let batch = 0; batch < 40; batch++) {
      const batchUsers = [];
      const batchSize = batch === 39 ? 49 : 50; // Last batch has 49 users = 1999 users + 1 admin = 2000 total

      for (let i = 0; i < batchSize; i++) {
        totalUsersCreated++;
        const userIndex = totalUsersCreated;
        const gender = Math.random() > 0.4 ? 'male' : 'female';
        const fullName = getRandomElement(BANGLADESHI_NAMES[gender]);
        const city = getRandomElement(BANGLADESHI_CITIES);
        const bloodGroup = getRandomElement(BLOOD_GROUPS);
        const age = 18 + Math.floor(Math.random() * 42);
        const dateOfBirth = new Date(new Date().getFullYear() - age, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];

        const user = {
          username: `user${userIndex}`,
          email: `user${userIndex}_${Date.now()}@${getRandomElement(['gmail.com', 'yahoo.com', 'hotmail.com'])}`,
          phone: getRandomPhoneNumber(),
          password: defaultPasswordHash,
          fullName,
          dateOfBirth,
          bloodGroup,
          weight: 50 + Math.floor(Math.random() * 40),
          district: city,
          upazila: `Upazila ${Math.floor(Math.random() * 10) + 1}`,
          address: `House ${Math.floor(Math.random() * 100) + 1}, Road ${Math.floor(Math.random() * 50) + 1}, ${city}`,
          lastDonation: Math.random() > 0.4 ? getRandomDate(new Date(2022, 0, 1), new Date()) : null,
          isVerified: Math.random() > 0.3,
          isAvailable: Math.random() > 0.2,
          donationCount: Math.floor(Math.random() * 15),
          rating: 35 + Math.floor(Math.random() * 15), // 35-50 (representing 3.5-5.0)
          profilePicture: Math.random() > 0.7 ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}` : null,
          bio: `Passionate about helping others through blood donation. ${Math.random() > 0.5 ? 'Regular donor for 3+ years.' : 'Available for emergency donations.'}`,
          education: Math.random() > 0.3 ? `Graduated from ${getRandomElement(UNIVERSITIES)}` : null,
          work: getRandomElement(['Engineer', 'Teacher', 'Doctor', 'Business Professional', 'Government Officer', 'Student']),
          currentCity: city,
          hometown: getRandomElement(BANGLADESHI_CITIES),
          socialLinks: {
            facebook: Math.random() > 0.6 ? `https://facebook.com/${fullName.toLowerCase().replace(/\s+/g, '.')}` : null
          },
          bloodDonationHistory: [],
          isAdmin: false
        };

        batchUsers.push(user);
      }

      await db.insert(users).values(batchUsers);
      console.log(`✅ Batch ${batch + 1}/40 created (${batchSize} users)`);
    }

    console.log("✅ All 2000 users created successfully!");

    // Get all user IDs for creating related data
    const allUsers = await db.select({ id: users.id }).from(users);
    const userIds = allUsers.map(u => u.id);

    // Create donation history (800 records)
    console.log("Creating donation history...");
    const donationsList = [];
    const hospitals = [
      'Dhaka Medical College Hospital', 'Chittagong Medical College Hospital', 'Square Hospital',
      'Apollo Hospital Dhaka', 'United Hospital', 'Evercare Hospital', 'Ibn Sina Hospital',
      'Holy Family Red Crescent Medical College Hospital', 'Bangabandhu Sheikh Mujib Medical University',
      'Combined Military Hospital (CMH)', 'National Institute of Cardiovascular Diseases'
    ];

    for (let i = 0; i < 800; i++) {
      const donorId = getRandomElement(userIds);
      const donation = {
        donorId,
        recipientName: getRandomElement([...BANGLADESHI_NAMES.male, ...BANGLADESHI_NAMES.female]),
        hospitalName: getRandomElement(hospitals),
        donationDate: getRandomDate(new Date(2020, 0, 1), new Date()),
        bloodGroup: getRandomElement(BLOOD_GROUPS),
        unitsGiven: 1 + Math.floor(Math.random() * 2),
        status: 'completed',
        notes: Math.random() > 0.5 ? 'Successful donation, patient recovered well.' : null,
        rating: Math.random() > 0.3 ? 4 + Math.floor(Math.random() * 2) : null,
        testimonial: Math.random() > 0.7 ? 'Thank you for saving my life. Forever grateful.' : null,
        createdAt: new Date(2020 + Math.random() * 4, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
      };
      donationsList.push(donation);
    }

    await db.insert(donations).values(donationsList);
    console.log("✅ 800 donation records created");

    // Create emergency requests (100 records)
    console.log("Creating emergency requests...");
    const requestsList = [];
    for (let i = 0; i < 100; i++) {
      const requesterId = getRandomElement(userIds);
      const request = {
        patientName: getRandomElement([...BANGLADESHI_NAMES.male, ...BANGLADESHI_NAMES.female]),
        patientAge: 20 + Math.floor(Math.random() * 60),
        bloodGroup: getRandomElement(BLOOD_GROUPS),
        unitsRequired: 1 + Math.floor(Math.random() * 4),
        hospitalName: getRandomElement(hospitals),
        doctorName: `Dr. ${getRandomElement([...BANGLADESHI_NAMES.male, ...BANGLADESHI_NAMES.female])}`,
        hospitalAddress: `${getRandomElement(BANGLADESHI_CITIES)} Medical Center`,
        requiredBy: getRandomDate(new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        contactNumber: getRandomPhoneNumber(),
        additionalInfo: 'Patient needs urgent blood transfusion.',
        isCritical: Math.random() > 0.7,
        status: getRandomElement(['pending', 'approved', 'completed']),
        requesterId,
        documents: [],
        createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
      };
      requestsList.push(request);
    }

    await db.insert(emergencyRequests).values(requestsList);
    console.log("✅ 100 emergency requests created");

    // Create messages (400 records) 
    console.log("Creating messages...");
    const messagesList = [];
    const messageTemplates = [
      'Hello, I saw your blood donation profile. Are you available for donation?',
      'Thank you for your willingness to donate blood. Can we schedule a time?',
      'I urgently need blood for my relative. Can you help?',
      'Your last donation was very helpful. Thank you for being a lifesaver!',
      'Are you available for donation this weekend?',
      'Can you donate blood at Dhaka Medical College Hospital?',
      'Thank you for registering as a blood donor. You are a hero!',
      'Emergency blood needed for surgery. Please respond if available.',
      'Can we arrange a convenient time for donation this week?',
      'Your blood type matches our patient. Please help if possible.'
    ];

    for (let i = 0; i < 400; i++) {
      const senderId = getRandomElement(userIds);
      let recipientId = getRandomElement(userIds);
      while (recipientId === senderId) {
        recipientId = getRandomElement(userIds);
      }

      const message = {
        senderId,
        recipientId,
        content: getRandomElement(messageTemplates),
        isRead: Math.random() > 0.4,
        createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
      };
      messagesList.push(message);
    }

    await db.insert(messages).values(messagesList);
    console.log("✅ 400 messages created");

    // Create testimonials (200 records)
    console.log("Creating testimonials...");
    const testimonialsList = [];
    const testimonialTexts = [
      'Amazing blood donor! Very responsive and helped during emergency. Highly recommended.',
      'This person saved my mothers life. Quick response and very helpful. 5 stars!',
      'Professional and caring donor. Made the whole process smooth and comfortable.',
      'Excellent donor with good communication. Available when needed most.',
      'Very reliable donor. Has helped multiple times with emergency requests.',
      'Outstanding donor who went above and beyond to help. Truly grateful!',
      'Quick response time and very professional approach. Thank you so much!',
      'Compassionate and reliable. Made a difficult time much easier.',
      'This donor is a true lifesaver. Responded immediately to our emergency.',
      'Wonderful experience. Professional, caring, and genuinely helpful person.'
    ];

    for (let i = 0; i < 200; i++) {
      const reviewerId = getRandomElement(userIds);
      let revieweeId = getRandomElement(userIds);
      while (revieweeId === reviewerId) {
        revieweeId = getRandomElement(userIds);
      }

      const testimonial = {
        reviewerId,
        revieweeId,
        rating: 4 + Math.floor(Math.random() * 2),
        content: getRandomElement(testimonialTexts),
        mediaFiles: [],
        isReported: false,
        createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
      };
      testimonialsList.push(testimonial);
    }

    await db.insert(testimonials).values(testimonialsList);
    console.log("✅ 200 testimonials created");

    console.log("🎉 Database seeding completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - 2001 users (including admin)`);
    console.log(`   - 800 donation records`);
    console.log(`   - 100 emergency requests`);
    console.log(`   - 400 messages`);
    console.log(`   - 200 testimonials`);
    console.log(`   - Total records: 3501+`);
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seedDatabase().then(() => {
  console.log("✅ Seeding completed, exiting...");
  process.exit(0);
}).catch((error) => {
  console.error("❌ Seed script failed:", error);
  process.exit(1);
});
