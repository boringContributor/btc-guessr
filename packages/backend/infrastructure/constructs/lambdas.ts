import { aws_dynamodb, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import { LambdaWithLogGroup } from "./lambda-with-loggroup";
import * as path from "path";

interface Props {
  guessTable: aws_dynamodb.Table;
}

export class Lambdas extends Construct {
  newGuessLambda: LambdaWithLogGroup;
  checkResultLambda: LambdaWithLogGroup;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const { guessTable } = props;

    this.newGuessLambda = new LambdaWithLogGroup(this, "handle-guess", {
      duration: Duration.seconds(3),
      entry: path.join(__dirname, `../../lib/lambda/new-guess.ts`),
      envVariables: {
        NEW_GUESS_TABLE_NAME: guessTable.tableName,
      },
    });

    this.checkResultLambda = new LambdaWithLogGroup(this, "check-result", {
      duration: Duration.seconds(3),
      entry: path.join(__dirname, `../../lib/lambda/check-result.ts`),
      envVariables: {
        NEW_GUESS_TABLE_NAME: guessTable.tableName,
      },
    });

    guessTable.grantFullAccess(this.newGuessLambda.lambda);
  }
}
