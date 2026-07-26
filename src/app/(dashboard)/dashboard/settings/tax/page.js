"use client";

import { useState } from 'react';
import Swal from 'sweetalert2';
import { DollarSign, Percent, Coins } from 'lucide-react';
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
  currency: 'BDT',
  currencySymbol: 'Tk',
  currencyPosition: 'before',
  decimalPlaces: 2,
  thousandSeparator: ',',
  taxEnabled: true,
  taxName: 'VAT',
  taxRate: 15,
  pricesIncludeTax: false,
  taxId: 'BIN-000000000',
  shippingTaxable: true,
};

export default function TaxCurrencyPage() {
  const [form, setForm] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const sampleAmount = 12500;
  const taxAmount = form.taxEnabled ? (sampleAmount * Number(form.taxRate || 0)) / 100 : 0;
  const formatted = `${form.currencyPosition === 'before' ? `${form.currencySymbol} ` : ''}${sampleAmount.toLocaleString('en-BD', {
    minimumFractionDigits: Number(form.decimalPlaces) || 0,
    maximumFractionDigits: Number(form.decimalPlaces) || 0,
  })}${form.currencyPosition === 'after' ? ` ${form.currencySymbol}` : ''}`;

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    Swal.fire({
      icon: 'success',
      title: 'Saved (preview)',
      text: 'Tax & currency UI saved locally. Connect an API to persist.',
      timer: 1800,
      showConfirmButton: false,
    });
  };

  return (
    <div className="max-w-5xl">
      <SettingsPageHeader
        title="Tax & Currency"
        description="Store currency format and tax calculation defaults"
        badge="UI preview"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <StatPill icon={Coins} label="Currency" value={`${form.currency} (${form.currencySymbol})`} />
        <StatPill icon={Percent} label="Tax rate" value={form.taxEnabled ? `${form.taxRate}%` : 'Off'} />
        <StatPill icon={DollarSign} label="Sample price" value={formatted} />
      </div>

      <div className="space-y-5">
        <SettingsSection title="Currency" description="How money is displayed across cart, checkout and invoices">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Currency code">
              <select
                className={selectClass}
                value={form.currency}
                onChange={(e) => {
                  const v = e.target.value;
                  set('currency', v);
                  if (v === 'BDT') set('currencySymbol', 'Tk');
                  if (v === 'USD') set('currencySymbol', '$');
                  if (v === 'EUR') set('currencySymbol', '€');
                }}
              >
                <option value="BDT">BDT — Bangladeshi Taka</option>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
              </select>
            </Field>
            <Field label="Symbol">
              <input
                className={inputClass}
                value={form.currencySymbol}
                onChange={(e) => set('currencySymbol', e.target.value)}
              />
            </Field>
            <Field label="Symbol position">
              <select
                className={selectClass}
                value={form.currencyPosition}
                onChange={(e) => set('currencyPosition', e.target.value)}
              >
                <option value="before">Before amount (Tk 100)</option>
                <option value="after">After amount (100 Tk)</option>
              </select>
            </Field>
            <Field label="Decimal places">
              <select
                className={selectClass}
                value={form.decimalPlaces}
                onChange={(e) => set('decimalPlaces', Number(e.target.value))}
              >
                <option value={0}>0</option>
                <option value={2}>2</option>
              </select>
            </Field>
          </div>
        </SettingsSection>

        <SettingsSection title="Tax" description="Default VAT / tax applied at checkout">
          <div className="mb-4 pb-4 border-b border-gray-100">
            <Toggle
              checked={form.taxEnabled}
              onChange={(v) => set('taxEnabled', v)}
              label="Enable tax"
              description="Apply tax on taxable products and shipping"
            />
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!form.taxEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <Field label="Tax name">
              <input
                className={inputClass}
                value={form.taxName}
                onChange={(e) => set('taxName', e.target.value)}
              />
            </Field>
            <Field label="Tax rate (%)">
              <input
                type="number"
                min={0}
                max={100}
                step={0.01}
                className={inputClass}
                value={form.taxRate}
                onChange={(e) => set('taxRate', e.target.value)}
              />
            </Field>
            <Field label="Business tax ID / BIN">
              <input
                className={inputClass}
                value={form.taxId}
                onChange={(e) => set('taxId', e.target.value)}
              />
            </Field>
            <div className="space-y-3 self-end">
              <Toggle
                checked={form.pricesIncludeTax}
                onChange={(v) => set('pricesIncludeTax', v)}
                label="Prices include tax"
                description="Catalog prices already contain tax"
              />
              <Toggle
                checked={form.shippingTaxable}
                onChange={(v) => set('shippingTaxable', v)}
                label="Tax shipping"
                description="Apply tax on shipping charges"
              />
            </div>
          </div>

          {form.taxEnabled && (
            <div className="mt-4 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-600">
              On a {formatted} order, estimated {form.taxName}:{' '}
              <strong className="text-gray-900">
                {form.currencyPosition === 'before' ? `${form.currencySymbol} ` : ''}
                {taxAmount.toFixed(Number(form.decimalPlaces) || 0)}
                {form.currencyPosition === 'after' ? ` ${form.currencySymbol}` : ''}
              </strong>
            </div>
          )}
        </SettingsSection>
      </div>

      <SaveBar saving={saving} onSave={handleSave} onReset={() => setForm(DEFAULTS)} />
    </div>
  );
}
