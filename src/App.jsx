/**
 * Main Application Component
 * Root component that sets up context providers
 */

import React from 'react';
import { GameProvider } from './context/GameContext';
import { UserProvider } from './context/UserContext';
import GameBoard from './components/GameBoard';

const App = () => {
  return (
    <UserProvider>
      <GameProvider>
        <GameBoard />
      </GameProvider>
    </UserProvider>
  );
};

export default App;
