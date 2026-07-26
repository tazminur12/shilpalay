"use client";

import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import {
  Shield,
  KeyRound,
  Smartphone,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
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
  twoFactorRequired: false,
  sessionTimeout: 60,
  passwordMinLength: 8,
  requireStrongPassword: true,
  loginAlertEmail: true,
  lockoutEnabled: true,
  maxFailedAttempts: 5,
};

const MOCK_LOGS = [
  {
    id: 1,
    time: '2026-07-26 18:42',
    actor: 'admin@shilpalay.com',
    action: 'Signed in',
    ip: '103.xx.xx.21',
    status: 'success',
  },
  {
    id: 2,
    time: '2026-07-26 17:10',
    actor: 'ops@shilpalay.com',
    action: 'Updated role permissions',
    ip: '103.xx.xx.44',
    status: 'success',
  },
  {
    id: 3,
    time: '2026-07-26 15:03',
    actor: 'unknown@mail.com',
    action: 'Failed login attempt',
    ip: '45.xx.xx.90',
    status: 'failed',
  },
  {
    id: 4,
    time: '2026-07-26 12:28',
    actor: 'admin@shilpalay.com',
    action: 'Changed invoice settings',
    ip: '103.xx.xx.21',
    status: 'success',
  },
  {
    id: 5,
    time: '2026-07-25 22:14',
    actor: 'system',
    action: 'Session expired for 3 users',
    ip: '—',
    status: 'info',
  },
];

export default function SecurityLogsPage() {
  const [form, setForm] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const logs = useMemo(() => {
    if (filter === 'all') return MOCK_LOGS;
    return MOCK_LOGS.filter((l) => l.status === filter);
  }, [filter]);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    Swal.fire({
      icon: 'success',
      title: 'Saved (preview)',
      text: 'Security settings UI saved locally. Connect an API to persist.',
      timer: 1800,
      showConfirmButton: false,
    });
  };

  return (
    <div className="max-w-5xl">
      <SettingsPageHeader
        title="Security & Logs"
        description="Access controls, password policy and recent admin activity"
        badge="UI preview"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <StatPill
          icon={Shield}
          label="2FA"
          value={form.twoFactorRequired ? 'Required' : 'Optional'}
        />
        <StatPill icon={Clock} label="Session" value={`${form.sessionTimeout} min`} />
        <StatPill
          icon={AlertTriangle}
          label="Lockout"
          value={form.lockoutEnabled ? `${form.maxFailedAttempts} tries` : 'Off'}
        />
      </div>

      <div className="space-y-5">
        <SettingsSection title="Access security" description="How admins sign in and stay signed in">
          <div className="space-y-4">
            <Toggle
              checked={form.twoFactorRequired}
              onChange={(v) => set('twoFactorRequired', v)}
              label="Require two-factor authentication"
              description="All dashboard users must verify with an authenticator app"
            />
            <Toggle
              checked={form.loginAlertEmail}
              onChange={(v) => set('loginAlertEmail', v)}
              label="Email login alerts"
              description="Notify admins when a new device signs in"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <Field label="Session timeout (minutes)" hint="Idle users are signed out automatically">
                <div className="relative">
                  <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min={5}
                    className={`${inputClass} pl-10`}
                    value={form.sessionTimeout}
                    onChange={(e) => set('sessionTimeout', Number(e.target.value) || 5)}
                  />
                </div>
              </Field>
              <Field label="Password minimum length">
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min={6}
                    className={`${inputClass} pl-10`}
                    value={form.passwordMinLength}
                    onChange={(e) => set('passwordMinLength', Number(e.target.value) || 6)}
                  />
                </div>
              </Field>
            </div>
            <Toggle
              checked={form.requireStrongPassword}
              onChange={(v) => set('requireStrongPassword', v)}
              label="Strong password rule"
              description="Require uppercase, number and special character"
            />
          </div>
        </SettingsSection>

        <SettingsSection title="Brute-force protection">
          <div className="space-y-4">
            <Toggle
              checked={form.lockoutEnabled}
              onChange={(v) => set('lockoutEnabled', v)}
              label="Temporary account lockout"
              description="Lock account after repeated failed sign-ins"
            />
            <Field label="Max failed attempts">
              <div className="relative max-w-xs">
                <Smartphone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min={3}
                  disabled={!form.lockoutEnabled}
                  className={`${inputClass} pl-10 disabled:bg-gray-50`}
                  value={form.maxFailedAttempts}
                  onChange={(e) => set('maxFailedAttempts', Number(e.target.value) || 3)}
                />
              </div>
            </Field>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Activity log"
          description="Sample audit trail — will connect to real events later"
          action={
            <select
              className={`${selectClass} w-auto py-1.5 text-xs`}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="info">Info</option>
            </select>
          }
        >
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <th className="pb-3 font-medium px-1">Time</th>
                  <th className="pb-3 font-medium px-1">Actor</th>
                  <th className="pb-3 font-medium px-1">Action</th>
                  <th className="pb-3 font-medium px-1">IP</th>
                  <th className="pb-3 font-medium px-1 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <tr key={log.id} className="text-gray-700">
                    <td className="py-3 px-1 whitespace-nowrap text-gray-500 tabular-nums">
                      {log.time}
                    </td>
                    <td className="py-3 px-1">{log.actor}</td>
                    <td className="py-3 px-1">{log.action}</td>
                    <td className="py-3 px-1 text-gray-500 font-mono text-xs">{log.ip}</td>
                    <td className="py-3 px-1 text-right">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                          log.status === 'success'
                            ? 'bg-emerald-50 text-emerald-700'
                            : log.status === 'failed'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {log.status === 'success' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : log.status === 'failed' ? (
                          <XCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SettingsSection>
      </div>

      <SaveBar saving={saving} onSave={handleSave} onReset={() => setForm(DEFAULTS)} />
    </div>
  );
}
