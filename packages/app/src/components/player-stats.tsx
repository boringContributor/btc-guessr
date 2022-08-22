const PlayerStats = () => {
  return (
    <article className="flex items-center gap-4 p-6 bg-white border border-gray-100 rounded-lg sm:justify-between">
      <span className="p-3 text-orange-600 bg-blue-100 rounded-full sm:order-last">
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </span>

      <div>
        <p className="text-2xl font-medium text-gray-900">2</p>

        <p className="text-sm text-gray-400">Your point(s)</p>
      </div>
    </article>
  );
};
export default PlayerStats;
