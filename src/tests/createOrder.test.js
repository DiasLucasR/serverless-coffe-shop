const AWS = require('aws-sdk');
const { faker } = require('@faker-js/faker');
const { handler } = require('../orders/createOrder');

// Mock do módulo AWS SDK
jest.mock('aws-sdk', () => {
  const mDynamoDB = {
    put: jest.fn().mockReturnThis(),
    promise: jest.fn()
  };
  
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => ({
        put: mDynamoDB.put,
        promise: mDynamoDB.promise
      }))
    }
  };
});

describe('POST /orders', () => {
  let dynamoDBMock;
  
  beforeEach(() => {
    jest.clearAllMocks();
    dynamoDBMock = new AWS.DynamoDB.DocumentClient();
    
    jest.spyOn(Date, 'now').mockImplementation(() => 1712600000000); // 2024-04-09T00:00:00.000Z
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
  
  test('should return code 201', async () => {

    const mockOrder = generateMockOrder();
    
    dynamoDBMock.promise.mockResolvedValueOnce({});
    
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(mockOrder)
    };
    
    const result = await handler(event);          

    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body)).toEqual({
      message: 'Order Created!',
      orderId: expect.any(String), 
    });
  });

  test('should return code 400', async () => {
    const event = {
      httpMethod: 'POST',
      body: '{"invaid": "json"}'
    };
    
    const result = await handler(event);
    
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      message: 'Invalid request. Order details are required.',
    });
    
    expect(dynamoDBMock.put).not.toHaveBeenCalled();
  });

  test('should return code 500', async () => {
    const mockOrderRequest = generateMockOrder();
    
    const dbError = new Error('Internal Error.');
    dynamoDBMock.promise.mockRejectedValueOnce(dbError);
    
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(mockOrderRequest)
    };
    
    const result = await handler(event);
    
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      message: 'Error on create order.',
      error: dbError.message
    });
    
    expect(dynamoDBMock.put).toHaveBeenCalledTimes(1);
  });
  
});