import { applicationController } from '../../controllers/index.ts';
import auth from '../../middlewares/auth.ts';
import validate from '../../middlewares/validate.ts';
import { applicationValidation } from '../../validations/index.ts';
import businessProfileRoute from './businessProfile.route.ts';
import documentRoute from './document.route.ts';
import financialProfileRoute from './financialProfile.route.ts';
import personalInfoRoute from './personalInfo.route.ts';
import kycVerificationRoute from './kycVerification.route.ts';
import express from 'express';

const router = express.Router();

// Core application routes
router
    .route('/')
    .post(auth('manageApplications'), validate(applicationValidation.createApplication), applicationController.createApplication)
    .get(auth('getApplications'), validate(applicationValidation.getApplications), applicationController.getApplications);

router
    .route('/submit')
    .post(auth('manageApplications'), validate(applicationValidation.submitApplication), applicationController.submitApplication);

router
    .route('/:applicationId')
    .get(auth('getApplications'), validate(applicationValidation.getApplication), applicationController.getApplication)
    .put(auth('manageApplications'), validate(applicationValidation.updateApplication), applicationController.updateApplication)
    .delete(auth('manageApplications'), validate(applicationValidation.deleteApplication), applicationController.deleteApplication);

router
    .route('/:applicationId/summary')
    .get(auth('getApplications'), validate(applicationValidation.getApplicationSummary), applicationController.getApplicationSummary);

// Personal information sub-routes
router.use('/:applicationId/personal-info', personalInfoRoute);

// Business profile sub-routes
router.use('/:applicationId/business-profile', businessProfileRoute);

// Financial profile sub-routes
router.use('/:applicationId/financial-profile', financialProfileRoute);

// Document management sub-routes
router.use('/:applicationId/documents', documentRoute);

// KYC verification sub-routes
router.use('/:applicationId/kyc', kycVerificationRoute);

export default router;

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Account opening application management
 */

/**
 * @swagger
 * /account-opening/applications:
 *   post:
 *     summary: Create a new account opening application
 *     description: Create a new application for account opening. Requires authentication.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountType
 *             properties:
 *               accountType:
 *                 type: string
 *                 enum: [consumer, business]
 *                 description: Type of account to open
 *             example:
 *               accountType: consumer
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *                 currentStep:
 *                   type: string
 *                 accountType:
 *                   type: string
 *                 customerType:
 *                   type: string
 *                 applicantId:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                 metadata:
 *                   type: object
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *
 *   get:
 *     summary: Get all applications
 *     description: Get all applications with optional filtering. Users see only their applications, admins see all.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, in_progress, submitted, approved, rejected, completed]
 *         description: Filter by application status
 *       - in: query
 *         name: accountType
 *         schema:
 *           type: string
 *           enum: [consumer, business]
 *         description: Filter by account type
 *       - in: query
 *         name: customerType
 *         schema:
 *           type: string
 *           enum: [new, existing]
 *         description: Filter by customer type
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort field
 *       - in: query
 *         name: sortType
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort direction
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         default: 10
 *         description: Maximum number of results
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   status:
 *                     type: string
 *                   currentStep:
 *                     type: string
 *                   accountType:
 *                     type: string
 *                   customerType:
 *                     type: string
 *                   applicantId:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                   updatedAt:
 *                     type: string
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /account-opening/applications/submit:
 *   post:
 *     summary: Submit application for review
 *     description: Submit a completed application for review. Requires final review and electronic consent.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - applicationId
 *               - finalReview
 *               - electronicConsent
 *             properties:
 *               applicationId:
 *                 type: string
 *                 description: ID of the application to submit
 *               finalReview:
 *                 type: boolean
 *                 description: Must be true to confirm final review
 *               electronicConsent:
 *                 type: boolean
 *                 description: Must be true to provide electronic consent
 *             example:
 *               applicationId: app_123456
 *               finalReview: true
 *               electronicConsent: true
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 submitted:
 *                   type: boolean
 *                 applicationId:
 *                   type: string
 *                 message:
 *                   type: string
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /account-opening/applications/{applicationId}:
 *   get:
 *     summary: Get application details
 *     description: Get details of a specific application by ID.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *                 currentStep:
 *                   type: string
 *                 accountType:
 *                   type: string
 *                 customerType:
 *                   type: string
 *                 applicantId:
 *                   type: string
 *                 submittedAt:
 *                   type: string
 *                 completedAt:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                 metadata:
 *                   type: object
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   put:
 *     summary: Update application
 *     description: Update application status and current step.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentStep:
 *                 type: string
 *                 enum: [account_type, personal_info, business_profile, financial_profile, product_selection, document_upload, kyc_verification, risk_assessment, agreements, funding_setup, review]
 *               status:
 *                 type: string
 *                 enum: [draft, in_progress, submitted, approved, rejected, completed]
 *               accountType:
 *                 type: string
 *                 enum: [consumer, business]
 *               customerType:
 *                 type: string
 *                 enum: [new, existing]
 *             example:
 *               currentStep: personal_info
 *               status: in_progress
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *                 currentStep:
 *                   type: string
 *                 accountType:
 *                   type: string
 *                 customerType:
 *                   type: string
 *                 applicantId:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                 metadata:
 *                   type: object
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete application
 *     description: Delete an application. Only draft applications can be deleted.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       "204":
 *         description: No Content
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /account-opening/applications/{applicationId}/summary:
 *   get:
 *     summary: Get comprehensive application summary
 *     description: Get comprehensive application summary with all related data including personal info, business profile, financial profile, product selections, documents, KYC verification, additional signers, risk assessment, agreements, signatures, and funding setup.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 application:
 *                   type: object
 *                 personalInfo:
 *                   type: object
 *                 businessProfile:
 *                   type: object
 *                 financialProfile:
 *                   type: object
 *                 productSelections:
 *                   type: array
 *                   items:
 *                     type: object
 *                 documents:
 *                   type: array
 *                   items:
 *                     type: object
 *                 kycVerification:
 *                   type: object
 *                 additionalSigners:
 *                   type: array
 *                   items:
 *                     type: object
 *                 riskAssessment:
 *                   type: object
 *                 agreements:
 *                   type: array
 *                   items:
 *                     type: object
 *                 signatures:
 *                   type: array
 *                   items:
 *                     type: object
 *                 fundingSetup:
 *                   type: object
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */