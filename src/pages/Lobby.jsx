// ============ LOBBY PAGE (REFACTORED) ============
import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { createRoom, joinRoom, leaveRoom, subscribeToRoom } from '../logic/firebase';
import { initializeGame } from '../logic/host';
import LobbyUI from '../ui/Lobby';

const MIN_PLAYERS = 1;

const LobbyPage = () => {
  const { state, set, applyRemote } = useGame();
  const { roomCode: existingRoomCode, currentUserId } = state;

  const [roomCode, setRoomCode] = useState(existingRoomCode || '');
  const [roomData, setRoomData] = useState(null);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const playerName = localStorage.getItem('username') || 'Player';

  // Initialize room
  useEffect(() => {
    const init = async () => {
      try {
        if (existingRoomCode) {
          setJoining(true);
          const data = await joinRoom(existingRoomCode, currentUserId, playerName);
          setRoomCode(existingRoomCode);
          setRoomData(data);
        } else {
          const code = Math.random().toString(36).substring(2, 8).toUpperCase();
          await createRoom(code, currentUserId, playerName);
          setRoomCode(code);
          set({ roomCode: code, isHost: true });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setJoining(false);
      }
    };
    if (!roomData && currentUserId) init();
  }, []);

  // Subscribe to room
  useEffect(() => {
    if (!roomCode) return;
    return subscribeToRoom(
      roomCode,
      (data) => {
        setRoomData(data);
        if (data.status === 'playing' && data.gameState) {
          const isHost = data.host === currentUserId;
          applyRemote(data.gameState, currentUserId, isHost, roomCode);
        }
      },
      () => {
        // Room was deleted (host left) - return to menu
        sessionStorage.removeItem('gameSession');
        setError('Room was disbanded by the host');
        set({ status: 'MENU', roomCode: null });
      }
    );
  }, [roomCode, currentUserId, applyRemote, set]);

  const handleLeave = async () => {
    const isHost = roomData?.host === currentUserId;
    if (roomCode && roomData?.status === 'waiting') {
      await leaveRoom(roomCode, currentUserId, isHost);
    }
    // Clear session storage
    sessionStorage.removeItem('gameSession');
    set({ status: 'MENU', roomCode: null });
  };

  const handleStart = async () => {
    if (!roomData || roomData.players.length < MIN_PLAYERS) {
      setError(`Need ${MIN_PLAYERS}+ players`);
      return;
    }
    
    try {
      await initializeGame(roomData.players, roomCode, currentUserId);
      // Don't call applyRemote here - the subscription will handle it
      // This ensures both host and joiners use the same flow
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRetryJoin = async (code) => {
    setJoining(true);
    try {
      const data = await joinRoom(code, currentUserId, playerName);
      setRoomCode(code);
      setRoomData(data);
      set({ roomCode: code, isHost: false });
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setJoining(false);
    }
  };

  return (
    <LobbyUI
      roomCode={roomCode}
      roomData={roomData}
      currentUserId={currentUserId}
      error={error}
      onStart={handleStart}
      onLeave={handleLeave}
      onRetryJoin={handleRetryJoin}
      isJoining={joining}
    />
  );
};

export default LobbyPage;
