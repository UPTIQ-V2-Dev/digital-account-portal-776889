import { accountOpeningController, signersController } from '../../controllers/index.ts';
import auth from '../../middlewares/auth.ts';
import validate from '../../middlewares/validate.ts';
import { upload } from '../../utils/fileStorage.ts';
import { accountOpeningValidation, signersValidation } from '../../validations/index.ts';
import express from 'express';

const router = express.Router();

// Account Opening Applications routes
router
    .route('/applications')
    .post(auth(), validate(accountOpeningValidation.createApplication), accountOpeningController.createApplication);

router
    .route('/applications/:applicationId')
    .get(auth(), validate(accountOpeningValidation.getApplication), accountOpeningController.getApplication)
    .put(auth(), validate(accountOpeningValidation.updateApplication), accountOpeningController.updateApplication);

router
    .route('/applications/submit')
    .post(auth(), validate(accountOpeningValidation.submitApplication), accountOpeningController.submitApplication);

router
    .route('/applications/:applicationId/summary')
    .get(
        auth(),
        validate(accountOpeningValidation.getApplicationSummary),
        accountOpeningController.getApplicationSummary
    );

// Personal Info routes
router
    .route('/applications/:applicationId/personal-info')
    .put(auth(), validate(accountOpeningValidation.updatePersonalInfo), accountOpeningController.updatePersonalInfo)
    .get(auth(), validate(accountOpeningValidation.getPersonalInfo), accountOpeningController.getPersonalInfo);

// Business Profile routes
router
    .route('/applications/:applicationId/business-profile')
    .put(
        auth(),
        validate(accountOpeningValidation.updateBusinessProfile),
        accountOpeningController.updateBusinessProfile
    )
    .get(auth(), validate(accountOpeningValidation.getBusinessProfile), accountOpeningController.getBusinessProfile);

// Financial Profile routes
router
    .route('/applications/:applicationId/financial-profile')
    .put(
        auth(),
        validate(accountOpeningValidation.updateFinancialProfile),
        accountOpeningController.updateFinancialProfile
    )
    .get(auth(), validate(accountOpeningValidation.getFinancialProfile), accountOpeningController.getFinancialProfile);

// Product Management routes
router
    .route('/products')
    .get(auth(), validate(accountOpeningValidation.getProducts), accountOpeningController.getProducts);

router
    .route('/applications/:applicationId/eligible-products')
    .get(auth(), validate(accountOpeningValidation.getEligibleProducts), accountOpeningController.getEligibleProducts);

router
    .route('/applications/:applicationId/product-selections')
    .put(
        auth(),
        validate(accountOpeningValidation.updateProductSelections),
        accountOpeningController.updateProductSelections
    );

// Document Management routes
router
    .route('/documents/upload')
    .post(
        auth(),
        upload.single('file'),
        validate(accountOpeningValidation.uploadDocument),
        accountOpeningController.uploadDocument
    );

router
    .route('/applications/:applicationId/documents')
    .get(auth(), validate(accountOpeningValidation.getDocuments), accountOpeningController.getDocuments);

router
    .route('/documents/:documentId')
    .delete(auth(), validate(accountOpeningValidation.deleteDocument), accountOpeningController.deleteDocument);

// KYC/Identity Verification routes
router
    .route('/applications/:applicationId/kyc/initiate')
    .post(
        auth(),
        validate(accountOpeningValidation.initiateKYCVerification),
        accountOpeningController.initiateKYCVerification
    );

router
    .route('/applications/:applicationId/kyc/status')
    .get(
        auth(),
        validate(accountOpeningValidation.getKYCVerificationStatus),
        accountOpeningController.getKYCVerificationStatus
    );

// Risk Assessment routes
router
    .route('/applications/:applicationId/risk-assessment')
    .post(
        auth(),
        validate(accountOpeningValidation.performRiskAssessment),
        accountOpeningController.performRiskAssessment
    );

// Disclosures and Agreements routes
router
    .route('/disclosures')
    .get(auth(), validate(accountOpeningValidation.getDisclosures), accountOpeningController.getDisclosures);

router
    .route('/agreements')
    .post(
        auth(),
        validate(accountOpeningValidation.acknowledgeAgreement),
        accountOpeningController.acknowledgeAgreement
    );

// Electronic Signatures routes
router
    .route('/signatures')
    .post(
        auth(),
        validate(accountOpeningValidation.captureElectronicSignature),
        accountOpeningController.captureElectronicSignature
    );

// Account Funding routes
router
    .route('/applications/:applicationId/funding')
    .post(auth(), validate(accountOpeningValidation.setupAccountFunding), accountOpeningController.setupAccountFunding);

// Additional Signers routes
router.route('/signers').post(auth(), validate(signersValidation.createSigner), signersController.createSigner);

router
    .route('/signers/:signerId')
    .get(auth(), validate(signersValidation.getSigner), signersController.getSigner)
    .put(auth(), validate(signersValidation.updateSigner), signersController.updateSigner)
    .delete(auth(), validate(signersValidation.deleteSigner), signersController.deleteSigner);

router
    .route('/applications/:applicationId/signers')
    .get(auth(), validate(signersValidation.getSignersByApplication), signersController.getSignersByApplication);

// Admin Portal routes
router
    .route('/admin/applications')
    .get(
        auth('manageApplications'),
        validate(accountOpeningValidation.getAdminApplications),
        accountOpeningController.getAdminApplications
    );

router
    .route('/admin/applications/:applicationId/status')
    .put(
        auth('manageApplications'),
        validate(accountOpeningValidation.updateApplicationStatus),
        accountOpeningController.updateApplicationStatus
    );

router
    .route('/admin/applications/:applicationId/audit')
    .get(
        auth('getApplicationAudit'),
        validate(accountOpeningValidation.getApplicationAudit),
        accountOpeningController.getApplicationAudit
    );

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminApplication:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique application ID
 *         applicantName:
 *           type: string
 *           description: Name of the applicant (personal or business name)
 *         accountType:
 *           type: string
 *           enum: [consumer, commercial, business]
 *           description: Type of account being opened
 *         status:
 *           type: string
 *           enum: [draft, in_progress, submitted, under_review, approved, rejected, completed]
 *           description: Current application status
 *         currentStep:
 *           type: string
 *           enum: [account_type, personal_info, business_profile, financial_profile, product_selection, document_upload, kyc_verification, risk_assessment, agreements, signatures, funding, review, confirmation]
 *           description: Current step in the application process
 *         riskLevel:
 *           type: string
 *           enum: [low, medium, high, pending]
 *           description: Risk assessment level
 *         submittedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the application was submitted
 *         lastActivity:
 *           type: string
 *           format: date-time
 *           description: Timestamp of last activity on the application
 *         assignedTo:
 *           type: string
 *           nullable: true
 *           description: User ID of assigned reviewer (null if unassigned)
 *
 *     AuditTrailEntry:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique audit entry ID
 *         applicationId:
 *           type: string
 *           description: Associated application ID
 *         action:
 *           type: string
 *           description: Action performed
 *         description:
 *           type: string
 *           description: Detailed description of the action
 *         performedBy:
 *           type: string
 *           description: Who performed the action (user_id or admin_id)
 *         performedAt:
 *           type: string
 *           format: date-time
 *           description: When the action was performed
 *         ipAddress:
 *           type: string
 *           description: IP address from which the action was performed
 *         userAgent:
 *           type: string
 *           description: User agent string
 *         changes:
 *           type: object
 *           nullable: true
 *           description: Object containing before/after values for changes
 */

