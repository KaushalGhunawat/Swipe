import express from "express";
import { protectRoute } from "../middlewares/auth.js";
import { updateProfile } from "../controllers/userController.js";


const router = express.Router();

router.put("/update", protectRoute, updateProfile)



export default router;