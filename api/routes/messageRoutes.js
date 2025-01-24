import express from "express";
import { protectRoute } from "../middlewares/auth.js";
import { sendMessage, getConversation } from "../controllers/messageController.js";

const router = express.Router();

router.use(protectRoute);

router.post("/send", sendMessage);
router.get("/conversation/:userId", getConversation);

export default router;