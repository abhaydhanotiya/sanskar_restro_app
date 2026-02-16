'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Wrench, BedDouble, CheckCircle, AlertTriangle,
  Clock, Plus, X, MessageSquare
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';

interface MaintenanceLog {
  id: number;
  roomId: number;
  roomNumber: string;
  issue: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  reportedAt: string;
  resolvedAt?: string | null;
  notes?: string;
}

// --- Add Issue Modal ---
const AddIssueModal: React.FC<{
  rooms: { id: number; roomNumber: string }[];
  onSubmit: (data: { roomId: number; issue: string; notes?: string }) => void;
  onClose: () => void;
}> = ({ rooms, onSubmit, onClose }) => {
  const { t } = useLanguage();
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? 0);
  const [issue, setIssue] = useState('');
  const [notes, setNotes] = useState('');

  const COMMON_ISSUES = [
    { en: 'AC not working', hi: 'AC काम नहीं कर रहा' },
    { en: 'Plumbing issue', hi: 'पानी की समस्या' },
    { en: 'Electrical fault', hi: 'बिजली की खराबी' },
    { en: 'Furniture damage', hi: 'फर्नीचर खराब' },
    { en: 'Deep cleaning needed', hi: 'गहरी सफाई ज़रूरी' },
    { en: 'TV not working', hi: 'TV काम नहीं कर रहा' },
    { en: 'Door/Lock issue', hi: 'दरवाज़ा/ताला खराब' },
    { en: 'Bathroom repair', hi: 'बाथरूम मरम्मत' },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-4 animate-slide-up max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-brown-dark">{t('reportIssue')}</h3>

        {/* Room Selector */}
        <div>
          <label className="text-xs font-semibold text-stone-500 mb-1 block">{t('room')}</label>
          <select
            value={roomId}
            onChange={e => setRoomId(Number(e.target.value))}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-peach/50 bg-white"
          >
            {rooms.map(r => (
              <option key={r.id} value={r.id}>{t('room')} {r.roomNumber}</option>
            ))}
          </select>
        </div>

        {/* Quick Issue Presets */}
        <div>
          <label className="text-xs font-semibold text-stone-500 mb-2 block">{t('commonIssues')}</label>
          <div className="flex flex-wrap gap-2">
            {COMMON_ISSUES.map(ci => (
              <button
                key={ci.en}
                onClick={() => setIssue(ci.en)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  issue === ci.en
                    ? 'bg-yellow-50 border-yellow-400 text-yellow-700'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {ci.en}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Issue */}
        <div>
          <label className="text-xs font-semibold text-stone-500 mb-1 block">{t('issueDescription')}</label>
          <input
            value={issue}
            onChange={e => setIssue(e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-peach/50"
            placeholder={t('issueDescriptionPlaceholder')}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold text-stone-500 mb-1 block">{t('notesLabel')}</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-peach/50 resize-none h-20"
            placeholder={t('notesPlaceholder')}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold text-sm">
            {t('cancel')}
          </button>
          <button
            onClick={() => { if (issue.trim() && roomId) onSubmit({ roomId, issue: issue.trim(), notes: notes.trim() || undefined }); }}
            disabled={!issue.trim() || !roomId}
            className="flex-1 py-2.5 rounded-xl bg-yellow-500 text-white font-bold text-sm disabled:opacity-40"
          >
            {t('reportIssue')}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Maintenance View ---
export const RoomMaintenanceView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [rooms, setRooms] = useState<{ id: number; roomNumber: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');

  const fetchData = useCallback(async () => {
    try {
      const [logsRes, roomsRes] = await Promise.all([
        fetch('/api/rooms/maintenance'),
        fetch('/api/rooms'),
      ]);
      const logsData = await logsRes.json();
      const roomsData = await roomsRes.json();
      setLogs(Array.isArray(logsData) ? logsData : []);
      setRooms(Array.isArray(roomsData) ? roomsData.map((r: any) => ({ id: r.id, roomNumber: r.roomNumber })) : []);
    } catch {
      console.error('Failed to fetch maintenance data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleReport = async (data: { roomId: number; issue: string; notes?: string }) => {
    try {
      const res = await fetch('/api/rooms/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        showToast(t('issueReported'), 'success');
        setShowAddModal(false);
        fetchData();
      }
    } catch {
      showToast(t('issueFailed'), 'error');
    }
  };

  const handleStatusChange = async (logId: number, newStatus: 'IN_PROGRESS' | 'RESOLVED') => {
    try {
      const res = await fetch('/api/rooms/maintenance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: logId, status: newStatus }),
      });
      if (res.ok) {
        showToast(newStatus === 'RESOLVED' ? t('issueResolved') : t('issueInProgress'), 'success');
        fetchData();
      }
    } catch {
      showToast(t('updateFailed'), 'error');
    }
  };

  const filteredLogs = filter === 'ALL' ? logs : logs.filter(l => l.status === filter);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <AlertTriangle size={14} className="text-red-500" />;
      case 'IN_PROGRESS': return <Clock size={14} className="text-yellow-500" />;
      case 'RESOLVED': return <CheckCircle size={14} className="text-green-500" />;
      default: return null;
    }
  };

  const statusBg = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-50 border-red-200 text-red-700';
      case 'IN_PROGRESS': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'RESOLVED': return 'bg-green-50 border-green-200 text-green-700';
      default: return 'bg-stone-50 border-stone-200 text-stone-600';
    }
  };

  const counts = {
    all: logs.length,
    open: logs.filter(l => l.status === 'OPEN').length,
    inProgress: logs.filter(l => l.status === 'IN_PROGRESS').length,
    resolved: logs.filter(l => l.status === 'RESOLVED').length,
  };

  return (
    <div className="min-h-dvh bg-bg-light pb-24">
      {/* Top Bar */}
      <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-stone-100 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-stone-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-brown-dark flex items-center gap-2">
            <Wrench size={18} /> {t('maintenance')}
          </h2>
          <p className="text-xs text-stone-400">{t('maintenanceSubtitle')}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-yellow-500 text-white text-xs font-bold hover:bg-yellow-600 transition-colors shadow-sm"
        >
          <Plus size={14} /> {t('reportIssue')}
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Filter Tabs */}
        <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-stone-200">
          {[
            { key: 'ALL' as const, label: t('all'), count: counts.all },
            { key: 'OPEN' as const, label: t('open'), count: counts.open },
            { key: 'IN_PROGRESS' as const, label: t('inProgress'), count: counts.inProgress },
            { key: 'RESOLVED' as const, label: t('resolved'), count: counts.resolved },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${
                filter === f.key
                  ? 'bg-yellow-500 text-white shadow-sm'
                  : 'text-stone-500 hover:bg-stone-50'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Logs List */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-stone-400">{t('loading')}</div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400">
            <CheckCircle size={48} className="mb-3 opacity-40" />
            <p className="text-sm font-medium">{t('noMaintenanceIssues')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map(log => (
              <div key={log.id} className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                      <BedDouble size={18} className="text-stone-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brown-dark">{t('room')} {log.roomNumber}</p>
                      <p className="text-[10px] text-stone-400">
                        {new Date(log.reportedAt).toLocaleDateString()} · {new Date(log.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border ${statusBg(log.status)}`}>
                    {statusIcon(log.status)}
                    {log.status === 'OPEN' ? t('open') : log.status === 'IN_PROGRESS' ? t('inProgress') : t('resolved')}
                  </span>
                </div>

                {/* Issue */}
                <div className="bg-stone-50 rounded-xl p-3">
                  <p className="text-sm font-medium text-stone-700">{log.issue}</p>
                  {log.notes && (
                    <p className="text-xs text-stone-400 mt-1 flex items-start gap-1">
                      <MessageSquare size={10} className="mt-0.5 shrink-0" />
                      {log.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {log.status !== 'RESOLVED' && (
                  <div className="flex gap-2">
                    {log.status === 'OPEN' && (
                      <button
                        onClick={() => handleStatusChange(log.id, 'IN_PROGRESS')}
                        className="flex-1 py-2 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-semibold hover:bg-yellow-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <Clock size={12} /> {t('markInProgress')}
                      </button>
                    )}
                    <button
                      onClick={() => handleStatusChange(log.id, 'RESOLVED')}
                      className="flex-1 py-2 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle size={12} /> {t('markResolved')}
                    </button>
                  </div>
                )}

                {log.status === 'RESOLVED' && log.resolvedAt && (
                  <p className="text-[10px] text-green-500 font-medium">
                    {t('resolved')} · {new Date(log.resolvedAt).toLocaleDateString()} {new Date(log.resolvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Issue Modal */}
      {showAddModal && (
        <AddIssueModal
          rooms={rooms}
          onSubmit={handleReport}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};
