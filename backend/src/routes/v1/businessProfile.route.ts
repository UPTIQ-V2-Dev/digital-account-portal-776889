import { businessProfileController } from '../../controllers/index.ts';
import auth from '../../middlewares/auth.ts';
import validate from '../../middlewares/validate.ts';
import { businessProfileValidation } from '../../validations/index.ts';
import express from 'express';

const router = express.Router({ mergeParams: true });

// Business profile routes for applications
router
    .route('/')
    .put(
        auth('manageApplications'), 
        validate(businessProfileValidation.createOrUpdateBusinessProfile), 
        businessProfileController.createOrUpdateBusinessProfile
    )
    .get(
        auth('getApplications'), 
        validate(businessProfileValidation.getBusinessProfile), 
        businessProfileController.getBusinessProfile
    )
    .delete(
        auth('manageApplications'), 
        validate(businessProfileValidation.deleteBusinessProfile), 
        businessProfileController.deleteBusinessProfile
    );

export default router;

/**
 * @swagger
 * tags:
 *   name: Business Profile
 *   description: Business profile management for commercial account applications
 */

/**
 * @swagger
 * /account-opening/applications/{applicationId}/business-profile:
 *   put:
 *     summary: Save or update business profile for commercial applications
 *     description: Create or update business profile information for a commercial account opening application. This endpoint handles business information including entity details, financial metrics, and address information.
 *     tags: [Business Profile]
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
 *                 maxLength: 255
 *                 description: Legal name of the business
 *                 example: "Acme Corp"
 *               dbaName:
 *                 type: string
 *                 maxLength: 255
 *                 description: Doing Business As name (optional)
 *                 example: "Acme Solutions"
 *               ein:
 *                 type: string
 *                 pattern: '^\d{2}-\d{7}$'
 *                 description: Employer Identification Number in XX-XXXXXXX format
 *                 example: "12-3456789"
 *               entityType:
 *                 type: string
 *                 enum: [corporation, llc, partnership, sole_proprietorship]
 *                 description: Type of business entity
 *                 example: "corporation"
 *               industryType:
 *                 type: string
 *                 maxLength: 100
 *                 description: Industry or business sector
 *                 example: "Technology"
 *               dateEstablished:
 *                 type: string
 *                 pattern: '^\d{4}-\d{2}-\d{2}$'
 *                 description: Date when business was established (YYYY-MM-DD)
 *                 example: "2020-01-01"
 *               businessPhone:
 *                 type: string
 *                 description: Business contact phone number
 *                 example: "555-987-6543"
 *               businessEmail:
 *                 type: string
 *                 format: email
 *                 maxLength: 255
 *                 description: Business contact email address
 *                 example: "info@acmecorp.com"
 *               website:
 *                 type: string
 *                 format: uri
 *                 maxLength: 255
 *                 description: Business website URL (optional)
 *                 example: "https://www.acmecorp.com"
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Description of business activities
 *                 example: "Technology consulting services"
 *               isCashIntensive:
 *                 type: boolean
 *                 description: Whether the business deals with large amounts of cash
 *                 example: false
 *               monthlyTransactionVolume:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 999999999
 *                 description: Expected monthly transaction volume in dollars
 *                 example: 50000
 *               monthlyTransactionCount:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 999999
 *                 description: Expected number of transactions per month
 *                 example: 100
 *               expectedBalance:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 999999999
 *                 description: Expected average account balance in dollars
 *                 example: 25000
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
 *                     maxLength: 255
 *                     description: Street address
 *                     example: "456 Business Blvd"
 *                   city:
 *                     type: string
 *                     maxLength: 100
 *                     description: City name
 *                     example: "Business City"
 *                   state:
 *                     type: string
 *                     pattern: '^[A-Z]{2}$'
 *                     description: State abbreviation (2 letters)
 *                     example: "CA"
 *                   zipCode:
 *                     type: string
 *                     pattern: '^\d{5}(-\d{4})?$'
 *                     description: ZIP code (5 digits or 5+4 format)
 *                     example: "54321"
 *                   country:
 *                     type: string
 *                     description: Country code
 *                     example: "US"
 *                     default: "US"
 *                   apartment:
 *                     type: string
 *                     maxLength: 50
 *                     description: Apartment/suite number (optional)
 *                     example: "Suite 100"
 *               mailingAddress:
 *                 type: object
 *                 description: Mailing address if different from business address (optional)
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
 *             businessName: "Acme Corp"
 *             ein: "12-3456789"
 *             entityType: "corporation"
 *             industryType: "Technology"
 *             dateEstablished: "2020-01-01"
 *             businessAddress:
 *               street: "456 Business Blvd"
 *               city: "Business City"
 *               state: "CA"
 *               zipCode: "54321"
 *               country: "US"
 *             businessPhone: "555-987-6543"
 *             businessEmail: "info@acmecorp.com"
 *             description: "Technology consulting services"
 *             isCashIntensive: false
 *             monthlyTransactionVolume: 50000
 *             monthlyTransactionCount: 100
 *             expectedBalance: 25000
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 businessName:
 *                   type: string
 *                 dbaName:
 *                   type: string
 *                   nullable: true
 *                 ein:
 *                   type: string
 *                 entityType:
 *                   type: string
 *                 industryType:
 *                   type: string
 *                 dateEstablished:
 *                   type: string
 *                 businessPhone:
 *                   type: string
 *                 businessEmail:
 *                   type: string
 *                 website:
 *                   type: string
 *                   nullable: true
 *                 description:
 *                   type: string
 *                 isCashIntensive:
 *                   type: boolean
 *                 monthlyTransactionVolume:
 *                   type: number
 *                 monthlyTransactionCount:
 *                   type: integer
 *                 expectedBalance:
 *                   type: number
 *                 businessAddress:
 *                   type: object
 *                 mailingAddress:
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
 *     summary: Get business profile for application
 *     description: Retrieve the business profile information for a specific application. Only accessible by the application owner or admin users.
 *     tags: [Business Profile]
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
 *                 businessName:
 *                   type: string
 *                   example: "Acme Corp"
 *                 dbaName:
 *                   type: string
 *                   nullable: true
 *                   example: "Acme Solutions"
 *                 ein:
 *                   type: string
 *                   example: "12-3456789"
 *                 entityType:
 *                   type: string
 *                   example: "corporation"
 *                 industryType:
 *                   type: string
 *                   example: "Technology"
 *                 dateEstablished:
 *                   type: string
 *                   example: "2020-01-01"
 *                 businessPhone:
 *                   type: string
 *                   example: "555-987-6543"
 *                 businessEmail:
 *                   type: string
 *                   example: "info@acmecorp.com"
 *                 website:
 *                   type: string
 *                   nullable: true
 *                   example: "https://www.acmecorp.com"
 *                 description:
 *                   type: string
 *                   example: "Technology consulting services"
 *                 isCashIntensive:
 *                   type: boolean
 *                   example: false
 *                 monthlyTransactionVolume:
 *                   type: number
 *                   example: 50000
 *                 monthlyTransactionCount:
 *                   type: integer
 *                   example: 100
 *                 expectedBalance:
 *                   type: number
 *                   example: 25000
 *                 businessAddress:
 *                   type: object
 *                   properties:
 *                     street:
 *                       type: string
 *                       example: "456 Business Blvd"
 *                     city:
 *                       type: string
 *                       example: "Business City"
 *                     state:
 *                       type: string
 *                       example: "CA"
 *                     zipCode:
 *                       type: string
 *                       example: "54321"
 *                     country:
 *                       type: string
 *                       example: "US"
 *                     apartment:
 *                       type: string
 *                       nullable: true
 *                       example: "Suite 100"
 *                 mailingAddress:
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
 *     summary: Delete business profile
 *     description: Delete the business profile for an application. Only accessible by the application owner or admin users. This action cannot be undone.
 *     tags: [Business Profile]
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
 *         description: No Content - Business profile deleted successfully
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */