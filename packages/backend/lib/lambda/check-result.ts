import { Logger } from "@aws-lambda-powertools/logger";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { getEnvVarOrThrow } from "../../utils/helper";
import { GuessData } from "../../types";

const NEW_GUESS_TABLE_NAME = getEnvVarOrThrow("NEW_GUESS_TABLE_NAME");

const logger = new Logger({ serviceName: "Check result" });
const ddb = new DynamoDB.DocumentClient();

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  logger.info("check result for id", { event: JSON.stringify(event) });

  try {
    if (!event.pathParameters) return { statusCode: 400 };
    const id = event.pathParameters.id as string;

    const ddbNewGuessParam: DynamoDB.DocumentClient.GetItemInput = {
      TableName: NEW_GUESS_TABLE_NAME,
      Key: { id },
    };

    const { Item } = await ddb.get(ddbNewGuessParam).promise();

    const guessData = Item as GuessData;

    logger.info(`result for ${id}`, { result: guessData });

    if (!Item) {
      return {
        statusCode: 404,
        body: "no game data for this id",
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(guessData),
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
  } catch (error) {
    logger.error("error on api execution", { msg: JSON.stringify(error) });
    return Promise.reject({ message: "could not execute endpoint" });
  }
}
