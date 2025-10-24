import prisma from '../client.ts';
import { FinancialProfile, BankingRelationship, AccountActivity } from '../generated/prisma/index.js';
import ApiError from '../utils/ApiError.ts';
import httpStatus from 'http-status';

/**
 * Create or update financial profile for an application
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID (for ownership validation)
 * @param {Object} financialData - Financial profile data
 * @returns {Promise<FinancialProfile>}
 */
const createOrUpdateFinancialProfile = async (
    applicationId: string,
    userId: number,
    financialData: {
        annualIncome: number;
        incomeSource: string[];
        employmentInfo?: any;
        assets: number;
        liabilities: number;
        bankingRelationships: Array<{
            bankName: string;
            accountTypes: string[];
            yearsWithBank: number;
        }>;
        accountActivities: Array<{
            activity: string;
            frequency: string;
            amount: number;
        }>;
    }
): Promise<FinancialProfile & { bankingRelationships: BankingRelationship[], accountActivities: AccountActivity[] }> => {
    // First, verify that the application exists and belongs to the user
    const application = await prisma.application.findFirst({
        where: {
            id: applicationId,
            userId: userId
        }
    });

    if (!application) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Application not found');
    }

    // Validate required fields
    if (financialData.annualIncome < 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Annual income must be non-negative');
    }

    if (financialData.assets < 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Assets must be non-negative');
    }

    if (financialData.liabilities < 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Liabilities must be non-negative');
    }

    // Validate income sources
    const validIncomeSources = [
        'employment',
        'self-employment',
        'business',
        'investment',
        'retirement',
        'disability',
        'social_security',
        'other'
    ];

    if (!financialData.incomeSource || financialData.incomeSource.length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'At least one income source is required');
    }

    const invalidSources = financialData.incomeSource.filter(source => 
        !validIncomeSources.includes(source)
    );

    if (invalidSources.length > 0) {
        throw new ApiError(
            httpStatus.BAD_REQUEST, 
            `Invalid income sources: ${invalidSources.join(', ')}`
        );
    }

    // Validate banking relationships
    if (!financialData.bankingRelationships || financialData.bankingRelationships.length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'At least one banking relationship is required');
    }

    for (const relationship of financialData.bankingRelationships) {
        if (!relationship.bankName || relationship.bankName.trim().length === 0) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Bank name is required for all banking relationships');
        }
        if (!relationship.accountTypes || relationship.accountTypes.length === 0) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'At least one account type is required for each banking relationship');
        }
        if (relationship.yearsWithBank < 0 || relationship.yearsWithBank > 100) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Years with bank must be between 0 and 100');
        }
    }

    // Validate account activities
    if (!financialData.accountActivities || financialData.accountActivities.length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'At least one account activity is required');
    }

    const validFrequencies = ['daily', 'weekly', 'monthly', 'quarterly', 'annually', 'as_needed'];

    for (const activity of financialData.accountActivities) {
        if (!activity.activity || activity.activity.trim().length === 0) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Activity description is required for all account activities');
        }
        if (!validFrequencies.includes(activity.frequency)) {
            throw new ApiError(
                httpStatus.BAD_REQUEST, 
                `Invalid frequency: ${activity.frequency}. Must be one of: ${validFrequencies.join(', ')}`
            );
        }
        if (activity.amount < 0) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Activity amount must be non-negative');
        }
    }

    // Validate reasonable financial amounts (basic sanity checks)
    if (financialData.annualIncome > 10000000) { // $10M cap for validation
        throw new ApiError(httpStatus.BAD_REQUEST, 'Annual income exceeds reasonable limit');
    }
    if (financialData.assets > 100000000) { // $100M cap for validation
        throw new ApiError(httpStatus.BAD_REQUEST, 'Assets exceed reasonable limit');
    }
    if (financialData.liabilities > 100000000) { // $100M cap for validation
        throw new ApiError(httpStatus.BAD_REQUEST, 'Liabilities exceed reasonable limit');
    }

    // Use a transaction to ensure data consistency
    return await prisma.$transaction(async (tx) => {
        // Create or update the financial profile
        const financialProfile = await tx.financialProfile.upsert({
            where: {
                applicationId: applicationId
            },
            update: {
                annualIncome: financialData.annualIncome,
                incomeSource: financialData.incomeSource,
                employmentInfo: financialData.employmentInfo || null,
                assets: financialData.assets,
                liabilities: financialData.liabilities
            },
            create: {
                applicationId: applicationId,
                annualIncome: financialData.annualIncome,
                incomeSource: financialData.incomeSource,
                employmentInfo: financialData.employmentInfo || null,
                assets: financialData.assets,
                liabilities: financialData.liabilities
            }
        });

        // Delete existing banking relationships for this profile
        await tx.bankingRelationship.deleteMany({
            where: {
                financialProfileId: financialProfile.id
            }
        });

        // Create new banking relationships
        const bankingRelationships = await Promise.all(
            financialData.bankingRelationships.map(relationship =>
                tx.bankingRelationship.create({
                    data: {
                        bankName: relationship.bankName,
                        accountTypes: relationship.accountTypes,
                        yearsWithBank: relationship.yearsWithBank,
                        financialProfileId: financialProfile.id
                    }
                })
            )
        );

        // Delete existing account activities for this profile
        await tx.accountActivity.deleteMany({
            where: {
                financialProfileId: financialProfile.id
            }
        });

        // Create new account activities
        const accountActivities = await Promise.all(
            financialData.accountActivities.map(activity =>
                tx.accountActivity.create({
                    data: {
                        activity: activity.activity,
                        frequency: activity.frequency,
                        amount: activity.amount,
                        financialProfileId: financialProfile.id
                    }
                })
            )
        );

        return {
            ...financialProfile,
            bankingRelationships,
            accountActivities
        };
    });
};

