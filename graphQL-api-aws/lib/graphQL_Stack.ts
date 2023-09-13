import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as appsync from "aws-cdk-lib/aws-appsync";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamoDB from "aws-cdk-lib/aws-dynamodb"

export class graphQL_Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new appsync.GraphqlApi(this, "abc_Api", {
      name: "abc",
      schema: appsync.SchemaFile.fromAsset("schema/crud.gql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
        },
      },
      xrayEnabled: true,
    });

    const lambdaFunc = new lambda.Function(this, "DYNO-Lambda-Function", {
      functionName: "lambda-fuction",
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(10),
    });

    const demoDS = api.addLambdaDataSource("demoDataSource", lambdaFunc);

    demoDS.createResolver("FetchQuery", {
      typeName: "Query",
      fieldName: "FetchallData",
      
    });
    demoDS.createResolver("AddMutation", {
      fieldName: "addMutation",
      typeName: "Mutation",
    });
    demoDS.createResolver("GetMutation", {
      fieldName: "getSpecRowDetail",
      typeName: "Mutation",
    });
    demoDS.createResolver("UpdateMutation", {
      fieldName: "updateRowDetail",
      typeName: "Mutation",
    });
    demoDS.createResolver("DeleteSRDmutation", {
      fieldName: "deleteSpecRowDetail",
      typeName: "Mutation",
    });
    demoDS.createResolver("DeleteAllMutation", {
      fieldName: "deleteAll",
      typeName: "Mutation",
    });

    // creating a table with dynamoDB
    const demoTable = new dynamoDB.Table(this, "CRUD-table", {
      tableName: "cudrd-Table",
      partitionKey: {
        name: "id",
        type: dynamoDB.AttributeType.STRING,
      },
    });

    demoTable.grantFullAccess(lambdaFunc);
    lambdaFunc.addEnvironment("STORE_TABLE", demoTable.tableName);
  
  }
}
