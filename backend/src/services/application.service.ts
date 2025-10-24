import prisma from '../client.ts';
import { Application } from '../generated/prisma/index.js';
import ApiError from '../utils/ApiError.ts';
import { getRandomString } from '../utils/string.ts';
import httpStatus from 'http-status';

/**
 * Generate a unique applicant ID
 * @returns {string}
 */
const generateApplicantId = (): string => {
    return `applicant_${getRandomString('alphanumeric', 8)}`;
};

/**
 * Create a new application
 * @param {number} userId - User ID creating the application
 * @param {string} accountType - Type of account (consumer/business)
 * @param {Object} metadata - Additional metadata (userAgent, ipAddress, etc.)
 * @returns {Promise<Application>}
 */
const createApplication = async (
    userId: number,
    accountType: string,
    metadata: {
        userAgent?: string;
        ipAddress?: string;
        sessionId?: string;
        source?: string;
    } = {}
): Promise<Application> => {
    const applicantId = generateApplicantId();
    const now = new Date();

    return prisma.application.create({
        data: {
            accountType,
            applicantId,
            userId,
            userAgent: metadata.userAgent,
            ipAddress: metadata.ipAddress,
            sessionId: metadata.sessionId,
            source: metadata.source || 'web_portal',
            startedAt: now,
            lastActivity: now
        }
    });
};

/**
 * Query applications with filtering and pagination
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @returns {Promise<Application[]>}
 */
const queryApplications = async <Key extends keyof Application>(
    filter: object,
    options: {
        limit?: number;
        page?: number;
        sortBy?: string;
        sortType?: 'asc' | 'desc';
    },
    keys: Key[] = [
        'id',
        'status',
        'currentStep',
        'accountType',
        'customerType',
        'applicantId',
        'submittedAt',
        'completedAt',
        'createdAt',
        'updatedAt'
    ] as Key[]
): Promise<Pick<Application, Key>[]> => {
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const sortBy = options.sortBy;
    const sortType = options.sortType ?? 'desc';

    const applications = await prisma.application.findMany({
        where: filter,
        select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
        skip: (page - 1) * limit,
        take: limit,
        orderBy: sortBy ? { [sortBy]: sortType } : { createdAt: 'desc' }
    });

    return applications as Pick<Application, Key>[];
};

/**
 * Get application by ID
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID (for ownership validation)
 * @param {Array<Key>} keys - Fields to select
 * @returns {Promise<Pick<Application, Key> | null>}
 */
const getApplicationById = async <Key extends keyof Application>(
    applicationId: string,
    userId?: number,
    keys: Key[] = [
        'id',
        'status',
        'currentStep',
        'accountType',
        'customerType',
        'applicantId',
        'submittedAt',
        'completedAt',
        'createdAt',
        'updatedAt',
        'userAgent',
        'ipAddress',
        'sessionId',
        'startedAt',
        'lastActivity',
        'source',
        'userId'
    ] as Key[]
): Promise<Pick<Application, Key> | null> => {
    // For userId filtering, we need to first check if application exists and belongs to user
    if (userId !== undefined) {
        const application = await prisma.application.findFirst({
            where: {
                id: applicationId,
                userId: userId
            },
            select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
        });
        return application as Pick<Application, Key> | null;
    }

    // For admin access (no userId filtering)
    const application = await prisma.application.findUnique({
        where: { id: applicationId },
        select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
    });
    return application as Pick<Application, Key> | null;
};

/**
 * Get comprehensive application summary with all related data
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID (for ownership validation)
 * @returns {Promise<Object>}
 */
const getApplicationSummary = async (applicationId: string, userId?: number) => {
    // For userId filtering, we need to use findFirst with where conditions
    const whereCondition = userId !== undefined 
        ? { id: applicationId, userId: userId }
        : { id: applicationId };

    const application = await prisma.application.findFirst({
        where: whereCondition,
        include: {
            personalInfo: true,
            businessProfile: true,
            financialProfile: {
                include: {
                    bankingRelationships: true,
                    accountActivities: true
                }
            },
            productSelections: {
                include: {
                    product: true
                }
            },
            documents: true,
            kycVerification: true,
            additionalSigners: true,
            riskAssessment: {
                include: {
                    factors: true
                }
            },
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
        return null;
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
            updatedAt: application.updatedAt
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
 * Update application by ID
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID (for ownership validation)
 * @param {Object} updateData - Data to update
 * @returns {Promise<Application>}
 */
const updateApplicationById = async (
    applicationId: string,
    userId: number,
    updateData: {
        currentStep?: string;
        status?: string;
        accountType?: string;
        customerType?: string;
        lastActivity?: Date;
    }
): Promise<Application> => {
    const application = await getApplicationById(applicationId, userId, ['id', 'userId']);
    if (!application) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Application not found');
    }

    const updatedApplication = await prisma.application.update({
        where: { id: applicationId },
        data: {
            ...updateData,
            lastActivity: new Date()
        }
    });

    return updatedApplication;
};

/**
 * Submit application for review
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID (for ownership validation)
 * @param {Object} submissionData - Submission metadata
 * @returns {Promise<Object>}
 */
const submitApplication = async (
    applicationId: string,
    userId: number,
    submissionData: {
        finalReview: boolean;
        electronicConsent: boolean;
    }
): Promise<{ submitted: boolean; applicationId: string; message: string }> => {
    const application = await getApplicationById(applicationId, userId, ['id', 'status', 'currentStep']);
    if (!application) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Application not found');
    }

    // Validate submission requirements
    if (!submissionData.finalReview || !submissionData.electronicConsent) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Final review and electronic consent are required for submission'
        );
    }

    // Check if application is ready for submission
    if (application.status === 'submitted' || application.status === 'approved' || application.status === 'rejected') {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Application cannot be submitted. Current status: ${application.status}`
        );
    }

    // Update application status
    await prisma.application.update({
        where: { id: applicationId },
        data: {
            status: 'submitted',
            currentStep: 'review',
            submittedAt: new Date(),
            lastActivity: new Date()
        }
    });

    return {
        submitted: true,
        applicationId,
        message: 'Application submitted successfully'
    };
};

/**
 * Delete application by ID (for drafts only)
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID (for ownership validation)
 * @returns {Promise<Application>}
 */
const deleteApplicationById = async (applicationId: string, userId: number): Promise<Application> => {
    const application = await getApplicationById(applicationId, userId, ['id', 'status', 'userId']);
    if (!application) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Application not found');
    }

    // Only allow deletion of draft applications
    if (application.status !== 'draft') {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Only draft applications can be deleted'
        );
    }

    // Delete the application (cascade will handle related records)
    const deletedApplication = await prisma.application.delete({
        where: { id: applicationId }
    });

    return deletedApplication;
};

export default {
    createApplication,
    queryApplications,
    getApplicationById,
    getApplicationSummary,
    updateApplicationById,
    submitApplication,
    deleteApplicationById
};