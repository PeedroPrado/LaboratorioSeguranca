
import { NextFunction, Request, Response } from "express";
import ValidarToken from "../Services/jwtServices";

export const authMiddleware = (perfis?: number[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token não fornecido"
            });
        }

        const payload = ValidarToken(token);

        if (!payload) {
            return res.status(401).json({
                success: false,
                message: "Token inválido"
            });
        }

        if (perfis && !perfis.includes(payload.tipo)) {
            return res.status(403).json({
                success: false,
                message: "Acesso não autorizado"
            });
        }

        res.locals.payload = payload;
        next();
    };
};
