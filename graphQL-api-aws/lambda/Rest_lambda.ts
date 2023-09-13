import * as AWS from "aws-sdk";
import { randomUUID } from "crypto";
const docClient = new AWS.DynamoDB.DocumentClient();

type dymanoDataStructure = {
  id: string;
  username: string;
  email: string;
};

exports.handler = async (event: any) => {
  const method = event.httpMethod;
  // event.queryStringParameters.name;
  // event.queryStringParameters.name // dot notation
  // event.queryStringParameters["name"] // bracket notation
  if (method === "GET") {
    // const body =
    //   typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    // const id = body.id; // this is fetch id to retrive data from db by send id in the body response
    // const queryId = event.queryStringParameters.id; // second way to send id in the URL like /prod/user?id=123
    // const queryId = body.id;
    const params = {
      TableName: process.env.USER_TABLE || "",
      //   Key: queryId,
    };
    const data = await docClient.scan(params).promise();
    // const getResponse  = await docClient.get(params).promise()
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Get request trigger successfully",
        response: data,
      }),
    };
  } else if (method === "POST") {
    // parse event.body if it is a JSON string
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    // get data from body
    const id = body.id;
    const username = body.username;
    const email = body.email;
    const postNewUser = {
      TableName: process.env.USER_TABLE || "",
      Item: {
        id: id,
        username: username,
        email: email,
      },
    };
    const data = await docClient.put(postNewUser).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "POST request trigger successfully",
        response: data,
      }),
    };
  } else if (method === "PUT") {
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const params = {
      TableName: process.env.USER_TABLE || "",
      Key: { id: body.id },
      UpdateExpression: `SET #attrName = :newUsername`,
      ExpressionAttributeNames: { "#attrName": "username" },
      ExpressionAttributeValues: { ":newUsername": body.username },
    };
    const updateResponsse = await docClient.update(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Update request trigger successfully",
        reesponse: {
          id: body.id,
          username: body.username,
          response: updateResponsse.Attributes,
        },
        // response: updateItem,
      }),
    };
  } else if (method === "DELETE") {
    // all methods name should be capital letter at time of comparing like method == "DELETE"
    const params = { TableName: process.env.USER_TABLE || "" };
    try {
      const allDelItems = await docClient.scan(params).promise();
      console.log("Items you want to delete", allDelItems.Count);
      if (allDelItems && allDelItems.Items) {
        for (const item of allDelItems.Items) {
          const deleteItem = {
            TableName: process.env.USER_TABLE || "",
            Key: {
              id: item.id,
            },
          };
          await docClient.delete(deleteItem).promise();
          console.log("Item deleted successfully:", item);
        }
      } else {
        console.log("table is empty already");
        return "table is empty already";
      }
    } catch (error) {
      console.log("Error deleting items:", error);
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Deleted request trigger successfully",
      }),
    };
  }
  return "method not identitfy";
};
