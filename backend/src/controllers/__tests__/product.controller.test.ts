import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import httpStatus from 'http-status';
import express from 'express';
import productRoute from '../../routes/v1/product.route.ts';
import { productService } from '../../services/index.ts';
import { ProductType, EligibilityOperator } from '../../generated/prisma/index.js';

// Mock the product service
vi.mock('../../services/index.ts', () => ({
    productService: {
        createProduct: vi.fn(),
        getAllProducts: vi.fn(),
        queryProducts: vi.fn(),
        getProductById: vi.fn(),
        updateProductById: vi.fn(),
        deleteProductById: vi.fn(),
        checkProductEligibility: vi.fn(),
    }
}));

// Mock auth middleware for admin routes
vi.mock('../../middlewares/auth.ts', () => ({
    default: () => (req: any, res: any, next: any) => {
        req.user = { id: 1, role: 'ADMIN' };
        next();
    }
}));

// Mock validation middleware
vi.mock('../../middlewares/validate.ts', () => ({
    default: () => (req: any, res: any, next: any) => {
        req.validatedQuery = req.query;
        req.validatedBody = req.body;
        next();
    }
}));

const mockProductService = productService as any;

// Create test app
const app = express();
app.use(express.json());
app.use('/v1/products', productRoute);

describe('Product Controller', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockProduct = {
        id: 'prod_test_checking',
        name: 'Test Checking Account',
        type: ProductType.CHECKING,
        description: 'Test checking account',
        features: ['Online Banking', 'Mobile Banking'],
        minimumBalance: 100.0,
        monthlyFee: 10.0,
        interestRate: 0.01,
        isActive: true,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
        eligibilityRules: [
            {
                id: 'rule_1',
                field: 'age',
                operator: EligibilityOperator.GREATER_THAN_OR_EQUAL,
                value: 18,
                description: 'Must be 18 years or older',
                productId: 'prod_test_checking'
            }
        ]
    };

    describe('GET /v1/products', () => {
        it('should return 200 and product list', async () => {
            mockProductService.getAllProducts.mockResolvedValue([mockProduct]);

            const res = await request(app)
                .get('/v1/products')
                .expect(httpStatus.OK);

            expect(res.body).toEqual([mockProduct]);
            expect(mockProductService.getAllProducts).toHaveBeenCalledWith({
                isActive: true
            });
        });

        it('should filter by product type', async () => {
            mockProductService.getAllProducts.mockResolvedValue([mockProduct]);

            await request(app)
                .get('/v1/products')
                .query({ type: 'CHECKING' })
                .expect(httpStatus.OK);

            expect(mockProductService.getAllProducts).toHaveBeenCalledWith({
                type: 'CHECKING',
                isActive: true
            });
        });

        it('should handle isActive filter', async () => {
            mockProductService.getAllProducts.mockResolvedValue([mockProduct]);

            await request(app)
                .get('/v1/products')
                .query({ isActive: 'false' })
                .expect(httpStatus.OK);

            // Public endpoint always overrides isActive to true
            expect(mockProductService.getAllProducts).toHaveBeenCalledWith({
                isActive: true
            });
        });
    });

    describe('GET /v1/products/:productId', () => {
        it('should return 200 and product data', async () => {
            mockProductService.getProductById.mockResolvedValue(mockProduct);

            const res = await request(app)
                .get(`/v1/products/${mockProduct.id}`)
                .expect(httpStatus.OK);

            expect(res.body).toEqual(mockProduct);
            expect(mockProductService.getProductById).toHaveBeenCalledWith(mockProduct.id);
        });

        it('should return 404 when product not found', async () => {
            mockProductService.getProductById.mockResolvedValue(null);

            await request(app)
                .get('/v1/products/nonexistent')
                .expect(httpStatus.NOT_FOUND);
        });

        it('should return 404 when product is inactive (public endpoint)', async () => {
            const inactiveProduct = { ...mockProduct, isActive: false };
            mockProductService.getProductById.mockResolvedValue(inactiveProduct);

            await request(app)
                .get(`/v1/products/${mockProduct.id}`)
                .expect(httpStatus.NOT_FOUND);
        });
    });

    describe('POST /v1/products/:productId/check-eligibility', () => {
        it('should return eligibility results', async () => {
            const eligibilityResult = { eligible: true, reasons: [] };
            mockProductService.checkProductEligibility.mockResolvedValue(eligibilityResult);

            const customerData = { age: 25 };

            const res = await request(app)
                .post(`/v1/products/${mockProduct.id}/check-eligibility`)
                .send({ customerData })
                .expect(httpStatus.OK);

            expect(res.body).toEqual(eligibilityResult);
            expect(mockProductService.checkProductEligibility).toHaveBeenCalledWith(
                mockProduct.id,
                customerData
            );
        });

        it('should return ineligible with reasons', async () => {
            const eligibilityResult = {
                eligible: false,
                reasons: ['Must be 18 years or older']
            };
            mockProductService.checkProductEligibility.mockResolvedValue(eligibilityResult);

            const customerData = { age: 16 };

            const res = await request(app)
                .post(`/v1/products/${mockProduct.id}/check-eligibility`)
                .send({ customerData })
                .expect(httpStatus.OK);

            expect(res.body).toEqual(eligibilityResult);
        });

        it('should return 400 when customerData is missing', async () => {
            await request(app)
                .post(`/v1/products/${mockProduct.id}/check-eligibility`)
                .send({})
                .expect(httpStatus.BAD_REQUEST);
        });
    });

    describe('POST /v1/products/admin - Admin Routes', () => {
        it('should create product and return 201', async () => {
            mockProductService.createProduct.mockResolvedValue(mockProduct);

            const newProduct = {
                name: 'Test Checking Account',
                type: 'CHECKING',
                description: 'Test checking account',
                features: ['Online Banking', 'Mobile Banking'],
                minimumBalance: 100.0,
                monthlyFee: 10.0,
                interestRate: 0.01,
                eligibilityRules: [
                    {
                        field: 'age',
                        operator: 'GREATER_THAN_OR_EQUAL',
                        value: 18,
                        description: 'Must be 18 years or older'
                    }
                ]
            };

            const res = await request(app)
                .post('/v1/products/admin')
                .send(newProduct)
                .expect(httpStatus.CREATED);

            expect(res.body).toEqual(mockProduct);
            expect(mockProductService.createProduct).toHaveBeenCalledWith(newProduct);
        });

        it('should return 400 when required fields are missing', async () => {
            await request(app)
                .post('/v1/products/admin')
                .send({ name: 'Test Product' }) // missing required fields
                .expect(httpStatus.BAD_REQUEST);
        });
    });

    describe('GET /v1/products/admin - Admin Routes', () => {
        it('should return all products with pagination', async () => {
            mockProductService.queryProducts.mockResolvedValue([mockProduct]);

            const res = await request(app)
                .get('/v1/products/admin')
                .expect(httpStatus.OK);

            expect(res.body).toEqual([mockProduct]);
            expect(mockProductService.queryProducts).toHaveBeenCalledWith({}, {});
        });

        it('should handle filtering and pagination options', async () => {
            mockProductService.queryProducts.mockResolvedValue([mockProduct]);

            await request(app)
                .get('/v1/products/admin')
                .query({
                    type: 'CHECKING',
                    isActive: 'true',
                    page: '2',
                    limit: '5'
                })
                .expect(httpStatus.OK);

            expect(mockProductService.queryProducts).toHaveBeenCalledWith(
                { type: 'CHECKING', isActive: true },
                { page: 2, limit: 5 }
            );
        });
    });

    describe('GET /v1/products/admin/:productId - Admin Routes', () => {
        it('should return product data including inactive products', async () => {
            const inactiveProduct = { ...mockProduct, isActive: false };
            mockProductService.getProductById.mockResolvedValue(inactiveProduct);

            const res = await request(app)
                .get(`/v1/products/admin/${mockProduct.id}`)
                .expect(httpStatus.OK);

            expect(res.body).toEqual(inactiveProduct);
            expect(mockProductService.getProductById).toHaveBeenCalledWith(mockProduct.id);
        });

        it('should return 404 when product not found', async () => {
            mockProductService.getProductById.mockResolvedValue(null);

            await request(app)
                .get('/v1/products/admin/nonexistent')
                .expect(httpStatus.NOT_FOUND);
        });
    });

    describe('PATCH /v1/products/admin/:productId - Admin Routes', () => {
        it('should update product and return updated data', async () => {
            const updatedProduct = { ...mockProduct, name: 'Updated Checking Account' };
            mockProductService.updateProductById.mockResolvedValue(updatedProduct);

            const updateData = { name: 'Updated Checking Account' };

            const res = await request(app)
                .patch(`/v1/products/admin/${mockProduct.id}`)
                .send(updateData)
                .expect(httpStatus.OK);

            expect(res.body).toEqual(updatedProduct);
            expect(mockProductService.updateProductById).toHaveBeenCalledWith(
                mockProduct.id,
                updateData
            );
        });

        it('should return 400 when no update data provided', async () => {
            await request(app)
                .patch(`/v1/products/admin/${mockProduct.id}`)
                .send({})
                .expect(httpStatus.BAD_REQUEST);
        });
    });

    describe('DELETE /v1/products/admin/:productId - Admin Routes', () => {
        it('should delete product and return 204', async () => {
            mockProductService.deleteProductById.mockResolvedValue(mockProduct);

            await request(app)
                .delete(`/v1/products/admin/${mockProduct.id}`)
                .expect(httpStatus.NO_CONTENT);

            expect(mockProductService.deleteProductById).toHaveBeenCalledWith(mockProduct.id);
        });
    });
});