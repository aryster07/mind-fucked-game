import React from 'react';
import { GameProvider } from './context/GameContext';
import GameBoard from './pages/GameBoard';

function App() {
  return (
    <GameProvider>
      <GameBoard />
    </GameProvider>
  );
}

export default App;