/**
 * @swagger
 * /account-opening/admin/applications:
 *   get:
 *     summary: Get all applications for admin review (Admin only)
 *     description: Retrieve a list of all applications with filtering options for admin review. Requires admin permissions.
 *     tags: [Account Opening - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [draft, in_progress, submitted, under_review, approved, rejected, completed]
 *         style: form
 *         explode: true
 *         description: Filter by application status (multiple values allowed)
 *         example: ["submitted", "under_review"]
 *       - in: query
 *         name: accountType
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [consumer, commercial, business]
 *         style: form
 *         explode: true
 *         description: Filter by account type (multiple values allowed)
 *         example: ["consumer", "business"]
 *       - in: query
 *         name: riskLevel
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [low, medium, high]
 *         style: form
 *         explode: true
 *         description: Filter by risk assessment level (multiple values allowed)
 *         example: ["high"]
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter applications submitted from this date (YYYY-MM-DD)
 *         example: "2024-01-01"
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter applications submitted until this date (YYYY-MM-DD)
 *         example: "2024-12-31"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by applicant name, application ID, or email
 *         example: "John Doe"
 *     responses:
 *       "200":
 *         description: List of applications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdminApplication'
 *             example:
 *               - id: "app_123"
 *                 applicantName: "John Doe"
 *                 accountType: "consumer"
 *                 status: "under_review"
 *                 currentStep: "kyc_verification"
 *                 riskLevel: "low"
 *                 submittedAt: "2025-01-01T10:00:00Z"
 *                 lastActivity: "2025-01-01T15:30:00Z"
 *                 assignedTo: null
 *               - id: "app_456"
 *                 applicantName: "Acme Corp"
 *                 accountType: "business"
 *                 status: "submitted"
 *                 currentStep: "risk_assessment"
 *                 riskLevel: "medium"
 *                 submittedAt: "2025-01-01T12:00:00Z"
 *                 lastActivity: "2025-01-01T12:00:00Z"
 *                 assignedTo: null
 *       "401":
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Please authenticate"
 *       "403":
 *         description: Forbidden - insufficient permissions (admin role required)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: "Forbidden"
 *       "500":
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Failed to retrieve applications"
 */

/**
 * @swagger
 * /account-opening/admin/applications/{applicationId}/status:
 *   put:
 *     summary: Update application status (Admin only)
 *     description: Update the status of an application. Only admin users can perform this action. Creates an audit trail entry for the change.
 *     tags: [Account Opening - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID to update
 *         example: "app_123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [draft, in_progress, submitted, under_review, approved, rejected, completed]
 *                 description: New status for the application
 *               notes:
 *                 type: string
 *                 description: Optional admin notes about the status change
 *                 maxLength: 1000
 *             example:
 *               status: "approved"
 *               notes: "All documents verified and risk assessment passed"
 *     responses:
 *       "200":
 *         description: Application status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *             example:
 *               id: "app_123"
 *               status: "approved"
 *               currentStep: "confirmation"
 *               accountType: "consumer"
 *               customerType: "new"
 *               applicantId: "applicant_123"
 *               submittedAt: "2025-01-01T10:00:00Z"
 *               completedAt: null
 *               createdAt: "2025-01-01T09:00:00Z"
 *               updatedAt: "2025-01-01T16:00:00Z"
 *               metadata:
 *                 userAgent: "Mozilla/5.0..."
 *                 ipAddress: "192.168.1.1"
 *                 sessionId: "session_123"
 *                 lastActivity: "2025-01-01T16:00:00Z"
 *       "400":
 *         description: Invalid status transition or bad request data
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
 *                   example: "Invalid status transition"
 *       "401":
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Please authenticate"
 *       "403":
 *         description: Forbidden - insufficient permissions (admin role required)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: "Forbidden"
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
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Failed to update application status"
 */

/**
 * @swagger
 * /account-opening/admin/applications/{applicationId}/audit:
 *   get:
 *     summary: Get audit trail for application (Admin only)
 *     description: Retrieve the complete audit trail for an application showing all actions performed. Only admin users can access audit trails.
 *     tags: [Account Opening - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID to get audit trail for
 *         example: "app_123"
 *     responses:
 *       "200":
 *         description: Audit trail retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AuditTrailEntry'
 *             example:
 *               - id: "audit_123"
 *                 applicationId: "app_123"
 *                 action: "status_updated"
 *                 description: "Application status updated from under_review to approved - Notes: All documents verified and risk assessment passed"
 *                 performedBy: "admin_1"
 *                 performedAt: "2025-01-01T16:00:00Z"
 *                 ipAddress: "192.168.1.100"
 *                 userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
 *                 changes:
 *                   status:
 *                     from: "under_review"
 *                     to: "approved"
 *                   notes: "All documents verified and risk assessment passed"
 *               - id: "audit_122"
 *                 applicationId: "app_123"
 *                 action: "application_submitted"
 *                 description: "Application submitted for review"
 *                 performedBy: "user_123"
 *                 performedAt: "2025-01-01T10:00:00Z"
 *                 ipAddress: "192.168.1.50"
 *                 userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
 *                 changes:
 *                   status:
 *                     from: "in_progress"
 *                     to: "submitted"
 *               - id: "audit_121"
 *                 applicationId: "app_123"
 *                 action: "application_created"
 *                 description: "New account opening application created"
 *                 performedBy: "user_123"
 *                 performedAt: "2025-01-01T09:00:00Z"
 *                 ipAddress: "192.168.1.50"
 *                 userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
 *                 changes:
 *                   accountType:
 *                     from: null
 *                     to: "consumer"
 *       "401":
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Please authenticate"
 *       "403":
 *         description: Forbidden - insufficient permissions (admin role required)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: "Forbidden"
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
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Failed to retrieve audit trail"
 */

/**
 * @swagger
 * tags:
 *   name: Account Opening
 *   description: Account opening application management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Application:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique application ID
 *         status:
 *           type: string
 *           enum: [draft, in_progress, submitted, under_review, approved, rejected, completed]
 *           description: Current application status
 *         currentStep:
 *           type: string
 *           enum: [account_type, personal_info, business_profile, financial_profile, product_selection, document_upload, kyc_verification, risk_assessment, agreements, signatures, funding, review, confirmation]
 *           description: Current step in the application process
 *         accountType:
 *           type: string
 *           enum: [consumer, commercial, business]
 *           description: Type of account being opened
 *         customerType:
 *           type: string
 *           enum: [new, existing]
 *           description: Type of customer
 *         applicantId:
 *           type: string
 *           description: Unique applicant identifier
 *         submittedAt:
 *           type: string
 *           format: date-time
 *           description: When the application was submitted
 *         completedAt:
 *           type: string
 *           format: date-time
 *           description: When the application was completed
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the application was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the application was last updated
 *         metadata:
 *           type: object
 *           properties:
 *             userAgent:
 *               type: string
 *             ipAddress:
 *               type: string
 *             sessionId:
 *               type: string
 *             startedAt:
 *               type: string
 *               format: date-time
 *             lastActivity:
 *               type: string
 *               format: date-time
 *             source:
 *               type: string
 *
 *     PersonalInfo:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - dateOfBirth
 *         - ssn
 *         - phone
 *         - email
 *         - mailingAddress
 *         - employmentStatus
 *       properties:
 *         firstName:
 *           type: string
 *         middleName:
 *           type: string
 *         lastName:
 *           type: string
 *         suffix:
 *           type: string
 *         dateOfBirth:
 *           type: string
 *         ssn:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         mailingAddress:
 *           type: object
 *         physicalAddress:
 *           type: object
 *         employmentStatus:
 *           type: string
 *         occupation:
 *           type: string
 *         employer:
 *           type: string
 *         workPhone:
 *           type: string
 *
 *     BusinessProfile:
 *       type: object
 *       required:
 *         - businessName
 *         - ein
 *         - entityType
 *         - industryType
 *         - dateEstablished
 *         - businessAddress
 *         - businessPhone
 *         - businessEmail
 *         - description
 *         - monthlyTransactionVolume
 *         - monthlyTransactionCount
 *         - expectedBalance
 *       properties:
 *         businessName:
 *           type: string
 *         dbaName:
 *           type: string
 *         ein:
 *           type: string
 *         entityType:
 *           type: string
 *         industryType:
 *           type: string
 *         dateEstablished:
 *           type: string
 *         businessAddress:
 *           type: object
 *         mailingAddress:
 *           type: object
 *         businessPhone:
 *           type: string
 *         businessEmail:
 *           type: string
 *           format: email
 *         website:
 *           type: string
 *         description:
 *           type: string
 *         isCashIntensive:
 *           type: boolean
 *         monthlyTransactionVolume:
 *           type: number
 *         monthlyTransactionCount:
 *           type: integer
 *         expectedBalance:
 *           type: number
 */

