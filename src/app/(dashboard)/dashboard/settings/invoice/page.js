"use client";

import { useState } from 'react';
import Swal from 'sweetalert2';
import { Receipt, FileText, Hash } from 'lucide-react';
import {
  SettingsPageHeader,
  SettingsSection,
  Field,
  inputClass,
  selectClass,
  Toggle,
  SaveBar,
  StatPill,
} from '@/app/components/dashboard/SettingsUI';

const DEFAULTS = {
  companyName: 'Shilpalay',
  companyAddress: 'Dhaka, Bangladesh',
  invoicePrefix: 'INV-',
  nextNumber: 1001,
  dueDays: 7,
  footerNote: 'Thank you for shopping with Shilpalay.',
  showLogo: true,
  showTaxBreakdown: true,
  showPaymentInstructions: true,
  paymentInstructions: 'Pay via bKash / Nagad / Bank transfer. Mention invoice number.',
  paperSize: 'A4',
};

export default function InvoiceSettingsPage() {
  const [form, setForm] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const previewNumber = `${form.invoicePrefix}${String(form.nextNumber).padStart(4, '0')}`;

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    Swal.fire({
      icon: 'success',
      title: 'Saved (preview)',
      text: 'Invoice settings UI saved locally. Connect an API to persist.',
      timer: 1800,
      showConfirmButton: false,
    });
  };

  return (
    <div className="max-w-5xl">
      <SettingsPageHeader
        title="Invoice Settings"
        description="Numbering, company block and printable invoice layout"
        badge="UI preview"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <StatPill icon={Hash} label="Next invoice" value={previewNumber} />
        <StatPill icon={Receipt} label="Due window" value={`${form.dueDays} days`} />
        <StatPill icon={FileText} label="Paper" value={form.paperSize} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-5">
          <SettingsSection title="Company on invoice" description="Appears at the top of every invoice">
            <div className="grid grid-cols-1 gap-4">
              <Field label="Legal / trade name">
                <input
                  className={inputClass}
                  value={form.companyName}
                  onChange={(e) => set('companyName', e.target.value)}
                />
              </Field>
              <Field label="Address block">
                <textarea
                  rows={3}
                  className={`${inputClass} resize-none`}
                  value={form.companyAddress}
                  onChange={(e) => set('companyAddress', e.target.value)}
                />
              </Field>
            </div>
          </SettingsSection>

          <SettingsSection title="Numbering & terms">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Prefix">
                <input
                  className={inputClass}
                  value={form.invoicePrefix}
                  onChange={(e) => set('invoicePrefix', e.target.value)}
                />
              </Field>
              <Field label="Next number">
                <input
                  type="number"
                  min={1}
                  className={inputClass}
                  value={form.nextNumber}
                  onChange={(e) => set('nextNumber', Number(e.target.value) || 1)}
                />
              </Field>
              <Field label="Payment due (days)">
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={form.dueDays}
                  onChange={(e) => set('dueDays', Number(e.target.value) || 0)}
                />
              </Field>
              <Field label="Paper size" className="md:col-span-3">
                <select
                  className={selectClass}
                  value={form.paperSize}
                  onChange={(e) => set('paperSize', e.target.value)}
                >
                  <option value="A4">A4</option>
                  <option value="Letter">Letter</option>
                </select>
              </Field>
            </div>
          </SettingsSection>

          <SettingsSection title="Content options">
            <div className="space-y-4">
              <Toggle
                checked={form.showLogo}
                onChange={(v) => set('showLogo', v)}
                label="Show logo"
                description="Print brand logo on invoice header"
              />
              <Toggle
                checked={form.showTaxBreakdown}
                onChange={(v) => set('showTaxBreakdown', v)}
                label="Show tax breakdown"
                description="List VAT / tax lines separately"
              />
              <Toggle
                checked={form.showPaymentInstructions}
                onChange={(v) => set('showPaymentInstructions', v)}
                label="Payment instructions"
                description="Append bank / mobile money notes"
              />
              {form.showPaymentInstructions && (
                <Field label="Instructions text">
                  <textarea
                    rows={3}
                    className={`${inputClass} resize-none`}
                    value={form.paymentInstructions}
                    onChange={(e) => set('paymentInstructions', e.target.value)}
                  />
                </Field>
              )}
              <Field label="Footer note">
                <input
                  className={inputClass}
                  value={form.footerNote}
                  onChange={(e) => set('footerNote', e.target.value)}
                />
              </Field>
            </div>
          </SettingsSection>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-4 rounded-2xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 text-sm font-semibold text-gray-900">
              Invoice preview
            </div>
            <div className="p-5 bg-[#fafafa]">
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-[11px] text-gray-700 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    {form.showLogo && (
                      <div className="w-8 h-8 rounded bg-black text-white flex items-center justify-center text-[10px] font-bold mb-2">
                        S
                      </div>
                    )}
                    <p className="font-semibold text-sm text-gray-900">{form.companyName}</p>
                    <p className="text-gray-500 whitespace-pre-line mt-1">{form.companyAddress}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Invoice</p>
                    <p className="font-semibold text-gray-900">{previewNumber}</p>
                    <p className="text-gray-500 mt-1">Due in {form.dueDays} days</p>
                  </div>
                </div>
                <div className="border-t border-dashed border-gray-200 my-3" />
                <div className="flex justify-between mb-1">
                  <span>Subtotal</span>
                  <span>Tk 10,000</span>
                </div>
                {form.showTaxBreakdown && (
                  <div className="flex justify-between mb-1 text-gray-500">
                    <span>VAT</span>
                    <span>Tk 1,500</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-gray-900 mt-2">
                  <span>Total</span>
                  <span>Tk 11,500</span>
                </div>
                {form.showPaymentInstructions && (
                  <p className="mt-4 text-gray-500 leading-relaxed">{form.paymentInstructions}</p>
                )}
                <p className="mt-4 text-center text-gray-400">{form.footerNote}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SaveBar saving={saving} onSave={handleSave} onReset={() => setForm(DEFAULTS)} />
    </div>
  );
}
