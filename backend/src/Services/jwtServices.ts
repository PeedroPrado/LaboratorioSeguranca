import jwt from "jsonwebtoken";
import { RetornoPayload } from "../Tipos/retornoPayload";

export default function ValidarToken(token: string): RetornoPayload | null {
    try {
        console.log("Token:", token);
        console.log("Tipo:", typeof token);
        console.log("Tamanho:", token.length);
        console.log("Primeiro caractere:", token[0]);
        console.log("Último caractere:", token[token.length - 1]);
        const decoded = jwt.verify(token, (global as any).segredoJwt) as RetornoPayload;
        console.log("Token decodificado:", decoded);
        return {
            id: decoded.id,
            tipo: decoded.tipo,
            email: decoded.email,
            nome: decoded.nome
        };
    } catch (error) {
        console.error("Erro ao validar o token:", error);
        return null;
    }
}


