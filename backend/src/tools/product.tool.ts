import { productService } from '../services/index.ts';
import { MCPTool } from '../types/mcp.ts';
import { z } from 'zod';
import { ProductType, EligibilityOperator } from '../generated/prisma/index.js';

const productSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.nativeEnum(ProductType),
    description: z.string(),
    features: z.array(z.string()),
    minimumBalance: z.number(),
    monthlyFee: z.number(),
    interestRate: z.number().nullable(),
    isActive: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string()
});

const eligibilityRuleSchema = z.object({
    id: z.string(),
    field: z.string(),
    operator: z.nativeEnum(EligibilityOperator),
    value: z.any(),
    description: z.string(),
    productId: z.string()
});

const productWithRulesSchema = productSchema.extend({
    eligibilityRules: z.array(eligibilityRuleSchema)
});

const listProductsTool: MCPTool = {
    id: 'product_list',
    name: 'List Products',
    description: 'Get all available banking products with optional filtering',
    inputSchema: z.object({
        type: z.nativeEnum(ProductType).optional(),
        isActive: z.boolean().optional()
    }),
    outputSchema: z.object({
        products: z.array(productWithRulesSchema)
    }),
    fn: async (inputs: { type?: ProductType; isActive?: boolean }) => {
        const filter: any = {};
        if (inputs.type) filter.type = inputs.type;
        if (inputs.isActive !== undefined) filter.isActive = inputs.isActive;

        const products = await productService.getAllProducts(filter);
        return { products };
    }
};

const getProductTool: MCPTool = {
    id: 'product_get',
    name: 'Get Product',
    description: 'Get detailed information about a specific banking product',
    inputSchema: z.object({
        productId: z.string()
    }),
    // For tools that can return null, we omit outputSchema to avoid type mismatch
    fn: async (inputs: { productId: string }) => {
        const product = await productService.getProductById(inputs.productId);
        return product;
    }
};

const checkProductEligibilityTool: MCPTool = {
    id: 'product_check_eligibility',
    name: 'Check Product Eligibility',
    description: 'Check if customer data meets the eligibility requirements for a specific product',
    inputSchema: z.object({
        productId: z.string(),
        customerData: z.object({}).passthrough() // Allow any customer data structure
    }),
    outputSchema: z.object({
        eligible: z.boolean(),
        reasons: z.array(z.string())
    }),
    fn: async (inputs: { productId: string; customerData: any }) => {
        const result = await productService.checkProductEligibility(inputs.productId, inputs.customerData);
        return result;
    }
};

const createProductTool: MCPTool = {
    id: 'product_create',
    name: 'Create Product',
    description: 'Create a new banking product with eligibility rules (admin only)',
    inputSchema: z.object({
        name: z.string(),
        type: z.nativeEnum(ProductType),
        description: z.string(),
        features: z.array(z.string()),
        minimumBalance: z.number().min(0),
        monthlyFee: z.number().min(0),
        interestRate: z.number().min(0).max(100).optional(),
        isActive: z.boolean().optional(),
        eligibilityRules: z.array(
            z.object({
                field: z.string(),
                operator: z.string(), // Accept string for flexibility
                value: z.any(),
                description: z.string()
            })
        ).optional()
    }),
    outputSchema: productWithRulesSchema,
    fn: async (inputs: {
        name: string;
        type: ProductType;
        description: string;
        features: string[];
        minimumBalance: number;
        monthlyFee: number;
        interestRate?: number;
        isActive?: boolean;
        eligibilityRules?: Array<{
            field: string;
            operator: string;
            value: any;
            description: string;
        }>;
    }) => {
        const product = await productService.createProduct(inputs);
        return product;
    }
};

