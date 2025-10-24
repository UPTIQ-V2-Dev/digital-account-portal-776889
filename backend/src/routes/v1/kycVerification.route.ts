import { kycVerificationController } from '../../controllers/index.ts';
import auth from '../../middlewares/auth.ts';
import validate from '../../middlewares/validate.ts';
import { kycVerificationValidation } from '../../validations/index.ts';
import express from 'express';

const router = express.Router({ mergeParams: true });

// KYC verification routes
router
    .route('/')
    .get(
        auth('getApplications'),
        validate(kycVerificationValidation.getKYCVerification),
        kycVerificationController.getKYCVerification
    );

router
    .route('/verify')
    .post(
        auth('manageApplications'),
        validate(kycVerificationValidation.initiateKYCVerification),
        kycVerificationController.initiateKYCVerification
    );

export default router;

/**
 * @swagger
 * tags:
 *   name: KYC Verification
 *   description: Know Your Customer (KYC) verification for account opening applications
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     KYCVerification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique KYC verification identifier
 *         applicationId:
 *           type: string
 *           description: Associated application ID
 *         status:
 *           type: string
 *           enum: [pending, passed, failed, review_required]
 *           description: Overall verification status
 *         provider:
 *           type: string
 *           description: KYC verification provider
 *         verificationId:
 *           type: string
 *           description: Provider-specific verification ID
 *         confidence:
 *           type: number
 *           minimum: 0
 *           maximum: 1
 *           description: Overall confidence score
 *         verifiedAt:
 *           type: string
 *           format: date-time
 *           description: Verification completion timestamp
 *           nullable: true
 *         results:
 *           type: object
 *           description: Detailed verification results
 *           properties:
 *             identity:
 *               type: object
 *               properties:
 *                 passed:
 *                   type: boolean
 *                 confidence:
 *                   type: number
 *                   minimum: 0
 *                   maximum: 1
 *             address:
 *               type: object
 *               properties:
 *                 passed:
 *                   type: boolean
 *                 confidence:
 *                   type: number
 *                   minimum: 0
 *                   maximum: 1
 *             phone:
 *               type: object
 *               properties:
 *                 passed:
 *                   type: boolean
 *                 confidence:
 *                   type: number
 *                   minimum: 0
 *                   maximum: 1
 *             email:
 *               type: object
 *               properties:
 *                 passed:
 *                   type: boolean
 *                 confidence:
 *                   type: number
 *                   minimum: 0
 *                   maximum: 1
 *             ofac:
 *               type: object
 *               properties:
 *                 passed:
 *                   type: boolean
 *                 matches:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       matchScore:
 *                         type: number
 *                       listName:
 *                         type: string
 *                       reason:
 *                         type: string
 *                   nullable: true
 *       example:
 *         id: "kyc_123"
 *         applicationId: "app_123456"
 *         status: "passed"
 *         provider: "Mock KYC Provider"
 *         verificationId: "kyc_verify_abc123"
 *         confidence: 0.95
 *         verifiedAt: "2025-09-13T14:30:45Z"
 *         results:
 *           identity:
 *             passed: true
 *             confidence: 0.95
 *           address:
 *             passed: true
 *             confidence: 0.9
 *           phone:
 *             passed: true
 *             confidence: 0.85
 *           email:
 *             passed: true
 *             confidence: 0.9
 *           ofac:
 *             passed: true
 *             matches: null
 */