/**
 * @swagger
 * /account-opening/applications:
 *   post:
 *     summary: Create a new account opening application
 *     description: Create a new account opening application with basic information
 *     tags: [Account Opening]
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
 *                 enum: [consumer, commercial, business]
 *                 description: Type of account to open
 *               personalInfo:
 *                 $ref: '#/components/schemas/PersonalInfo'
 *               businessProfile:
 *                 $ref: '#/components/schemas/BusinessProfile'
 *             example:
 *               accountType: consumer
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       "400":
 *         description: Invalid input data
 *       "401":
 *         description: Unauthorized
 *       "500":
 *         description: Internal server error
 */

/**
 * @swagger
 * /account-opening/applications/{applicationId}:
 *   get:
 *     summary: Get application details by ID
 *     description: Retrieve detailed information about a specific application
 *     tags: [Account Opening]
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
 *               $ref: '#/components/schemas/Application'
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Application not found
 *       "500":
 *         description: Internal server error
 *
 *   put:
 *     summary: Update application information
 *     description: Update application status, current step, or account type
 *     tags: [Account Opening]
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
 *                 enum: [account_type, personal_info, business_profile, financial_profile, product_selection, document_upload, kyc_verification, risk_assessment, agreements, signatures, funding, review, confirmation]
 *               status:
 *                 type: string
 *                 enum: [draft, in_progress, submitted, under_review, approved, rejected, completed]
 *               accountType:
 *                 type: string
 *                 enum: [consumer, commercial, business]
 *             example:
 *               currentStep: personal_info
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       "400":
 *         description: Invalid input data
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Application not found
 *       "500":
 *         description: Internal server error
 */

/**
 * @swagger
 * /account-opening/applications/submit:
 *   post:
 *     summary: Submit application for review
 *     description: Submit a completed application for review and processing
 *     tags: [Account Opening]
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
 *                 description: Confirmation that final review is complete
 *               electronicConsent:
 *                 type: boolean
 *                 description: Electronic consent to terms and conditions
 *             example:
 *               applicationId: app_123
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
 *                   example: true
 *       "400":
 *         description: Invalid input or application not ready
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Application not found
 *       "500":
 *         description: Internal server error
 */

/**
 * @swagger
 * /account-opening/applications/{applicationId}/summary:
 *   get:
 *     summary: Get complete application summary for review
 *     description: Retrieve a comprehensive summary of all application data for review
 *     tags: [Account Opening]
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
 *                   $ref: '#/components/schemas/Application'
 *                 personalInfo:
 *                   $ref: '#/components/schemas/PersonalInfo'
 *                 businessProfile:
 *                   $ref: '#/components/schemas/BusinessProfile'
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
 *         description: Unauthorized
 *       "404":
 *         description: Application not found
 *       "500":
 *         description: Internal server error
 */

/**
 * @swagger
 * /account-opening/applications/{applicationId}/personal-info:
 *   put:
 *     summary: Update personal information for application
 *     description: Update personal information for a specific application
 *     tags: [Account Opening]
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
 *             required:
 *               - firstName
 *               - lastName
 *               - dateOfBirth
 *               - ssn
 *               - phone
 *               - email
 *               - mailingAddress
 *               - employmentStatus
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: First name
 *               middleName:
 *                 type: string
 *                 description: Middle name
 *               lastName:
 *                 type: string
 *                 description: Last name
 *               suffix:
 *                 type: string
 *                 description: Name suffix (Jr., Sr., etc.)
 *               dateOfBirth:
 *                 type: string
 *                 description: Date of birth in YYYY-MM-DD format
 *               ssn:
 *                 type: string
 *                 description: Social Security Number
 *               phone:
 *                 type: string
 *                 description: Phone number
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *               mailingAddress:
 *                 type: object
 *                 required:
 *                   - street
 *                   - city
 *                   - state
 *                   - zipCode
 *                   - country
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   country:
 *                     type: string
 *                 description: Mailing address
 *               physicalAddress:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   country:
 *                     type: string
 *                 description: Physical address (if different from mailing)
 *               employmentStatus:
 *                 type: string
 *                 description: Employment status
 *               occupation:
 *                 type: string
 *                 description: Occupation/job title
 *               employer:
 *                 type: string
 *                 description: Employer name
 *               workPhone:
 *                 type: string
 *                 description: Work phone number
 *             example:
 *               firstName: John
 *               lastName: Doe
 *               dateOfBirth: "1990-01-15"
 *               ssn: "123-45-6789"
 *               phone: "555-123-4567"
 *               email: "john.doe@example.com"
 *               mailingAddress:
 *                 street: "123 Main St"
 *                 city: "Anytown"
 *                 state: "CA"
 *                 zipCode: "12345"
 *                 country: "US"
 *               employmentStatus: "employed"
 *               occupation: "Software Engineer"
 *               employer: "Tech Corp"
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PersonalInfo'
 *       "400":
 *         description: Invalid input data
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Application not found
 *       "500":
 *         description: Internal server error
 *
 *   get:
 *     summary: Get personal information for application
 *     description: Retrieve personal information for a specific application
 *     tags: [Account Opening]
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
 *               $ref: '#/components/schemas/PersonalInfo'
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Application or personal info not found
 *       "500":
 *         description: Internal server error
 */

