import prisma from '../client.ts';
import {
    Agreement,
    Application,
    BusinessProfile,
    Disclosure,
    Document,
    ElectronicSignature,
    FinancialProfile,
    FundingSetup,
    KYCVerification,
    PersonalInfo,
    Product,
    RiskAssessment
} from '../generated/prisma/index.js';
import ApiError from '../utils/ApiError.ts';
import { ALLOWED_DOCUMENT_TYPES, deleteFile, getDocumentPath, mockDocumentVerification } from '../utils/fileStorage.ts';
import { mockKYCVerification } from '../utils/mockKycService.ts';
import { RiskAssessmentEngine } from '../utils/riskAssessmentEngine.ts';
import cuid from 'cuid';
import httpStatus from 'http-status';

/**
 * Create a new account opening application
 * @param {number} userId - The user creating the application
 * @param {string} accountType - Type of account (consumer, commercial, etc.)
 * @param {Object} personalInfo - Optional personal information
 * @param {Object} businessProfile - Optional business profile
 * @param {Object} metadata - Application metadata
 * @returns {Promise<Application>}
 */
const createApplication = async (
    userId: number,
    accountType: string,
    personalInfo?: any,
    businessProfile?: any,
    metadata: any = {}
): Promise<
    Pick<
        Application,
        | 'id'
        | 'status'
        | 'currentStep'
        | 'accountType'
        | 'customerType'
        | 'applicantId'
        | 'createdAt'
        | 'updatedAt'
        | 'metadata'
    >
> => {
    const applicantId = cuid();

    const defaultMetadata = {
        userAgent: metadata.userAgent || 'unknown',
        ipAddress: metadata.ipAddress || '0.0.0.0',
        sessionId: metadata.sessionId || cuid(),
        startedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        source: metadata.source || 'api',
        ...metadata
    };

    const application = await prisma.application.create({
        data: {
            accountType,
            applicantId,
            userId,
            metadata: defaultMetadata,
            ...(personalInfo && {
                personalInfo: {
                    create: personalInfo
                }
            }),
            ...(businessProfile && {
                businessProfile: {
                    create: businessProfile
                }
            })
        },
        select: {
            id: true,
            status: true,
            currentStep: true,
            accountType: true,
            customerType: true,
            applicantId: true,
            submittedAt: true,
            completedAt: true,
            createdAt: true,
            updatedAt: true,
            metadata: true
        }
    });

    return application;
};

/**
 * Get application by ID
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID for access control
 * @returns {Promise<Application | null>}
 */
const getApplicationById = async (
    applicationId: string,
    userId?: number
): Promise<
    Pick<
        Application,
        | 'id'
        | 'status'
        | 'currentStep'
        | 'accountType'
        | 'customerType'
        | 'applicantId'
        | 'submittedAt'
        | 'completedAt'
        | 'createdAt'
        | 'updatedAt'
        | 'metadata'
    >
> => {
    const whereClause: any = { id: applicationId };

    // Add user filter if provided (for access control)
    if (userId !== undefined) {
        whereClause.userId = userId;
    }

    const application = await prisma.application.findUnique({
        where: whereClause,
        select: {
            id: true,
            status: true,
            currentStep: true,
            accountType: true,
            customerType: true,
            applicantId: true,
            submittedAt: true,
            completedAt: true,
            createdAt: true,
            updatedAt: true,
            metadata: true
        }
    });

    if (!application) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Application not found');
    }

    return application;
};

/**
 * Update application by ID
 * @param {string} applicationId - Application ID
 * @param {Object} updateData - Data to update
 * @param {number} userId - User ID for access control
 * @returns {Promise<Application>}
 */
const updateApplicationById = async (
    applicationId: string,
    updateData: any,
    userId?: number
): Promise<
    Pick<
        Application,
        | 'id'
        | 'status'
        | 'currentStep'
        | 'accountType'
        | 'customerType'
        | 'applicantId'
        | 'submittedAt'
        | 'completedAt'
        | 'createdAt'
        | 'updatedAt'
        | 'metadata'
    >
> => {
    // First verify the application exists and user has access
    const existingApplication = await getApplicationById(applicationId, userId);

    // Update metadata with lastActivity
    const updatedMetadata = {
        ...(existingApplication.metadata as any),
        lastActivity: new Date().toISOString(),
        ...updateData.metadata
    };

    const application = await prisma.application.update({
        where: { id: applicationId },
        data: {
            ...updateData,
            metadata: updatedMetadata
        },
        select: {
            id: true,
            status: true,
            currentStep: true,
            accountType: true,
            customerType: true,
            applicantId: true,
            submittedAt: true,
            completedAt: true,
            createdAt: true,
            updatedAt: true,
            metadata: true
        }
    });

    return application;
};

/**
 * Submit application for review
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID for access control
 * @param {boolean} finalReview - Whether final review is confirmed
 * @param {boolean} electronicConsent - Whether electronic consent is given
 * @returns {Promise<{submitted: boolean}>}
 */
const submitApplication = async (
    applicationId: string,
    userId: number,
    finalReview: boolean,
    electronicConsent: boolean
): Promise<{ submitted: boolean }> => {
    // Verify the application exists and user has access
    const existingApplication = await getApplicationById(applicationId, userId);

    // Validate submission requirements
    if (!finalReview) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid input or application not ready');
    }

    if (!electronicConsent) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid input or application not ready');
    }

    // Update application status to submitted
    await prisma.application.update({
        where: { id: applicationId },
        data: {
            status: 'submitted',
            submittedAt: new Date(),
            metadata: {
                ...(existingApplication.metadata as any),
                lastActivity: new Date().toISOString(),
                submittedAt: new Date().toISOString()
            }
        }
    });

    // Create audit trail entry
    await prisma.auditTrailEntry.create({
        data: {
            applicationId,
            action: 'application_submitted',
            description: 'Application submitted for review',
            performedBy: `user_${userId}`,
            ipAddress: '0.0.0.0', // This would be passed from the request
            userAgent: 'unknown', // This would be passed from the request
            changes: {
                status: { from: existingApplication.status, to: 'submitted' },
                finalReview,
                electronicConsent
            }
        }
    });

    return { submitted: true };
};

/**
 * Get complete application summary
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID for access control
 * @returns {Promise<Object>}
 */
