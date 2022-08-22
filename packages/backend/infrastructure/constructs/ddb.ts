import { aws_dynamodb, RemovalPolicy } from "aws-cdk-lib";
import { BillingMode, StreamViewType } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class DynamoDbTable extends Construct {
  guessTable: aws_dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.guessTable = new aws_dynamodb.Table(this, "Results", {
      partitionKey: {
        name: "id",
        type: aws_dynamodb.AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: false,
      removalPolicy: RemovalPolicy.DESTROY,
      stream: StreamViewType.NEW_IMAGE,
    });
  }
}
