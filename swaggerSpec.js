const swaggerSpec = {
    openapi: "3.0.0",
    info: {
        title: "API do Sistema Web (Trabalho DevOps)",
        version: "1.0.0",
        description: "Documentação da API para o trabalho de backend. Solicite autenticação JWT para todos os horários de Professores.",
    },
    servers: [
        {
            url: `https://projeto-backend-zw5n.onrender.com`, // URL de Produção no Render
            description: "Servidor de Produção (Cloud)",
        },
        {
            url: `http://localhost:3000`, // URL de Desenvolvimento Local
            description: "Servidor Local (Desenvolvimento)",
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
        schemas: {
            Professor: {
                type: "object",
                properties: {
                    id: { type: "integer", example: 1 },
                    nome: { type: "string", example: "Dr. Fernando" },
                    materia: { type: "string", example: "DevOps" },
                },
                required: ["nome", "materia"],
            },
            User: {
                type: "object",
                properties: {
                    email: { type: "string", example: "teste@site.com" },
                    password: { type: "string", example: "senha123" },
                },
                required: ["email", "password"],
            },
        },
    },
    security: [
        {
            bearerAuth: [],
        },
    ],
    paths: {
        "/register": {
            post: {
                tags: ["Autenticação"],
                summary: "Registra um novo usuário.",
                security: [],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } },
                },
                responses: {
                    "201": { description: "Usuário criado com sucesso." },
                    "400": { description: "E-mail já cadastrado ou dados obrigatórios ausentes." },
                },
            },
        },
        "/login": {
            post: {
                tags: ["Autenticação"],
                summary: "Autentica um usuário e retorna um token JWT.",
                security: [],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } },
                },
                responses: {
                    "200": { description: "Login bem-sucedido. Retorna o token JWT." },
                    "401": { description: "Credenciais inválidas." },
                },
            },
        },
        "/professores": {
            get: {
                tags: ["Professores"],
                summary: "Lista todos os professores.",
                responses: {
                    "200": { description: "Lista de professores.", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Professor" } } } }, },
                    "401": { description: "Não autorizado (Token JWT ausente ou inválido)." },
                },
            },
            post: {
                tags: ["Professores"],
                summary: "Cadastra um novo professor.",
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/Professor" } } },
                },
                responses: {
                    "201": { description: "Professor cadastrado com sucesso." },
                    "400": { description: "Nome e matéria são obrigatórios." },
                },
            },
        },
        "/professores/{id}": {
            put: {
                tags: ["Professores"],
                summary: "Atualiza um professor pelo ID.",
                parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, description: "ID do professor." }],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { type: "object", properties: { nome: { type: "string" }, materia: { type: "string" } } } }, },
                },
                responses: {
                    "200": { description: "Professor atualizado com sucesso." },
                    "404": { description: "Professor não encontrado." },
                },
            },
            delete: {
                tags: ["Professores"],
                summary: "Deleta um professor pelo ID.",
                parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, description: "ID do professor." }],
                responses: {
                    "204": { description: "Professor deletado com sucesso (No Content)." },
                    "404": { description: "Professor não encontrado." },
                },
            },
        },
    },
};

module.exports = swaggerSpec;