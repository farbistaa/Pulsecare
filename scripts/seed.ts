import { db } from '../server/db.js';
import { users as usersTable, donations, emergencyRequests, messages, testimonials } from '../shared/schema.js';
import { BANGLADESHI_NAMES, BANGLADESHI_CITIES, BLOOD_GROUPS, COMPANIES, UNIVERSITIES, COURSES, getRandomElement, getRandomGender } from '../shared/constants.js';
import bcrypt from 'bcrypt';



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

function getRandomEmail(name: string, index: number): string {
  const domain = getRandomElement(['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']);
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  const timestamp = Date.now();
  return `${cleanName}${index}${timestamp}@${domain}`;
}

function getRandomBio(): string {
  const bios = [
    'Passionate about helping others through blood donation. Regular donor for 5+ years.',
    'Medical student committed to saving lives. Available for emergency donations.',
    'Teacher by profession, life-saver by choice. Happy to donate blood when needed.',
    'Engineer working in tech industry. Believes in giving back to the community.',
    'Healthcare worker dedicated to helping patients in need.',
    'Business professional who donates blood regularly to help save lives.',
    'University student studying medicine. Volunteer blood donor since 2019.',
    'Banker by day, life-saver by calling. Regular blood donor and community volunteer.',
    'Software developer passionate about technology and helping others.',
    'Researcher in biotechnology field. Strong advocate for blood donation awareness.',
    'Government employee committed to public service and community welfare.',
    'Entrepreneur who believes in corporate social responsibility.',
    'Pharmacist dedicated to healthcare and community service.',
    'Journalist covering health and social issues. Regular blood donor.',
    'Artist and creative professional who gives back to the community.',
    'Sports enthusiast and fitness trainer. Healthy lifestyle advocate.',
    'Social worker helping underprivileged communities. Blood donation volunteer.',
    'Chef and restaurateur who supports local health initiatives.',
    'Lawyer practicing family law. Committed to community service.',
    'Accountant working in finance sector. Regular charitable contributor.'
  ];
  return getRandomElement(bios);
}

async function createDemoUsers() {
  console.log('Starting to create 1200+ demo users...');
  
  const users = [];
  const saltRounds = 10;
  const defaultPasswordHash = await bcrypt.hash('password123', saltRounds);
  
  for (let i = 0; i < 1200; i++) {
    const gender = Math.random() > 0.6 ? 'male' : 'female'; // More male donors statistically
    const fullName = getRandomElement(BANGLADESHI_NAMES[gender]);
    const city = getRandomElement(BANGLADESHI_CITIES);
    const bloodGroup = getRandomElement(BLOOD_GROUPS);
    const age = 18 + Math.floor(Math.random() * 42); // 18-60 years
    const dateOfBirth = new Date(new Date().getFullYear() - age, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
    
    // Create work history (0-3 jobs)
    const workHistoryCount = Math.floor(Math.random() * 4);
    const workHistory = [];
    for (let j = 0; j < workHistoryCount; j++) {
      const company = getRandomElement(COMPANIES);
      const positions = ['Software Engineer', 'Manager', 'Analyst', 'Executive', 'Officer', 'Assistant', 'Specialist', 'Coordinator'];
      workHistory.push({
        company,
        position: getRandomElement(positions),
        city: getRandomElement(BANGLADESHI_CITIES),
        description: `Working as a professional in ${company} with expertise in my field.`,
        fromDate: getRandomDate(new Date(2015, 0, 1), new Date(2020, 11, 31)),
        toDate: Math.random() > 0.3 ? getRandomDate(new Date(2021, 0, 1), new Date()) : null,
        currentlyWorking: Math.random() > 0.7
      });
    }
    
    // Create education history (1-2 degrees)
    const educationHistoryCount = 1 + Math.floor(Math.random() * 2);
    const educationHistory = [];
    for (let j = 0; j < educationHistoryCount; j++) {
      const institution = getRandomElement(UNIVERSITIES);
      const course = getRandomElement(COURSES);
      const graduated = Math.random() > 0.2;
      educationHistory.push({
        institution,
        course,
        description: `${graduated ? 'Graduated' : 'Studying'} ${course} from ${institution}.`,
        fromDate: getRandomDate(new Date(2010, 0, 1), new Date(2018, 11, 31)),
        toDate: graduated ? getRandomDate(new Date(2014, 0, 1), new Date(2022, 11, 31)) : null,
        graduated,
        type: getRandomElement(['Bachelor', 'Master', 'Diploma', 'Certificate'])
      });
    }
    
    const user = {
      username: `user${i + 1}`,
      email: getRandomEmail(fullName, i),
      phone: getRandomPhoneNumber(),
      password: defaultPasswordHash,
      fullName,
      dateOfBirth,
      bloodGroup,
      weight: 50 + Math.floor(Math.random() * 40), // 50-90 kg
      district: getRandomElement(BANGLADESHI_CITIES),
      upazila: `Upazila ${Math.floor(Math.random() * 10) + 1}`,
      address: `House ${Math.floor(Math.random() * 100) + 1}, Road ${Math.floor(Math.random() * 50) + 1}, ${city}`,
      lastDonation: Math.random() > 0.3 ? getRandomDate(new Date(2022, 0, 1), new Date()) : null,
      isVerified: Math.random() > 0.3,
      isAvailable: Math.random() > 0.2,
      donationCount: Math.floor(Math.random() * 20),
      rating: Math.floor((3.5 + Math.random() * 1.5) * 10), // 35-50 (representing 3.5-5.0)
      profilePicture: Math.random() > 0.7 ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}` : null,
      coverPhoto: null,
      bio: getRandomBio(),
      education: JSON.stringify(educationHistory),
      work: JSON.stringify(workHistory),
      currentCity: city,
      hometown: getRandomElement(bangladeshiCities),
      socialLinks: {
        facebook: Math.random() > 0.5 ? `https://facebook.com/${fullName.toLowerCase().replace(/\s+/g, '.')}` : null,
        linkedin: Math.random() > 0.7 ? `https://linkedin.com/in/${fullName.toLowerCase().replace(/\s+/g, '-')}` : null
      },
      bloodDonationHistory: [],
      isAdmin: false,
      createdAt: new Date(2023 + Math.random() * 2, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
    };
    
    users.push(user);
    
    if ((i + 1) % 100 === 0) {
      console.log(`Created ${i + 1} users...`);
    }
  }
  
  console.log('Inserting users into database...');
  
  // Insert users in batches of 100
  for (let i = 0; i < users.length; i += 100) {
    const batch = users.slice(i, i + 100);
    await db.insert(usersTable).values(batch);
    console.log(`Inserted batch ${Math.floor(i / 100) + 1}/${Math.ceil(users.length / 100)}`);
  }
  
  console.log('Users created successfully!');
  return users;
}

