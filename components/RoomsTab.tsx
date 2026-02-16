'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BedDouble, Plus, Users, IndianRupee, Wrench, Snowflake, Fan, History, Clock, Printer, ArrowLeft, Pencil } from 'lucide-react';
import { Room, RoomBooking, RoomStatus, RoomType } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { RoomDetailView } from './RoomDetailView';
import { RoomMaintenanceView } from './RoomMaintenanceView';
import { RoomInvoice, BillingDetailsModal, InvoiceData, CustomerDetails } from './RoomInvoice';
import { RoomCard } from './RoomCard';

// --- Check-In Modal ---
const CheckInModal: React.FC<{
  room: Room;
  onConfirm: (data: { guestName: string; guestPhone: string; adults: number; children: number; isAC: boolean }) => void;
  onClose: () => void;
}> = ({ room, onConfirm, onClose }) => {
  const { t } = useLanguage();
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [isAC, setIsAC] = useState(true);

  const handleSubmit = () => {
    if (!guestName.trim()) return;
    onConfirm({ guestName: guestName.trim(), guestPhone: guestPhone.trim(), adults, children, isAC });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center animate-fade-in" onClick={onClose} style={{ bottom: '0' }}>
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-4 animate-slide-up max-h-[85dvh] overflow-y-auto mb-[72px] sm:mb-0" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-brown-dark">{t('roomCheckIn')} — {room.roomNumber}</h3>

        <div>
          <label className="text-xs font-semibold text-stone-500 mb-1 block">{t('guestName')}</label>
          <input
            value={guestName}
            onChange={e => setGuestName(e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-peach/50"
            placeholder={t('guestName')}
            autoFocus
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-stone-500 mb-1 block">{t('guestPhone')}</label>
          <input
            value={guestPhone}
            onChange={e => setGuestPhone(e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-peach/50"
            placeholder={t('guestPhone')}
            type="tel"
          />
        </div>

        {/* AC / Non-AC Toggle */}
        <div>
          <label className="text-xs font-semibold text-stone-500 mb-2 block">{t('acChoice')}</label>
          <div className="flex gap-2">
            <button
              onClick={() => setIsAC(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                isAC
                  ? 'bg-blue-50 border-blue-400 text-blue-600'
                  : 'bg-white border-stone-200 text-stone-400'
              }`}
            >
              <Snowflake size={16} />
              <div className="text-left">
                <span className="block">AC</span>
                <span className="text-[10px] font-semibold">₹{room.priceAC}/{t('night')}</span>
              </div>
            </button>
            <button
              onClick={() => setIsAC(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                !isAC
                  ? 'bg-amber-50 border-amber-400 text-amber-600'
                  : 'bg-white border-stone-200 text-stone-400'
              }`}
            >
              <Fan size={16} />
              <div className="text-left">
                <span className="block">Non-AC</span>
                <span className="text-[10px] font-semibold">₹{room.priceNonAC}/{t('night')}</span>
              </div>
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-semibold text-stone-500 mb-1 block">{t('adults')}</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 font-bold">−</button>
              <span className="text-lg font-bold w-8 text-center">{adults}</span>
              <button onClick={() => setAdults(Math.min(room.capacity, adults + 1))} className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 font-bold">+</button>
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-stone-500 mb-1 block">{t('children')}</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 font-bold">−</button>
              <span className="text-lg font-bold w-8 text-center">{children}</span>
              <button onClick={() => setChildren(children + 1)} className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 font-bold">+</button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2 pb-6 sm:pb-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold text-sm">
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!guestName.trim()}
            className="flex-1 py-2.5 rounded-xl bg-peach text-brown-dark font-bold text-sm disabled:opacity-40"
          >
            {t('roomCheckIn')}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main RoomsTab ---
export const RoomsTab: React.FC = () => {
  const { t } = useLanguage();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkInRoom, setCheckInRoom] = useState<Room | null>(null);
  const [filter, setFilter] = useState<'ALL' | RoomStatus>('ALL');
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [viewMode, setViewMode] = useState<'rooms' | 'history'>('rooms');
  const [historyBookings, setHistoryBookings] = useState<RoomBooking[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [showBillingForm, setShowBillingForm] = useState(false);
  const [pendingHistoryBooking, setPendingHistoryBooking] = useState<RoomBooking | null>(null);

  // Force body to not scroll when modal is open
  const [modalOpen, setModalOpen] = useState(false);
  useEffect(() => {
    if (!!selectedRoom || !!checkInRoom || !!invoiceData) {
      document.body.style.overflow = 'hidden';
      setModalOpen(true);
    } else {
      document.body.style.overflow = '';
      setModalOpen(false);
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedRoom, checkInRoom, invoiceData]);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch {
      console.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/rooms/history');
      const data = await res.json();
      setHistoryBookings(Array.isArray(data) ? data : []);
    } catch {
      console.error('Failed to fetch room history');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);
  useEffect(() => { if (viewMode === 'history') fetchHistory(); }, [viewMode, fetchHistory]);

  // Poll for updates every 10s
  useEffect(() => {
    const iv = setInterval(fetchRooms, 10000);
    return () => clearInterval(iv);
  }, [fetchRooms]);

  const handleRoomClick = (room: Room) => {
    if (room.status === RoomStatus.AVAILABLE) {
      setCheckInRoom(room);
    } else {
      setSelectedRoom(room);
    }
  };

  const handleCheckIn = async (data: { guestName: string; guestPhone: string; adults: number; children: number; isAC: boolean }) => {
    if (!checkInRoom) return;
    try {
      await fetch(`/api/rooms/${checkInRoom.id}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setCheckInRoom(null);
      fetchRooms();
    } catch {
      console.error('Check-in failed');
    }
  };

  const openHistoryInvoice = (booking: RoomBooking) => {
    const room = booking.room ?? rooms.find(r => r.id === booking.roomId);
    if (!room) return;
    // If billing data is already saved, show invoice directly
    if (booking.invoiceNo) {
      const details: CustomerDetails = {
        invoiceNo: booking.invoiceNo,
        gstEnabled: booking.gstEnabled ?? true,
        companyName: booking.companyName ?? undefined,
        companyAddressLine1: booking.companyAddressLine1 ?? undefined,
        companyAddressLine2: booking.companyAddressLine2 ?? undefined,
        customerGstin: booking.customerGstin ?? undefined,
      };
      setInvoiceData({ booking, room, invoiceNo: details.invoiceNo, customerDetails: details });
    } else {
      // No billing data saved yet — open billing form
      setPendingHistoryBooking(booking);
      setShowBillingForm(true);
    }
  };

  const editHistoryInvoice = (booking: RoomBooking) => {
    setPendingHistoryBooking(booking);
    setShowBillingForm(true);
  };

  const handleHistoryBillingSubmit = async (details: CustomerDetails) => {
    setShowBillingForm(false);
    if (!pendingHistoryBooking) return;
    const room = pendingHistoryBooking.room ?? rooms.find(r => r.id === pendingHistoryBooking.roomId);
    if (!room) return;

    // Save billing details to DB
    try {
      await fetch('/api/rooms/history', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: pendingHistoryBooking.id,
          invoiceNo: details.invoiceNo,
          gstEnabled: details.gstEnabled,
          companyName: details.companyName || null,
          companyAddressLine1: details.companyAddressLine1 || null,
          companyAddressLine2: details.companyAddressLine2 || null,
          customerGstin: details.customerGstin || null,
        }),
      });
      // Update the booking in local state
      setHistoryBookings(prev => prev.map(b =>
        b.id === pendingHistoryBooking.id
          ? { ...b, invoiceNo: details.invoiceNo, gstEnabled: details.gstEnabled, companyName: details.companyName, companyAddressLine1: details.companyAddressLine1, companyAddressLine2: details.companyAddressLine2, customerGstin: details.customerGstin }
          : b
      ));
    } catch {
      console.error('Failed to save billing details');
    }

    setInvoiceData({ booking: pendingHistoryBooking, room, invoiceNo: details.invoiceNo, customerDetails: details });
    setPendingHistoryBooking(null);
  };

  const filteredRooms = filter === 'ALL' ? rooms : rooms.filter(r => r.status === filter);

  const counts = {
    all: rooms.length,
    available: rooms.filter(r => r.status === RoomStatus.AVAILABLE).length,
    occupied: rooms.filter(r => r.status === RoomStatus.OCCUPIED).length,
  };

  // Group by floor
  const floors = [...new Set(filteredRooms.map(r => r.floor))].sort((a, b) => a - b);

  // Show maintenance screen
  if (showMaintenance) {
    return <RoomMaintenanceView onBack={() => setShowMaintenance(false)} />;
  }

  if (selectedRoom) {
    return (
      <RoomDetailView
        room={selectedRoom}
        onBack={() => { setSelectedRoom(null); fetchRooms(); }}
      />
    );
  }

  return (
    <div className="p-4 pb-24 min-h-screen bg-bg-light">
      {/* Header */}
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-2xl font-bold text-brown-dark">{t('rooms')}</h2>
        <button
          onClick={() => setShowMaintenance(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-semibold hover:bg-yellow-100 transition-colors"
        >
          <Wrench size={14} />
          {t('maintenance')}
        </button>
      </div>

      {/* Rooms / History Toggle */}
      <div className="flex mb-4 bg-stone-100 rounded-xl p-1">
        <button
          onClick={() => setViewMode('rooms')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'rooms' ? 'bg-brown text-white shadow-md' : 'text-stone-500 hover:bg-stone-50'}`}
        >
          <BedDouble size={16} />
          {t('rooms')}
        </button>
        <button
          onClick={() => setViewMode('history')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'history' ? 'bg-brown text-white shadow-md' : 'text-stone-500 hover:bg-stone-50'}`}
        >
          <History size={16} />
          {t('history')}
        </button>
      </div>

      {viewMode === 'rooms' ? (
        <>
          {/* Legend */}
          <div className="flex gap-3 mb-3 text-xs">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-peach-light border border-peach"></div> {t('roomOccupied')}</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full border-2 border-stone-300"></div> {t('roomAvailable')}</div>
          </div>

          {/* Stats Bar */}
          <div className="flex gap-2 mb-4">
            {[
              { key: 'ALL' as const, label: t('all'), count: counts.all },
              { key: RoomStatus.AVAILABLE, label: t('roomAvailable'), count: counts.available },
              { key: RoomStatus.OCCUPIED, label: t('roomOccupied'), count: counts.occupied },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                  filter === f.key
                    ? 'bg-peach text-brown-dark shadow-sm'
                    : 'bg-white text-stone-500 border border-stone-200'
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-stone-400">{t('loading')}</div>
          ) : rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-stone-400">
              <BedDouble size={48} className="mb-3 opacity-40" />
              <p className="text-sm">{t('noRooms')}</p>
            </div>
          ) : (
            floors.map(floor => (
              <div key={floor} className="mb-6">
                <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-3">
                  {floor === 0 ? t('groundFloor') : `${t('floor')} ${floor}`}
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {filteredRooms.filter(r => r.floor === floor).map(room => (
                    <RoomCard key={room.id} room={room} onClick={handleRoomClick} />
                  ))}
                </div>
              </div>
            ))
          )}
        </>
      ) : (
        /* ====== HISTORY VIEW ====== */
        <div>
          {historyLoading ? (
            <div className="flex items-center justify-center py-20 text-stone-400">{t('loading')}</div>
          ) : historyBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-stone-400">
              <History size={48} className="mb-3 opacity-40" />
              <p className="text-sm">{t('noRoomHistory')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyBookings.map(booking => {
                const checkIn = new Date(booking.checkIn);
                const checkOut = booking.checkOut ? new Date(booking.checkOut) : null;
                const nights = checkOut
                  ? Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))
                  : 1;
                const room = booking.room;
                const roomLabel = room ? `${room.roomNumber}` : `#${booking.roomId}`;

                return (
                  <div
                    key={booking.id}
                    onClick={() => openHistoryInvoice(booking)}
                    className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                          <BedDouble size={18} className="text-stone-500" />
                        </div>
                        <div>
                          <p className="font-bold text-brown-dark text-sm">{t('room')} {roomLabel}</p>
                          <p className="text-[10px] text-stone-400">{booking.guestName} · {booking.isAC ? 'AC' : 'Non-AC'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-brown-dark">₹{booking.totalAmount.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] text-stone-400">{nights} {nights === 1 ? t('night') : t('nights')}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-stone-400">
                      <div className="flex items-center gap-1">
                        <Clock size={10} />
                        <span>
                          {checkIn.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          {checkOut && ` → ${checkOut.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); editHistoryInvoice(booking); }}
                          className="flex items-center gap-1 text-stone-400 hover:text-blue-500 font-semibold transition-colors"
                        >
                          <Pencil size={10} />
                          <span>{t('editBill')}</span>
                        </button>
                        <div className="flex items-center gap-1 text-orange-500 font-semibold">
                          <Printer size={10} />
                          <span>{t('viewInvoice')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Check-In Modal */}
      {checkInRoom && (
        <CheckInModal
          room={checkInRoom}
          onConfirm={handleCheckIn}
          onClose={() => setCheckInRoom(null)}
        />
      )}

      {/* Billing Details Modal */}
      {showBillingForm && pendingHistoryBooking && (
        <BillingDetailsModal
          onSubmit={handleHistoryBillingSubmit}
          onClose={() => { setShowBillingForm(false); setPendingHistoryBooking(null); }}
          defaultValues={pendingHistoryBooking.invoiceNo ? {
            invoiceNo: pendingHistoryBooking.invoiceNo,
            gstEnabled: pendingHistoryBooking.gstEnabled ?? true,
            companyName: pendingHistoryBooking.companyName ?? undefined,
            companyAddressLine1: pendingHistoryBooking.companyAddressLine1 ?? undefined,
            companyAddressLine2: pendingHistoryBooking.companyAddressLine2 ?? undefined,
            customerGstin: pendingHistoryBooking.customerGstin ?? undefined,
          } : undefined}
        />
      )}

      {/* Invoice Modal */}
      {invoiceData && (
        <RoomInvoice
          data={invoiceData}
          onClose={() => setInvoiceData(null)}
        />
      )}
    </div>
  );
};
