const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "API do Sistema Web (Trabalho DevOps)",
    version: "1.0.0",
    description: "Documentação da API para o trabalho de backend. Solicita autenticação JWT para todos os horários de Professores.",
  },
  servers: [
    {
      url: "https://projeto-backend-zw5n.onrender.com",
      description: "Servidor de Produção (Cloud)",
    },
    {
      url: "http://localhost:3000",
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
      // Definição da Entidade Professor para o Swagger
      Professor: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1, description: "ID do Professor (Gerado automaticamente)" },
          nome: { type: "string", example: "Dr. Fernando", description: "Nome do Professor" },
          materia: { type: "string", example: "DevOps", description: "Matéria lecionada pelo Professor" },
        },
        required: ["nome", "materia"],
      },
      // Definição da Entidade Usuário para Cadastro/Login
      UserCredentials: {
        type: "object",
        properties: {
          email: { type: "string", example: "admin@site.com" },
          password: { type: "string", example: "senha123" },
        },
        required: ["email", "password"],
      },
    },
  },
  // Security Global (Todas as rotas por padrão requerem autenticação, a menos que especificado diferente)
  security: [
    {
      bearerAuth: [],
    },
  ],
  // 📢 Definição das Rotas (Operações)
  paths: {
    // --- Rotas de Autenticação (NÃO requerem token) ---
    "/register": {
      post: {
        summary: "Registra um novo usuário.",
        tags: ["Autenticação"],
        security: [], // Anula a segurança global
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UserCredentials",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Usuário criado com sucesso.",
          },
          "400": {
            description: "Dados inválidos (Email/Senha obrigatórios ou Email já cadastrado).",
          },
        },
      },
    },
    "/login": {
      post: {
        summary: "Autentica um usuário e retorna um token JWT.",
        tags: ["Autenticação"],
        security: [], // Anula a segurança global
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UserCredentials",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login bem-sucedido. Retorna o token JWT.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Login bem-sucedido!" },
                    token: { type: "string", example: "eyJhbGciOiJIUzI1Ni..." },
                  },
                },
              },
            },
          },
          "401": {
            description: "Credenciais inválidas (Email ou Senha incorretos).",
          },
        },
      },
    },
    // --- Rotas de Professores (REQUEREM token) ---
    "/professores": {
      get: {
        summary: "Lista todos os professores.",
        tags: ["Professores"],
        responses: {
          "200": {
            description: "Lista de professores.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Professor",
                  },
                },
              },
            },
          },
          "401": {
            description: "Não autorizado (Token JWT ausente ou inválido).",
          },
        },
      },
      post: {
        summary: "Cadastra um novo professor.",
        tags: ["Professores"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Professor",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Professor cadastrado com sucesso.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Professor",
                },
              },
            },
          },
          "400": {
            description: "Nome e matéria são obrigatórios.",
          },
        },
      },
    },
    "/professores/{id}": {
      put: {
        summary: "Atualiza um professor pelo ID.",
        tags: ["Professores"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: {
              type: "integer",
            },
            description: "ID do professor a ser atualizado.",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  nome: { type: "string", example: "Dra. Ana Paula" },
                  materia: { type: "string", example: "Cloud Computing" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Professor atualizado com sucesso.",
          },
          "404": {
            description: "Professor não encontrado.",
          },
        },
      },
      delete: {
        summary: "Deleta um professor pelo ID.",
        tags: ["Professores"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: {
              type: "integer",
            },
            description: "ID do professor a ser deletado.",
          },
        ],
        responses: {
          "204": {
            description: "Professor deletado com sucesso (No Content).",
          },
          "404": {
            description: "Professor não encontrado.",
          },
        },
      },
    },
  },
};

module.exports = swaggerSpec;
