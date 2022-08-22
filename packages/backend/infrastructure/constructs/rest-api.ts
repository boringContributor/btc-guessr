import { CfnOutput } from "aws-cdk-lib";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import {
  AwsIntegration,
  JsonSchemaType,
  Model,
  RequestValidator,
  RestApi as AwsRestApi,
} from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

interface Props {
  eventBridgeIntegration: AwsIntegration;
}

export class RestApi extends Construct {
  restApi: apigw.LambdaRestApi;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const { eventBridgeIntegration } = props;

    const api = new AwsRestApi(this, "api", {
      description: "entry point for the bitcoin guessr api",
      deployOptions: {
        stageName: "dev",
      },
      // enable CORS
      defaultCorsPreflightOptions: {
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
        ],
        allowMethods: ["POST"],
        allowCredentials: false,
        allowOrigins: ["http://localhost:3000"],
      },
    });

    const apiValidationModel = new Model(this, "model-validator", {
      restApi: api,
      contentType: "application/json",
      schema: {
        type: JsonSchemaType.OBJECT,
        required: ["guess"],
        properties: {
          guess: { type: JsonSchemaType.STRING, pattern: "(^up$|^down$)" },
        },
      },
    });

    const createNewGameResource = api.root.addResource("new-guess");

    createNewGameResource.addMethod("POST", eventBridgeIntegration, {
      methodResponses: [{ statusCode: "201" }],
      requestValidator: new RequestValidator(this, "body-validator", {
        restApi: api,
        requestValidatorName: "body-validator",
        validateRequestBody: true,
      }),
      requestModels: {
        "application/json": apiValidationModel,
      },
    });

    new CfnOutput(this, "apiUrl", { value: api.url });
  }
}
