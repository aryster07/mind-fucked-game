// ============ MAIN MENU PAGE (REFACTORED) ============
import React from 'react';
import { useGame } from '../context/GameContext';
import MainMenuUI from '../ui/MainMenu';

const MainMenuPage = () => {
  const { startSolo, set } = useGame();

  const handleCreateRoom = (playerName) => {
    set({ status: 'LOBBY', roomCode: null, currentUserId: `user-${Date.now()}` });
  };

  const handleJoinRoom = (roomCode, playerName) => {
    set({ status: 'LOBBY', roomCode, currentUserId: `user-${Date.now()}` });
  };

  return (
    <MainMenuUI 
      onStartSolo={startSolo} 
      onCreateRoom={handleCreateRoom} 
      onJoinRoom={handleJoinRoom} 
    />
  );
};

export default MainMenuPage;
