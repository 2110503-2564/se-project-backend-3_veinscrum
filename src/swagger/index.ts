import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Job Fair API",
            version: "1.0.0",
            description: "API documentation for the Job Fair application",
        },
        servers: [
            {
                url: process.env.SERVER_URL || "/api/v1",
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
    apis: ["./src/swagger/definitions/*.ts", "./src/swagger/routes/*.ts"],
};

export const swaggerDocs = swaggerJSDoc(swaggerOptions);
