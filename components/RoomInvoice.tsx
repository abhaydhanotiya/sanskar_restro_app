'use client';

import React, { useRef, useState, useEffect } from 'react';
import { X, Printer, Building2, FileText, Receipt } from 'lucide-react';
import { RoomBooking, RoomServiceItem, Room } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

const LAST_INVOICE_KEY = 'sanskar_last_invoice_no';

function getNextInvoiceNo(): number {
  try {
    const last = parseInt(localStorage.getItem(LAST_INVOICE_KEY) || '0', 10);
    return (last || 0) + 1;
  } catch { return 1; }
}

function saveInvoiceNo(no: number) {
  try { localStorage.setItem(LAST_INVOICE_KEY, String(no)); } catch {}
}

export interface CustomerDetails {
  companyName?: string;
  companyAddressLine1?: string;
  companyAddressLine2?: string;
  customerGstin?: string;
  invoiceNo: number;
  gstEnabled: boolean;
}

export interface InvoiceData {
  booking: RoomBooking;
  room: Room;
  invoiceNo: number;
  customerDetails?: CustomerDetails;
}

// --- Billing Details Modal ---
export const BillingDetailsModal: React.FC<{
  onSubmit: (details: CustomerDetails) => void;
  onClose: () => void;
  defaultInvoiceNo?: number;
  defaultValues?: Partial<CustomerDetails>;
}> = ({ onSubmit, onClose, defaultInvoiceNo, defaultValues }) => {
  const { t } = useLanguage();
  const [invoiceNo, setInvoiceNo] = useState(defaultValues?.invoiceNo ?? defaultInvoiceNo ?? getNextInvoiceNo());
  const [gstEnabled, setGstEnabled] = useState(defaultValues?.gstEnabled ?? true);
  const [companyName, setCompanyName] = useState(defaultValues?.companyName ?? '');
  const [addressLine1, setAddressLine1] = useState(defaultValues?.companyAddressLine1 ?? '');
  const [addressLine2, setAddressLine2] = useState(defaultValues?.companyAddressLine2 ?? '');
  const [customerGstin, setCustomerGstin] = useState(defaultValues?.customerGstin ?? '');

  const handleSubmit = () => {
    saveInvoiceNo(invoiceNo);
    onSubmit({
      invoiceNo,
      gstEnabled,
      companyName: companyName.trim() || undefined,
      companyAddressLine1: addressLine1.trim() || undefined,
      companyAddressLine2: addressLine2.trim() || undefined,
      customerGstin: customerGstin.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] flex items-end sm:items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <Building2 size={20} className="text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-brown-dark">{t('billingDetails')}</h3>
            <p className="text-xs text-stone-400">{t('billingDetailsHint')}</p>
          </div>
        </div>

        {/* Invoice No + GST toggle row */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1 block">{t('invoiceNo')}</label>
            <input
              type="number"
              min={1}
              value={invoiceNo}
              onChange={e => setInvoiceNo(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-peach focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1 block">{t('gstBill')}</label>
            <div className="flex rounded-xl border border-stone-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setGstEnabled(true)}
                className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
                  gstEnabled ? 'bg-orange-600 text-white' : 'bg-white text-stone-500 hover:bg-stone-50'
                }`}
              >
                {t('withGst')}
              </button>
              <button
                type="button"
                onClick={() => setGstEnabled(false)}
                className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
                  !gstEnabled ? 'bg-stone-700 text-white' : 'bg-white text-stone-500 hover:bg-stone-50'
                }`}
              >
                {t('withoutGst')}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1 block">{t('companyName')}</label>
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder={t('companyNamePlaceholder')}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-peach focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1 block">{t('companyAddressLine1')}</label>
            <input
              type="text"
              value={addressLine1}
              onChange={e => setAddressLine1(e.target.value)}
              placeholder={t('addressLine1Placeholder')}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-peach focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1 block">{t('companyAddressLine2')}</label>
            <input
              type="text"
              value={addressLine2}
              onChange={e => setAddressLine2(e.target.value)}
              placeholder={t('addressLine2Placeholder')}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-peach focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1 block">{t('customerGstin')}</label>
            <input
              type="text"
              value={customerGstin}
              onChange={e => setCustomerGstin(e.target.value.toUpperCase())}
              placeholder="e.g. 23AABCT1234A1Z5"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-peach focus:border-transparent"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-2xl bg-orange-600 text-white font-bold text-sm shadow-md hover:bg-orange-700 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Receipt size={16} />
          {t('generateBill')} {gstEnabled ? `(${t('withGst')})` : `(${t('withoutGst')})`}
        </button>
      </div>
    </div>
  );
};

// Business details from the sample invoice
const BUSINESS = {
  name: 'Sanskar Palace',
  address: '649/2, Garoth Road, Shamgarh',
  email: 'sanskarpalace2024@gmail.com',
  phone: '9425924420',
  gstin: '23AEXPD6729C2ZG',
  jurisdiction: 'GAROTH',
};

const GST_RATE = 2.5; // CGST 2.5% + SGST 2.5% = total 5%

export const RoomInvoice: React.FC<{
  data: InvoiceData;
  onClose: () => void;
}> = ({ data, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { booking, room, customerDetails } = data;
  const gstEnabled = customerDetails?.gstEnabled ?? true;
  const displayInvoiceNo = customerDetails?.invoiceNo ?? data.invoiceNo;

  // Calculate line items
  const checkIn = new Date(booking.checkIn);
  const checkOut = booking.checkOut ? new Date(booking.checkOut) : new Date();
  const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
  const pricePerNight = booking.isAC ? room.priceAC : room.priceNonAC;
  const roomTotal = pricePerNight * nights;

  const items = booking.items ?? [];

  // Build line items for invoice table
  type LineItem = { description: string; qty: number; unitPrice: number; total: number };
  const lineItems: LineItem[] = [];

  lineItems.push({
    description: `Room ${room.roomNumber} — ${booking.isAC ? 'AC' : 'Non-AC'} (${nights} ${nights === 1 ? 'Night' : 'Nights'})`,
    qty: nights,
    unitPrice: pricePerNight,
    total: roomTotal,
  });

  items.forEach(item => {
    lineItems.push({
      description: `${item.name}${item.category === 'AMENITY' ? ' (Amenity)' : ''}`,
      qty: item.quantity,
      unitPrice: item.price,
      total: item.price * item.quantity,
    });
  });

  const subtotal = lineItems.reduce((s, i) => s + i.total, 0);
  const gstRate = gstEnabled ? GST_RATE : 0;
  const cgst = Math.round(subtotal * gstRate) / 100;
  const sgst = Math.round(subtotal * gstRate) / 100;
  const grandTotal = Math.round(subtotal + cgst + sgst);
  const roundOff = grandTotal - (subtotal + cgst + sgst);

  const invoiceDate = checkOut.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=800,height=1000');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${displayInvoiceNo} — ${BUSINESS.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a1a; }
          .invoice { max-width: 700px; margin: 0 auto; padding: 24px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; border-bottom: 3px solid #E65100; padding-bottom: 12px; }
          .header-left h1 { font-size: 28px; color: #E65100; font-weight: 800; margin-bottom: 2px; }
          .header-left h2 { font-size: 18px; color: #E65100; margin-bottom: 4px; }
          .header-left p { font-size: 11px; color: #555; line-height: 1.6; }
          .header-left a { color: #E65100; text-decoration: none; }
          .header-right { text-align: right; }
          .header-right img { width: 80px; height: 80px; }
          .invoice-meta { display: flex; justify-content: space-between; margin-bottom: 16px; }
          .meta-box { background: #f9f9f9; padding: 8px 12px; border-radius: 4px; border: 1px solid #e0e0e0; }
          .meta-box span { font-size: 11px; color: #888; }
          .meta-box strong { font-size: 13px; display: block; }
          .bill-to { margin-bottom: 16px; }
          .bill-to h3 { color: #E65100; font-size: 13px; margin-bottom: 4px; }
          .bill-to p { font-size: 12px; color: #333; line-height: 1.5; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          thead th { background: #E65100; color: white; padding: 8px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; }
          thead th:nth-child(2), thead th:nth-child(3), thead th:nth-child(4) { text-align: right; }
          tbody td { padding: 8px 10px; font-size: 12px; border-bottom: 1px solid #eee; }
          tbody td:nth-child(2), tbody td:nth-child(3), tbody td:nth-child(4) { text-align: right; }
          .totals { display: flex; justify-content: flex-end; }
          .totals-table { width: 280px; }
          .totals-table .row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; }
          .totals-table .row.grand { background: #E65100; color: white; padding: 8px 12px; font-size: 15px; font-weight: 800; border-radius: 4px; margin-top: 4px; }
          .totals-table .row span:first-child { color: #555; }
          .totals-table .row.grand span:first-child { color: white; }
          .totals-table .divider { border-top: 1px solid #ddd; margin: 4px 0; }
          .footer { margin-top: 20px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #eee; padding-top: 12px; }
          .footer-left { font-size: 10px; color: #888; }
          .footer-left h4 { color: #E65100; font-size: 11px; margin-bottom: 2px; }
          .footer-right { text-align: center; }
          .footer-right p { font-size: 10px; color: #555; margin-top: 4px; }
          .jurisdiction { text-align: center; font-size: 10px; color: #888; margin-top: 12px; border-top: 1px solid #eee; padding-top: 8px; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .invoice { padding: 12px; }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center animate-fade-in p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-stone-50 border-b border-stone-200">
          <h3 className="font-bold text-brown-dark">Tax Invoice #{displayInvoiceNo}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-bold hover:bg-orange-700 active:scale-95 transition-all"
            >
              <Printer size={16} /> Print
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-stone-200 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Invoice Content (printable area) */}
        <div className="overflow-y-auto flex-1 p-4">
          <div ref={printRef}>
            <div className="invoice">
              {/* Header */}
              <div className="header">
                <div className="header-left">
                  <h1 style={{ color: '#E65100', fontSize: '22px', fontWeight: 800 }}>Tax Invoice</h1>
                  <h2 style={{ color: '#E65100', fontSize: '16px', margin: '4px 0' }}>{BUSINESS.name}</h2>
                  <p style={{ fontSize: '11px', color: '#555', lineHeight: '1.6' }}>
                    {BUSINESS.address}<br />
                    <a href={`mailto:${BUSINESS.email}`} style={{ color: '#E65100', textDecoration: 'none' }}>{BUSINESS.email}</a><br />
                    {BUSINESS.phone}<br />
                    {BUSINESS.gstin}
                  </p>
                </div>
              </div>

              {/* Invoice Meta — INVOICE NO. | Invoice Date + Due Date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ background: '#f9f9f9', padding: '8px 12px', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                  <span style={{ fontSize: '10px', color: '#888' }}>INVOICE NO.</span>
                  <strong style={{ display: 'block', fontSize: '14px' }}>{displayInvoiceNo}</strong>
                </div>
                <div style={{ background: '#f9f9f9', padding: '8px 12px', borderRadius: '4px', border: '1px solid #e0e0e0', textAlign: 'right' as const }}>
                  <div><span style={{ fontSize: '10px', color: '#888' }}>Invoice Date: </span><strong style={{ fontSize: '11px' }}>{invoiceDate}</strong></div>
                  <div><span style={{ fontSize: '10px', color: '#888' }}>Due Date:</span></div>
                </div>
              </div>

              {/* Bill To — matching sample format */}
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ color: '#E65100', fontSize: '12px', marginBottom: '4px', fontWeight: 700 }}>BILL TO</h3>
                <p style={{ fontSize: '12px', color: '#333', lineHeight: '1.8' }}>
                  {booking.guestName}<br />
                  {customerDetails?.companyName && <>{customerDetails.companyName}<br /></>}
                  {customerDetails?.companyAddressLine1 && <>{customerDetails.companyAddressLine1}<br /></>}
                  {customerDetails?.companyAddressLine2 && <>{customerDetails.companyAddressLine2}<br /></>}
                  {customerDetails?.customerGstin && <>Gst No. {customerDetails.customerGstin}<br /></>}
                  {booking.guestPhone && <>Mobile: {booking.guestPhone}</>}
                </p>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                <thead>
                  <tr>
                    <th style={{ background: '#E65100', color: 'white', padding: '8px 10px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>Description</th>
                    <th style={{ background: '#E65100', color: 'white', padding: '8px 10px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Qty</th>
                    <th style={{ background: '#E65100', color: 'white', padding: '8px 10px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Unit Price</th>
                    <th style={{ background: '#E65100', color: 'white', padding: '8px 10px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '8px 10px', fontSize: '12px', borderBottom: '1px solid #eee' }}>{item.description}</td>
                      <td style={{ padding: '8px 10px', fontSize: '12px', borderBottom: '1px solid #eee', textAlign: 'right' }}>{item.qty}</td>
                      <td style={{ padding: '8px 10px', fontSize: '12px', borderBottom: '1px solid #eee', textAlign: 'right' }}>₹ {item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: '8px 10px', fontSize: '12px', borderBottom: '1px solid #eee', textAlign: 'right' }}>₹ {item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  {/* Empty rows to match sample */}
                  {lineItems.length < 6 && Array.from({ length: 6 - lineItems.length }).map((_, idx) => (
                    <tr key={`empty-${idx}`}>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee' }}>&nbsp;</td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee' }}></td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee' }}></td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee' }}></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer with Totals */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                {/* Left side — Terms & Signature */}
                <div style={{ fontSize: '10px', color: '#888', maxWidth: '240px' }}>
                  <h4 style={{ color: '#E65100', fontSize: '11px', marginBottom: '2px', fontWeight: 700 }}>Terms &amp; Instructions</h4>
                  <p style={{ lineHeight: '1.5', marginBottom: '16px' }}>Payment Mode: UPI + Cash</p>
                  <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <p style={{ fontSize: '10px', color: '#555', marginBottom: '28px' }}>FOR M/S {BUSINESS.name.toUpperCase()}</p>
                    <p style={{ fontSize: '10px', color: '#555', borderTop: '1px solid #ccc', paddingTop: '4px' }}>Seal &amp; Signature</p>
                  </div>
                </div>

                {/* Right side — Totals */}
                <div style={{ width: '260px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px' }}>
                    <span style={{ color: '#555' }}>SUBTOTAL</span>
                    <span>₹ {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px' }}>
                    <span style={{ color: '#555' }}>DISCOUNT</span>
                    <span>₹ -</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px' }}>
                    <span style={{ color: '#555' }}>SUBTOTAL LESS DISCOUNT</span>
                    <span>₹ -</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px' }}>
                    <span style={{ color: '#555' }}>CGST @ {gstRate}%</span>
                    <span>₹ {cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px' }}>
                    <span style={{ color: '#555' }}>SGST @ {gstRate}%</span>
                    <span>₹ {sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px' }}>
                    <span style={{ color: '#555' }}>Received Balance</span>
                    <span>₹ -</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px' }}>
                    <span style={{ color: '#555', fontStyle: 'italic' }}>Round-off</span>
                    <span>₹ {roundOff !== 0 ? roundOff.toFixed(2) : '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', fontSize: '15px', fontWeight: 800, background: '#E65100', color: 'white', borderRadius: '4px', marginTop: '4px' }}>
                    <span>GRAND TOTAL</span>
                    <span>₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>                </div>
              </div>

              {/* Jurisdiction */}
              <div style={{ textAlign: 'center', fontSize: '10px', color: '#888', marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                SUBJECT TO {BUSINESS.jurisdiction} JURISDICTION<br />
                This is a Computer Generated Invoice
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};