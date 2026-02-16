'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, BedDouble, Phone, Users, IndianRupee, Plus,
  UtensilsCrossed, Droplets, Clock, LogOut, Package, Snowflake, Fan
} from 'lucide-react';
import { Room, RoomBooking, RoomServiceItem, RoomItemCategory, RoomStatus } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { RoomInvoice, BillingDetailsModal, InvoiceData, CustomerDetails } from './RoomInvoice';

// --- Quick amenity presets ---
const AMENITY_PRESETS = [
  { name: 'Water Bottle', nameHi: 'पानी की बोतल', price: 20, category: 'AMENITY' as const },
  { name: 'Towel', nameHi: 'तौलिया', price: 0, category: 'AMENITY' as const },
  { name: 'Extra Pillow', nameHi: 'अतिरिक्त तकिया', price: 0, category: 'AMENITY' as const },
  { name: 'Extra Blanket', nameHi: 'अतिरिक्त कंबल', price: 0, category: 'AMENITY' as const },
  { name: 'Toiletry Kit', nameHi: 'टॉयलेट्री किट', price: 50, category: 'AMENITY' as const },
  { name: 'Mineral Water (1L)', nameHi: 'मिनरल वॉटर (1L)', price: 40, category: 'AMENITY' as const },
];

// --- Add Item Modal ---
const AddItemModal: React.FC<{
  roomId: number;
  onAdded: () => void;
  onClose: () => void;
}> = ({ roomId, onAdded, onClose }) => {
  const { t, language } = useLanguage();
  const [tab, setTab] = useState<'FOOD' | 'AMENITY'>('AMENITY');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`/api/rooms/${roomId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category: tab,
          price: parseFloat(price) || 0,
          quantity,
        }),
      });
      onAdded();
      onClose();
    } catch {
      console.error('Failed to add item');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreset = (preset: typeof AMENITY_PRESETS[0]) => {
    setName(language === 'hi' ? preset.nameHi : preset.name);
    setPrice(String(preset.price));
    setTab(preset.category);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-4 animate-slide-up max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-brown-dark">{t('addRoomItem')}</h3>

        {/* Category Tabs */}
        <div className="flex gap-2">
          {(['AMENITY', 'FOOD'] as const).map(c => (
            <button
              key={c}
              onClick={() => setTab(c)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === c ? 'bg-peach text-brown-dark' : 'bg-stone-50 text-stone-500 border border-stone-200'
              }`}
            >
              {c === 'AMENITY' ? t('amenities') : t('roomFood')}
            </button>
          ))}
        </div>

        {/* Quick Presets for Amenities */}
        {tab === 'AMENITY' && (
          <div className="flex flex-wrap gap-2">
            {AMENITY_PRESETS.map(p => (
              <button
                key={p.name}
                onClick={() => handlePreset(p)}
                className="px-3 py-1.5 rounded-full bg-stone-50 border border-stone-200 text-xs font-medium text-stone-600 hover:bg-peach-light hover:border-peach transition-all"
              >
                {language === 'hi' ? p.nameHi : p.name}
                {p.price > 0 && <span className="ml-1 text-stone-400">₹{p.price}</span>}
              </button>
            ))}
          </div>
        )}

        {/* Form */}
        <div>
          <label className="text-xs font-semibold text-stone-500 mb-1 block">{t('itemName')}</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-peach/50"
            placeholder={tab === 'FOOD' ? t('roomFoodPlaceholder') : t('amenityPlaceholder')}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-semibold text-stone-500 mb-1 block">{t('price')} (₹)</label>
            <input
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-peach/50"
              placeholder="0"
              type="number"
              min="0"
            />
          </div>
          <div className="w-28">
            <label className="text-xs font-semibold text-stone-500 mb-1 block">{t('qty')}</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 font-bold">−</button>
              <span className="text-lg font-bold w-6 text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 font-bold">+</button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold text-sm">
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || submitting}
            className="flex-1 py-2.5 rounded-xl bg-peach text-brown-dark font-bold text-sm disabled:opacity-40"
          >
            {submitting ? t('loading') : t('addItem')}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Detail View ---
