import { documentController } from '../../controllers/index.ts';
import auth from '../../middlewares/auth.ts';
import validate from '../../middlewares/validate.ts';
import { documentValidation } from '../../validations/index.ts';
import express from 'express';
import multer from 'multer';

const router = express.Router({ mergeParams: true });

// Configure multer for file uploads
// Use memory storage for better integration with cloud storage services
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 1 // Only one file per request
    },
    fileFilter: (req, file, cb) => {
        // Allow only specific MIME types
        const allowedMimeTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png'
        ];
        
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`));
        }
    }
});

// Document management routes
router
    .route('/')
    .post(
        auth('manageApplications'),
        upload.single('file'),
        documentValidation.validateUploadedFile,
        validate(documentValidation.uploadDocument),
        documentController.uploadDocument
    )
    .get(
        auth('getApplications'),
        validate(documentValidation.getDocuments),
        documentController.getDocuments
    );

router
    .route('/:documentId')
    .get(
        auth('getApplications'),
        validate(documentValidation.getDocument),
        documentController.getDocument
    )
    .delete(
        auth('manageApplications'),
        validate(documentValidation.deleteDocument),
        documentController.deleteDocument
    );

export default router;

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Document management for account opening applications
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
 *           description: Unique document identifier
 *         applicationId:
 *           type: string
 *           description: Associated application ID
 *         type:
 *           type: string
 *           enum: [drivers_license, passport, utility_bill, bank_statement, tax_document, other]
 *           description: Document type
 *         fileName:
 *           type: string
 *           description: Original file name
 *         fileSize:
 *           type: integer
 *           description: File size in bytes
 *         mimeType:
 *           type: string
 *           enum: [application/pdf, image/jpeg, image/jpg, image/png]
 *           description: File MIME type
 *         uploadedAt:
 *           type: string
 *           format: date-time
 *           description: Upload timestamp
 *         verificationStatus:
 *           type: string
 *           enum: [pending, verified, review_required, failed]
 *           description: Document verification status
 *         verificationProvider:
 *           type: string
 *           description: Verification service provider
 *           nullable: true
 *         verificationConfidence:
 *           type: number
 *           minimum: 0
 *           maximum: 1
 *           description: Verification confidence score
 *           nullable: true
 *         verifiedAt:
 *           type: string
 *           format: date-time
 *           description: Verification completion timestamp
 *           nullable: true
 *         signerId:
 *           type: string
 *           description: ID of the signer (for multi-signer applications)
 *           nullable: true
 *       example:
 *         id: "doc_123"
 *         applicationId: "app_123456"
 *         type: "drivers_license"
 *         fileName: "license.pdf"
 *         fileSize: 1024576
 *         mimeType: "application/pdf"
 *         uploadedAt: "2025-09-13T14:30:45Z"
 *         verificationStatus: "verified"
 *         verificationProvider: "Mock Provider"
 *         verificationConfidence: 0.95
 *         verifiedAt: "2025-09-13T14:32:45Z"
 *         signerId: null
 */

/**
 * @swagger
 * /account-opening/applications/{applicationId}/documents:
 *   post:
 *     summary: Upload document for application
 *     description: Upload a document file for an account opening application. Supports PDF, JPEG, and PNG files up to 10MB. The document will be automatically verified using mock verification services.
 *     tags: [Documents]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - file
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [drivers_license, passport, utility_bill, bank_statement, tax_document, other]
 *                 description: Document type
 *                 example: "drivers_license"
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Document file (PDF, JPEG, PNG - max 10MB)
 *               signerId:
 *                 type: string
 *                 description: ID of the signer (optional, for multi-signer applications)
 *                 example: "signer_123"
 *           encoding:
 *             file:
 *               contentType: application/pdf, image/jpeg, image/png
 *     responses:
 *       "201":
 *         description: Document uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Document'
 *       "400":
 *         description: Bad Request - Invalid file or document type
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
 *                   example: "Invalid file type. Allowed types: application/pdf, image/jpeg, image/png"
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
 *       "413":
 *         description: File too large
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 413
 *                 message:
 *                   type: string
 *                   example: "File size exceeds 10MB limit"
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   get:
 *     summary: Get all documents for application
 *     description: Retrieve all documents uploaded for a specific application. Returns document metadata including verification status.
 *     tags: [Documents]
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
 *         description: Documents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Document'
 *             example:
 *               - id: "doc_123"
 *                 applicationId: "app_123456"
 *                 type: "drivers_license"
 *                 fileName: "license.pdf"
 *                 fileSize: 1024576
 *                 mimeType: "application/pdf"
 *                 uploadedAt: "2025-09-13T14:30:45Z"
 *                 verificationStatus: "verified"
 *                 verificationProvider: "Mock Provider"
 *                 verificationConfidence: 0.95
 *                 verifiedAt: "2025-09-13T14:32:45Z"
 *                 signerId: null
 *               - id: "doc_124"
 *                 applicationId: "app_123456"
 *                 type: "utility_bill"
 *                 fileName: "utility.pdf"
 *                 fileSize: 2048000
 *                 mimeType: "application/pdf"
 *                 uploadedAt: "2025-09-13T14:35:45Z"
 *                 verificationStatus: "pending"
 *                 verificationProvider: null
 *                 verificationConfidence: null
 *                 verifiedAt: null
 *                 signerId: null
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
 * /account-opening/applications/{applicationId}/documents/{documentId}:
 *   get:
 *     summary: Get or download specific document
 *     description: Retrieve details of a specific document or download the document file. When download=true, returns a redirect to the signed download URL.
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *       - in: query
 *         name: download
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Whether to download the document file (redirects to signed URL)
 *     responses:
 *       "200":
 *         description: Document details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Document'
 *                 - type: object
 *                   properties:
 *                     verificationDetails:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         provider:
 *                           type: string
 *                           description: Verification provider name
 *                         confidence:
 *                           type: number
 *                           minimum: 0
 *                           maximum: 1
 *                           description: Verification confidence score
 *                         extractedData:
 *                           type: object
 *                           description: Data extracted from document
 *                           properties:
 *                             name:
 *                               type: string
 *                             documentNumber:
 *                               type: string
 *                             issueDate:
 *                               type: string
 *                             expirationDate:
 *                               type: string
 *                     downloadUrl:
 *                       type: string
 *                       format: uri
 *                       description: Temporary download URL (only when download=true)
 *                       nullable: true
 *             example:
 *               id: "doc_123"
 *               applicationId: "app_123456"
 *               type: "drivers_license"
 *               fileName: "license.pdf"
 *               fileSize: 1024576
 *               mimeType: "application/pdf"
 *               uploadedAt: "2025-09-13T14:30:45Z"
 *               verificationStatus: "verified"
 *               verificationProvider: "Mock Provider"
 *               verificationConfidence: 0.95
 *               verifiedAt: "2025-09-13T14:32:45Z"
 *               signerId: null
 *               verificationDetails:
 *                 provider: "Mock Document Verification Provider"
 *                 confidence: 0.95
 *                 extractedData:
 *                   name: "John Doe"
 *                   documentNumber: "DOC123456"
 *                   issueDate: "2020-01-15"
 *                   expirationDate: "2025-01-15"
 *               downloadUrl: null
 *       "302":
 *         description: Redirect to document download URL (when download=true)
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               format: uri
 *             description: Signed download URL
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         description: Document not found
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
 *                   example: "Document not found"
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   delete:
 *     summary: Delete document
 *     description: Delete a document from the application. This will remove both the document metadata and the actual file from storage. This action cannot be undone.
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       "204":
 *         description: Document deleted successfully
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         description: Document not found
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
 *                   example: "Document not found"
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */