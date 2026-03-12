import { motion } from 'framer-motion';
import { getCardLabel, getSuitSymbol, getSuitColor, Suit } from '@/types/game';

interface CardProps {
  value?: number;
  suit?: Suit;
  faceUp?: boolean;
  selected?: boolean;
  onClick?: () => void;
  small?: boolean;
  glowing?: boolean;
}

export default function Card({
  value,
  suit,
  faceUp = false,
  selected = false,
  onClick,
  small = false,
  glowing = false,
}: CardProps) {
  const w = small ? 'w-14 h-20' : 'w-20 h-28 sm:w-24 sm:h-34';
  const textSize = small ? 'text-xs' : 'text-sm sm:text-base';

  return (
    <motion.div
      className={`relative cursor-pointer ${w}`}
      style={{ perspective: 800 }}
      onClick={onClick}
      whileHover={onClick ? { y: -4 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: faceUp ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Card Back */}
        <div
          className={`
            absolute inset-0 rounded-xl border-2
            ${selected ? 'border-emerald-400 shadow-lg shadow-emerald-400/30' : 'border-white/20'}
            ${glowing ? 'shadow-lg shadow-amber-400/40 border-amber-400/60' : ''}
            bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950
            flex items-center justify-center
          `}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="w-[70%] h-[75%] border border-white/10 rounded-lg flex items-center justify-center">
            <div className="text-white/20 text-2xl font-bold">M</div>
          </div>
        </div>

        {/* Card Face */}
        <div
          className={`
            absolute inset-0 rounded-xl border-2
            ${selected ? 'border-emerald-400 shadow-lg shadow-emerald-400/30' : 'border-gray-300'}
            bg-white flex flex-col justify-between p-1.5 sm:p-2
          `}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {value !== undefined && suit ? (
            <>
              <div
                className={`${textSize} font-bold leading-none ${
                  getSuitColor(suit) === 'red' ? 'text-red-600' : 'text-gray-900'
                }`}
              >
                <div>{getCardLabel(value)}</div>
                <div className="text-[0.7em]">{getSuitSymbol(suit)}</div>
              </div>
              <div
                className={`text-center ${small ? 'text-lg' : 'text-2xl sm:text-3xl'} ${
                  getSuitColor(suit) === 'red' ? 'text-red-600' : 'text-gray-900'
                }`}
              >
                {getSuitSymbol(suit)}
              </div>
              <div
                className={`${textSize} font-bold leading-none self-end rotate-180 ${
                  getSuitColor(suit) === 'red' ? 'text-red-600' : 'text-gray-900'
                }`}
              >
                <div>{getCardLabel(value)}</div>
                <div className="text-[0.7em]">{getSuitSymbol(suit)}</div>
              </div>
            </>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}
