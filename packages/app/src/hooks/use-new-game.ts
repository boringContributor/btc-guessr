import { useMutation } from "@tanstack/react-query";
import { useGameStore } from "../store";

const useNewGame = () => {
  const setGameData = useGameStore((state) => state.setGameData);

  return useMutation(
    async (guess: string) => {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/new-guess`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            guess,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    {
      onSuccess: (data: { id: string }) => {
        setGameData({
          isRunning: true,
          latestId: data.id,
        });
      },
    }
  );
};

export default useNewGame;
