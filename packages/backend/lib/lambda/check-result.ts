import { Logger } from "@aws-lambda-powertools/logger";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { getEnvVarOrThrow } from "../../utils/helper";
import { getCurrentBitcoinPriceInUSD } from "../../utils/bitcoin-api";

const NEW_GUESS_TABLE_NAME = getEnvVarOrThrow("NEW_GUESS_TABLE_NAME");

const logger = new Logger({ serviceName: "Check result" });
const ddb = new DynamoDB.DocumentClient();

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  logger.info("check result", { event: JSON.stringify(event) });

  try {
    const body = JSON.parse(event.body!);
    const guess = body.guess;
    const oldPrice = body.currentPriceInUSD;
    const latestPrice = await getCurrentBitcoinPriceInUSD();

    const diff = latestPrice - oldPrice;

    let isCorrectGuessed = false;
    if (diff > 0 && guess === "up") {
      isCorrectGuessed = true;
    }
    if (diff < 0 && guess === "down") {
      isCorrectGuessed = true;
    }

    // const ddbGuessParam: DynamoDB.DocumentClient.GetItemInput = {
    //   TableName: NEW_GUESS_TABLE_NAME,
    //   Key: {
    //     id: "",
    //   },
    // };

    // const { Item } = await ddb.get(ddbGuessParam).promise();
    logger.info("comparing prices", {
      priceChanged: latestPrice !== oldPrice,
      guess,
      isCorrectGuessed,
      msg: `old price: ${oldPrice} | new price ${latestPrice}`,
    });

    return {
      body: JSON.stringify({ hello: latestPrice }),
      statusCode: 200,
    };
  } catch (error) {
    logger.error("error on api execution", { msg: JSON.stringify(error) });
    return {
      body: JSON.stringify({ message: "could not execute endpoint" }),
      statusCode: 400,
    };
  }
}
