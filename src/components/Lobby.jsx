
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';
import { Copy, Users, Play, ArrowLeft, Check, Share2 } from 'lucide-react';
import { 
    createRoom, 
    joinRoom, 
    subscribeToRoom, 
    startGame,
    leaveRoom 
} from '../services/firebase/room.service';
import clsx from 'clsx';

const Lobby = () => {
    const { dispatch } = useGame();
    const [username, setUsername] = useState('');
    const [mode, setMode] = useState(null); // 'create' or 'join'
    const [roomCode, setRoomCode] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [showUsernameInput, setShowUsernameInput] = useState(false);
    const [tempUsername, setTempUsername] = useState('');

    useEffect(() => {
        const savedUsername = localStorage.getItem('username');
        if (savedUsername) {
            setUsername(savedUsername);
        }
    }, []);

    // Check for room code in URL on mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const urlRoomCode = urlParams.get('room');
        if (urlRoomCode) {
            setInputCode(urlRoomCode.toUpperCase());
            setMode('join');
        }
    }, []);

    useEffect(() => {
        if (roomCode) {
            const unsubscribe = subscribeToRoom(roomCode, (roomData) => {
                setRoom(roomData);
                // Auto-start if host starts the game
                if (roomData.status === 'playing') {
                    dispatch({ 
                        type: 'START_ONLINE_GAME', 
                        payload: { 
                            roomCode, 
                            players: roomData.players 
                        } 
                    });
                }
            });
            return () => unsubscribe();
        }
    }, [roomCode, dispatch]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (roomCode && username) {
                leaveRoom(roomCode, 'user-' + username);
            }
        };
    }, [roomCode, username]);

    const handleCreate = async () => {
        if (!username.trim()) {
            setError('Please enter a username');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const code = await createRoom({
                uid: 'user-' + username + '-' + Date.now(),
                name: username,
                online: true
            });
            setRoomCode(code);
            setMode('create');
        } catch (err) {
            setError(err.message || 'Failed to create room');
        }
        setLoading(false);
    };

    const handleJoin = async () => {
        if (!inputCode.trim()) {
            setError('Please enter a room code');
            return;
        }
        if (!showUsernameInput) {
            // Show username input for joining
            setShowUsernameInput(true);
            return;
        }
        if (!tempUsername.trim()) {
            setError('Please enter a username');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await joinRoom(inputCode.toUpperCase(), {
                uid: 'user-' + tempUsername + '-' + Date.now(),
                name: tempUsername,
                online: true
            });
            setUsername(tempUsername);
            localStorage.setItem('username', tempUsername);
            setRoomCode(inputCode.toUpperCase());
            setMode('join');
            setShowUsernameInput(false);
        } catch (err) {
            setError(err.message || 'Room not found. Please check the code.');
        }
        setLoading(false);
    };


    const handleStartGame = async () => {
        if (room?.players?.length < 2) {
            setError('Need at least 2 players to start');
            return;
        }
        await startGame(roomCode);
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShareLink = () => {
        const shareUrl = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
        navigator.clipboard.writeText(shareUrl);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const handleBack = async () => {
        if (roomCode && username) {
            await leaveRoom(roomCode, 'user-' + username);
        }
        setMode(null);
        setRoomCode('');
        setRoom(null);
        setInputCode('');
        setError('');
        setShowUsernameInput(false);
        dispatch({ type: 'UPDATE_STATE', payload: { status: 'MENU' } });
    };

    const isHost = room && room.host && room.players && room.players.length > 0 && room.host === room.players[0].uid;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 z-10 bg-slate-800/80 p-8 rounded-xl backdrop-blur-md border border-slate-600 shadow-2xl max-w-2xl w-full"
        >
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <Users className="text-blue-400" />
                Online Lobby
            </h2>

            {!mode && (
                <div className="flex flex-col gap-4 w-full">
                    <button
                        onClick={handleCreate}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg text-white font-bold text-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating...' : 'Create Room'}
                    </button>
                    <div className="flex items-center gap-2 text-slate-400">
                        <div className="h-px bg-slate-600 flex-1"></div>
                        <span>OR</span>
                        <div className="h-px bg-slate-600 flex-1"></div>
                    </div>
                    <button
                        onClick={() => setMode('join')}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg text-white font-bold text-xl hover:scale-105 transition-all"
                    >
                        Join Room
                    </button>
                </div>
            )}

            {mode === 'join' && !roomCode && (
                <>
                    {!showUsernameInput ? (
                        <div className="flex flex-col gap-4 w-full">
                            <input
                                type="text"
                                placeholder="Enter Room Code (e.g. ABC123)"
                                value={inputCode}
                                onChange={e => setInputCode(e.target.value.toUpperCase())}
                                className="w-full p-4 bg-slate-900 border border-slate-600 rounded-lg text-white text-center text-xl focus:ring-2 focus:ring-purple-500 outline-none tracking-widest font-bold"
                                maxLength={6}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleJoin}
                                    disabled={loading || !inputCode.trim()}
                                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg text-white font-bold text-lg transition-all"
                                >
                                    {loading ? 'Joining...' : 'Next'}
                                </button>
                                <button
                                    onClick={() => setMode(null)}
                                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 w-full">
                            <p className="text-slate-300 text-center">Enter your username to join room <span className="font-bold text-purple-400">{inputCode}</span></p>
                            <input
                                type="text"
                                placeholder="Your username..."
                                value={tempUsername}
                                onChange={e => setTempUsername(e.target.value)}
                                className="w-full p-4 bg-slate-900 border border-slate-600 rounded-lg text-white text-center text-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                maxLength={15}
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleJoin}
                                    disabled={loading || !tempUsername.trim()}
                                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg text-white font-bold text-lg transition-all"
                                >
                                    {loading ? 'Joining...' : 'Join Room'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowUsernameInput(false);
                                        setTempUsername('');
                                    }}
                                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold transition-all"
                                >
                                    Back
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {roomCode && room && (
                <div className="w-full">
                    {/* Room Code */}
                    <div className="text-center mb-6">
                        <p className="text-slate-400 text-sm mb-2">Room Code</p>
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <div className="bg-slate-900 px-6 py-3 rounded-lg border-2 border-gold">
                                <span className="text-3xl font-black text-gold tracking-widest">{roomCode}</span>
                            </div>
                            <button
                                onClick={handleCopyCode}
                                className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                                title="Copy code"
                            >
                                {copied ? <Check className="text-green-400" size={20} /> : <Copy className="text-white" size={20} />}
                            </button>
                        </div>
                        {/* Share Link Button */}
                        <button
                            onClick={handleShareLink}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-4 py-2 rounded-lg text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                        >
                            <Share2 size={16} />
                            {linkCopied ? 'Link Copied!' : 'Copy Join Link'}
                        </button>
                        <p className="text-xs text-slate-500 mt-2">Share the code or link with your friends!</p>
                    </div>

                    {/* Players */}
                    <div className="mb-6">
                        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                            <Users size={18} />
                            Players ({room.players?.length || 0}/4)
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {room.players?.map((player, idx) => (
                                <div 
                                    key={idx}
                                    className={clsx(
                                        "bg-slate-900 p-3 rounded-lg border-2 flex items-center gap-2",
                                        player.name === username ? "border-blue-500" : "border-slate-700"
                                    )}
                                >
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    <span className="text-white font-semibold">{player.name}</span>
                                    {player.uid === room.host && (
                                        <span className="ml-auto text-xs bg-gold text-black px-2 py-0.5 rounded font-bold">HOST</span>
                                    )}
                                    {player.name === username && (
                                        <span className="ml-auto text-xs bg-blue-600 text-white px-2 py-0.5 rounded font-bold">YOU</span>
                                    )}
                                </div>
                            ))}
                            {[...Array(Math.max(0, 4 - (room.players?.length || 0)))].map((_, idx) => (
                                <div key={`empty-${idx}`} className="bg-slate-900/50 p-3 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center">
                                    <span className="text-slate-600 text-sm">Waiting...</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Status */}
                    <div className="bg-slate-900 p-3 rounded-lg mb-4 text-center">
                        <span className="text-yellow-400 text-sm">
                            {room.status === 'waiting' ? 'Waiting for players...' : 'Game in progress'}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        {isHost && room.status === 'waiting' && (
                            <button
                                onClick={handleStartGame}
                                disabled={room.players?.length < 2}
                                className="flex-1 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed px-6 py-3 rounded-lg text-white font-bold text-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Play size={20} />
                                Start Game
                            </button>
                        )}
                        <button
                            onClick={handleBack}
                            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold transition-all flex items-center gap-2"
                        >
                            <ArrowLeft size={18} />
                            Leave
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="w-full bg-red-600/20 border border-red-500 px-4 py-2 rounded-lg text-red-400 text-sm text-center">
                    {error}
                </div>
            )}

            <button
                onClick={() => dispatch({ type: 'UPDATE_STATE', payload: { status: 'MENU' } })}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
                ✕
            </button>
        </motion.div>
    );
};

export default Lobby;
