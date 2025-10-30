import "reflect-metadata";
import express, { Request, Response } from "express";
import { AppDataSource } from "./data-source";
import { Professor } from "./entities/Professor";
import { User } from "./entities/User";
import { authMiddleware } from "./middlewares/authMiddleware";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import cors from "cors";

// As bibliotecas do Swagger não têm tipagem padrão
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

// Inicializa a conexão com o banco de dados (Postgres na nuvem / SQLite local)
AppDataSource.initialize()
  .then(() => {
    console.log("Banco de dados conectado com sucesso!");

    const app = express();
    app.use(express.json());

    // ✅ Configuração do CORS: Permite o Render (produção) e o localhost (desenvolvimento)
    app.use(
      cors({
        origin: [
          "https://projeto-backend-1-bmv4.onrender.com", // Domínio do seu frontend (Cloud)
          "http://localhost:3000", // Domínio para testes locais
        ],
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

    const PORT = process.env.PORT || 3000;
    const JWT_SECRET =
      process.env.JWT_SECRET || "sua-chave-secreta-super-forte-12345";

    // 📚 Configuração do Swagger
    const swaggerOptions = {
      definition: {
        openapi: "3.0.0",
        info: {
          title: "API do Sistema Web (Trabalho DevOps)",
          version: "1.0.0",
          description: "Documentação da API para o trabalho de backend. Requer autenticação JWT para todas as rotas de Professores.",
        },
        servers: [
          {
            url: `https://projeto-backend-zw5n.onrender.com`, // URL de Produção no Render
            description: "Servidor de Produção (Cloud)",
          },
          {
            url: `http://localhost:${PORT}`, // URL de Desenvolvimento Local
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
                id: { type: "integer", example: 1 },
                nome: { type: "string", example: "Dr. Fernando" },
                materia: { type: "string", example: "DevOps" },
              },
              required: ["nome", "materia"],
            },
          },
        },
        // Security Global (Todas as rotas por padrão requerem autenticação, a menos que especificado diferente)
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      // 🚨 CORREÇÃO FINAL: Lendo o ficheiro JavaScript compilado (dist/index.js)
      // Como o build do GitHub Actions/Render é feito antes de rodar, o ficheiro .js deve existir.
      apis: ["./dist/index.js"],
    };

    const specs = swaggerJsdoc(swaggerOptions);
    // Rota de acesso à documentação
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

    // Rota raiz (Verificação de status)
    app.get("/", (req: Request, res: Response) => {
      res.send("API 100% DEPLOYADA E FUNCIONANDO!");
    });

    // --- ROTAS DE AUTENTICAÇÃO ---

    /**
     * @swagger
     * /register:
     * post:
     * summary: Registra um novo usuário.
     * tags: [Autenticação]
     * security: []
     * requestBody:
     * required: true
     * content:
     * application/json:
     * schema:
     * type: object
     * properties:
     * email:
     * type: string
     * example: admin@site.com
     * password:
     * type: string
     * example: senha123
     * responses:
     * 201:
     * description: Usuário criado com sucesso. Retorna o ID e Email.
     * 400:
     * description: Dados inválidos (Email/Senha obrigatórios ou Email já cadastrado).
     * 500:
     * description: Erro interno do servidor.
     */
    app.post("/register", async (req: Request, res: Response) => {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email e senha são obrigatórios" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = new User();
      user.email = email;
      user.passwordHash = passwordHash;

      const repositorio = AppDataSource.getRepository(User);

      try {
        await repositorio.save(user);
        res.status(201).json({ id: user.id, email: user.email });
      } catch (error: any) {
        // Tratamento genérico para erro de constraint única (email duplicado)
        if (error.code && (error.code === "23505" || error.code === "SQLITE_CONSTRAINT")) {
            return res.status(400).json({ message: "E-mail já cadastrado" });
        }
        res
          .status(500)
          .json({ message: "Erro ao cadastrar usuário", error: error.message });
      }
    });

    /**
     * @swagger
     * /login:
     * post:
     * summary: Autentica um usuário e retorna um token JWT.
     * tags: [Autenticação]
     * security: []
     * requestBody:
     * required: true
     * content:
     * application/json:
     * schema:
     * type: object
     * properties:
     * email:
     * type: string
     * example: admin@site.com
     * password:
     * type: string
     * example: senha123
     * responses:
     * 200:
     * description: Login bem-sucedido. Retorna o token JWT.
     * content:
     * application/json:
     * schema:
     * type: object
     * properties:
     * message:
     * type: string
     * token:
     * type: string
     * 401:
     * description: Credenciais inválidas (Email ou Senha incorretos).
     * 400:
     * description: Email e senha são obrigatórios.
     */
    app.post("/login", async (req: Request, res: Response) => {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email e senha são obrigatórios" });
      }

      const repositorio = AppDataSource.getRepository(User);
      const user = await repositorio.findOneBy({ email: email });

      if (!user) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      const senhaCorreta = await bcrypt.compare(password, user.passwordHash);
      if (!senhaCorreta) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({ message: "Login bem-sucedido!", token });
    });

    // --- MIDDLEWARE DE AUTENTICAÇÃO ---
    // 🔒 Todas as rotas abaixo de /professores serão protegidas
    app.use("/professores", authMiddleware);

    // --- ROTAS DE PROFESSORES (CRUD) ---

    /**
     * @swagger
     * /professores:
     * get:
     * summary: Lista todos os professores.
     * tags: [Professores]
     * responses:
     * 200:
     * description: Lista de professores.
     * content:
     * application/json:
     * schema:
     * type: array
     * items:
     * $ref: '#/components/schemas/Professor'
     * 401:
     * description: Não autorizado (Token JWT ausente ou inválido).
     */
    app.get("/professores", async (req: Request, res: Response) => {
      const repositorio = AppDataSource.getRepository(Professor);
      const professores = await repositorio.find();
      res.json(professores);
    });

    /**
     * @swagger
     * /professores:
     * post:
     * summary: Cadastra um novo professor.
     * tags: [Professores]
     * requestBody:
     * required: true
     * content:
     * application/json:
     * schema:
     * $ref: '#/components/schemas/Professor'
     * responses:
     * 201:
     * description: Professor cadastrado com sucesso.
     * content:
     * application/json:
     * schema:
     * $ref: '#/components/schemas/Professor'
     * 400:
     * description: Nome e matéria são obrigatórios.
     * 401:
     * description: Não autorizado.
     */
    app.post("/professores", async (req: Request, res: Response) => {
      const { nome, materia } = req.body;
      if (!nome || !materia) {
        return res
          .status(400)
          .json({ message: "Nome e matéria são obrigatórios" });
      }
      const novoProfessor = new Professor();
      novoProfessor.nome = nome;
      novoProfessor.materia = materia;
      const repositorio = AppDataSource.getRepository(Professor);
      await repositorio.save(novoProfessor);
      res.status(201).json(novoProfessor);
    });

    /**
     * @swagger
     * /professores/{id}:
     * put:
     * summary: Atualiza um professor pelo ID.
     * tags: [Professores]
     * parameters:
     * - in: path
     * name: id
     * required: true
     * schema:
     * type: integer
     * description: ID do professor a ser atualizado.
     * requestBody:
     * required: true
     * content:
     * application/json:
     * schema:
     * type: object
     * properties:
     * nome:
     * type: string
     * materia:
     * type: string
     * responses:
     * 200:
     * description: Professor atualizado com sucesso.
     * 404:
     * description: Professor não encontrado.
     * 401:
     * description: Não autorizado.
     */
    app.put("/professores/:id", async (req: Request, res: Response) => {
      const id = parseInt(req.params.id);
      const { nome, materia } = req.body;
      const repositorio = AppDataSource.getRepository(Professor);

      const professor = await repositorio.findOneBy({ id });
      if (!professor) {
        return res.status(404).json({ message: "Professor não encontrado" });
      }

      if (nome) professor.nome = nome;
      if (materia) professor.materia = materia;
      await repositorio.save(professor);

      res.json(professor);
    });

    /**
     * @swagger
     * /professores/{id}:
     * delete:
     * summary: Deleta um professor pelo ID.
     * tags: [Professores]
     * parameters:
     * - in: path
     * name: id
     * required: true
     * schema:
     * type: integer
     * description: ID do professor a ser deletado.
     * responses:
     * 204:
     * description: Professor deletado com sucesso (No Content).
     * 404:
     * description: Professor não encontrado.
     * 401:
     * description: Não autorizado.
     */
    app.delete("/professores/:id", async (req: Request, res: Response) => {
      const id = parseInt(req.params.id);
      const repositorio = AppDataSource.getRepository(Professor);

      const professor = await repositorio.findOneBy({ id });
      if (!professor) {
        return res.status(404).json({ message: "Professor não encontrado" });
      }

      await repositorio.remove(professor);
      res.status(204).send();
    });

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error: any) =>
    console.log("Erro ao conectar no banco de dados:", error)
  );
