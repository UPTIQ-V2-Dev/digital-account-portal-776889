import { financialProfileController } from '../../controllers/index.ts';
import auth from '../../middlewares/auth.ts';
import validate from '../../middlewares/validate.ts';
import { financialProfileValidation } from '../../validations/index.ts';
import express from 'express';

const router = express.Router({ mergeParams: true }); // mergeParams to access applicationId from parent router

// Financial profile routes
router
    .route('/')
    .put(
        auth('manageApplications'), 
        validate(financialProfileValidation.createOrUpdateFinancialProfile), 
        financialProfileController.createOrUpdateFinancialProfile
    )
    .get(
        auth('getApplications'), 
        validate(financialProfileValidation.getFinancialProfile), 
        financialProfileController.getFinancialProfile
    )
    .delete(
        auth('manageApplications'), 
        validate(financialProfileValidation.deleteFinancialProfile), 
        financialProfileController.deleteFinancialProfile
    );

export default router;

/**
 * @swagger
 * tags:
 *   name: Financial Profile
 *   description: Financial profile management for account opening applications
 */

/**
 * @swagger
 * /account-opening/applications/{applicationId}/financial-profile:
 *   put:
 *     summary: Save or update financial profile
 *     description: Create or update financial profile for an application including income, assets, liabilities, banking relationships, and account activities.
 *     tags: [Financial Profile]
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
 *                 maximum: 10000000
 *                 description: Annual income in dollars
 *                 example: 75000
 *               incomeSource:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [employment, self-employment, business, investment, retirement, disability, social_security, other]
 *                 minItems: 1
 *                 uniqueItems: true
 *                 description: Sources of income
 *                 example: ["employment"]
 *               employmentInfo:
 *                 type: object
 *                 nullable: true
 *                 description: Additional employment information (optional JSON object)
 *                 example: {"employer": "Tech Corp", "position": "Software Engineer", "startDate": "2020-01-01"}
 *               assets:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100000000
 *                 description: Total assets in dollars
 *                 example: 50000
 *               liabilities:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100000000
 *                 description: Total liabilities in dollars
 *                 example: 15000
 *               bankingRelationships:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 10
 *                 items:
 *                   type: object
 *                   required:
 *                     - bankName
 *                     - accountTypes
 *                     - yearsWithBank
 *                   properties:
 *                     bankName:
 *                       type: string
 *                       minLength: 1
 *                       maxLength: 255
 *                       description: Name of the bank
 *                       example: "First National Bank"
 *                     accountTypes:
 *                       type: array
 *                       minItems: 1
 *                       items:
 *                         type: string
 *                         enum: [checking, savings, money_market, certificate_deposit, credit_card, loan, mortgage, investment, retirement, other]
 *                       description: Types of accounts held at this bank
 *                       example: ["checking", "savings"]
 *                     yearsWithBank:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 100
 *                       description: Number of years as customer
 *                       example: 5
 *                 description: Banking relationships
 *               accountActivities:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 20
 *                 items:
 *                   type: object
 *                   required:
 *                     - activity
 *                     - frequency
 *                     - amount
 *                   properties:
 *                     activity:
 *                       type: string
 *                       minLength: 1
 *                       maxLength: 255
 *                       description: Description of account activity
 *                       example: "Direct Deposit"
 *                     frequency:
 *                       type: string
 *                       enum: [daily, weekly, monthly, quarterly, annually, as_needed]
 *                       description: Frequency of the activity
 *                       example: "monthly"
 *                     amount:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 10000000
 *                       description: Typical amount for this activity
 *                       example: 6250
 *                 description: Expected account activities
 *             example:
 *               annualIncome: 75000
 *               incomeSource: ["employment"]
 *               assets: 50000
 *               liabilities: 15000
 *               bankingRelationships:
 *                 - bankName: "First National Bank"
 *                   accountTypes: ["checking", "savings"]
 *                   yearsWithBank: 5
 *               accountActivities:
 *                 - activity: "Direct Deposit"
 *                   frequency: "monthly"
 *                   amount: 6250
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 annualIncome:
 *                   type: number
 *                 incomeSource:
 *                   type: array
 *                   items:
 *                     type: string
 *                 employmentInfo:
 *                   type: object
 *                   nullable: true
 *                 assets:
 *                   type: number
 *                 liabilities:
 *                   type: number
 *                 bankingRelationships:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       bankName:
 *                         type: string
 *                       accountTypes:
 *                         type: array
 *                         items:
 *                           type: string
 *                       yearsWithBank:
 *                         type: integer
 *                 accountActivities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       activity:
 *                         type: string
 *                       frequency:
 *                         type: string
 *                       amount:
 *                         type: number
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   get:
 *     summary: Get financial profile
 *     description: Get financial profile for an application.
 *     tags: [Financial Profile]
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
 *                 annualIncome:
 *                   type: number
 *                   example: 75000
 *                 incomeSource:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["employment"]
 *                 employmentInfo:
 *                   type: object
 *                   nullable: true
 *                   example: {"employer": "Tech Corp", "position": "Software Engineer"}
 *                 assets:
 *                   type: number
 *                   example: 50000
 *                 liabilities:
 *                   type: number
 *                   example: 15000
 *                 bankingRelationships:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       bankName:
 *                         type: string
 *                       accountTypes:
 *                         type: array
 *                         items:
 *                           type: string
 *                       yearsWithBank:
 *                         type: integer
 *                   example:
 *                     - bankName: "First National Bank"
 *                       accountTypes: ["checking", "savings"]
 *                       yearsWithBank: 5
 *                 accountActivities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       activity:
 *                         type: string
 *                       frequency:
 *                         type: string
 *                       amount:
 *                         type: number
 *                   example:
 *                     - activity: "Direct Deposit"
 *                       frequency: "monthly"
 *                       amount: 6250
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete financial profile
 *     description: Delete financial profile for an application.
 *     tags: [Financial Profile]
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
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */