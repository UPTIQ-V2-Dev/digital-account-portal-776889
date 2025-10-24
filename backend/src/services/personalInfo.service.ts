import prisma from '../client.ts';
import { PersonalInfo } from '../generated/prisma/index.js';
import ApiError from '../utils/ApiError.ts';
import httpStatus from 'http-status';

/**
 * Create or update personal information for an application
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID (for ownership validation)
 * @param {Object} personalData - Personal information data
 * @returns {Promise<PersonalInfo>}
 */
const createOrUpdatePersonalInfo = async (
    applicationId: string,
    userId: number,
    personalData: {
        firstName: string;
        middleName?: string;
        lastName: string;
        suffix?: string;
        dateOfBirth: string;
        ssn: string;
        phone: string;
        email: string;
        employmentStatus: string;
        occupation?: string;
        employer?: string;
        workPhone?: string;
        mailingAddress: {
            street: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
            apartment?: string;
        };
        physicalAddress?: {
            street: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
            apartment?: string;
        };
    }
): Promise<PersonalInfo> => {
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

    // Validate employment status
    const validEmploymentStatuses = ['employed', 'self_employed', 'unemployed', 'retired', 'student'];
    if (!validEmploymentStatuses.includes(personalData.employmentStatus)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid employment status');
    }

    // Validate date of birth format and age requirement (must be 18+)
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(personalData.dateOfBirth)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid date of birth format. Expected format: YYYY-MM-DD');
    }

    const dateOfBirth = new Date(personalData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
        const actualAge = age - 1;
        if (actualAge < 18) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Applicant must be at least 18 years old');
        }
    } else if (age < 18) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Applicant must be at least 18 years old');
    }

    if (dateOfBirth > today) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Date of birth cannot be in the future');
    }

    // Validate SSN format (XXX-XX-XXXX)
    const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
    if (!ssnRegex.test(personalData.ssn)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid SSN format. Expected format: XXX-XX-XXXX');
    }

    // Check if another application already has this SSN (excluding current application)
    const existingProfile = await prisma.personalInfo.findFirst({
        where: {
            ssn: personalData.ssn,
            applicationId: {
                not: applicationId
            }
        }
    });

    if (existingProfile) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'SSN is already in use by another application');
    }

    // Prepare the data with flattened address fields
    const profileData = {
        firstName: personalData.firstName,
        middleName: personalData.middleName || null,
        lastName: personalData.lastName,
        suffix: personalData.suffix || null,
        dateOfBirth: personalData.dateOfBirth,
        ssn: personalData.ssn,
        phone: personalData.phone,
        email: personalData.email,
        employmentStatus: personalData.employmentStatus,
        occupation: personalData.occupation || null,
        employer: personalData.employer || null,
        workPhone: personalData.workPhone || null,
        // Mailing address fields (required)
        mailingStreet: personalData.mailingAddress.street,
        mailingCity: personalData.mailingAddress.city,
        mailingState: personalData.mailingAddress.state,
        mailingZipCode: personalData.mailingAddress.zipCode,
        mailingCountry: personalData.mailingAddress.country,
        mailingApartment: personalData.mailingAddress.apartment || null,
        // Physical address fields (optional)
        physicalStreet: personalData.physicalAddress?.street || null,
        physicalCity: personalData.physicalAddress?.city || null,
        physicalState: personalData.physicalAddress?.state || null,
        physicalZipCode: personalData.physicalAddress?.zipCode || null,
        physicalCountry: personalData.physicalAddress?.country || null,
        physicalApartment: personalData.physicalAddress?.apartment || null,
        applicationId: applicationId
    };

    // Try to update existing profile first, then create if doesn't exist
    try {
        const personalInfo = await prisma.personalInfo.upsert({
            where: {
                applicationId: applicationId
            },
            update: profileData,
            create: profileData
        });

        return personalInfo;
    } catch (error: any) {
        if (error.code === 'P2002' && error.meta?.target?.includes('ssn')) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'SSN is already in use by another application');
        }
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to save personal information');
    }
};

/**
 * Get personal information by application ID
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID (for ownership validation)
 * @returns {Promise<PersonalInfo | null>}
 */
const getPersonalInfoByApplicationId = async (
    applicationId: string,
    userId: number
): Promise<PersonalInfo | null> => {
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

    // Get the personal information
    const personalInfo = await prisma.personalInfo.findUnique({
        where: {
            applicationId: applicationId
        }
    });

    return personalInfo;
};

/**
 * Delete personal information by application ID
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID (for ownership validation)
 * @returns {Promise<PersonalInfo>}
 */
const deletePersonalInfoByApplicationId = async (
    applicationId: string,
    userId: number
): Promise<PersonalInfo> => {
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

    // Check if personal information exists
    const personalInfo = await prisma.personalInfo.findUnique({
        where: {
            applicationId: applicationId
        }
    });

    if (!personalInfo) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Personal information not found');
    }

    // Delete the personal information
    const deletedProfile = await prisma.personalInfo.delete({
        where: {
            applicationId: applicationId
        }
    });

    return deletedProfile;
};

/**
 * Validate SSN format
 * @param {string} ssn - SSN to validate
 * @returns {boolean}
 */
const validateSSN = (ssn: string): boolean => {
    const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
    return ssnRegex.test(ssn);
};

/**
 * Validate employment status
 * @param {string} employmentStatus - Employment status to validate
 * @returns {boolean}
 */
const validateEmploymentStatus = (employmentStatus: string): boolean => {
    const validEmploymentStatuses = ['employed', 'self_employed', 'unemployed', 'retired', 'student'];
    return validEmploymentStatuses.includes(employmentStatus);
};

/**
 * Validate date of birth and age requirement
 * @param {string} dateOfBirth - Date of birth in YYYY-MM-DD format
 * @returns {Object} - Validation result with isValid flag and message
 */
const validateDateOfBirth = (dateOfBirth: string): { isValid: boolean; message?: string } => {
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(dateOfBirth)) {
        return { isValid: false, message: 'Invalid date format. Expected format: YYYY-MM-DD' };
    }

    const dob = new Date(dateOfBirth);
    const today = new Date();
    
    if (dob > today) {
        return { isValid: false, message: 'Date of birth cannot be in the future' };
    }

    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    let actualAge = age;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        actualAge = age - 1;
    }

    if (actualAge < 18) {
        return { isValid: false, message: 'Applicant must be at least 18 years old' };
    }

    return { isValid: true };
};

export default {
    createOrUpdatePersonalInfo,
    getPersonalInfoByApplicationId,
    deletePersonalInfoByApplicationId,
    validateSSN,
    validateEmploymentStatus,
    validateDateOfBirth
};