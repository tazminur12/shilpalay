"use client";

import { useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { Palette, Upload, Image as ImageIcon, Type, Sparkles } from 'lucide-react';
import {
  SettingsPageHeader,
  SettingsSection,
  Field,
  inputClass,
  SaveBar,
} from '@/app/components/dashboard/SettingsUI';

const DEFAULTS = {
  primaryColor: '#111111',
  accentColor: '#C45C26',
  fontDisplay: 'Playfair Display',
  fontBody: 'DM Sans',
  logoUrl: '',
  faviconUrl: '',
  loginBgUrl: '',
  footerNote: 'Copyright © 2026 Shilpalay. All rights reserved.',
};

export default function BrandingPage() {
  const [form, setForm] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const logoRef = useRef(null);
  const favRef = useRef(null);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const pickLocalPreview = (file, key) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      Swal.fire('Invalid file', 'Please choose an image.', 'warning');
      return;
    }
    const url = URL.createObjectURL(file);
    set(key, url);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    Swal.fire({
      icon: 'success',
      title: 'Saved (preview)',
      text: 'Branding UI saved locally. Connect upload/API to persist.',
      timer: 1800,
      showConfirmButton: false,
    });
  };

  return (
    <div className="max-w-5xl">
      <SettingsPageHeader
        title="Branding"
        description="Logo, colours and typography for a consistent brand feel"
        badge="UI preview"
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
        <div className="lg:col-span-3 space-y-5">
          <SettingsSection title="Logo & icons" description="Shown in header, emails and browser tab">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Primary logo</p>
                <button
                  type="button"
                  onClick={() => logoRef.current?.click()}
                  className="w-full aspect-[2/1] rounded-2xl border border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100/80 transition-colors flex flex-col items-center justify-center gap-2 overflow-hidden relative"
                >
                  {form.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.logoUrl} alt="Logo preview" className="object-contain max-h-full p-4" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-xs text-gray-500">Upload logo</span>
                    </>
                  )}
                </button>
                <input
                  ref={logoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => pickLocalPreview(e.target.files?.[0], 'logoUrl')}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Favicon</p>
                <button
                  type="button"
                  onClick={() => favRef.current?.click()}
                  className="w-full aspect-[2/1] rounded-2xl border border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100/80 transition-colors flex flex-col items-center justify-center gap-2 overflow-hidden relative"
                >
                  {form.faviconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.faviconUrl} alt="Favicon" className="h-12 w-12 object-contain" />
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-xs text-gray-500">Upload favicon</span>
                    </>
                  )}
                </button>
                <input
                  ref={favRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => pickLocalPreview(e.target.files?.[0], 'faviconUrl')}
                />
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Colour system" description="Used for buttons, accents and highlights">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Primary">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => set('primaryColor', e.target.value)}
                    className="h-11 w-14 rounded-xl border border-gray-200 cursor-pointer bg-white p-1"
                  />
                  <input
                    className={inputClass}
                    value={form.primaryColor}
                    onChange={(e) => set('primaryColor', e.target.value)}
                  />
                </div>
              </Field>
              <Field label="Accent">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.accentColor}
                    onChange={(e) => set('accentColor', e.target.value)}
                    className="h-11 w-14 rounded-xl border border-gray-200 cursor-pointer bg-white p-1"
                  />
                  <input
                    className={inputClass}
                    value={form.accentColor}
                    onChange={(e) => set('accentColor', e.target.value)}
                  />
                </div>
              </Field>
            </div>
          </SettingsSection>

          <SettingsSection title="Typography" description="Display and body font pairing">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Display font">
                <div className="relative">
                  <Type className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    className={`${inputClass} pl-10`}
                    value={form.fontDisplay}
                    onChange={(e) => set('fontDisplay', e.target.value)}
                  />
                </div>
              </Field>
              <Field label="Body font">
                <input
                  className={inputClass}
                  value={form.fontBody}
                  onChange={(e) => set('fontBody', e.target.value)}
                />
              </Field>
              <Field label="Footer note" className="sm:col-span-2">
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
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-900">Live preview</span>
            </div>
            <div
              className="p-5 min-h-[320px]"
              style={{
                background: `linear-gradient(160deg, ${form.primaryColor}08, ${form.accentColor}14)`,
              }}
            >
              <div className="rounded-xl bg-white border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: form.primaryColor }}
                    >
                      {form.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={form.logoUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        'S'
                      )}
                    </div>
                    <span
                      className="text-sm font-semibold"
                      style={{ fontFamily: form.fontDisplay, color: form.primaryColor }}
                    >
                      Shilpalay
                    </span>
                  </div>
                  <Palette className="w-4 h-4 text-gray-400" />
                </div>
                <p
                  className="text-xl font-semibold mb-2"
                  style={{ fontFamily: form.fontDisplay, color: form.primaryColor }}
                >
                  New season edit
                </p>
                <p className="text-sm text-gray-500 mb-4" style={{ fontFamily: form.fontBody }}>
                  Soft textures, warm accents and everyday luxury — crafted for your storefront.
                </p>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{ background: form.accentColor }}
                >
                  Shop now
                </button>
              </div>
              <p className="text-[11px] text-gray-500 text-center mt-4">{form.footerNote}</p>
            </div>
          </div>
        </div>
      </div>

      <SaveBar saving={saving} onSave={handleSave} onReset={() => setForm(DEFAULTS)} />
    </div>
  );
}
