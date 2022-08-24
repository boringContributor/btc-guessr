import { useScoreHistoryStore } from "../store";

const useScore = () => {
  const scoreHistory = useScoreHistoryStore((state) => state.scoreHistory);

  if (scoreHistory.length === 0) return { score: 0, scoreHistory: [] };

  const score = scoreHistory.reduce((acc, obj) => {
    const numberToChange = obj.isCorrectGuess ? 1 : -1;
    return acc + numberToChange;
  }, 0);

  return {
    scoreHistory,
    score,
  };
};

export default useScore;
