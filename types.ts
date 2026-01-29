export enum UserRole {
  ADMIN = 'ADMIN',
  ISSUER = 'ISSUER', // Émetteur
  INVESTOR = 'INVESTOR', // Investisseur
}

export interface User {
  id: string;
  name: string;
  company: string;
  role: UserRole;
  avatar: string;
}

export interface TimeSlot {
  id: string;
  label: string; // e.g., "09:00 - 09:30"
  startTime: string;
}

// Map of userId -> Set of busy slot IDs
export type AvailabilityMap = Record<string, string[]>;

export interface Preference {
  investorId: string;
  issuerId: string;
  priority: number; // 1 (Highest) to 5 (Lowest)
}

export interface Room {
  id: string;
  name: string;
  capacity: number; // usually 1 for 1-to-1, but can model tables
}

export interface Meeting {
  id: string;
  investorId: string;
  issuerId: string;
  slotId: string;
  roomId: string;
  isLocked: boolean;
  status?: 'confirmed' | 'cancelled'; // Added cancelled status
}

export type RequestStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled';

export interface MeetingRequest {
  id: string;
  investorId: string;
  issuerId: string;
  start: string; // ISO String
  end: string; // ISO String
  status: RequestStatus;
  createdAt: number;
  roomId?: string; // Admin assigned room
}

export interface AppState {
  currentUser: User;
  users: User[];
  slots: TimeSlot[];
  rooms: Room[];
  availability: AvailabilityMap; // Lists busy slots per user
  preferences: Preference[];
  meetings: Meeting[];
  requests: MeetingRequest[];
}