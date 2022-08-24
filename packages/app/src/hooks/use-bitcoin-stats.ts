import { useQuery } from "@tanstack/react-query";
import { formatDate } from "../utils";
import { BITCOIN_STATS_KEY } from "../constants/query-keys";

const ERROR_MSG = "No bitcoin stats available";
const COINGECKO_BASE_API = "https://api.coingecko.com/api/v3";

const getCurrentBitcoinStats = async () => {
  const stats = await Promise.all([
    fetch(`${COINGECKO_BASE_API}/exchange_rates`),
    fetch(
      `${COINGECKO_BASE_API}/coins/bitcoin?localization=false&tickers=false&community_data=false&developer_data=false`
    ),
  ]);
  const [exchangeRate, priceChange] = stats;

  if (!exchangeRate.ok || !priceChange.ok) {
    return Promise.reject(new Error(ERROR_MSG));
  }

  const currentPriceInUSD: string = (await exchangeRate.json())?.rates?.usd
    ?.value;
  const priceChangePercentage: string = (await priceChange.json())?.market_data
    .price_change_percentage_7d;

  return {
    priceChangePercentage: priceChangePercentage
      ? parseFloat(priceChangePercentage).toFixed(2)
      : "not available",
    currentPriceInUSD: currentPriceInUSD
      ? parseFloat(currentPriceInUSD).toFixed(2)
      : "not available",
    fetchedAt: formatDate(new Date()),
  };
};

const useBitcoinStats = () => {
  return useQuery([BITCOIN_STATS_KEY], getCurrentBitcoinStats);
};

export default useBitcoinStats;
