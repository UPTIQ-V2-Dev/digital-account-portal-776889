import { productController } from '../../controllers/index.ts';
import auth from '../../middlewares/auth.ts';
import validate from '../../middlewares/validate.ts';
import { productValidation } from '../../validations/index.ts';
import express from 'express';

const router = express.Router();

// Public routes - no authentication required
router
    .route('/')
    .get(validate(productValidation.getProducts), productController.getProducts);

router
    .route('/:productId')
    .get(validate(productValidation.getProduct), productController.getProduct);

router
    .route('/:productId/check-eligibility')
    .post(validate(productValidation.checkEligibility), productController.checkEligibility);

// Admin routes - authentication required
router
    .route('/admin')
    .post(auth('manageProducts'), validate(productValidation.createProduct), productController.createProduct)
    .get(auth('getProducts'), validate(productValidation.getProducts), productController.getAllProductsAdmin);

router
    .route('/admin/:productId')
    .get(auth('getProducts'), validate(productValidation.getProduct), productController.getProductById)
    .patch(auth('manageProducts'), validate(productValidation.updateProduct), productController.updateProduct)
    .delete(auth('manageProducts'), validate(productValidation.deleteProduct), productController.deleteProduct);

export default router;

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Banking product management and retrieval
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all available banking products
 *     description: Retrieve all active banking products with eligibility rules. No authentication required.
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [CHECKING, SAVINGS, MONEY_MARKET, CERTIFICATE_DEPOSIT, CREDIT_CARD, LOAN, MORTGAGE, INVESTMENT, RETIREMENT]
 *         description: Product type filter
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status (defaults to true for public endpoint)
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by product name (partial match)
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       "500":
 *         $ref: '#/components/responses/InternalError'
 */

/**
 * @swagger
 * /products/{productId}:
 *   get:
 *     summary: Get specific product details
 *     description: Get detailed information about a specific banking product including eligibility rules. No authentication required.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalError'
 */

/**
 * @swagger
 * /products/{productId}/check-eligibility:
 *   post:
 *     summary: Check customer eligibility for a product
 *     description: Check if customer data meets the eligibility requirements for a specific product. No authentication required.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerData
 *             properties:
 *               customerData:
 *                 type: object
 *                 description: Customer data to check against eligibility rules
 *                 example:
 *                   age: 25
 *                   annualIncome: 50000
 *                   creditScore: 750
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 eligible:
 *                   type: boolean
 *                   description: Whether customer is eligible
 *                 reasons:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Reasons for ineligibility (if any)
 *               example:
 *                 eligible: true
 *                 reasons: []
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalError'
 */

/**
 * @swagger
 * /products/admin:
 *   post:
 *     summary: Create a new banking product
 *     description: Create a new banking product with eligibility rules. Admin access required.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - description
 *               - features
 *               - minimumBalance
 *               - monthlyFee
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [CHECKING, SAVINGS, MONEY_MARKET, CERTIFICATE_DEPOSIT, CREDIT_CARD, LOAN, MORTGAGE, INVESTMENT, RETIREMENT]
 *               description:
 *                 type: string
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               minimumBalance:
 *                 type: number
 *                 minimum: 0
 *               monthlyFee:
 *                 type: number
 *                 minimum: 0
 *               interestRate:
 *                 type: number
 *                 minimum: 0
 *               isActive:
 *                 type: boolean
 *               eligibilityRules:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     field:
 *                       type: string
 *                     operator:
 *                       type: string
 *                       enum: [GREATER_THAN_OR_EQUAL, LESS_THAN_OR_EQUAL, EQUAL, NOT_EQUAL, IN, NOT_IN]
 *                     value:
 *                       oneOf:
 *                         - type: string
 *                         - type: number
 *                         - type: boolean
 *                         - type: array
 *                     description:
 *                       type: string
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all products (admin view)
 *     description: Get all products with pagination and filtering. Admin access required.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [CHECKING, SAVINGS, MONEY_MARKET, CERTIFICATE_DEPOSIT, CREDIT_CARD, LOAN, MORTGAGE, INVESTMENT, RETIREMENT]
 *         description: Product type filter
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by product name (partial match)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort field
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
 *                 $ref: '#/components/schemas/Product'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /products/admin/{productId}:
 *   get:
 *     summary: Get product details (admin view)
 *     description: Get detailed product information including inactive products. Admin access required.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a product
 *     description: Update an existing banking product. Admin access required.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [CHECKING, SAVINGS, MONEY_MARKET, CERTIFICATE_DEPOSIT, CREDIT_CARD, LOAN, MORTGAGE, INVESTMENT, RETIREMENT]
 *               description:
 *                 type: string
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               minimumBalance:
 *                 type: number
 *                 minimum: 0
 *               monthlyFee:
 *                 type: number
 *                 minimum: 0
 *               interestRate:
 *                 type: number
 *                 minimum: 0
 *               isActive:
 *                 type: boolean
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a product
 *     description: Delete a banking product. Cannot delete products that are used in applications. Admin access required.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       "204":
 *         description: No Content
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
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
 *           description: Product ID
 *         name:
 *           type: string
 *           description: Product name
 *         type:
 *           type: string
 *           enum: [CHECKING, SAVINGS, MONEY_MARKET, CERTIFICATE_DEPOSIT, CREDIT_CARD, LOAN, MORTGAGE, INVESTMENT, RETIREMENT]
 *           description: Product type
 *         description:
 *           type: string
 *           description: Product description
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           description: Product features
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
 *           description: Whether product is available
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *         eligibilityRules:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EligibilityRule'
 *           description: Product eligibility rules
 *       example:
 *         id: prod_simple_checking
 *         name: Simple Checking
 *         type: CHECKING
 *         description: Perfect for everyday banking needs
 *         features: [Online Banking, Mobile Banking, Bill Pay, Debit Card]
 *         minimumBalance: 100
 *         monthlyFee: 10
 *         interestRate: 0.01
 *         isActive: true
 *         createdAt: 2024-01-15T09:00:00Z
 *         updatedAt: 2024-01-15T09:00:00Z
 *         eligibilityRules: []
 *
 *     EligibilityRule:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Rule ID
 *         field:
 *           type: string
 *           description: Field to evaluate (e.g., 'age', 'annualIncome')
 *         operator:
 *           type: string
 *           enum: [GREATER_THAN_OR_EQUAL, LESS_THAN_OR_EQUAL, EQUAL, NOT_EQUAL, IN, NOT_IN]
 *           description: Comparison operator
 *         value:
 *           oneOf:
 *             - type: string
 *             - type: number
 *             - type: boolean
 *             - type: array
 *           description: Value to compare against
 *         description:
 *           type: string
 *           description: Human-readable description of the rule
 *       example:
 *         id: rule_123
 *         field: age
 *         operator: GREATER_THAN_OR_EQUAL
 *         value: 18
 *         description: Must be 18 years or older
 */