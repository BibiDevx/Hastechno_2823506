import { Router} from "express";
import {createUserStatus,showUserStatus,showIdUserStatus,updateUserStatus,deleteUserStatus} from '../controllers/userStatus.controller.js';


const router =Router();
router.post('/userStatus',createUserStatus);
router.get('/userStatus',showUserStatus);
router.get('/userStatus/:id',showIdUserStatus);
router.put('/userStatus/:id',updateUserStatus);
router.delete('/userStatus/:id',deleteUserStatus);

export default router;