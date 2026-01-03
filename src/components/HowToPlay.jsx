import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen } from 'lucide-react';

const HowToPlay = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* How to Play Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-4 right-4 z-50 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white font-semibold transition-all flex items-center gap-2"
            >
                <BookOpen size={18} />
                How to Play
            </button>

            {/* Tutorial Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-slate-800/95 backdrop-blur-lg rounded-2xl border border-slate-700 p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                                    <BookOpen className="text-purple-400" />
                                    How to Play
                                </h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-slate-400 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6 text-slate-300">
                                {/* Objective */}
                                <div>
                                    <h3 className="text-xl font-bold text-purple-400 mb-2">🎯 Objective</h3>
                                    <p>Get the lowest score by the end of the game. Each card has a value - try to keep low-value cards!</p>
                                </div>

                                {/* Setup */}
                                <div>
                                    <h3 className="text-xl font-bold text-purple-400 mb-2">🃏 Setup</h3>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Each player gets 4 cards face down</li>
                                        <li>You get 8 seconds to memorize your cards</li>
                                        <li>After the countdown, all cards flip face down</li>
                                        <li>Remember where your cards are!</li>
                                    </ul>
                                </div>

                                {/* Gameplay */}
                                <div>
                                    <h3 className="text-xl font-bold text-purple-400 mb-2">🎮 How to Play</h3>
                                    <ol className="list-decimal list-inside space-y-2">
                                        <li><strong>Throw a card:</strong> Click one of your cards to discard it</li>
                                        <li><strong>Draw a card:</strong> Take from the deck or discard pile</li>
                                        <li><strong>Replace:</strong> The new card goes where you threw from</li>
                                        <li><strong>Next turn:</strong> Play passes to the next player</li>
                                    </ol>
                                </div>

                                {/* Card Values */}
                                <div>
                                    <h3 className="text-xl font-bold text-purple-400 mb-2">💎 Card Values</h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="bg-slate-900/50 p-2 rounded">King (K) = <span className="text-yellow-400">0 points</span></div>
                                        <div className="bg-slate-900/50 p-2 rounded">Ace (A) = 1 point</div>
                                        <div className="bg-slate-900/50 p-2 rounded">2-10 = Face value</div>
                                        <div className="bg-slate-900/50 p-2 rounded">Jack (J) = 11 points</div>
                                        <div className="bg-slate-900/50 p-2 rounded">Queen (Q) = 12 points</div>
                                        <div className="bg-slate-900/50 p-2 rounded">Joker = 13 points</div>
                                    </div>
                                </div>

                                {/* Power Cards */}
                                <div>
                                    <h3 className="text-xl font-bold text-purple-400 mb-2">⚡ Power Cards</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="bg-slate-900/50 p-2 rounded">
                                            <strong className="text-yellow-400">7-8:</strong> Peek at any opponent's card
                                        </div>
                                        <div className="bg-slate-900/50 p-2 rounded">
                                            <strong className="text-blue-400">9-10:</strong> Swap with opponent's card
                                        </div>
                                        <div className="bg-slate-900/50 p-2 rounded">
                                            <strong className="text-green-400">Jack (J):</strong> Swap two of your cards
                                        </div>
                                        <div className="bg-slate-900/50 p-2 rounded">
                                            <strong className="text-purple-400">Queen (Q):</strong> Peek at your own card
                                        </div>
                                    </div>
                                </div>

                                {/* Calling Show */}
                                <div>
                                    <h3 className="text-xl font-bold text-purple-400 mb-2">🏆 Calling Show</h3>
                                    <p>When your total score is <strong className="text-green-400">10 or less</strong>, you can call SHOW to end the game immediately. The player with the lowest score wins!</p>
                                </div>

                                {/* Tips */}
                                <div>
                                    <h3 className="text-xl font-bold text-purple-400 mb-2">💡 Pro Tips</h3>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Try to remember which cards are where</li>
                                        <li>Get rid of high-value cards (J, Q, Joker)</li>
                                        <li>Use power cards strategically</li>
                                        <li>Watch what cards opponents throw away</li>
                                        <li>Call SHOW when you have a good hand!</li>
                                    </ul>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full mt-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-xl text-white font-bold transition-all"
                            >
                                Got it!
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default HowToPlay;
