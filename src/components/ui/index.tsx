'use client';
import React from 'react';
import { PAYMENT_COLORS } from '@/lib/format';

// ── Button ────────────────────────────────────
type BtnVariant = 'primary' | 'success' | 'danger' | 'ghost' | 'warning';
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
export const Button: React.FC<BtnProps> = ({
  variant = 'primary', loading, size = 'md', children, className = '', disabled, ...rest
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3.5 text-base' };
  const variants: Record<BtnVariant, string> = {
    primary: 'bg-yellow-400 hover:bg-yellow-300 text-black',
    success: 'bg-green-500  hover:bg-green-400  text-white',
    danger:  'bg-red-500    hover:bg-red-400    text-white',
    warning: 'bg-orange-500 hover:bg-orange-400 text-white',
    ghost:   'bg-white/10   hover:bg-white/20   text-white border border-white/20',
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} disabled={disabled || loading} {...rest}>
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
};

// ── Spinner ───────────────────────────────────
export const Spinner: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <div style={{ width: size, height: size }}
    className="border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto" />
);

// ── Badge ─────────────────────────────────────
export const Badge: React.FC<{ label: string; color?: string; bg?: string }> = ({ label, color = '#f5c518', bg }) => (
  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold border"
    style={{ color, background: bg ?? color + '22', borderColor: color + '55' }}>
    {label}
  </span>
);

// ── StatusBadge ───────────────────────────────
const STATUS_MAP = {
  PENDING:   { label: 'En attente', color: '#facc15' },
  PAID:      { label: 'Payé',       color: '#60a5fa' },
  COMPLETED: { label: 'Complété',   color: '#4ade80' },
  CANCELLED: { label: 'Annulé',     color: '#f87171' },
  DISPUTE:   { label: 'Litige',     color: '#fb923c' },
} as const;
export const StatusBadge: React.FC<{ status: keyof typeof STATUS_MAP }> = ({ status }) => {
  const { label, color } = STATUS_MAP[status] ?? { label: status, color: '#999' };
  return <Badge label={label} color={color} />;
};

// ── PaymentBadge ──────────────────────────────
export const PaymentBadge: React.FC<{ method: string }> = ({ method }) => {
  const color = PAYMENT_COLORS[method] ?? '#888';
  return <Badge label={method} color={color} />;
};

// ── ReputationBadge ───────────────────────────
export const ReputationBadge: React.FC<{ rep: number; trades: number; verified?: boolean }> = ({ rep, trades, verified }) => (
  <div className="flex items-center gap-1.5 text-xs">
    {verified && <span title="Vérifié" className="text-blue-400">✓</span>}
    <span className={rep >= 95 ? 'text-green-400' : rep >= 80 ? 'text-yellow-400' : 'text-red-400'}>
      {rep.toFixed(1)}%
    </span>
    <span className="text-gray-400">({trades} trades)</span>
  </div>
);

// ── Modal ─────────────────────────────────────
export const Modal: React.FC<{ open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }> = ({ open, onClose, title, children, wide }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className={`bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// ── Input ─────────────────────────────────────
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }> = ({ label, error, className = '', ...rest }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</label>}
    <input className={`w-full bg-white/5 border ${error ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 outline-none focus:border-yellow-400 transition-colors ${className}`} {...rest} />
    {error && <span className="text-xs text-red-400">{error}</span>}
  </div>
);

// ── Select ────────────────────────────────────
export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }> = ({ label, children, className = '', ...rest }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</label>}
    <select className={`w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-yellow-400 transition-colors ${className}`} {...rest}>
      {children}
    </select>
  </div>
);

// ── Alert ─────────────────────────────────────
type AlertType = 'error' | 'warning' | 'info' | 'success';
export const Alert: React.FC<{ type?: AlertType; children: React.ReactNode }> = ({ type = 'info', children }) => {
  const styles: Record<AlertType, string> = {
    error:   'bg-red-500/10    border-red-500/30    text-red-400',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    info:    'bg-blue-500/10   border-blue-500/30   text-blue-400',
    success: 'bg-green-500/10  border-green-500/30  text-green-400',
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles[type]}`}>{children}</div>
  );
};
