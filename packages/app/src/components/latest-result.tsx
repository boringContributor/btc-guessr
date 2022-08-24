import { FC } from "react";
import { Result } from "../types";

interface LatestResultProps {
  result: Partial<Result>;
}

const LatestResult: FC<LatestResultProps> = ({ result }) => {
  return (
    <div className="mt-8 sm:mt-6">
      <dl className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col px-4 py-8 text-center border border-gray-100 rounded-lg">
          <dt className="order-last text-lg font-medium text-white">
            Your guess
          </dt>

          <dd className="text-xl font-extrabold text-orange-600 md:text-5xl">
            {result?.guess}
          </dd>
        </div>

        <div className="flex flex-col px-4 py-8 text-center border border-gray-100 rounded-lg">
          <dt className="order-last text-lg font-medium text-white">
            Your price
          </dt>

          <dd className="text-xl font-extrabold text-orange-600 md:text-5xl">
            {result?.oldPrice?.toFixed(2)}
          </dd>
        </div>

        <div className="flex flex-col px-4 py-8 text-center border border-gray-100 rounded-lg">
          <dt className="order-last text-lg font-medium text-white">
            Latest price
          </dt>

          <dd className="text-xl font-extrabold text-orange-600 md:text-5xl">
            {result?.latestPrice?.toFixed(2)}
          </dd>
        </div>
      </dl>
      <p className="text-white text-lg text-center mt-5">
        Your guess was:{" "}
        <span className="text-orange-600">
          {result?.isCorrectGuess ? "correct" : "wrong"}
        </span>
      </p>
    </div>
  );
};

export default LatestResult;
