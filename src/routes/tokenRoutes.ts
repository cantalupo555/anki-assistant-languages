/**
 * @fileOverview Defines the Express router for token-related operations.
 * Currently only handles the `/token/sum` endpoint.
 *
 * @dependencies
 * - express.Router: For creating the router instance.
 * - ../controllers/tokenController: Provides the `calculateTokenSum` handler.
 */
import { Router } from 'express';
import { calculateTokenSum } from '../controllers/tokenController';

const router = Router();

// POST /token/sum
router.post('/sum', calculateTokenSum);

export default router;
