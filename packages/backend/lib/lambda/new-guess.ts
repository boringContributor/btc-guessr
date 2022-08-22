import { Logger } from "@aws-lambda-powertools/logger";
import { APIGatewayProxyCallbackV2 } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { getEnvVarOrThrow } from "../../../utils/helper";
import { nanoid } from "nanoid";
import { getCurrentBitcoinPriceInUSD } from "../../../utils/bitcoin-api";
import { EventBridgeEvent, Context } from "aws-lambda";

const NEW_GUESS_TABLE_NAME = getEnvVarOrThrow("NEW_GUESS_TABLE_NAME");

const logger = new Logger({ serviceName: "New guess" });
const ddb = new DynamoDB.DocumentClient();

type NewGuessBody = {
  guess: "up" | "down";
};

export async function main(
  event: EventBridgeEvent<any, any>
): Promise<{ body: string }> {
  logger.info("new guess", { event: JSON.stringify(event) });

  try {
    const body = event.detail as NewGuessBody;

    const currentPriceInUSD = await getCurrentBitcoinPriceInUSD();

    const newGuessEntry = {
      id: nanoid(),
      timestamp: new Date().toISOString(),
      currentPriceInUSD,
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
