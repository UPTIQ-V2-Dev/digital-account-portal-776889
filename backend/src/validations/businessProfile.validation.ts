import Joi from 'joi';

// EIN validation pattern (XX-XXXXXXX)
const einPattern = /^\d{2}-\d{7}$/;

// Valid entity types
const entityTypes = ['corporation', 'llc', 'partnership', 'sole_proprietorship'];

// Address validation schema
const addressSchema = Joi.object().keys({
    street: Joi.string().required().max(255),
    city: Joi.string().required().max(100),
    state: Joi.string().required().length(2).uppercase(),
    zipCode: Joi.string().required().pattern(/^\d{5}(-\d{4})?$/),
    country: Joi.string().required().default('US').valid('US'),
    apartment: Joi.string().allow('').max(50).optional()
});

const createOrUpdateBusinessProfile = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    }),
    body: Joi.object()
        .keys({
            businessName: Joi.string().required().max(255).trim(),
            dbaName: Joi.string().allow('').max(255).trim().optional(),
            ein: Joi.string()
                .required()
                .pattern(einPattern)
                .message('EIN must be in format XX-XXXXXXX'),
            entityType: Joi.string()
                .required()
                .valid(...entityTypes)
                .messages({
                    'any.only': `Entity type must be one of: ${entityTypes.join(', ')}`
                }),
            industryType: Joi.string().required().max(100).trim(),
            dateEstablished: Joi.string()
                .required()
                .pattern(/^\d{4}-\d{2}-\d{2}$/)
                .message('Date established must be in YYYY-MM-DD format'),
            businessPhone: Joi.string()
                .required()
                .pattern(/^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/)
                .message('Invalid phone number format'),
            businessEmail: Joi.string().required().email().max(255).lowercase().trim(),
            website: Joi.string().allow('').uri().max(255).optional(),
            description: Joi.string().required().max(1000).trim(),
            isCashIntensive: Joi.boolean().required(),
            monthlyTransactionVolume: Joi.number().required().min(0).max(999999999),
            monthlyTransactionCount: Joi.number().integer().required().min(0).max(999999),
            expectedBalance: Joi.number().required().min(0).max(999999999),
            businessAddress: addressSchema.required(),
            mailingAddress: addressSchema.optional()
        })
        .custom((value, helpers) => {
            // Validate that date established is not in the future
            const dateEstablished = new Date(value.dateEstablished);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (dateEstablished > today) {
                return helpers.error('custom.dateInFuture');
            }
            
            // Validate that business email is different from system reserved domains
            const reservedDomains = ['localhost', '127.0.0.1', 'example.com', 'test.com'];
            const emailDomain = value.businessEmail.split('@')[1]?.toLowerCase();
            if (reservedDomains.includes(emailDomain)) {
                return helpers.error('custom.reservedEmailDomain');
            }
            
            return value;
        }, 'Business Profile Validation')
        .messages({
            'custom.dateInFuture': 'Date established cannot be in the future',
            'custom.reservedEmailDomain': 'Business email cannot use reserved domains'
        })
};

const getBusinessProfile = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    })
};

const deleteBusinessProfile = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    })
};

export default {
    createOrUpdateBusinessProfile,
    getBusinessProfile,
    deleteBusinessProfile
};