/**
 * @swagger
 * /account-opening/applications/{applicationId}/kyc/verify:
 *   post:
 *     summary: Initiate KYC verification process
 *     description: |
 *       Initiate a comprehensive Know Your Customer (KYC) verification process for an account opening application. 
 *       This process includes:
 *       - Identity verification (name matching, age verification)
 *       - Address verification 
 *       - Phone number validation
 *       - Email verification
 *       - OFAC (sanctions) screening
 *       
 *       The verification process is asynchronous and uses mock providers for testing. 
 *       Results can be retrieved using the GET endpoint once processing is complete.
 *     tags: [KYC Verification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *         example: "app_123456"
 *     responses:
 *       "202":
 *         description: KYC verification initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: KYC verification record ID
 *                 applicationId:
 *                   type: string
 *                   description: Application ID
 *                 status:
 *                   type: string
 *                   enum: [pending]
 *                   description: Initial verification status
 *                 verificationId:
 *                   type: string
 *                   description: Provider verification ID
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *             example:
 *               id: "kyc_123"
 *               applicationId: "app_123456"
 *               status: "pending"
 *               verificationId: "kyc_verify_abc123"
 *               message: "KYC verification initiated"
 *       "400":
 *         description: Bad Request - KYC verification already in progress or insufficient data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   examples:
 *                     already_in_progress:
 *                       value: "KYC verification already in progress"
 *                     already_completed:
 *                       value: "KYC verification already completed"
 *                     insufficient_data:
 *                       value: "Personal information or business profile required for KYC verification"
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         description: Application not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "Application not found"
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /account-opening/applications/{applicationId}/kyc:
 *   get:
 *     summary: Get KYC verification status and results
 *     description: |
 *       Retrieve the current status and detailed results of the KYC verification process for an application.
 *       Returns comprehensive verification results including:
 *       - Overall verification status and confidence score
 *       - Individual component results (identity, address, phone, email, OFAC)
 *       - Detailed confidence scores for each verification component
 *       - OFAC screening matches if any were found
 *     tags: [KYC Verification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *         example: "app_123456"
 *     responses:
 *       "200":
 *         description: KYC verification status and results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KYCVerification'
 *             examples:
 *               passed_verification:
 *                 summary: Successful KYC verification
 *                 value:
 *                   id: "kyc_123"
 *                   applicationId: "app_123456"
 *                   status: "passed"
 *                   provider: "Mock KYC Provider"
 *                   verificationId: "kyc_verify_abc123"
 *                   confidence: 0.95
 *                   verifiedAt: "2025-09-13T14:33:45Z"
 *                   results:
 *                     identity:
 *                       passed: true
 *                       confidence: 0.95
 *                     address:
 *                       passed: true
 *                       confidence: 0.9
 *                     phone:
 *                       passed: true
 *                       confidence: 0.85
 *                     email:
 *                       passed: true
 *                       confidence: 0.9
 *                     ofac:
 *                       passed: true
 *                       matches: null
 *               pending_verification:
 *                 summary: KYC verification in progress
 *                 value:
 *                   id: "kyc_124"
 *                   applicationId: "app_123457"
 *                   status: "pending"
 *                   provider: "Mock KYC Provider"
 *                   verificationId: "kyc_verify_def456"
 *                   confidence: 0.0
 *                   verifiedAt: null
 *                   results: {}
 *               failed_verification:
 *                 summary: Failed KYC verification
 *                 value:
 *                   id: "kyc_125"
 *                   applicationId: "app_123458"
 *                   status: "failed"
 *                   provider: "Mock KYC Provider"
 *                   verificationId: "kyc_verify_ghi789"
 *                   confidence: 0.45
 *                   verifiedAt: "2025-09-13T14:33:45Z"
 *                   results:
 *                     identity:
 *                       passed: false
 *                       confidence: 0.3
 *                     address:
 *                       passed: true
 *                       confidence: 0.8
 *                     phone:
 *                       passed: true
 *                       confidence: 0.75
 *                     email:
 *                       passed: true
 *                       confidence: 0.9
 *                     ofac:
 *                       passed: false
 *                       matches: [
 *                         {
 *                           name: "Test User",
 *                           matchScore: 0.85,
 *                           listName: "Mock Sanctions List",
 *                           reason: "Name similarity match"
 *                         }
 *                       ]
 *               review_required:
 *                 summary: KYC verification requires manual review
 *                 value:
 *                   id: "kyc_126"
 *                   applicationId: "app_123459"
 *                   status: "review_required"
 *                   provider: "Mock KYC Provider"
 *                   verificationId: "kyc_verify_jkl012"
 *                   confidence: 0.65
 *                   verifiedAt: "2025-09-13T14:33:45Z"
 *                   results:
 *                     identity:
 *                       passed: true
 *                       confidence: 0.7
 *                     address:
 *                       passed: true
 *                       confidence: 0.6
 *                     phone:
 *                       passed: false
 *                       confidence: 0.4
 *                     email:
 *                       passed: true
 *                       confidence: 0.8
 *                     ofac:
 *                       passed: true
 *                       matches: null
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         description: KYC verification not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   examples:
 *                     application_not_found:
 *                       value: "Application not found"
 *                     kyc_not_found:
 *                       value: "KYC verification not found"
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */