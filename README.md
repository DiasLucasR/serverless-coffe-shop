<!--
title: 'Coffee Shop Serverless API'
description: 'This project demonstrates a serverless Coffee Shop API built with Node.js, AWS Lambda, and API Gateway using the Serverless Framework.'
layout: Doc
framework: v3
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
-->

# Coffee Shop Serverless API

This project demonstrates a serverless Coffee Shop API built with Node.js, AWS Lambda, and API Gateway using the Serverless Framework.

## Features

- **Serverless Architecture**: Built on AWS Lambda and API Gateway.
- **Node.js**: Lightweight and efficient backend.
- **Scalable**: Automatically scales with demand.
- **Local Development**: Test and debug locally using the Serverless Framework.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later recommended)
- [Serverless Framework](https://www.serverless.com/framework/docs/getting-started/)
- AWS CLI configured with appropriate credentials
- Java

## Usage

### Deployment

To deploy the Coffee Shop API, run the following command:

```
serverless deploy
```

After deployment, you should see output similar to:

```
Deploying "coffee-shop-api" to stage "dev" (us-east-1)

✔ Service deployed to stack coffee-shop-api-dev (91s)

endpoint: GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/
functions:
  hello: coffee-shop-api-dev-hello (1.6 kB)
```

_Note_: By default, the API is public and accessible to anyone. For production, consider adding an authorizer. Refer to the [HTTP API (API Gateway V2) event docs](https://www.serverless.com/framework/docs/providers/aws/events/http-api) for more details.


### Local Development

To develop and test locally, use the `dev` command:

```
serverless offline start --stage dev
```

This starts a local emulator of AWS Lambda and tunnels requests to/from AWS Lambda. You can invoke the function locally and see results immediately without redeploying.

When you're ready to deploy your changes, run:

```
serverless deploy
```

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License.