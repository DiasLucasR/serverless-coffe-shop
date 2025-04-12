import { handler } from "../orders/createOrder";
import AWS from "aws-sdk";
import { faker } from "@faker-js/faker";

jest.mock("aws-sdk", () => {
    const mockPut = jest.fn();
    const DocumentClient = jest.fn(() => ({
        put: mockPut,
    }));

    return { DynamoDB: { DocumentClient } };
});



describe("createOrder.handler", () => {
    const mockPut = AWS.DynamoDB.DocumentClient.prototype.put;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("deve retornar 400 quando o body não for fornecido", async () => {
        const event = { body: null };

        const result = await handler(event);

        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body).message).toBe(
            "Pedido inválido. Nome do cliente e itens são obrigatórios."
        );
    });

    it("deve retornar 400 quando 'details' não está presente no body", async () => {
        const event = { body: JSON.stringify({}) };

        const result = await handler(event);

        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body).message).toBe(
            "Pedido inválido. Nome do cliente e itens são obrigatórios."
        );
    });

    it("deve criar um pedido com sucesso", async () => {
        const clientName = faker.person.fullName();
        const items = Array.from({ length: 3 }, () => faker.commerce.productName());
        const description = faker.lorem.sentence();

        const event = {
            body: JSON.stringify({
                details: {
                    clientName,
                    item: items,
                    description,
                },
            }),
        };

        mockPut.mockImplementation(() => ({
            promise: jest.fn().mockResolvedValueOnce({}),
        }));

        const result = await handler(event);

        expect(result.statusCode).toBe(201);
        const responseBody = JSON.parse(result.body);
        expect(responseBody.message).toBe("Order Created!");
        expect(responseBody.orderId).toBe("mocked-uuid");

        expect(mockPut).toHaveBeenCalledWith({
            TableName: process.env.ORDERS_TABLE || "OrdersTable",
            Item: {
                orderId: "mocked-uuid",
                details: {
                    clientName,
                    item: items,
                    description,
                },
            },
        });
    });

    it("deve retornar 500 quando ocorrer um erro na inserção", async () => {
        const clientName = faker.person.fullName();
        const items = Array.from({ length: 3 }, () => faker.commerce.productName());
        const description = faker.lorem.sentence();

        const event = {
            body: JSON.stringify({
                details: {
                    clientName,
                    item: items,
                    description,
                },
            }),
        };

        mockPut.mockImplementation(() => ({
            promise: jest.fn().mockRejectedValueOnce(new Error("DynamoDB error")),
        }));

        const result = await handler(event);

        expect(result.statusCode).toBe(500);
        const responseBody = JSON.parse(result.body);
        expect(responseBody.message).toBe("Error on create order.");
        expect(responseBody.error).toBe("DynamoDB error");

        expect(mockPut).toHaveBeenCalledWith({
            TableName: process.env.ORDERS_TABLE || "OrdersTable",
            Item: {
                orderId: "mocked-uuid",
                details: {
                    clientName,
                    item: items,
                    description,
                },
            },
        });
    });
});