const getApplicationSummary = async (applicationId: string, userId?: number): Promise<any> => {
    const whereClause: any = { id: applicationId };

    // Add user filter if provided (for access control)
    if (userId !== undefined) {
        whereClause.userId = userId;
    }

    const application = await prisma.application.findUnique({
        where: whereClause,
        include: {
            personalInfo: true,
            businessProfile: true,
            financialProfile: true,
            productSelections: {
                include: {
                    product: true
                }
            },
            documents: true,
            kycVerification: true,
            additionalSigners: true,
            riskAssessment: true,
            agreements: {
                include: {
                    disclosure: true
                }
            },
            signatures: true,
            fundingSetup: true
        }
    });

    if (!application) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Application not found');
    }

    return {
        application: {
            id: application.id,
            status: application.status,
            currentStep: application.currentStep,
            accountType: application.accountType,
            customerType: application.customerType,
            applicantId: application.applicantId,
            submittedAt: application.submittedAt,
            completedAt: application.completedAt,
            createdAt: application.createdAt,
            updatedAt: application.updatedAt,
            metadata: application.metadata
        },
        personalInfo: application.personalInfo,
        businessProfile: application.businessProfile,
        financialProfile: application.financialProfile,
        productSelections: application.productSelections,
        documents: application.documents,
        kycVerification: application.kycVerification,
        additionalSigners: application.additionalSigners,
        riskAssessment: application.riskAssessment,
        agreements: application.agreements,
        signatures: application.signatures,
        fundingSetup: application.fundingSetup
    };
};

/**
 * Update personal information for application
 * @param {string} applicationId - Application ID
 * @param {Object} personalInfoData - Personal information data
 * @param {number} userId - User ID for access control
 * @returns {Promise<PersonalInfo>}
 */
const updatePersonalInfo = async (
    applicationId: string,
    personalInfoData: any,
    userId: number
): Promise<Omit<PersonalInfo, 'id' | 'applicationId'>> => {
    // First verify the application exists and user has access
    const existingApplication = await getApplicationById(applicationId, userId);

    // Check if personal info already exists
    const existingPersonalInfo = await prisma.personalInfo.findUnique({
        where: { applicationId }
    });

    let personalInfo;

    if (existingPersonalInfo) {
        // Update existing personal info
        personalInfo = await prisma.personalInfo.update({
            where: { applicationId },
            data: personalInfoData,
            select: {
                firstName: true,
                middleName: true,
                lastName: true,
                suffix: true,
                dateOfBirth: true,
                ssn: true,
                phone: true,
                email: true,
                mailingAddress: true,
                physicalAddress: true,
                employmentStatus: true,
                occupation: true,
                employer: true,
                workPhone: true
            }
        });
    } else {
        // Create new personal info
        personalInfo = await prisma.personalInfo.create({
            data: {
                ...personalInfoData,
                applicationId
            },
            select: {
                firstName: true,
                middleName: true,
                lastName: true,
                suffix: true,
                dateOfBirth: true,
                ssn: true,
                phone: true,
                email: true,
                mailingAddress: true,
                physicalAddress: true,
                employmentStatus: true,
                occupation: true,
                employer: true,
                workPhone: true
            }
        });
    }

    // Update application metadata with lastActivity
    await prisma.application.update({
        where: { id: applicationId },
        data: {
            metadata: {
                ...(existingApplication.metadata as any),
                lastActivity: new Date().toISOString()
            }
        }
    });

    return personalInfo;
};

/**
 * Get personal information for application
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID for access control
 * @returns {Promise<PersonalInfo>}
 */
const getPersonalInfo = async (
    applicationId: string,
    userId: number
): Promise<Omit<PersonalInfo, 'id' | 'applicationId'>> => {
    // First verify the application exists and user has access
    await getApplicationById(applicationId, userId);

    // Get personal info
    const personalInfo = await prisma.personalInfo.findUnique({
        where: { applicationId },
        select: {
            firstName: true,
            middleName: true,
            lastName: true,
            suffix: true,
            dateOfBirth: true,
            ssn: true,
            phone: true,
            email: true,
            mailingAddress: true,
            physicalAddress: true,
            employmentStatus: true,
            occupation: true,
            employer: true,
            workPhone: true
        }
    });

    if (!personalInfo) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Application or personal info not found');
    }

    return personalInfo;
};

/**
 * Update business profile for application
 * @param {string} applicationId - Application ID
 * @param {Object} businessProfileData - Business profile data
 * @param {number} userId - User ID for access control
 * @returns {Promise<BusinessProfile>}
 */
const updateBusinessProfile = async (
    applicationId: string,
    businessProfileData: any,
    userId: number
): Promise<Omit<BusinessProfile, 'id' | 'applicationId'>> => {
    // First verify the application exists and user has access
    const existingApplication = await getApplicationById(applicationId, userId);

    // Check if business profile already exists
    const existingBusinessProfile = await prisma.businessProfile.findUnique({
        where: { applicationId }
    });

    let businessProfile;

    if (existingBusinessProfile) {
        // Update existing business profile
        businessProfile = await prisma.businessProfile.update({
            where: { applicationId },
            data: businessProfileData,
            select: {
                businessName: true,
                dbaName: true,
                ein: true,
                entityType: true,
                industryType: true,
                dateEstablished: true,
                businessAddress: true,
                mailingAddress: true,
                businessPhone: true,
                businessEmail: true,
                website: true,
                description: true,
                isCashIntensive: true,
                monthlyTransactionVolume: true,
                monthlyTransactionCount: true,
                expectedBalance: true
            }
        });
    } else {
        // Create new business profile
        businessProfile = await prisma.businessProfile.create({
            data: {
                ...businessProfileData,
                applicationId
            },
            select: {
                businessName: true,
                dbaName: true,
                ein: true,
                entityType: true,
                industryType: true,
                dateEstablished: true,
                businessAddress: true,
                mailingAddress: true,
                businessPhone: true,
                businessEmail: true,
                website: true,
                description: true,
                isCashIntensive: true,
                monthlyTransactionVolume: true,
                monthlyTransactionCount: true,
                expectedBalance: true
            }
        });
    }

    // Update application metadata with lastActivity
    await prisma.application.update({
        where: { id: applicationId },
        data: {
            metadata: {
                ...(existingApplication.metadata as any),
                lastActivity: new Date().toISOString()
            }
        }
    });

    return businessProfile;
};

/**
 * Get business profile for application
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID for access control
 * @returns {Promise<BusinessProfile>}
 */
const getBusinessProfile = async (
    applicationId: string,
    userId: number
): Promise<Omit<BusinessProfile, 'id' | 'applicationId'>> => {
    // First verify the application exists and user has access
    await getApplicationById(applicationId, userId);

    // Get business profile
    const businessProfile = await prisma.businessProfile.findUnique({
        where: { applicationId },
        select: {
            businessName: true,
            dbaName: true,
            ein: true,
            entityType: true,
            industryType: true,
            dateEstablished: true,
            businessAddress: true,
            mailingAddress: true,
            businessPhone: true,
            businessEmail: true,
            website: true,
            description: true,
            isCashIntensive: true,
            monthlyTransactionVolume: true,
            monthlyTransactionCount: true,
            expectedBalance: true
        }
    });

    if (!businessProfile) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Application or business profile not found');
    }

    return businessProfile;
};

