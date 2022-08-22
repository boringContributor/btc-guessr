import { useMutation } from "@tanstack/react-query";

const useNewGuess = () => {
  return useMutation((guess: string) =>
    fetch(
      "https://tdnj9xsau1.execute-api.eu-central-1.amazonaws.com/dev/new-guess",
      {
        mode: "no-cors",
        method: "POST",
        body: JSON.stringify({
          guess,
        }),
      }
    )
  );
};

export default useNewGuess;
