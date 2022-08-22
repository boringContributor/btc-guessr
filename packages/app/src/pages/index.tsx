import type { NextPage } from "next";
import BTCStats from "../components/btc-stats";
import PlayerStats from "../components/player-stats";
import VoteButton from "../components/vote-button";
import useNewGuess from "../hooks/use-new-guess";

const Home: NextPage = () => {
  const { mutate } = useNewGuess();

  return (
    <>
      <div>
        <h1 className="text-center text-orange-500 text-8xl">BTC GUESSR</h1>
        <p className="text-white text-lg text-center">
          can you guess whether the bitcoin price will go up or down after the
          next 60 seconds?
        </p>
      </div>

      <div className="flex flex-col gap-5 md:flex-row m-5">
        <BTCStats />
        <PlayerStats />
      </div>
      <div className="flex justify-center gap-4 mt-20">
        <VoteButton label="up" />
        <VoteButton label="down" />
      </div>
    </>
  );
};

export default Home;
