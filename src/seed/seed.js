import AWS from "aws-sdk";
import { v4 as uuid } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const dynamoDb = new AWS.DynamoDB({
  endpoint: "http://localhost:8000",
  region: "us-east-1",
});

const documentClient = new AWS.DynamoDB.DocumentClient({
  endpoint: "http://localhost:8000",
  region: "us-east-1",
});

const tableName = process.env.ORDERS_TABLE || "OrdersTable";

const createTable = async () => {
  const params = {
    TableName: tableName,
    KeySchema: [
      { AttributeName: "orderId", KeyType: "HASH" },
    ],
    AttributeDefinitions: [
      { AttributeName: "orderId", AttributeType: "S" },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  };

  try {
    await dynamoDb.createTable(params).promise();
  } catch (error) {
    if (error.code === "ResourceInUseException") {
    } else {
      console.error("Error creating table:", error.message);
    }
  }
};

const seedData = async () => {
  const items = [
    { orderId: uuid(), details: { customerName: "John Doe", description: "Text for description" } }, 
    { orderId: uuid(), details: { customerName: "Jane Doe", description: "Text for description" } },
    { orderId: uuid(), details: { customerName: "Alice Smith", description: "Text for description" } },
    { orderId: uuid(), details: { customerName: "Bob Johnson", description: "Text for description" } },
    { orderId: uuid(), details: { customerName: "Charlie Brown", description: "Text for description" } },
  ];

  for (const item of items) {
    const params = {
      TableName: tableName,
      Item: item,
    };

    try {
      const data = await documentClient.put(params).promise();
    } catch (error) {
      console.error(`Error inserting item with orderId: ${item.orderId}`, error.message);
    }
  }
};

// Função principal
const main = async () => {
  await createTable();
  await seedData();
};

main().catch((error) => console.error("Error in seeding process:", error.message));