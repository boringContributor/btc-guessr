import { Logger } from "@aws-lambda-powertools/logger";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { getEnvVarOrThrow } from "../../utils/helper";
import { getCurrentBitcoinPriceInUSD } from "../../utils/bitcoin-api";
import { GameStatus, GuessData } from "../../types";

const NEW_GUESS_TABLE_NAME = getEnvVarOrThrow("NEW_GUESS_TABLE_NAME");

const logger = new Logger({ serviceName: "Handle result" });
const ddb = new DynamoDB.DocumentClient();

export async function main(event: APIGatewayProxyEventV2): Promise<any> {
  logger.info("handle result", { event: JSON.stringify(event) });

  try {
    const { guess, oldPrice, id } = JSON.parse(event.body!) as GuessData;
    const latestPrice = await getCurrentBitcoinPriceInUSD();

    const diff = latestPrice - oldPrice;

    let isCorrectGuess = false;
    if (diff > 0 && guess === "up") {
      isCorrectGuess = true;
    }
    if (diff < 0 && guess === "down") {
      isCorrectGuess = true;
    }

    logger.info("comparing prices", {
      priceChanged: latestPrice !== oldPrice,
      guess,
      isCorrectGuess,
      msg: `old price: ${oldPrice} | new price ${latestPrice}`,
    });

    await ddb
      .update({
        TableName: NEW_GUESS_TABLE_NAME,
        Key: { id },
        UpdateExpression:
          "set gameStatus = :gameStatus, isCorrectGuess = :isCorrectGuess, latestPrice = :latestPrice",
        ExpressionAttributeValues: {
          ":gameStatus": GameStatus.Finished,
          ":isCorrectGuess": isCorrectGuess,
          ":latestPrice": latestPrice,
        },
        ReturnValues: "UPDATED_NEW",
      })
      .promise();

    return Promise.resolve({ id, isCorrectGuess });
  } catch (error) {
    logger.error("error on api execution", { msg: JSON.stringify(error) });
    return Promise.reject({ message: "could not execute endpoint" });
  }
}