/**
 * @swagger
 * /account-opening/applications/{applicationId}/business-profile:
 *   put:
 *     summary: Update business profile for commercial applications
 *     description: Update business profile information for a specific commercial application
 *     tags: [Account Opening]
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
 *             required:
 *               - businessName
 *               - ein
 *               - entityType
 *               - industryType
 *               - dateEstablished
 *               - businessAddress
 *               - businessPhone
 *               - businessEmail
 *               - description
 *               - isCashIntensive
 *               - monthlyTransactionVolume
 *               - monthlyTransactionCount
 *               - expectedBalance
 *             properties:
 *               businessName:
 *                 type: string
 *                 description: Legal business name
 *               dbaName:
 *                 type: string
 *                 description: Doing Business As name (optional)
 *               ein:
 *                 type: string
 *                 description: Employer Identification Number
 *               entityType:
 *                 type: string
 *                 description: Business entity type (corporation, LLC, etc.)
 *               industryType:
 *                 type: string
 *                 description: Industry classification
 *               dateEstablished:
 *                 type: string
 *                 description: Date business was established (YYYY-MM-DD)
 *               businessAddress:
 *                 type: object
 *                 required:
 *                   - street
 *                   - city
 *                   - state
 *                   - zipCode
 *                   - country
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   country:
 *                     type: string
 *                 description: Business address
 *               mailingAddress:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   country:
 *                     type: string
 *                 description: Mailing address (if different from business address)
 *               businessPhone:
 *                 type: string
 *                 description: Business phone number
 *               businessEmail:
 *                 type: string
 *                 format: email
 *                 description: Business email address
 *               website:
 *                 type: string
 *                 description: Business website URL (optional)
 *               description:
 *                 type: string
 *                 description: Business description and activities
 *               isCashIntensive:
 *                 type: boolean
 *                 description: Whether the business handles significant amounts of cash
 *               monthlyTransactionVolume:
 *                 type: number
 *                 description: Expected monthly transaction volume in dollars
 *               monthlyTransactionCount:
 *                 type: integer
 *                 description: Expected number of transactions per month
 *               expectedBalance:
 *                 type: number
 *                 description: Expected average account balance in dollars
 *             example:
 *               businessName: "Acme Corp"
 *               ein: "12-3456789"
 *               entityType: "corporation"
 *               industryType: "Technology"
 *               dateEstablished: "2020-01-01"
 *               businessAddress:
 *                 street: "456 Business Blvd"
 *                 city: "Business City"
 *                 state: "CA"
 *                 zipCode: "54321"
 *                 country: "US"
 *               businessPhone: "555-987-6543"
 *               businessEmail: "info@acmecorp.com"
 *               description: "Technology consulting services"
 *               isCashIntensive: false
 *               monthlyTransactionVolume: 50000
 *               monthlyTransactionCount: 100
 *               expectedBalance: 25000
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessProfile'
 *       "400":
 *         description: Invalid input data
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Application not found
 *       "500":
 *         description: Internal server error
 *
 *   get:
 *     summary: Get business profile for application
 *     description: Retrieve business profile information for a specific application
 *     tags: [Account Opening]
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
 *               $ref: '#/components/schemas/BusinessProfile'
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Application or business profile not found
 *       "500":
 *         description: Internal server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     FinancialProfile:
 *       type: object
 *       required:
 *         - annualIncome
 *         - incomeSource
 *         - assets
 *         - liabilities
 *         - bankingRelationships
 *         - accountActivities
 *       properties:
 *         annualIncome:
 *           type: number
 *           minimum: 0
 *           description: Annual income in dollars
 *         incomeSource:
 *           type: array
 *           items:
 *             type: string
 *           minItems: 1
 *           description: Sources of income
 *         employmentInfo:
 *           type: object
 *           description: Optional employment information
 *         assets:
 *           type: number
 *           minimum: 0
 *           description: Total assets in dollars
 *         liabilities:
 *           type: number
 *           minimum: 0
 *           description: Total liabilities in dollars
 *         bankingRelationships:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               bankName:
 *                 type: string
 *               accountTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *               yearsWithBank:
 *                 type: number
 *           minItems: 1
 *           description: Existing banking relationships
 *         accountActivities:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               activity:
 *                 type: string
 *               frequency:
 *                 type: string
 *               amount:
 *                 type: number
 *           minItems: 1
 *           description: Expected account activities
 */

/**
 * @swagger
 * /account-opening/applications/{applicationId}/financial-profile:
 *   put:
 *     summary: Update financial profile information
 *     description: Update financial profile information for a specific application
 *     tags: [Account Opening]
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
 *             required:
 *               - annualIncome
 *               - incomeSource
 *               - assets
 *               - liabilities
 *               - bankingRelationships
 *               - accountActivities
 *             properties:
 *               annualIncome:
 *                 type: number
 *                 minimum: 0
 *                 description: Annual income in dollars
 *               incomeSource:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 description: Sources of income (e.g., employment, self-employment, investment)
 *               employmentInfo:
 *                 type: object
 *                 description: Optional employment information
 *               assets:
 *                 type: number
 *                 minimum: 0
 *                 description: Total assets in dollars
 *               liabilities:
 *                 type: number
 *                 minimum: 0
 *                 description: Total liabilities in dollars
 *               bankingRelationships:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     bankName:
 *                       type: string
 *                       description: Name of the bank
 *                     accountTypes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Types of accounts (Checking, Savings, etc.)
 *                     yearsWithBank:
 *                       type: number
 *                       description: Number of years with this bank
 *                 minItems: 1
 *                 description: Existing banking relationships
 *               accountActivities:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     activity:
 *                       type: string
 *                       description: Type of activity (Direct Deposit, Wire Transfer, etc.)
 *                     frequency:
 *                       type: string
 *                       description: Frequency of activity (Monthly, Weekly, etc.)
 *                     amount:
 *                       type: number
 *                       description: Typical amount for this activity
 *                 minItems: 1
 *                 description: Expected account activities
 *             example:
 *               annualIncome: 75000
 *               incomeSource: ["employment"]
 *               assets: 50000
 *               liabilities: 15000
 *               bankingRelationships:
 *                 - bankName: "Big Bank"
 *                   accountTypes: ["Checking", "Savings"]
 *                   yearsWithBank: 5
 *               accountActivities:
 *                 - activity: "Direct Deposit"
 *                   frequency: "Monthly"
 *                   amount: 6250
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FinancialProfile'
 *       "400":
 *         description: Invalid input data
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Application not found
 *       "500":
 *         description: Internal server error
 *
 *   get:
 *     summary: Get financial profile for application
 *     description: Retrieve financial profile information for a specific application
 *     tags: [Account Opening]
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
 *               $ref: '#/components/schemas/FinancialProfile'
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Application or financial profile not found
 *       "500":
 *         description: Internal server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique product ID
 *         name:
 *           type: string
 *           description: Product name
 *         type:
 *           type: string
 *           description: Product type (checking, savings, etc.)
 *         description:
 *           type: string
 *           description: Product description
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           description: Available product features
 *         minimumBalance:
 *           type: number
 *           description: Minimum balance required
 *         monthlyFee:
 *           type: number
 *           description: Monthly maintenance fee
 *         interestRate:
 *           type: number
 *           description: Interest rate (if applicable)
 *         isActive:
 *           type: boolean
 *           description: Whether product is currently available
 *         eligibilityRules:
 *           type: array
 *           items:
 *             type: object
 *           description: Eligibility rules for the product
 *
 *     ProductSelection:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *           description: Selected product ID
 *         product:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             type:
 *               type: string
 *           description: Basic product information
 *         selectedFeatures:
 *           type: array
 *           items:
 *             type: string
 *           description: Features selected by the applicant
 *         initialDeposit:
 *           type: number
 *           nullable: true
 *           description: Initial deposit amount
 */

