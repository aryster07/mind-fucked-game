import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-white/70 mb-1.5">{label}</label>
      )}
      <input
        className={`
          w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
          text-white placeholder-white/30 outline-none
          focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30
          transition-all duration-200
          ${error ? 'border-red-500/50' : ''} ${className}
        `}
        {...props}
      />
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}
