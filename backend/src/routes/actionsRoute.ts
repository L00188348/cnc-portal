import express from 'express';
import { authorizeUser } from '../middleware/authMiddleware';
import { addAction, executeAction, getActions } from '../controllers/actionController';
import {
  validateBody,
  validateQuery,
  validateParams,
  addActionBodySchema,
  executeActionParamsSchema,
  getActionsQuerySchema
} from '../validation';

const actionRoute = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Action:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The ID of the action
 *         type:
 *           type: string
 *           description: The type of action
 *         status:
 *           type: string
 *           description: Current status of the action
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the action was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the action was last updated
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 */

/**
 * @openapi
 * /actions:
 *   get:
 *     summary: Retrieve all actions
 *     description: Get a list of all actions (requires authentication)
 *     tags: [Actions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of actions to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of actions to skip
 *     responses:
 *       200:
 *         description: List of actions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Action'
 *       400:
 *         description: Bad request – invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden – insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
actionRoute.get('/', authorizeUser, validateQuery(getActionsQuerySchema), getActions);

/**
 * @openapi
 * /actions:
 *   post:
 *     summary: Add a new action
 *     description: Create a new action (requires authentication)
 *     tags: [Actions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: Type of action to create
 *                 example: "approve"
 *               targetId:
 *                 type: integer
 *                 description: ID of the target resource
 *                 minimum: 1
 *             required:
 *               - type
 *               - targetId
 *     responses:
 *       201:
 *         description: Action created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Action'
 *       400:
 *         description: Bad request – invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden – insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
actionRoute.post('/', authorizeUser, validateBody(addActionBodySchema), addAction);

/**
 * @openapi
 * /actions/{id}:
 *   patch:
 *     summary: Execute an action
 *     description: Execute or process a specific action by ID (requires authentication)
 *     tags: [Actions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The ID of the action to execute
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *                 description: Additional execution data
 *     responses:
 *       200:
 *         description: Action executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Action'
 *       400:
 *         description: Bad request – invalid parameters or body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden – insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Not found – action with specified ID does not exist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
actionRoute.patch('/:id', authorizeUser, validateParams(executeActionParamsSchema), executeAction);

export default actionRoute;