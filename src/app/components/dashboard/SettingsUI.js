"use client";

/**
 * Shared premium shell for settings pages (UI-only, no backend).
 */
export function SettingsPageHeader({ title, description, badge }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
          {badge && (
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

export function SettingsSection({ title, description, children, action }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Field({ label, hint, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">{hint}</p>}
    </div>
  );
}

export const inputClass =
  'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-shadow';

export const selectClass = `${inputClass} appearance-none`;

export function Toggle({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-4 text-left py-1"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-black' : 'bg-gray-200'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  );
}

export function SaveBar({ onSave, onReset, saving }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-1 mt-6">
      <div className="bg-white/90 backdrop-blur border border-gray-100 rounded-2xl shadow-lg px-4 py-3 flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500 hidden sm:block">
          Preview mode — changes stay on this device until backend is connected.
        </p>
        <div className="flex items-center gap-2 ml-auto">
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl border border-gray-200"
            >
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-white bg-black hover:bg-gray-800 rounded-xl disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4">
      <div className="flex items-center gap-2 text-gray-500 mb-2">
        {Icon && <Icon className="w-4 h-4" />}
        <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-lg font-semibold text-gray-900 tabular-nums">{value}</p>
    </div>
  );
}
