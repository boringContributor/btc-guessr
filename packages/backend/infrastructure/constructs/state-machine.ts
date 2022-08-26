import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import { Duration, aws_dynamodb } from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

interface Props {
  newGuessLambda: NodejsFunction;
  handleResultLambda: NodejsFunction;
  guessTable: aws_dynamodb.Table;
}

export class StateMachine extends Construct {
  machine: sfn.StateMachine;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const { handleResultLambda, newGuessLambda } = props;

    const waitTask = new sfn.Wait(this, "Wait x seconds", {
      time: sfn.WaitTime.secondsPath("$.waitSeconds"),
    });
    const handleResultTask = new tasks.LambdaInvoke(this, "Check result", {
      lambdaFunction: handleResultLambda,
      outputPath: "$.Payload",
    });

    const definition = waitTask
      .next(handleResultTask)
      .next(
        new sfn.Choice(this, "Did the price change?")
          .when(
            sfn.Condition.booleanEquals("$.didPriceChange", false),
            waitTask
          )
          .otherwise(new sfn.Succeed(this, "Done"))
      );

    this.machine = new sfn.StateMachine(this, "StateMachine", {
      definition,
      stateMachineType: sfn.StateMachineType.EXPRESS,
      timeout: Duration.minutes(2),
    });

    this.machine.grantStartExecution(newGuessLambda);
  }
}
