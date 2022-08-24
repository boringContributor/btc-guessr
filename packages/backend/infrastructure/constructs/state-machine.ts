import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import { Duration, aws_dynamodb } from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

// hier gehe ich davon aus dass nach 60 sec der preis anders ist, was wenn nicht ?
// -> when + otherwise + afterwards https://www.proud2becloud.com/step-function-with-aws-cdk-in-action-our-points-of-view-about-it-using-typescript/
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

    const newGuessTask = new tasks.LambdaInvoke(this, "New guess", {
      lambdaFunction: newGuessLambda,
      outputPath: "$.Payload",
    });

    const waitTask = new sfn.Wait(this, "Wait x seconds", {
      time: sfn.WaitTime.secondsPath("$.waitSeconds"),
    });
    const handleResultTask = new tasks.LambdaInvoke(this, "Check result", {
      lambdaFunction: handleResultLambda,
      outputPath: "$.Payload",
    });

    const definition = newGuessTask
      .next(waitTask)
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
  }
}
