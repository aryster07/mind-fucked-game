import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';

const TUTORIAL_STEPS = [
    {
        title: '🎯 Welcome to Mind F**ked!',
        content: 'A memory-based card game where the LOWEST score wins! Memorize your cards, use power-ups strategically, and outsmart your opponents.',
        image: '🎴'
    },
    {
        title: '🎲 Setup Phase',
        content: 'You start with 4 cards face up for 8 seconds. MEMORIZE them! Then they flip face down and the game begins.',
        image: '👀'
    },
    {
        title: '🔄 How to Play',
        content: 'On your turn:\n1. THROW one of your cards to the discard pile\n2. DRAW a new card (from deck or discard)\n3. Place it in any empty slot',
        image: '🎯'
    },
    {
        title: '⚡ Power-Ups',
        content: 'When you THROW these cards:\n• 7 - Peek & rearrange your cards\n• 9 - Swap your own cards\n• Jack - Shuffle opponent\'s hand\n• King - Spy on opponent\'s card',
        image: '✨'
    },
    {
        title: '🏆 Winning',
        content: 'Call SHOW when you think you have the lowest score (≤10). If you\'re right, you WIN! If not, you LOSE. Lowest total score wins!',
        image: '👑'
    },
    {
        title: '💰 Rewards',
        content: 'Win games to earn coins and XP! Level up to unlock cosmetics in the shop. Complete daily rewards for bonus tokens!',
        image: '🎁'
    }
];

const Tutorial = ({ onComplete }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        // Check if user has seen tutorial
        const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
        if (!hasSeenTutorial) {
            setIsVisible(true);
        }
    }, []);

    const handleSkip = () => {
        localStorage.setItem('hasSeenTutorial', 'true');
        setIsVisible(false);
        onComplete?.();
    };

    const handleNext = () => {
        if (currentStep < TUTORIAL_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleSkip();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    if (!isVisible) return null;

    const step = TUTORIAL_STEPS[currentStep];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-purple-500/30 shadow-2xl max-w-lg w-full overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 relative">
                        <button
                            onClick={handleSkip}
                            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-black text-white pr-8">
                            {step.title}
                        </h2>
                        <div className="text-white/60 text-sm mt-1">
                            Step {currentStep + 1} of {TUTORIAL_STEPS.length}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <div className="text-8xl mb-4">{step.image}</div>
                        </div>
                        
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                            <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                                {step.content}
                            </p>
                        </div>

                        {/* Progress Dots */}
                        <div className="flex justify-center gap-2 mt-6">
                            {TUTORIAL_STEPS.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-2 h-2 rounded-full transition-all ${
                                        idx === currentStep
                                            ? 'bg-purple-500 w-8'
                                            : idx < currentStep
                                            ? 'bg-purple-600/50'
                                            : 'bg-slate-700'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-700 flex justify-between items-center">
                        <button
                            onClick={handleSkip}
                            className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
                        >
                            Skip Tutorial
                        </button>

                        <div className="flex gap-2">
                            {currentStep > 0 && (
                                <button
                                    onClick={handlePrev}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-semibold transition-all flex items-center gap-1"
                                >
                                    <ChevronLeft size={18} />
                                    Back
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg text-white font-bold transition-all flex items-center gap-1"
                            >
                                {currentStep === TUTORIAL_STEPS.length - 1 ? (
                                    <>
                                        <Trophy size={18} />
                                        Start Playing
                                    </>
                                ) : (
                                    <>
                                        Next
                                        <ChevronRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default Tutorial;
