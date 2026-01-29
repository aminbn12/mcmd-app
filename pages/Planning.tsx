import React, { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import multiMonthPlugin from '@fullcalendar/multimonth';
import { useData } from '../contexts/DataContext';
import { UserRole } from '../types';
import { EVENT_SETTINGS } from '../constants';
import { Check, Clock, User as UserIcon, Bell, Trash2, AlertCircle, CalendarPlus, Search } from 'lucide-react';

export const Planning: React.FC = () => {
  const { currentUser, users, createMeetingRequest, requests, updateRequestStatus, cancelMeeting } = useData();
  const calendarRef = useRef<FullCalendar>(null);

  // Modal State for Drag & Drop (Investors)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedIssuers, setSelectedIssuers] = useState<string[]>([]);
  
  // Modal State for Issuers/Investors (Viewing Details)
  const [viewEvent, setViewEvent] = useState<any | null>(null);

  // --- MANUAL PLANNING STATE ---
  const [manualDate, setManualDate] = useState('');
  const [manualTime, setManualTime] = useState('09:00');
  const [manualDuration, setManualDuration] = useState('30'); // minutes
  const [manualIssuerId, setManualIssuerId] = useState('');

  // Filter available issuers for selection
  const issuers = users.filter(u => u.role === UserRole.ISSUER);

  // --- MANUAL PLANNING HANDLER ---
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDate || !manualTime || !manualIssuerId) return;

    const start = new Date(`${manualDate}T${manualTime}`);
    const end = new Date(start.getTime() + parseInt(manualDuration) * 60000); // Add minutes

    createMeetingRequest(
        currentUser.id,
        [manualIssuerId],
        start.toISOString(),
        end.toISOString()
    );

    // Feedback visual
    alert(`Demande envoyée pour le ${start.toLocaleDateString()} à ${start.toLocaleTimeString()}`);
    
    // Reset form slightly but keep date for convenience
    setManualIssuerId('');
  };


  // --- CALENDAR INTERACTION LOGIC ---
  const handleDateSelect = (selectInfo: any) => {
    if (currentUser.role !== UserRole.INVESTOR) return;

    setSelectedRange({
      start: selectInfo.start,
      end: selectInfo.end,
    });
    setSelectedIssuers([]); // Reset selection
    setIsModalOpen(true);
    
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();
  };

  const handleConfirmRequest = () => {
    if (selectedRange && selectedIssuers.length > 0) {
      createMeetingRequest(
        currentUser.id,
        selectedIssuers,
        selectedRange.start.toISOString(),
        selectedRange.end.toISOString()
      );
      setIsModalOpen(false);
    }
  };

  const toggleIssuerSelection = (issuerId: string) => {
    setSelectedIssuers(prev => 
      prev.includes(issuerId) 
        ? prev.filter(id => id !== issuerId)
        : [...prev, issuerId]
    );
  };

  const handleCancelRequest = (e: React.MouseEvent) => {
      e.stopPropagation(); 
      const requestId = viewEvent?.extendedProps?.id || viewEvent?.id;

      if (requestId) {
          if (window.confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) {
            cancelMeeting(requestId, 'P2P');
            setViewEvent(null);
          }
      } else {
        alert("Erreur technique : ID du rendez-vous introuvable.");
      }
  };

  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    setViewEvent({
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        extendedProps: { ...event.extendedProps }
    });
  };

  const handleAcceptRequest = () => {
    const requestId = viewEvent?.extendedProps?.id || viewEvent?.id;
    if (requestId) {
      updateRequestStatus(requestId, 'confirmed');
      setViewEvent(null);
    }
  };

  const getEvents = () => {
    if (currentUser.role === UserRole.INVESTOR) {
      return requests
        .filter(r => r.investorId === currentUser.id && r.status !== 'cancelled')
        .map(r => {
          const issuer = users.find(u => u.id === r.issuerId);
          return {
            id: r.id,
            title: `RDV: ${issuer?.company || 'Inconnu'}`,
            start: r.start,
            end: r.end,
            backgroundColor: r.status === 'confirmed' ? '#10b981' : '#3b82f6',
            borderColor: r.status === 'confirmed' ? '#059669' : '#2563eb',
            textColor: '#ffffff',
            extendedProps: { 
                id: r.id,
                role: 'investor', 
                status: r.status,
                issuerName: issuer?.name, 
                issuerCompany: issuer?.company 
            }
          };
        });
    } else if (currentUser.role === UserRole.ISSUER) {
      return requests
        .filter(r => r.issuerId === currentUser.id && r.status !== 'cancelled')
        .map(r => {
          const investor = users.find(u => u.id === r.investorId);
          return {
            id: r.id,
            title: r.status === 'pending' ? `Prop: ${investor?.company}` : `RDV: ${investor?.company}`,
            start: r.start,
            end: r.end,
            backgroundColor: r.status === 'confirmed' ? '#10b981' : '#f59e0b',
            borderColor: r.status === 'confirmed' ? '#059669' : '#d97706',
            textColor: '#ffffff',
            extendedProps: { 
                id: r.id,
                role: 'issuer', 
                status: r.status,
                investorName: investor?.name, 
                investorCompany: investor?.company 
            }
          };
        });
    }
    return requests.filter(r => r.status !== 'cancelled').map(r => ({
       id: r.id,
       title: `${r.status === 'pending' ? '?' : 'OK'}`,
       start: r.start,
       end: r.end,
       backgroundColor: r.status === 'confirmed' ? '#10b981' : '#94a3b8'
    }));
  };

  const calendarStyles = `
    .fc-theme-standard .fc-scrollgrid { border: none; }
    .fc-col-header-cell { background-color: #f8fafc; padding: 12px 0; border: none !important; border-bottom: 1px solid #e2e8f0 !important; }
    .fc-col-header-cell-cushion { color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.05em; text-decoration: none !important; }
    .fc-timegrid-slot { height: 50px !important; border-bottom: 1px solid #f1f5f9 !important; }
    .fc-timegrid-slot-label-cushion { color: #64748b; font-size: 0.85rem; font-weight: 600; }
    .fc-event { border: none !important; border-radius: 6px !important; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 2px 4px; font-weight: 500; font-size: 0.85rem; }
  `;

  return (
    <div className="h-full flex flex-col gap-4">
      <style>{calendarStyles}</style>
      <div className="flex justify-between items-center mb-2">
         <div>
            <h2 className="text-2xl font-bold text-slate-900">
               {currentUser.role === UserRole.INVESTOR ? 'Planifier mes Rendez-vous' : 'Mon Agenda & Demandes'}
            </h2>
            <p className="text-sm text-slate-500">
               {currentUser.role === UserRole.INVESTOR 
                 ? 'Utilisez la barre rapide ci-dessous ou sélectionnez un créneau sur le calendrier.' 
                 : 'Consultez les demandes en orange et validez-les.'}
            </p>
         </div>
      </div>

      {/* --- MANUAL PLANNING BAR (INVESTOR ONLY) --- */}
      {currentUser.role === UserRole.INVESTOR && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-4 animate-in slide-in-from-top-2">
           <div className="flex items-center text-indigo-600 font-bold text-sm uppercase tracking-wide min-w-fit">
              <CalendarPlus size={20} className="mr-2" />
              Planification Rapide
           </div>
           
           <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

           <form onSubmit={handleManualSubmit} className="flex-1 w-full grid grid-cols-1 md:grid-cols-5 gap-3">
              {/* Date */}
              <div className="relative">
                 <label className="text-[10px] uppercase font-bold text-slate-400 absolute left-2 top-1">Date</label>
                 <input 
                   type="date" 
                   required
                   className="w-full pt-5 pb-1 px-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                   value={manualDate}
                   onChange={(e) => setManualDate(e.target.value)}
                 />
              </div>

              {/* Time */}
              <div className="relative">
                 <label className="text-[10px] uppercase font-bold text-slate-400 absolute left-2 top-1">Heure Début</label>
                 <input 
                   type="time" 
                   required
                   className="w-full pt-5 pb-1 px-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                   value={manualTime}
                   onChange={(e) => setManualTime(e.target.value)}
                   min="08:00" max="20:00"
                 />
              </div>

              {/* Duration */}
              <div className="relative">
                 <label className="text-[10px] uppercase font-bold text-slate-400 absolute left-2 top-1">Durée</label>
                 <select 
                   className="w-full pt-5 pb-1 px-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                   value={manualDuration}
                   onChange={(e) => setManualDuration(e.target.value)}
                 >
                    <option value="20">20 min</option>
                    <option value="30">30 min</option>
                    <option value="60">1 heure</option>
                 </select>
                 <Clock size={14} className="absolute right-2 top-4 text-slate-400 pointer-events-none" />
              </div>

              {/* Issuer Select */}
              <div className="relative md:col-span-1">
                 <label className="text-[10px] uppercase font-bold text-slate-400 absolute left-2 top-1">Avec qui ?</label>
                 <select 
                   required
                   className="w-full pt-5 pb-1 px-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                   value={manualIssuerId}
                   onChange={(e) => setManualIssuerId(e.target.value)}
                 >
                    <option value="">-- Choisir --</option>
                    {issuers.map(iss => (
                       <option key={iss.id} value={iss.id}>{iss.company}</option>
                    ))}
                 </select>
                 <Search size={14} className="absolute right-2 top-4 text-slate-400 pointer-events-none" />
              </div>

              {/* Submit */}
              <button 
                type="submit" 
                className="bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center shadow-sm"
              >
                 <Check size={18} className="mr-2" />
                 Proposer
              </button>
           </form>
        </div>
      )}

      {/* Main Calendar Area */}
      <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, multiMonthPlugin]}
          initialView="timeGridWeek" // Default to Week
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'multiMonthYear,dayGridMonth,timeGridWeek,timeGridDay' // Added Year View
          }}
          locale="fr"
          slotMinTime={EVENT_SETTINGS.minTime}
          slotMaxTime={EVENT_SETTINGS.maxTime}
          slotDuration={EVENT_SETTINGS.slotDuration}
          slotLabelInterval={EVENT_SETTINGS.slotDuration}
          allDaySlot={false}
          selectable={currentUser.role === UserRole.INVESTOR}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          nowIndicator={true}
          events={getEvents()}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="100%"
          buttonText={{
            today: "Aujourd'hui",
            year: 'Année',
            month: 'Mois',
            week: 'Semaine',
            day: 'Jour'
          }}
          expandRows={true}
        />
      </div>

      {/* DRAG AND DROP MODAL (Existing) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">Nouvelle demande (Sélection Calendrier)</h3>
              <div className="text-sm text-slate-500 mt-1 flex items-center">
                 <Clock size={14} className="mr-1" />
                 {selectedRange?.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {selectedRange?.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                 <span className="mx-2">•</span>
                 {selectedRange?.start.toLocaleDateString()}
              </div>
            </div>
            
            <div className="p-5 overflow-y-auto">
               <label className="block text-sm font-medium text-slate-700 mb-3">Sélectionnez les émetteurs à rencontrer :</label>
               <div className="space-y-2">
                 {issuers.map(issuer => (
                   <div 
                     key={issuer.id} 
                     onClick={() => toggleIssuerSelection(issuer.id)}
                     className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${selectedIssuers.includes(issuer.id) ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}
                   >
                     <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 ${selectedIssuers.includes(issuer.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                        {selectedIssuers.includes(issuer.id) && <Check size={14} />}
                     </div>
                     <div className="flex-1">
                        <div className="font-semibold text-slate-900">{issuer.company}</div>
                        <div className="text-xs text-slate-500">{issuer.name}</div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end space-x-3 bg-slate-50">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleConfirmRequest}
                disabled={selectedIssuers.length === 0}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                Envoyer ({selectedIssuers.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {viewEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
             {/* Header */}
             <div className={`p-6 text-white ${viewEvent.extendedProps.status === 'confirmed' ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-xl">
                      {viewEvent.extendedProps.status === 'confirmed' ? 'Rendez-vous Confirmé' : 
                       (currentUser.role === UserRole.ISSUER ? 'Demande Reçue' : 'Demande Envoyée')}
                    </h3>
                    <p className="opacity-90 text-sm mt-1">
                      {currentUser.role === UserRole.INVESTOR ? 'Mon RDV' : 'Proposition'}
                    </p>
                  </div>
                  {viewEvent.extendedProps.status === 'pending' && <Bell className="animate-pulse" />}
                  {viewEvent.extendedProps.status === 'confirmed' && <Check />}
                </div>
             </div>
             
             {/* Content */}
             <div className="p-6 space-y-4">
                <div className="flex items-center text-slate-700">
                   <Clock className="w-5 h-5 mr-3 text-slate-400" />
                   <div>
                      <div className="font-semibold">Horaire</div>
                      <div className="text-sm text-slate-500">
                        {viewEvent.start.toLocaleDateString()} <br/>
                        {viewEvent.start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {viewEvent.end.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                      </div>
                   </div>
                </div>

                <div className="flex items-center text-slate-700">
                   <UserIcon className="w-5 h-5 mr-3 text-slate-400" />
                   <div>
                      <div className="font-semibold">
                         {currentUser.role === UserRole.INVESTOR ? 'Émetteur (Interlocuteur)' : 'Investisseur'}
                      </div>
                      <div className="text-sm text-slate-500">
                         {currentUser.role === UserRole.INVESTOR 
                            ? <span className="flex flex-col">
                                <span className="font-bold text-slate-800">{viewEvent.extendedProps.issuerCompany}</span>
                                <span>{viewEvent.extendedProps.issuerName}</span>
                              </span>
                            : <span className="flex flex-col">
                                <span className="font-bold text-slate-800">{viewEvent.extendedProps.investorCompany}</span>
                                <span>{viewEvent.extendedProps.investorName}</span>
                              </span>
                         }
                      </div>
                   </div>
                </div>

                {viewEvent.extendedProps.status === 'pending' && (
                  <div className="flex items-start p-3 bg-amber-50 text-amber-700 rounded-lg text-xs mt-2">
                    <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                    {currentUser.role === UserRole.INVESTOR 
                      ? "En attente de validation par l'émetteur."
                      : "Vous n'avez pas encore validé ce créneau."
                    }
                  </div>
                )}
             </div>

             {/* Footer Actions */}
             <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
                {currentUser.role === UserRole.INVESTOR ? (
                   <button 
                     onClick={handleCancelRequest}
                     className="text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-colors border border-red-200"
                   >
                     <Trash2 size={16} className="mr-2" />
                     Annuler le RDV
                   </button>
                ) : (
                   <div></div>
                )}

                <div className="flex space-x-3">
                  <button 
                    onClick={() => setViewEvent(null)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-medium text-sm"
                  >
                    Fermer
                  </button>
                  
                  {currentUser.role === UserRole.ISSUER && viewEvent.extendedProps.status === 'pending' && (
                    <button 
                      onClick={handleAcceptRequest}
                      className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 shadow-md flex items-center text-sm"
                    >
                      <Check size={16} className="mr-2" />
                      Accepter
                    </button>
                  )}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};