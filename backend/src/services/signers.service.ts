import prisma from '../client.ts';
import { AdditionalSigner } from '../generated/prisma/index.js';
import ApiError from '../utils/ApiError.ts';
import httpStatus from 'http-status';

/**
 * Create an additional signer for an application
 * @param {string} applicationId - Application ID
 * @param {Object} signerData - Signer data including personalInfo, role, etc.
 * @param {number} userId - User ID for access control
 * @returns {Promise<AdditionalSigner>}
 */
const createAdditionalSigner = async (
    applicationId: string,
    signerData: {
        personalInfo: any;
        role: string;
        relationshipToBusiness?: string;
        beneficialOwnershipPercentage?: number;
        hasSigningAuthority: boolean;
    },
    userId: number
): Promise<AdditionalSigner> => {
    // First verify that the application exists and belongs to the user
    const application = await prisma.application.findFirst({
        where: {
            id: applicationId,
            userId
        }
    });

    if (!application) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Application not found');
    }

    // Create the additional signer
    const signer = await prisma.additionalSigner.create({
        data: {
            applicationId,
            personalInfo: signerData.personalInfo,
            role: signerData.role,
            relationshipToBusiness: signerData.relationshipToBusiness,
            beneficialOwnershipPercentage: signerData.beneficialOwnershipPercentage,
            hasSigningAuthority: signerData.hasSigningAuthority
        },
        include: {
            documents: true
        }
    });

    return signer;
};

/**
 * Update an additional signer
 * @param {string} signerId - Signer ID
 * @param {Object} updateData - Updated signer data
 * @param {number} userId - User ID for access control
 * @returns {Promise<AdditionalSigner>}
 */
const updateAdditionalSignerById = async (
    signerId: string,
    updateData: {
        personalInfo?: any;
        role?: string;
        relationshipToBusiness?: string;
        beneficialOwnershipPercentage?: number;
        hasSigningAuthority?: boolean;
    },
    userId: number
): Promise<AdditionalSigner> => {
    // First verify that the signer exists and the application belongs to the user
    const signer = await prisma.additionalSigner.findFirst({
        where: {
            id: signerId,
            application: {
                userId
            }
        }
    });

    if (!signer) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Signer not found');
    }

    // Update the signer
    const updatedSigner = await prisma.additionalSigner.update({
        where: { id: signerId },
        data: updateData,
        include: {
            documents: true
        }
    });

    return updatedSigner;
};

/**
 * Get all additional signers for an application
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID for access control
 * @returns {Promise<AdditionalSigner[]>}
 */
const getAdditionalSignersByApplicationId = async (
    applicationId: string,
    userId: number
): Promise<AdditionalSigner[]> => {
    // First verify that the application exists and belongs to the user
    const application = await prisma.application.findFirst({
        where: {
            id: applicationId,
            userId
        }
    });

    if (!application) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Application not found');
    }

    // Get all signers for the application
    const signers = await prisma.additionalSigner.findMany({
        where: {
            applicationId
        },
        include: {
            documents: true
        },
        orderBy: {
            id: 'asc'
        }
    });

    return signers;
};

/**
 * Get a specific additional signer by ID
 * @param {string} signerId - Signer ID
 * @param {number} userId - User ID for access control
 * @returns {Promise<AdditionalSigner>}
 */
const getAdditionalSignerById = async (signerId: string, userId: number): Promise<AdditionalSigner> => {
    const signer = await prisma.additionalSigner.findFirst({
        where: {
            id: signerId,
            application: {
                userId
            }
        },
        include: {
            documents: true
        }
    });

    if (!signer) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Signer not found');
    }

    return signer;
};

/**
 * Delete an additional signer
 * @param {string} signerId - Signer ID
 * @param {number} userId - User ID for access control
 * @returns {Promise<void>}
 */
const deleteAdditionalSignerById = async (signerId: string, userId: number): Promise<void> => {
    // First verify that the signer exists and the application belongs to the user
    const signer = await prisma.additionalSigner.findFirst({
        where: {
            id: signerId,
            application: {
                userId
            }
        }
    });

    if (!signer) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Signer not found');
    }

    // Delete the signer (documents will be cascade deleted due to foreign key relationship)
    await prisma.additionalSigner.delete({
        where: { id: signerId }
    });
};

export default {
    createAdditionalSigner,
    updateAdditionalSignerById,
    getAdditionalSignersByApplicationId,
    getAdditionalSignerById,
    deleteAdditionalSignerById
};
