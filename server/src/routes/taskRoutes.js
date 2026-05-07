import express from 'express';
import { body, query } from 'express-validator';
import { createTask, dashboardSummary, getTasks, updateTask } from '../controllers/taskController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard/summary', dashboardSummary);

router
  .route('/')
  .post(
    requireRole('Admin'),
    [
      body('title').trim().isLength({ min: 2, max: 160 }).withMessage('Task title must be 2 to 160 characters'),
      body('description').optional().trim().isLength({ max: 1500 }).withMessage('Description is too long'),
      body('assignedTo').isMongoId().withMessage('Valid assigned user id is required'),
      body('projectId').isMongoId().withMessage('Valid project id is required'),
      body('deadline').isISO8601().toDate().withMessage('Valid deadline is required')
    ],
    validate,
    createTask
  )
  .get(
    [
      query('projectId').optional().isMongoId().withMessage('Project id must be valid'),
      query('status').optional().isIn(['Pending', 'In Progress', 'Completed']).withMessage('Status is invalid'),
      query('search').optional().trim().isLength({ max: 100 }).withMessage('Search is too long')
    ],
    validate,
    getTasks
  );

router.put(
  '/:id',
  [body('status').isIn(['Pending', 'In Progress', 'Completed']).withMessage('Status is invalid')],
  validate,
  updateTask
);

export default router;