/**
 * Update financial profile for application
 * @param {string} applicationId - Application ID
 * @param {Object} financialProfileData - Financial profile data
 * @param {number} userId - User ID for access control
 * @returns {Promise<FinancialProfile>}
 */
const updateFinancialProfile = async (
    applicationId: string,
    financialProfileData: any,
    userId: number
): Promise<Omit<FinancialProfile, 'id' | 'applicationId'>> => {
    // First verify the application exists and user has access
    const existingApplication = await getApplicationById(applicationId, userId);

    // Check if financial profile already exists
    const existingFinancialProfile = await prisma.financialProfile.findUnique({
        where: { applicationId }
    });

    let financialProfile;

    if (existingFinancialProfile) {
        // Update existing financial profile
        financialProfile = await prisma.financialProfile.update({
            where: { applicationId },
            data: financialProfileData,
            select: {
                annualIncome: true,
                incomeSource: true,
                employmentInfo: true,
                assets: true,
                liabilities: true,
                bankingRelationships: true,
                accountActivities: true
            }
        });
    } else {
        // Create new financial profile
        financialProfile = await prisma.financialProfile.create({
            data: {
                ...financialProfileData,
                applicationId
            },
            select: {
                annualIncome: true,
                incomeSource: true,
                employmentInfo: true,
                assets: true,
                liabilities: true,
                bankingRelationships: true,
                accountActivities: true
            }
        });
    }

    // Update application metadata with lastActivity
    await prisma.application.update({
        where: { id: applicationId },
        data: {
            metadata: {
                ...(existingApplication.metadata as any),
                lastActivity: new Date().toISOString()
            }
        }
    });

    return financialProfile;
};

/**
 * Get financial profile for application
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID for access control
 * @returns {Promise<FinancialProfile>}
 */
const getFinancialProfile = async (
    applicationId: string,
    userId: number
): Promise<Omit<FinancialProfile, 'id' | 'applicationId'>> => {
    // First verify the application exists and user has access
    await getApplicationById(applicationId, userId);

    // Get financial profile
    const financialProfile = await prisma.financialProfile.findUnique({
        where: { applicationId },
        select: {
            annualIncome: true,
            incomeSource: true,
            employmentInfo: true,
            assets: true,
            liabilities: true,
            bankingRelationships: true,
            accountActivities: true
        }
    });

    if (!financialProfile) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Application or financial profile not found');
    }

    return financialProfile;
};

/**
 * Get available products for account opening
 * @param {string} _accountType - Filter by account type (optional, not implemented yet)
 * @returns {Promise<Product[]>}
 */
const getProducts = async (): Promise<Omit<Product, 'productSelections'>[]> => {
    const whereClause: any = {
        isActive: true
    };

    // Note: In a real implementation, you would have eligibility rules
    // that filter products based on accountType. For this implementation,
    // we'll return all active products or filter by a simple rule.

    const products = await prisma.product.findMany({
        where: whereClause,
        select: {
            id: true,
            name: true,
            type: true,
            description: true,
            features: true,
            minimumBalance: true,
            monthlyFee: true,
            interestRate: true,
            isActive: true,
            eligibilityRules: true
        }
    });

    return products;
};

/**
 * Get products eligible for specific application
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID for access control
 * @returns {Promise<Product[]>}
 */
const getEligibleProducts = async (
    applicationId: string,
    userId: number
): Promise<Omit<Product, 'productSelections'>[]> => {
    // First verify the application exists and user has access
    const existingApplication = await getApplicationById(applicationId, userId);

    // Get all active products
    const allProducts = await prisma.product.findMany({
        where: {
            isActive: true
        },
        select: {
            id: true,
            name: true,
            type: true,
            description: true,
            features: true,
            minimumBalance: true,
            monthlyFee: true,
            interestRate: true,
            isActive: true,
            eligibilityRules: true
        }
    });

    // Filter products based on eligibility rules
    const eligibleProducts = allProducts.filter(product => {
        // If no eligibility rules, product is available for all account types
        if (product.eligibilityRules.length === 0) {
            return true;
        }

        // Check if any eligibility rule matches the application
        return (product.eligibilityRules as any[]).some(rule => {
            // Check account type eligibility
            if (rule.accountTypes && rule.accountTypes.length > 0) {
                if (!rule.accountTypes.includes(existingApplication.accountType)) {
                    return false;
                }
            }

            // In a real implementation, you would check other conditions here
            // such as minimum balance requirements, credit score, etc.
            // For now, we'll just check the account type

            return true;
        });
    });

    return eligibleProducts;
};

/**
 * Update product selections for application
 * @param {string} applicationId - Application ID
 * @param {Object[]} selections - Product selections array
 * @param {number} userId - User ID for access control
 * @returns {Promise<ProductSelection[]>}
 */
const updateProductSelections = async (
    applicationId: string,
    selections: Array<{
        productId: string;
        selectedFeatures?: string[];
        initialDeposit?: number;
    }>,
    userId: number
): Promise<
    Array<{
        productId: string;
        product: Pick<Product, 'id' | 'name' | 'type'>;
        selectedFeatures: string[];
        initialDeposit: number | null;
    }>
> => {
    // First verify the application exists and user has access
    const existingApplication = await getApplicationById(applicationId, userId);

    // Validate that all products exist and are active
    for (const selection of selections) {
        const product = await prisma.product.findUnique({
            where: { id: selection.productId }
        });

        if (!product) {
            throw new ApiError(httpStatus.BAD_REQUEST, `Product not found: ${selection.productId}`);
        }

        if (!product.isActive) {
            throw new ApiError(httpStatus.BAD_REQUEST, `Product not available: ${selection.productId}`);
        }

        // Validate selected features exist in product features
        if (selection.selectedFeatures && selection.selectedFeatures.length > 0) {
            const invalidFeatures = selection.selectedFeatures.filter(feature => !product.features.includes(feature));
            if (invalidFeatures.length > 0) {
                throw new ApiError(
                    httpStatus.BAD_REQUEST,
                    `Invalid features for product ${selection.productId}: ${invalidFeatures.join(', ')}`
                );
            }
        }

        // Validate minimum deposit if provided
        if (selection.initialDeposit !== undefined && selection.initialDeposit < product.minimumBalance) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                `Initial deposit must be at least $${product.minimumBalance} for product ${product.name}`
            );
        }
    }

    // Remove existing product selections for this application
    await prisma.productSelection.deleteMany({
        where: { applicationId }
    });

    // Create new product selections
    const createdSelections = [];

    for (const selection of selections) {
        const productSelection = await prisma.productSelection.create({
            data: {
                applicationId,
                productId: selection.productId,
                selectedFeatures: selection.selectedFeatures || [],
                initialDeposit: selection.initialDeposit || null
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        type: true
                    }
                }
            }
        });

        createdSelections.push({
            productId: productSelection.productId,
            product: productSelection.product,
            selectedFeatures: productSelection.selectedFeatures,
            initialDeposit: productSelection.initialDeposit
        });
    }

    // Update application metadata with lastActivity
    await prisma.application.update({
        where: { id: applicationId },
        data: {
            metadata: {
                ...(existingApplication.metadata as any),
                lastActivity: new Date().toISOString()
            }
        }
    });

    return createdSelections;
};

