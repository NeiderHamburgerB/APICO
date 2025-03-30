import swaggerJSDoc, { Options } from "swagger-jsdoc";

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'APICOs - API de Gestión de Envios y Usuarios',
        version: '1.0.0',
        description: 'Documentación de la API usando Swagger',
    },
    servers: [
        {
            url: 'http://localhost:3002/api/v1',
            description: 'Desarrollo',
        },
    ],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },

};


const options: Options = {
    swaggerDefinition,
    apis: ['src/interfaces/**/*.ts', 'src/domain/**/*.ts'],
};

const swaggerOptions = {
    customCss: `
        .swagger-ui .topbar { background-color: #4c4c4c !important; } 
        .swagger-ui .btn.authorize { background-color: #88aba3 !important; color: white; }
        .swagger-ui .opblock-summary-method { background-color: #88aba3 !important; color: white; } 
    `,
    customSiteTitle: 'Documentación APICOs',
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerSpec, swaggerOptions };
