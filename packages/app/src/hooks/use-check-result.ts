import { useQuery } from "@tanstack/react-query";
import { Result, GameStatus } from "../types";
import { useGameStore, useScoreHistoryStore } from "../store";
import { useEffect } from "react";
import { GAME_RESULT_KEY } from "../constants/query-keys";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const checkResultForGameId = async (id: string | undefined) => {
  await sleep(1000); // workaround as useQuery fires too fast

  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_API_URL}/check-result/${id}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    return Promise.reject(new Error("Network response was not ok"));
  }
  return (await response.json()) as Result;
};

const useCheckResult = () => {
  const {
    gameData: { isRunning, latestId },
    setGameData,
  } = useGameStore();

  const setScoreHistory = useScoreHistoryStore(
    (state) => state.setScoreHistory
  );

  const guessResult = useQuery(
    [GAME_RESULT_KEY, latestId],
    () => checkResultForGameId(latestId),
    {
      enabled: Boolean(latestId) && isRunning,
      refetchInterval: 20000,
      useErrorBoundary: true,
    }
  );

  useEffect(() => {
    if (guessResult.data?.gameStatus === GameStatus.Finished) {
      setGameData({ isRunning: false, latestId });
      setScoreHistory(guessResult.data);
    }
  }, [guessResult.data?.gameStatus]);

  const isProcessing = Boolean(latestId) && isRunning;

  const isFinished =
    guessResult.data &&
    guessResult.data?.gameStatus === GameStatus.Finished &&
    !isRunning;

  return { isFinished, isProcessing, data: guessResult.data };
};

export default useCheckResult;
