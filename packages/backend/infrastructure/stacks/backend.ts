import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { DynamoDbTable } from "../constructs/ddb";
import { RestApi } from "../constructs/rest-api";
import { StateMachine } from "../constructs/state-machine";
import { Lambdas } from "../constructs/lambdas";
import { EventBus } from "aws-cdk-lib/aws-events";
import { APIEventBridgeIntegration } from "../constructs/eb-integration";

export class BackendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const table = new DynamoDbTable(this, "GuessTable");
    const eventBus = new EventBus(this, "eventBus");

    const { checkResultLambda, newGuessLambda } = new Lambdas(
      this,
      "LambdaFns",
      {
        guessTable: table.guessTable,
      }
    );

    const { machine } = new StateMachine(this, "HandleResultMachine", {
      guessTable: table.guessTable,
      newGuessLambda: newGuessLambda.lambda,
      checkResultLambda: checkResultLambda.lambda,
    });

    const { eventBridgeIntegration } = new APIEventBridgeIntegration(
      this,
      "APIEventBridgeIntegration",
      {
        eventBus,
        stateMachine: machine,
      }
    );

    new RestApi(this, "NewGuessApi", {
      eventBridgeIntegration,
    });
  }
}
