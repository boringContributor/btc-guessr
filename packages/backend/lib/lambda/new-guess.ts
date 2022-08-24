import { Logger } from "@aws-lambda-powertools/logger";
import { DynamoDB } from "aws-sdk";
import { getEnvVarOrThrow } from "../../utils/helper";
import { getCurrentBitcoinPriceInUSD } from "../../utils/bitcoin-api";
import { EventBridgeEvent } from "aws-lambda";
import { GameStatus, GuessData } from "../../types";

const NEW_GUESS_TABLE_NAME = getEnvVarOrThrow("NEW_GUESS_TABLE_NAME");

const logger = new Logger({ serviceName: "New guess" });
const ddb = new DynamoDB.DocumentClient();

type NewGuessBody = Pick<GuessData, "guess">;

export async function main(
  event: EventBridgeEvent<any, any>
): Promise<{ body: string }> {
  logger.info("new guess", { event: JSON.stringify(event) });

  try {
    const body = event.detail as NewGuessBody;

    const oldPrice = await getCurrentBitcoinPriceInUSD();

    const newGuessEntry = {
      id: event.id,
      timestamp: new Date().toISOString(),
      oldPrice,
      gameStatus: GameStatus.Processing,
      ...body,
    };

    const ddbNewGuessParam: DynamoDB.DocumentClient.PutItemInput = {
      TableName: NEW_GUESS_TABLE_NAME,
      Item: {
        ...newGuessEntry,
      },
    };

    await ddb.put(ddbNewGuessParam).promise();

    return Promise.resolve({ body: JSON.stringify(newGuessEntry) });
  } catch (error) {
    logger.error("error on api execution for new guess init", {
      msg: JSON.stringify(error),
    });
    return Promise.reject(error);
  }
}
