import { UseMutateFunction } from "@tanstack/react-query";
import { FC, MouseEvent } from "react";
import useNewGuess from "../hooks/use-new-guess";

interface VoteButtonProps {
  label: "up" | "down";
}

const VoteButton: FC<VoteButtonProps> = ({ label }) => {
  const { mutate } = useNewGuess();

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    const guess = event.currentTarget.value;
    mutate(guess);
  };
  return (
    <button
      value={label.toLowerCase()}
      onClick={onClick}
      className="w-40 flex items-center justify-between px-5 py-3 transition-colors bg-orange-600 border border-orange-600 rounded-lg hover:bg-transparent group focus:outline-none focus:ring"
    >
      <span className="font-medium text-white transition-colors group-active:text-orange-500 group-hover:text-orange-600 capitalize">
        {label}
      </span>

      <span className="flex-shrink-0 p-2 ml-4 text-orange-600 bg-white border border-current rounded-full group-active:text-orange-500">
        {label === "down" ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        )}
      </span>
    </button>
  );
};

export default VoteButton;
