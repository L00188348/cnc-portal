import express from 'express';
import { addElectionNotifications } from '../controllers/electionsController';
import { authorizeUser } from '../middleware/authMiddleware';
import {
  validateBody,
  validateParams,
  addElectionNotificationsBodySchema,
  addElectionNotificationsParamsSchema
} from '../validation';

const electionRoute = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     ElectionNotification:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The ID of the election notification
 *         teamId:
 *           type: integer
 *           description: The ID of the team
 *         title:
 *           type: string
 *           description: Notification title
 *         message:
 *           type: string
 *           description: Notification message
 *         scheduledFor:
 *           type: string
 *           format: date-time
 *           description: When the election notification is scheduled
 *         status:
 *           type: string
 *           enum: [pending, sent, failed]
 *           description: Status of the notification
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *     AddElectionNotificationsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Election notifications created successfully"
 *         count:
 *           type: integer
 *           description: Number of notifications created
 *         notifications:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ElectionNotification'
 */

/**
 * @openapi
 * /election/{teamId}:
 *   post:
 *     summary: Add election notifications for a team
 *     description: Create election-related notifications for team members
 *     tags: [Elections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The ID of the team to create notifications for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *               - scheduledFor
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the election notification
 *                 example: "Team Election Reminder"
 *               message:
 *                 type: string
 *                 description: Detailed message about the election
 *                 example: "Voting for team lead closes tomorrow"
 *               scheduledFor:
 *                 type: string
 *                 format: date-time
 *                 description: When the notification should be sent
 *                 example: "2024-03-15T10:00:00Z"
 *               type:
 *                 type: string
 *                 enum: [reminder, result, announcement]
 *                 description: Type of election notification
 *                 example: "reminder"
 *               metadata:
 *                 type: object
 *                 description: Additional data for the notification
 *                 properties:
 *                   candidateId:
 *                     type: integer
 *                   electionId:
 *                     type: integer
 *     responses:
 *       201:
 *         description: Election notifications created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AddElectionNotificationsResponse'
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
 *         description: Not found – team with specified ID does not exist
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
electionRoute.post(
  '/:teamId',
  authorizeUser,
  validateParams(addElectionNotificationsParamsSchema),
  validateBody(addElectionNotificationsBodySchema),
  addElectionNotifications
);

export default electionRoute;