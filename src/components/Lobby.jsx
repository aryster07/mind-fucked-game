
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';
import { Copy, Users, Play, ArrowLeft, Check, X } from 'lucide-react';
import { 
    createRoom, 
    joinRoom, 
    subscribeToRoom, 
    startGame,
    leaveRoom 
} from '../services/firebase/room.service';
import clsx from 'clsx';

const Lobby = () => {
    const { dispatch, hostStartOnlineGame } = useGame();
    const [username, setUsername] = useState('');
    const [userId, setUserId] = useState(() => localStorage.getItem('userId'));
    const [mode, setMode] = useState(null);
    const [roomCode, setRoomCode] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [showUsernameInput, setShowUsernameInput] = useState(false);
    const [tempUsername, setTempUsername] = useState('');
    const [action, setAction] = useState(null);

    const ensureUserId = () => {
        if (userId) return userId;
        const generated = `user-${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem('userId', generated);
        setUserId(generated);
        return generated;
    };

    useEffect(() => {
        ensureUserId();
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const urlRoomCode = urlParams.get('room');
        if (urlRoomCode) {
            setInputCode(urlRoomCode.toUpperCase());
            setAction('join');
            setShowUsernameInput(true);
        }
    }, []);

    useEffect(() => {
        if (roomCode) {
            const unsubscribe = subscribeToRoom(roomCode, (roomData) => {
                setRoom(roomData);
                if (roomData.status === 'playing') {
                    if (roomData.gameState) {
                        dispatch({
                            type: 'APPLY_REMOTE_STATE',
                            payload: { gameState: roomData.gameState, currentUserId: userId, isHost: roomData.host === userId }
                        });
                    } else if (roomData.host === userId) {
                        // Host fallback: initialize if gameState missing
                        hostStartOnlineGame(roomData.players, roomCode, userId);
                    }
                } else {
                    // Waiting room: keep players list and host flag in context
                    dispatch({ type: 'UPDATE_STATE', payload: { players: roomData.players || [], roomCode, currentUserId: userId, isHost: roomData.host === userId } });
                }
            });
            return () => unsubscribe();
        }
    }, [roomCode, dispatch, userId, hostStartOnlineGame]);

    useEffect(() => {
        return () => {
            if (roomCode && username) {
                leaveRoom(roomCode, userId || '');
            }
        };
    }, [roomCode, username, userId]);

    const handleCreateClick = () => {
        ensureUserId();
        setAction('create');
        setShowUsernameInput(true);
    };

    const handleJoinClick = () => {
        ensureUserId();
        setAction('join');
        setMode('join');
    };

    const handleUsernameSubmit = async () => {
        if (!tempUsername.trim()) {
            setError('Please enter a username');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            if (action === 'create') {
                const uid = ensureUserId();
                const code = await createRoom({
                    uid,
                    name: tempUsername,
                    online: true
                });
                setUsername(tempUsername);
                localStorage.setItem('username', tempUsername);
                setRoomCode(code);
                setMode('create');
                setShowUsernameInput(false);
            } else if (action === 'join') {
                if (!inputCode.trim()) {
                    setError('Please enter a room code');
                    setLoading(false);
                    return;
                }
                const uid = ensureUserId();
                await joinRoom(inputCode.toUpperCase(), {
                    uid,
                    name: tempUsername,
                    online: true
                });
                setUsername(tempUsername);
                localStorage.setItem('username', tempUsername);
                setRoomCode(inputCode.toUpperCase());
                setMode('join');
                setShowUsernameInput(false);
            }
        } catch (err) {
            setError(err.message || 'Failed to complete action');
        }
        setLoading(false);
    };

    const handleJoin = async () => {
        if (!inputCode.trim()) {
            setError('Please enter a room code');
            return;
        }
        setShowUsernameInput(true);
    };

    const handleStartGame = async () => {
        if (!isHost) {
            setError('Only the host can start the game');
            return;
        }
        if (room?.players?.length < 2) {
            setError('Need at least 2 players to start');
            return;
        }
        await startGame(roomCode, userId);
        // Host will initialize gameState via subscription callback when status flips to playing
    };

    const handleShareLink = () => {
        const shareUrl = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
        navigator.clipboard.writeText(shareUrl);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const handleBack = async () => {
        if (roomCode && username) {
            await leaveRoom(roomCode, userId || '');
        }
        setMode(null);
        setRoomCode('');
        setRoom(null);
        setInputCode('');
        setError('');
        setShowUsernameInput(false);
        dispatch({ type: 'UPDATE_STATE', payload: { status: 'MENU' } });
    };

    const isHost = room && room.host === userId;

    if (showUsernameInput) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md mx-auto"
            >
                <div className="bg-slate-800/95 backdrop-blur-lg rounded-2xl border border-slate-700 p-8 shadow-2xl">
                    <h3 className="text-2xl font-bold text-white mb-6 text-center">Enter Your Username</h3>
                    <input
                        type="text"
                        placeholder="Username..."
                        value={tempUsername}
                        onChange={e => setTempUsername(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleUsernameSubmit()}
                        className="w-full p-4 bg-slate-900/50 border-2 border-slate-600 focus:border-purple-500 rounded-xl text-white text-center text-lg outline-none transition-colors mb-4"
                        maxLength={15}
                        autoFocus
                    />
                    <button
                        onClick={handleUsernameSubmit}
                        disabled={loading || !tempUsername.trim()}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed rounded-xl text-white font-bold text-lg transition-all mb-3"
                    >
                        {loading ? 'Please wait...' : 'Continue'}
                    </button>
                    <button
                        onClick={() => {
                            setShowUsernameInput(false);
                            setTempUsername('');
                            setAction(null);
                            if (!roomCode) {
                                setMode(null);
                                setInputCode('');
                            }
                        }}
                        className="w-full py-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-white font-semibold transition-all"
                    >
                        Cancel
                    </button>
                    {error && (
                        <div className="mt-4 bg-red-500/20 border border-red-500/50 px-4 py-3 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}
                </div>
            </motion.div>
        );
    }

    if (roomCode && room) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full flex flex-col lg:flex-row gap-4 max-w-7xl mx-auto overflow-y-auto"
            >
                {/* Left - Share Link */}
                <div className="w-full lg:w-80 flex flex-col gap-4 flex-shrink-0">
                    <div className="bg-slate-800/95 backdrop-blur-lg rounded-2xl border border-slate-700 p-6">
                        <h3 className="text-slate-400 font-semibold mb-3 text-xs uppercase tracking-wide">Share this game</h3>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={`${window.location.origin}?room=${roomCode}`}
                                readOnly
                                className="flex-1 p-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm"
                            />
                            <button
                                onClick={handleShareLink}
                                className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                            >
                                {linkCopied ? <Check className="text-green-400" size={18} /> : <Copy className="text-white" size={18} />}
                            </button>
                        </div>
                        <div className="text-center">
                            <div className="text-slate-500 text-xs mb-2">Room Code</div>
                            <div className="bg-slate-900/50 px-4 py-2 rounded-lg inline-block">
                                <span className="text-2xl font-black text-purple-400 tracking-wider">{roomCode}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center - Game Area */}
                <div className="flex-1 bg-slate-800/95 backdrop-blur-lg rounded-2xl border border-slate-700 p-6 md:p-8 flex flex-col items-center justify-center min-h-0">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3">
                        <Users className="text-purple-400" size={28} />
                        Lobby
                    </h2>

                    <div className="w-full max-w-2xl mb-6 overflow-y-auto">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-slate-400 text-xs uppercase tracking-wide">Players ({room.players?.length || 0}/6)</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {room.players?.map((player, idx) => (
                                <div 
                                    key={idx}
                                    className={clsx(
                                        "bg-slate-900/50 p-4 rounded-xl border-2 transition-all",
                                        player.name === username ? "border-purple-500 bg-purple-500/10" : "border-slate-700"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={clsx(
                                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
                                            player.name === username ? "bg-purple-600" : "bg-slate-600"
                                        )}>
                                            {player.name[0].toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-white font-semibold truncate">{player.name}</div>
                                            <div className="flex gap-1 mt-1">
                                                {player.uid === room.host && (
                                                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">HOST</span>
                                                )}
                                                {player.name === username && (
                                                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">YOU</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {[...Array(Math.max(0, 6 - (room.players?.length || 0)))].map((_, idx) => (
                                <div key={`empty-${idx}`} className="bg-slate-900/30 p-4 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center">
                                    <span className="text-slate-600 text-sm">Waiting...</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                        {isHost && room.status === 'waiting' && (
                            <button
                                onClick={handleStartGame}
                                disabled={room.players?.length < 2}
                                className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed rounded-xl text-white font-bold text-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Play size={20} />
                                Start Game
                            </button>
                        )}
                        <button
                            onClick={handleBack}
                            className="px-6 py-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={18} />
                            Leave
                        </button>
                    </div>

                    {error && (
                        <div className="mt-4 bg-red-500/20 border border-red-500/50 px-4 py-2 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-auto"
        >
            <div className="bg-slate-800/95 backdrop-blur-lg rounded-2xl border border-slate-700 p-8 shadow-2xl relative">
                <h2 className="text-3xl font-bold text-white mb-8 flex items-center justify-center gap-3">
                    <Users className="text-purple-400" />
                    Multiplayer
                </h2>

                {!mode && (
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={handleCreateClick}
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-slate-600 disabled:to-slate-700 rounded-xl text-white font-bold text-lg transition-all"
                        >
                            Create Room
                        </button>
                        
                        <div className="flex items-center gap-3">
                            <div className="h-px bg-slate-600 flex-1"></div>
                            <span className="text-slate-500 text-sm">OR</span>
                            <div className="h-px bg-slate-600 flex-1"></div>
                        </div>
                        
                        <button
                            onClick={handleJoinClick}
                            className="w-full py-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-white font-semibold text-lg transition-all"
                        >
                            Join Room
                        </button>
                    </div>
                )}

                {mode === 'join' && (
                    <div className="flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="Enter Room Code"
                            value={inputCode}
                            onChange={e => setInputCode(e.target.value.toUpperCase())}
                            className="w-full p-4 bg-slate-900/50 border-2 border-slate-600 focus:border-purple-500 rounded-xl text-white text-center text-xl tracking-widest font-bold outline-none transition-colors"
                            maxLength={6}
                        />
                        <button
                            onClick={handleJoin}
                            disabled={loading || !inputCode.trim()}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-slate-600 disabled:to-slate-700 rounded-xl text-white font-bold text-lg transition-all"
                        >
                            Next
                        </button>
                        <button
                            onClick={() => setMode(null)}
                            className="w-full py-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-white font-semibold transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {error && (
                    <div className="mt-4 bg-red-500/20 border border-red-500/50 px-4 py-3 rounded-lg text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <button
                    onClick={() => dispatch({ type: 'UPDATE_STATE', payload: { status: 'MENU' } })}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>
            </div>
        </motion.div>
    );
};

export default Lobby;
