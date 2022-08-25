import { Logger } from "@aws-lambda-powertools/logger";
import { DynamoDB, StepFunctions } from "aws-sdk";
import { getEnvVarOrThrow } from "../../utils/helper";
import { getCurrentBitcoinPriceInUSD } from "../../utils/bitcoin-api";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { GameStatus, GuessData } from "../../types";
import { nanoid } from "nanoid";

const NEW_GUESS_TABLE_NAME = getEnvVarOrThrow("NEW_GUESS_TABLE_NAME");
const STEP_FUNCTION_ARN = getEnvVarOrThrow("STEP_FUNCTION_ARN");

const logger = new Logger({ serviceName: "New guess" });
const ddb = new DynamoDB.DocumentClient();
const stepfunctions = new StepFunctions();

type NewGuessBody = Pick<GuessData, "guess">;

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  logger.info("new guess", { event: JSON.stringify(event) });

  try {
    const body = JSON.parse(event.body!) as NewGuessBody;

    const oldPrice = await getCurrentBitcoinPriceInUSD();
    const id = nanoid();
    const newGuessEntry = {
      id,
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

    stepfunctions.startExecution({
      stateMachineArn: STEP_FUNCTION_ARN,
      name: "state-machine",
      input: JSON.stringify({
        body: JSON.stringify(newGuessEntry),
        waitSeconds: 60,
      }),
    });

    return {
      statusCode: 201,
      body: JSON.stringify({ id }),
    };
  } catch (error) {
    logger.error("error on api execution for new guess init", {
      msg: JSON.stringify(error),
    });
    return {
      statusCode: 500,
    };
  }
}
