import express from 'express';
import { body } from 'express-validator';
import { addMember, createProject, getProjects, removeMember } from '../controllers/projectController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(
    requireRole('Admin'),
    [
      body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Project name must be 2 to 120 characters'),
      body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description is too long')
    ],
    validate,
    createProject
  )
  .get(getProjects);

router.post(
  '/:id/add-member',
  requireRole('Admin'),
  [body('userId').isMongoId().withMessage('Valid user id is required')],
  validate,
  addMember
);

router.delete('/:id/members/:userId', requireRole('Admin'), removeMember);

export default router;
