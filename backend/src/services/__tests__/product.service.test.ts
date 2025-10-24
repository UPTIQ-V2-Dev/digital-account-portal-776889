import { describe, it, expect, beforeEach, vi } from 'vitest';
import productService from '../product.service.ts';
import prisma from '../../client.ts';
import { ProductType, EligibilityOperator } from '../../generated/prisma/index.js';
import ApiError from '../../utils/ApiError.ts';

// Mock Prisma client
vi.mock('../../client.ts', () => ({
    default: {
        product: {
            create: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        productSelection: {
            findFirst: vi.fn(),
        },
    },
}));

const mockPrisma = prisma as any;

describe('Product Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockProduct = {
        id: 'prod_test_checking',
        name: 'Test Checking Account',
        type: ProductType.CHECKING,
        description: 'Test checking account for unit tests',
        features: ['Online Banking', 'Mobile Banking'],
        minimumBalance: 100.0,
        monthlyFee: 10.0,
        interestRate: 0.01,
        isActive: true,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
        eligibilityRules: [
            {
                id: 'rule_test_1',
                field: 'age',
                operator: EligibilityOperator.GREATER_THAN_OR_EQUAL,
                value: 18,
                description: 'Must be 18 years or older',
                productId: 'prod_test_checking'
            }
        ]
    };

    describe('createProduct', () => {
        it('should create a product with eligibility rules', async () => {
            const productData = {
                name: 'Test Checking Account',
                type: ProductType.CHECKING,
                description: 'Test checking account for unit tests',
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

            mockPrisma.product.create.mockResolvedValue(mockProduct);

            const result = await productService.createProduct(productData);

            expect(mockPrisma.product.create).toHaveBeenCalledWith({
                data: {
                    name: productData.name,
                    type: productData.type,
                    description: productData.description,
                    features: productData.features,
                    minimumBalance: productData.minimumBalance,
                    monthlyFee: productData.monthlyFee,
                    interestRate: productData.interestRate,
                    eligibilityRules: {
                        create: [
                            {
                                field: 'age',
                                operator: 'GREATER_THAN_OR_EQUAL',
                                value: 18,
                                description: 'Must be 18 years or older'
                            }
                        ]
                    }
                },
                include: {
                    eligibilityRules: true
                }
            });
            expect(result).toEqual(mockProduct);
        });

        it('should create a product without eligibility rules', async () => {
            const productData = {
                name: 'Test Savings Account',
                type: ProductType.SAVINGS,
                description: 'Test savings account',
                features: ['Online Banking'],
                minimumBalance: 25.0,
                monthlyFee: 0.0
            };

            const mockProductWithoutRules = { ...mockProduct, eligibilityRules: [] };
            mockPrisma.product.create.mockResolvedValue(mockProductWithoutRules);

            const result = await productService.createProduct(productData);

            expect(mockPrisma.product.create).toHaveBeenCalledWith({
                data: productData,
                include: {
                    eligibilityRules: true
                }
            });
            expect(result).toEqual(mockProductWithoutRules);
        });
    });

    describe('getAllProducts', () => {
        it('should return all active products by default', async () => {
            mockPrisma.product.findMany.mockResolvedValue([mockProduct]);

            const result = await productService.getAllProducts({});

            expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
                where: {},
                include: {
                    eligibilityRules: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            expect(result).toEqual([mockProduct]);
        });

        it('should filter products by type', async () => {
            const filter = { type: ProductType.CHECKING };
            mockPrisma.product.findMany.mockResolvedValue([mockProduct]);

            const result = await productService.getAllProducts(filter);

            expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
                where: filter,
                include: {
                    eligibilityRules: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            expect(result).toEqual([mockProduct]);
        });

        it('should filter products by active status', async () => {
            const filter = { isActive: true };
            mockPrisma.product.findMany.mockResolvedValue([mockProduct]);

            const result = await productService.getAllProducts(filter);

            expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
                where: filter,
                include: {
                    eligibilityRules: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            expect(result).toEqual([mockProduct]);
        });
    });

    describe('queryProducts', () => {
        it('should return paginated products with default options', async () => {
            mockPrisma.product.findMany.mockResolvedValue([mockProduct]);

            const result = await productService.queryProducts({}, {});

            expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
                where: {},
                include: {
                    eligibilityRules: true
                },
                skip: 0, // (page - 1) * limit = (1 - 1) * 10 = 0
                take: 10, // default limit
                orderBy: { createdAt: 'desc' } // default sort
            });
            expect(result).toEqual([mockProduct]);
        });

        it('should use custom pagination and sort options', async () => {
            const options = {
                page: 2,
                limit: 5,
                sortBy: 'name',
                sortType: 'asc' as const
            };
            mockPrisma.product.findMany.mockResolvedValue([mockProduct]);

            const result = await productService.queryProducts({}, options);

            expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
                where: {},
                include: {
                    eligibilityRules: true
                },
                skip: 5, // (page - 1) * limit = (2 - 1) * 5 = 5
                take: 5,
                orderBy: { name: 'asc' }
            });
            expect(result).toEqual([mockProduct]);
        });
    });

    describe('getProductById', () => {
        it('should return product with eligibility rules when found', async () => {
            mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

            const result = await productService.getProductById('prod_test_checking');

            expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
                where: { id: 'prod_test_checking' },
                include: {
                    eligibilityRules: true
                }
            });
            expect(result).toEqual(mockProduct);
        });

        it('should return null when product not found', async () => {
            mockPrisma.product.findUnique.mockResolvedValue(null);

            const result = await productService.getProductById('nonexistent');

            expect(result).toBeNull();
        });
    });

    describe('updateProductById', () => {
        it('should update product when it exists', async () => {
            const updateData = {
                name: 'Updated Checking Account',
                monthlyFee: 15.0
            };
            
            mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
            mockPrisma.product.update.mockResolvedValue({ ...mockProduct, ...updateData });

            const result = await productService.updateProductById('prod_test_checking', updateData);

            expect(mockPrisma.product.update).toHaveBeenCalledWith({
                where: { id: 'prod_test_checking' },
                data: updateData,
                include: {
                    eligibilityRules: true
                }
            });
            expect(result).toEqual({ ...mockProduct, ...updateData });
        });

        it('should throw ApiError when product not found', async () => {
            mockPrisma.product.findUnique.mockResolvedValue(null);

            await expect(productService.updateProductById('nonexistent', {}))
                .rejects.toThrow(ApiError);
        });
    });

    describe('deleteProductById', () => {
        it('should delete product when it exists and has no selections', async () => {
            mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
            mockPrisma.productSelection.findFirst.mockResolvedValue(null);
            mockPrisma.product.delete.mockResolvedValue(mockProduct);

            const result = await productService.deleteProductById('prod_test_checking');

            expect(mockPrisma.product.delete).toHaveBeenCalledWith({
                where: { id: 'prod_test_checking' }
            });
            expect(result).toEqual(mockProduct);
        });

        it('should throw ApiError when product not found', async () => {
            mockPrisma.product.findUnique.mockResolvedValue(null);

            await expect(productService.deleteProductById('nonexistent'))
                .rejects.toThrow(ApiError);
        });

        it('should throw ApiError when product has selections', async () => {
            const mockSelection = { id: 'sel_123', productId: 'prod_test_checking' };
            mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
            mockPrisma.productSelection.findFirst.mockResolvedValue(mockSelection);

            await expect(productService.deleteProductById('prod_test_checking'))
                .rejects.toThrow('Cannot delete product that is used in applications');
        });
    });

    describe('checkProductEligibility', () => {
        it('should return eligible when all rules pass', async () => {
            mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

            const customerData = { age: 25 };
            const result = await productService.checkProductEligibility('prod_test_checking', customerData);

            expect(result).toEqual({
                eligible: true,
                reasons: []
            });
        });

        it('should return ineligible with reasons when rules fail', async () => {
            mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

            const customerData = { age: 16 };
            const result = await productService.checkProductEligibility('prod_test_checking', customerData);

            expect(result).toEqual({
                eligible: false,
                reasons: ['Must be 18 years or older']
            });
        });

        it('should handle different operators correctly', async () => {
            const mockProductWithRules = {
                ...mockProduct,
                eligibilityRules: [
                    {
                        id: 'rule_1',
                        field: 'age',
                        operator: EligibilityOperator.GREATER_THAN_OR_EQUAL,
                        value: 18,
                        description: 'Must be 18 years or older',
                        productId: 'prod_test'
                    },
                    {
                        id: 'rule_2',
                        field: 'annualIncome',
                        operator: EligibilityOperator.LESS_THAN_OR_EQUAL,
                        value: 100000,
                        description: 'Income must be under $100,000',
                        productId: 'prod_test'
                    },
                    {
                        id: 'rule_3',
                        field: 'employmentStatus',
                        operator: EligibilityOperator.IN,
                        value: ['employed', 'self_employed'],
                        description: 'Must be employed',
                        productId: 'prod_test'
                    }
                ]
            };

            mockPrisma.product.findUnique.mockResolvedValue(mockProductWithRules);

            const customerData = {
                age: 25,
                annualIncome: 50000,
                employmentStatus: 'employed'
            };

            const result = await productService.checkProductEligibility('prod_test', customerData);

            expect(result).toEqual({
                eligible: true,
                reasons: []
            });
        });

        it('should throw ApiError when product not found', async () => {
            mockPrisma.product.findUnique.mockResolvedValue(null);

            await expect(productService.checkProductEligibility('nonexistent', {}))
                .rejects.toThrow(ApiError);
        });

        it('should handle nested field paths', async () => {
            const mockProductWithNestedRule = {
                ...mockProduct,
                eligibilityRules: [
                    {
                        id: 'rule_1',
                        field: 'profile.creditScore',
                        operator: EligibilityOperator.GREATER_THAN_OR_EQUAL,
                        value: 650,
                        description: 'Credit score must be at least 650',
                        productId: 'prod_test'
                    }
                ]
            };

            mockPrisma.product.findUnique.mockResolvedValue(mockProductWithNestedRule);

            const customerData = {
                profile: {
                    creditScore: 700
                }
            };

            const result = await productService.checkProductEligibility('prod_test', customerData);

            expect(result).toEqual({
                eligible: true,
                reasons: []
            });
        });
    });
});