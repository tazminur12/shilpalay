"use client";

import { useState } from 'react';
import Swal from 'sweetalert2';
import { Globe, Mail, Phone, MapPin, Link2 } from 'lucide-react';
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
  storeName: 'Shilpalay',
  tagline: 'Fashion & Lifestyle',
  supportEmail: 'support@shilpalay.com',
  supportPhone: '+880 1700-000000',
  address: 'Dhaka, Bangladesh',
  timezone: 'Asia/Dhaka',
  language: 'en',
  maintenanceMode: false,
  allowGuestCheckout: true,
  showOutOfStock: true,
  metaTitle: 'Shilpalay - Fashion & Lifestyle E-commerce',
  metaDescription:
    'Discover authentic fashion, home décor, jewellery and lifestyle products at Shilpalay.',
};

export default function SiteSettingsPage() {
  const [form, setForm] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    Swal.fire({
      icon: 'success',
      title: 'Saved (preview)',
      text: 'Site settings UI saved locally. Connect an API to persist.',
      timer: 1800,
      showConfirmButton: false,
    });
  };

  return (
    <div className="max-w-5xl">
      <SettingsPageHeader
        title="Site Settings"
        description="Store identity, contact details and storefront behaviour"
        badge="UI preview"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <StatPill icon={Globe} label="Store" value={form.storeName || '—'} />
        <StatPill icon={Mail} label="Support email" value={form.supportEmail || '—'} />
        <StatPill icon={Phone} label="Hotline" value={form.supportPhone || '—'} />
      </div>

      <div className="space-y-5">
        <SettingsSection
          title="General"
          description="Basic storefront information shown across the site"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Store name">
              <input
                className={inputClass}
                value={form.storeName}
                onChange={(e) => set('storeName', e.target.value)}
              />
            </Field>
            <Field label="Tagline">
              <input
                className={inputClass}
                value={form.tagline}
                onChange={(e) => set('tagline', e.target.value)}
              />
            </Field>
            <Field label="Timezone">
              <select
                className={selectClass}
                value={form.timezone}
                onChange={(e) => set('timezone', e.target.value)}
              >
                <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                <option value="UTC">UTC</option>
                <option value="Asia/Kolkata">Asia/Kolkata</option>
              </select>
            </Field>
            <Field label="Default language">
              <select
                className={selectClass}
                value={form.language}
                onChange={(e) => set('language', e.target.value)}
              >
                <option value="en">English</option>
                <option value="bn">বাংলা</option>
              </select>
            </Field>
          </div>
        </SettingsSection>

        <SettingsSection title="Contact" description="Customer-facing support channels">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Support email">
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  className={`${inputClass} pl-10`}
                  value={form.supportEmail}
                  onChange={(e) => set('supportEmail', e.target.value)}
                />
              </div>
            </Field>
            <Field label="Support phone">
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  className={`${inputClass} pl-10`}
                  value={form.supportPhone}
                  onChange={(e) => set('supportPhone', e.target.value)}
                />
              </div>
            </Field>
            <Field label="Business address" className="md:col-span-2">
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <textarea
                  rows={2}
                  className={`${inputClass} pl-10 resize-none`}
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                />
              </div>
            </Field>
          </div>
        </SettingsSection>

        <SettingsSection title="SEO defaults" description="Fallback meta tags for pages without custom SEO">
          <div className="space-y-4">
            <Field label="Default meta title" hint="Recommended under 60 characters">
              <div className="relative">
                <Link2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  className={`${inputClass} pl-10`}
                  value={form.metaTitle}
                  onChange={(e) => set('metaTitle', e.target.value)}
                />
              </div>
            </Field>
            <Field label="Default meta description" hint="Recommended under 160 characters">
              <textarea
                rows={3}
                className={`${inputClass} resize-none`}
                value={form.metaDescription}
                onChange={(e) => set('metaDescription', e.target.value)}
              />
            </Field>
          </div>
        </SettingsSection>

        <SettingsSection title="Storefront behaviour">
          <div className="divide-y divide-gray-100 space-y-0">
            <div className="py-3 first:pt-0 last:pb-0">
              <Toggle
                checked={form.maintenanceMode}
                onChange={(v) => set('maintenanceMode', v)}
                label="Maintenance mode"
                description="Show a temporary offline page to visitors"
              />
            </div>
            <div className="py-3">
              <Toggle
                checked={form.allowGuestCheckout}
                onChange={(v) => set('allowGuestCheckout', v)}
                label="Guest checkout"
                description="Allow customers to buy without creating an account"
              />
            </div>
            <div className="py-3 last:pb-0">
              <Toggle
                checked={form.showOutOfStock}
                onChange={(v) => set('showOutOfStock', v)}
                label="Show out-of-stock products"
                description="Keep sold-out items visible with an unavailable badge"
              />
            </div>
          </div>
        </SettingsSection>
      </div>

      <SaveBar
        saving={saving}
        onSave={handleSave}
        onReset={() => setForm(DEFAULTS)}
      />
    </div>
  );
}
