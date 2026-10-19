import { Router } from "express";
import { criarComentario, listarComentarios } from "../controllers/comentarioController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

router.post("/", authMiddleware, criarComentario);
router.get("/", authMiddleware, listarComentarios);

export default router;