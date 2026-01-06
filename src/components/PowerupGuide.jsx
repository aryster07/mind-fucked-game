import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronRight, ChevronLeft, Zap } from 'lucide-react';

const POWERUPS = [
    {
        value: 7,
        name: 'Seven',
        icon: '7️⃣',
        power: 'Peek & Rearrange',
        description: 'Peek at your own cards and rearrange them'
    },
    {
        value: 9,
        name: 'Nine',
        icon: '9️⃣',
        power: 'Swap Your Cards',
        description: 'Swap two of your own cards'
    },
    {
        value: 11,
        name: 'Jack',
        icon: '🃏',
        power: 'Shuffle Opponent',
        description: 'Shuffle an opponent\'s hand'
    },
    {
        value: 13,
        name: 'King',
        icon: '👑',
        power: 'Spy',
        description: 'Peek at one opponent\'s card'
    }
];

const PowerupGuide = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            initial={{ x: -300 }}
            animate={{ x: isExpanded ? 0 : -240 }}
            className="fixed left-0 top-1/2 -translate-y-1/2 z-30"
        >
            <div className="bg-slate-800/95 backdrop-blur-md border-r-2 border-t-2 border-b-2 border-purple-500/30 rounded-r-xl shadow-2xl overflow-hidden">
                {/* Toggle Button */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="absolute -right-10 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-500 p-2 rounded-r-lg shadow-lg transition-all"
                >
                    {isExpanded ? <ChevronLeft size={20} className="text-white" /> : <ChevronRight size={20} className="text-white" />}
                </button>

                {/* Content */}
                <div className="w-64 p-4">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-3">
                        <Zap className="text-purple-400" size={24} />
                        <h3 className="text-white font-bold text-lg">Power-Ups</h3>
                    </div>

                    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                        {POWERUPS.map((powerup, idx) => (
                            <motion.div
                                key={powerup.value}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-slate-900/60 p-3 rounded-lg border border-purple-500/20 hover:border-purple-500/50 transition-all"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">{powerup.icon}</span>
                                    <div>
                                        <h4 className="text-white font-bold text-sm">{powerup.name}</h4>
                                        <p className="text-purple-400 text-xs font-semibold">{powerup.power}</p>
                                    </div>
                                </div>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    {powerup.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-700">
                        <p className="text-xs text-slate-500 text-center">
                            💡 Throw these cards to activate powers!
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PowerupGuide;