/**
 * Upload document for application
 * @param {string} applicationId - Application ID
 * @param {string} documentType - Type of document
 * @param {Express.Multer.File} file - Uploaded file
 * @param {number} userId - User ID for access control
 * @returns {Promise<Document>}
 */
const uploadDocument = async (
    applicationId: string,
    documentType: string,
    file: Express.Multer.File,
    userId: number
): Promise<
    Pick<
        Document,
        'id' | 'applicationId' | 'type' | 'fileName' | 'fileSize' | 'mimeType' | 'uploadedAt' | 'verificationStatus'
    >
> => {
    // First verify the application exists and user has access
    const existingApplication = await getApplicationById(applicationId, userId);

    // Validate document type
    if (!ALLOWED_DOCUMENT_TYPES.includes(documentType)) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Invalid document type. Allowed types: ${ALLOWED_DOCUMENT_TYPES.join(', ')}`
        );
    }

    try {
        // Create document record
        const document = await prisma.document.create({
            data: {
                applicationId,
                type: documentType,
                fileName: file.filename,
                fileSize: file.size,
                mimeType: file.mimetype,
                verificationStatus: 'pending'
            },
            select: {
                id: true,
                applicationId: true,
                type: true,
                fileName: true,
                fileSize: true,
                mimeType: true,
                uploadedAt: true,
                verificationStatus: true
            }
        });

        // Start verification process asynchronously
        setImmediate(async () => {
            try {
                const filePath = getDocumentPath(file.filename);
                const verificationResult = await mockDocumentVerification(filePath, documentType);

                // Update document with verification results
                await prisma.document.update({
                    where: { id: document.id },
                    data: {
                        verificationStatus: verificationResult.status,
                        verificationDetails: {
                            provider: verificationResult.provider,
                            confidence: verificationResult.confidence,
                            extractedData: verificationResult.extractedData,
                            verificationId: verificationResult.verificationId,
                            verifiedAt: verificationResult.verifiedAt.toISOString(),
                            ...(verificationResult.issues && { issues: verificationResult.issues })
                        }
                    }
                });
            } catch (error) {
                console.error('Document verification failed:', error);
                // Update document status to indicate verification failure
                await prisma.document.update({
                    where: { id: document.id },
                    data: {
                        verificationStatus: 'failed',
                        verificationDetails: {
                            error: 'Verification process failed',
                            failedAt: new Date().toISOString()
                        }
                    }
                });
            }
        });

        // Update application metadata with lastActivity
        await prisma.application.update({
            where: { id: applicationId },
            data: {
                metadata: {
                    ...(existingApplication.metadata as any),
                    lastActivity: new Date().toISOString()
                }
            }
        });

        return document;
    } catch (error) {
        // If database operation fails, clean up the uploaded file
        deleteFile(getDocumentPath(file.filename));
        throw error;
    }
};

/**
 * Get all documents for application
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID for access control
 * @returns {Promise<Document[]>}
 */
const getDocumentsByApplicationId = async (
    applicationId: string,
    userId: number
): Promise<
    Array<
        Pick<
            Document,
            | 'id'
            | 'applicationId'
            | 'type'
            | 'fileName'
            | 'fileSize'
            | 'mimeType'
            | 'uploadedAt'
            | 'verificationStatus'
            | 'verificationDetails'
        >
    >
> => {
    // First verify the application exists and user has access
    await getApplicationById(applicationId, userId);

    const documents = await prisma.document.findMany({
        where: {
            applicationId,
            signerId: null // Only get documents for the main application, not additional signers
        },
        select: {
            id: true,
            applicationId: true,
            type: true,
            fileName: true,
            fileSize: true,
            mimeType: true,
            uploadedAt: true,
            verificationStatus: true,
            verificationDetails: true
        },
        orderBy: {
            uploadedAt: 'desc'
        }
    });

    return documents;
};

/**
 * Delete document by ID
 * @param {string} documentId - Document ID
 * @param {number} userId - User ID for access control
 * @returns {Promise<void>}
 */
const deleteDocumentById = async (documentId: string, userId: number): Promise<void> => {
    // First get the document to check ownership and get file path
    const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
            application: {
                select: {
                    userId: true
                }
            }
        }
    });

    if (!document) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Document not found');
    }

    // Check if user has access to this document
    if (document.application.userId !== userId) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
    }

    // Delete the file from storage
    deleteFile(getDocumentPath(document.fileName));

    // Delete the document record
    await prisma.document.delete({
        where: { id: documentId }
    });
};

/**
 * Initiate KYC verification for application
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID for access control
 * @returns {Promise<KYCVerification>}
 */
const initiateKYCVerification = async (
    applicationId: string,
    userId: number
): Promise<Omit<KYCVerification, 'createdAt' | 'updatedAt'>> => {
    // First verify the application exists and user has access
    const existingApplication = await getApplicationById(applicationId, userId);

    // Check if KYC verification already exists
    const existingKYC = await prisma.kYCVerification.findUnique({
        where: { applicationId }
    });

    if (existingKYC) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'KYC already initiated or application not ready');
    }

    // Get personal information - required for KYC verification
    const personalInfo = await prisma.personalInfo.findUnique({
        where: { applicationId },
        select: {
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            ssn: true,
            phone: true,
            email: true,
            mailingAddress: true
        }
    });

    if (!personalInfo) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'KYC already initiated or application not ready');
    }

    try {
        // Perform KYC verification using mock service
        const kycResult = await mockKYCVerification(personalInfo);

        // Create KYC verification record
        const kycVerification = await prisma.kYCVerification.create({
            data: {
                applicationId,
                status: kycResult.status,
                provider: kycResult.provider,
                verificationId: kycResult.verificationId,
                confidence: kycResult.confidence,
                verifiedAt: kycResult.verifiedAt,
                results: kycResult.results as any
            },
            select: {
                id: true,
                applicationId: true,
                status: true,
                provider: true,
                verificationId: true,
                confidence: true,
                verifiedAt: true,
                results: true
            }
        });

        // Update application metadata with lastActivity
        await prisma.application.update({
            where: { id: applicationId },
            data: {
                metadata: {
                    ...(existingApplication.metadata as any),
                    lastActivity: new Date().toISOString()
                }
            }
        });

        // Create audit trail entry
        await prisma.auditTrailEntry.create({
            data: {
                applicationId,
                action: 'kyc_verification_initiated',
                description: `KYC verification initiated with status: ${kycResult.status}`,
                performedBy: `user_${userId}`,
                ipAddress: '0.0.0.0', // This would be passed from the request
                userAgent: 'unknown', // This would be passed from the request
                changes: {
                    kycStatus: { from: null, to: kycResult.status },
                    provider: kycResult.provider,
                    confidence: kycResult.confidence
                }
            }
        });

        return kycVerification;
    } catch (error) {
        console.error('KYC verification failed:', error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'KYC verification failed');
    }
};

/**
 * Get KYC verification status for application
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID for access control
 * @returns {Promise<KYCVerification>}
 */
const getKYCVerificationStatus = async (
    applicationId: string,
    userId: number
): Promise<Omit<KYCVerification, 'createdAt' | 'updatedAt'>> => {
    // First verify the application exists and user has access
    await getApplicationById(applicationId, userId);

    // Get KYC verification record
    const kycVerification = await prisma.kYCVerification.findUnique({
        where: { applicationId },
        select: {
            id: true,
            applicationId: true,
            status: true,
            provider: true,
            verificationId: true,
            confidence: true,
            verifiedAt: true,
            results: true
        }
    });

    if (!kycVerification) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Application or KYC verification not found');
    }

    return kycVerification;
};

/**
 * Perform risk assessment for application
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID for access control
 * @returns {Promise<RiskAssessment>}
 */
const performRiskAssessment = async (
    applicationId: string,
    userId: number
): Promise<Omit<RiskAssessment, 'createdAt' | 'updatedAt'>> => {
    // First verify the application exists and user has access
    const existingApplication = await getApplicationById(applicationId, userId);

    // Check if risk assessment already exists
    const existingRiskAssessment = await prisma.riskAssessment.findUnique({
        where: { applicationId }
    });

    if (existingRiskAssessment) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Risk assessment already performed or application not ready');
    }

    // Gather comprehensive application data for risk assessment
    const applicationData = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
            personalInfo: true,
            businessProfile: true,
            financialProfile: true,
            kycVerification: true,
            documents: {
                select: {
                    type: true,
                    verificationStatus: true,
                    verificationDetails: true
                }
            },
            additionalSigners: {
                select: {
                    personalInfo: true,
                    role: true,
                    kycStatus: true,
                    beneficialOwnershipPercentage: true
                }
            }
        }
    });

    if (!applicationData) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Application not found');
    }

    // Check if application has sufficient data for assessment
    if (!applicationData.personalInfo) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Risk assessment already performed or application not ready');
    }

    // For business accounts, require business profile
    if (applicationData.accountType !== 'consumer' && !applicationData.businessProfile) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Risk assessment already performed or application not ready');
    }

    try {
        // Prepare data for risk assessment engine
        const riskAssessmentData = {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            personalInfo: applicationData.personalInfo
                ? {
                      firstName: applicationData.personalInfo.firstName,
                      lastName: applicationData.personalInfo.lastName,
                      dateOfBirth: applicationData.personalInfo.dateOfBirth,
                      ssn: applicationData.personalInfo.ssn,
                      phone: applicationData.personalInfo.phone,
                      email: applicationData.personalInfo.email,
                      mailingAddress: applicationData.personalInfo.mailingAddress,
                      physicalAddress: applicationData.personalInfo.physicalAddress,
                      employmentStatus: applicationData.personalInfo.employmentStatus,
                      occupation: applicationData.personalInfo.occupation,
                      employer: applicationData.personalInfo.employer
                  }
                : undefined,
            businessProfile: applicationData.businessProfile
                ? {
                      businessName: applicationData.businessProfile.businessName,
                      ein: applicationData.businessProfile.ein,
                      entityType: applicationData.businessProfile.entityType,
                      industryType: applicationData.businessProfile.industryType,
                      dateEstablished: applicationData.businessProfile.dateEstablished,
                      businessAddress: applicationData.businessProfile.businessAddress,
                      isCashIntensive: applicationData.businessProfile.isCashIntensive,
                      monthlyTransactionVolume: applicationData.businessProfile.monthlyTransactionVolume,
                      monthlyTransactionCount: applicationData.businessProfile.monthlyTransactionCount,
                      expectedBalance: applicationData.businessProfile.expectedBalance
                  }
                : undefined,
            financialProfile: applicationData.financialProfile
                ? {
                      annualIncome: applicationData.financialProfile.annualIncome,
                      incomeSource: applicationData.financialProfile.incomeSource,
                      assets: applicationData.financialProfile.assets,
                      liabilities: applicationData.financialProfile.liabilities,
                      bankingRelationships: applicationData.financialProfile.bankingRelationships as any[],
                      accountActivities: applicationData.financialProfile.accountActivities as any[]
                  }
                : undefined,
            kycVerification: applicationData.kycVerification
                ? {
                      status: applicationData.kycVerification.status,
                      confidence: applicationData.kycVerification.confidence,
                      results: applicationData.kycVerification.results
                  }
                : undefined,
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            documents: applicationData.documents || [],
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            additionalSigners: applicationData.additionalSigners || [],
            accountType: applicationData.accountType
        };

        // Perform risk assessment
        const riskAssessmentResult = RiskAssessmentEngine.assessRisk(
            applicationId,
            riskAssessmentData,
            `user_${userId}`
        );

        // Create risk assessment record
        const riskAssessment = await prisma.riskAssessment.create({
            data: {
                applicationId,
                overallRisk: riskAssessmentResult.overallRisk,
                riskScore: riskAssessmentResult.riskScore,
                factors: riskAssessmentResult.factors as any[],
                recommendations: riskAssessmentResult.recommendations,
                requiresManualReview: riskAssessmentResult.requiresManualReview,
                assessedBy: riskAssessmentResult.assessedBy
            },
            select: {
                id: true,
                applicationId: true,
                overallRisk: true,
                riskScore: true,
                factors: true,
                recommendations: true,
                requiresManualReview: true,
                assessedAt: true,
                assessedBy: true
            }
        });

        // Update application metadata with lastActivity
        await prisma.application.update({
            where: { id: applicationId },
            data: {
                metadata: {
                    ...(existingApplication.metadata as any),
                    lastActivity: new Date().toISOString()
                }
            }
        });

        // Create audit trail entry
        await prisma.auditTrailEntry.create({
            data: {
                applicationId,
                action: 'risk_assessment_performed',
                description: `Risk assessment completed with ${riskAssessmentResult.overallRisk} risk level and score of ${riskAssessmentResult.riskScore}`,
                performedBy: `user_${userId}`,
                ipAddress: '0.0.0.0', // This would be passed from the request
                userAgent: 'unknown', // This would be passed from the request
                changes: {
                    riskLevel: { from: null, to: riskAssessmentResult.overallRisk },
                    riskScore: { from: null, to: riskAssessmentResult.riskScore },
                    requiresManualReview: riskAssessmentResult.requiresManualReview,
                    factorCount: riskAssessmentResult.factors.length
                }
            }
        });

        return riskAssessment;
    } catch (error) {
        console.error('Risk assessment failed:', error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Risk assessment failed');
    }
};

/**
 * Get required disclosures for account type
 * @param {string} accountType - Type of account (consumer, business, commercial)
 * @returns {Promise<Disclosure[]>}
 */
const getDisclosures = async (
    accountType: string
): Promise<
    Array<
        Pick<
            Disclosure,
            'id' | 'type' | 'title' | 'content' | 'version' | 'effectiveDate' | 'required' | 'applicableFor'
        >
    >
> => {
    const disclosures = await prisma.disclosure.findMany({
        where: {
            applicableFor: {
                has: accountType
            }
        },
        select: {
            id: true,
            type: true,
            title: true,
            content: true,
            version: true,
            effectiveDate: true,
            required: true,
            applicableFor: true
        },
        orderBy: [
            { required: 'desc' }, // Required first
            { type: 'asc' }
        ]
    });

    return disclosures;
};

/**
 * Acknowledge agreement/disclosure
 * @param {string} applicationId - Application ID
 * @param {string} disclosureId - Disclosure ID
 * @param {string} ipAddress - Client IP address
 * @param {string} userAgent - Client user agent
 * @param {number} userId - User ID for access control
 * @returns {Promise<Agreement>}
 */
const acknowledgeAgreement = async (
    applicationId: string,
    disclosureId: string,
    ipAddress: string,
    userAgent: string,
    userId: number
): Promise<
    Pick<
        Agreement,
        'id' | 'applicationId' | 'disclosureId' | 'acknowledged' | 'acknowledgedAt' | 'ipAddress' | 'userAgent'
    >
> => {
    // First verify the application exists and user has access
    const existingApplication = await getApplicationById(applicationId, userId);

    // Verify the disclosure exists
    const disclosure = await prisma.disclosure.findUnique({
        where: { id: disclosureId },
        select: { id: true, type: true, title: true, applicableFor: true }
    });

    if (!disclosure) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Application or disclosure not found');
    }

    // Check if disclosure is applicable for the account type
    if (!disclosure.applicableFor.includes(existingApplication.accountType)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Disclosure not applicable for this account type');
    }

    // Check if agreement already exists
    const existingAgreement = await prisma.agreement.findFirst({
        where: {
            applicationId,
            disclosureId
        }
    });

    if (existingAgreement && existingAgreement.acknowledged) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Agreement already acknowledged');
    }

    let agreement;

    if (existingAgreement) {
        // Update existing agreement
        agreement = await prisma.agreement.update({
            where: { id: existingAgreement.id },
            data: {
                acknowledged: true,
                acknowledgedAt: new Date(),
                ipAddress,
                userAgent
            },
            select: {
                id: true,
                applicationId: true,
                disclosureId: true,
                acknowledged: true,
                acknowledgedAt: true,
                ipAddress: true,
                userAgent: true
            }
        });
    } else {
        // Create new agreement
        agreement = await prisma.agreement.create({
            data: {
                applicationId,
                disclosureId,
                acknowledged: true,
                acknowledgedAt: new Date(),
                ipAddress,
                userAgent
            },
            select: {
                id: true,
                applicationId: true,
                disclosureId: true,
                acknowledged: true,
                acknowledgedAt: true,
                ipAddress: true,
                userAgent: true
            }
        });
    }

    // Update application metadata with lastActivity
    await prisma.application.update({
        where: { id: applicationId },
        data: {
            metadata: {
                ...(existingApplication.metadata as any),
                lastActivity: new Date().toISOString()
            }
        }
    });

    // Create audit trail entry
    await prisma.auditTrailEntry.create({
        data: {
            applicationId,
            action: 'agreement_acknowledged',
            description: `Agreement acknowledged for disclosure: ${disclosure.title}`,
            performedBy: `user_${userId}`,
            ipAddress,
            userAgent,
            changes: {
                disclosureId,
                disclosureType: disclosure.type,
                acknowledgedAt: agreement.acknowledgedAt?.toISOString()
            }
        }
    });

    return agreement;
};

/**
 * Capture electronic signature for application
 * @param {string} applicationId - Application ID
 * @param {string} signatureData - Base64 encoded signature image data
 * @param {string} documentType - Type of document being signed
 * @param {string} ipAddress - Client IP address
 * @param {string} userAgent - Client user agent
 * @param {number} userId - User ID for access control
 * @param {Object} biometric - Optional biometric data
 * @returns {Promise<ElectronicSignature>}
 */
const captureElectronicSignature = async (
    applicationId: string,
    signatureData: string,
    documentType: string,
    ipAddress: string,
    userAgent: string,
    userId: number,
    biometric?: any
): Promise<
    Pick<
        ElectronicSignature,
        'id' | 'applicationId' | 'signerId' | 'documentType' | 'signatureData' | 'signedAt' | 'ipAddress' | 'userAgent'
    >
> => {
    // First verify the application exists and user has access
    const existingApplication = await getApplicationById(applicationId, userId);

    // Validate signature data format (must be base64 image data)
    const base64ImagePattern = /^data:image\/(png|jpeg|jpg|gif|svg\+xml);base64,/;
    if (!base64ImagePattern.test(signatureData)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid signature data');
    }

    // Validate document type for signing
    const validDocumentTypes = [
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
    ];

    if (!validDocumentTypes.includes(documentType)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid signature data');
    }

    // Determine signer ID (primary_signer for main applicant, generated ID for additional signers)
    let signerId = 'primary_signer';

    // In a real implementation, you might need to determine if this is an additional signer
    // For now, we'll assume it's the primary applicant signing

    try {
        // Create electronic signature record
        const electronicSignature = await prisma.electronicSignature.create({
            data: {
                applicationId,
                signerId,
                documentType,
                signatureData,
                ipAddress,
                userAgent,
                biometric: biometric || null
            },
            select: {
                id: true,
                applicationId: true,
                signerId: true,
                documentType: true,
                signatureData: true,
                signedAt: true,
                ipAddress: true,
                userAgent: true
            }
        });

        // Update application metadata with lastActivity
        await prisma.application.update({
            where: { id: applicationId },
            data: {
                metadata: {
                    ...(existingApplication.metadata as any),
                    lastActivity: new Date().toISOString()
                }
            }
        });

        // Create audit trail entry
        await prisma.auditTrailEntry.create({
            data: {
                applicationId,
                action: 'electronic_signature_captured',
                description: `Electronic signature captured for document: ${documentType}`,
                performedBy: `user_${userId}`,
                ipAddress,
                userAgent,
                changes: {
                    documentType,
                    signerId,
                    signedAt: electronicSignature.signedAt.toISOString(),
                    biometricDataPresent: !!biometric
                }
            }
        });

        return electronicSignature;
    } catch (error) {
        console.error('Electronic signature capture failed:', error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to capture electronic signature');
    }
};

/**
 * Setup account funding method
 * @param {string} applicationId - Application ID
 * @param {string} method - Funding method (ach, check, wire_transfer, cash)
 * @param {number} amount - Funding amount
 * @param {Object} details - Method-specific details
 * @param {number} userId - User ID for access control
 * @returns {Promise<FundingSetup>}
 */
const setupAccountFunding = async (
    applicationId: string,
    method: string,
    amount: number,
    details: any,
    userId: number
): Promise<Pick<FundingSetup, 'id' | 'applicationId' | 'method' | 'amount' | 'status' | 'details' | 'createdAt'>> => {
    // First verify the application exists and user has access
    const existingApplication = await getApplicationById(applicationId, userId);

    // Check if funding setup already exists
    const existingFunding = await prisma.fundingSetup.findUnique({
        where: { applicationId }
    });

    if (existingFunding) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid funding information');
    }

    // Validate funding method
    const validFundingMethods = ['ach', 'check', 'wire_transfer', 'cash'];
    if (!validFundingMethods.includes(method)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid funding information');
    }

    // Validate minimum deposit amount - basic validation (can be enhanced with product-specific requirements)
    if (amount <= 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid funding information');
    }

    // Validate method-specific details
    validateFundingDetails(method, details, amount);

    try {
        // Create funding setup record
        const fundingSetup = await prisma.fundingSetup.create({
            data: {
                applicationId,
                method,
                amount,
                status: 'pending',
                details: details as any
            },
            select: {
                id: true,
                applicationId: true,
                method: true,
                amount: true,
                status: true,
                details: true,
                createdAt: true
            }
        });

        // Update application metadata with lastActivity
        await prisma.application.update({
            where: { id: applicationId },
            data: {
                metadata: {
                    ...(existingApplication.metadata as any),
                    lastActivity: new Date().toISOString()
                }
            }
        });

        // Create audit trail entry
        await prisma.auditTrailEntry.create({
            data: {
                applicationId,
                action: 'funding_setup_created',
                description: `Account funding setup created with ${method} method for $${amount}`,
                performedBy: `user_${userId}`,
                ipAddress: '0.0.0.0', // This would be passed from the request
                userAgent: 'unknown', // This would be passed from the request
                changes: {
                    fundingMethod: { from: null, to: method },
                    amount: { from: null, to: amount },
                    status: { from: null, to: 'pending' }
                }
            }
        });

        return fundingSetup;
    } catch (error) {
        console.error('Account funding setup failed:', error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Account funding setup failed');
    }
};

/**
 * Validate funding method-specific details
 * @param {string} method - Funding method
 * @param {Object} details - Method-specific details
 * @param {number} amount - Funding amount
 * @returns {void}
 */
const validateFundingDetails = (method: string, details: any, amount: number): void => {
    // Basic minimum deposit validation - typically $25-$100 minimum
    const minDeposit = 25;
    if (amount < minDeposit) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Invalid funding information`);
    }

    switch (method) {
        case 'ach':
            if (!details.bankName || typeof details.bankName !== 'string') {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid funding information');
            }
            if (!details.accountNumber || typeof details.accountNumber !== 'string') {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid funding information');
            }
            if (!details.routingNumber || typeof details.routingNumber !== 'string') {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid funding information');
            }
            if (!details.accountType || !['checking', 'savings'].includes(details.accountType)) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid funding information');
            }

            // Basic routing number validation (9 digits)
            if (!/^\d{9}$/.test(details.routingNumber)) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid funding information');
            }

            // Basic account number validation (minimum length)
            if (details.accountNumber.length < 4 || details.accountNumber.length > 20) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid funding information');
            }
            break;

        case 'check':
            if (!details.checkNumber || typeof details.checkNumber !== 'string') {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid funding information');
            }
            if (!details.bankName || typeof details.bankName !== 'string') {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid funding information');
            }
            if (!details.checkAmount || typeof details.checkAmount !== 'number' || details.checkAmount !== amount) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid funding information');
            }
            break;

        case 'wire_transfer':
            if (!details.senderBank || typeof details.senderBank !== 'string') {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid funding information');
            }
            if (!details.senderAccountNumber || typeof details.senderAccountNumber !== 'string') {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid funding information');
            }
            if (!details.wireAmount || typeof details.wireAmount !== 'number' || details.wireAmount !== amount) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid funding information');
            }

            // Wire transfers often have higher minimums
            const minWireAmount = 100;
            if (amount < minWireAmount) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid funding information');
            }
            break;

        case 'cash':
            if (!details.branchLocation || typeof details.branchLocation !== 'string') {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid funding information');
            }
            if (!details.cashAmount || typeof details.cashAmount !== 'number' || details.cashAmount !== amount) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid funding information');
            }

            // Cash deposits often have daily limits
            const maxCashAmount = 10000;
            if (amount > maxCashAmount) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid funding information');
            }
            break;

        default:
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid funding information');
    }
};

