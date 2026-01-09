// Medical eligibility rules for blood donation based on WHO and medical guidelines
// for Bangladesh and international standards

export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
  nextEligibleDate?: Date;
  category: 'eligible' | 'temporarily_ineligible' | 'permanently_ineligible';
}

export interface DonorMedicalInfo {
  dateOfBirth: string;
  weight: number;
  lastDonation?: string | null;
  hemoglobin?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  hasRecentIllness?: boolean;
  hasRecentMedication?: boolean;
  hasRecentTravel?: boolean;
  hasChronic?: boolean;
  chronicConditions?: string[];
  recentVaccination?: boolean;
  vaccinationType?: string;
  vaccinationDate?: string;
  isPregnant?: boolean;
  isBreastfeeding?: boolean;
  hasRecentPiercing?: boolean;
  hasRecentTattoo?: boolean;
  recentAlcohol?: boolean;
  lifestyle?: {
    smoking?: boolean;
    alcohol?: boolean;
    drugUse?: boolean;
  };
}

export function checkDonationEligibility(medicalInfo: DonorMedicalInfo): EligibilityResult {
  const reasons: string[] = [];
  let category: EligibilityResult['category'] = 'eligible';
  let nextEligibleDate: Date | undefined;

  // Age requirements (18-60 years in Bangladesh)
  const age = calculateAge(medicalInfo.dateOfBirth);
  if (age < 18) {
    reasons.push('Must be at least 18 years old');
    category = 'temporarily_ineligible';
    nextEligibleDate = new Date(new Date(medicalInfo.dateOfBirth).setFullYear(new Date(medicalInfo.dateOfBirth).getFullYear() + 18));
  } else if (age > 60) {
    reasons.push('Donors over 60 years require additional medical clearance');
    category = 'temporarily_ineligible';
  }

  // Weight requirement (minimum 50kg per WHO guidelines)
  if (medicalInfo.weight < 50) {
    reasons.push('Minimum weight requirement is 50kg for safe donation');
    category = 'temporarily_ineligible';
  }

  // Donation frequency (120 days / 3 months between whole blood donations)
  if (medicalInfo.lastDonation) {
    const lastDonationDate = new Date(medicalInfo.lastDonation);
    const daysSinceLastDonation = Math.floor((Date.now() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24));
    const requiredInterval = 120; // 3 months

    if (daysSinceLastDonation < requiredInterval) {
      const daysRemaining = requiredInterval - daysSinceLastDonation;
      reasons.push(`Must wait ${daysRemaining} more days since last donation (3-month interval required)`);
      category = 'temporarily_ineligible';
      nextEligibleDate = new Date(lastDonationDate.getTime() + (requiredInterval * 24 * 60 * 60 * 1000));
    }
  }

  // Hemoglobin levels (minimum 12.5g/dL for males, 12.0g/dL for females)
  if (medicalInfo.hemoglobin && medicalInfo.hemoglobin < 12.0) {
    reasons.push('Hemoglobin level too low for safe donation');
    category = 'temporarily_ineligible';
  }

  // Blood pressure requirements (90-180 systolic, 60-100 diastolic)
  if (medicalInfo.bloodPressureSystolic && medicalInfo.bloodPressureDiastolic) {
    if (medicalInfo.bloodPressureSystolic < 90 || medicalInfo.bloodPressureSystolic > 180 ||
        medicalInfo.bloodPressureDiastolic < 60 || medicalInfo.bloodPressureDiastolic > 100) {
      reasons.push('Blood pressure outside acceptable range for donation');
      category = 'temporarily_ineligible';
    }
  }

  // Recent illness (defer for 2 weeks after recovery)
  if (medicalInfo.hasRecentIllness) {
    reasons.push('Must wait 2 weeks after complete recovery from illness');
    category = 'temporarily_ineligible';
  }

  // Recent medication (varies by medication type)
  if (medicalInfo.hasRecentMedication) {
    reasons.push('Recent medication may require deferral period - consult medical staff');
    category = 'temporarily_ineligible';
  }

  // Travel to malaria-endemic areas (3-month deferral)
  if (medicalInfo.hasRecentTravel) {
    reasons.push('Recent travel to certain areas may require 3-month deferral');
    category = 'temporarily_ineligible';
  }

  // Chronic conditions (permanent or temporary deferral)
  if (medicalInfo.hasChronic && medicalInfo.chronicConditions?.length) {
    const permanentDeferralConditions = [
      'HIV/AIDS', 'Hepatitis B', 'Hepatitis C', 'Syphilis', 'Heart Disease', 
      'Cancer', 'Diabetes (insulin-dependent)', 'Epilepsy', 'Severe Anemia'
    ];
    
    const hasPermDeferral = medicalInfo.chronicConditions.some(condition => 
      permanentDeferralConditions.some(permCondition => 
        condition.toLowerCase().includes(permCondition.toLowerCase())
      )
    );

    if (hasPermDeferral) {
      reasons.push('Chronic medical condition prevents donation');
      category = 'permanently_ineligible';
    } else {
      reasons.push('Chronic condition requires medical evaluation');
      category = 'temporarily_ineligible';
    }
  }

  // Recent vaccination (varies by vaccine type)
  if (medicalInfo.recentVaccination) {
    const vaccinationDate = medicalInfo.vaccinationDate ? new Date(medicalInfo.vaccinationDate) : new Date();
    const deferralPeriods = {
      'COVID-19': 7,   // 1 week
      'Flu': 0,        // No deferral
      'Hepatitis B': 7, // 1 week
      'MMR': 28,       // 4 weeks
      'Live vaccines': 28, // 4 weeks
      'Inactivated vaccines': 0
    };

    const vaccineType = medicalInfo.vaccinationType || 'Unknown';
    const deferralDays = deferralPeriods[vaccineType as keyof typeof deferralPeriods] || 7;
    
    if (deferralDays > 0) {
      const daysSinceVaccination = Math.floor((Date.now() - vaccinationDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceVaccination < deferralDays) {
        reasons.push(`Must wait ${deferralDays - daysSinceVaccination} more days after ${vaccineType} vaccination`);
        category = 'temporarily_ineligible';
        nextEligibleDate = new Date(vaccinationDate.getTime() + (deferralDays * 24 * 60 * 60 * 1000));
      }
    }
  }

  // Pregnancy and breastfeeding
  if (medicalInfo.isPregnant) {
    reasons.push('Cannot donate during pregnancy');
    category = 'temporarily_ineligible';
  }

  if (medicalInfo.isBreastfeeding) {
    reasons.push('Cannot donate while breastfeeding (wait 6 months after delivery)');
    category = 'temporarily_ineligible';
  }

  // Recent piercing or tattoo (3-month deferral)
  if (medicalInfo.hasRecentPiercing || medicalInfo.hasRecentTattoo) {
    reasons.push('Must wait 3 months after piercing or tattoo');
    category = 'temporarily_ineligible';
  }

  // Recent alcohol consumption (24-48 hours)
  if (medicalInfo.recentAlcohol) {
    reasons.push('Cannot donate within 24 hours of alcohol consumption');
    category = 'temporarily_ineligible';
  }

  // Lifestyle factors
  if (medicalInfo.lifestyle?.drugUse) {
    reasons.push('Drug use may permanently defer donation eligibility');
    category = 'permanently_ineligible';
  }

  const isEligible = reasons.length === 0;
  
  return {
    isEligible,
    reasons,
    nextEligibleDate,
    category
  };
}

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Quick eligibility check for donor cards (simplified version)
export function checkQuickEligibility(lastDonation: string | null, dateOfBirth: string, weight: number): boolean {
  const age = calculateAge(dateOfBirth);
  
  // Basic checks
  if (age < 18 || age > 60 || weight < 50) {
    return false;
  }

  // Donation interval check
  if (lastDonation) {
    const daysSinceLastDonation = Math.floor((Date.now() - new Date(lastDonation).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLastDonation < 120) {
      return false;
    }
  }

  return true;
}

// Emergency eligibility (relaxed criteria for emergency situations)
export function checkEmergencyEligibility(medicalInfo: DonorMedicalInfo): EligibilityResult {
  const result = checkDonationEligibility(medicalInfo);
  
  // In emergencies, some temporary deferrals might be waived with medical approval
  if (result.category === 'temporarily_ineligible') {
    const relaxedReasons = result.reasons.filter(reason => 
      !reason.includes('Blood pressure') && 
      !reason.includes('Recent medication') &&
      !reason.includes('2 weeks after')
    );
    
    if (relaxedReasons.length === 0) {
      return {
        isEligible: true,
        reasons: ['Eligible under emergency criteria with medical supervision'],
        category: 'eligible'
      };
    }
    
    return {
      ...result,
      reasons: relaxedReasons,
      isEligible: relaxedReasons.length === 0
    };
  }
  
  return result;
}

// Get eligibility status color and text
export function getEligibilityStatus(eligibility: EligibilityResult): {
  color: string;
  text: string;
  bgColor: string;
} {
  switch (eligibility.category) {
    case 'eligible':
      return {
        color: 'text-green-800',
        text: 'Eligible to Donate',
        bgColor: 'bg-green-100'
      };
    case 'temporarily_ineligible':
      return {
        color: 'text-yellow-800',
        text: eligibility.nextEligibleDate 
          ? `Eligible on ${eligibility.nextEligibleDate.toLocaleDateString()}`
          : 'Temporarily Ineligible',
        bgColor: 'bg-yellow-100'
      };
    case 'permanently_ineligible':
      return {
        color: 'text-red-800',
        text: 'Not Eligible to Donate',
        bgColor: 'bg-red-100'
      };
    default:
      return {
        color: 'text-gray-800',
        text: 'Eligibility Unknown',
        bgColor: 'bg-gray-100'
      };
  }
}