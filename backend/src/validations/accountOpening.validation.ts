import { ALLOWED_DOCUMENT_TYPES } from '../utils/fileStorage.ts';
import Joi from 'joi';

const createApplication = {
    body: Joi.object().keys({
        accountType: Joi.string().required().valid('consumer', 'commercial', 'business'),
        personalInfo: Joi.object().keys({
            firstName: Joi.string().required(),
            middleName: Joi.string(),
            lastName: Joi.string().required(),
            suffix: Joi.string(),
            dateOfBirth: Joi.string().required(),
            ssn: Joi.string().required(),
            phone: Joi.string().required(),
            email: Joi.string().required().email(),
            mailingAddress: Joi.object().required(),
            physicalAddress: Joi.object(),
            employmentStatus: Joi.string().required(),
            occupation: Joi.string(),
            employer: Joi.string(),
            workPhone: Joi.string()
        }),
        businessProfile: Joi.object().keys({
            businessName: Joi.string().required(),
            dbaName: Joi.string(),
            ein: Joi.string().required(),
            entityType: Joi.string().required(),
            industryType: Joi.string().required(),
            dateEstablished: Joi.string().required(),
            businessAddress: Joi.object().required(),
            mailingAddress: Joi.object(),
            businessPhone: Joi.string().required(),
            businessEmail: Joi.string().required().email(),
            website: Joi.string(),
            description: Joi.string().required(),
            isCashIntensive: Joi.boolean().default(false),
            monthlyTransactionVolume: Joi.number().required(),
            monthlyTransactionCount: Joi.number().integer().required(),
            expectedBalance: Joi.number().required()
        })
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
                'signatures',
                'funding',
                'review',
                'confirmation'
            ),
            status: Joi.string().valid(
                'draft',
                'in_progress',
                'submitted',
                'under_review',
                'approved',
                'rejected',
                'completed'
            ),
            accountType: Joi.string().valid('consumer', 'commercial', 'business')
        })
        .min(1)
};

const submitApplication = {
    body: Joi.object().keys({
        applicationId: Joi.string().required(),
        finalReview: Joi.boolean().required(),
        electronicConsent: Joi.boolean().required()
    })
};

const getApplicationSummary = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    })
};

// Address validation schema
const addressSchema = Joi.object().keys({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    country: Joi.string().required()
});

const updatePersonalInfo = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    }),
    body: Joi.object().keys({
        firstName: Joi.string().required(),
        middleName: Joi.string(),
        lastName: Joi.string().required(),
        suffix: Joi.string(),
        dateOfBirth: Joi.string().required(),
        ssn: Joi.string().required(),
        phone: Joi.string().required(),
        email: Joi.string().required().email(),
        mailingAddress: addressSchema.required(),
        physicalAddress: addressSchema,
        employmentStatus: Joi.string().required(),
        occupation: Joi.string(),
        employer: Joi.string(),
        workPhone: Joi.string()
    })
};

const getPersonalInfo = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    })
};

const updateBusinessProfile = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    }),
    body: Joi.object().keys({
        businessName: Joi.string().required(),
        dbaName: Joi.string(),
        ein: Joi.string().required(),
        entityType: Joi.string().required(),
        industryType: Joi.string().required(),
        dateEstablished: Joi.string().required(),
        businessAddress: addressSchema.required(),
        mailingAddress: addressSchema,
        businessPhone: Joi.string().required(),
        businessEmail: Joi.string().required().email(),
        website: Joi.string(),
        description: Joi.string().required(),
        isCashIntensive: Joi.boolean().required(),
        monthlyTransactionVolume: Joi.number().required(),
        monthlyTransactionCount: Joi.number().integer().required(),
        expectedBalance: Joi.number().required()
    })
};

const getBusinessProfile = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    })
};

const updateFinancialProfile = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    }),
    body: Joi.object().keys({
        annualIncome: Joi.number().min(0).required(),
        incomeSource: Joi.array().items(Joi.string()).min(1).required(),
        employmentInfo: Joi.object(),
        assets: Joi.number().min(0).required(),
        liabilities: Joi.number().min(0).required(),
        bankingRelationships: Joi.array().items(Joi.object()).min(1).required(),
        accountActivities: Joi.array().items(Joi.object()).min(1).required()
    })
};

