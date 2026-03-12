import { create } from 'zustand';
import { PositionedCard } from '@/types/game';

interface GameUIState {
  selectedPosition: number | null;
  powerUpTarget: { playerId: string; position?: number } | null;
  isAnimating: boolean;
  showHowToPlay: boolean;
  showMenu: boolean;
  peekedCards: PositionedCard[] | null;
  takenCard: { value: number; suit: string } | null;
  revealedPosition: number | null; // position of newly drawn card (shown face-up briefly)

  setSelectedPosition: (pos: number | null) => void;
  setPowerUpTarget: (target: { playerId: string; position?: number } | null) => void;
  setIsAnimating: (v: boolean) => void;
  setShowHowToPlay: (v: boolean) => void;
  setShowMenu: (v: boolean) => void;
  setPeekedCards: (cards: PositionedCard[] | null) => void;
  setTakenCard: (card: { value: number; suit: string } | null) => void;
  setRevealedPosition: (pos: number | null) => void;
  reset: () => void;
}

export const useGameStore = create<GameUIState>((set) => ({
  selectedPosition: null,
  powerUpTarget: null,
  isAnimating: false,
  showHowToPlay: false,
  showMenu: false,
  peekedCards: null,
  takenCard: null,
  revealedPosition: null,

  setSelectedPosition: (pos) => set({ selectedPosition: pos }),
  setPowerUpTarget: (target) => set({ powerUpTarget: target }),
  setIsAnimating: (v) => set({ isAnimating: v }),
  setShowHowToPlay: (v) => set({ showHowToPlay: v }),
  setShowMenu: (v) => set({ showMenu: v }),
  setPeekedCards: (cards) => set({ peekedCards: cards }),
  setTakenCard: (card) => set({ takenCard: card }),
  setRevealedPosition: (pos) => set({ revealedPosition: pos }),
  reset: () =>
    set({
      selectedPosition: null,
      powerUpTarget: null,
      isAnimating: false,
      showHowToPlay: false,
      showMenu: false,
      peekedCards: null,
      takenCard: null,
      revealedPosition: null,
    }),
}));
