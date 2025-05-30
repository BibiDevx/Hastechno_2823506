import { Router } from "express";
import { newUser, showUser, showUserId, updateUser, deleteUser, createUserFK, loginUser } from "../controllers/user.controller.js";
import UserScheme from "../schemes/user.schemas.js";
import userMiddleware from "../middlewares/user.middleware.js";
import verifyToken from "../middlewares/jwt.middleware.js";

const router = Router();

router.post('/user', userMiddleware(UserScheme.newUser), newUser);
router.get('/user',verifyToken,showUser);
router.get('/user/:id',showUserId);
router.put('/user/:id',userMiddleware(UserScheme.newUser), updateUser);
router.delete('/user/:id',deleteUser);
router.post('/user/login',loginUser);

export default router;
