import AWS from "aws-sdk";
import { ORDERS_TABLE } from "../../constants.js";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
  const tableName = ORDERS_TABLE;

  const params = {
    TableName: tableName,
  };

  try {
    const data = await dynamoDb.scan(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(data.Items),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error fetching orders",
        error: error.message,
      }),
    };
  }
};
