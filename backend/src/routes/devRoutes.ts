import express from 'express';
import { generateSiweSignature, devHealthCheck } from '../controllers/devController';
import {
  validateBody,
  validateQuery,
  validateParams,
  generateSiweSignatureBodySchema,
  devHealthCheckQuerySchema
} from '../validation';

const devRoutes = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *     DevHealthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Dev controller is available"
 *         environment:
 *           type: string
 *           example: "development"
 *         timestamp:
 *           type: string
 *           format: date-time
 *     SiweSignatureResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           description: The generated SIWE message
 *         signature:
 *           type: string
 *           description: The signature of the message
 *         address:
 *           type: string
 *           description: The address that signed the message
 *         nonce:
 *           type: string
 *           description: The nonce used in the message
 *         issuedAt:
 *           type: string
 *           format: date-time
 *         timestamp:
 *           type: string
 *           format: date-time
 */

/**
 * Middleware to ensure dev routes are only available in development mode
 */
const devModeOnly = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({
      success: false,
      error: 'Development endpoints are only available in development mode',
      environment: process.env.NODE_ENV || 'unknown',
    });
  }
  next();
};

// Apply dev mode middleware to all routes
devRoutes.use(devModeOnly);

/**
 * @openapi
 * /api/dev/health:
 *   get:
 *     summary: Health check for dev controller
 *     description: Verifies that the dev controller is available (development mode only)
 *     tags: [Development]
 *     parameters:
 *       - in: query
 *         name: verbose
 *         schema:
 *           type: boolean
 *         description: Whether to return detailed health information
 *     responses:
 *       200:
 *         description: Dev controller is available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DevHealthResponse'
 *       400:
 *         description: Bad request – invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden – not available in production mode
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
devRoutes.get('/health', validateQuery(devHealthCheckQuerySchema), devHealthCheck);

/**
 * @openapi
 * /api/dev/generate-siwe-signature:
 *   post:
 *     summary: Generate SIWE message and signature
 *     description: Generates a SIWE (Sign-In with Ethereum) message and signature for testing purposes (development mode only)
 *     tags: [Development]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messageParams
 *               - privateKey
 *             properties:
 *               messageParams:
 *                 type: object
 *                 required:
 *                   - nonce
 *                   - address
 *                   - domain
 *                   - chainId
 *                 properties:
 *                   nonce:
 *                     type: string
 *                     description: Random nonce for the SIWE message
 *                     example: "32891756"
 *                   address:
 *                     type: string
 *                     description: Ethereum address
 *                     example: "0x1234567890123456789012345678901234567890"
 *                   domain:
 *                     type: string
 *                     description: Domain of the application
 *                     example: "localhost"
 *                   chainId:
 *                     type: number
 *                     description: Blockchain chain ID
 *                     example: 1337
 *                   statement:
 *                     type: string
 *                     description: Optional statement
 *                     example: "I accept the Terms of Service"
 *                   uri:
 *                     type: string
 *                     description: Optional URI
 *                     example: "http://localhost:3000"
 *               privateKey:
 *                 type: string
 *                 description: Private key to sign with (hex string starting with 0x)
 *                 example: "0x1234567890123456789012345678901234567890123456789012345678901234"
 *     responses:
 *       200:
 *         description: Successfully generated SIWE message and signature
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SiweSignatureResponse'
 *       400:
 *         description: Bad request – missing or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden – not available in production mode
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
devRoutes.post(
  '/generate-siwe-signature',
  validateBody(generateSiweSignatureBodySchema),
  generateSiweSignature
);

export default devRoutes;