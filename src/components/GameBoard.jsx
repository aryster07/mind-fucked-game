
import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { useUser } from '../context/UserContext';
import PlayerHand from './PlayerHand';
import Card from './Card';
import MainMenu from './MainMenu';
import Lobby from './Lobby';
import Shop from './Shop';
import DailyRewards from './DailyRewards';
import GameLog from './GameLog';
import PowerupGuide from './PowerupGuide';
import Tutorial from './Tutorial';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Zap, ShoppingBag, TrendingUp, Lightbulb } from 'lucide-react';
import { subscribeToRoom, sendChatMessage } from '../services/firebase/room.service';
import { getHint } from '../services/game/ai.service';

const GameBoard = () => {
    const { state, startGameSolo, dispatch } = useGame();
    const { userData, loading: userLoading, getLevelProgress, user } = useUser();
    const { status, players, deck, discardPile, notification, turnIndex, roomCode } = state;
    
    const [showShop, setShowShop] = useState(false);
    const [logs, setLogs] = useState([]);
    const [hint, setHint] = useState(null);
    const levelProgress = getLevelProgress();

    // Subscribe to multiplayer updates
    useEffect(() => {
        if (roomCode) {
            const unsubscribe = subscribeToRoom(roomCode, (roomData) => {
                // Update logs with chat messages
                if (roomData.chat) {
                    setLogs(roomData.chat.map(msg => ({
                        type: 'chat',
                        timestamp: msg.timestamp,
                        player: msg.player,
                        message: msg.message
                    })));
                }
            });
            return () => unsubscribe();
        }
    }, [roomCode]);

    // Add game event to logs
    const addGameLog = (message) => {
        setLogs(prev => [...prev, {
            type: 'game',
            timestamp: Date.now(),
            message
        }]);
    };

    // Listen for game notifications and add to logs
    useEffect(() => {
        if (notification && status === 'PLAYING') {
            addGameLog(notification);
        }
    }, [notification, status]);

    const handleSendMessage = async (message) => {
        if (roomCode && user) {
            await sendChatMessage(roomCode, user.uid, userData?.displayName || 'Player', message);
        } else {
            // Local chat (for solo mode)
            setLogs(prev => [...prev, {
                type: 'chat',
                timestamp: Date.now(),
                player: userData?.displayName || 'You',
                message
            }]);
        }
    };

    return (
        <div className="relative w-full h-screen bg-slate-900 overflow-hidden flex flex-col items-center justify-center p-4">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-gradient-to-br from-casino-green/30 to-casino-dark pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-30 pointer-events-none"></div>

            {/* Top Bar - Currency & Level */}
            {status !== 'MENU' && status !== 'LOBBY' && !userLoading && userData && (
                <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-40">
                    {/* Left - Currency */}
                    <div className="flex gap-3">
                        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-yellow-500/30">
                            <Coins className="text-yellow-500" size={20} />
                            <span className="text-white font-bold">{userData.coins}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-purple-500/30">
                            <Zap className="text-purple-400" size={20} />
                            <span className="text-white font-bold">{userData.tokens}</span>
                        </div>
                    </div>

                    {/* Center - Level & XP */}
                    <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-gold/30">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="text-gold" size={20} />
                            <span className="text-gold font-black">LVL {userData.level}</span>
                        </div>
                        <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${levelProgress.percentage}%` }}
                                className="h-full bg-gradient-to-r from-gold to-amber-600"
                            />
                        </div>
                        <span className="text-xs text-slate-400">{Math.floor(levelProgress.percentage)}%</span>
                    </div>

                    {/* Right - Shop & Hint Buttons */}
                    <div className="flex gap-2">
                        {status === 'PLAYING' && turnIndex === 0 && state.turnPhase === 'THROW' && (
                            <button
                                onClick={() => {
                                    const userPlayer = players.find(p => p.id === 'user');
                                    if (userPlayer) {
                                        const hintResult = getHint(userPlayer.hand, discardPile);
                                        setHint(hintResult);
                                        setTimeout(() => setHint(null), 5000);
                                    }
                                }}
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-full font-bold transition-all shadow-lg"
                                title="Get a hint"
                            >
                                <Lightbulb size={20} className="text-yellow-300" />
                                HINT
                            </button>
                        )}
                        <button
                            onClick={() => setShowShop(true)}
                            className="flex items-center gap-2 bg-gold hover:bg-yellow-400 px-4 py-2 rounded-full font-bold transition-all shadow-lg"
                        >
                            <ShoppingBag size={20} />
                            SHOP
                        </button>
                    </div>
                </div>
            )}

            {/* Screens */}
            {status === 'MENU' && <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"><MainMenu /></div>}
            {status === 'LOBBY' && <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"><Lobby /></div>}

            {/* Daily Rewards */}
            {!userLoading && userData && <DailyRewards />}

            {/* Shop Modal */}
            {showShop && <Shop onClose={() => setShowShop(false)} />}

            {/* Tutorial */}
            <Tutorial />

            {/* Powerup Guide */}
            {(status === 'PRE_GAME' || status === 'PLAYING' || status === 'GAME_OVER') && <PowerupGuide />}

            {/* Hint Tooltip */}
            <AnimatePresence>
                {hint && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-32 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-2xl border-2 border-yellow-300 z-50 max-w-md"
                    >
                        <div className="flex items-start gap-3">
                            <Lightbulb className="text-yellow-300 flex-shrink-0 mt-1" size={24} />
                            <div>
                                <div className="font-bold text-lg mb-1">💡 Hint</div>
                                <div className="text-sm">{hint.reason}</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notification Bar */}
            {status !== 'MENU' && status !== 'LOBBY' && (
                <div className="absolute top-20 w-full p-2 bg-black/60 text-center text-white font-bold backdrop-blur-md z-50 flex flex-col md:flex-row items-center justify-center gap-4">
                    <span>{notification}</span>

                    {/* Call Show Button - Only visible for User if Score <= 10 */}
                    {status === 'PLAYING' && turnIndex === 0 && (
                        (() => {
                            const user = players[0];
                            const score = user.hand.reduce((sum, c) => sum + (c ? c.value : 0), 0);
                            if (score <= 10) {
                                return (
                                    <button
                                        onClick={() => dispatch({ type: 'CALL_SHOW', payload: { playerIndex: 0 } })}
                                        className="px-4 py-1 bg-gradient-to-r from-red-600 to-red-800 rounded-full text-white font-bold animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.7)] hover:scale-105 transition-transform border border-red-500"
                                    >
                                        CALL SHOW (Score: {score})
                                    </button>
                                );
                            }
                            return <span className="text-xs text-slate-500 opacity-50">(Score: {score})</span>;
                        })()
                    )}

                    {status === 'GAME_OVER' && (
                        <div className="flex gap-2 items-center">
                            <div className="px-4 py-1 bg-slate-800 rounded text-gold font-bold border border-gold">
                                Winner: {state.winner === 'user' ? 'YOU' : state.winner}
                            </div>
                            <button
                                onClick={startGameSolo}
                                className="px-4 py-1 bg-gold rounded text-black font-bold hover:bg-yellow-400"
                            >
                                Play Again
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Game Area */}
            {(status === 'PRE_GAME' || status === 'PLAYING' || status === 'GAME_OVER') && (
                <>
                    <div className="relative w-full h-full max-w-6xl mx-auto">
                        {/* Opponents */}
                        {players.filter(p => p.isBot).map((player) => (
                            <PlayerHand
                                key={player.id}
                                player={player}
                                position={player.id === 'bot-1' ? 'left' : player.id === 'bot-2' ? 'top' : 'right'}
                            />
                        ))}

                        {/* Center: Deck & Discard */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-8">
                            {/* Deck */}
                            <div className="relative w-24 h-36">
                                {deck.length > 0 && (
                                    <div className="absolute inset-0 bg-card-back rounded-lg border-2 border-slate-600 shadow-xl flex items-center justify-center transform hover:scale-105 transition-transform cursor-pointer">
                                        <div className="text-4xl text-white/20 font-bold">{deck.length}</div>
                                    </div>
                                )}
                            </div>

                            {/* Discard Pile */}
                            <div className="relative w-24 h-36 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center">
                                <AnimatePresence>
                                    {discardPile.length > 0 && (
                                        <Card
                                            key={discardPile[discardPile.length - 1].id}
                                            card={{ ...discardPile[discardPile.length - 1], faceUp: true }}
                                            className="absolute"
                                        />
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* User Hand */}
                        {players.filter(p => !p.isBot).map(player => (
                            <PlayerHand key={player.id} player={player} position="bottom" />
                        ))}
                    </div>

                    {/* Game Log Sidebar */}
                    <GameLog
                        logs={logs}
                        onSendMessage={handleSendMessage}
                        roomCode={roomCode}
                        players={players.map(p => ({
                            name: p.name || p.id,
                            online: p.isBot || true
                        }))}
                    />
                </>
            )}
        </div>
    );
};

export default GameBoard;
