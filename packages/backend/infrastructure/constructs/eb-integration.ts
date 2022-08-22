import { Construct } from "constructs";
import { AwsIntegration } from "aws-cdk-lib/aws-apigateway";
import { IEventBus } from "aws-cdk-lib/aws-events";
import { IStateMachine } from "aws-cdk-lib/aws-stepfunctions";

import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { aws_events, aws_events_targets } from "aws-cdk-lib";

interface APIEventBridgeIntegrationProps {
  eventBus: IEventBus;
  stateMachine: IStateMachine;
}

export class APIEventBridgeIntegration extends Construct {
  eventBridgeIntegration: AwsIntegration;

  constructor(
    scope: Construct,
    id: string,
    props: APIEventBridgeIntegrationProps
  ) {
    super(scope, id);

    const { eventBus, stateMachine } = props;

    const role = new Role(this, "role", {
      assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
    });

    eventBus.grantPutEventsTo(role);

    this.eventBridgeIntegration = new AwsIntegration({
      service: "events",
      action: "PutEvents",
      integrationHttpMethod: "POST",
      options: {
        credentialsRole: role,
        requestTemplates: {
          "application/json": `
              #set($context.requestOverride.header.X-Amz-Target ="AWSEvents.PutEvents")
              #set($context.requestOverride.header.Content-Type ="application/x-amz-json-1.1")
              ${JSON.stringify({
                Entries: [
                  {
                    DetailType: "putEvent",
                    Detail: "$util.escapeJavaScript($input.json('$'))",
                    Source: "async-eventbridge-api",
                    EventBusName: eventBus.eventBusArn,
                  },
                ],
              })}
            `,
        },
        integrationResponses: [
          {
            statusCode: "201",
            responseTemplates: {
              "application/json": JSON.stringify({
                id: "$input.path('$.Entries[0].EventId')",
              }),
            },
          },
        ],
      },
    });

    const btcGuessStateMachine = new aws_events_targets.SfnStateMachine(
      stateMachine
    );

    new aws_events.Rule(this, "start", {
      eventBus,
      targets: [btcGuessStateMachine],
      eventPattern: {
        detailType: ["putEvent"],
      },
    });
  }
}
