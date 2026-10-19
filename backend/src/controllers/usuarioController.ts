import { Request, Response } from "express";
import db from "../database";
import jwt from "jsonwebtoken";
import ValidarToken from "../Services/jwtServices";



export const payloadUsuario = async (req: Request, res: Response) => {
    return res.json({
        success: true,
        message: "Payload do usuário obtido com sucesso",
        payload: res.locals.payload,
        cryptoToken: res.locals.csrfToken
    });
};



export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const query = `
        SELECT * FROM usuario
        WHERE email = $1 AND senha = $2
    `;

    const result = await db.query(query, [email, password]);

    if (result.rowCount && result.rowCount > 0) {
        const usuario = result.rows[0];

        const token = jwt.sign(
            {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo_usuario_id
            },
            (global as any).segredoJwt
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict"
        });

        const csrfToken = res.locals.csrfToken;

        return res.json({
            success: true,
            cryptoToken: csrfToken
        });
    }

    return res.status(401).json({
        success: false,
        message: "Falha no login"
    });
};


export const novoLogin = async (req: Request, res: Response) => {
    const { email, password, nome } = req.body;

    const queryNomeIpuExiste =
        `SELECT * FROM iptu WHERE nome = $1`;

    const iptuResult = await db.query(queryNomeIpuExiste, [nome]);

    if (iptuResult.rowCount && iptuResult.rowCount > 0) {

        const query =
            `INSERT INTO usuario (email, senha, nome, tipo_usuario_id)
             VALUES ($1, $2, $3, 3)
            RETURNING id, email, nome, tipo_usuario_id`;

        const result = await db.query(query, [email, password, nome]);



        const queryUpdateTabelaIptu =
            `UPDATE iptu
            SET usuario_id = $1
            WHERE nome = $2`;

        const resultUpdate = await db.query(
            queryUpdateTabelaIptu,
            [result.rows[0].id, nome]
        );

        if (
            result.rowCount &&
            result.rowCount > 0 &&
            resultUpdate.rowCount &&
            resultUpdate.rowCount > 0
        ) {

            res.json({
            success: true,
            user: result.rows[0]
        
            });

        } else {
            res.status(500).json({
                success: false,
                message: "Não foi possível concluir o cadastro"
            });
        }

    } else {
        res.status(404).json({
            success: false,
            message: `Nome '${nome}' não encontrado no cadastro de municipes`
        });
    }
};




export const atualizarIptu = async (req: Request, res: Response) => {
    const payload = res.locals.payload;

    if (payload.tipo !== 1) {
        return res.status(403).json({
            success: false,
            message: "Acesso negado. Usuário não é admin"
        });
    }

    const { usuarioId, novoValor } = req.body;

    const query = `
        UPDATE iptu
        SET valor = $1
        WHERE usuario_id = $2
    `;

    try {
        const result = await db.query(query, [novoValor, usuarioId]);

        if (!result.rowCount) {
            return res.status(404).json({
                success: false,
                message: "Nenhum IPTU encontrado para esse usuário"
            });
        }

        return res.json({
            success: true,
            message: "IPTU atualizado",
            linhasAtualizadas: result.rowCount
        });
    } catch (err: any) {
        return res.status(500).json({
            error: err.message
        });
    }
};




export const getIptuPorIdUsuario = async (req: Request, res: Response) => {
    const payload = res.locals.payload;

    const query = `
        SELECT * FROM iptu
        WHERE usuario_id = $1
    `;

    try {
        const result = await db.query(query, [payload.id]);

        return res.json({
            iptu: result.rows
        });
    } catch (err: any) {
        return res.status(500).json({
            error: err.message
        });
    }
};



export const getIptus = async (req: Request, res: Response) => {
    const payload = res.locals.payload;

    if (payload.tipo !== 1) {
        return res.status(403).json({
            success: false,
            message: "Acesso negado. Usuário não é admin"
        });
    }

    const query = `SELECT * FROM iptu`;

    try {
        const result = await db.query(query);

        return res.json({
            iptu: result.rows
        });
    } catch (err: any) {
        return res.status(500).json({
            error: err.message
        });
    }
};



export const getQRCodeOrCodBarras = async (
    req: Request,
    res: Response
) => {

    const tipo = req.query.tipo as string;

    if (tipo !== "codigoDeBarras" && tipo !== "qrcode") {
    return res.status(400).json({
        success: false,
        message: "Tipo de código inválido"
    });
}

    let codigoHtml = "";

    if (tipo === "codigoDeBarras") {
    codigoHtml =
        `<img src="https://barcode.tec-it.com/barcode.ashx?data=123456789&code=Code128&translate-esc=true" alt="Código de barras" />`;
}
    else if (tipo === "qrcode") {

        codigoHtml =
            `<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=QRCodeDemo" />`;
    }

    return res.send(`
    <h2>Tipo selecionado: ${tipo}</h2>
    ${codigoHtml}
`);
};