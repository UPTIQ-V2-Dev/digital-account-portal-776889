import Joi from 'joi';

const bankingRelationshipSchema = Joi.object({
    bankName: Joi.string().required().trim().min(1).max(255).messages({
        'string.empty': 'Bank name is required',
        'string.min': 'Bank name cannot be empty',
        'string.max': 'Bank name is too long'
    }),
    accountTypes: Joi.array()
        .items(Joi.string().valid(
            'checking',
            'savings',
            'money_market',
            'certificate_deposit',
            'credit_card',
            'loan',
            'mortgage',
            'investment',
            'retirement',
            'other'
        ))
        .min(1)
        .required()
        .messages({
            'array.min': 'At least one account type is required',
            'any.only': 'Invalid account type'
        }),
    yearsWithBank: Joi.number()
        .integer()
        .min(0)
        .max(100)
        .required()
        .messages({
            'number.min': 'Years with bank must be at least 0',
            'number.max': 'Years with bank cannot exceed 100'
        })
});

const accountActivitySchema = Joi.object({
    activity: Joi.string().required().trim().min(1).max(255).messages({
        'string.empty': 'Activity description is required',
        'string.min': 'Activity description cannot be empty',
        'string.max': 'Activity description is too long'
    }),
    frequency: Joi.string()
        .valid('daily', 'weekly', 'monthly', 'quarterly', 'annually', 'as_needed')
        .required()
        .messages({
            'any.only': 'Invalid frequency. Must be one of: daily, weekly, monthly, quarterly, annually, as_needed'
        }),
    amount: Joi.number()
        .min(0)
        .max(10000000)
        .required()
        .messages({
            'number.min': 'Activity amount must be non-negative',
            'number.max': 'Activity amount exceeds reasonable limit'
        })
});

const createOrUpdateFinancialProfile = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    }),
    body: Joi.object().keys({
        annualIncome: Joi.number()
            .min(0)
            .max(10000000)
            .required()
            .messages({
                'number.min': 'Annual income must be non-negative',
                'number.max': 'Annual income exceeds reasonable limit'
            }),
        incomeSource: Joi.array()
            .items(Joi.string().valid(
                'employment',
                'self-employment',
                'business',
                'investment',
                'retirement',
                'disability',
                'social_security',
                'other'
            ))
            .min(1)
            .unique()
            .required()
            .messages({
                'array.min': 'At least one income source is required',
                'array.unique': 'Income sources must be unique',
                'any.only': 'Invalid income source'
            }),
        employmentInfo: Joi.object().allow(null).optional().messages({
            'object.base': 'Employment info must be a valid object'
        }),
        assets: Joi.number()
            .min(0)
            .max(100000000)
            .required()
            .messages({
                'number.min': 'Assets must be non-negative',
                'number.max': 'Assets exceed reasonable limit'
            }),
        liabilities: Joi.number()
            .min(0)
            .max(100000000)
            .required()
            .messages({
                'number.min': 'Liabilities must be non-negative',
                'number.max': 'Liabilities exceed reasonable limit'
            }),
        bankingRelationships: Joi.array()
            .items(bankingRelationshipSchema)
            .min(1)
            .max(10)
            .required()
            .messages({
                'array.min': 'At least one banking relationship is required',
                'array.max': 'Too many banking relationships (maximum 10)'
            }),
        accountActivities: Joi.array()
            .items(accountActivitySchema)
            .min(1)
            .max(20)
            .required()
            .messages({
                'array.min': 'At least one account activity is required',
                'array.max': 'Too many account activities (maximum 20)'
            })
    })
};

const getFinancialProfile = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    })
};

const deleteFinancialProfile = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    })
};

export default {
    createOrUpdateFinancialProfile,
    getFinancialProfile,
    deleteFinancialProfile
};