/**
 * @swagger
 * /account-opening/products:
 *   get:
 *     summary: Get available products for account opening
 *     description: Retrieve list of available banking products for account opening
 *     tags: [Account Opening]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: accountType
 *         schema:
 *           type: string
 *           enum: [consumer, commercial, business]
 *         description: Filter products by account type
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *             example:
 *               - id: "prod_simple_checking"
 *                 name: "Simple Checking"
 *                 type: "checking"
 *                 description: "Online Banking & Bill Pay • Mobile Deposits & Electronic Statements • Monthly Fee of $10 • Minimum Balance of $100"
 *                 features: ["Online Banking", "Bill Pay", "Mobile Deposits", "Electronic Statements"]
 *                 minimumBalance: 100
 *                 monthlyFee: 10
 *                 interestRate: 0
 *                 isActive: true
 *                 eligibilityRules: []
 *       "401":
 *         description: Unauthorized
 *       "500":
 *         description: Internal server error
 */

/**
 * @swagger
 * /account-opening/applications/{applicationId}/eligible-products:
 *   get:
 *     summary: Get products eligible for specific application
 *     description: Retrieve products eligible based on application data and criteria
 *     tags: [Account Opening]
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
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *             example:
 *               - id: "prod_simple_checking"
 *                 name: "Simple Checking"
 *                 type: "checking"
 *                 description: "Online Banking & Bill Pay • Mobile Deposits & Electronic Statements • Monthly Fee of $10 • Minimum Balance of $100"
 *                 features: ["Online Banking", "Bill Pay", "Mobile Deposits", "Electronic Statements"]
 *                 minimumBalance: 100
 *                 monthlyFee: 10
 *                 interestRate: 0
 *                 isActive: true
 *                 eligibilityRules: []
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Application not found
 *       "500":
 *         description: Internal server error
 */

/**
 * @swagger
 * /account-opening/applications/{applicationId}/product-selections:
 *   put:
 *     summary: Update product selections for application
 *     description: Update the selected products and their configurations for an application
 *     tags: [Account Opening]
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
 *             required:
 *               - selections
 *             properties:
 *               selections:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                   properties:
 *                     productId:
 *                       type: string
 *                       description: ID of the selected product
 *                     selectedFeatures:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Features selected from the product's available features
 *                     initialDeposit:
 *                       type: number
 *                       minimum: 0
 *                       description: Initial deposit amount (must meet product minimum)
 *             example:
 *               selections:
 *                 - productId: "prod_simple_checking"
 *                   selectedFeatures: ["Online Banking", "Mobile Deposits"]
 *                   initialDeposit: 500
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductSelection'
 *             example:
 *               - productId: "prod_simple_checking"
 *                 product:
 *                   id: "prod_simple_checking"
 *                   name: "Simple Checking"
 *                   type: "checking"
 *                 selectedFeatures: ["Online Banking", "Mobile Deposits"]
 *                 initialDeposit: 500
 *       "400":
 *         description: Invalid product selections or validation errors
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Application not found
 *       "500":
 *         description: Internal server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Document:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique document ID
 *         applicationId:
 *           type: string
 *           description: Associated application ID
 *         type:
 *           type: string
 *           enum: [drivers_license, passport, utility_bill, bank_statement, tax_return, social_security_card, birth_certificate, government_id, proof_of_address, business_license, articles_of_incorporation, other]
 *           description: Type of document
 *         fileName:
 *           type: string
 *           description: Original file name
 *         fileSize:
 *           type: integer
 *           description: File size in bytes
 *         mimeType:
 *           type: string
 *           description: MIME type of the file
 *         uploadedAt:
 *           type: string
 *           format: date-time
 *           description: When the document was uploaded
 *         verificationStatus:
 *           type: string
 *           enum: [pending, verified, rejected, needs_review, failed]
 *           description: Document verification status
 *         verificationDetails:
 *           type: object
 *           description: Verification results and extracted data
 */

/**
 * @swagger
 * /account-opening/documents/upload:
 *   post:
 *     summary: Upload document for application
 *     description: Upload a document file for account opening application verification
 *     tags: [Account Opening]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - documentType
 *               - applicationId
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Document file to upload (PDF, JPG, PNG, etc.)
 *               documentType:
 *                 type: string
 *                 enum: [drivers_license, passport, utility_bill, bank_statement, tax_return, social_security_card, birth_certificate, government_id, proof_of_address, business_license, articles_of_incorporation, other]
 *                 description: Type of document being uploaded
 *               applicationId:
 *                 type: string
 *                 description: ID of the application this document belongs to
 *     responses:
 *       "200":
 *         description: Document uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Document'
 *             example:
 *               id: "doc_123"
 *               applicationId: "app_123"
 *               type: "drivers_license"
 *               fileName: "license.pdf"
 *               fileSize: 1024576
 *               mimeType: "application/pdf"
 *               uploadedAt: "2025-01-01T00:00:00Z"
 *               verificationStatus: "pending"
 *       "400":
 *         description: Invalid file or document type
 *       "401":
 *         description: Unauthorized
 *       "413":
 *         description: File too large
 *       "500":
 *         description: Internal server error
 */

/**
 * @swagger
 * /account-opening/applications/{applicationId}/documents:
 *   get:
 *     summary: Get all documents for application
 *     description: Retrieve all uploaded documents for a specific application
 *     tags: [Account Opening]
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
 *         description: List of documents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Document'
 *                   - type: object
 *                     properties:
 *                       verificationDetails:
 *                         type: object
 *                         properties:
 *                           provider:
 *                             type: string
 *                           confidence:
 *                             type: number
 *                           extractedData:
 *                             type: object
 *                           verificationId:
 *                             type: string
 *                           verifiedAt:
 *                             type: string
 *                             format: date-time
 *                           issues:
 *                             type: array
 *                             items:
 *                               type: string
 *             example:
 *               - id: "doc_123"
 *                 applicationId: "app_123"
 *                 type: "drivers_license"
 *                 fileName: "license.pdf"
 *                 fileSize: 1024576
 *                 mimeType: "application/pdf"
 *                 uploadedAt: "2025-01-01T00:00:00Z"
 *                 verificationStatus: "verified"
 *                 verificationDetails:
 *                   provider: "Mock Provider"
 *                   confidence: 0.95
 *                   extractedData:
 *                     name: "John Doe"
 *                     license_number: "D123456789"
 *                   verificationId: "verify_123"
 *                   verifiedAt: "2025-01-01T00:01:00Z"
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Application not found
 *       "500":
 *         description: Internal server error
 */

/**
 * @swagger
 * /account-opening/documents/{documentId}:
 *   delete:
 *     summary: Delete document
 *     description: Delete an uploaded document from an application
 *     tags: [Account Opening]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID to delete
 *     responses:
 *       "204":
 *         description: Document deleted successfully
 *       "401":
 *         description: Unauthorized
 *       "403":
 *         description: Access denied
 *       "404":
 *         description: Document not found
 *       "500":
 *         description: Internal server error
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
 *           description: Unique KYC verification ID
 *         applicationId:
 *           type: string
 *           description: Associated application ID
 *         status:
 *           type: string
 *           enum: [pending, passed, failed, needs_review]
 *           description: Overall KYC verification status
 *         provider:
 *           type: string
 *           description: KYC verification provider
 *         verificationId:
 *           type: string
 *           description: Provider's verification ID
 *         confidence:
 *           type: number
 *           minimum: 0
 *           maximum: 1
 *           description: Overall confidence score (0-1)
 *         verifiedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When verification was completed
 *         results:
 *           type: object
 *           properties:
 *             identity:
 *               type: object
 *               properties:
 *                 passed:
 *                   type: boolean
 *                 confidence:
 *                   type: number
 *                 details:
 *                   type: object
 *               description: Identity verification results
 *             address:
 *               type: object
 *               properties:
 *                 passed:
 *                   type: boolean
 *                 confidence:
 *                   type: number
 *                 details:
 *                   type: object
 *               description: Address verification results
 *             phone:
 *               type: object
 *               properties:
 *                 passed:
 *                   type: boolean
 *                 confidence:
 *                   type: number
 *                 details:
 *                   type: object
 *               description: Phone verification results
 *             email:
 *               type: object
 *               properties:
 *                 passed:
 *                   type: boolean
 *                 confidence:
 *                   type: number
 *                 details:
 *                   type: object
 *               description: Email verification results
 *             ofac:
 *               type: object
 *               properties:
 *                 passed:
 *                   type: boolean
 *                 matches:
 *                   type: array
 *                   items:
 *                     type: object
 *               description: OFAC screening results
 *           description: Detailed verification results
 */

