
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';

const MainMenu = () => {
    const { startGameSolo, dispatch } = useGame();
    const [username, setUsername] = useState('');
    const [showUsernameInput, setShowUsernameInput] = useState(false);

    useEffect(() => {
        const savedUsername = localStorage.getItem('username');
        if (savedUsername) {
            setUsername(savedUsername);
        }
    }, []);

    const handlePlayOnline = () => {
        if (!username.trim()) {
            setShowUsernameInput(true);
        } else {
            localStorage.setItem('username', username);
            dispatch({ type: 'UPDATE_STATE', payload: { status: 'LOBBY' } });
        }
    };

    const handleUsernameSubmit = (e) => {
        e.preventDefault();
        if (username.trim()) {
            localStorage.setItem('username', username);
            dispatch({ type: 'UPDATE_STATE', payload: { status: 'LOBBY' } });
        }
    };

    if (showUsernameInput && !username) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6 z-10 bg-slate-900/90 p-8 rounded-2xl border border-slate-700 shadow-2xl"
            >
                <h2 className="text-3xl font-bold text-white">Enter Your Username</h2>
                <form onSubmit={handleUsernameSubmit} className="flex flex-col gap-4 w-full">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username..."
                        maxLength={15}
                        autoFocus
                        className="px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                        type="submit"
                        disabled={!username.trim()}
                        className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-lg text-white font-bold text-xl shadow-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all"
                    >
                        Continue
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowUsernameInput(false)}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        Back
                    </button>
                </form>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 z-10"
        >
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-red-600 drop-shadow-2xl">
                MIND F**KED
            </h1>

            {username && (
                <div className="text-slate-300 text-lg">
                    Welcome, <span className="font-bold text-emerald-400">{username}</span>!
                    <button
                        onClick={() => {
                            setUsername('');
                            localStorage.removeItem('username');
                        }}
                        className="ml-3 text-sm text-slate-500 hover:text-slate-300 underline"
                    >
                        Change
                    </button>
                </div>
            )}

            <div className="flex gap-4">
                <button
                    onClick={startGameSolo}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-lg text-white font-bold text-xl shadow-lg hover:scale-105 hover:ring-2 hover:ring-gold transition-all"
                >
                    Play Solo
                </button>

                <button
                    onClick={handlePlayOnline}
                    className="px-8 py-3 bg-slate-800 rounded-lg text-white font-bold text-xl shadow-lg hover:scale-105 hover:bg-slate-700 transition-all border border-slate-600"
                >
                    Play Online
                </button>
            </div>

            <p className="text-slate-400 text-sm mt-4">v2.0 • The Ultimate Memory Game</p>
        </motion.div>
    );
};

export default MainMenu;
