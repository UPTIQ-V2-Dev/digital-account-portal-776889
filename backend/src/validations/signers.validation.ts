import Joi from 'joi';

// Address validation schema (reused from accountOpening.validation.ts)
const addressSchema = Joi.object().keys({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    country: Joi.string().required()
});

// Personal info validation schema for signers
const personalInfoSchema = Joi.object().keys({
    firstName: Joi.string().required(),
    middleName: Joi.string().allow(''),
    lastName: Joi.string().required(),
    suffix: Joi.string().allow(''),
    dateOfBirth: Joi.string().required(),
    ssn: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().required().email(),
    mailingAddress: addressSchema.required(),
    physicalAddress: addressSchema,
    employmentStatus: Joi.string()
        .required()
        .valid('employed', 'self_employed', 'unemployed', 'retired', 'student', 'other'),
    occupation: Joi.string(),
    employer: Joi.string(),
    workPhone: Joi.string()
});

// Valid signer roles
const validSignerRoles = [
    'authorized_signer',
    'beneficial_owner',
    'managing_member',
    'partner',
    'officer',
    'director',
    'trustee',
    'other'
];

const createSigner = {
    body: Joi.object().keys({
        applicationId: Joi.string().required(),
        personalInfo: personalInfoSchema.required(),
        role: Joi.string()
            .required()
            .valid(...validSignerRoles),
        relationshipToBusiness: Joi.string().when('role', {
            is: Joi.string().valid('beneficial_owner', 'managing_member', 'partner', 'officer', 'director'),
            then: Joi.required(),
            otherwise: Joi.optional()
        }),
        beneficialOwnershipPercentage: Joi.number().min(0).max(100).when('role', {
            is: 'beneficial_owner',
            then: Joi.required(),
            otherwise: Joi.optional()
        }),
        hasSigningAuthority: Joi.boolean().required()
    })
};

const updateSigner = {
    params: Joi.object().keys({
        signerId: Joi.string().required()
    }),
    body: Joi.object()
        .keys({
            personalInfo: personalInfoSchema,
            role: Joi.string().valid(...validSignerRoles),
            relationshipToBusiness: Joi.string(),
            beneficialOwnershipPercentage: Joi.number().min(0).max(100),
            hasSigningAuthority: Joi.boolean()
        })
        .min(1)
};

const getSigner = {
    params: Joi.object().keys({
        signerId: Joi.string().required()
    })
};

const getSignersByApplication = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    })
};

const deleteSigner = {
    params: Joi.object().keys({
        signerId: Joi.string().required()
    })
};

export default {
    createSigner,
    updateSigner,
    getSigner,
    getSignersByApplication,
    deleteSigner
};