const getFinancialProfile = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    })
};

const getProducts = {
    query: Joi.object().keys({
        accountType: Joi.string().valid('consumer', 'commercial', 'business')
    })
};

const getEligibleProducts = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    })
};

const updateProductSelections = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    }),
    body: Joi.object().keys({
        selections: Joi.array()
            .items(
                Joi.object().keys({
                    productId: Joi.string().required(),
                    selectedFeatures: Joi.array().items(Joi.string()),
                    initialDeposit: Joi.number().min(0)
                })
            )
            .min(1)
            .required()
    })
};

const uploadDocument = {
    body: Joi.object().keys({
        documentType: Joi.string()
            .required()
            .valid(...ALLOWED_DOCUMENT_TYPES),
        applicationId: Joi.string().required()
    })
};

const getDocuments = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    })
};

const deleteDocument = {
    params: Joi.object().keys({
        documentId: Joi.string().required()
    })
};

const initiateKYCVerification = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    })
};

const getKYCVerificationStatus = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    })
};

const performRiskAssessment = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    })
};

const getDisclosures = {
    query: Joi.object().keys({
        accountType: Joi.string().required().valid('consumer', 'commercial', 'business')
    })
};

const acknowledgeAgreement = {
    body: Joi.object().keys({
        applicationId: Joi.string().required(),
        disclosureId: Joi.string().required()
    })
};

const captureElectronicSignature = {
    body: Joi.object().keys({
        applicationId: Joi.string().required(),
        signatureData: Joi.string()
            .required()
            .pattern(/^data:image\/(png|jpeg|jpg|gif|svg\+xml);base64,/),
        documentType: Joi.string()
            .required()
            .valid(
                'consumer_account_agreement',
                'business_account_agreement',
                'deposit_account_agreement',
                'terms_and_conditions',
                'privacy_policy',
                'electronic_communications_agreement',
                'funds_availability_policy',
                'fee_schedule',
                'patriot_act_notice',
                'overdraft_coverage_agreement',
                'debit_card_agreement'
            ),
        biometric: Joi.object().keys({
            touchPressure: Joi.array().items(Joi.number()),
            signingSpeed: Joi.array().items(Joi.number()),
            accelerometer: Joi.array().items(Joi.object()),
            deviceInfo: Joi.object(),
            timestamp: Joi.array().items(Joi.number())
        })
    })
};

const setupAccountFunding = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    }),
    body: Joi.object().keys({
        method: Joi.string().required().valid('ach', 'check', 'wire_transfer', 'cash'),
        amount: Joi.number().min(0.01).required(),
        details: Joi.object().required()
    })
};

// Admin API validations
const getAdminApplications = {
    query: Joi.object().keys({
        status: Joi.array().items(
            Joi.string().valid('draft', 'in_progress', 'submitted', 'under_review', 'approved', 'rejected', 'completed')
        ),
        accountType: Joi.array().items(Joi.string().valid('consumer', 'commercial', 'business')),
        riskLevel: Joi.array().items(Joi.string().valid('low', 'medium', 'high')),
        dateFrom: Joi.string(),
        dateTo: Joi.string(),
        search: Joi.string()
    })
};

const updateApplicationStatus = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    }),
    body: Joi.object().keys({
        status: Joi.string()
            .required()
            .valid('draft', 'in_progress', 'submitted', 'under_review', 'approved', 'rejected', 'completed'),
        notes: Joi.string()
    })
};

const getApplicationAudit = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    })
};

export default {
    createApplication,
    getApplication,
    updateApplication,
    submitApplication,
    getApplicationSummary,
    updatePersonalInfo,
    getPersonalInfo,
    updateBusinessProfile,
    getBusinessProfile,
    updateFinancialProfile,
    getFinancialProfile,
    getProducts,
    getEligibleProducts,
    updateProductSelections,
    uploadDocument,
    getDocuments,
    deleteDocument,
    initiateKYCVerification,
    getKYCVerificationStatus,
    performRiskAssessment,
    getDisclosures,
    acknowledgeAgreement,
    captureElectronicSignature,
    setupAccountFunding,
    // Admin API validations
    getAdminApplications,
    updateApplicationStatus,
    getApplicationAudit
};
