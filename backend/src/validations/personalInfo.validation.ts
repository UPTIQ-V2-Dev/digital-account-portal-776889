import Joi from 'joi';

// SSN validation pattern (XXX-XX-XXXX)
const ssnPattern = /^\d{3}-\d{2}-\d{4}$/;

// Valid employment statuses
const employmentStatuses = ['employed', 'self_employed', 'unemployed', 'retired', 'student'];

// Address validation schema
const addressSchema = Joi.object().keys({
    street: Joi.string().required().max(255),
    city: Joi.string().required().max(100),
    state: Joi.string().required().length(2).uppercase(),
    zipCode: Joi.string().required().pattern(/^\d{5}(-\d{4})?$/),
    country: Joi.string().required().default('US').valid('US'),
    apartment: Joi.string().allow('').max(50).optional()
});

const createOrUpdatePersonalInfo = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    }),
    body: Joi.object()
        .keys({
            firstName: Joi.string().required().max(100).trim(),
            middleName: Joi.string().allow('').max(100).trim().optional(),
            lastName: Joi.string().required().max(100).trim(),
            suffix: Joi.string().allow('').max(10).trim().optional(),
            dateOfBirth: Joi.string()
                .required()
                .pattern(/^\d{4}-\d{2}-\d{2}$/)
                .message('Date of birth must be in YYYY-MM-DD format'),
            ssn: Joi.string()
                .required()
                .pattern(ssnPattern)
                .message('SSN must be in format XXX-XX-XXXX'),
            phone: Joi.string()
                .required()
                .pattern(/^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/)
                .message('Invalid phone number format'),
            email: Joi.string().required().email().max(255).lowercase().trim(),
            employmentStatus: Joi.string()
                .required()
                .valid(...employmentStatuses)
                .messages({
                    'any.only': `Employment status must be one of: ${employmentStatuses.join(', ')}`
                }),
            occupation: Joi.string().allow('').max(100).trim().optional(),
            employer: Joi.string().allow('').max(255).trim().optional(),
            workPhone: Joi.string()
                .allow('')
                .pattern(/^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/)
                .message('Invalid work phone number format')
                .optional(),
            mailingAddress: addressSchema.required(),
            physicalAddress: addressSchema.optional()
        })
        .custom((value, helpers) => {
            // Validate that date of birth is not in the future and meets age requirement
            const dateOfBirth = new Date(value.dateOfBirth);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (dateOfBirth > today) {
                return helpers.error('custom.dateInFuture');
            }
            
            // Check minimum age requirement (18 years old)
            const age = today.getFullYear() - dateOfBirth.getFullYear();
            const monthDiff = today.getMonth() - dateOfBirth.getMonth();
            
            let actualAge = age;
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
                actualAge = age - 1;
            }
            
            if (actualAge < 18) {
                return helpers.error('custom.underAge');
            }
            
            // Validate that email is different from system reserved domains
            const reservedDomains = ['localhost', '127.0.0.1', 'example.com', 'test.com'];
            const emailDomain = value.email.split('@')[1]?.toLowerCase();
            if (reservedDomains.includes(emailDomain)) {
                return helpers.error('custom.reservedEmailDomain');
            }

            // If employment status requires additional fields
            if (value.employmentStatus === 'employed' || value.employmentStatus === 'self_employed') {
                if (!value.occupation || value.occupation.trim() === '') {
                    return helpers.error('custom.occupationRequired');
                }
                if (value.employmentStatus === 'employed' && (!value.employer || value.employer.trim() === '')) {
                    return helpers.error('custom.employerRequired');
                }
            }
            
            return value;
        }, 'Personal Information Validation')
        .messages({
            'custom.dateInFuture': 'Date of birth cannot be in the future',
            'custom.underAge': 'Applicant must be at least 18 years old',
            'custom.reservedEmailDomain': 'Email cannot use reserved domains',
            'custom.occupationRequired': 'Occupation is required for employed and self-employed individuals',
            'custom.employerRequired': 'Employer is required for employed individuals'
        })
};

const getPersonalInfo = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    })
};

const deletePersonalInfo = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    })
};

export default {
    createOrUpdatePersonalInfo,
    getPersonalInfo,
    deletePersonalInfo
};