const AWS = require("aws-sdk");
const { ORDERS_TABLE } = require("../../constants");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.updateOrder = async (event, context, callback) => {
  const tableName = ORDERS_TABLE;
  const orderId = event.pathParameters.id; 
  const requestBody = JSON.parse(event.body);


  if (!orderId || !requestBody || Object.keys(requestBody).length === 0) {
    callback(null, {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "ID do pedido e dados para atualização são obrigatórios.",
      }),
    });
    return;
  }

  const updateExpression = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  for (const key in requestBody) {
    updateExpression.push(`#${key} = :${key}`);
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = requestBody[key];
  }

  const params = {
    TableName: tableName,
    Key: {
      orderId: orderId,
    },
    UpdateExpression: `SET ${updateExpression.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "UPDATED_NEW", 
  };

  try {
    const result = await dynamoDb.update(params).promise();

    callback(null, {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: `Pedido com ID '${orderId}' foi atualizado com sucesso.`,
        updatedAttributes: result.Attributes,
      }),
    });
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error);

    callback(null, {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Erro ao atualizar o pedido.",
        error: error.message,
      }),
    });
  }
};
