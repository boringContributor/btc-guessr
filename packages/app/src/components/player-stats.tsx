import useScore from "../hooks/use-score";

const PlayerStats = () => {
  const { score, scoreHistory } = useScore();

  return (
    <article className="flex items-center gap-4 p-6 bg-white border border-gray-100 rounded-lg sm:justify-between">
      {scoreHistory.length && scoreHistory.length > 0 ? (
        <div
          className={`grid ${
            scoreHistory.length > 20 ? "md:grid-cols-8" : "md:grid-cols-4"
          } gap-2 order-last grid-cols-10`}
        >
          {scoreHistory.map((history) => (
            <div
              key={history.id}
              className={`rounded-full h-2 w-2 ${
                history.isCorrectGuess ? "bg-green-500" : "bg-red-700"
              }`}
            ></div>
          ))}
        </div>
      ) : null}

      <div>
        <p className="text-2xl font-medium text-gray-900">{score}</p>
        <p className="text-sm text-gray-400">Your point(s)</p>
      </div>
    </article>
  );
};
export default PlayerStats;
