'use client';

import React, { useRef, useState, useEffect } from 'react';
import { X, Printer, Building2, FileText, Receipt, Download } from 'lucide-react';
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
  subtitle: 'Hotel & Resort',
  logo: '/logo.png',
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
      description: `${item.name}${item.category === 'AMENITY' ? ' (Amenity - GST Incl.)' : ''}`,
      qty: item.quantity,
      unitPrice: item.price,
      total: item.price * item.quantity,
    });
  });

  const subtotal = lineItems.reduce((s, i) => s + i.total, 0);
  // GST only on room charges + food items; packaged amenities already include GST
  const amenityTotal = items.filter(i => i.category === 'AMENITY').reduce((s, i) => s + i.price * i.quantity, 0);
  const taxableAmount = subtotal - amenityTotal;
  const gstRate = gstEnabled ? GST_RATE : 0;
  const cgst = Math.round(taxableAmount * gstRate) / 100;
  const sgst = Math.round(taxableAmount * gstRate) / 100;
  const grandTotal = Math.round(subtotal + cgst + sgst);
  const roundOff = grandTotal - (subtotal + cgst + sgst);

  const invoiceDate = checkOut.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const checkInDate = checkIn.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const checkOutDate = checkOut.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  // Shared print CSS used by both iframe print and screen preview
  const printCSS = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a1a; background: white; }
    .invoice-page { max-width: 700px; margin: 0 auto; padding: 12px 16px; }
    .inv-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 8px; border-bottom: 3px solid #D84315; margin-bottom: 8px; }
    .inv-brand { display: flex; align-items: center; gap: 8px; }
    .inv-brand img { width: 48px; height: 40px; object-fit: contain; }
    .inv-brand-text h1 { font-size: 18px; color: #D84315; font-weight: 800; letter-spacing: -0.5px; margin: 0; line-height: 1.1; }
    .inv-brand-text .subtitle { font-size: 8px; color: #888; letter-spacing: 2.5px; text-transform: uppercase; font-weight: 600; }
    .inv-brand-text p { font-size: 9px; color: #666; line-height: 1.4; margin-top: 1px; }
    .inv-brand-text a { color: #D84315; text-decoration: none; }
    .inv-title { text-align: right; }
    .inv-title h2 { font-size: 20px; color: #D84315; font-weight: 800; letter-spacing: 1px; }
    .inv-title .gstin { font-size: 8px; color: #888; margin-top: 1px; letter-spacing: 0.5px; }
    .inv-meta { display: flex; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; }
    .inv-meta-box { flex: 1; min-width: 100px; background: #FFF3E0; padding: 5px 8px; border-radius: 4px; border-left: 3px solid #D84315; }
    .inv-meta-box .label { font-size: 7px; color: #888; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    .inv-meta-box .value { font-size: 11px; font-weight: 700; color: #333; margin-top: 0; }
    .inv-section { margin-bottom: 8px; }
    .inv-section-title { font-size: 8px; color: #D84315; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 3px; border-bottom: 1px solid #FFE0B2; padding-bottom: 2px; }
    .inv-billto p { font-size: 10px; color: #333; line-height: 1.5; }
    .inv-billto .guest-name { font-weight: 700; font-size: 12px; }
    .inv-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 10px; }
    .inv-table thead th { background: #D84315; color: white; padding: 5px 6px; font-size: 8px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600; }
    .inv-table thead th:first-child { text-align: left; border-radius: 3px 0 0 0; }
    .inv-table thead th:last-child { border-radius: 0 3px 0 0; }
    .inv-table thead th.r { text-align: right; }
    .inv-table thead th.c { text-align: center; }
    .inv-table tbody td { padding: 4px 6px; border-bottom: 1px solid #f0f0f0; }
    .inv-table tbody td.r { text-align: right; }
    .inv-table tbody td.c { text-align: center; }
    .inv-table tbody tr:nth-child(even) { background: #FAFAFA; }
    .inv-table tbody td.item-name { font-weight: 500; }
    .inv-table tbody td.gst-incl { font-size: 8px; color: #888; font-style: italic; }
    .inv-footer-grid { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
    .inv-terms { flex: 1; min-width: 160px; font-size: 8px; color: #888; }
    .inv-terms h4 { color: #D84315; font-size: 8px; margin-bottom: 2px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .inv-terms p { line-height: 1.4; }
    .inv-signature { text-align: center; margin-top: 16px; }
    .inv-signature .for-line { font-size: 8px; color: #555; margin-bottom: 20px; font-weight: 600; }
    .inv-signature .sig-line { font-size: 8px; color: #555; border-top: 1px solid #999; padding-top: 3px; display: inline-block; min-width: 130px; }
    .inv-totals { width: 220px; min-width: 180px; }
    .inv-totals .row { display: flex; justify-content: space-between; padding: 2px 0; font-size: 10px; }
    .inv-totals .row .lbl { color: #666; }
    .inv-totals .row .val { font-weight: 600; }
    .inv-totals .row.sub { color: #888; font-size: 9px; font-style: italic; }
    .inv-totals .divider { border-top: 1px dashed #ddd; margin: 2px 0; }
    .inv-totals .grand { display: flex; justify-content: space-between; background: #D84315; color: white; padding: 6px 8px; border-radius: 4px; margin-top: 4px; font-size: 13px; font-weight: 800; }
    .inv-jurisdiction { text-align: center; font-size: 7px; color: #aaa; margin-top: 8px; padding-top: 5px; border-top: 1px solid #eee; letter-spacing: 0.5px; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .invoice-page { padding: 8px 12px; }
    }
  `;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Invoice #${displayInvoiceNo} — ${BUSINESS.name}</title>
  <style>${printCSS}</style>
</head>
<body>${printContent.innerHTML}</body>
</html>`;

    // Use hidden iframe — works on mobile browsers that block window.open
    let iframe = document.getElementById('print-iframe') as HTMLIFrameElement | null;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
    }

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) return;

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    setTimeout(() => {
      try {
        iframe!.contentWindow?.print();
      } catch {
        window.print();
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white shrink-0">
          <div className="flex items-center gap-2">
            <FileText size={18} />
            <div>
              <h3 className="font-bold text-sm leading-tight">Tax Invoice #{displayInvoiceNo}</h3>
              <p className="text-[10px] text-orange-100">{BUSINESS.name} • {invoiceDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/20 text-white text-xs font-bold hover:bg-white/30 active:scale-95 transition-all backdrop-blur-sm"
            >
              <Printer size={14} /> Print
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Invoice Content (printable area) */}
        <div className="overflow-y-auto flex-1">
          {/* Inject print CSS into preview via style tag */}
          <style dangerouslySetInnerHTML={{ __html: printCSS }} />
          <div ref={printRef}>
            <div className="invoice-page">
              {/* Header */}
              <div className="inv-header">
                <div className="inv-brand">
                  <img src={BUSINESS.logo} alt={BUSINESS.name} />
                  <div className="inv-brand-text">
                    <h1>{BUSINESS.name}</h1>
                    <div className="subtitle">{BUSINESS.subtitle}</div>
                    <p>
                      {BUSINESS.address}<br />
                      <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> • {BUSINESS.phone}
                    </p>
                  </div>
                </div>
                <div className="inv-title">
                  <h2>TAX INVOICE</h2>
                  <p className="gstin">GSTIN: {BUSINESS.gstin}</p>
                </div>
              </div>

              {/* Invoice Meta Cards */}
              <div className="inv-meta">
                <div className="inv-meta-box">
                  <div className="label">Invoice No.</div>
                  <div className="value">{displayInvoiceNo}</div>
                </div>
                <div className="inv-meta-box">
                  <div className="label">Invoice Date</div>
                  <div className="value">{invoiceDate}</div>
                </div>
                <div className="inv-meta-box">
                  <div className="label">Check-in</div>
                  <div className="value">{checkInDate}</div>
                </div>
                <div className="inv-meta-box">
                  <div className="label">Check-out</div>
                  <div className="value">{checkOutDate}</div>
                </div>
              </div>

              {/* Bill To */}
              <div className="inv-section">
                <div className="inv-section-title">Bill To</div>
                <div className="inv-billto">
                  <p>
                    <span className="guest-name">{booking.guestName}</span><br />
                    {customerDetails?.companyName && <>{customerDetails.companyName}<br /></>}
                    {customerDetails?.companyAddressLine1 && <>{customerDetails.companyAddressLine1}<br /></>}
                    {customerDetails?.companyAddressLine2 && <>{customerDetails.companyAddressLine2}<br /></>}
                    {customerDetails?.customerGstin && <>GSTIN: {customerDetails.customerGstin}<br /></>}
                    {booking.guestPhone && <>Mobile: {booking.guestPhone}</>}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <table className="inv-table">
                <thead>
                  <tr>
                    <th style={{ width: '5%' }} className="c">#</th>
                    <th style={{ width: '50%' }}>Description</th>
                    <th className="c" style={{ width: '10%' }}>Qty</th>
                    <th className="r" style={{ width: '17%' }}>Rate</th>
                    <th className="r" style={{ width: '18%' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="c" style={{ color: '#999', fontSize: '10px' }}>{idx + 1}</td>
                      <td className="item-name">{item.description}</td>
                      <td className="c">{item.qty}</td>
                      <td className="r">₹{item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="r" style={{ fontWeight: 600 }}>₹{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer: Terms + Totals side by side */}
              <div className="inv-footer-grid">
                {/* Left — Terms & Signature */}
                <div className="inv-terms">
                  <h4>Terms & Instructions</h4>
                  <p>Payment Mode: UPI / Cash<br />Thank you for staying with us!</p>
                  <div className="inv-signature">
                    <p className="for-line">FOR M/S {BUSINESS.name.toUpperCase()}</p>
                    <p className="sig-line">Authorised Signatory</p>
                  </div>
                </div>

                {/* Right — Totals */}
                <div className="inv-totals">
                  <div className="row">
                    <span className="lbl">Subtotal</span>
                    <span className="val">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {amenityTotal > 0 && (
                    <div className="row sub">
                      <span className="lbl">Amenities (GST Incl.)</span>
                      <span>₹{amenityTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="divider"></div>
                  <div className="row">
                    <span className="lbl">Taxable Amount</span>
                    <span className="val">₹{taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="row">
                    <span className="lbl">CGST @ {gstRate}%</span>
                    <span className="val">₹{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="row">
                    <span className="lbl">SGST @ {gstRate}%</span>
                    <span className="val">₹{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {roundOff !== 0 && (
                    <div className="row sub">
                      <span className="lbl">Round-off</span>
                      <span>₹{roundOff.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="grand">
                    <span>GRAND TOTAL</span>
                    <span>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Jurisdiction */}
              <div className="inv-jurisdiction">
                SUBJECT TO {BUSINESS.jurisdiction} JURISDICTION &nbsp;•&nbsp; This is a Computer Generated Invoice
              </div>
            </div>
          </div>
        </div>

        {/* Bottom action bar (mobile friendly) */}
        <div className="shrink-0 px-4 py-3 bg-stone-50 border-t border-stone-200 flex gap-2 sm:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-orange-600 text-white font-bold text-sm active:scale-95 transition-all shadow-md"
          >
            <Printer size={16} /> Print Invoice
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-2xl bg-stone-200 text-stone-600 font-bold text-sm active:scale-95 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};