/**
 * @swagger
 * /account-opening/applications/{applicationId}/kyc/initiate:
 *   post:
 *     summary: Initiate KYC verification for application
 *     description: Start the identity verification process for an account opening application. Requires personal information to be present.
 *     tags: [Account Opening]
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
 *         description: KYC verification initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KYCVerification'
 *             example:
 *               id: "kyc_123"
 *               applicationId: "app_123"
 *               status: "pending"
 *               provider: "Mock Provider"
 *               verificationId: "verify_123"
 *               confidence: 0.95
 *               results:
 *                 identity:
 *                   passed: true
 *                   confidence: 0.95
 *                 address:
 *                   passed: true
 *                   confidence: 0.9
 *                 phone:
 *                   passed: true
 *                   confidence: 0.88
 *                 email:
 *                   passed: true
 *                   confidence: 0.92
 *                 ofac:
 *                   passed: true
 *                   matches: []
 *       "400":
 *         description: KYC already initiated or application not ready (missing personal info)
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
 *                   example: "KYC already initiated or application not ready"
 *       "401":
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Please authenticate"
 *       "404":
 *         description: Application not found or user doesn't have access
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
 *         description: Internal server error during KYC verification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "KYC verification failed"
 */

/**
 * @swagger
 * /account-opening/applications/{applicationId}/kyc/status:
 *   get:
 *     summary: Get KYC verification status for application
 *     description: Retrieve the current status and results of KYC verification for an application
 *     tags: [Account Opening]
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
 *         description: KYC verification status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KYCVerification'
 *             example:
 *               id: "kyc_123"
 *               applicationId: "app_123"
 *               status: "passed"
 *               provider: "Mock Provider"
 *               verificationId: "verify_123"
 *               confidence: 0.95
 *               verifiedAt: "2025-01-01T00:05:00Z"
 *               results:
 *                 identity:
 *                   passed: true
 *                   confidence: 0.95
 *                   details:
 *                     nameMatch: true
 *                     dateOfBirthMatch: true
 *                     ssnMatch: true
 *                 address:
 *                   passed: true
 *                   confidence: 0.9
 *                   details:
 *                     addressVerified: true
 *                     utilityBillMatch: true
 *                 phone:
 *                   passed: true
 *                   confidence: 0.88
 *                   details:
 *                     phoneVerified: true
 *                     carrierVerified: true
 *                 email:
 *                   passed: true
 *                   confidence: 0.92
 *                   details:
 *                     emailVerified: true
 *                     domainVerified: true
 *                 ofac:
 *                   passed: true
 *                   matches: []
 *       "401":
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Please authenticate"
 *       "404":
 *         description: Application not found, user doesn't have access, or KYC verification not found
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
 *                   example: "Application or KYC verification not found"
 *       "500":
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AdditionalSigner:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique signer ID
 *         applicationId:
 *           type: string
 *           description: Associated application ID
 *         personalInfo:
 *           type: object
 *           properties:
 *             firstName:
 *               type: string
 *             middleName:
 *               type: string
 *             lastName:
 *               type: string
 *             suffix:
 *               type: string
 *             dateOfBirth:
 *               type: string
 *               format: date
 *             ssn:
 *               type: string
 *             phone:
 *               type: string
 *             email:
 *               type: string
 *               format: email
 *             mailingAddress:
 *               type: object
 *               properties:
 *                 street:
 *                   type: string
 *                 city:
 *                   type: string
 *                 state:
 *                   type: string
 *                 zipCode:
 *                   type: string
 *                 country:
 *                   type: string
 *             physicalAddress:
 *               type: object
 *               properties:
 *                 street:
 *                   type: string
 *                 city:
 *                   type: string
 *                 state:
 *                   type: string
 *                 zipCode:
 *                   type: string
 *                 country:
 *                   type: string
 *             employmentStatus:
 *               type: string
 *               enum: [employed, self_employed, unemployed, retired, student, other]
 *             occupation:
 *               type: string
 *             employer:
 *               type: string
 *             workPhone:
 *               type: string
 *           description: Personal information of the signer
 *         role:
 *           type: string
 *           enum: [authorized_signer, beneficial_owner, managing_member, partner, officer, director, trustee, other]
 *           description: Role of the signer in the business
 *         relationshipToBusiness:
 *           type: string
 *           nullable: true
 *           description: Description of relationship to the business
 *         beneficialOwnershipPercentage:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           nullable: true
 *           description: Percentage of beneficial ownership (required for beneficial owners)
 *         hasSigningAuthority:
 *           type: boolean
 *           description: Whether the signer has signing authority on the account
 *         kycStatus:
 *           type: string
 *           enum: [pending, in_progress, passed, failed]
 *           description: KYC verification status of the signer
 *         documents:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Document'
 *           description: Documents uploaded for this signer
 */

/**
 * @swagger
 * /account-opening/signers:
 *   post:
 *     summary: Add additional signer to application
 *     description: Create a new additional signer for a business account opening application
 *     tags: [Account Opening]
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
 *               - personalInfo
 *               - role
 *               - hasSigningAuthority
 *             properties:
 *               applicationId:
 *                 type: string
 *                 description: ID of the application
 *               personalInfo:
 *                 type: object
 *                 required:
 *                   - firstName
 *                   - lastName
 *                   - dateOfBirth
 *                   - ssn
 *                   - phone
 *                   - email
 *                   - mailingAddress
 *                   - employmentStatus
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   middleName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   suffix:
 *                     type: string
 *                   dateOfBirth:
 *                     type: string
 *                     format: date
 *                   ssn:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *                   mailingAddress:
 *                     type: object
 *                     required:
 *                       - street
 *                       - city
 *                       - state
 *                       - zipCode
 *                       - country
 *                     properties:
 *                       street:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       zipCode:
 *                         type: string
 *                       country:
 *                         type: string
 *                   physicalAddress:
 *                     type: object
 *                     properties:
 *                       street:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       zipCode:
 *                         type: string
 *                       country:
 *                         type: string
 *                   employmentStatus:
 *                     type: string
 *                     enum: [employed, self_employed, unemployed, retired, student, other]
 *                   occupation:
 *                     type: string
 *                   employer:
 *                     type: string
 *                   workPhone:
 *                     type: string
 *               role:
 *                 type: string
 *                 enum: [authorized_signer, beneficial_owner, managing_member, partner, officer, director, trustee, other]
 *               relationshipToBusiness:
 *                 type: string
 *               beneficialOwnershipPercentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               hasSigningAuthority:
 *                 type: boolean
 *             example:
 *               applicationId: "app_123"
 *               personalInfo:
 *                 firstName: "Jane"
 *                 lastName: "Smith"
 *                 dateOfBirth: "1985-05-20"
 *                 ssn: "987-65-4321"
 *                 phone: "555-987-6543"
 *                 email: "jane.smith@example.com"
 *                 mailingAddress:
 *                   street: "456 Oak Ave"
 *                   city: "Another City"
 *                   state: "NY"
 *                   zipCode: "67890"
 *                   country: "US"
 *                 employmentStatus: "employed"
 *               role: "authorized_signer"
 *               hasSigningAuthority: true
 *     responses:
 *       "201":
 *         description: Additional signer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdditionalSigner'
 *             example:
 *               id: "signer_123"
 *               applicationId: "app_123"
 *               personalInfo:
 *                 firstName: "Jane"
 *                 lastName: "Smith"
 *                 dateOfBirth: "1985-05-20"
 *                 ssn: "987-65-4321"
 *                 phone: "555-987-6543"
 *                 email: "jane.smith@example.com"
 *                 mailingAddress:
 *                   street: "456 Oak Ave"
 *                   city: "Another City"
 *                   state: "NY"
 *                   zipCode: "67890"
 *                   country: "US"
 *                 employmentStatus: "employed"
 *               role: "authorized_signer"
 *               hasSigningAuthority: true
 *               kycStatus: "pending"
 *               documents: []
 *       "400":
 *         description: Invalid signer information
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Application not found
 *       "500":
 *         description: Internal server error
 */

