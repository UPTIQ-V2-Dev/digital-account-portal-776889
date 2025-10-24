import prisma from '../client.ts';
import { BusinessProfile } from '../generated/prisma/index.js';
import ApiError from '../utils/ApiError.ts';
import httpStatus from 'http-status';

/**
 * Create or update business profile for an application
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID (for ownership validation)
 * @param {Object} businessData - Business profile data
 * @returns {Promise<BusinessProfile>}
 */
const createOrUpdateBusinessProfile = async (
    applicationId: string,
    userId: number,
    businessData: {
        businessName: string;
        dbaName?: string;
        ein: string;
        entityType: string;
        industryType: string;
        dateEstablished: string;
        businessPhone: string;
        businessEmail: string;
        website?: string;
        description: string;
        isCashIntensive: boolean;
        monthlyTransactionVolume: number;
        monthlyTransactionCount: number;
        expectedBalance: number;
        businessAddress: {
            street: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
            apartment?: string;
        };
        mailingAddress?: {
            street: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
            apartment?: string;
        };
    }
): Promise<BusinessProfile> => {
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

    // Validate entity type
    const validEntityTypes = ['corporation', 'llc', 'partnership', 'sole_proprietorship'];
    if (!validEntityTypes.includes(businessData.entityType)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid entity type');
    }

    // Validate EIN format (XX-XXXXXXX)
    const einRegex = /^\d{2}-\d{7}$/;
    if (!einRegex.test(businessData.ein)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid EIN format. Expected format: XX-XXXXXXX');
    }

    // Check if another application already has this EIN (excluding current application)
    const existingProfile = await prisma.businessProfile.findFirst({
        where: {
            ein: businessData.ein,
            applicationId: {
                not: applicationId
            }
        }
    });

    if (existingProfile) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'EIN is already in use by another application');
    }

    // Prepare the data with flattened address fields
    const profileData = {
        businessName: businessData.businessName,
        dbaName: businessData.dbaName || null,
        ein: businessData.ein,
        entityType: businessData.entityType,
        industryType: businessData.industryType,
        dateEstablished: businessData.dateEstablished,
        businessPhone: businessData.businessPhone,
        businessEmail: businessData.businessEmail,
        website: businessData.website || null,
        description: businessData.description,
        isCashIntensive: businessData.isCashIntensive,
        monthlyTransactionVolume: businessData.monthlyTransactionVolume,
        monthlyTransactionCount: businessData.monthlyTransactionCount,
        expectedBalance: businessData.expectedBalance,
        // Business address fields
        businessStreet: businessData.businessAddress.street,
        businessCity: businessData.businessAddress.city,
        businessState: businessData.businessAddress.state,
        businessZipCode: businessData.businessAddress.zipCode,
        businessCountry: businessData.businessAddress.country,
        businessApartment: businessData.businessAddress.apartment || null,
        // Mailing address fields (optional)
        mailingStreet: businessData.mailingAddress?.street || null,
        mailingCity: businessData.mailingAddress?.city || null,
        mailingState: businessData.mailingAddress?.state || null,
        mailingZipCode: businessData.mailingAddress?.zipCode || null,
        mailingCountry: businessData.mailingAddress?.country || null,
        mailingApartment: businessData.mailingAddress?.apartment || null,
        applicationId: applicationId
    };

    // Try to update existing profile first, then create if doesn't exist
    try {
        const businessProfile = await prisma.businessProfile.upsert({
            where: {
                applicationId: applicationId
            },
            update: profileData,
            create: profileData
        });

        return businessProfile;
    } catch (error: any) {
        if (error.code === 'P2002' && error.meta?.target?.includes('ein')) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'EIN is already in use by another application');
        }
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to save business profile');
    }
};

/**
 * Get business profile by application ID
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID (for ownership validation)
 * @returns {Promise<BusinessProfile | null>}
 */
const getBusinessProfileByApplicationId = async (
    applicationId: string,
    userId: number
): Promise<BusinessProfile | null> => {
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

    // Get the business profile
    const businessProfile = await prisma.businessProfile.findUnique({
        where: {
            applicationId: applicationId
        }
    });

    return businessProfile;
};

/**
 * Delete business profile by application ID
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID (for ownership validation)
 * @returns {Promise<BusinessProfile>}
 */
const deleteBusinessProfileByApplicationId = async (
    applicationId: string,
    userId: number
): Promise<BusinessProfile> => {
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

    // Check if business profile exists
    const businessProfile = await prisma.businessProfile.findUnique({
        where: {
            applicationId: applicationId
        }
    });

    if (!businessProfile) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Business profile not found');
    }

    // Delete the business profile
    const deletedProfile = await prisma.businessProfile.delete({
        where: {
            applicationId: applicationId
        }
    });

    return deletedProfile;
};

/**
 * Validate EIN format
 * @param {string} ein - EIN to validate
 * @returns {boolean}
 */
const validateEIN = (ein: string): boolean => {
    const einRegex = /^\d{2}-\d{7}$/;
    return einRegex.test(ein);
};

/**
 * Validate entity type
 * @param {string} entityType - Entity type to validate
 * @returns {boolean}
 */
const validateEntityType = (entityType: string): boolean => {
    const validEntityTypes = ['corporation', 'llc', 'partnership', 'sole_proprietorship'];
    return validEntityTypes.includes(entityType);
};

export default {
    createOrUpdateBusinessProfile,
    getBusinessProfileByApplicationId,
    deleteBusinessProfileByApplicationId,
    validateEIN,
    validateEntityType
};