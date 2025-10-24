import prisma from '../client.ts';
import { Document } from '../generated/prisma/index.js';
import ApiError from '../utils/ApiError.ts';
import httpStatus from 'http-status';
import { getInstance } from '../storage/main.ts';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';

// Valid document types
const VALID_DOCUMENT_TYPES = [
    'drivers_license',
    'passport',
    'utility_bill',
    'bank_statement',
    'tax_document',
    'other'
] as const;

// Valid MIME types
const VALID_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
];

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Upload document for application
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID (for ownership validation)
 * @param {Object} documentData - Document data
 * @param {Express.Multer.File} file - Uploaded file
 * @returns {Promise<Document>}
 */
const uploadDocument = async (
    applicationId: string,
    userId: number,
    documentData: {
        type: string;
        signerId?: string;
    },
    file: Express.Multer.File
): Promise<Document> => {
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

    // Validate document type
    if (!VALID_DOCUMENT_TYPES.includes(documentData.type as any)) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Invalid document type. Must be one of: ${VALID_DOCUMENT_TYPES.join(', ')}`);
    }

    // Validate file
    if (!file) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded');
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        throw new ApiError(413, 'File size exceeds 10MB limit');
    }

    // Validate MIME type
    if (!VALID_MIME_TYPES.includes(file.mimetype)) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Invalid file type. Allowed types: ${VALID_MIME_TYPES.join(', ')}`);
    }

    try {
        // Generate unique storage key
        const fileExtension = path.extname(file.originalname);
        const storageKey = `applications/${applicationId}/documents/${uuidv4()}${fileExtension}`;
        const bucketName = process.env.DOCUMENT_BUCKET_NAME || 'documents';

        // Upload file to storage
        const storage = getInstance();
        
        if (file.buffer) {
            // File is in memory (multer memoryStorage)
            await storage.uploadData({
                bucketName,
                data: file.buffer,
                destinationKey: storageKey,
                contentType: file.mimetype
            });
        } else if (file.path) {
            // File is on disk (multer diskStorage)
            await storage.uploadFile({
                bucketName,
                srcFilePath: file.path,
                destinationKey: storageKey
            });
            
            // Clean up temporary file
            try {
                await fs.unlink(file.path);
            } catch (error) {
                // Log error but don't fail the operation
                console.warn('Failed to delete temporary file:', file.path, error);
            }
        } else {
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'File data not available');
        }

        // Create document record in database
        const document = await prisma.document.create({
            data: {
                type: documentData.type,
                fileName: file.originalname,
                fileSize: file.size,
                mimeType: file.mimetype,
                verificationStatus: 'pending',
                signerId: documentData.signerId || null,
                applicationId: applicationId,
                // Store storage reference for retrieval
                extractedData: {
                    storageKey: storageKey,
                    bucketName: bucketName
                }
            }
        });

        // Initiate mock document verification
        await initiateDocumentVerification(document.id);

        return document;
    } catch (error: any) {
        if (error instanceof ApiError) {
            throw error;
        }
        console.error('Document upload error:', error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to upload document');
    }
};

/**
 * Get all documents for application
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID (for ownership validation)
 * @returns {Promise<Document[]>}
 */
const getDocumentsByApplicationId = async (
    applicationId: string,
    userId: number
): Promise<Document[]> => {
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

    // Get all documents for the application
    const documents = await prisma.document.findMany({
        where: {
            applicationId: applicationId
        },
        orderBy: {
            uploadedAt: 'desc'
        }
    });

    return documents;
};

/**
 * Get specific document by ID
 * @param {string} applicationId - Application ID
 * @param {string} documentId - Document ID
 * @param {number} userId - User ID (for ownership validation)
 * @param {boolean} includeDownloadUrl - Whether to include download URL
 * @returns {Promise<Document & { downloadUrl?: string }>}
 */
const getDocumentById = async (
    applicationId: string,
    documentId: string,
    userId: number,
    includeDownloadUrl: boolean = false
): Promise<Document & { downloadUrl?: string }> => {
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

    // Get the specific document
    const document = await prisma.document.findFirst({
        where: {
            id: documentId,
            applicationId: applicationId
        }
    });

    if (!document) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Document not found');
    }

    // Generate download URL if requested
    let downloadUrl: string | undefined;
    if (includeDownloadUrl && document.extractedData) {
        try {
            const storageData = document.extractedData as any;
            if (storageData.storageKey && storageData.bucketName) {
                const storage = getInstance();
                downloadUrl = await storage.generateDownloadSignedUrl({
                    bucketName: storageData.bucketName,
                    key: storageData.storageKey,
                    fileName: document.fileName
                });
            }
        } catch (error) {
            console.error('Failed to generate download URL:', error);
            // Don't fail the operation, just omit the URL
        }
    }

    return {
        ...document,
        downloadUrl
    };
};