export const RoomDetailView: React.FC<{ 
  room: Room; 
  onBack: () => void;
  onUpdate?: () => void;
  onCheckout?: () => void;
}> = ({ room: initialRoom, onBack, onUpdate, onCheckout }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [room, setRoom] = useState<Room>(initialRoom);
  const [booking, setBooking] = useState<RoomBooking | null>(initialRoom.currentBooking ?? null);
  const [items, setItems] = useState<RoomServiceItem[]>(initialRoom.currentBooking?.items ?? []);
  const [showAddItem, setShowAddItem] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [showBillingForm, setShowBillingForm] = useState(false);

  const fetchRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${room.id}`);
      const data = await res.json();
      setRoom(data);
      const activeBooking = data.bookings?.find((b: RoomBooking) => b.status === 'CHECKED_IN' || b.status === 'BOOKED');
      setBooking(activeBooking ?? null);
      setItems(activeBooking?.items ?? []);
    } catch {
      console.error('Failed to refresh room');
    }
  }, [room.id]);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${room.id}/items`);
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      console.error('Failed to fetch items');
    }
  }, [room.id]);

  const handleCheckout = async (customerDetails?: CustomerDetails) => {
    if (!booking) return;
    setCheckingOut(true);
    try {
      const res = await fetch(`/api/rooms/${room.id}/bookings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          action: 'checkout',
          // Send billing details to be saved in DB
          invoiceNo: customerDetails?.invoiceNo,
          gstEnabled: customerDetails?.gstEnabled,
          companyName: customerDetails?.companyName,
          companyAddressLine1: customerDetails?.companyAddressLine1,
          companyAddressLine2: customerDetails?.companyAddressLine2,
          customerGstin: customerDetails?.customerGstin,
        }),
      });
      const checkedOutBooking = await res.json();
      showToast(t('checkoutSuccess'), 'success');
      if (onCheckout) onCheckout();
      // Show invoice after checkout
      setInvoiceData({
        booking: { ...checkedOutBooking, items },
        room,
        invoiceNo: customerDetails?.invoiceNo ?? checkedOutBooking.id,
        customerDetails,
      });
    } catch {
      showToast(t('checkoutFailed'), 'error');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleCheckoutClick = () => {
    if (!booking) return;
    setShowBillingForm(true);
  };

  const handleBillingSubmit = (details: CustomerDetails) => {
    setShowBillingForm(false);
    handleCheckout(details);
  };

  // Calculate revenue
  const foodItems = items.filter(i => i.category === 'FOOD');
  const amenityItems = items.filter(i => i.category === 'AMENITY');
  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Calculate nights
  const nights = booking
    ? Math.max(1, Math.ceil((Date.now() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const basePricePerNight = booking?.pricePerNightSelling ?? (booking?.isAC ? room.priceAC : room.priceNonAC);
  const extraChargePerNight = booking?.extraBeddingIncluded ? 0 : (booking?.extraBeddingChargePerNight ?? 0);
  const pricePerNight = basePricePerNight + extraChargePerNight;
  const roomCharge = pricePerNight * nights;
  const grandTotal = roomCharge + itemsTotal;

  // Time since check-in
  const duration = booking
    ? (() => {
        const diff = Date.now() - new Date(booking.checkIn).getTime();
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
      })()
    : '';

  return (
    <div className="min-h-screen bg-bg-light pb-24">
      {/* Top Bar */}
      <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-stone-100 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-stone-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-brown-dark flex items-center gap-2">
            <BedDouble size={18} /> {t('room')} {room.roomNumber}
            {booking?.isAC ? (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-500 text-[10px] font-bold"><Snowflake size={10} /> AC</span>
            ) : booking ? (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-stone-50 text-stone-400 text-[10px] font-bold"><Fan size={10} /> Non-AC</span>
            ) : null}
          </h2>
          {booking && (
            <p className="text-xs text-stone-400">{booking.guestName} · {duration}</p>
          )}
        </div>
        {booking && (
          <div className="text-right">
            <span className="text-xs text-stone-400">{t('total')}</span>
            <p className="text-lg font-bold text-brown-dark flex items-center gap-0.5">
              <IndianRupee size={14} />
              {grandTotal.toLocaleString('en-IN')}
            </p>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Guest Info Card */}
        {booking && (
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider">{t('guestInfo')}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-stone-400" />
                <span className="text-sm font-medium">{booking.guestName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-stone-400" />
                <span className="text-sm">{booking.guestPhone || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={14} className="text-stone-400" />
                <span className="text-sm">{booking.adults} {t('adults')}, {booking.children} {t('children')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={14} className="text-stone-400" />
                <span className="text-sm">{t('extraGuests')}: {booking.extraGuests ?? 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-stone-400" />
                <span className="text-sm">{new Date(booking.checkIn).toLocaleDateString()} · {duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <IndianRupee size={14} className="text-stone-400" />
                <span className="text-sm">{t('roomPriceMrp')}: ₹{(booking.pricePerNightMrp ?? (booking.isAC ? room.priceAC : room.priceNonAC)).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center gap-2">
                <IndianRupee size={14} className="text-stone-400" />
                <span className="text-sm">{t('roomPriceSelling')}: ₹{(booking.pricePerNightSelling ?? (booking.isAC ? room.priceAC : room.priceNonAC)).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center gap-2">
                <IndianRupee size={14} className="text-stone-400" />
                <span className="text-sm">
                  {t('extraBedding')}: {booking.extraBeddingIncluded ? t('included') : `₹${(booking.extraBeddingChargePerNight ?? 0).toLocaleString('en-IN')}/${t('night')}`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Summary Card */}
        {booking && (
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
            <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-3">{t('revenueSummary')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">{t('roomCharge')} ({nights} {nights === 1 ? t('night') : t('nights')})</span>
                <span className="font-semibold">₹{roomCharge.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">{t('roomFood')} ({foodItems.length})</span>
                <span className="font-semibold">₹{foodItems.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">{t('amenities')} ({amenityItems.length})</span>
                <span className="font-semibold">₹{amenityItems.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-stone-100 pt-2 flex justify-between font-bold text-base">
                <span>{t('grandTotal')}</span>
                <span className="text-peach-dark">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Items Served */}
        {booking && (
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider">{t('itemsServed')}</h3>
              <button
                onClick={() => setShowAddItem(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-peach/20 text-peach-dark text-xs font-semibold hover:bg-peach/30 transition-colors"
              >
                <Plus size={14} /> {t('addItem')}
              </button>
            </div>

            {items.length === 0 ? (
              <p className="text-center text-stone-400 text-sm py-6">{t('noItemsYet')}</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 py-2 border-b border-stone-50 last:border-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.category === 'FOOD' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'
                    }`}>
                      {item.category === 'FOOD' ? <UtensilsCrossed size={14} /> : <Package size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brown-dark truncate">{item.name}</p>
                      <p className="text-[10px] text-stone-400">
                        {item.category === 'FOOD' ? t('roomFood') : t('amenity')} · x{item.quantity}
                        {' · '}{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-brown-dark">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Checkout Button — no print until checked out */}
        {booking && (
          <div className="space-y-2">
            <button
              onClick={handleCheckoutClick}
              disabled={checkingOut}
              className="w-full py-3.5 rounded-2xl bg-green-600 text-white font-bold text-base flex items-center justify-center gap-2 shadow-md hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50"
            >
              <LogOut size={18} />
              {checkingOut ? t('loading') : t('roomCheckOut')} — ₹{grandTotal.toLocaleString('en-IN')}
            </button>
          </div>
        )}

        {/* Maintenance toggle for empty rooms without booking */}
        {!booking && room.status !== RoomStatus.OCCUPIED && (
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-center">
            <BedDouble size={32} className="mx-auto text-stone-400 mb-2" />
            <p className="text-sm text-stone-500 font-medium">{t('roomAvailable')}</p>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddItem && (
        <AddItemModal
          roomId={room.id}
          onAdded={fetchItems}
          onClose={() => setShowAddItem(false)}
        />
      )}

      {/* Billing Details Modal */}
      {showBillingForm && (
        <BillingDetailsModal
          onSubmit={handleBillingSubmit}
          onClose={() => setShowBillingForm(false)}
        />
      )}

      {/* Invoice Modal */}
      {invoiceData && (
        <RoomInvoice
          data={invoiceData}
          onClose={() => {
            setInvoiceData(null);
            // If checkout was completed (booking status changed), go back
            if (invoiceData.booking.status === 'CHECKED_OUT') {
              onBack();
            }
          }}
        />
      )}
    </div>
  );
};
