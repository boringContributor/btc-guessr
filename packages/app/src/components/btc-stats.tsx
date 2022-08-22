import useBitcoinStats from "../hooks/use-bitcoin-stats";

const BTCStats = () => {
  const { data } = useBitcoinStats();
  const isTrendindDown = data?.priceChangePercentage.at(0) === "-";

  return (
    <article className="w-96 p-6 bg-white border border-gray-100 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">BTC in USD</p>

          <p className="text-2xl font-medium text-gray-900">
            {data?.currentPriceInUSD}
          </p>
        </div>

        <span className="p-3 text-orange-600 bg-blue-100 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </span>
      </div>

      <div
        className={`flex gap-1 mt-1 ${
          data?.priceChangePercentage.at(0) === "-"
            ? "text-red-600"
            : "text-green-600"
        }`}
      >
        {isTrendindDown ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        )}

        <p className="flex gap-2 text-xs">
          <span className="font-medium">{data?.priceChangePercentage}%</span>

          <span className="text-gray-400">Since last week</span>
        </p>
      </div>
    </article>
  );
};

export default BTCStats;
