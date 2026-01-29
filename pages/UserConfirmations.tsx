import React from 'react';
import { useData } from '../contexts/DataContext';
import { UserRole, Meeting } from '../types';
import { Clock, MapPin, Briefcase, CheckCircle, User as UserIcon, CalendarCheck, Zap, Users, Calendar, Bell, XCircle, AlertTriangle, Trash2 } from 'lucide-react';

export const UserConfirmations: React.FC = () => {
  const { meetings, requests, currentUser, users, slots, rooms, cancelMeeting } = useData();

  // 1. Get Algo Matches
  const algoMatches = meetings.filter(m => 
    (m.investorId === currentUser.id || m.issuerId === currentUser.id) &&
    m.isLocked && 
    m.roomId 
  ).map(m => ({ ...m, type: 'ALGO' as const, originalTime: null }));

  // 2. Get P2P Requests
  const p2pRequests = requests.filter(r => 
    (r.investorId === currentUser.id || r.issuerId === currentUser.id) &&
    (r.status === 'confirmed' || r.status === 'cancelled') && 
    r.roomId 
  ).map(r => {
    const startDate = new Date(r.start);
    const timeString = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const matchedSlot = slots.find(s => s.startTime === timeString);

    return {
      id: r.id,
      investorId: r.investorId,
      issuerId: r.issuerId,
      slotId: matchedSlot ? matchedSlot.id : 'custom',
      roomId: r.roomId!,
      isLocked: true,
      type: 'P2P' as const,
      status: r.status === 'cancelled' ? 'cancelled' : 'confirmed',
      originalTime: { start: r.start, end: r.end }
    };
  });

  // 3. Merge and Sort
  const allMeetings = [...algoMatches, ...p2pRequests].sort((a, b) => {
     const getStartTime = (item: any) => {
        if (item.originalTime) return item.originalTime.start;
        const slot = slots.find(s => s.id === item.slotId);
        return slot ? `2024-01-01T${slot.startTime}:00` : '9999';
     };
     return getStartTime(a).localeCompare(getStartTime(b));
  });

  const activeMeetings = allMeetings.filter(m => m.status !== 'cancelled');
  const cancelledMeetings = allMeetings.filter(m => m.status === 'cancelled');

  const handleCancel = (id: string, type: 'ALGO' | 'P2P') => {
      if (window.confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ? L'émetteur et l'administrateur seront notifiés.")) {
          cancelMeeting(id, type);
      }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center space-x-3 mb-6 border-b border-slate-200 pb-6">
        <div className="p-3 bg-emerald-100 rounded-lg text-emerald-700">
           <CalendarCheck size={28} />
        </div>
        <div>
           <h2 className="text-2xl font-bold text-slate-900">Mes Rendez-vous</h2>
           <p className="text-slate-500">Gérez vos rendez-vous confirmés et consultez les éventuelles annulations.</p>
        </div>
      </div>

      {/* NOTIFICATION BANNER: CONFIRMATIONS */}
      {activeMeetings.length > 0 && (
        <div className="bg-emerald-600 rounded-xl p-4 text-white shadow-lg flex items-start animate-in slide-in-from-top-4 duration-500">
          <div className="bg-white/20 p-2 rounded-lg mr-4">
             <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Planning à jour</h3>
            <p className="text-emerald-50 text-sm mt-1">
              Vous avez <span className="font-bold text-white underline">{activeMeetings.length} rendez-vous confirmés</span>.
            </p>
          </div>
        </div>
      )}

      {/* NOTIFICATION BANNER: CANCELLATIONS */}
      {cancelledMeetings.length > 0 && (
        <div className="bg-red-500 rounded-xl p-4 text-white shadow-lg flex items-start animate-in slide-in-from-top-4 duration-500">
          <div className="bg-white/20 p-2 rounded-lg mr-4">
             <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Annulation(s) détectée(s)</h3>
            <p className="text-red-50 text-sm mt-1">
              Attention, <span className="font-bold text-white underline">{cancelledMeetings.length} rendez-vous ont été annulés</span> récemment. 
              Veuillez vérifier la liste ci-dessous (marqués en rouge).
            </p>
          </div>
        </div>
      )}

      {allMeetings.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center">
           <CalendarCheck size={48} className="mx-auto text-slate-300 mb-4" />
           <h3 className="text-lg font-medium text-slate-700">Aucun rendez-vous pour le moment</h3>
           <p className="text-slate-500 mt-2">
             Les rendez-vous apparaissent ici une fois que la demande est validée et qu'une salle est attribuée.
           </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {allMeetings.map(meeting => {
             // Fetch Details
             const investor = users.find(u => u.id === meeting.investorId);
             const issuer = users.find(u => u.id === meeting.issuerId);
             
             const slot = slots.find(s => s.id === meeting.slotId);
             const room = rooms.find(r => r.id === meeting.roomId);
             const isCancelled = meeting.status === 'cancelled';

             // Format Time & Date
             let timeLabel = "Horaire Inconnu";
             let hourPrefix = "--";
             let dateLabel = "Date à définir";
             
             if (slot) {
                // Algo Slot
                timeLabel = slot.label;
                hourPrefix = slot.startTime.split(':')[0] + 'h';
                dateLabel = "Aujourd'hui"; 
             } else if (meeting.originalTime) {
                // P2P Request
                const start = new Date(meeting.originalTime.start);
                const end = new Date(meeting.originalTime.end);
                timeLabel = `${start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
                hourPrefix = start.getHours() + 'h';
                dateLabel = start.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
             }

             return (
               <div key={meeting.id} className={`bg-white rounded-xl shadow-sm border transition-all flex flex-col overflow-hidden group relative ${isCancelled ? 'border-red-200 bg-red-50/30' : 'border-slate-200 hover:border-emerald-400 hover:shadow-md'}`}>
                  
                  {isCancelled && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                          <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-2 rounded-full font-bold shadow-sm transform -rotate-12 flex items-center">
                              <XCircle className="mr-2" size={20} />
                              RDV ANNULÉ
                          </div>
                      </div>
                  )}

                  {/* Header Status */}
                  <div className={`px-5 py-3 text-xs font-bold uppercase tracking-wider flex justify-between items-center border-b ${isCancelled ? 'bg-red-50 text-red-800 border-red-100' : 'bg-emerald-50 text-emerald-800 border-emerald-100'}`}>
                     <span className="flex items-center">
                        {isCancelled ? <XCircle size={14} className="mr-2"/> : <CheckCircle size={14} className="mr-2"/>} 
                        {isCancelled ? 'Annulé' : 'Confirmé'}
                     </span>
                     {meeting.type === 'ALGO' ? (
                        <span className="flex items-center text-[10px] bg-white px-2 py-0.5 rounded border border-emerald-200 opacity-70" title="Généré par Algorithme">
                           <Zap size={10} className="mr-1"/> Auto
                        </span>
                     ) : (
                        <span className="flex items-center text-[10px] bg-white px-2 py-0.5 rounded border border-emerald-200 opacity-70" title="Demande Directe">
                           <Users size={10} className="mr-1"/> P2P
                        </span>
                     )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 space-y-5 opacity-90">
                     {/* Time & Date Section */}
                     <div className="flex items-center">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 font-bold text-lg shadow-sm ${isCancelled ? 'bg-red-100 text-red-500' : 'bg-indigo-50 text-indigo-600'}`}>
                           {hourPrefix}
                        </div>
                        <div>
                           <div className="flex items-center text-xs text-slate-500 font-bold uppercase mb-0.5">
                              <Calendar size={12} className="mr-1" />
                              <span className="capitalize">{dateLabel}</span>
                           </div>
                           <div className={`font-bold text-lg ${isCancelled ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{timeLabel}</div>
                        </div>
                     </div>

                     <div className="h-px bg-slate-100 w-full"></div>

                     {/* Participants Section */}
                     <div className="space-y-3">
                        {/* Investor Row */}
                        <div className={`flex items-start p-2 rounded-lg ${currentUser.id === investor?.id ? 'bg-blue-50 border border-blue-100' : ''}`}>
                            <div className="mt-1 mr-3 text-blue-600">
                                <Briefcase size={18} />
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Investisseur</div>
                                <div className="font-bold text-slate-900 truncate">{investor?.company || 'Non assigné'}</div>
                                <div className="text-xs text-slate-500 truncate">{investor?.name}</div>
                            </div>
                        </div>

                        {/* Issuer Row */}
                        <div className={`flex items-start p-2 rounded-lg ${currentUser.id === issuer?.id ? 'bg-emerald-50 border border-emerald-100' : ''}`}>
                            <div className="mt-1 mr-3 text-emerald-600">
                                <UserIcon size={18} />
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Émetteur</div>
                                <div className="font-bold text-slate-900 truncate">{issuer?.company || 'Non assigné'}</div>
                                <div className="text-xs text-slate-500 truncate">{issuer?.name}</div>
                            </div>
                        </div>
                     </div>
                  </div>

                  {/* Footer: Room & Action */}
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 mt-auto flex justify-between items-center">
                     <div className="flex items-center text-slate-700">
                        <MapPin size={18} className="mr-2 text-indigo-500" />
                        <span className={`font-medium ${isCancelled ? 'line-through text-slate-400' : ''}`}>{room?.name || 'Salle en attente'}</span>
                     </div>
                     
                     {/* Cancel Button - Only for Investor on Active Meetings */}
                     {currentUser.role === UserRole.INVESTOR && !isCancelled && (
                         <button 
                            onClick={() => handleCancel(meeting.id, meeting.type)}
                            className="flex items-center text-xs text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg border border-red-200 hover:border-red-600 transition-all font-bold z-20 shadow-sm"
                            title="Annuler ce rendez-vous"
                         >
                            <Trash2 size={14} className="mr-2" />
                            Annuler
                         </button>
                     )}
                  </div>
               </div>
             );
           })}
        </div>
      )}
    </div>
  );
};