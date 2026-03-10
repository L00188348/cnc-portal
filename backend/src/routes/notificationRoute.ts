import express from 'express';
import {
  getNotification,
  updateNotification,
  createBulkNotifications,
} from '../controllers/notificationController';
import { authorizeUser } from '../middleware/authMiddleware';
import {
  validateBody,
  validateQuery,
  validateParams,
  getNotificationQuerySchema,
  updateNotificationBodySchema,
  updateNotificationParamsSchema,
  createBulkNotificationsBodySchema
} from '../validation';

const notificationRoute = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The ID of the notification
 *         userId:
 *           type: integer
 *           description: The ID of the user who receives the notification
 *         type:
 *           type: string
 *           description: The type of notification
 *         title:
 *           type: string
 *           description: Notification title
 *         message:
 *           type: string
 *           description: Notification message
 *         read:
 *           type: boolean
 *           description: Whether the notification has been read
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the notification was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the notification was last updated
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *     BulkNotificationsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         count:
 *           type: integer
 *           description: Number of notifications created
 *         notifications:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Notification'
 */

/**
 * @openapi
 * /notification:
 *   get:
 *     summary: Get notifications for the authenticated user
 *     description: Retrieve notifications for the currently authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of notifications to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of notifications to skip
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *         description: Filter to show only unread notifications
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 total:
 *                   type: integer
 *                   description: Total number of notifications
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
notificationRoute.get('/', authorizeUser, validateQuery(getNotificationQuerySchema), getNotification);

/**
 * @openapi
 * /notification/{id}:
 *   put:
 *     summary: Update a notification (mark as read)
 *     description: Update a specific notification, typically to mark it as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The ID of the notification to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               read:
 *                 type: boolean
 *                 description: Mark notification as read or unread
 *                 example: true
 *     responses:
 *       200:
 *         description: Notification updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
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
 *         description: Not found – notification with specified ID does not exist
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
notificationRoute.put(
  '/:id',
  authorizeUser,
  validateParams(updateNotificationParamsSchema),
  validateBody(updateNotificationBodySchema),
  updateNotification
);

/**
 * @openapi
 * /notification/bulk:
 *   post:
 *     summary: Create bulk notifications
 *     description: Create multiple notifications at once (admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *               - title
 *               - message
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of user IDs to send notifications to
 *                 example: [1, 2, 3]
 *               type:
 *                 type: string
 *                 description: Type of notification
 *                 example: "system"
 *               title:
 *                 type: string
 *                 description: Notification title
 *                 example: "System Update"
 *               message:
 *                 type: string
 *                 description: Notification message
 *                 example: "The system will be updated at 2 AM"
 *     responses:
 *       201:
 *         description: Bulk notifications created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BulkNotificationsResponse'
 *       400:
 *         description: Bad request – invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden – insufficient permissions (admin only)
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
notificationRoute.post(
  '/bulk',
  authorizeUser,
  validateBody(createBulkNotificationsBodySchema),
  createBulkNotifications
);

export default notificationRoute;