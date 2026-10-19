import { Request, Response } from "express";
import db from "../database";
import xss from "xss";
import ValidarToken from "../Services/jwtServices";

export const criarComentario = async (
    req: Request,
    res: Response
) => {
    const token = req.cookies?.token;

    if (!token) {
        res.status(401).json({
            success: false,
            message: "Token não fornecido"
        });
        return;
    }

    const payload = ValidarToken(token);

    if (!payload) {
        res.status(401).json({
            success: false,
            message: "Token inválido"
        });
        return;
    }

    const { texto } = req.body;
    const usuarioId = payload.id;

    if (typeof texto !== "string" || !texto.trim()) {
        res.status(400).json({
            success: false,
            message: "O comentário não pode estar vazio"
        });
        return;
    }

    const textoLimpo = xss(texto);

    const query = `
        INSERT INTO comentario (texto, usuario_id)
        VALUES ($1, $2)
    `;

    console.log(`Query Executada: ${query}`);

    try {
        await db.query(query, [textoLimpo, usuarioId]);

        res.status(201).json({
            message: "Comentário criado"
        });
    } catch (err: any) {
        res.status(500).json({
            error: err.message
        });
    }
};

export const listarComentarios = async (
    _req: Request,
    res: Response
) => {
    try {
        const result = await db.query(
            "SELECT * FROM comentario"
        );

        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({
            error: err.message
        });
    }
};