/**
 * @swagger
 * /account-opening/signers/{signerId}:
 *   get:
 *     summary: Get additional signer by ID
 *     description: Retrieve a specific additional signer by ID
 *     tags: [Account Opening]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: signerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Additional signer ID
 *     responses:
 *       "200":
 *         description: Additional signer details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdditionalSigner'
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Signer not found
 *       "500":
 *         description: Internal server error
 *
 *   put:
 *     summary: Update additional signer information
 *     description: Update existing additional signer information
 *     tags: [Account Opening]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: signerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Additional signer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               personalInfo:
 *                 type: object
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   middleName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   suffix:
 *                     type: string
 *                   dateOfBirth:
 *                     type: string
 *                     format: date
 *                   ssn:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *                   mailingAddress:
 *                     type: object
 *                     properties:
 *                       street:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       zipCode:
 *                         type: string
 *                       country:
 *                         type: string
 *                   physicalAddress:
 *                     type: object
 *                     properties:
 *                       street:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       zipCode:
 *                         type: string
 *                       country:
 *                         type: string
 *                   employmentStatus:
 *                     type: string
 *                     enum: [employed, self_employed, unemployed, retired, student, other]
 *                   occupation:
 *                     type: string
 *                   employer:
 *                     type: string
 *                   workPhone:
 *                     type: string
 *               role:
 *                 type: string
 *                 enum: [authorized_signer, beneficial_owner, managing_member, partner, officer, director, trustee, other]
 *               relationshipToBusiness:
 *                 type: string
 *               beneficialOwnershipPercentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               hasSigningAuthority:
 *                 type: boolean
 *             example:
 *               role: "beneficial_owner"
 *               beneficialOwnershipPercentage: 25
 *     responses:
 *       "200":
 *         description: Additional signer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdditionalSigner'
 *             example:
 *               id: "signer_123"
 *               applicationId: "app_123"
 *               personalInfo:
 *                 firstName: "Jane"
 *                 lastName: "Smith"
 *               role: "beneficial_owner"
 *               beneficialOwnershipPercentage: 25
 *               hasSigningAuthority: true
 *               kycStatus: "pending"
 *               documents: []
 *       "400":
 *         description: Invalid signer information
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Signer not found
 *       "500":
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete additional signer
 *     description: Remove an additional signer from the application
 *     tags: [Account Opening]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: signerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Additional signer ID
 *     responses:
 *       "204":
 *         description: Additional signer deleted successfully
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Signer not found
 *       "500":
 *         description: Internal server error
 */

/**
 * @swagger
/**
 * @swagger
 * components:
 *   schemas:
 *     RiskFactor:
 *       type: object
 *       properties:
 *         category:
 *           type: string
 *           description: Risk factor category (Identity, Financial, Business, etc.)
 *         factor:
 *           type: string
 *           description: Specific risk factor name
 *         weight:
 *           type: number
 *           description: Weight of this factor in overall assessment (0-1)
 *         score:
 *           type: integer
 *           description: Risk score for this factor (0-100, higher = riskier)
 *         impact:
 *           type: string
 *           enum: [positive, negative, neutral]
 *           description: Impact of this factor on risk
 *         description:
 *           type: string
 *           description: Detailed description of the risk factor
 *
 *     RiskAssessment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique risk assessment ID
 *         applicationId:
 *           type: string
 *           description: Associated application ID
 *         overallRisk:
 *           type: string
 *           enum: [low, medium, high]
 *           description: Overall risk level determination
 *         riskScore:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           description: Numerical risk score (0-100, higher = riskier)
 *         factors:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RiskFactor'
 *           description: Individual risk factors analyzed
 *         recommendations:
 *           type: array
 *           items:
 *             type: string
 *           description: Actionable recommendations based on assessment
 *         requiresManualReview:
 *           type: boolean
 *           description: Whether application requires manual review
 *         assessedAt:
 *           type: string
 *           format: date-time
 *           description: When assessment was performed
 *         assessedBy:
 *           type: string
 *           description: Who or what performed the assessment
 */

/**
 * @swagger
 * /account-opening/applications/{applicationId}/risk-assessment:
 *   post:
 *     summary: Perform risk assessment for application
 *     description: Execute comprehensive risk assessment analyzing identity, financial, business, and behavioral factors to determine overall risk level and provide actionable recommendations
 *     tags: [Account Opening]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID to assess
 *     responses:
 *       "200":
 *         description: Risk assessment completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RiskAssessment'
 *             example:
 *               id: "risk_123"
 *               applicationId: "app_123"
 *               overallRisk: "low"
 *               riskScore: 25
 *               factors:
 *                 - category: "Identity"
 *                   factor: "Strong identity verification"
 *                   weight: 0.3
 *                   score: 10
 *                   impact: "positive"
 *                   description: "Identity verification passed with high confidence"
 *                 - category: "Financial"
 *                   factor: "Low debt-to-income ratio"
 *                   weight: 0.15
 *                   score: 15
 *                   impact: "positive"
 *                   description: "Healthy debt-to-income ratio of 23.5%"
 *                 - category: "Geographic"
 *                   factor: "Standard geographic risk"
 *                   weight: 0.1
 *                   score: 15
 *                   impact: "positive"
 *                   description: "Located in low-risk geographic area"
 *               recommendations:
 *                 - "Proceed with standard approval process"
 *                 - "Standard monitoring procedures apply"
 *               requiresManualReview: false
 *               assessedAt: "2025-01-01T00:10:00Z"
 *               assessedBy: "user_1"
 *       "400":
 *         description: Risk assessment already performed or application not ready for assessment
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
 *                   example: "Risk assessment already performed or application not ready"
 *       "401":
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Please authenticate"
 *       "404":
 *         description: Application not found or user doesn't have access
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
 *         description: Internal server error during risk assessment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Risk assessment failed"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Disclosure:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique disclosure ID
 *         type:
 *           type: string
 *           description: Type of disclosure
 *         title:
 *           type: string
 *           description: Disclosure title
 *         content:
 *           type: string
 *           description: Full disclosure content text
 *         version:
 *           type: string
 *           description: Version of the disclosure
 *         effectiveDate:
 *           type: string
 *           description: Date when disclosure became effective
 *         required:
 *           type: boolean
 *           description: Whether acknowledgment is required
 *         applicableFor:
 *           type: array
 *           items:
 *             type: string
 *           description: Account types this disclosure applies to
 *
 *     Agreement:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique agreement ID
 *         applicationId:
 *           type: string
 *           description: Associated application ID
 *         disclosureId:
 *           type: string
 *           description: Associated disclosure ID
 *         acknowledged:
 *           type: boolean
 *           description: Whether the agreement was acknowledged
 *         acknowledgedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the agreement was acknowledged
 *         ipAddress:
 *           type: string
 *           description: IP address when acknowledged
 *         userAgent:
 *           type: string
 *           description: User agent when acknowledged
 */

