import prisma from '../client.ts';
import { Product, ProductType, EligibilityRule, Prisma } from '../generated/prisma/index.js';
import ApiError from '../utils/ApiError.ts';
import httpStatus from 'http-status';

/**
 * Create a product
 * @param {Object} productData
 * @returns {Promise<Product>}
 */
const createProduct = async (productData: {
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
}): Promise<Product & { eligibilityRules: EligibilityRule[] }> => {
    const { eligibilityRules, ...productFields } = productData;
    
    return prisma.product.create({
        data: {
            ...productFields,
            eligibilityRules: eligibilityRules ? {
                create: eligibilityRules.map(rule => ({
                    field: rule.field,
                    operator: rule.operator as any,
                    value: rule.value,
                    description: rule.description
                }))
            } : undefined
        },
        include: {
            eligibilityRules: true
        }
    });
};

/**
 * Query for products
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @returns {Promise<Product[]>}
 */
const queryProducts = async (
    filter: {
        type?: ProductType;
        isActive?: boolean;
        name?: { contains: string; mode?: 'insensitive' };
    },
    options: {
        limit?: number;
        page?: number;
        sortBy?: string;
        sortType?: 'asc' | 'desc';
    } = {}
): Promise<(Product & { eligibilityRules: EligibilityRule[] })[]> => {
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const sortBy = options.sortBy ?? 'createdAt';
    const sortType = options.sortType ?? 'desc';

    const products = await prisma.product.findMany({
        where: filter,
        include: {
            eligibilityRules: true
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortType }
    });

    return products;
};

/**
 * Get all products (without pagination)
 * @param {Object} filter - Prisma filter
 * @returns {Promise<Product[]>}
 */
const getAllProducts = async (filter: {
    type?: ProductType;
    isActive?: boolean;
}): Promise<(Product & { eligibilityRules: EligibilityRule[] })[]> => {
    return prisma.product.findMany({
        where: filter,
        include: {
            eligibilityRules: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

/**
 * Get product by id
 * @param {string} id
 * @returns {Promise<Product | null>}
 */
const getProductById = async (id: string): Promise<(Product & { eligibilityRules: EligibilityRule[] }) | null> => {
    return prisma.product.findUnique({
        where: { id },
        include: {
            eligibilityRules: true
        }
    });
};

/**
 * Update product by id
 * @param {string} productId
 * @param {Object} updateBody
 * @returns {Promise<Product>}
 */
const updateProductById = async (
    productId: string,
    updateBody: Prisma.ProductUpdateInput
): Promise<Product & { eligibilityRules: EligibilityRule[] }> => {
    const product = await getProductById(productId);
    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }

    const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: updateBody,
        include: {
            eligibilityRules: true
        }
    });
    
    return updatedProduct;
};

/**
 * Delete product by id
 * @param {string} productId
 * @returns {Promise<Product>}
 */
const deleteProductById = async (productId: string): Promise<Product> => {
    const product = await getProductById(productId);
    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }

    // Check if product has any selections (used in applications)
    const productSelections = await prisma.productSelection.findFirst({
        where: { productId }
    });
    
    if (productSelections) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete product that is used in applications');
    }

    await prisma.product.delete({ where: { id: productId } });
    return product;
};

/**
 * Check product eligibility based on customer data
 * @param {string} productId
 * @param {Object} customerData
 * @returns {Promise<{eligible: boolean, reasons: string[]}>}
 */
const checkProductEligibility = async (
    productId: string, 
    customerData: any
): Promise<{ eligible: boolean; reasons: string[] }> => {
    const product = await getProductById(productId);
    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }

    const reasons: string[] = [];
    let eligible = true;

    for (const rule of product.eligibilityRules) {
        const fieldValue = getNestedValue(customerData, rule.field);
        const ruleValue = rule.value;
        let ruleMatched = false;

        switch (rule.operator) {
            case 'GREATER_THAN_OR_EQUAL':
                ruleMatched = Number(fieldValue) >= Number(ruleValue);
                break;
            case 'LESS_THAN_OR_EQUAL':
                ruleMatched = Number(fieldValue) <= Number(ruleValue);
                break;
            case 'EQUAL':
                ruleMatched = fieldValue === ruleValue;
                break;
            case 'NOT_EQUAL':
                ruleMatched = fieldValue !== ruleValue;
                break;
            case 'IN':
                ruleMatched = Array.isArray(ruleValue) && ruleValue.includes(fieldValue);
                break;
            case 'NOT_IN':
                ruleMatched = Array.isArray(ruleValue) && !ruleValue.includes(fieldValue);
                break;
            default:
                ruleMatched = false;
        }

        if (!ruleMatched) {
            eligible = false;
            reasons.push(rule.description);
        }
    }

    return { eligible, reasons };
};

/**
 * Helper function to get nested value from object
 * @param {Object} obj
 * @param {string} path
 * @returns {any}
 */
const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
};

export default {
    createProduct,
    queryProducts,
    getAllProducts,
    getProductById,
    updateProductById,
    deleteProductById,
    checkProductEligibility
};