const { handler } = require("./../orders/deleteOrder");
const AWS = require("aws-sdk");

jest.mock("aws-sdk", () => {
  const mockDocumentClient = {
    delete: jest.fn(),
  };
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => mockDocumentClient),
    },
  };
});

describe("Delete Order Lambda", () => {
  const mockDelete = AWS.DynamoDB.DocumentClient.prototype.delete;
  const ORDERS_TABLE = "OrdersTable"; 

  let callback;

  beforeEach(() => {
    jest.clearAllMocks();
    callback = jest.fn();
  });

  it("should return 400 if 'id' is missing", async () => {
    const event = { pathParameters: {} };

    await handler(event, {}, callback);

    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        message: "The Order Id is required.",
      }),
    });
  });

  it("should delete an order successfully", async () => {
    const id = "12345";
    const event = { pathParameters: { id } };

    mockDelete.mockReturnValueOnce({
      promise: jest.fn().mockResolvedValueOnce({}),
    });

    await handler(event, {}, callback);

    expect(mockDelete).toHaveBeenCalledWith({
      TableName: ORDERS_TABLE,
      Key: { orderId: id },
    });

    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        message: `Order with ID '${id}' was removed.`,
      }),
    });
  });

  it("should return 500 if DynamoDB delete fails", async () => {
    const id = "12345";
    const event = { pathParameters: { id } };

    mockDelete.mockReturnValueOnce({
      promise: jest.fn().mockRejectedValueOnce(new Error("DynamoDB Error")),
    });

    await handler(event, {}, callback);

    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        message: "Error on remove the order.",
        error: "DynamoDB Error",
      }),
    });
  });
});