async function createDonationHistory(userIds: number[]) {
  console.log('Creating donation history...');
  
  const donationsList = [];
  const hospitals = [
    'Dhaka Medical College Hospital', 'Chittagong Medical College Hospital', 'Sir Salimullah Medical College',
    'Bangabandhu Sheikh Mujib Medical University', 'National Institute of Cardiovascular Diseases',
    'National Institute of Cancer Research', 'Combined Military Hospital', 'Square Hospital',
    'Apollo Hospital Dhaka', 'United Hospital', 'Evercare Hospital', 'Ibn Sina Hospital',
    'Popular Medical College Hospital', 'Holy Family Red Crescent Medical College Hospital',
    'Green Life Medical College Hospital', 'Central Hospital Limited', 'Delta Medical College Hospital',
    'Anwer Khan Modern Medical College Hospital', 'Labaid Specialized Hospital', 'Imperial Hospital Limited'
  ];
  
  // Create 500 donation records
  for (let i = 0; i < 500; i++) {
    const donorId = getRandomElement(userIds);
    const donation = {
      donorId,
      recipientName: getRandomElement([...BANGLADESHI_NAMES.male, ...BANGLADESHI_NAMES.female]),
      hospitalName: getRandomElement(hospitals),
      donationDate: getRandomDate(new Date(2020, 0, 1), new Date()),
      bloodGroup: getRandomElement(BLOOD_GROUPS),
      unitsGiven: 1 + Math.floor(Math.random() * 2), // 1-2 units
      status: 'completed',
      notes: Math.random() > 0.5 ? 'Successful donation, patient recovered well.' : null,
      rating: Math.random() > 0.3 ? 4 + Math.floor(Math.random() * 2) : null, // 4-5 stars
      testimonial: Math.random() > 0.7 ? 'Thank you for saving my life. Forever grateful.' : null,
      createdAt: new Date(2020 + Math.random() * 4, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
    };
    donationsList.push(donation);
  }
  
  await db.insert(donations).values(donationsList);
  console.log('Donation history created successfully!');
}

async function createEmergencyRequests(userIds: number[]) {
  console.log('Creating emergency requests...');
  
  const requests = [];
  
  // Create 50 emergency requests
  for (let i = 0; i < 50; i++) {
    const requesterId = getRandomElement(userIds);
    const request = {
      bloodGroup: getRandomElement(BLOOD_GROUPS),
      location: getRandomElement(BANGLADESHI_CITIES),
      hospitalName: getRandomElement([
        'Dhaka Medical College Hospital', 'Chittagong Medical College Hospital', 'Square Hospital',
        'Apollo Hospital Dhaka', 'United Hospital', 'Evercare Hospital'
      ]),
      patientName: getRandomElement([...BANGLADESHI_NAMES.male, ...BANGLADESHI_NAMES.female]),
      contactNumber: getRandomPhoneNumber(),
      urgencyLevel: getRandomElement(['low', 'medium', 'high', 'critical']),
      unitsNeeded: 1 + Math.floor(Math.random() * 4), // 1-4 units
      description: 'Patient needs urgent blood transfusion. Please contact immediately if available.',
      status: getRandomElement(['pending', 'approved', 'completed', 'cancelled']),
      requesterId,
      documents: JSON.stringify([]),
      createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
    };
    requests.push(request);
  }
  
  await db.insert(emergencyRequests).values(requests);
  console.log('Emergency requests created successfully!');
}

async function createMessages(userIds: number[]) {
  console.log('Creating messages...');
  
  const messagesList = [];
  const messageTemplates = [
    'Hello, I saw your blood donation profile. Are you available for donation?',
    'Thank you for your willingness to donate blood. Can we schedule a time?',
    'I urgently need blood for my relative. Can you help?',
    'Your last donation was very helpful. Thank you for being a lifesaver!',
    'Are you available for donation this weekend?',
    'I would like to know more about the donation process.',
    'Can you donate blood at Dhaka Medical College Hospital?',
    'Thank you for registering as a blood donor. You are a hero!',
    'I need O+ blood urgently. Can you help?',
    'Your donation saved my fathers life. Thank you so much!'
  ];
  
  // Create 200 messages
  for (let i = 0; i < 200; i++) {
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
  console.log('Messages created successfully!');
}

async function createTestimonials(userIds: number[]) {
  console.log('Creating testimonials...');
  
  const testimonialsList = [];
  const testimonialTemplates = [
    '{name} was incredibly responsive during our emergency. Their quick action helped save my father\'s life. Forever grateful!',
    'Thanks to {name}, my sister received the blood she needed during surgery. Very professional and caring donor.',
    '{name} is a true lifesaver! Responded quickly to our urgent request and made the whole process smooth.',
    'Amazing experience with {name}. Very reliable donor who went above and beyond to help our family.',
    '{name} saved my mother\'s life with their quick response. Highly recommend this compassionate donor!',
    'Professional and caring - {name} made the whole donation process comfortable and stress-free.',
    '{name} is an excellent donor with great communication. Available when we needed help most.',
    'Very reliable donor! {name} has helped multiple times with emergency requests in our community.',
    'Compassionate and quick to respond. Thank you {name} for being a lifesaver!',
    '{name} is a real hero. Always available to help in critical situations. 5 stars!'
  ];
  
  // Get user data for personalized testimonials
  const usersData = await db.select().from(usersTable).where(inArray(usersTable.id, userIds));
  const userMap = new Map(usersData.map(user => [user.id, user.fullName]));

  // Create 200 testimonials with personalized content
  for (let i = 0; i < 200; i++) {
    const reviewerId = getRandomElement(userIds);
    let revieweeId = getRandomElement(userIds);
    while (revieweeId === reviewerId) {
      revieweeId = getRandomElement(userIds);
    }
    
    const revieweeName = userMap.get(revieweeId) || 'This donor';
    const templateIndex = i % testimonialTemplates.length;
    const personalizedContent = testimonialTemplates[templateIndex].replace(/{name}/g, revieweeName);
    
    const testimonial = {
      reviewerId,
      revieweeId,
      rating: 4 + Math.floor(Math.random() * 2), // 4-5 stars
      content: personalizedContent,
      mediaFiles: JSON.stringify([]),
      isReported: false,
      createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
    };
    testimonialsList.push(testimonial);
  }
  
  await db.insert(testimonials).values(testimonialsList);
  console.log('Testimonials created successfully!');
}

async function main() {
  try {
    console.log('🌱 Starting comprehensive database seeding...');
    
    // Create demo users
    const createdUsers = await createDemoUsers();
    
    // Get user IDs for creating related data
    const userRecords = await db.select({ id: usersTable.id }).from(usersTable);
    const userIds = userRecords.map(u => u.id);
    
    // Create related data
    await createDonationHistory(userIds);
    await createEmergencyRequests(userIds);
    await createMessages(userIds);
    await createTestimonials(userIds);
    
    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Created:`);
    console.log(`   - ${createdUsers.length} users`);
    console.log(`   - 500 donation records`);
    console.log(`   - 50 emergency requests`);
    console.log(`   - 200 messages`);
    console.log(`   - 100 testimonials`);
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

main();