/**
 * Get all applications for admin review with filtering (Admin only)
 * @param {Object} filters - Filtering options
 * @returns {Promise<Array>}
 */
const getAdminApplications = async (filters: {
    status?: string[];
    accountType?: string[];
    riskLevel?: string[];
    dateFrom?: string;
    dateTo?: string;
    search?: string;
}): Promise<
    Array<{
        id: string;
        applicantName: string;
        accountType: string;
        status: string;
        currentStep: string;
        riskLevel: string;
        submittedAt: Date | null;
        lastActivity: string;
        assignedTo: string | null;
    }>
> => {
    try {
        const where: any = {};

        // Apply filters
        if (filters.status && filters.status.length > 0) {
            where.status = { in: filters.status };
        }

        if (filters.accountType && filters.accountType.length > 0) {
            where.accountType = { in: filters.accountType };
        }

        // Date range filter
        if (filters.dateFrom || filters.dateTo) {
            where.submittedAt = {};
            if (filters.dateFrom) {
                where.submittedAt.gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                where.submittedAt.lte = new Date(filters.dateTo);
            }
        }

        // Search filter (search by applicant name or application ID)
        if (filters.search) {
            where.OR = [
                { id: { contains: filters.search, mode: 'insensitive' } },
                { applicantId: { contains: filters.search, mode: 'insensitive' } },
                {
                    personalInfo: {
                        OR: [
                            { firstName: { contains: filters.search, mode: 'insensitive' } },
                            { lastName: { contains: filters.search, mode: 'insensitive' } },
                            { email: { contains: filters.search, mode: 'insensitive' } }
                        ]
                    }
                },
                {
                    businessProfile: {
                        businessName: { contains: filters.search, mode: 'insensitive' }
                    }
                }
            ];
        }

        const applications = await prisma.application.findMany({
            where,
            select: {
                id: true,
                accountType: true,
                status: true,
                currentStep: true,
                submittedAt: true,
                metadata: true,
                personalInfo: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                },
                businessProfile: {
                    select: {
                        businessName: true
                    }
                },
                riskAssessment: {
                    select: {
                        overallRisk: true
                    }
                }
            },
            orderBy: {
                submittedAt: 'desc'
            }
        });

        // Apply risk level filter if provided
        let filteredApplications = applications;
        if (filters.riskLevel && filters.riskLevel.length > 0) {
            filteredApplications = applications.filter(
                app => app.riskAssessment && filters.riskLevel!.includes(app.riskAssessment.overallRisk)
            );
        }

        // Transform to match API specification
        return filteredApplications.map(app => ({
            id: app.id,
            applicantName:
                app.businessProfile?.businessName ||
                (app.personalInfo ? `${app.personalInfo.firstName} ${app.personalInfo.lastName}` : 'Unknown'),
            accountType: app.accountType,
            status: app.status,
            currentStep: app.currentStep,
            riskLevel: app.riskAssessment?.overallRisk || 'pending',
            submittedAt: app.submittedAt,
            lastActivity:
                (app.metadata as any)?.lastActivity || app.submittedAt?.toISOString() || new Date().toISOString(),
            assignedTo: null // Could be extended to include assignment logic
        }));
    } catch (error) {
        console.error('Failed to get admin applications:', error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve applications');
    }
};

