import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as core from "aws-cdk-lib/core";
import * as appsync from "@aws-cdk/aws-appsync";
import * as dynamoDB from "aws-cdk-lib/aws-dynamodb";

export class REST_STACK extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // creating an api-gateway
    const apiGateWay = new apigateway.RestApi(this, "Rest-API-Stack");

    // creating a Lambda function for api-gateway to handle request and response from the end-points
    const lambdaFunction = new lambda.Function(this, "Rest-Lambda-Func", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "Rest_lambda.handler",
    });

    const userTable = new dynamoDB.Table(this, "User-table", {
      tableName: "User-Table",
      partitionKey: {
        name: "id",
        type: dynamoDB.AttributeType.STRING,
      },
    });

    userTable.grantFullAccess(lambdaFunction);
    lambdaFunction.addEnvironment("USER_TABLE", userTable.tableName);

    // Assigning api to lambda function
    // const abcLambda  = new apigateway.LambdaRestApi(this, "lambda-integration", {
    //   handler: lambdaFunction,
    //   proxy: false
    // })

    // Create resource
    const apiResource = apiGateWay.root.addResource("user")
    //  apiGty.root.addResource("user");

    // create HTTP methods for our resource
    apiResource.addMethod("GET", new apigateway.LambdaIntegration(lambdaFunction));   
    apiResource.addMethod("POST", new apigateway.LambdaIntegration(lambdaFunction));
    apiResource.addMethod("PUT", new apigateway.LambdaIntegration(lambdaFunction));
    apiResource.addMethod("DELETE", new apigateway.LambdaIntegration(lambdaFunction));
  }
}
