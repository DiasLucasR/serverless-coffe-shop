const { faker } = require("@faker-js/faker");
const { handler } = require("../orders/updateOrder");
const AWS = require("aws-sdk");

jest.mock("aws-sdk", () => {
  const mockDocumentClient = {
    update: jest.fn().mockReturnThis(),
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

describe("PUT /orders", () => {
  let dynamoDBMock;

  beforeEach(() => {
    jest.clearAllMocks();
    dynamoDBMock = new AWS.DynamoDB.DocumentClient();
  });

  test('should return code 400', async () => {
    const mockOrder = generateMockOrder();
    const id = mockOrder.orderId;

    const event = {
      pathParameters: { id },
      body: null
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      message: 'Order ID and update data are required.'
    });
  });

  test("should return code 200", async () => {
    const mockOrder = generateMockOrder();
    const id = mockOrder.orderId;

    const updatedDetails = {
      clientName: faker.person.fullName(),
      items: [faker.commerce.productName(), faker.commerce.productName()],
      description: faker.lorem.lines()
    };

    dynamoDBMock.promise.mockResolvedValueOnce(mockOrder);

    const event = {
      pathParameters: { id },
      body: JSON.stringify({
        details: updatedDetails
      })
    };

    const result = await handler(event);
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      message: `Order with ID '${id}' was updated successfully.`,
    });

  });

  test('should return code 500', async () => {
    const mockOrder = generateMockOrder();
    const id = mockOrder.orderId;

    const dbError = new Error('Internal Error DynamoDB');
    dynamoDBMock.promise.mockRejectedValueOnce(dbError);

    const event = {
      pathParameters: { id },
      body: JSON.stringify({
        details: {
          clientName: faker.person.fullName(),
          items: [faker.productName, faker.productName],
          description: faker.string.lorem
        }
      })
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      message: 'Error updating order.',
      error: dbError.message
    });
  });
});