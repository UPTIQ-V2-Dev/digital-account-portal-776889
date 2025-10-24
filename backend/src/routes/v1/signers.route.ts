import { signersController } from '../../controllers/index.ts';
import auth from '../../middlewares/auth.ts';
import validate from '../../middlewares/validate.ts';
import { signersValidation } from '../../validations/index.ts';
import express from 'express';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
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
 *           format: date
 *         ssn:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         mailingAddress:
 *           $ref: '#/components/schemas/Address'
 *         physicalAddress:
 *           $ref: '#/components/schemas/Address'
 *         employmentStatus:
 *           type: string
 *           enum: [employed, self_employed, unemployed, retired, student, other]
 *         occupation:
 *           type: string
 *         employer:
 *           type: string
 *         workPhone:
 *           type: string
 *
 *     Address:
 *       type: object
 *       required:
 *         - street
 *         - city
 *         - state
 *         - zipCode
 *         - country
 *       properties:
 *         street:
 *           type: string
 *         city:
 *           type: string
 *         state:
 *           type: string
 *         zipCode:
 *           type: string
 *         country:
 *           type: string
 *
 *     AdditionalSigner:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         applicationId:
 *           type: string
 *         personalInfo:
 *           $ref: '#/components/schemas/PersonalInfo'
 *         role:
 *           type: string
 *           enum: [authorized_signer, beneficial_owner, managing_member, partner, officer, director, trustee, other]
 *         relationshipToBusiness:
 *           type: string
 *         beneficialOwnershipPercentage:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *         hasSigningAuthority:
 *           type: boolean
 *         kycStatus:
 *           type: string
 *           enum: [pending, in_progress, passed, failed]
 *         documents:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Document'
 */

/**
 * @swagger
 * /account-opening/signers:
 *   post:
 *     summary: Add additional signer to application
 *     description: Create a new additional signer for a business account opening application
 *     tags: [Account Opening - Additional Signers]
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
 *               personalInfo:
 *                 $ref: '#/components/schemas/PersonalInfo'
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
 *     responses:
 *       "201":
 *         description: Additional signer created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdditionalSigner'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalError'
 */
router
    .route('/')
    .post(auth('manageAccounts'), validate(signersValidation.createSigner), signersController.createSigner);

/**
 * @swagger
 * /account-opening/signers/{signerId}:
 *   put:
 *     summary: Update additional signer information
 *     description: Update existing additional signer information
 *     tags: [Account Opening - Additional Signers]
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
 *                 $ref: '#/components/schemas/PersonalInfo'
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
 *     responses:
 *       "200":
 *         description: Additional signer updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdditionalSigner'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalError'
 *   get:
 *     summary: Get additional signer by ID
 *     description: Retrieve a specific additional signer by ID
 *     tags: [Account Opening - Additional Signers]
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
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalError'
 *   delete:
 *     summary: Delete additional signer
 *     description: Remove an additional signer from the application
 *     tags: [Account Opening - Additional Signers]
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
 *         description: Additional signer deleted
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalError'
 */
router
    .route('/:signerId')
    .get(auth('getAccounts'), validate(signersValidation.getSigner), signersController.getSigner)
    .put(auth('manageAccounts'), validate(signersValidation.updateSigner), signersController.updateSigner)
    .delete(auth('manageAccounts'), validate(signersValidation.deleteSigner), signersController.deleteSigner);

/**
 * @swagger
 * /account-opening/applications/{applicationId}/signers:
 *   get:
 *     summary: Get all additional signers for application
 *     description: Retrieve all additional signers for a specific application
 *     tags: [Account Opening - Additional Signers]
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
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalError'
 */
router
    .route('/applications/:applicationId')
    .get(
        auth('getAccounts'),
        validate(signersValidation.getSignersByApplication),
        signersController.getSignersByApplication
    );

export default router;