/**
 * Update application status (Admin only)
 * @param {string} applicationId - Application ID
 * @param {string} status - New status
 * @param {string} notes - Optional admin notes
 * @param {string} adminUserId - ID of admin user performing the action
 * @param {string} ipAddress - IP address
 * @param {string} userAgent - User agent
 * @returns {Promise<Object>}
 */
const updateApplicationStatus = async (
    applicationId: string,
    status: string,
    notes: string | undefined,
    adminUserId: string,
    ipAddress: string,
    userAgent: string
): Promise<{
    id: string;
    status: string;
    currentStep: string;
    accountType: string;
    customerType: string;
    applicantId: string;
    submittedAt: Date | null;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    metadata: any;
}> => {
    try {
        // Check if application exists
        const existingApplication = await prisma.application.findUnique({
            where: { id: applicationId },
            select: { status: true, currentStep: true }
        });

        if (!existingApplication) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Application not found');
        }

        // Validate status transition (basic validation)
        const validStatusTransitions: Record<string, string[]> = {
            draft: ['in_progress', 'rejected'],
            in_progress: ['submitted', 'rejected'],
            submitted: ['under_review', 'rejected'],
            under_review: ['approved', 'rejected'],
            approved: ['completed'],
            rejected: [], // No transitions from rejected
            completed: [] // No transitions from completed
        };

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const allowedTransitions = validStatusTransitions[existingApplication.status] || [];
        if (allowedTransitions.length > 0 && !allowedTransitions.includes(status)) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid status transition');
        }

        const updateData: any = {
            status,
            updatedAt: new Date()
        };

        // Update current step based on status
        if (status === 'approved') {
            updateData.currentStep = 'confirmation';
        } else if (status === 'completed') {
            updateData.completedAt = new Date();
        }

        const updatedApplication = await prisma.application.update({
            where: { id: applicationId },
            data: updateData,
            select: {
                id: true,
                status: true,
                currentStep: true,
                accountType: true,
                customerType: true,
                applicantId: true,
                submittedAt: true,
                completedAt: true,
                createdAt: true,
                updatedAt: true,
                metadata: true
            }
        });

        // Create audit trail entry
        await prisma.auditTrailEntry.create({
            data: {
                applicationId,
                action: 'status_updated',
                description: `Application status updated from ${existingApplication.status} to ${status}${notes ? ` - Notes: ${notes}` : ''}`,
                performedBy: `admin_${adminUserId}`,
                ipAddress,
                userAgent,
                changes: {
                    status: {
                        from: existingApplication.status,
                        to: status
                    },
                    ...(notes && { notes })
                }
            }
        });

        return updatedApplication;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        console.error('Failed to update application status:', error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update application status');
    }
};

