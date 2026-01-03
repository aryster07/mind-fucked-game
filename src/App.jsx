/**
 * Main Application Component
 * Root component that sets up context providers
 */

import React from 'react';
import { GameProvider } from './context/GameContext';
import GameBoard from './components/GameBoard';

const App = () => {
  return (
    <GameProvider>
      <GameBoard />
    </GameProvider>
  );
};

export default App;