/**
 * Get financial profile by application ID
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID (for ownership validation)
 * @returns {Promise<FinancialProfile | null>}
 */
const getFinancialProfileByApplicationId = async (
    applicationId: string,
    userId: number
): Promise<(FinancialProfile & { bankingRelationships: BankingRelationship[], accountActivities: AccountActivity[] }) | null> => {
    // First verify that the application exists and belongs to the user
    const application = await prisma.application.findFirst({
        where: {
            id: applicationId,
            userId: userId
        }
    });

    if (!application) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Application not found');
    }

    // Get the financial profile with related data
    const financialProfile = await prisma.financialProfile.findUnique({
        where: {
            applicationId: applicationId
        },
        include: {
            bankingRelationships: true,
            accountActivities: true
        }
    });

    return financialProfile;
};

/**
 * Delete financial profile by application ID
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID (for ownership validation)
 * @returns {Promise<FinancialProfile>}
 */
const deleteFinancialProfileByApplicationId = async (
    applicationId: string,
    userId: number
): Promise<FinancialProfile> => {
    // First verify that the application exists and belongs to the user
    const application = await prisma.application.findFirst({
        where: {
            id: applicationId,
            userId: userId
        }
    });

    if (!application) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Application not found');
    }

    // Check if financial profile exists
    const financialProfile = await prisma.financialProfile.findUnique({
        where: {
            applicationId: applicationId
        }
    });

    if (!financialProfile) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Financial profile not found');
    }

    // Delete the financial profile (cascade will handle related records)
    const deletedProfile = await prisma.financialProfile.delete({
        where: {
            applicationId: applicationId
        }
    });

    return deletedProfile;
};

/**
 * Validate income source
 * @param {string[]} incomeSources - Income sources to validate
 * @returns {boolean}
 */
const validateIncomeSources = (incomeSources: string[]): boolean => {
    const validIncomeSources = [
        'employment',
        'self-employment',
        'business',
        'investment',
        'retirement',
        'disability',
        'social_security',
        'other'
    ];

    return incomeSources.length > 0 && incomeSources.every(source => 
        validIncomeSources.includes(source)
    );
};

/**
 * Validate banking relationship
 * @param {Object} relationship - Banking relationship to validate
 * @returns {boolean}
 */
const validateBankingRelationship = (relationship: {
    bankName: string;
    accountTypes: string[];
    yearsWithBank: number;
}): boolean => {
    return Boolean(relationship.bankName) && 
           relationship.bankName.trim().length > 0 &&
           Boolean(relationship.accountTypes) && 
           relationship.accountTypes.length > 0 &&
           relationship.yearsWithBank >= 0 && 
           relationship.yearsWithBank <= 100;
};

/**
 * Validate account activity
 * @param {Object} activity - Account activity to validate
 * @returns {boolean}
 */
const validateAccountActivity = (activity: {
    activity: string;
    frequency: string;
    amount: number;
}): boolean => {
    const validFrequencies = ['daily', 'weekly', 'monthly', 'quarterly', 'annually', 'as_needed'];
    
    return Boolean(activity.activity) && 
           activity.activity.trim().length > 0 &&
           validFrequencies.includes(activity.frequency) &&
           activity.amount >= 0;
};

/**
 * Validate financial amounts
 * @param {Object} amounts - Financial amounts to validate
 * @returns {boolean}
 */
const validateFinancialAmounts = (amounts: {
    annualIncome: number;
    assets: number;
    liabilities: number;
}): boolean => {
    return amounts.annualIncome >= 0 && amounts.annualIncome <= 10000000 &&
           amounts.assets >= 0 && amounts.assets <= 100000000 &&
           amounts.liabilities >= 0 && amounts.liabilities <= 100000000;
};

export default {
    createOrUpdateFinancialProfile,
    getFinancialProfileByApplicationId,
    deleteFinancialProfileByApplicationId,
    validateIncomeSources,
    validateBankingRelationship,
    validateAccountActivity,
    validateFinancialAmounts
};