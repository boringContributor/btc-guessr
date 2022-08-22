import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import { Duration, aws_dynamodb } from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";
import { Runtime } from "aws-cdk-lib/aws-lambda";

// hier gehe ich davon aus dass nach 60 sec der preis anders ist, was wenn nicht ?
// -> when + otherwise + afterwards https://www.proud2becloud.com/step-function-with-aws-cdk-in-action-our-points-of-view-about-it-using-typescript/

interface Props {
  newGuessLambda: NodejsFunction;
  checkResultLambda: NodejsFunction;
  guessTable: aws_dynamodb.Table;
}

export class StateMachine extends Construct {
  machine: sfn.StateMachine;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const { checkResultLambda, newGuessLambda } = props;

    const definition = new tasks.LambdaInvoke(this, "New guess", {
      lambdaFunction: newGuessLambda,
      outputPath: "$.Payload",
    })
      .next(
        new sfn.Wait(this, "Wait 60 Second", {
          time: sfn.WaitTime.duration(Duration.seconds(60)),
        })
      )
      .next(
        new tasks.LambdaInvoke(this, "Check result", {
          lambdaFunction: checkResultLambda,
          outputPath: "$.Payload",
        })
      )
      .next(new sfn.Succeed(this, "done"));

    this.machine = new sfn.StateMachine(this, "StateMachine", {
      definition,
      stateMachineType: sfn.StateMachineType.EXPRESS,
      timeout: Duration.minutes(2),
    });
  }
}
