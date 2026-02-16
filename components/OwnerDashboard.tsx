'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { LayoutDashboard, Users, History, TrendingUp, IndianRupee, ShoppingBag, LogOut, CalendarCheck, AlertCircle, Search, Filter, X, ChevronDown, FileText, Receipt, Calendar, RefreshCw, Monitor, Store, Power, BedDouble, UtensilsCrossed, Plus, Pencil, Trash2, Save, Check, ToggleLeft, ToggleRight, Hash, DoorOpen, Flame, Snowflake, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTables } from '@/contexts/TablesContext';
import { useOwnerData } from '@/hooks/useOwnerData';
import { useRoomHistory } from '@/hooks/useRoomHistory';
import { useToast } from '@/contexts/ToastContext';
import { OrderItem, OrderStatus, Transaction, Room, MenuItem } from '@/types';
import { RoomCard } from '@/components/RoomCard';
import { RoomInvoice, InvoiceData } from '@/components/RoomInvoice';
import { RoomDetailView } from '@/components/RoomDetailView';
import { apiClient } from '@/lib/api-client';

interface OwnerDashboardProps {
  userName: string;
  userId: number;
  onLogout: () => void;
  onSwitchToManagerView: () => void;
  isRestroOpen: boolean;
  restroOpenTime: Date | null;
  toggleRestro: (onBlocked?: () => void) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ userName, userId, onLogout, onSwitchToManagerView, isRestroOpen, restroOpenTime, toggleRestro }) => {
  const { t } = useLanguage();
  const { history } = useTables();
    const { staff, attendance, transactions, refreshData } = useOwnerData();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'staff' | 'history' | 'rooms' | 'menu'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- Rooms & Menu state for management tabs ---
  const [rooms, setRooms] = useState<Room[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);

  const loadRooms = useCallback(async () => {
    setLoadingRooms(true);
    try {
      const data = await apiClient.getRooms() as Room[];
      setRooms(data);
    } catch { showToast('Failed to load rooms', 'error'); }
    finally { setLoadingRooms(false); }
  }, [showToast]);

  const loadMenu = useCallback(async () => {
    setLoadingMenu(true);
    try {
      const data = await apiClient.getMenu() as MenuItem[];
      setMenuItems(data);
    } catch { showToast('Failed to load menu', 'error'); }
    finally { setLoadingMenu(false); }
  }, [showToast]);

  useEffect(() => {
    if (activeTab === 'rooms' && rooms.length === 0) loadRooms();
    if (activeTab === 'menu' && menuItems.length === 0) loadMenu();
  }, [activeTab]);

  const restroHoursOpen = restroOpenTime
    ? ((new Date().getTime() - restroOpenTime.getTime()) / (1000 * 60 * 60)).toFixed(1)
    : '0.0';

    const toDate = (value: string | Date | null | undefined) => {
        if (!value) return null;
        const date = value instanceof Date ? value : new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    };

    const isSameDay = (a: Date | null, b: Date) => {
        if (!a) return false;
        return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    };

    const formatTime = (value: string | Date | null | undefined) => {
        const date = toDate(value);
        return date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
    };

    const formatDateLabel = (value: string | Date | null | undefined) => {
        const date = toDate(value);
        if (!date) return '';
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        if (isSameDay(date, today)) return 'Today';
        if (isSameDay(date, yesterday)) return 'Yesterday';
        return date.toLocaleDateString();
    };

  // --- Calculations for Overview ---
    const transactionsToUse = transactions.length ? transactions : history;
    const totalSales = transactionsToUse.reduce((sum, txn) => sum + txn.totalAmount, 0);
    const totalOrders = transactionsToUse.length;
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    const chartData = (() => {
        const now = new Date();
        const hours = Array.from({ length: 7 }, (_, idx) => {
            const d = new Date(now);
            d.setHours(now.getHours() - (6 - idx), 0, 0, 0);
            return d;
        });

        const totals = new Map<number, number>();
        transactionsToUse.forEach(txn => {
            const txnDate = toDate(txn.timestamp);
            if (!txnDate || !isSameDay(txnDate, now)) return;
            const hourKey = txnDate.getHours();
            totals.set(hourKey, (totals.get(hourKey) ?? 0) + txn.totalAmount);
        });

        return hours.map(h => ({
            name: h.toLocaleTimeString([], { hour: 'numeric' }),
            sales: totals.get(h.getHours()) ?? 0,
        }));
    })();

  // --- Sub-components ---

  const OverviewTab = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Restaurant Status Card */}
      <div className={`p-4 rounded-2xl shadow-sm border flex items-center justify-between transition-all ${
        isRestroOpen 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${
            isRestroOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
          }`}>
            <Store size={24} />
          </div>
          <div>
            <h3 className={`font-bold text-lg ${
              isRestroOpen ? 'text-green-800' : 'text-red-700'
            }`}>
              {isRestroOpen ? t('restroOpen') : t('restroClosed')}
            </h3>
            {isRestroOpen && (
              <p className="text-green-600 text-xs font-medium">
                Open for {restroHoursOpen}h
                {restroOpenTime && ` • Since ${restroOpenTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => toggleRestro(() => showToast(t('restroCloseBlocked'), 'error'))}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm ${
            isRestroOpen 
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          <Power size={16} />
          {isRestroOpen ? t('restroClose') : t('openRestro')}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-between">
            <div>
                <p className="text-stone-500 text-sm font-medium">{t('totalSales')}</p>
                <h3 className="text-3xl font-bold text-brown-dark mt-1">₹{totalSales.toFixed(0)}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-xl text-green-700">
                <IndianRupee size={24} />
            </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-between">
            <div>
                <p className="text-stone-500 text-sm font-medium">{t('todayOrders')}</p>
                <h3 className="text-3xl font-bold text-brown-dark mt-1">{totalOrders}</h3>
            </div>
            <div className="bg-peach/20 p-3 rounded-xl text-peach-dark">
                <ShoppingBag size={24} />
            </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-between">
            <div>
                <p className="text-stone-500 text-sm font-medium">{t('avgOrderValue')}</p>
                <h3 className="text-3xl font-bold text-brown-dark mt-1">₹{avgOrderValue.toFixed(0)}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl text-blue-700">
                <TrendingUp size={24} />
            </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 h-80">
        <h4 className="font-bold text-brown-dark mb-6">Sales Trend (Today)</h4>
        <ResponsiveContainer width="100%" height="85%">
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a8a29e', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#a8a29e', fontSize: 12}} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="sales" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#5D4037" fillOpacity={0.8} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const StaffTab = () => {
    const [view, setView] = useState<'today' | 'log'>('today');
    const [filterStaff, setFilterStaff] = useState('All');
    const [filterTime, setFilterTime] = useState('All');

    const filteredLogs = attendance.filter(record => {
        const staffMatch = filterStaff === 'All' || record.staffId.toString() === filterStaff;
        const timeMatch = filterTime === 'All' || formatDateLabel(record.date) === filterTime;
        return staffMatch && timeMatch;
    });

    const dateOptions = Array.from(new Set(attendance.map(r => formatDateLabel(r.date)).filter(Boolean)));
const handleRefresh = async () => {
        setIsRefreshing(true);
        await refreshData();
        setTimeout(() => setIsRefreshing(false), 500);
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
                <div className="flex bg-white p-1 rounded-xl border border-stone-200 w-fit">
                    <button 
                      onClick={() => setView('today')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${view === 'today' ? 'bg-brown text-white' : 'text-stone-500 hover:bg-stone-50'}`}
                    >
                        {t('today')}
                    </button>
                    <button 
                      onClick={() => setView('log')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${view === 'log' ? 'bg-brown text-white' : 'text-stone-500 hover:bg-stone-50'}`}
                    >
                        {t('attendanceLog')}
                    </button>
                </div>
                <button 
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="p-2 bg-white rounded-xl border border-stone-200 hover:bg-stone-50 transition-all disabled:opacity-50"
                    title="Refresh attendance"
                >
                    <RefreshCw size={18} className={`text-brown ${isRefreshing ? 'animate-spin' : ''}`} />
                    {t('attendanceLog')}
                </button>
            </div>

            {view === 'today' ? (
                <div className="grid gap-4">
                    {staff.map(staffMember => {
                        const record = attendance.find(r => r.staffId === staffMember.id && isSameDay(toDate(r.date), new Date()));
                        
                        // Determine actual status based on check-in/check-out
                        let displayStatus = 'ABSENT';
                        if (record) {
                            if (record.checkOut) {
                                displayStatus = 'CHECKED_OUT';
                            } else if (record.checkIn) {
                                displayStatus = record.status; // PRESENT, LATE, etc.
                            }
                        }
                        
                        let statusColor = '';
                        let statusIcon = null;
                        let statusLabel = displayStatus;

                        switch(displayStatus) {
                            case 'PRESENT': 
                                statusColor = 'bg-green-100 text-green-700 border-green-200'; 
                                statusIcon = <CalendarCheck size={16} />;
                                break;
                            case 'LATE':
                                statusColor = 'bg-amber-100 text-amber-700 border-amber-200';
                                statusIcon = <AlertCircle size={16} />;
                                break;
                            case 'LEAVE':
                                statusColor = 'bg-blue-100 text-blue-700 border-blue-200';
                                break;
                            case 'CHECKED_OUT':
                                statusColor = 'bg-stone-100 text-stone-600 border-stone-200';
                                statusLabel = 'COMPLETED';
                                break;
                            default:
                                statusColor = 'bg-red-50 text-red-500 border-red-100';
                        }

                        return (
                            <div key={staffMember.id} className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-brown text-white flex items-center justify-center font-bold text-lg">
                                        {staffMember.avatar}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-brown-dark">{staffMember.name}</h4>
                                        <p className="text-xs text-stone-500">{staffMember.role}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusColor} mb-1`}>
                                        {statusIcon}
                                        {t(statusLabel.toLowerCase() as any)}
                                    </div>
                                    {record?.checkIn && (
                                        <div className="text-xs text-stone-400 font-mono space-y-0.5">
                                            <p>In: {formatTime(record.checkIn)}</p>
                                            {record.checkOut && (
                                                <p>Out: {formatTime(record.checkOut)}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="space-y-4 animate-fade-in">
                    {/* Filters for Log View */}
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <select 
                                value={filterStaff}
                                onChange={(e) => setFilterStaff(e.target.value)}
                                className="w-full appearance-none bg-white border border-stone-200 rounded-xl py-2.5 pl-4 pr-8 text-sm font-medium text-brown-dark focus:outline-none"
                            >
                                <option value="All">All Staff</option>
                                {staff.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500" />
                        </div>
                        <div className="relative flex-1">
                            <select 
                                value={filterTime}
                                onChange={(e) => setFilterTime(e.target.value)}
                                className="w-full appearance-none bg-white border border-stone-200 rounded-xl py-2.5 pl-4 pr-8 text-sm font-medium text-brown-dark focus:outline-none"
                            >
                                <option value="All">All Dates</option>
                                {dateOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-stone-50 text-stone-500 border-b border-stone-100">
                                <tr>
                                    <th className="p-4 font-semibold">{t('staff')}</th>
                                    <th className="p-4 font-semibold">Date</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-stone-400">
                                            No records found for selected filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((record, index) => {
                                        const staffMember = staff.find(s => s.id === record.staffId);
                                        if (!staffMember) return null;
                                        return (
                                            <tr key={index} className="hover:bg-stone-50">
                                                <td className="p-4 font-medium text-brown-dark flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-brown/10 text-brown text-xs flex items-center justify-center font-bold">
                                                        {staffMember.avatar}
                                                    </div>
                                                    {staffMember.name}
                                                </td>
                                                <td className="p-4 text-stone-500">{formatDateLabel(record.date)}</td>
                                                <td className="p-4">
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                                                        record.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                                                        record.status === 'LATE' ? 'bg-amber-100 text-amber-700' :
                                                        record.status === 'LEAVE' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-red-50 text-red-500'
                                                    }`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-stone-500 font-mono text-xs">
                                                    {record.checkIn ? `${formatTime(record.checkIn)}${record.checkOut ? ` - ${formatTime(record.checkOut)}` : ''}` : '-'}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
  };

  const HistoryTab = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('All');
    const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const filteredHistory = history.filter(txn => {
        const matchesSearch = 
            txn.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
            txn.items.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

        const txnDate = toDate(txn.timestamp);
        const matchesDate = filterDate === 'All' ||
            (filterDate === 'Today' && isSameDay(txnDate, today)) ||
            (filterDate === 'Yesterday' && isSameDay(txnDate, yesterday));

        return matchesSearch && matchesDate;
    });

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Filters */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"/>
                    <input 
                        type="text" 
                        placeholder={t('searchTxn')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-peach/50"
                    />
                </div>
                <div className="relative">
                    <select 
                        className="appearance-none bg-white border border-stone-200 rounded-xl py-2.5 pl-4 pr-8 text-sm font-medium text-brown-dark focus:outline-none"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    >
                        <option value="All">{t('allTime')}</option>
                        <option value="Today">{t('today')}</option>
                        <option value="Yesterday">{t('yesterday')}</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500" />
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {filteredHistory.length === 0 ? (
                    <div className="text-center py-20 text-stone-400 flex flex-col items-center">
                        <FileText size={40} className="mb-2 opacity-50" />
                        No transactions found matching your filters.
                    </div>
                ) : (
                    filteredHistory.map((txn) => (
                        <div 
                            key={txn.id} 
                            onClick={() => setSelectedTxn(txn)}
                            className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex justify-between items-center cursor-pointer hover:bg-stone-50 active:scale-[0.99] transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-lg ${txn.isTakeaway ? 'bg-peach/10 text-peach-dark' : 'bg-brown/10 text-brown'}`}>
                                    {txn.isTakeaway ? <ShoppingBag size={20} /> : <History size={20} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-brown-dark text-sm">
                                        {txn.isTakeaway ? 'Takeaway' : 'Table'} #{txn.tableId}
                                    </h4>
                                    <div className="text-xs text-stone-400 flex flex-col gap-0.5 mt-0.5">
                                        <span className="font-mono">{txn.id}</span>
                                        <span className="flex items-center gap-1"><Calendar size={10}/> {toDate(txn.timestamp)?.toLocaleString() ?? '-'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-brown text-lg">₹{txn.totalAmount.toFixed(2)}</div>
                                <div className="text-xs text-stone-400">{txn.items.length} items</div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Detail Modal */}
            {selectedTxn && (
                <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden animate-slide-up shadow-2xl flex flex-col max-h-[80vh]">
                    <div className="p-4 bg-brown text-white flex justify-between items-center shrink-0">
                        <div>
                            <h3 className="font-bold">{t('orderDetails')}</h3>
                            <p className="text-xs opacity-80">{selectedTxn.id}</p>
                        </div>
                        <button onClick={() => setSelectedTxn(null)}><X size={20}/></button>
                    </div>
                    <div className="p-4 overflow-y-auto flex-1 min-h-0">
                        <div className="space-y-3">
                            {selectedTxn.items.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-3 rounded-lg border bg-stone-50 border-stone-100">
                                <div className="flex items-center gap-3">
                                    <div className="font-bold text-brown-dark w-6 h-6 bg-white rounded flex items-center justify-center shadow-sm text-sm border border-stone-200">
                                        {item.quantity}
                                    </div>
                                    <div>
                                        <p className="font-medium text-stone-800">{item.name}</p>
                                        <p className="text-[10px] text-stone-400 uppercase tracking-wide">{item.status}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-brown">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                            ))}
                        </div>
                        <div className="mt-6 border-t border-dashed border-stone-300 pt-4 flex justify-between items-center">
                            <span className="font-bold text-lg text-stone-600">Total Paid</span>
                            <span className="font-black text-2xl text-brown-dark">₹{selectedTxn.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="p-4 border-t border-stone-100 shrink-0">
                        <button onClick={() => setSelectedTxn(null)} className="w-full py-3 bg-stone-100 text-stone-600 font-bold rounded-xl hover:bg-stone-200">
                            {t('close')}
                        </button>
                    </div>
                </div>
                </div>
            )}
        </div>
    );
  };

  // ==================== ROOMS MANAGEMENT TAB ====================
  const RoomsManageTab = () => {
    const [subTab, setSubTab] = useState<'overview' | 'manage' | 'history'>('overview');
    const { history: roomHistory, loading: historyLoading, loadHistory } = useRoomHistory();
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const [selectedOverviewRoom, setSelectedOverviewRoom] = useState<Room | null>(null);

    // Existing management state
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [showAddRoom, setShowAddRoom] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
      roomNumber: '', type: 'DELUXE' as string, floor: 1, capacity: 2, priceNonAC: 0, priceAC: 0,
    });

    useEffect(() => {
        if (subTab === 'history' && !historyLoaded) {
            loadHistory();
            setHistoryLoaded(true);
        }
    }, [subTab]);

    const startEdit = (room: Room) => {
      setEditingRoom(room);
      setForm({
        roomNumber: room.roomNumber,
        type: room.type,
        floor: room.floor,
        capacity: room.capacity,
        priceNonAC: room.priceNonAC,
        priceAC: room.priceAC,
      });
      setShowAddRoom(false);
    };

    const startAdd = () => {
      setEditingRoom(null);
      setForm({ roomNumber: '', type: 'DELUXE', floor: 1, capacity: 2, priceNonAC: 0, priceAC: 0 });
      setShowAddRoom(true);
    };

    const handleSave = async () => {
      if (!form.roomNumber || form.priceAC <= 0 || form.priceNonAC <= 0) return;
      setSaving(true);
      try {
        if (editingRoom) {
          const updated = await apiClient.updateRoom(editingRoom.id, form) as Room;
          setRooms(prev => prev.map(r => r.id === updated.id ? updated : r));
          showToast(t('saved'), 'success');
        } else {
          const created = await apiClient.createRoom(form) as Room;
          setRooms(prev => [...prev, created]);
          showToast(t('created'), 'success');
        }
        setEditingRoom(null);
        setShowAddRoom(false);
      } catch (err: any) {
        showToast(err.message || t('saveFailed'), 'error');
      } finally { setSaving(false); }
    };

    const handleDelete = async (room: Room) => {
      if (!confirm(t('confirmDelete'))) return;
      try {
        await apiClient.deleteRoom(room.id);
        setRooms(prev => prev.filter(r => r.id !== room.id));
        showToast(t('deleted'), 'success');
        if (editingRoom?.id === room.id) { setEditingRoom(null); setShowAddRoom(false); }
      } catch (err: any) {
        showToast(err.message || t('deleteFailed'), 'error');
      }
    };

    const floorGroups = rooms.reduce((acc, room) => {
      const f = room.floor;
      if (!acc[f]) acc[f] = [];
      acc[f].push(room);
      return acc;
    }, {} as Record<number, Room[]>);

    const isEditing = editingRoom !== null || showAddRoom;

    return (
      <div className="space-y-6 animate-fade-in pb-10">
        {/* Header & Sub-tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-bold text-lg text-brown-dark flex items-center gap-2">
              <BedDouble size={20} className="text-orange-600" />
              {t('manageRooms')}
            </h3>
            <div className="bg-stone-100 p-1 rounded-xl flex">
                <button 
                    onClick={() => setSubTab('overview')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${subTab === 'overview' ? 'bg-white shadow text-brown-dark' : 'text-stone-500 hover:text-stone-700'}`}
                >Overview</button>
                <button 
                    onClick={() => setSubTab('manage')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${subTab === 'manage' ? 'bg-white shadow text-brown-dark' : 'text-stone-500 hover:text-stone-700'}`}
                >Inventory</button>
                <button 
                    onClick={() => setSubTab('history')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${subTab === 'history' ? 'bg-white shadow text-brown-dark' : 'text-stone-500 hover:text-stone-700'}`}
                >History</button>
            </div>
        </div>

        {/* OVERVIEW TAB */}
        {subTab === 'overview' && (
            <>
                {loadingRooms ? (
                    <div className="text-center py-16 text-stone-400"><RefreshCw size={24} className="mx-auto animate-spin mb-2" />Loading overview...</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {rooms.map(room => (
                            <RoomCard key={room.id} room={room} onClick={setSelectedOverviewRoom} />
                        ))}
                        {rooms.length === 0 && <p className="col-span-full text-center text-stone-400 py-10">No rooms found.</p>}
                    </div>
                )}
                 {selectedOverviewRoom && (
                    <div className="fixed inset-0 z-[55] bg-bg-light overflow-y-auto">
                        <RoomDetailView
                            room={selectedOverviewRoom}
                            onBack={() => setSelectedOverviewRoom(null)}
                            onCheckout={() => {
                                loadRooms();
                                setHistoryLoaded(false);
                                setSelectedOverviewRoom(null);
                            }}
                        />
                    </div>
                )}
            </>
        )}

        {/* HISTORY TAB */}
        {subTab === 'history' && (
            historyLoading ? (
                <div className="text-center py-16 text-stone-400"><RefreshCw size={24} className="mx-auto animate-spin mb-2" />Loading history...</div>
            ) : roomHistory.length === 0 ? (
                <div className="text-center py-16 text-stone-400 flex flex-col items-center">
                    <History size={32} className="mb-2 opacity-50"/>
                    No booking history found
                </div>
            ) : (
                <div className="space-y-3">
                    {roomHistory.map(booking => {
                        const checkIn = new Date(booking.checkIn);
                        const nights = booking.checkOut ? Math.max(1, Math.ceil((new Date(booking.checkOut).getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))) : 1;
                        const room = booking.room;
                        // Actual received calculation
                        const baseSelling = booking.pricePerNightSelling ?? (booking.isAC ? (room?.priceAC ?? 0) : (room?.priceNonAC ?? 0));
                        const baseBill = booking.pricePerNightBill ?? baseSelling;
                        const extraCharge = booking.extraBeddingIncluded ? 0 : (booking.extraBeddingChargePerNight ?? 0);
                        const sellingPerNight = baseSelling + extraCharge;
                        const billPerNight = baseBill + extraCharge;
                        const roomSelling = sellingPerNight * nights;
                        const roomBill = billPerNight * nights;
                        const foodTotal = (booking.items ?? []).filter(i => i.category === 'FOOD').reduce((s, i) => s + i.price * i.quantity, 0);
                        const uplift = Math.max(0, roomBill - roomSelling);
                        const isGst = booking.gstEnabled !== false;
                        const gstOnUplift = isGst ? Math.round(uplift * 5) / 100 : 0;
                        const gstOnFood = isGst ? Math.round(foodTotal * 5) / 100 : 0;
                        const itemsTotal = (booking.items ?? []).reduce((s, i) => s + i.price * i.quantity, 0);
                        const actualReceived = roomSelling + itemsTotal + gstOnUplift + gstOnFood;
                        const hasBillDiff = baseBill !== baseSelling;
                        return (
                            <div key={booking.id} className="bg-white rounded-xl p-4 border border-stone-100 shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs">
                                            {booking.room ? booking.room.roomNumber : `#${booking.roomId}`}
                                        </div>
                                        <div>
                                            <p className="font-bold text-brown-dark text-sm">{booking.guestName}</p>
                                            <p className="text-[10px] text-stone-400">{booking.guestPhone || 'No phone'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-stone-400 font-medium">
                                        <span className="flex items-center gap-1"><Calendar size={10}/> {checkIn.toLocaleDateString()}</span>
                                        {booking.checkOut && <span>→ {new Date(booking.checkOut).toLocaleDateString()}</span>}
                                        <span className="bg-stone-50 px-1.5 py-0.5 rounded border border-stone-100">{nights} nights</span>
                                    </div>
                                </div>
                                <div className="text-right flex sm:flex-col justify-between items-end">
                                    <p className="font-bold text-lg text-brown-dark">₹{roomBill.toLocaleString('en-IN')}</p>
                                    {hasBillDiff && (
                                        <p className="text-[10px] font-semibold text-green-600">{t('youReceive')}: ₹{actualReceived.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                    )}
                                    <p className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full inline-block">
                                        {booking.checkOut ? 'Completed' : 'Active'}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )
        )}

        {/* MANAGE INVENTORY TAB */}
        {subTab === 'manage' && (
            <>
                <div className="flex justify-end mb-4">
                     <button
                        onClick={startAdd}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 active:scale-95 transition-all shadow-sm"
                    >
                        <Plus size={16} /> {t('addRoom')}
                    </button>
                </div>

                {isEditing && (
                <div className="bg-white rounded-2xl border border-orange-200 shadow-sm p-5 space-y-4 animate-fade-in mb-6">
                    <div className="flex items-center justify-between">
                    <h4 className="font-bold text-brown-dark">{editingRoom ? t('editRoom') : t('addRoom')}</h4>
                    <button onClick={() => { setEditingRoom(null); setShowAddRoom(false); }} className="p-1.5 rounded-lg hover:bg-stone-100">
                        <X size={18} className="text-stone-400" />
                    </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">{t('roomNumber')}</label>
                        <input value={form.roomNumber} onChange={e => setForm(p => ({ ...p, roomNumber: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-300"
                        placeholder="e.g. 101" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">{t('roomType')}</label>
                        <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-300 appearance-none bg-white">
                        <option value="DELUXE">{t('roomDeluxe')}</option>
                        <option value="PREMIUM_SUITE">{t('roomPremiumSuite')}</option>
                        <option value="ROYAL_SUITE">{t('roomRoyalSuite')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">{t('floor')}</label>
                        <input type="number" min={0} value={form.floor} onChange={e => setForm(p => ({ ...p, floor: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-300" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">{t('roomCapacity')}</label>
                        <input type="number" min={1} value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-300" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block flex items-center gap-1"><Snowflake size={12} className="text-blue-500" /> {t('priceAC')}</label>
                        <input type="number" min={0} value={form.priceAC} onChange={e => setForm(p => ({ ...p, priceAC: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="₹" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block flex items-center gap-1"><Flame size={12} className="text-orange-500" /> {t('priceNonAC')}</label>
                        <input type="number" min={0} value={form.priceNonAC} onChange={e => setForm(p => ({ ...p, priceNonAC: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="₹" />
                    </div>
                    </div>
                    <button onClick={handleSave} disabled={saving}
                    className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl text-sm hover:bg-orange-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    <Save size={16} /> {saving ? '...' : t('saveChanges')}
                    </button>
                </div>
                )}

                {/* Rooms by Floor */}
                {loadingRooms ? (
                <div className="text-center py-16 text-stone-400"><RefreshCw size={24} className="mx-auto animate-spin mb-2" />Loading rooms...</div>
                ) : (
                Object.entries(floorGroups).sort(([a], [b]) => Number(a) - Number(b)).map(([floor, floorRooms]) => (
                    <div key={floor} className="space-y-2 mb-6">
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest px-1">
                        {Number(floor) === 0 ? t('groundFloor') : `${t('floor')} ${floor}`} · {floorRooms.length} rooms
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {floorRooms.map(room => {
                        const isOccupied = room.status === 'OCCUPIED';
                        const isSelected = editingRoom?.id === room.id;
                        return (
                            <div key={room.id}
                            className={`bg-white rounded-xl border p-4 transition-all ${isSelected ? 'border-orange-400 ring-2 ring-orange-200' : 'border-stone-100 hover:border-stone-200'}`}>
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                                    isOccupied ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                }`}>
                                    {room.roomNumber}
                                </div>
                                <div>
                                    <h4 className="font-bold text-brown-dark text-sm">{t('room')} {room.roomNumber}</h4>
                                    <p className="text-[10px] text-stone-400 uppercase tracking-wider">
                                    {room.type.replace('_', ' ')} · {room.capacity} {t('guests')}
                                    </p>
                                </div>
                                </div>
                                <div className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                                isOccupied ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
                                }`}>
                                {isOccupied ? t('roomOccupied') : t('roomAvailable')}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-stone-500 mb-3">
                                <span className="flex items-center gap-1"><Snowflake size={12} className="text-blue-500" /> ₹{room.priceAC}</span>
                                <span className="flex items-center gap-1"><Flame size={12} className="text-orange-400" /> ₹{room.priceNonAC}</span>
                                <span className="text-stone-300">|</span>
                                <span>{t('floor')} {room.floor}</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => startEdit(room)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-stone-100 text-stone-600 text-xs font-bold hover:bg-stone-200 active:scale-95 transition-all">
                                <Pencil size={13} /> {t('editRoom')}
                                </button>
                                {!isOccupied && (
                                <button onClick={() => handleDelete(room)}
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-500 text-xs font-bold hover:bg-red-100 active:scale-95 transition-all">
                                    <Trash2 size={13} />
                                </button>
                                )}
                            </div>
                            </div>
                        );
                        })}
                    </div>
                    </div>
                ))
                )}
            </>
        )}
      </div>
    );
  };

  // ==================== MENU & AMENITIES MANAGEMENT TAB ====================
  const MenuManageTab = () => {
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('All');
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [showAddItem, setShowAddItem] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
      name: '', category: 'FOOD' as string, price: 0, available: true, description: '',
    });

    const categories = Array.from(new Set(menuItems.map(i => i.category)));

    const filtered = menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesCat = filterCat === 'All' || item.category === filterCat;
      return matchesSearch && matchesCat;
    });

    const startEdit = (item: MenuItem) => {
      setEditingItem(item);
      setForm({
        name: item.name,
        category: item.category,
        price: item.price,
        available: item.available,
        description: item.description || '',
      });
      setShowAddItem(false);
    };

    const startAdd = () => {
      setEditingItem(null);
      setForm({ name: '', category: 'FOOD', price: 0, available: true, description: '' });
      setShowAddItem(true);
    };

    const handleSave = async () => {
      if (!form.name || form.price <= 0) return;
      setSaving(true);
      try {
        if (editingItem) {
          const updated = await apiClient.updateMenuItem(editingItem.id, form) as MenuItem;
          setMenuItems(prev => prev.map(i => i.id === updated.id ? updated : i));
          showToast(t('saved'), 'success');
        } else {
          const created = await apiClient.createMenuItem(form) as MenuItem;
          setMenuItems(prev => [...prev, created]);
          showToast(t('created'), 'success');
        }
        setEditingItem(null);
        setShowAddItem(false);
      } catch (err: any) {
        showToast(err.message || t('saveFailed'), 'error');
      } finally { setSaving(false); }
    };

    const handleDelete = async (item: MenuItem) => {
      if (!confirm(t('confirmDelete'))) return;
      try {
        await apiClient.deleteMenuItem(item.id);
        setMenuItems(prev => prev.filter(i => i.id !== item.id));
        showToast(t('deleted'), 'success');
        if (editingItem?.id === item.id) { setEditingItem(null); setShowAddItem(false); }
      } catch (err: any) {
        showToast(err.message || t('deleteFailed'), 'error');
      }
    };

    const toggleAvailable = async (item: MenuItem) => {
      try {
        const updated = await apiClient.updateMenuItem(item.id, { available: !item.available }) as MenuItem;
        setMenuItems(prev => prev.map(i => i.id === updated.id ? updated : i));
      } catch { showToast(t('saveFailed'), 'error'); }
    };

    const isEditing = editingItem !== null || showAddItem;

    const grouped = filtered.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);

    return (
      <div className="space-y-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-brown-dark flex items-center gap-2">
              <UtensilsCrossed size={20} className="text-orange-600" />
              {t('manageMenu')}
            </h3>
            <p className="text-xs text-stone-400">{menuItems.length} items · {categories.length} categories</p>
          </div>
          <button onClick={startAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 active:scale-95 transition-all shadow-sm">
            <Plus size={16} /> {t('addItem')}
          </button>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input type="text" placeholder={t('searchItems')} value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
          </div>
          <div className="relative">
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="appearance-none bg-white border border-stone-200 rounded-xl py-2.5 pl-4 pr-8 text-sm font-medium text-brown-dark focus:outline-none">
              <option value="All">{t('allCategories')}</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500" />
          </div>
        </div>

        {/* Add / Edit Form */}
        {isEditing && (
          <div className="bg-white rounded-2xl border border-orange-200 shadow-sm p-5 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-brown-dark">{editingItem ? t('editItem') : t('addItem')}</h4>
              <button onClick={() => { setEditingItem(null); setShowAddItem(false); }} className="p-1.5 rounded-lg hover:bg-stone-100">
                <X size={18} className="text-stone-400" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">{t('itemName')}</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="e.g. Butter Chicken" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">{t('itemCategory')}</label>
                <input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="FOOD / AMENITY / DRINKS" list="category-suggestions" />
                <datalist id="category-suggestions">
                  {categories.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">{t('price')} (₹)</label>
                <input type="number" min={0} value={form.price} onChange={e => setForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="₹" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">{t('description')}</label>
                <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="Optional description" />
              </div>
              <div className="flex items-end">
                <button type="button" onClick={() => setForm(p => ({ ...p, available: !p.available }))}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${form.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                  {form.available ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  {form.available ? t('available') : t('unavailable')}
                </button>
              </div>
            </div>
            <button onClick={handleSave} disabled={saving}
              className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl text-sm hover:bg-orange-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              <Save size={16} /> {saving ? '...' : t('saveChanges')}
            </button>
          </div>
        )}

        {/* Items grouped by category */}
        {loadingMenu ? (
          <div className="text-center py-16 text-stone-400"><RefreshCw size={24} className="mx-auto animate-spin mb-2" />Loading menu...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-stone-400 flex flex-col items-center">
            <UtensilsCrossed size={40} className="mb-2 opacity-40" />
            {t('noMenuItems')}
          </div>
        ) : (
          Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([cat, items]) => (
            <div key={cat} className="space-y-2">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest px-1 flex items-center gap-2">
                {cat === 'AMENITY' ? '🧴' : cat === 'FOOD' ? '🍛' : cat === 'DRINKS' ? '🥤' : '📦'} {cat} · {items.length}
              </h4>
              <div className="space-y-2">
                {items.map(item => {
                  const isSelected = editingItem?.id === item.id;
                  return (
                    <div key={item.id}
                      className={`bg-white rounded-xl border p-3.5 flex items-center justify-between transition-all ${isSelected ? 'border-orange-400 ring-2 ring-orange-200' : 'border-stone-100 hover:border-stone-200'}`}>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button onClick={() => toggleAvailable(item)}
                          className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                            item.available ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-400'
                          }`} title={item.available ? t('available') : t('unavailable')}>
                          {item.available ? <Check size={16} /> : <X size={16} />}
                        </button>
                        <div className="min-w-0">
                          <h5 className={`font-bold text-sm truncate ${item.available ? 'text-brown-dark' : 'text-stone-400 line-through'}`}>{item.name}</h5>
                          {item.description && <p className="text-[10px] text-stone-400 truncate">{item.description}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <span className="font-bold text-brown text-sm">₹{item.price}</span>
                        <button onClick={() => startEdit(item)}
                          className="p-2 rounded-lg bg-stone-100 text-stone-500 hover:bg-stone-200 active:scale-95 transition-all">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(item)}
                          className="p-2 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 active:scale-95 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="min-h-dvh bg-stone-50 text-brown-dark font-sans pb-20">
      {/* Owner Header */}
      <header className="bg-brown-dark text-white p-4 sm:p-6 rounded-b-3xl shadow-lg mb-4 sm:mb-6 sticky top-0 z-50">
        <div className="flex justify-between items-center mb-3 sm:mb-6">
            <div>
                <h1 className="text-2xl font-bold">{t('ownerDashboard')}</h1>
                <p className="text-white/60 text-sm">Welcome, {userName}</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={onSwitchToManagerView} 
                className="bg-peach/90 text-brown-dark px-3 py-2 rounded-xl hover:bg-peach transition-colors flex items-center gap-1.5 text-xs font-bold shadow-sm"
              >
                <Monitor size={16} />
                Manager View
              </button>
              <button onClick={onLogout} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                <LogOut size={20} />
              </button>
            </div>
        </div>
        
        {/* Navigation Tabs — scrollable on small screens */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {([
              { key: 'overview', label: t('overview') },
              { key: 'rooms', label: t('manageRooms') },
              { key: 'menu', label: t('manageMenu') },
              { key: 'staff', label: t('staff') },
              { key: 'history', label: t('history') },
            ] as { key: typeof activeTab; label: string }[]).map(tab => (
              <button key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab.key ? 'bg-peach text-brown-dark' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {tab.label}
              </button>
            ))}
        </div>
      </header>

      {/* Content Area */}
      <div className="px-4">
         {activeTab === 'overview' && <OverviewTab />}
         {activeTab === 'rooms' && <RoomsManageTab />}
         {activeTab === 'menu' && <MenuManageTab />}
         {activeTab === 'staff' && <StaffTab />}
         {activeTab === 'history' && <HistoryTab />}
      </div>
    </div>
  );
};
