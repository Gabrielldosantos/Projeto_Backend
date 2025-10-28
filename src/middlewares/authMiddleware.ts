import { Request, Response, NextFunction } from 'express'
import * as jwt from 'jsonwebtoken'

const JWT_SECRET = "sua-chave-secreta-super-forte-12345" 

declare global {
    namespace Express {
        interface Request {
            user?: any
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res.status(401).json({ message: "Token de autenticação não fornecido" })
    }

    const parts = authHeader.split(' ')

    if (parts.length !== 2) {
        return res.status(401).json({ message: "Token em formato inválido" })
    }

    const [scheme, token] = parts

    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({ message: "Token mal formatado" })
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        
        req.user = decoded; 

        return next()

    } catch (error) {
        return res.status(401).json({ message: "Token inválido ou expirado" })
    }
}