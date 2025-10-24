import { personalInfoController } from '../../controllers/index.ts';
import auth from '../../middlewares/auth.ts';
import validate from '../../middlewares/validate.ts';
import { personalInfoValidation } from '../../validations/index.ts';
import express from 'express';

const router = express.Router({ mergeParams: true });

// Personal information routes for applications
router
    .route('/')
    .put(
        auth('manageApplications'), 
        validate(personalInfoValidation.createOrUpdatePersonalInfo), 
        personalInfoController.createOrUpdatePersonalInfo
    )
    .get(
        auth('getApplications'), 
        validate(personalInfoValidation.getPersonalInfo), 
        personalInfoController.getPersonalInfo
    )
    .delete(
        auth('manageApplications'), 
        validate(personalInfoValidation.deletePersonalInfo), 
        personalInfoController.deletePersonalInfo
    );

export default router;

/**
 * @swagger
 * tags:
 *   name: Personal Information
 *   description: Personal information management for account opening applications
 */

/**
 * @swagger
 * /account-opening/applications/{applicationId}/personal-info:
 *   put:
 *     summary: Save or update personal information for application
 *     description: Create or update personal information for an account opening application. This endpoint handles personal details including identity information, contact details, employment information, and address information.
 *     tags: [Personal Information]
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
 *                 maxLength: 100
 *                 description: First name of the applicant
 *                 example: "John"
 *               middleName:
 *                 type: string
 *                 maxLength: 100
 *                 description: Middle name of the applicant (optional)
 *                 example: "Michael"
 *               lastName:
 *                 type: string
 *                 maxLength: 100
 *                 description: Last name of the applicant
 *                 example: "Doe"
 *               suffix:
 *                 type: string
 *                 maxLength: 10
 *                 description: Name suffix (optional)
 *                 example: "Jr."
 *               dateOfBirth:
 *                 type: string
 *                 pattern: '^\d{4}-\d{2}-\d{2}$'
 *                 description: Date of birth in YYYY-MM-DD format (must be 18+ years old)
 *                 example: "1990-01-15"
 *               ssn:
 *                 type: string
 *                 pattern: '^\d{3}-\d{2}-\d{4}$'
 *                 description: Social Security Number in XXX-XX-XXXX format
 *                 example: "123-45-6789"
 *               phone:
 *                 type: string
 *                 description: Primary phone number
 *                 example: "555-123-4567"
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 255
 *                 description: Email address
 *                 example: "john@example.com"
 *               employmentStatus:
 *                 type: string
 *                 enum: [employed, self_employed, unemployed, retired, student]
 *                 description: Current employment status
 *                 example: "employed"
 *               occupation:
 *                 type: string
 *                 maxLength: 100
 *                 description: Job title/occupation (required for employed/self-employed)
 *                 example: "Software Engineer"
 *               employer:
 *                 type: string
 *                 maxLength: 255
 *                 description: Employer name (required for employed status)
 *                 example: "Tech Corp"
 *               workPhone:
 *                 type: string
 *                 description: Work phone number (optional)
 *                 example: "555-999-8888"
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
 *                     maxLength: 255
 *                     description: Street address
 *                     example: "123 Main St"
 *                   city:
 *                     type: string
 *                     maxLength: 100
 *                     description: City name
 *                     example: "Anytown"
 *                   state:
 *                     type: string
 *                     pattern: '^[A-Z]{2}$'
 *                     description: State abbreviation (2 letters)
 *                     example: "CA"
 *                   zipCode:
 *                     type: string
 *                     pattern: '^\d{5}(-\d{4})?$'
 *                     description: ZIP code (5 digits or 5+4 format)
 *                     example: "12345"
 *                   country:
 *                     type: string
 *                     description: Country code
 *                     example: "US"
 *                     default: "US"
 *                   apartment:
 *                     type: string
 *                     maxLength: 50
 *                     description: Apartment/suite number (optional)
 *                     example: "Apt 2B"
 *               physicalAddress:
 *                 type: object
 *                 description: Physical address if different from mailing address (optional)
 *                 properties:
 *                   street:
 *                     type: string
 *                     maxLength: 255
 *                   city:
 *                     type: string
 *                     maxLength: 100
 *                   state:
 *                     type: string
 *                     pattern: '^[A-Z]{2}$'
 *                   zipCode:
 *                     type: string
 *                     pattern: '^\d{5}(-\d{4})?$'
 *                   country:
 *                     type: string
 *                   apartment:
 *                     type: string
 *                     maxLength: 50
 *           example:
 *             firstName: "John"
 *             lastName: "Doe"
 *             dateOfBirth: "1990-01-15"
 *             ssn: "123-45-6789"
 *             phone: "555-123-4567"
 *             email: "john@example.com"
 *             mailingAddress:
 *               street: "123 Main St"
 *               city: "Anytown"
 *               state: "CA"
 *               zipCode: "12345"
 *               country: "US"
 *             employmentStatus: "employed"
 *             occupation: "Software Engineer"
 *             employer: "Tech Corp"
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 firstName:
 *                   type: string
 *                 middleName:
 *                   type: string
 *                   nullable: true
 *                 lastName:
 *                   type: string
 *                 suffix:
 *                   type: string
 *                   nullable: true
 *                 dateOfBirth:
 *                   type: string
 *                 ssn:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 email:
 *                   type: string
 *                 employmentStatus:
 *                   type: string
 *                 occupation:
 *                   type: string
 *                   nullable: true
 *                 employer:
 *                   type: string
 *                   nullable: true
 *                 workPhone:
 *                   type: string
 *                   nullable: true
 *                 mailingAddress:
 *                   type: object
 *                 physicalAddress:
 *                   type: object
 *                   nullable: true
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   get:
 *     summary: Get personal information for application
 *     description: Retrieve the personal information for a specific application. Only accessible by the application owner or admin users.
 *     tags: [Personal Information]
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
 *                 firstName:
 *                   type: string
 *                   example: "John"
 *                 middleName:
 *                   type: string
 *                   nullable: true
 *                   example: "Michael"
 *                 lastName:
 *                   type: string
 *                   example: "Doe"
 *                 suffix:
 *                   type: string
 *                   nullable: true
 *                   example: "Jr."
 *                 dateOfBirth:
 *                   type: string
 *                   example: "1990-01-15"
 *                 ssn:
 *                   type: string
 *                   example: "123-45-6789"
 *                 phone:
 *                   type: string
 *                   example: "555-123-4567"
 *                 email:
 *                   type: string
 *                   example: "john@example.com"
 *                 employmentStatus:
 *                   type: string
 *                   example: "employed"
 *                 occupation:
 *                   type: string
 *                   nullable: true
 *                   example: "Software Engineer"
 *                 employer:
 *                   type: string
 *                   nullable: true
 *                   example: "Tech Corp"
 *                 workPhone:
 *                   type: string
 *                   nullable: true
 *                   example: "555-999-8888"
 *                 mailingAddress:
 *                   type: object
 *                   properties:
 *                     street:
 *                       type: string
 *                       example: "123 Main St"
 *                     city:
 *                       type: string
 *                       example: "Anytown"
 *                     state:
 *                       type: string
 *                       example: "CA"
 *                     zipCode:
 *                       type: string
 *                       example: "12345"
 *                     country:
 *                       type: string
 *                       example: "US"
 *                     apartment:
 *                       type: string
 *                       nullable: true
 *                       example: "Apt 2B"
 *                 physicalAddress:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     street:
 *                       type: string
 *                     city:
 *                       type: string
 *                     state:
 *                       type: string
 *                     zipCode:
 *                       type: string
 *                     country:
 *                       type: string
 *                     apartment:
 *                       type: string
 *                       nullable: true
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   delete:
 *     summary: Delete personal information
 *     description: Delete the personal information for an application. Only accessible by the application owner or admin users. This action cannot be undone.
 *     tags: [Personal Information]
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
 *         description: No Content - Personal information deleted successfully
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */