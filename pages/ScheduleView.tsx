import React from 'react';
import { useData } from '../contexts/DataContext';
import { UserRole } from '../types';
import { Clock, MapPin, User as UserIcon, Briefcase } from 'lucide-react';

interface ScheduleViewProps {
  personalOnly?: boolean;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ personalOnly = false }) => {
  const { meetings, slots, users, rooms, currentUser } = useData();

  // Filter meetings based on view mode
  const displayedMeetings = personalOnly
    ? meetings.filter(m => m.investorId === currentUser.id || m.issuerId === currentUser.id)
    : meetings;

  const getSlotMeetings = (slotId: string) => displayedMeetings.filter(m => m.slotId === slotId);

  const getUserDetails = (id: string) => users.find(u => u.id === id);
  const getRoomDetails = (id: string) => rooms.find(r => r.id === id);

  if (meetings.length === 0) {
     return (
       <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">Aucun rendez-vous planifié.</p>
          {currentUser.role === UserRole.ADMIN && (
             <p className="text-xs text-blue-500 mt-2">Lancez le matching depuis le dashboard Admin.</p>
          )}
       </div>
     )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          {personalOnly ? 'Mon Planning' : 'Planning Global de l\'Événement'}
        </h2>
        {personalOnly && (
          <button onClick={() => window.print()} className="text-sm bg-slate-800 text-white px-3 py-2 rounded hover:bg-slate-700">
            Imprimer / PDF
          </button>
        )}
      </div>

      <div className="space-y-6">
        {slots.map(slot => {
           const slotMeetings = getSlotMeetings(slot.id);
           
           if (personalOnly && slotMeetings.length === 0) return null; // Hide empty slots for personal view

           return (
             <div key={slot.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
               <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center">
                  <Clock size={16} className="text-slate-500 mr-2" />
                  <span className="font-bold text-slate-700">{slot.label}</span>
               </div>
               
               <div className="divide-y divide-slate-100">
                 {slotMeetings.length === 0 ? (
                   <div className="p-4 text-sm text-slate-400 italic">Aucun rendez-vous sur ce créneau.</div>
                 ) : (
                   slotMeetings.map(meeting => {
                      const investor = getUserDetails(meeting.investorId);
                      const issuer = getUserDetails(meeting.issuerId);
                      const room = getRoomDetails(meeting.roomId);
                      
                      const isMeInvestor = currentUser.id === meeting.investorId;

                      return (
                        <div key={meeting.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 transition-colors">
                          {/* Participants */}
                          <div className="flex items-center space-x-6 mb-3 md:mb-0">
                             {/* Investor Side */}
                             <div className={`flex items-center space-x-3 ${isMeInvestor ? 'opacity-100' : 'opacity-75'}`}>
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">INV</div>
                                <div>
                                   <div className="font-semibold text-slate-900">{investor?.company}</div>
                                   <div className="text-xs text-slate-500">{investor?.name}</div>
                                </div>
                             </div>

                             <div className="text-slate-300 font-light px-2">vs</div>

                             {/* Issuer Side */}
                             <div className={`flex items-center space-x-3 ${!isMeInvestor && currentUser.role !== UserRole.ADMIN ? 'opacity-100' : 'opacity-75'}`}>
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">EM</div>
                                <div>
                                   <div className="font-semibold text-slate-900">{issuer?.company}</div>
                                   <div className="text-xs text-slate-500">{issuer?.name}</div>
                                </div>
                             </div>
                          </div>

                          {/* Location */}
                          <div className="flex items-center text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                            <MapPin size={14} className="mr-1" />
                            {room?.name}
                          </div>
                        </div>
                      );
                   })
                 )}
               </div>
             </div>
           );
        })}
      </div>
    </div>
  );
};