/**
 * Get audit trail for application (Admin only)
 * @param {string} applicationId - Application ID
 * @returns {Promise<Array>}
 */
const getApplicationAudit = async (
    applicationId: string
): Promise<
    Array<{
        id: string;
        applicationId: string;
        action: string;
        description: string;
        performedBy: string;
        performedAt: Date;
        ipAddress: string;
        userAgent: string;
        changes: any;
    }>
> => {
    try {
        // Check if application exists
        const applicationExists = await prisma.application.findUnique({
            where: { id: applicationId },
            select: { id: true }
        });

        if (!applicationExists) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Application not found');
        }

        const auditEntries = await prisma.auditTrailEntry.findMany({
            where: { applicationId },
            orderBy: { performedAt: 'desc' }
        });

        return auditEntries;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        console.error('Failed to get application audit:', error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve audit trail');
    }
};

export default {
    createApplication,
    getApplicationById,
    updateApplicationById,
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
    getDocumentsByApplicationId,
    deleteDocumentById,
    initiateKYCVerification,
    getKYCVerificationStatus,
    performRiskAssessment,
    getDisclosures,
    acknowledgeAgreement,
    captureElectronicSignature,
    setupAccountFunding,
    // Admin functions
    getAdminApplications,
    updateApplicationStatus,
    getApplicationAudit
};
