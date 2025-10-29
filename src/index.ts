import "reflect-metadata";
import express, { Request, Response } from "express";
import { AppDataSource } from "./data-source";
import { Professor } from "./entities/Professor";
import { User } from "./entities/User";
import { authMiddleware } from "./middlewares/authMiddleware";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

AppDataSource.initialize()
  .then(() => {
    console.log("Banco de dados conectado com sucesso!");

    const app = express();
    app.use(express.json());

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
            url: `http://localhost:${PORT}`,
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
      apis: ['./dist/index.js'],
    };

    const specs = swaggerJsdoc(swaggerOptions);
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

    /**
     * @swagger
     * /:
     *   get:
     *     summary: Rota principal de verificação da API
     *     tags: [Status]
     *     responses:
     *       200:
     *         description: Mensagem "API funcionando!"
     */
    app.get("/", (req: Request, res: Response) => {
      res.send('API 100% DEPLOYADA E FUNCIONANDO!');
    });

    /**
     * @swagger
     * /register:
     *   post:
     *     summary: Registra um novo usuário
     *     tags: [Autenticação]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 example: usuario@exemplo.com
     *               password:
     *                 type: string
     *                 example: senha123
     *     responses:
     *       201:
     *         description: Usuário criado com sucesso
     *       400:
     *         description: E-mail já cadastrado ou dados inválidos
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
        if (error.code === "SQLITE_CONSTRAINT") {
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
     *   post:
     *     summary: Autentica um usuário e retorna um token JWT
     *     tags: [Autenticação]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 example: usuario@exemplo.com
     *               password:
     *                 type: string
     *                 example: senha123
     *     responses:
     *       200:
     *         description: Login bem-sucedido, retorna o token
     *       401:
     *         description: Credenciais inválidas
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

    app.use("/professores", authMiddleware);

    /**
     * @swagger
     * /professores:
     *   get:
     *     summary: Lista todos os professores
     *     tags: [Professores]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de professores
     *       401:
     *         description: Não autorizado
     */
    app.get("/professores", async (req: Request, res: Response) => {
      const repositorio = AppDataSource.getRepository(Professor);
      const professores = await repositorio.find();
      res.json(professores);
    });

    /**
     * @swagger
     * /professores:
     *   post:
     *     summary: Cadastra um novo professor
     *     tags: [Professores]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - nome
     *               - materia
     *             properties:
     *               nome:
     *                 type: string
     *                 example: Dr. Silva
     *               materia:
     *                 type: string
     *                 example: Cálculo I
     *     responses:
     *       201:
     *         description: Professor cadastrado com sucesso
     *       401:
     *         description: Não autorizado
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
     *   put:
     *     summary: Atualiza um professor existente
     *     tags: [Professores]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: O ID do professor a ser atualizado
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               nome:
     *                 type: string
     *               materia:
     *                 type: string
     *     responses:
     *       200:
     *         description: Professor atualizado com sucesso
     *       404:
     *         description: Professor não encontrado
     *       401:
     *         description: Não autorizado
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
     *   delete:
     *     summary: Deleta um professor
     *     tags: [Professores]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: O ID do professor a ser deletado
     *     responses:
     *       204:
     *         description: Professor deletado com sucesso
     *       404:
     *         description: Professor não encontrado
     *       401:
     *         description: Não autorizado
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
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error: any) =>
    console.log("Erro ao conectar no banco de dados:", error)
  );