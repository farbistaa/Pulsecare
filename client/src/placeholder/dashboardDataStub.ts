// src/placeholders/dashboardDataStub.ts
/* REPLACE_ME: Replace exports with real API calls or selectors from your store. */

export const dashboardDataStub = {
  totalDonors: 2000,
  totalBloodDonations: 356,
  donorsReady: 1040,
  pendingEmergencyRequests: 30,
  duplicateAlerts: 2,
  eligibleVsNotEligible: {
    eligible: 1200,
    notEligible: 800
  },
  requestsByDivision: [
    { division: 'Dhaka', count: 89 },
    { division: 'Chattogram', count: 67 },
    { division: 'Rajshahi', count: 45 },
    { division: 'Khulna', count: 38 },
    { division: 'Barishal', count: 42 },
    { division: 'Sylhet', count: 28 },
    { division: 'Rangpur', count: 35 },
    { division: 'Mymensingh', count: 31 }
  ],
  requestStatusComparison: [
    { status: 'Completed', count: 456 },
    { status: 'Pending', count: 123 },
    { status: 'Cancelled', count: 45 }
  ],
  populationByAgeGender: [
    { ageGroup: '18-25', male: 156, female: 145 },
    { ageGroup: '26-35', male: 228, female: 198 },
    { ageGroup: '36-45', male: 199, female: 176 },
    { ageGroup: '46-55', male: 143, female: 122 },
    { ageGroup: '56-65', male: 67, female: 58 },
    { ageGroup: '65+', male: 6, female: 5 }
  ],
  districtsNetwork: Array.from({ length: 24 }, (_, i) => ({
    id: `District ${i + 1}`,
    marker: { radius: 8 },
    color: `hsl(${(i * 15) % 360}, 70%, 50%)`,
  })),
  radialData: [
    { y: 80, color: '#1F6FEB' },
    { y: 65, color: '#FF6B6B' },
    { y: 90, color: '#FFD166' },
    { y: 75, color: '#4BC0C8' },
    { y: 85, color: '#8B5CF6' },
    { y: 70, color: '#EC4899' },
    { y: 95, color: '#10B981' },
    { y: 60, color: '#F59E0B' },
  ],
  arcDiagramData: [
    ['User A', 'User B'],
    ['User A', 'User C'],
    ['User B', 'User D'],
    ['User C', 'User E'],
    ['User D', 'User F'],
    ['User E', 'User F'],
    ['User F', 'User G'],
    ['User G', 'User H'],
  ],
  arcDiagramNodes: [
    { id: 'User A', marker: { radius: 10 }, color: '#1F6FEB' },
    { id: 'User B', marker: { radius: 8 }, color: '#FF6B6B' },
    { id: 'User C', marker: { radius: 8 }, color: '#FFD166' },
    { id: 'User D', marker: { radius: 8 }, color: '#4BC0C8' },
    { id: 'User E', marker: { radius: 8 }, color: '#8B5CF6' },
    { id: 'User F', marker: { radius: 8 }, color: '#EC4899' },
    { id: 'User G', marker: { radius: 8 }, color: '#10B981' },
    { id: 'User H', marker: { radius: 8 }, color: '#F59E0B' },
  ]
};