import BTCStats from "../components/btc-stats";
import PlayerStats from "../components/player-stats";
import VoteButton from "../components/vote-button";
import useCheckResult from "../hooks/use-check-result";
import LatestResult from "../components/latest-result";

const Index = () => {
  const { data, isFinished, isProcessing } = useCheckResult();

  return (
    <>
      <div className="m-5">
        <h1 className="text-center text-orange-600 md:text-8xl text-6xl m-5">
          BTC GUESSR
        </h1>
        <p className="text-white text-lg text-center font-extrabold">
          can you guess whether the Bitcoin price will go up or down after the
          next 60 seconds?
        </p>
      </div>

      <div className="flex flex-col gap-5 md:flex-row m-5">
        <BTCStats />
        <PlayerStats />
      </div>

      {isProcessing ? (
        <div className="flex gap-2 items-center animate-pulse">
          <img
            alt="Loading Indicator"
            className=""
            src={"/bitcoin.svg"}
            height={64}
            width={64}
          />
          <p className="text-white text-lg text-center">
            your guess is being processed
          </p>
        </div>
      ) : null}

      {isFinished && data ? <LatestResult result={data} /> : null}

      <div className="flex justify-center gap-4 mt-10">
        <VoteButton label="up" />
        <VoteButton label="down" />
      </div>
      {isProcessing ? (
        <p className="text-white font-extrabold text-center">
          you can not make a new guess until your current one is resolved
        </p>
      ) : null}
    </>
  );
};

export default Index;
