import { Router } from "express";
import { recepcionarDadosRoubados } from "../controllers/hackerMalvadaoController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

router.post("/dados-roubados", authMiddleware, recepcionarDadosRoubados);

export default router;