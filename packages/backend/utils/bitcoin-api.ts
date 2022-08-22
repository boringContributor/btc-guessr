import axios, { AxiosRequestConfig } from "axios";

const COINGECKO_API = "https://api.coingecko.com/api/v3/exchange_rates";

export const getCurrentBitcoinPriceInUSD = async () => {
  const config: AxiosRequestConfig = {
    method: "get",
    url: COINGECKO_API,
  };

  const response = await axios(config);
  const { rates } = response.data;

  return rates.usd.value || undefined;
};
