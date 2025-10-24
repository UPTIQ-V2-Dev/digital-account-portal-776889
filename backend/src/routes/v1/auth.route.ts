import { authController } from '../../controllers/index.ts';
import auth from '../../middlewares/auth.ts';
import validate from '../../middlewares/validate.ts';
import authValidation from '../../validations/auth.validation.ts';
import express from 'express';

const router = express.Router();

// Un-authenticated routes
router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', validate(authValidation.logout), authController.logout);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);
router.post('/verify-email', validate(authValidation.verifyEmail), authController.verifyEmail);

// Authenticated route
router.post('/send-verification-email', auth(), authController.sendVerificationEmail);

export default router;

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *             example:
 *               name: "John Doe"
 *               email: "john@example.com"
 *               password: "password123"
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *                     isEmailVerified:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                 tokens:
 *                   type: object
 *                   properties:
 *                     access:
 *                       type: object
 *                       properties:
 *                         token:
 *                           type: string
 *                         expires:
 *                           type: string
 *                     refresh:
 *                       type: object
 *                       properties:
 *                         token:
 *                           type: string
 *                         expires:
 *                           type: string
 *       "400":
 *         description: Invalid input data or email already exists
 *       "500":
 *         description: Internal server error
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user and return tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *             example:
 *               email: "john@example.com"
 *               password: "password123"
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *                     isEmailVerified:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                 tokens:
 *                   type: object
 *                   properties:
 *                     access:
 *                       type: object
 *                       properties:
 *                         token:
 *                           type: string
 *                         expires:
 *                           type: string
 *                     refresh:
 *                       type: object
 *                       properties:
 *                         token:
 *                           type: string
 *                         expires:
 *                           type: string
 *       "401":
 *         description: Invalid email or password
 *       "500":
 *         description: Internal server error
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user and blacklist refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *             example:
 *               refreshToken: "eyJ..."
 *     responses:
 *       "204":
 *         description: No content
 *       "404":
 *         description: Refresh token not found
 *       "500":
 *         description: Internal server error
 */

/**
 * @swagger
 * /auth/refresh-tokens:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *             example:
 *               refreshToken: "eyJ..."
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     expires:
 *                       type: string
 *                 refresh:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     expires:
 *                       type: string
 *       "401":
 *         description: Invalid refresh token
 *       "500":
 *         description: Internal server error
 */

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Send password reset email to user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *             example:
 *               email: "john@example.com"
 *     responses:
 *       "204":
 *         description: No content
 *       "404":
 *         description: User not found
 *       "500":
 *         description: Internal server error
 */

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset user password using reset token
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The reset password token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *             example:
 *               password: "newpassword123"
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         description: Invalid or expired reset token
 *       "500":
 *         description: Internal server error
 */

/**
 * @swagger
 * /auth/send-verification-email:
 *   post:
 *     summary: Send email verification link to authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         description: Unauthorized
 *       "500":
 *         description: Internal server error
 */

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify user email address
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The verify email token
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         description: Invalid or expired verification token
 *       "500":
 *         description: Internal server error
 */
