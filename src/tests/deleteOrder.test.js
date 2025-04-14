const { faker } = require("@faker-js/faker");
const { handler } = require("../orders/deleteOrder");
const AWS = require("aws-sdk");

jest.mock("aws-sdk", () => {
  const mockDocumentClient = {
    delete: jest.fn().mockReturnThis(),
    promise: jest.fn()
  };
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => mockDocumentClient),
    },
  };
});

const generateMockOrder = () => {
  return {
    orderId: faker.string.uuid(),
    details: {
      clientName: faker.person.fullName(),
      items: Array.from({ length: 3 }, () => faker.commerce.productName()),
      description: faker.lorem.sentence()
    }
  };
};

describe("DELETE /orders", () => {
  let dynamoDBMock;

  beforeEach(() => {
    jest.clearAllMocks();
    dynamoDBMock = new AWS.DynamoDB.DocumentClient();
  });

  test('should return code 400 ', async () => {
    const event = { pathParameters: {} }; 
    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      message: 'The Order Id is required.'
    });
  });

  test("should return code 200", async () => {
    const mockOrder = generateMockOrder();
    const id = mockOrder.orderId;
    
    dynamoDBMock.promise.mockResolvedValueOnce({
      Attributes: mockOrder
    });

    const event = { pathParameters: { id } };

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      message: `Order with ID '${mockOrder.orderId}' was removed.`,
    });
  });

  test('should return code 500 when DynamoDB fails', async () => {
    const mockOrder = generateMockOrder();
    const id = mockOrder.orderId;

    const dbError = new Error('Internal Error.');
    dynamoDBMock.promise.mockRejectedValueOnce(dbError);

    const event = { pathParameters: { id } };

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      message: 'Error on remove the order.',
      error: dbError.message
    });
  });
});