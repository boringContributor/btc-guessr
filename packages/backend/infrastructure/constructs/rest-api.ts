import { CfnOutput } from "aws-cdk-lib";
import {
  JsonSchemaType,
  Model,
  RequestValidator,
  RestApi as AwsRestApi,
  LambdaIntegration,
  Cors,
  MethodLoggingLevel,
  LambdaRestApi,
} from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

interface Props {
  newGuessLambda: NodejsFunction;
  checkResultLambda: NodejsFunction;
}

export class RestApi extends Construct {
  restApi: LambdaRestApi;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const { newGuessLambda, checkResultLambda } = props;

    const api = new AwsRestApi(this, "api", {
      description: "entry point for the bitcoin guessr api",
      deployOptions: {
        stageName: "dev",
        loggingLevel: MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },

      // enable CORS
      defaultCorsPreflightOptions: {
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "Accept",
          "X-Api-Key",
        ],
        allowMethods: Cors.ALL_METHODS,
        allowOrigins: Cors.ALL_ORIGINS,
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
    const checkResultResource = api.root
      .addResource("check-result")
      .addResource("{id}");

    createNewGameResource.addMethod(
      "POST",
      new LambdaIntegration(newGuessLambda, {
        proxy: true,
        integrationResponses: [
          {
            statusCode: "201",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Headers":
                "'Content-Type,Accept,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
              "method.response.header.Access-Control-Allow-Methods":
                "'GET,POST,OPTIONS'",
              "method.response.header.Access-Control-Allow-Origin": "'*'",
            },
          },
        ],
      }),
      {
        methodResponses: [
          {
            statusCode: "201",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Headers": true,
              "method.response.header.Access-Control-Allow-Methods": true,
              "method.response.header.Access-Control-Allow-Credentials": true,
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
        requestValidator: new RequestValidator(this, "body-validator", {
          restApi: api,
          requestValidatorName: "body-validator",
          validateRequestBody: true,
        }),
        requestModels: {
          "application/json": apiValidationModel,
        },
      }
    );

    checkResultResource.addMethod(
      "GET",
      new LambdaIntegration(checkResultLambda, {
        proxy: true,
        integrationResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Headers":
                "'Content-Type,Accept,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
              "method.response.header.Access-Control-Allow-Methods":
                "'GET,POST,OPTIONS'",
              "method.response.header.Access-Control-Allow-Origin": "'*'",
            },
          },
        ],
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Headers": true,
              "method.response.header.Access-Control-Allow-Methods": true,
              "method.response.header.Access-Control-Allow-Credentials": true,
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    new CfnOutput(this, "apiUrl", { value: api.url });
  }
}
