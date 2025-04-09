const { handler } = require("./../orders/updateOrder");
const AWS = require("aws-sdk");

jest.mock("aws-sdk", () => {
  const mockDocumentClient = {
    update: jest.fn(),
  };
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => mockDocumentClient),
    },
  };
});

describe("Update Order Lambda", () => {
  const mockUpdate = AWS.DynamoDB.DocumentClient.prototype.update;
  const ORDERS_TABLE = "OrdersTable"; 
  let callback;

  beforeEach(() => {
    jest.clearAllMocks();
    callback = jest.fn();
  });

  it("should update the order successfully", async () => {
    const orderId = "12345";
    const requestBody = {
      customerName: "Jane Doe",
      description: "Updated description",
    };

    const event = {
      pathParameters: { id: orderId },
      body: JSON.stringify(requestBody),
    };

    const updateResult = {
      Attributes: {
        customerName: "Jane Doe",
        description: "Updated description",
      },
    };

    mockUpdate.mockReturnValueOnce({
      promise: jest.fn().mockResolvedValueOnce(updateResult),
    });

    await handler(event, {}, callback);

    expect(mockUpdate).toHaveBeenCalledWith({
      TableName: ORDERS_TABLE,
      Key: { orderId },
      UpdateExpression: "SET #customerName = :customerName, #description = :description",
      ExpressionAttributeNames: {
        "#customerName": "customerName",
        "#description": "description",
      },
      ExpressionAttributeValues: {
        ":customerName": "Jane Doe",
        ":description": "Updated description",
      },
      ReturnValues: "UPDATED_NEW",
    });

    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        message: `Order with ID '${orderId}' was updated successfully.`,
        updatedAttributes: updateResult.Attributes,
      }),
    });
  });

  it("should return 400 when ID or request body is missing", async () => {
    const event = {
      pathParameters: { id: "" },
      body: null,
    };

    await handler(event, {}, callback);

    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        message: "Order ID and update data are required.",
      }),
    });
  });

  it("should return 500 on DynamoDB error", async () => {
    const orderId = "12345";
    const requestBody = {
      customerName: "Jane Doe",
    };

    const event = {
      pathParameters: { id: orderId },
      body: JSON.stringify(requestBody),
    };

    const errorMessage = "DynamoDB Update Error";

    mockUpdate.mockReturnValueOnce({
      promise: jest.fn().mockRejectedValueOnce(new Error(errorMessage)),
    });

    await handler(event, {}, callback);

    expect(mockUpdate).toHaveBeenCalledWith({
      TableName: ORDERS_TABLE,
      Key: { orderId },
      UpdateExpression: "SET #customerName = :customerName",
      ExpressionAttributeNames: {
        "#customerName": "customerName",
      },
      ExpressionAttributeValues: {
        ":customerName": "Jane Doe",
      },
      ReturnValues: "UPDATED_NEW",
    });

    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        message: "Error updating order.",
        error: errorMessage,
      }),
    });
  });
});
