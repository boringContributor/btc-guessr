type Guess = "up" | "down";

enum GameStatus {
  Processing = "processing",
  Finished = "finished",
}

interface Result {
  id: string;
  gameStatus: GameStatus;
  guess: Guess;
  timestamp: string;
  oldPrice: number;
  latestPrice: number;
  isCorrectGuess: boolean;
}

export type { Guess, Result };
export { GameStatus };
