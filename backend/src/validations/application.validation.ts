import Joi from 'joi';

const createApplication = {
    body: Joi.object().keys({
        accountType: Joi.string().required().valid('consumer', 'business')
    })
};

const getApplications = {
    query: Joi.object().keys({
        status: Joi.string().valid('draft', 'in_progress', 'submitted', 'approved', 'rejected', 'completed'),
        accountType: Joi.string().valid('consumer', 'business'),
        customerType: Joi.string().valid('new', 'existing'),
        sortBy: Joi.string(),
        sortType: Joi.string().valid('asc', 'desc'),
        limit: Joi.number().integer().min(1).max(100),
        page: Joi.number().integer().min(1)
    })
};

const getApplication = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    })
};

const updateApplication = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    }),
    body: Joi.object()
        .keys({
            currentStep: Joi.string().valid(
                'account_type',
                'personal_info',
                'business_profile',
                'financial_profile',
                'product_selection',
                'document_upload',
                'kyc_verification',
                'risk_assessment',
                'agreements',
                'funding_setup',
                'review'
            ),
            status: Joi.string().valid('draft', 'in_progress', 'submitted', 'approved', 'rejected', 'completed'),
            accountType: Joi.string().valid('consumer', 'business'),
            customerType: Joi.string().valid('new', 'existing')
        })
        .min(1)
};

const submitApplication = {
    body: Joi.object().keys({
        applicationId: Joi.string().required(),
        finalReview: Joi.boolean().required().valid(true),
        electronicConsent: Joi.boolean().required().valid(true)
    })
};

const getApplicationSummary = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    })
};

const deleteApplication = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    })
};

export default {
    createApplication,
    getApplications,
    getApplication,
    updateApplication,
    submitApplication,
    getApplicationSummary,
    deleteApplication
};