/**
 * @swagger
 * /account-opening/disclosures:
 *   get:
 *     summary: Get required disclosures for account type
 *     description: Retrieve all disclosures applicable to a specific account type, with required disclosures listed first
 *     tags: [Account Opening]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: accountType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [consumer, commercial, business]
 *         description: Account type to get disclosures for
 *     responses:
 *       "200":
 *         description: List of applicable disclosures
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Disclosure'
 *             example:
 *               - id: "disc_consumer_account_agreement"
 *                 type: "consumer_account_agreement"
 *                 title: "Consumer Deposit Account Agreement"
 *                 content: "This agreement governs your consumer deposit account..."
 *                 version: "1.0"
 *                 effectiveDate: "2024-01-01"
 *                 required: true
 *                 applicableFor: ["consumer"]
 *       "400":
 *         description: Invalid account type
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
 *                   example: "Invalid account type"
 *       "401":
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Please authenticate"
 *       "500":
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

/**
 * @swagger
 * /account-opening/agreements:
 *   post:
 *     summary: Acknowledge agreement/disclosure
 *     description: Create or update an agreement record to acknowledge a disclosure. Captures IP address and user agent for audit purposes.
 *     tags: [Account Opening]
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
 *               - disclosureId
 *             properties:
 *               applicationId:
 *                 type: string
 *                 description: ID of the application
 *               disclosureId:
 *                 type: string
 *                 description: ID of the disclosure being acknowledged
 *             example:
 *               applicationId: "app_123"
 *               disclosureId: "disc_consumer_account_agreement"
 *     responses:
 *       "200":
 *         description: Agreement acknowledged successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agreement'
 *             example:
 *               id: "agreement_123"
 *               applicationId: "app_123"
 *               disclosureId: "disc_consumer_account_agreement"
 *               acknowledged: true
 *               acknowledgedAt: "2025-01-01T00:15:00Z"
 *               ipAddress: "127.0.0.1"
 *               userAgent: "curl/7.68.0"
 *       "400":
 *         description: Agreement already acknowledged or disclosure not applicable
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
 *                   example: "Agreement already acknowledged"
 *       "401":
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Please authenticate"
 *       "404":
 *         description: Application or disclosure not found
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
 *                   example: "Application or disclosure not found"
 *       "500":
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ElectronicSignature:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique electronic signature ID
 *         applicationId:
 *           type: string
 *           description: Associated application ID
 *         signerId:
 *           type: string
 *           description: ID of the signer (primary_signer or signer ID)
 *         documentType:
 *           type: string
 *           enum: [consumer_account_agreement, business_account_agreement, deposit_account_agreement, terms_and_conditions, privacy_policy, electronic_communications_agreement, funds_availability_policy, fee_schedule, patriot_act_notice, overdraft_coverage_agreement, debit_card_agreement]
 *           description: Type of document being signed
 *         signatureData:
 *           type: string
 *           description: Base64 encoded signature image data
 *         signedAt:
 *           type: string
 *           format: date-time
 *           description: When the signature was captured
 *         ipAddress:
 *           type: string
 *           description: IP address when signature was captured
 *         userAgent:
 *           type: string
 *           description: User agent when signature was captured
 */

/**
 * @swagger
 * /account-opening/signatures:
 *   post:
 *     summary: Capture electronic signature
 *     description: Capture an electronic signature for a specific document in the account opening process. Supports biometric data capture for enhanced security.
 *     tags: [Account Opening]
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
 *               - signatureData
 *               - documentType
 *             properties:
 *               applicationId:
 *                 type: string
 *                 description: ID of the application being signed
 *               signatureData:
 *                 type: string
 *                 pattern: '^data:image\/(png|jpeg|jpg|gif|svg\+xml);base64,'
 *                 description: Base64 encoded signature image data (must be a valid image format)
 *               documentType:
 *                 type: string
 *                 enum: [consumer_account_agreement, business_account_agreement, deposit_account_agreement, terms_and_conditions, privacy_policy, electronic_communications_agreement, funds_availability_policy, fee_schedule, patriot_act_notice, overdraft_coverage_agreement, debit_card_agreement]
 *                 description: Type of document being signed
 *               biometric:
 *                 type: object
 *                 properties:
 *                   touchPressure:
 *                     type: array
 *                     items:
 *                       type: number
 *                     description: Touch pressure data points during signing
 *                   signingSpeed:
 *                     type: array
 *                     items:
 *                       type: number
 *                     description: Signing speed data points
 *                   accelerometer:
 *                     type: array
 *                     items:
 *                       type: object
 *                     description: Accelerometer data during signing
 *                   deviceInfo:
 *                     type: object
 *                     description: Device information used for signing
 *                   timestamp:
 *                     type: array
 *                     items:
 *                       type: number
 *                     description: Timestamp data points for each signature point
 *                 description: Optional biometric data for enhanced security
 *             example:
 *               applicationId: "app_123"
 *               signatureData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
 *               documentType: "consumer_account_agreement"
 *               biometric:
 *                 touchPressure: [0.5, 0.7, 0.9, 0.6]
 *                 signingSpeed: [1.2, 1.5, 1.1, 0.9]
 *                 timestamp: [1640995200000, 1640995201000, 1640995202000, 1640995203000]
 *     responses:
 *       "200":
 *         description: Electronic signature captured successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ElectronicSignature'
 *             example:
 *               id: "sig_123"
 *               applicationId: "app_123"
 *               signerId: "primary_signer"
 *               documentType: "consumer_account_agreement"
 *               signatureData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
 *               signedAt: "2025-01-01T00:20:00Z"
 *               ipAddress: "127.0.0.1"
 *               userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
 *       "400":
 *         description: Invalid signature data or document type
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
 *                   example: "Invalid signature data"
 *       "401":
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Please authenticate"
 *       "404":
 *         description: Application not found or user doesn't have access
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
 *         description: Internal server error during signature capture
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Failed to capture electronic signature"
 */

/**
 * @swagger
 * /account-opening/applications/{applicationId}/signers:
 *   get:
 *     summary: Get all additional signers for application
 *     description: Retrieve all additional signers for a specific application
 *     tags: [Account Opening]
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
 *         description: List of additional signers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdditionalSigner'
 *             example:
 *               - id: "signer_123"
 *                 applicationId: "app_123"
 *                 personalInfo:
 *                   firstName: "Jane"
 *                   lastName: "Smith"
 *                 role: "authorized_signer"
 *                 hasSigningAuthority: true
 *                 kycStatus: "passed"
 *                 documents: []
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Application not found
 *       "500":
 *         description: Internal server error
 */
