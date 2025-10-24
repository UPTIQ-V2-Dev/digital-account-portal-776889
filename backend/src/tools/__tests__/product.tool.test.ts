import { describe, it, expect, beforeEach, vi } from 'vitest';
import productTools from '../product.tool.ts';
import { productService } from '../../services/index.ts';
import { ProductType, EligibilityOperator } from '../../generated/prisma/index.js';

// Mock the product service
vi.mock('../../services/product.service.ts', () => ({
    default: {
        getAllProducts: vi.fn(),
        getProductById: vi.fn(),
        checkProductEligibility: vi.fn(),
        createProduct: vi.fn(),
        updateProductById: vi.fn(),
        deleteProductById: vi.fn(),
        queryProducts: vi.fn(),
    }
}));

const mockProductService = productService as any;

describe('Product Tools', () => {
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
        createdAt: new Date('2023-01-01T00:00:00Z').toISOString(),
        updatedAt: new Date('2023-01-01T00:00:00Z').toISOString(),
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

    describe('product_list tool', () => {
        const listProductsTool = productTools.find(tool => tool.id === 'product_list')!;

        it('should list all products', async () => {
            mockProductService.getAllProducts.mockResolvedValue([mockProduct]);

            const result = await listProductsTool.fn({});

            expect(mockProductService.getAllProducts).toHaveBeenCalledWith({});
            expect(result).toEqual({ products: [mockProduct] });
        });

        it('should filter products by type', async () => {
            mockProductService.getAllProducts.mockResolvedValue([mockProduct]);

            const result = await listProductsTool.fn({ type: ProductType.CHECKING });

            expect(mockProductService.getAllProducts).toHaveBeenCalledWith({
                type: ProductType.CHECKING
            });
            expect(result).toEqual({ products: [mockProduct] });
        });

        it('should filter products by active status', async () => {
            mockProductService.getAllProducts.mockResolvedValue([mockProduct]);

            const result = await listProductsTool.fn({ isActive: true });

            expect(mockProductService.getAllProducts).toHaveBeenCalledWith({
                isActive: true
            });
            expect(result).toEqual({ products: [mockProduct] });
        });

        it('should validate input schema', () => {
            const validInput = { type: ProductType.CHECKING, isActive: true };
            expect(() => listProductsTool.inputSchema.parse(validInput)).not.toThrow();

            const invalidInput = { type: 'INVALID_TYPE' };
            expect(() => listProductsTool.inputSchema.parse(invalidInput)).toThrow();
        });

        it('should validate output schema', () => {
            const validOutput = { products: [mockProduct] };
            expect(() => listProductsTool.outputSchema?.parse(validOutput)).not.toThrow();
        });
    });

    describe('product_get tool', () => {
        const getProductTool = productTools.find(tool => tool.id === 'product_get')!;

        it('should get product by id', async () => {
            mockProductService.getProductById.mockResolvedValue(mockProduct);

            const result = await getProductTool.fn({ productId: 'prod_test_checking' });

            expect(mockProductService.getProductById).toHaveBeenCalledWith('prod_test_checking');
            expect(result).toEqual(mockProduct);
        });

        it('should return null for non-existent product', async () => {
            mockProductService.getProductById.mockResolvedValue(null);

            const result = await getProductTool.fn({ productId: 'nonexistent' });

            expect(result).toBeNull();
        });

        it('should validate input schema', () => {
            const validInput = { productId: 'prod_123' };
            expect(() => getProductTool.inputSchema.parse(validInput)).not.toThrow();

            const invalidInput = {};
            expect(() => getProductTool.inputSchema.parse(invalidInput)).toThrow();
        });

        it('should handle tools without output schema', () => {
            // getProductTool can return null, so it omits outputSchema to avoid type mismatch
            expect(getProductTool.outputSchema).toBeUndefined();
        });
    });

    describe('product_check_eligibility tool', () => {
        const checkEligibilityTool = productTools.find(tool => tool.id === 'product_check_eligibility')!;

        it('should check product eligibility', async () => {
            const eligibilityResult = { eligible: true, reasons: [] };
            mockProductService.checkProductEligibility.mockResolvedValue(eligibilityResult);

            const customerData = { age: 25, annualIncome: 50000 };
            const result = await checkEligibilityTool.fn({
                productId: 'prod_test_checking',
                customerData
            });

            expect(mockProductService.checkProductEligibility).toHaveBeenCalledWith(
                'prod_test_checking',
                customerData
            );
            expect(result).toEqual(eligibilityResult);
        });

        it('should return ineligible with reasons', async () => {
            const eligibilityResult = {
                eligible: false,
                reasons: ['Must be 18 years or older']
            };
            mockProductService.checkProductEligibility.mockResolvedValue(eligibilityResult);

            const customerData = { age: 16 };
            const result = await checkEligibilityTool.fn({
                productId: 'prod_test_checking',
                customerData
            });

            expect(result).toEqual(eligibilityResult);
        });

        it('should validate input schema', () => {
            const validInput = {
                productId: 'prod_123',
                customerData: { age: 25, income: 50000 }
            };
            expect(() => checkEligibilityTool.inputSchema.parse(validInput)).not.toThrow();

            const invalidInput = { productId: 'prod_123' }; // missing customerData
            expect(() => checkEligibilityTool.inputSchema.parse(invalidInput)).toThrow();
        });

        it('should validate output schema', () => {
            const validOutput = { eligible: true, reasons: [] };
            expect(() => checkEligibilityTool.outputSchema?.parse(validOutput)).not.toThrow();

            const invalidOutput = {
                eligible: 'yes', // should be boolean
                reasons: 'none' // should be array
            };
            expect(() => checkEligibilityTool.outputSchema?.parse(invalidOutput)).toThrow();
        });
    });

    describe('product_create tool', () => {
        const createProductTool = productTools.find(tool => tool.id === 'product_create')!;

        it('should create product', async () => {
            mockProductService.createProduct.mockResolvedValue(mockProduct);

            const productData = {
                name: 'Test Checking Account',
                type: ProductType.CHECKING,
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

            const result = await createProductTool.fn(productData);

            expect(mockProductService.createProduct).toHaveBeenCalledWith(productData);
            expect(result).toEqual(mockProduct);
        });

        it('should validate input schema', () => {
            const validInput = {
                name: 'Test Product',
                type: ProductType.CHECKING,
                description: 'Test description',
                features: ['Feature 1'],
                minimumBalance: 100,
                monthlyFee: 10
            };
            expect(() => createProductTool.inputSchema.parse(validInput)).not.toThrow();

            const invalidInput = {
                name: 'Test Product',
                // missing required fields
            };
            expect(() => createProductTool.inputSchema.parse(invalidInput)).toThrow();
        });
    });

    describe('product_update tool', () => {
        const updateProductTool = productTools.find(tool => tool.id === 'product_update')!;

        it('should update product', async () => {
            const updatedProduct = { ...mockProduct, name: 'Updated Product' };
            mockProductService.updateProductById.mockResolvedValue(updatedProduct);

            const updateData = {
                productId: 'prod_test_checking',
                name: 'Updated Product'
            };

            const result = await updateProductTool.fn(updateData);

            expect(mockProductService.updateProductById).toHaveBeenCalledWith(
                'prod_test_checking',
                { name: 'Updated Product' }
            );
            expect(result).toEqual(updatedProduct);
        });

        it('should validate input schema', () => {
            const validInput = {
                productId: 'prod_123',
                name: 'Updated Name'
            };
            expect(() => updateProductTool.inputSchema.parse(validInput)).not.toThrow();

            const invalidInput = { name: 'Updated Name' }; // missing productId
            expect(() => updateProductTool.inputSchema.parse(invalidInput)).toThrow();
        });
    });

    describe('product_delete tool', () => {
        const deleteProductTool = productTools.find(tool => tool.id === 'product_delete')!;

        it('should delete product', async () => {
            mockProductService.deleteProductById.mockResolvedValue(mockProduct);

            const result = await deleteProductTool.fn({ productId: 'prod_test_checking' });

            expect(mockProductService.deleteProductById).toHaveBeenCalledWith('prod_test_checking');
            expect(result).toEqual({
                success: true,
                message: 'Product prod_test_checking deleted successfully'
            });
        });

        it('should validate output schema', () => {
            const validOutput = {
                success: true,
                message: 'Product deleted successfully'
            };
            expect(() => deleteProductTool.outputSchema?.parse(validOutput)).not.toThrow();
        });
    });

    describe('product_search tool', () => {
        const searchProductsTool = productTools.find(tool => tool.id === 'product_search')!;

        it('should search products with filters', async () => {
            mockProductService.queryProducts.mockResolvedValue([mockProduct]);

            const searchParams = {
                type: ProductType.CHECKING,
                isActive: true,
                name: 'checking',
                page: 1,
                limit: 10,
                sortBy: 'name',
                sortType: 'asc' as const
            };

            const result = await searchProductsTool.fn(searchParams);

            expect(mockProductService.queryProducts).toHaveBeenCalledWith(
                {
                    type: ProductType.CHECKING,
                    isActive: true,
                    name: { contains: 'checking', mode: 'insensitive' }
                },
                {
                    page: 1,
                    limit: 10,
                    sortBy: 'name',
                    sortType: 'asc'
                }
            );
            expect(result).toEqual({ products: [mockProduct] });
        });

        it('should validate input schema', () => {
            const validInput = {
                type: ProductType.CHECKING,
                page: 1,
                limit: 10,
                sortType: 'asc'
            };
            expect(() => searchProductsTool.inputSchema.parse(validInput)).not.toThrow();

            const invalidInput = {
                page: 0, // invalid page number
                limit: 101 // exceeds max limit
            };
            expect(() => searchProductsTool.inputSchema.parse(invalidInput)).toThrow();
        });

        it('should validate output schema', () => {
            const validOutput = { products: [mockProduct] };
            expect(() => searchProductsTool.outputSchema?.parse(validOutput)).not.toThrow();
        });
    });

    describe('product_types_list tool', () => {
        const getTypesTool = productTools.find(tool => tool.id === 'product_types_list')!;

        it('should return all product types', async () => {
            const result = await getTypesTool.fn({});

            expect(result).toEqual({ types: Object.values(ProductType) });
            expect(result.types).toContain(ProductType.CHECKING);
            expect(result.types).toContain(ProductType.SAVINGS);
            expect(result.types).toContain(ProductType.CREDIT_CARD);
        });

        it('should validate output schema', () => {
            const validOutput = { types: Object.values(ProductType) };
            expect(() => getTypesTool.outputSchema?.parse(validOutput)).not.toThrow();
        });
    });

    describe('eligibility_operators_list tool', () => {
        const getOperatorsTool = productTools.find(tool => tool.id === 'eligibility_operators_list')!;

        it('should return all eligibility operators', async () => {
            const result = await getOperatorsTool.fn({});

            expect(result).toHaveProperty('operators');
            expect(Array.isArray(result.operators)).toBe(true);
            expect(result.operators).toHaveLength(6);
            
            const operatorValues = result.operators.map((item: any) => item.operator);
            expect(operatorValues).toContain('GREATER_THAN_OR_EQUAL');
            expect(operatorValues).toContain('LESS_THAN_OR_EQUAL');
            expect(operatorValues).toContain('EQUAL');
            expect(operatorValues).toContain('NOT_EQUAL');
            expect(operatorValues).toContain('IN');
            expect(operatorValues).toContain('NOT_IN');

            // Check that each item has both operator and description
            result.operators.forEach((item: any) => {
                expect(item).toHaveProperty('operator');
                expect(item).toHaveProperty('description');
                expect(typeof item.operator).toBe('string');
                expect(typeof item.description).toBe('string');
            });
        });

        it('should validate output schema', () => {
            const validOutput = {
                operators: [
                    { operator: 'EQUAL', description: 'Equal to (==)' }
                ]
            };
            expect(() => getOperatorsTool.outputSchema?.parse(validOutput)).not.toThrow();
        });
    });

    describe('Schema Validation', () => {
        it('should validate product schema', () => {
            const validProduct = {
                id: 'prod_123',
                name: 'Test Product',
                type: ProductType.CHECKING,
                description: 'Test description',
                features: ['Feature 1', 'Feature 2'],
                minimumBalance: 100.0,
                monthlyFee: 10.0,
                interestRate: 0.01,
                isActive: true,
                createdAt: '2023-01-01T00:00:00Z',
                updatedAt: '2023-01-01T00:00:00Z',
                eligibilityRules: [
                    {
                        id: 'rule_1',
                        field: 'age',
                        operator: EligibilityOperator.GREATER_THAN_OR_EQUAL,
                        value: 18,
                        description: 'Must be 18 years or older',
                        productId: 'prod_123'
                    }
                ]
            };

            const listTool = productTools.find(tool => tool.id === 'product_list')!;
            expect(() => listTool.outputSchema?.parse({ products: [validProduct] })).not.toThrow();
        });
    });
});