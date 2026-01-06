
import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import PlayerHand from './PlayerHand';
import Card from './Card';
import MainMenu from './MainMenu';
import Lobby from './Lobby';
import GameLog from './GameLog';
import PowerupGuide from './PowerupGuide';
import HowToPlay from './HowToPlay';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { subscribeToRoom, sendChatMessage } from '../services/firebase/room.service';
import { getHint } from '../services/game/ai.service';

const GameBoard = () => {
    const { state, startGameSolo, dispatch } = useGame();
    const { status, players, deck, discardPile, notification, turnIndex, roomCode, currentUserId } = state;
    
    const [logs, setLogs] = useState([]);
    const [hint, setHint] = useState(null);
    const [countdown, setCountdown] = useState(null);

    const displayPlayers = (() => {
        const withIndex = players.map((p, idx) => ({ player: p, originalIndex: idx }));
        const meIndex = players.findIndex(p => p.id === currentUserId);
        if (meIndex > 0) {
            const copy = [...withIndex];
            const me = copy.splice(meIndex, 1)[0];
            return [me, ...copy];
        }
        return withIndex;
    })();

    // Subscribe to multiplayer updates (chat + remote game state)
    useEffect(() => {
        if (!roomCode) return;

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

            // Waiting room: keep players list fresh
            if (roomData.status === 'waiting') {
                dispatch({ type: 'UPDATE_STATE', payload: { players: roomData.players || [], roomCode } });
            }

            // Playing: apply remote game state when present
            if (roomData.status === 'playing' && roomData.gameState) {
                dispatch({
                    type: 'APPLY_REMOTE_STATE',
                    payload: { gameState: roomData.gameState, currentUserId, isHost: roomData.host === currentUserId }
                });
            }
        });

        return () => unsubscribe();
    }, [roomCode, currentUserId, dispatch]);

    // Countdown timer for PRE_GAME based on shared preGameEndsAt
    useEffect(() => {
        if (status !== 'PRE_GAME' || !state.preGameEndsAt) {
            setCountdown(null);
            return;
        }

        const update = () => {
            const remainingMs = state.preGameEndsAt - Date.now();
            const next = Math.max(0, Math.ceil(remainingMs / 1000));
            setCountdown(next);
            if (next <= 0 && state.isHost) {
                dispatch({ type: 'START_GAME_PLAY' });
            }
        };

        update();
        const timer = setInterval(update, 250);
        return () => clearInterval(timer);
    }, [status, state.preGameEndsAt, state.isHost, dispatch]);

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
        const username = localStorage.getItem('username') || 'Player';
        if (roomCode) {
            await sendChatMessage(roomCode, 'user-' + username, username, message);
        } else {
            // Local chat (for solo mode)
            setLogs(prev => [...prev, {
                type: 'chat',
                timestamp: Date.now(),
                player: username,
                message
            }]);
        }
    };

    return (
        <div className="relative w-full h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden flex items-center justify-center">
            {/* How to Play Button */}
            <HowToPlay />
            
            {/* Screens */}
            {status === 'MENU' && <div className="absolute inset-0 flex items-center justify-center z-50"><MainMenu /></div>}
            {status === 'LOBBY' && <div className="absolute inset-0 flex items-center justify-center z-50 p-4"><Lobby /></div>}

            {/* Powerup Guide */}
            {(status === 'PRE_GAME' || status === 'PLAYING' || status === 'GAME_OVER') && <PowerupGuide />}

            {/* Countdown Overlay */}
            {status === 'PRE_GAME' && countdown !== null && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center"
                    >
                        <div className="text-white text-2xl mb-4">Memorize your cards!</div>
                        <motion.div
                            key={countdown}
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="text-9xl font-black text-purple-400"
                        >
                            {countdown}
                        </motion.div>
                        <div className="text-slate-400 mt-4">Cards will flip face down...</div>
                    </motion.div>
                </div>
            )}

            {/* Hint Tooltip */}
            <AnimatePresence>
                {hint && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-20 left-1/2 -translate-x-1/2 bg-purple-600/95 backdrop-blur-lg text-white px-6 py-3 rounded-xl shadow-2xl border border-purple-400 z-50 max-w-md"
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

            {/* Top Status Bar */}
            {status !== 'MENU' && status !== 'LOBBY' && (
                <div className="absolute top-0 left-0 right-0 p-4 bg-slate-800/80 backdrop-blur-lg border-b border-slate-700 z-40">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
                        <div className="text-white font-semibold text-sm md:text-base">{notification}</div>

                        <div className="flex gap-2 items-center">
                            {/* Call Show Button */}
                            {status === 'PLAYING' && turnIndex === players.findIndex(p => p.id === currentUserId) && (
                                (() => {
                                    const user = players.find(p => p.id === currentUserId) || players[0];
                                    const score = user.hand.reduce((sum, c) => sum + (c ? c.value : 0), 0);
                                    if (score <= 10) {
                                        return (
                                            <button
                                                onClick={() => dispatch({ type: 'CALL_SHOW', payload: { playerIndex: 0 } })}
                                                className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-lg text-white font-bold shadow-lg transition-all"
                                            >
                                                CALL SHOW ({score})
                                            </button>
                                        );
                                    }
                                    return <span className="text-sm text-slate-400">Score: {score}</span>;
                                })()
                            )}

                            {status === 'GAME_OVER' && (
                                <>
                                    <div className="px-4 py-2 bg-purple-600/20 border border-purple-500 rounded-lg text-purple-400 font-bold">
                                        Winner: {state.winner === 'user' ? 'YOU' : state.winner}
                                    </div>
                                    <button
                                        onClick={startGameSolo}
                                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-lg text-white font-bold transition-all"
                                    >
                                        Play Again
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Game Area */}
            {(status === 'PRE_GAME' || status === 'PLAYING' || status === 'GAME_OVER') && (
                <div className="w-full h-full flex">
                    {/* Main Game Area */}
                    <div className="flex-1 relative flex items-center justify-center p-4 md:p-8">
                        <div className="relative w-full h-full max-w-6xl mx-auto">
                            {/* Position players around table */}
                            {displayPlayers.map(({ player, originalIndex }, idx) => {
                                const isYou = player.id === currentUserId;
                                const totalPlayers = displayPlayers.length;

                                // Position logic for 2-6 players, current user always index 0 (bottom)
                                const seatLayouts = {
                                    2: ['bottom', 'top'],
                                    3: ['bottom', 'left', 'right'],
                                    4: ['bottom', 'top', 'left', 'right'],
                                    5: ['bottom', 'top-left', 'top', 'top-right', 'right'],
                                    6: ['bottom', 'top-left', 'top', 'top-right', 'right', 'left'],
                                };
                                const layout = seatLayouts[totalPlayers] || seatLayouts[4];
                                const position = layout[idx] || 'bottom';

                                const positionStyles = {
                                    bottom: "absolute bottom-4 left-1/2 -translate-x-1/2",
                                    top: "absolute top-20 left-1/2 -translate-x-1/2",
                                    left: "absolute left-4 top-1/2 -translate-y-1/2",
                                    right: "absolute right-4 top-1/2 -translate-y-1/2",
                                    'top-left': "absolute top-24 left-8",
                                    'top-right': "absolute top-24 right-8",
                                    'bottom-left': "absolute bottom-20 left-8",
                                    'bottom-right': "absolute bottom-20 right-8",
                                };

                                const isTurn = turnIndex === originalIndex;

                                return (
                                    <div key={player.id} className={positionStyles[position]}>
                                        <div className="flex flex-col items-center gap-2">
                                            {position !== 'bottom' && (
                                                <div className={clsx(
                                                    "px-4 py-2 rounded-lg bg-slate-800/95 backdrop-blur-lg border text-white font-semibold text-sm transition-all",
                                                    isTurn ? "border-purple-500 ring-2 ring-purple-500/50" : "border-slate-600"
                                                )}>
                                                    {player.name} {player.isYou && ' (You)'} {state.status === 'GAME_OVER' && <span className="text-purple-400 ml-2">Score: {player.score}</span>}
                                                </div>
                                            )}
                                            
                                            <div className={clsx(
                                                "flex gap-1.5",
                                                (position === 'left' || position === 'right') && "flex-col",
                                                (position.includes('top') || position.includes('bottom')) && "flex-row"
                                            )}>
                                                {player.hand.map((card, cardIdx) => {
                                                    const isInteractable = isTurn && state.status === 'PLAYING' && card && state.turnPhase === 'THROW' && isYou;
                                                    
                                                    if (!card) {
                                                        return (
                                                            <div key={cardIdx} className={clsx(
                                                                "bg-slate-900/30 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center",
                                                                position === 'bottom' ? "w-14 h-20 md:w-16 md:h-24" : "w-10 h-14"
                                                            )}>
                                                                <span className="text-slate-600 text-xs">Empty</span>
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <div
                                                            key={cardIdx}
                                                            onClick={() => isInteractable && dispatch({ type: 'THROW_CARD', payload: { playerIndex: originalIndex, cardIndex: cardIdx } })}
                                                            className={clsx(
                                                                "transition-all",
                                                                position === 'bottom' ? "w-14 h-20 md:w-16 md:h-24" : "w-10 h-14",
                                                                isInteractable && "cursor-pointer hover:scale-110 hover:-translate-y-2"
                                                            )}
                                                        >
                                                            {isYou && card.faceUp ? (
                                                                <Card card={card} />
                                                            ) : (
                                                                <div className="w-full h-full bg-slate-700 rounded border border-slate-600 flex items-center justify-center text-white text-xs">
                                                                    ?
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {position === 'bottom' && (
                                                <div className={clsx(
                                                    "px-4 py-2 rounded-lg bg-slate-800/95 backdrop-blur-lg border text-white font-semibold transition-all",
                                                    isTurn ? "border-purple-500 ring-2 ring-purple-500/50" : "border-slate-600"
                                                )}>
                                                    {player.name} (You) {state.status === 'GAME_OVER' && <span className="text-purple-400 ml-2">Score: {player.score}</span>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Center: Deck & Discard */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-8">
                                {/* Deck */}
                                <div className="relative">
                                    <div className="text-slate-400 text-xs mb-2 text-center">DECK</div>
                                    <div className="w-20 h-28 md:w-24 md:h-36 bg-slate-800/95 backdrop-blur-lg rounded-xl border-2 border-slate-600 shadow-xl flex items-center justify-center">
                                        {deck.length > 0 && (
                                            <div className="text-3xl text-white/40 font-bold">{deck.length}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Discard Pile */}
                                <div className="relative">
                                    <div className="text-slate-400 text-xs mb-2 text-center">DISCARD</div>
                                    <div className="w-20 h-28 md:w-24 md:h-36 bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-600 flex items-center justify-center">
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
                            </div>
                        </div>
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
                </div>
            )}
        </div>
    );
};

export default GameBoard;
