import express from 'express';
import { getMe, listUsers } from '../controllers/userController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getMe);
router.get('/', protect, requireRole('Admin'), listUsers);

export default router;
