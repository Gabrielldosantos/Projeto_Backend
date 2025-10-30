import "reflect-metadata";
import express, { Request, Response } from "express";
import { AppDataSource } from "./data-source";
import { Professor } from "./entities/Professor";
import { User } from "./entities/User";
import { authMiddleware } from "./middlewares/authMiddleware";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import cors from "cors";

const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

AppDataSource.initialize()
  .then(() => {
    console.log("Banco de dados conectado com sucesso!");

    const app = express();
    app.use(express.json());

    // ✅ Configuração do CORS para permitir o frontend do Render
    app.use(
      cors({
        origin: [
          "https://projeto-backend-1-bmv4.onrender.com", // domínio do seu frontend
        ],
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

    const PORT = process.env.PORT || 3000;
    const JWT_SECRET =
      process.env.JWT_SECRET || "sua-chave-secreta-super-forte-12345";

    const swaggerOptions = {
      definition: {
        openapi: "3.0.0",
        info: {
          title: "API do Sistema Web (Trabalho DevOps)",
          version: "1.0.0",
          description: "Documentação da API para o trabalho de backend",
        },
        servers: [
          {
            url: `https://projeto-backend-zw5n.onrender.com`, // URL do backend no Render
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
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      apis: ["./dist/index.js"],
    };

    const specs = swaggerJsdoc(swaggerOptions);
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

    app.get("/", (req: Request, res: Response) => {
      res.send("API 100% DEPLOYADA E FUNCIONANDO!");
    });

    // 🔐 Registro de usuários
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
        if (error.code === "SQLITE_CONSTRAINT") {
          return res.status(400).json({ message: "E-mail já cadastrado" });
        }
        res
          .status(500)
          .json({ message: "Erro ao cadastrar usuário", error: error.message });
      }
    });

    // 🔑 Login de usuários
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

    // 🔒 Middleware de autenticação
    app.use("/professores", authMiddleware);

    // 👨‍🏫 Listar professores
    app.get("/professores", async (req: Request, res: Response) => {
      const repositorio = AppDataSource.getRepository(Professor);
      const professores = await repositorio.find();
      res.json(professores);
    });

    // ➕ Cadastrar professor
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

    // ✏️ Atualizar professor
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

    // ❌ Deletar professor
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