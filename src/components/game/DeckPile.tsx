import { motion } from 'framer-motion';

interface DeckPileProps {
  remaining: number;
  onClick?: () => void;
  disabled?: boolean;
}

export default function DeckPile({ remaining, onClick, disabled }: DeckPileProps) {
  return (
    <motion.button
      className={`
        relative w-20 h-28 sm:w-24 sm:h-34 rounded-xl
        bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950
        border-2 border-white/20
        flex items-center justify-center
        ${!disabled ? 'hover:border-emerald-400/60 hover:shadow-lg hover:shadow-emerald-400/20 cursor-pointer' : 'opacity-60 cursor-not-allowed'}
        transition-all duration-200
      `}
      onClick={!disabled ? onClick : undefined}
      whileHover={!disabled ? { scale: 1.05 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
    >
      <div className="text-center">
        <div className="text-white/30 text-2xl font-bold">M</div>
        <div className="text-white/50 text-xs mt-1">{remaining}</div>
      </div>
      {/* Stacked card effect */}
      <div className="absolute inset-0 rounded-xl border border-white/10 bg-indigo-950 -z-10 translate-x-0.5 translate-y-0.5" />
      <div className="absolute inset-0 rounded-xl border border-white/5 bg-indigo-950 -z-20 translate-x-1 translate-y-1" />
    </motion.button>
  );
}
