import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, TimeSlot, Room, AvailabilityMap, Preference, Meeting, UserRole, AppState, MeetingRequest, RequestStatus } from '../types';
import { MOCK_USERS, MOCK_SLOTS, MOCK_ROOMS } from '../constants';
import { runMatchingAlgorithm } from '../services/matchingService';

interface DataContextType extends AppState {
  setCurrentUser: (user: User) => void;
  toggleAvailability: (slotId: string) => void;
  addPreference: (issuerId: string) => void;
  removePreference: (issuerId: string) => void;
  reorderPreference: (fromIndex: number, toIndex: number) => void;
  addRoom: (name: string, capacity: number) => void;
  deleteRoom: (roomId: string) => void;
  // User Management
  addUser: (name: string, company: string, role: UserRole) => void;
  deleteUser: (userId: string) => void;
  
  updateMeetingRoom: (meetingId: string, roomId: string) => void;
  generateSchedule: () => void;
  resetSchedule: () => void;
  // P2P Methods
  createMeetingRequest: (investorId: string, issuerIds: string[], start: string, end: string) => void;
  updateRequestStatus: (requestId: string, status: RequestStatus) => void;
  updateRequestRoom: (requestId: string, roomId: string) => void;
  cancelMeeting: (id: string, type: 'ALGO' | 'P2P') => void;
  getPendingRequestsCount: (userId: string) => number;
  getConfirmedMeetingsCount: (userId: string) => number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]); // Default to Admin
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [slots] = useState<TimeSlot[]>(MOCK_SLOTS);
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  
  // Mutable State
  const [availability, setAvailability] = useState<AvailabilityMap>({});
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  
  // New State for Requests
  const [requests, setRequests] = useState<MeetingRequest[]>([]);

  // Initialize availability map for all users as empty (all free)
  useEffect(() => {
    const initialAvail: AvailabilityMap = {};
    users.forEach(u => { 
      if (!availability[u.id]) {
        initialAvail[u.id] = []; 
      } else {
        initialAvail[u.id] = availability[u.id];
      }
    });
    setAvailability(initialAvail);
  }, [users]);

  // Toggle Busy/Free for current user
  const toggleAvailability = (slotId: string) => {
    setAvailability(prev => {
      const userBusySlots = prev[currentUser.id] || [];
      const isBusy = userBusySlots.includes(slotId);
      
      let newSlots;
      if (isBusy) {
        newSlots = userBusySlots.filter(id => id !== slotId);
      } else {
        newSlots = [...userBusySlots, slotId];
      }

      return {
        ...prev,
        [currentUser.id]: newSlots
      };
    });
  };

  // Preference Management
  const addPreference = (issuerId: string) => {
    if (currentUser.role !== UserRole.INVESTOR) return;
    setPreferences(prev => {
      if (prev.some(p => p.investorId === currentUser.id && p.issuerId === issuerId)) return prev;
      return [
        ...prev,
        { investorId: currentUser.id, issuerId, priority: prev.filter(p => p.investorId === currentUser.id).length + 1 }
      ];
    });
  };

  const removePreference = (issuerId: string) => {
     setPreferences(prev => prev.filter(p => !(p.investorId === currentUser.id && p.issuerId === issuerId)));
  };

  const reorderPreference = (fromIndex: number, toIndex: number) => {
     const myPrefs = preferences.filter(p => p.investorId === currentUser.id);
     if (!myPrefs[fromIndex] || !myPrefs[toIndex]) return;

     const newOrder = [...myPrefs];
     const [moved] = newOrder.splice(fromIndex, 1);
     newOrder.splice(toIndex, 0, moved);
     const updatedMyPrefs = newOrder.map((p, idx) => ({ ...p, priority: idx + 1 }));

     setPreferences(prev => {
       const otherPrefs = prev.filter(p => p.investorId !== currentUser.id);
       return [...otherPrefs, ...updatedMyPrefs];
     });
  };

  // Room Management
  const addRoom = (name: string, capacity: number) => {
    const newRoom: Room = { id: `room-${Date.now()}`, name, capacity };
    setRooms(prev => [...prev, newRoom]);
  };

  const deleteRoom = (roomId: string) => {
    setRooms(prev => prev.filter(r => r.id !== roomId));
  };

  // User Management
  const addUser = (name: string, company: string, role: UserRole) => {
    const newUser: User = {
      id: role === UserRole.INVESTOR ? `inv-${Date.now()}` : `iss-${Date.now()}`,
      name,
      company,
      role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    };
    setUsers(prev => [...prev, newUser]);
  };

  const deleteUser = (userId: string) => {
    if (userId === currentUser.id) return; // Prevent self-delete
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const updateMeetingRoom = (meetingId: string, roomId: string) => {
    setMeetings(prev => prev.map(m => 
      m.id === meetingId ? { ...m, roomId: roomId, isLocked: true } : m
    ));
  };

  const generateSchedule = () => {
    const newSchedule = runMatchingAlgorithm(users, slots, rooms, availability, preferences, meetings);
    // Ensure all generated meetings have status confirmed by default
    const scheduleWithStatus = newSchedule.map(m => ({...m, status: 'confirmed' as const}));
    setMeetings(scheduleWithStatus);
  };

  const resetSchedule = () => {
    setMeetings([]);
    setRequests([]);
  };

  // --- Meeting Request Logic ---

  const createMeetingRequest = (investorId: string, issuerIds: string[], start: string, end: string) => {
    const newRequests: MeetingRequest[] = issuerIds.map(issuerId => ({
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      investorId,
      issuerId,
      start,
      end,
      status: 'pending',
      createdAt: Date.now()
    }));
    setRequests(prev => [...prev, ...newRequests]);
  };

  const updateRequestStatus = (requestId: string, status: RequestStatus) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
  };

  const updateRequestRoom = (requestId: string, roomId: string) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, roomId } : r));
  };

  // New function to handle cancellations
  const cancelMeeting = (id: string, type: 'ALGO' | 'P2P') => {
    if (type === 'ALGO') {
      setMeetings(prev => prev.map(m => 
        m.id === id ? { ...m, status: 'cancelled' } : m
      ));
    } else {
      setRequests(prev => prev.map(r => 
        r.id === id ? { ...r, status: 'cancelled' } : r
      ));
    }
  };

  const getPendingRequestsCount = (userId: string) => {
    return requests.filter(r => r.issuerId === userId && r.status === 'pending').length;
  };

  const getConfirmedMeetingsCount = (userId: string) => {
     // 1. Algo Matches: Locked, assigned room, and NOT cancelled
     const algoCount = meetings.filter(m => 
        (m.investorId === userId || m.issuerId === userId) && 
        m.isLocked && 
        m.roomId &&
        m.status !== 'cancelled'
     ).length;

     // 2. P2P Requests: Confirmed, assigned room, and NOT cancelled
     const p2pCount = requests.filter(r => 
        (r.investorId === userId || r.issuerId === userId) && 
        r.status === 'confirmed' && 
        r.roomId
     ).length;

     return algoCount + p2pCount;
  };

  return (
    <DataContext.Provider value={{
      currentUser,
      users,
      slots,
      rooms,
      availability,
      preferences,
      meetings,
      requests,
      setCurrentUser,
      toggleAvailability,
      addPreference,
      removePreference,
      reorderPreference,
      addRoom,
      deleteRoom,
      addUser,
      deleteUser,
      updateMeetingRoom,
      generateSchedule,
      resetSchedule,
      createMeetingRequest,
      updateRequestStatus,
      updateRequestRoom,
      cancelMeeting,
      getPendingRequestsCount,
      getConfirmedMeetingsCount
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};