// Shared constants for PulseCare application
// Consolidated from multiple seed files to eliminate duplication

export const BANGLADESHI_NAMES = {
  male: [
    'Abdul Rahman', 'Md. Rafiqul Islam', 'Mohammad Karim', 'Abdul Kadir', 'Md. Aminul Islam',
    'Shahidul Islam', 'Md. Nasir Uddin', 'Abdul Halim', 'Md. Shahjahan', 'Mohammad Ali',
    'Mizanur Rahman', 'Md. Golam Mostafa', 'Abdul Majid', 'Md. Shamsul Hoque', 'Mohammad Hasan',
    'Kazi Nazrul Islam', 'Md. Anwar Hossain', 'Abdul Gafur', 'Md. Jahangir Alam', 'Mohammad Reza',
    'Abdur Rahman', 'Md. Monir Hossain', 'Abdul Hamid', 'Md. Moklesur Rahman', 'Mohammad Salim',
    'Nurul Islam', 'Md. Fazlul Haque', 'Abdul Mannan', 'Md. Delwar Hossain', 'Mohammad Yunus',
    'Shahid Ullah', 'Md. Kamrul Islam', 'Abdul Sattar', 'Md. Akhter Hossain', 'Mohammad Hanif',
    'Mizanul Haque', 'Md. Shafiqul Islam', 'Abdul Alim', 'Md. Ruhul Amin', 'Mohammad Zakir',
    'Faruk Ahmed', 'Md. Habibur Rahman', 'Abdul Quddus', 'Md. Lutfar Rahman', 'Mohammad Iqbal',
    'Saiful Islam', 'Md. Abdur Razzak', 'Abdul Bari', 'Md. Mahbubur Rahman', 'Mohammad Aziz'
  ],
  female: [
    'Fatema Khatun', 'Rashida Begum', 'Salma Akter', 'Nasreen Sultana', 'Rahima Khatun',
    'Amina Begum', 'Hasina Akter', 'Kulsum Begum', 'Rabeya Khatun', 'Shahnaz Begum',
    'Marium Akter', 'Rokeya Khatun', 'Anwara Begum', 'Sakina Akter', 'Tahera Khatun',
    'Bilkis Begum', 'Hamida Akter', 'Jahanara Khatun', 'Safura Begum', 'Rashida Akter',
    'Nasreen Khatun', 'Amina Akter', 'Salma Begum', 'Fatema Begum', 'Rahima Akter',
    'Hasina Khatun', 'Kulsum Akter', 'Rabeya Begum', 'Shahnaz Akter', 'Marium Khatun',
    'Rokeya Begum', 'Anwara Akter', 'Sakina Khatun', 'Tahera Begum', 'Bilkis Akter',
    'Hamida Khatun', 'Jahanara Begum', 'Safura Akter', 'Rashida Khatun', 'Nasreen Begum',
    'Amina Khatun', 'Salma Khatun', 'Fatema Akter', 'Rahima Begum', 'Hasina Begum',
    'Kulsum Khatun', 'Rabeya Akter', 'Shahnaz Khatun', 'Marium Begum', 'Rokeya Akter'
  ]
} as const;

export const BANGLADESHI_CITIES = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Rangpur', 'Barisal', 'Comilla', 'Mymensingh',
  'Narsingdi', 'Gazipur', 'Narayanganj', 'Savar', 'Cumilla', 'Brahmanbaria', 'Tangail',
  'Jamalpur', 'Kishoreganj', 'Netrokona', 'Sherpur', 'Munshiganj', 'Manikganj', 'Gopalganj',
  'Faridpur', 'Rajbari', 'Madaripur', 'Shariatpur', 'Chandpur', 'Lakshmipur', 'Feni',
  'Khulna', 'Jessore', 'Kushtia', 'Satkhira', 'Bagerhat', 'Jhenaidah', 'Magura', 'Narail',
  'Chuadanga', 'Meherpur', 'Bogra', 'Pabna', 'Sirajganj', 'Joypurhat', 'Chapai Nawabganj',
  'Naogaon', 'Natore', 'Dinajpur', 'Thakurgaon', 'Panchagarh', 'Nilphamari', 'Lalmonirhat',
  'Kurigram', 'Gaibandha', 'Patuakhali', 'Barguna', 'Bhola', 'Pirojpur', 'Jhalokati',
  'Cox\'s Bazar', 'Bandarban', 'Rangamati', 'Khagrachhari', 'Habiganj', 'Moulvibazar',
  'Sunamganj', 'Netrakona', 'Manikganj', 'Gopalganj'
] as const;

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export const COMPANIES = [
  'Grameenphone Ltd', 'BRAC Bank', 'Dutch-Bangla Bank', 'Robi Axiata Limited', 'Square Pharmaceuticals',
  'Beximco Pharmaceuticals', 'Walton Hi-Tech Industries', 'ACI Limited', 'PRAN-RFL Group',
  'City Bank Limited', 'Standard Chartered Bank', 'HSBC Bangladesh', 'Unilever Bangladesh',
  'Nestle Bangladesh', 'Samsung Bangladesh', 'LG Electronics Bangladesh', 'Banglalink Digital',
  'Airtel Bangladesh', 'BRTC', 'Bangladesh Railway', 'Dhaka Bank', 'Mutual Trust Bank',
  'Prime Bank', 'Southeast Bank', 'United Commercial Bank', 'National Bank Limited',
  'Janata Bank', 'Sonali Bank', 'Agrani Bank', 'Rupali Bank', 'Bangladesh Bank'
] as const;

export const UNIVERSITIES = [
  'University of Dhaka', 'Bangladesh University of Engineering and Technology', 'Chittagong University',
  'Rajshahi University', 'Jahangirnagar University', 'Khulna University', 'Islamic University',
  'Shahjalal University of Science and Technology', 'North South University', 'BRAC University',
  'East West University', 'American International University-Bangladesh', 'Daffodil International University',
  'Independent University, Bangladesh', 'United International University', 'AIUB', 'Southeast University',
  'Stamford University Bangladesh', 'Northern University Bangladesh', 'World University of Bangladesh',
  'Bangladesh Agricultural University', 'Bangabandhu Sheikh Mujib Medical University', 'Dhaka Medical College',
  'Sir Salimullah Medical College', 'Mymensingh Medical College', 'Chittagong Medical College'
] as const;

export const COURSES = [
  'Computer Science and Engineering', 'Electrical and Electronic Engineering', 'Mechanical Engineering',
  'Civil Engineering', 'Business Administration', 'Economics', 'English Literature', 'Mathematics',
  'Physics', 'Chemistry', 'Biology', 'Medicine', 'Law', 'Pharmacy', 'Architecture',
  'Fine Arts', 'Mass Communication and Journalism', 'International Relations', 'Political Science',
  'Sociology', 'Psychology', 'Geography', 'History', 'Philosophy', 'Islamic Studies',
  'Statistics', 'Accounting', 'Finance', 'Marketing', 'Management', 'Biochemistry',
  'Microbiology', 'Public Administration', 'Social Work', 'Education', 'Agricultural Economics'
] as const;

// Utility functions
export function getRandomElement<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getRandomGender(): 'male' | 'female' {
  return Math.random() < 0.5 ? 'male' : 'female';
}