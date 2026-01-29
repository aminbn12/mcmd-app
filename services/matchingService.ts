import { User, TimeSlot, Room, Preference, Meeting, AvailabilityMap, UserRole } from '../types';

/**
 * Runs the matching algorithm based on constraints.
 * 
 * Logic:
 * 1. Clear existing non-locked meetings (optional, but assumed for fresh run).
 * 2. Iterate through preferences prioritized by the investor.
 * 3. For each preference, find the first available slot where:
 *    - Investor is free.
 *    - Issuer is free.
 *    - A Room is free.
 */
export const runMatchingAlgorithm = (
  users: User[],
  slots: TimeSlot[],
  rooms: Room[],
  availability: AvailabilityMap,
  preferences: Preference[],
  existingMeetings: Meeting[]
): Meeting[] => {
  
  // 1. Prepare State
  // We keep locked meetings
  let newMeetings = existingMeetings.filter(m => m.isLocked);
  
  // Create quick lookup for busy slots per user due to existing locked meetings
  const userSchedule = new Map<string, Set<string>>(); // userId -> Set<slotId>
  const roomSchedule = new Map<string, Set<string>>(); // slotId -> Set<roomId>

  // Helper to mark busy
  const markBusy = (userId: string, slotId: string) => {
    if (!userSchedule.has(userId)) userSchedule.set(userId, new Set());
    userSchedule.get(userId)?.add(slotId);
  };

  const markRoomBusy = (roomId: string, slotId: string) => {
    if (!roomSchedule.has(slotId)) roomSchedule.set(slotId, new Set());
    roomSchedule.get(slotId)?.add(roomId);
  };

  // Initialize schedules with Availability (Busy marked by users manually)
  Object.entries(availability).forEach(([userId, busySlots]) => {
    busySlots.forEach(slotId => markBusy(userId, slotId));
  });

  // Initialize with Locked Meetings
  newMeetings.forEach(m => {
    markBusy(m.investorId, m.slotId);
    markBusy(m.issuerId, m.slotId);
    markRoomBusy(m.roomId, m.slotId);
  });

  // 2. Sort Preferences
  // We prioritize matches where priority is highest (1).
  // Ideally, we could also weight mutual interest if we had Issuer preferences, 
  // currently we only have Investor preferences as per spec.
  const sortedPreferences = [...preferences].sort((a, b) => a.priority - b.priority);

  // 3. Matching Loop
  sortedPreferences.forEach(pref => {
    const investor = users.find(u => u.id === pref.investorId);
    const issuer = users.find(u => u.id === pref.issuerId);

    if (!investor || !issuer) return;

    // Check if this pair already met (prevent duplicates)
    const alreadyMet = newMeetings.some(m => 
      (m.investorId === investor.id && m.issuerId === issuer.id)
    );
    if (alreadyMet) return;

    // Find a slot
    for (const slot of slots) {
      // Check User Availability
      const investorBusy = userSchedule.get(investor.id)?.has(slot.id);
      const issuerBusy = userSchedule.get(issuer.id)?.has(slot.id);

      if (!investorBusy && !issuerBusy) {
        // Check Room Availability
        const busyRoomsAtSlot = roomSchedule.get(slot.id) || new Set();
        const availableRoom = rooms.find(r => !busyRoomsAtSlot.has(r.id));

        if (availableRoom) {
          // MATCH FOUND!
          const newMeeting: Meeting = {
            id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            investorId: investor.id,
            issuerId: issuer.id,
            slotId: slot.id,
            roomId: availableRoom.id,
            isLocked: false
          };

          newMeetings.push(newMeeting);
          
          // Update Schedules
          markBusy(investor.id, slot.id);
          markBusy(issuer.id, slot.id);
          markRoomBusy(availableRoom.id, slot.id);
          
          break; // Move to next preference
        }
      }
    }
  });

  return newMeetings;
};