const updateProductTool: MCPTool = {
    id: 'product_update',
    name: 'Update Product',
    description: 'Update an existing banking product (admin only)',
    inputSchema: z.object({
        productId: z.string(),
        name: z.string().optional(),
        type: z.nativeEnum(ProductType).optional(),
        description: z.string().optional(),
        features: z.array(z.string()).optional(),
        minimumBalance: z.number().min(0).optional(),
        monthlyFee: z.number().min(0).optional(),
        interestRate: z.number().min(0).max(100).optional(),
        isActive: z.boolean().optional()
    }),
    outputSchema: productWithRulesSchema,
    fn: async (inputs: {
        productId: string;
        name?: string;
        type?: ProductType;
        description?: string;
        features?: string[];
        minimumBalance?: number;
        monthlyFee?: number;
        interestRate?: number;
        isActive?: boolean;
    }) => {
        const { productId, ...updateData } = inputs;
        const product = await productService.updateProductById(productId, updateData);
        return product;
    }
};

const deleteProductTool: MCPTool = {
    id: 'product_delete',
    name: 'Delete Product',
    description: 'Delete a banking product (admin only - cannot delete products used in applications)',
    inputSchema: z.object({
        productId: z.string()
    }),
    outputSchema: z.object({
        success: z.boolean(),
        message: z.string()
    }),
    fn: async (inputs: { productId: string }) => {
        await productService.deleteProductById(inputs.productId);
        return {
            success: true,
            message: `Product ${inputs.productId} deleted successfully`
        };
    }
};

const searchProductsTool: MCPTool = {
    id: 'product_search',
    name: 'Search Products',
    description: 'Search products with advanced filtering and pagination',
    inputSchema: z.object({
        type: z.nativeEnum(ProductType).optional(),
        isActive: z.boolean().optional(),
        name: z.string().optional(),
        page: z.number().int().min(1).optional(),
        limit: z.number().int().min(1).max(100).optional(),
        sortBy: z.string().optional(),
        sortType: z.enum(['asc', 'desc']).optional()
    }),
    outputSchema: z.object({
        products: z.array(productWithRulesSchema)
    }),
    fn: async (inputs: {
        type?: ProductType;
        isActive?: boolean;
        name?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        sortType?: 'asc' | 'desc';
    }) => {
        const { name, ...params } = inputs;
        const filter: any = {};
        if (params.type) filter.type = params.type;
        if (params.isActive !== undefined) filter.isActive = params.isActive;
        if (name) filter.name = { contains: name, mode: 'insensitive' };

        const options = {
            page: params.page,
            limit: params.limit,
            sortBy: params.sortBy,
            sortType: params.sortType
        };

        const products = await productService.queryProducts(filter, options);
        return { products };
    }
};

const getProductTypesTool: MCPTool = {
    id: 'product_types_list',
    name: 'Get Product Types',
    description: 'Get all available product types',
    inputSchema: z.object({}),
    outputSchema: z.object({
        types: z.array(z.string())
    }),
    fn: async (inputs: {}) => {
        return { types: Object.values(ProductType) };
    }
};

const getEligibilityOperatorsTool: MCPTool = {
    id: 'eligibility_operators_list',
    name: 'Get Eligibility Operators',
    description: 'Get all available eligibility rule operators',
    inputSchema: z.object({}),
    outputSchema: z.object({
        operators: z.array(z.object({
            operator: z.string(),
            description: z.string()
        }))
    }),
    fn: async (inputs: {}) => {
        return {
            operators: [
                { operator: 'GREATER_THAN_OR_EQUAL', description: 'Greater than or equal to (>=)' },
                { operator: 'LESS_THAN_OR_EQUAL', description: 'Less than or equal to (<=)' },
                { operator: 'EQUAL', description: 'Equal to (==)' },
                { operator: 'NOT_EQUAL', description: 'Not equal to (!=)' },
                { operator: 'IN', description: 'Value is in array' },
                { operator: 'NOT_IN', description: 'Value is not in array' }
            ]
        };
    }
};

export default [
    listProductsTool,
    getProductTool,
    checkProductEligibilityTool,
    createProductTool,
    updateProductTool,
    deleteProductTool,
    searchProductsTool,
    getProductTypesTool,
    getEligibilityOperatorsTool
];