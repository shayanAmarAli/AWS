import { DynamoDB } from "aws-sdk";
import { randomUUID } from "crypto";

const docClient = new DynamoDB.DocumentClient();

type dynamoType = {
  id: string;
  username: string;
};

interface AppSyncEvent {
  info: {
    fieldName: String;
  };
  arguments: {
    storeId: String;
    msg: dynamoType; // arguments contain properties that have send to rresolvers and define in the schema snf must have same name.
  };
}

exports.handler = async (event: AppSyncEvent) => {
  if (event.info.fieldName == "addMutation") {
    event.arguments.msg.id = randomUUID();
    const params = {
      TableName: process.env.STORE_TABLE || "", // this is the required no matter what query of CRUD you fired.
      Item: event.arguments.msg,
    };
    const data = await docClient.put(params).promise();
    return event.arguments.msg;
  } else if (event.info.fieldName == "FetchallData") {
    const params = {
      TableName: process.env.STORE_TABLE || "",
      Item: event.arguments.msg,
    };
    const data = await docClient.scan(params).promise();
    return data.Items;
  } else if (event.info.fieldName == "getSpecRowDetail") {
    // const paramss = {
    //   TableName: "Music",
    //   Key: {
    //     Artist: event.pathParameters.Artist,
    //     SongTitle: event.pathParameters.SongTitle,
    //   },
    //   AttributesToGet: ["Artist", "Genre"],
    // };
    const params = {
      TableName: process.env.STORE_TABLE || "",
      Key: {
        //   The Key parameter specifies the primary key of the item to retrieve,
        id: event.arguments.storeId,
      },
      // ProjectionExpression: "id, username", // ProjectionExpression parameter specifies which attributes to retrieve.
      AttributesToGet: ["id", "username"], // AttributesToGet parameter specifies which attributes to retrieve. You can modify these parameters to suit your needs
    };
    const data = await docClient.get(params).promise();
    return data.Item;
  } else if (event.info.fieldName == "deleteSpecRowDetail") {
    const params = {
      TableName: process.env.STORE_TABLE || "",
      Key: {
        id: event.arguments.storeId,
      },
    };
    const data = await docClient.delete(params).promise();
    return data.Attributes;
  } else if (event.info.fieldName == "deleteAll") {
    const params = {
      TableName: process.env.STORE_TABLE || "",
    };
    try {
      const allDelItems = await docClient.scan(params).promise();
      console.log("Items you want to delete", allDelItems.Count);
      if (allDelItems && allDelItems.Items) {
        for (const item of allDelItems.Items) {
          const deleteItem = {
            TableName: process.env.STORE_TABLE || "",
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
  } else if (event.info.fieldName == "updateRowDetail") {
    const params = {
      TableName: process.env.STORE_TABLE || "",
      Key: {
        id: event.arguments.msg.id,
      },
      // # symbol is used to indicate an attribute name placeholder and : symbol is used to indicate a value....
      // ...placeholder in the UpdateExpression parameter
      UpdateExpression: `SET #attrName = :newUsername`,
      ExpressionAttributeNames: {
        "#attrName": "username",
      },
      ExpressionAttributeValues: {
        // DynamoDB supports several other data types for attribute values, including numbers (N), binary data (B), Boolean (BOOL)
        ":newUsername": event.arguments.msg.username,
      },
    };
    const updateItem = await docClient.update(params).promise();
    console.log("updated response",updateItem.$response);
    return "Item updated"
  }
  return "hello";
};

// to get the data of specific columns just send the name of that column
// updateRowDetail
