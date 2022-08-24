import create from "zustand";
import { Result } from "../types";
import { persist } from "zustand/middleware";

interface GameData {
  isRunning: boolean;
  latestId: string | undefined;
}

interface GameState {
  gameData: GameData;
  setGameData: (gameData: GameData) => void;
}

interface ScoreHistory {
  scoreHistory: Result[];
  setScoreHistory: (score: Result) => void;
}

const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      gameData: {
        latestId: undefined,
        isRunning: false,
      },
      setGameData: (gameData) => set({ gameData }),
    }),
    {
      name: "gameData",
    }
  )
);

const useScoreHistoryStore = create<ScoreHistory>()(
  persist(
    (set) => ({
      scoreHistory: [],
      setScoreHistory: (result) => {
        set((state) => ({
          scoreHistory: [...state.scoreHistory, result].sort(
            (a, b) => -a.timestamp.localeCompare(b.timestamp)
          ),
        }));
      },
    }),
    {
      name: "gameHistory",
    }
  )
);

export { useGameStore, useScoreHistoryStore };
