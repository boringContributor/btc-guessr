import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { DynamoDbTable } from "../constructs/ddb";
import { RestApi } from "../constructs/rest-api";
import { StateMachine } from "../constructs/state-machine";
import { Lambdas } from "../constructs/lambdas";

export class BackendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const table = new DynamoDbTable(this, "GuessTable");

    const { handleResultLambda, newGuessLambda, checkResultLambda } =
      new Lambdas(this, "LambdaFns", {
        guessTable: table.guessTable,
      });

    const { machine } = new StateMachine(this, "HandleResultMachine", {
      guessTable: table.guessTable,
      newGuessLambda: newGuessLambda.lambda,
      handleResultLambda: handleResultLambda.lambda,
    });

    newGuessLambda.lambda.addEnvironment(
      "STEP_FUNCTION_ARN",
      machine.stateMachineArn
    );

    new RestApi(this, "NewGuessApi", {
      newGuessLambda: newGuessLambda.lambda,
      checkResultLambda: checkResultLambda.lambda,
    });
  }
}