/**
 * Delete document
 * @param {string} applicationId - Application ID
 * @param {string} documentId - Document ID
 * @param {number} userId - User ID (for ownership validation)
 * @returns {Promise<Document>}
 */
const deleteDocument = async (
    applicationId: string,
    documentId: string,
    userId: number
): Promise<Document> => {
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

    // Get the document to be deleted
    const document = await prisma.document.findFirst({
        where: {
            id: documentId,
            applicationId: applicationId
        }
    });

    if (!document) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Document not found');
    }

    try {
        // Delete from storage first
        if (document.extractedData) {
            const storageData = document.extractedData as any;
            if (storageData.storageKey && storageData.bucketName) {
                const storage = getInstance();
                await storage.deleteFile({
                    bucketName: storageData.bucketName,
                    key: storageData.storageKey
                });
            }
        }

        // Delete from database
        const deletedDocument = await prisma.document.delete({
            where: {
                id: documentId
            }
        });

        return deletedDocument;
    } catch (error: any) {
        if (error instanceof ApiError) {
            throw error;
        }
        console.error('Document deletion error:', error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete document');
    }
};

/**
 * Initiate mock document verification
 * @param {string} documentId - Document ID
 * @returns {Promise<void>}
 */
const initiateDocumentVerification = async (documentId: string): Promise<void> => {
    try {
        // Simulate async verification process with mock data
        setTimeout(async () => {
            try {
                // Mock verification results
                const mockConfidence = Math.random() * 0.4 + 0.6; // 0.6 to 1.0
                const mockProvider = 'Mock Document Verification Provider';
                const mockExtractedData = {
                    name: 'John Doe',
                    documentNumber: `DOC${Math.floor(Math.random() * 1000000)}`,
                    issueDate: '2020-01-15',
                    expirationDate: '2025-01-15'
                };

                // Get current document to preserve existing extractedData
                const currentDoc = await prisma.document.findUnique({
                    where: { id: documentId }
                });
                
                const existingData = currentDoc?.extractedData && typeof currentDoc.extractedData === 'object' 
                    ? currentDoc.extractedData as any 
                    : {};

                await prisma.document.update({
                    where: { id: documentId },
                    data: {
                        verificationStatus: mockConfidence > 0.8 ? 'verified' : 'review_required',
                        verificationProvider: mockProvider,
                        verificationConfidence: mockConfidence,
                        verificationId: `verify_${uuidv4()}`,
                        verifiedAt: mockConfidence > 0.8 ? new Date() : null,
                        extractedData: {
                            ...existingData,
                            verification: {
                                provider: mockProvider,
                                confidence: mockConfidence,
                                extractedData: mockExtractedData
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Mock verification update failed:', error);
                // Update status to failed
                await prisma.document.update({
                    where: { id: documentId },
                    data: {
                        verificationStatus: 'failed'
                    }
                });
            }
        }, 2000); // 2 second delay to simulate processing
    } catch (error) {
        console.error('Failed to initiate document verification:', error);
    }
};

/**
 * Validate document type
 * @param {string} type - Document type to validate
 * @returns {boolean}
 */
const validateDocumentType = (type: string): boolean => {
    return VALID_DOCUMENT_TYPES.includes(type as any);
};

/**
 * Validate file properties
 * @param {Express.Multer.File} file - File to validate
 * @returns {Object} - Validation result
 */
const validateFile = (file: Express.Multer.File): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!file) {
        errors.push('No file provided');
        return { isValid: false, errors };
    }

    if (file.size > MAX_FILE_SIZE) {
        errors.push(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
    }

    if (!VALID_MIME_TYPES.includes(file.mimetype)) {
        errors.push(`Invalid file type. Allowed types: ${VALID_MIME_TYPES.join(', ')}`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export default {
    uploadDocument,
    getDocumentsByApplicationId,
    getDocumentById,
    deleteDocument,
    validateDocumentType,
    validateFile,
    VALID_DOCUMENT_TYPES,
    VALID_MIME_TYPES,
    MAX_FILE_SIZE
};