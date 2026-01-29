import { User, UserRole, TimeSlot, Room } from './types';

// Global Event Configuration
export const EVENT_SETTINGS = {
  slotDuration: '00:30:00', // 30 minutes
  minTime: '08:00:00',      // Start of day
  maxTime: '20:00:00',      // End of day
  startHour: 8,
  endHour: 20
};

export const MOCK_USERS: User[] = [
  { id: 'admin1', name: 'Administrateur MCMD', company: 'MCMD Org', role: UserRole.ADMIN, avatar: 'https://ui-avatars.com/api/?name=Admin+MCMD&background=0f172a&color=fff' },
  // Issuers
  { id: 'iss1', name: 'Jean Dupont', company: 'TechStart SA', role: UserRole.ISSUER, avatar: 'https://ui-avatars.com/api/?name=Jean+Dupont&background=random' },
  { id: 'iss2', name: 'Marie Curie', company: 'BioGen Corp', role: UserRole.ISSUER, avatar: 'https://ui-avatars.com/api/?name=Marie+Curie&background=random' },
  { id: 'iss3', name: 'Paul Martin', company: 'GreenEnergy', role: UserRole.ISSUER, avatar: 'https://ui-avatars.com/api/?name=Paul+Martin&background=random' },
  { id: 'iss4', name: 'Sophie Lemaire', company: 'FinTech Solutions', role: UserRole.ISSUER, avatar: 'https://ui-avatars.com/api/?name=Sophie+Lemaire&background=random' },
  // Investors
  { id: 'inv1', name: 'Pierre Durand', company: 'Global Ventures', role: UserRole.INVESTOR, avatar: 'https://ui-avatars.com/api/?name=Pierre+Durand&background=random' },
  { id: 'inv2', name: 'Alice Fabre', company: 'Angel Capital', role: UserRole.INVESTOR, avatar: 'https://ui-avatars.com/api/?name=Alice+Fabre&background=random' },
  { id: 'inv3', name: 'Lucas Moreau', company: 'Seed Fund', role: UserRole.INVESTOR, avatar: 'https://ui-avatars.com/api/?name=Lucas+Moreau&background=random' },
];

// Re-generated slots for 30-minute intervals
export const MOCK_SLOTS: TimeSlot[] = [
  { id: 's1', label: '09:00 - 09:30', startTime: '09:00' },
  { id: 's2', label: '09:30 - 10:00', startTime: '09:30' },
  { id: 's3', label: '10:00 - 10:30', startTime: '10:00' },
  { id: 's4', label: '10:30 - 11:00', startTime: '10:30' },
  { id: 's5', label: '11:00 - 11:30', startTime: '11:00' },
  { id: 's6', label: '11:30 - 12:00', startTime: '11:30' },
  { id: 's7', label: '14:00 - 14:30', startTime: '14:00' },
  { id: 's8', label: '14:30 - 15:00', startTime: '14:30' },
  { id: 's9', label: '15:00 - 15:30', startTime: '15:00' },
  { id: 's10', label: '15:30 - 16:00', startTime: '15:30' },
  { id: 's11', label: '16:00 - 16:30', startTime: '16:00' },
];

export const MOCK_ROOMS: Room[] = [
  { id: 'r1', name: 'Salle A - Table 1', capacity: 1 },
  { id: 'r2', name: 'Salle A - Table 2', capacity: 1 },
  { id: 'r3', name: 'Salle A - Table 3', capacity: 1 },
  { id: 'r4', name: 'Salle B - VIP 1', capacity: 1 },
  { id: 'r5', name: 'Salle B - VIP 2', capacity: 1 },
];