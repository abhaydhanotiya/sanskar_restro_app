import React from 'react';
import { BedDouble, Users, IndianRupee, Snowflake, Fan } from 'lucide-react';
import { Room, RoomStatus, RoomType } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

export const RoomCard: React.FC<{ room: Room; onClick: (room: Room) => void }> = ({ room, onClick }) => {
  const { t } = useLanguage();

  const statusConfig: Record<RoomStatus, { border: string; badgeBg: string; badgeText: string; label: string }> = {
    [RoomStatus.AVAILABLE]: { border: 'border-stone-200', badgeBg: 'bg-stone-100', badgeText: 'text-stone-500', label: t('roomAvailable') },
    [RoomStatus.OCCUPIED]: { border: 'border-peach', badgeBg: 'bg-peach', badgeText: 'text-brown-dark', label: t('roomOccupied') },
    [RoomStatus.CHECKOUT]: { border: 'border-green-500', badgeBg: 'bg-green-500', badgeText: 'text-white', label: t('roomCheckout') },
  };

  const typeLabel: Record<RoomType, string> = {
    [RoomType.DELUXE]: t('roomDeluxe'),
    [RoomType.PREMIUM_SUITE]: t('roomPremiumSuite'),
    [RoomType.ROYAL_SUITE]: t('roomRoyalSuite'),
  };

  const cfg = statusConfig[room.status as RoomStatus] ?? statusConfig[RoomStatus.AVAILABLE];
  const isOccupiedAC = room.currentBooking?.isAC;

  return (
    <div
      onClick={() => onClick(room)}
      className={`relative rounded-2xl p-4 flex flex-col justify-between aspect-square shadow-sm hover:shadow-lg active:scale-95 transition-all duration-300 cursor-pointer border-2 bg-white ${cfg.border}`}
    >
      {/* Status Badge */}
      <div className={`self-start px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${cfg.badgeBg} ${cfg.badgeText}`}>
        {cfg.label}
      </div>

      {/* AC Badge — show only if occupied */}
      {room.status === RoomStatus.OCCUPIED && room.currentBooking && (
        <div className="absolute top-1 right-1">
          {isOccupiedAC ? (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-500 text-[9px] font-bold">
              <Snowflake size={9} /> AC
            </span>
          ) : (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-stone-50 text-stone-400 text-[9px] font-bold">
              <Fan size={9} /> Non-AC
            </span>
          )}
        </div>
      )}

      {/* Room Number */}
      <div className="flex flex-col items-center justify-center flex-1">
        <BedDouble size={22} className="text-stone-400 mb-1" />
        <span className="text-2xl font-extrabold text-brown-dark tracking-tight">{room.roomNumber}</span>
        <span className="text-[10px] text-stone-400 font-medium">{typeLabel[room.type as RoomType]}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-1">
          <Users size={12} />
          <span>{room.capacity}</span>
        </div>
        {room.status === RoomStatus.OCCUPIED && room.currentBooking ? (
          <div className="flex items-center gap-0.5 font-semibold">
            <IndianRupee size={10} />
            <span>{isOccupiedAC ? room.priceAC : room.priceNonAC}</span>
          </div>
        ) : (
          <div className="flex flex-col items-end gap-0">
            <span className="flex items-center gap-0.5 text-[9px] text-blue-500 font-semibold">
              <Snowflake size={8} />₹{room.priceAC}
            </span>
            <span className="flex items-center gap-0.5 text-[9px] text-stone-400 font-semibold">
              <Fan size={8} />₹{room.priceNonAC}
            </span>
          </div>
        )}
      </div>

      {/* Guest name for occupied rooms */}
      {room.currentBooking && (
        <div className="absolute bottom-12 left-0 right-0 text-center">
          <span className="text-[10px] text-peach-dark font-semibold truncate block px-2">
            {room.currentBooking.guestName}
          </span>
        </div>
      )}
    </div>
  );
};
