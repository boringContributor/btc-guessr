export enum GameStatus {
  Processing = "processing",
  Finished = "finished",
}

export type Guess = "up" | "down";

export type GuessData = {
  id: string;
  status: GameStatus;
  guess: Guess;
  timestamp: string;
  oldPrice: number;
  latestPrice?: number;
};
