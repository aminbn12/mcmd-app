import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { UserRole, MeetingRequest, Meeting } from '../types';
import { RotateCcw, Database, CheckCircle, AlertCircle, Users, MapPin, Calendar, Clock, Briefcase, Zap, Check, XCircle, Trash2 } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { users, slots, rooms, requests, meetings, generateSchedule, resetSchedule, updateRequestRoom, updateMeetingRoom, deleteRoom } = useData();
  const [isGenerating, setIsGenerating] = useState(false);

  // Stats
  const confirmedRequests = requests.filter(r => r.status === 'confirmed');
  const cancelledRequests = requests.filter(r => r.status === 'cancelled');
  const cancelledMeetings = meetings.filter(m => m.status === 'cancelled');
  const activeMeetings = meetings.filter(m => m.status !== 'cancelled');

  const investors = users.filter(u => u.role === UserRole.INVESTOR);
  const issuers = users.filter(u => u.role === UserRole.ISSUER);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      generateSchedule();
      setIsGenerating(false);
    }, 1500); 
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-end border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Console d'Administration</h2>
          <p className="text-slate-500">Pilotage global de l'événement.</p>
        </div>
        <div className="flex space-x-3">
           <button 
            onClick={resetSchedule}
            className="flex items-center px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RotateCcw size={18} className="mr-2" />
            Réinitialiser Tout
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
            <span>Participants</span>
            <Users size={16} />
          </div>
          <div className="text-2xl font-bold text-slate-900">{users.length - 1}</div>
          <div className="text-xs text-slate-400 mt-1">{investors.length} Inv. / {issuers.length} Emet.</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
            <span>Salles Dispo</span>
            <Database size={16} />
          </div>
          <div className="text-2xl font-bold text-slate-900">{rooms.length}</div>
          <div className="text-xs text-slate-400 mt-1">Salles de réunion</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
            <span>Demandes P2P</span>
            <AlertCircle size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-500">{confirmedRequests.length}</div>
          <div className="text-xs text-slate-400 mt-1">Validées par l'émetteur</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
            <span>Matching Algo</span>
            <Zap size={16} className="text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600">{activeMeetings.length}</div>
          <div className="text-xs text-slate-400 mt-1">Générés par l'IA</div>
        </div>
      </div>

      {/* ALGORITHM SECTION */}
      <div className="bg-indigo-900 rounded-xl p-6 text-white flex items-center justify-between shadow-lg">
         <div>
            <h3 className="text-xl font-bold flex items-center mb-1">
               <Zap className="mr-2 text-yellow-400" />
               Algorithme de Matching
            </h3>
            <p className="text-indigo-200 text-sm">Générez des propositions de RDV basées sur les disponibilités et les préférences.</p>
         </div>
         <button 
           onClick={handleGenerate}
           disabled={isGenerating}
           className="px-6 py-3 bg-white text-indigo-900 font-bold rounded-lg hover:bg-indigo-50 transition-all shadow-md disabled:opacity-70 flex items-center"
         >
           {isGenerating ? (
             <>
               <RotateCcw className="animate-spin mr-2" />
               Calcul en cours...
             </>
           ) : (
             <>
               Lancer le Matching
             </>
           )}
         </button>
      </div>

      {/* ALERT SECTION: CANCELLATIONS */}
      {(cancelledMeetings.length > 0 || cancelledRequests.length > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
           <h3 className="text-lg font-bold text-red-800 flex items-center mb-4">
              <XCircle className="mr-2" />
              Alertes & Annulations ({cancelledMeetings.length + cancelledRequests.length})
           </h3>
           <p className="text-red-600 text-sm mb-4">Ces rendez-vous ont été annulés par les participants. Les salles précédemment occupées sont désormais libres ou nécessitent une attention.</p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {[...cancelledMeetings, ...cancelledRequests].map((item: any) => {
                  const isAlgo = !item.status || item.type === 'ALGO' || (item as any).slotId; // Rough heuristic, usually separate lists are safer but simplifying for display
                  const inv = users.find(u => u.id === item.investorId);
                  const iss = users.find(u => u.id === item.issuerId);
                  const room = rooms.find(r => r.id === item.roomId);
                  
                  return (
                     <div key={item.id} className="bg-white p-3 rounded-lg border-l-4 border-red-500 shadow-sm">
                        <div className="flex justify-between items-start">
                           <div>
                              <div className="font-bold text-slate-800 text-sm">{inv?.company} vs {iss?.company}</div>
                              <div className="text-xs text-red-500 mt-1 font-semibold">Annulé par Investisseur</div>
                           </div>
                           {room && <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">{room.name}</span>}
                        </div>
                     </div>
                  );
               })}
           </div>
        </div>
      )}

      {/* MATCHING & REQUESTS BOXES */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
           <Briefcase className="text-slate-800" />
           <h3 className="text-xl font-bold text-slate-800">Gestion des Rendez-vous Actifs</h3>
        </div>

        {/* 1. SECTION: GENERATED MATCHES (ALGO) */}
        {activeMeetings.length > 0 && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
             <h4 className="font-bold text-indigo-800 mb-4 flex items-center">
                <Zap size={18} className="mr-2" />
                Propositions de Matching ({activeMeetings.length})
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeMeetings.map((meeting) => {
                   const inv = users.find(u => u.id === meeting.investorId);
                   const iss = users.find(u => u.id === meeting.issuerId);
                   const slot = slots.find(s => s.id === meeting.slotId);
                   const room = rooms.find(r => r.id === meeting.roomId);
                   
                   return (
                      <div key={meeting.id} className={`bg-white rounded-xl shadow-sm border-2 flex flex-col overflow-hidden transition-all ${meeting.isLocked ? 'border-emerald-400' : 'border-indigo-100 hover:border-indigo-300'}`}>
                         {/* Header */}
                         <div className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex justify-between items-center ${meeting.isLocked ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'}`}>
                            <span>Proposition Algo</span>
                            {meeting.isLocked && <span className="flex items-center"><CheckCircle size={12} className="mr-1"/> Validé</span>}
                         </div>

                         {/* Body */}
                         <div className="p-5 flex-1 space-y-3">
                            <div className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                               <Clock size={16} className="mr-2 text-slate-400" />
                               {slot?.label || 'Horaire Inconnu'}
                            </div>

                            <div className="flex justify-between items-start bg-slate-50 p-3 rounded-lg">
                               <div className="text-center w-1/2 border-r border-slate-200 pr-2 overflow-hidden">
                                  <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Investisseur</div>
                                  <div className="font-bold text-slate-800 text-sm truncate" title={inv?.company}>{inv?.company}</div>
                                  <div className="text-xs text-slate-500 truncate" title={inv?.name}>{inv?.name}</div>
                               </div>
                               <div className="text-center w-1/2 pl-2 overflow-hidden">
                                  <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Émetteur</div>
                                  <div className="font-bold text-slate-800 text-sm truncate" title={iss?.company}>{iss?.company}</div>
                                  <div className="text-xs text-slate-500 truncate" title={iss?.name}>{iss?.name}</div>
                               </div>
                            </div>
                         </div>

                         {/* Footer: Validation & Room */}
                         <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3">
                            <div>
                               <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Salle proposée</label>
                               <div className="relative">
                                  <MapPin size={14} className="absolute left-3 top-2.5 text-slate-400" />
                                  <select 
                                     value={meeting.roomId}
                                     onChange={(e) => updateMeetingRoom(meeting.id, e.target.value)}
                                     disabled={meeting.isLocked}
                                     className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 disabled:opacity-70 disabled:bg-slate-100"
                                  >
                                     {rooms.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                     ))}
                                  </select>
                               </div>
                            </div>
                            
                            {!meeting.isLocked ? (
                               <button 
                                 onClick={() => updateMeetingRoom(meeting.id, meeting.roomId)} // Triggers lock in Context
                                 className="w-full py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm hover:bg-indigo-700 flex justify-center items-center shadow-md"
                               >
                                 <Check size={16} className="mr-2" />
                                 Accorder le Matching
                               </button>
                            ) : (
                               <div className="w-full py-2 bg-emerald-100 text-emerald-700 font-bold rounded-lg text-sm flex justify-center items-center">
                                  Verrouillé
                               </div>
                            )}
                         </div>
                      </div>
                   );
                })}
             </div>
          </div>
        )}

        {/* 2. SECTION: P2P REQUESTS (CONFIRMED) */}
        {confirmedRequests.length > 0 && (
           <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
             <h4 className="font-bold text-amber-700 mb-4 flex items-center">
                <Users size={18} className="mr-2" />
                Demandes Directes (P2P) Confirmées ({confirmedRequests.length})
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {confirmedRequests.map((req) => {
                 const inv = users.find(u => u.id === req.investorId);
                 const iss = users.find(u => u.id === req.issuerId);
                 const startDate = new Date(req.start);
                 const isRoomSelected = !!req.roomId;

                 return (
                   <div key={req.id} className={`bg-white rounded-xl shadow-sm border-2 flex flex-col overflow-hidden ${isRoomSelected ? 'border-emerald-400' : 'border-amber-200'}`}>
                      {/* Header */}
                      <div className="px-4 py-2 bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider flex justify-between items-center">
                         <span>Demande P2P</span>
                         <span className="bg-white px-2 py-0.5 rounded border border-amber-200 text-[10px]">Validée par Emet.</span>
                      </div>

                      {/* Body */}
                      <div className="p-5 flex-1 space-y-3">
                         <div className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                            <Clock size={16} className="mr-2 text-slate-400" />
                            {startDate.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {new Date(req.end).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                         </div>

                         <div className="flex justify-between items-start bg-slate-50 p-3 rounded-lg">
                            <div className="text-center w-1/2 border-r border-slate-200 pr-2 overflow-hidden">
                               <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Investisseur</div>
                               <div className="font-bold text-slate-800 text-sm truncate" title={inv?.company}>{inv?.company}</div>
                               <div className="text-xs text-slate-500 truncate" title={inv?.name}>{inv?.name}</div>
                            </div>
                            <div className="text-center w-1/2 pl-2 overflow-hidden">
                               <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Émetteur</div>
                               <div className="font-bold text-slate-800 text-sm truncate" title={iss?.company}>{iss?.company}</div>
                               <div className="text-xs text-slate-500 truncate" title={iss?.name}>{iss?.name}</div>
                            </div>
                         </div>
                      </div>

                      {/* Footer: Room Assignment */}
                      <div className="p-4 bg-slate-50 border-t border-slate-100">
                         <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Affecter une salle</label>
                         <div className="relative">
                            <MapPin size={14} className={`absolute left-3 top-2.5 ${req.roomId ? 'text-emerald-500' : 'text-slate-400'}`} />
                            <select 
                              value={req.roomId || ''}
                              onChange={(e) => updateRequestRoom(req.id, e.target.value)}
                              className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border focus:ring-2 focus:outline-none appearance-none cursor-pointer transition-colors ${
                                req.roomId 
                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 focus:ring-emerald-200' 
                                  : 'border-slate-300 bg-white text-slate-700 focus:ring-blue-200 focus:border-blue-400'
                              }`}
                            >
                              <option value="">-- Choisir une salle --</option>
                              {rooms.map(room => (
                                 <option key={room.id} value={room.id}>{room.name}</option>
                              ))}
                            </select>
                         </div>
                      </div>
                   </div>
                 );
               })}
             </div>
           </div>
        )}
        
        {activeMeetings.length === 0 && confirmedRequests.length === 0 && (
           <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500">Aucun rendez-vous ou demande en attente.</p>
              <p className="text-sm text-slate-400 mt-1">Lancez l'algorithme ou attendez des demandes P2P.</p>
           </div>
        )}
      </div>
    </div>
  );
};