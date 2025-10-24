import Joi from 'joi';
import { ProductType, EligibilityOperator } from '../generated/prisma/index.js';

const getProducts = {
    query: Joi.object().keys({
        type: Joi.string().valid(...Object.values(ProductType)),
        isActive: Joi.boolean(),
        name: Joi.string(),
        sortBy: Joi.string(),
        limit: Joi.number().integer().min(1).max(100),
        page: Joi.number().integer().min(1)
    })
};

const getProduct = {
    params: Joi.object().keys({
        productId: Joi.string().required()
    })
};

const createProduct = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        type: Joi.string().valid(...Object.values(ProductType)).required(),
        description: Joi.string().required(),
        features: Joi.array().items(Joi.string()).required(),
        minimumBalance: Joi.number().min(0).required(),
        monthlyFee: Joi.number().min(0).required(),
        interestRate: Joi.number().min(0).max(100),
        isActive: Joi.boolean(),
        eligibilityRules: Joi.array().items(
            Joi.object().keys({
                field: Joi.string().required(),
                operator: Joi.string().valid(...Object.values(EligibilityOperator)).required(),
                value: Joi.alternatives([
                    Joi.string(),
                    Joi.number(),
                    Joi.boolean(),
                    Joi.array(),
                    Joi.object()
                ]).required(),
                description: Joi.string().required()
            })
        )
    })
};

const updateProduct = {
    params: Joi.object().keys({
        productId: Joi.string().required()
    }),
    body: Joi.object()
        .keys({
            name: Joi.string(),
            type: Joi.string().valid(...Object.values(ProductType)),
            description: Joi.string(),
            features: Joi.array().items(Joi.string()),
            minimumBalance: Joi.number().min(0),
            monthlyFee: Joi.number().min(0),
            interestRate: Joi.number().min(0).max(100),
            isActive: Joi.boolean()
        })
        .min(1)
};

const deleteProduct = {
    params: Joi.object().keys({
        productId: Joi.string().required()
    })
};

const checkEligibility = {
    params: Joi.object().keys({
        productId: Joi.string().required()
    }),
    body: Joi.object().keys({
        customerData: Joi.object().required()
    })
};

export default {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    checkEligibility
};