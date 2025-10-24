import { describe, it, expect, beforeEach, vi, beforeAll, afterAll } from 'vitest';
import documentService from '../document.service.ts';
import prisma from '../../client.ts';
import { getInstance } from '../../storage/main.ts';
import ApiError from '../../utils/ApiError.ts';
import httpStatus from 'http-status';

// Mock storage
vi.mock('../../storage/main.ts');
const mockStorage = {
    uploadData: vi.fn(),
    uploadFile: vi.fn(),
    deleteFile: vi.fn(),
    generateDownloadSignedUrl: vi.fn()
};
vi.mocked(getInstance).mockReturnValue(mockStorage as any);

// Mock file system
vi.mock('fs/promises', () => ({
    unlink: vi.fn()
}));

describe('Document Service', () => {
    const mockUserId = 1;
    const mockApplicationId = 'test-app-id';
    const mockDocumentId = 'test-doc-id';

    const mockApplication = {
        id: mockApplicationId,
        userId: mockUserId,
        status: 'draft',
        currentStep: 'document_upload',
        accountType: 'consumer',
        customerType: 'new',
        applicantId: 'applicant-123',
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const mockDocument = {
        id: mockDocumentId,
        type: 'drivers_license',
        fileName: 'license.pdf',
        fileSize: 1024576,
        mimeType: 'application/pdf',
        uploadedAt: new Date(),
        verificationStatus: 'pending',
        verificationProvider: null,
        verificationConfidence: null,
        extractedData: { storageKey: 'test-key', bucketName: 'test-bucket' },
        verificationId: null,
        verifiedAt: null,
        signerId: null,
        applicationId: mockApplicationId
    };

    const mockFile = {
        originalname: 'test-document.pdf',
        size: 1024576,
        mimetype: 'application/pdf',
        buffer: Buffer.from('test file content'),
        fieldname: 'file',
        encoding: '7bit'
    } as Express.Multer.File;

    beforeAll(() => {
        // Mock prisma methods
        vi.spyOn(prisma.application, 'findFirst').mockResolvedValue(mockApplication as any);
        vi.spyOn(prisma.document, 'create').mockResolvedValue(mockDocument as any);
        vi.spyOn(prisma.document, 'findMany').mockResolvedValue([mockDocument] as any);
        vi.spyOn(prisma.document, 'findFirst').mockResolvedValue(mockDocument as any);
        vi.spyOn(prisma.document, 'update').mockResolvedValue(mockDocument as any);
        vi.spyOn(prisma.document, 'delete').mockResolvedValue(mockDocument as any);
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    describe('uploadDocument', () => {
        it('should successfully upload a document', async () => {
            mockStorage.uploadData.mockResolvedValue(undefined);

            const result = await documentService.uploadDocument(
                mockApplicationId,
                mockUserId,
                { type: 'drivers_license' },
                mockFile
            );

            expect(result).toEqual(mockDocument);
            expect(prisma.application.findFirst).toHaveBeenCalledWith({
                where: { id: mockApplicationId, userId: mockUserId }
            });
            expect(mockStorage.uploadData).toHaveBeenCalled();
            expect(prisma.document.create).toHaveBeenCalled();
        });

        it('should throw error if application not found', async () => {
            vi.spyOn(prisma.application, 'findFirst').mockResolvedValueOnce(null);

            await expect(
                documentService.uploadDocument(
                    mockApplicationId,
                    mockUserId,
                    { type: 'drivers_license' },
                    mockFile
                )
            ).rejects.toThrow(new ApiError(httpStatus.NOT_FOUND, 'Application not found'));
        });

        it('should throw error for invalid document type', async () => {
            await expect(
                documentService.uploadDocument(
                    mockApplicationId,
                    mockUserId,
                    { type: 'invalid_type' as any },
                    mockFile
                )
            ).rejects.toThrow(new ApiError(httpStatus.BAD_REQUEST, 'Invalid document type. Must be one of: drivers_license, passport, utility_bill, bank_statement, tax_document, other'));
        });

        it('should throw error if no file provided', async () => {
            await expect(
                documentService.uploadDocument(
                    mockApplicationId,
                    mockUserId,
                    { type: 'drivers_license' },
                    null as any
                )
            ).rejects.toThrow(new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded'));
        });

        it('should throw error if file size exceeds limit', async () => {
            const largeFile = { ...mockFile, size: 11 * 1024 * 1024 }; // 11MB

            await expect(
                documentService.uploadDocument(
                    mockApplicationId,
                    mockUserId,
                    { type: 'drivers_license' },
                    largeFile
                )
            ).rejects.toThrow(new ApiError(413, 'File size exceeds 10MB limit'));
        });

        it('should throw error for invalid MIME type', async () => {
            const invalidFile = { ...mockFile, mimetype: 'text/plain' };

            await expect(
                documentService.uploadDocument(
                    mockApplicationId,
                    mockUserId,
                    { type: 'drivers_license' },
                    invalidFile
                )
            ).rejects.toThrow(new ApiError(httpStatus.BAD_REQUEST, 'Invalid file type. Allowed types: application/pdf, image/jpeg, image/png'));
        });

        it('should handle file with path instead of buffer', async () => {
            const fileWithPath = { 
                ...mockFile, 
                buffer: undefined as any, 
                path: '/tmp/testfile.pdf' 
            };
            mockStorage.uploadFile.mockResolvedValue(undefined);

            const result = await documentService.uploadDocument(
                mockApplicationId,
                mockUserId,
                { type: 'drivers_license' },
                fileWithPath
            );

            expect(result).toEqual(mockDocument);
            expect(mockStorage.uploadFile).toHaveBeenCalled();
        });
    });

    describe('getDocumentsByApplicationId', () => {
        it('should return documents for valid application', async () => {
            const result = await documentService.getDocumentsByApplicationId(
                mockApplicationId,
                mockUserId
            );

            expect(result).toEqual([mockDocument]);
            expect(prisma.application.findFirst).toHaveBeenCalledWith({
                where: { id: mockApplicationId, userId: mockUserId }
            });
            expect(prisma.document.findMany).toHaveBeenCalledWith({
                where: { applicationId: mockApplicationId },
                orderBy: { uploadedAt: 'desc' }
            });
        });

        it('should throw error if application not found', async () => {
            vi.spyOn(prisma.application, 'findFirst').mockResolvedValueOnce(null);

            await expect(
                documentService.getDocumentsByApplicationId(mockApplicationId, mockUserId)
            ).rejects.toThrow(new ApiError(httpStatus.NOT_FOUND, 'Application not found'));
        });
    });

    describe('getDocumentById', () => {
        it('should return document details', async () => {
            const result = await documentService.getDocumentById(
                mockApplicationId,
                mockDocumentId,
                mockUserId,
                false
            );

            expect(result).toEqual(mockDocument);
            expect(prisma.application.findFirst).toHaveBeenCalledWith({
                where: { id: mockApplicationId, userId: mockUserId }
            });
            expect(prisma.document.findFirst).toHaveBeenCalledWith({
                where: { id: mockDocumentId, applicationId: mockApplicationId }
            });
        });

        it('should include download URL when requested', async () => {
            const downloadUrl = 'https://example.com/download/test';
            mockStorage.generateDownloadSignedUrl.mockResolvedValue(downloadUrl);

            const result = await documentService.getDocumentById(
                mockApplicationId,
                mockDocumentId,
                mockUserId,
                true
            );

            expect(result).toEqual({ ...mockDocument, downloadUrl });
            expect(mockStorage.generateDownloadSignedUrl).toHaveBeenCalled();
        });

        it('should throw error if application not found', async () => {
            vi.spyOn(prisma.application, 'findFirst').mockResolvedValueOnce(null);

            await expect(
                documentService.getDocumentById(mockApplicationId, mockDocumentId, mockUserId)
            ).rejects.toThrow(new ApiError(httpStatus.NOT_FOUND, 'Application not found'));
        });

        it('should throw error if document not found', async () => {
            vi.spyOn(prisma.document, 'findFirst').mockResolvedValueOnce(null);

            await expect(
                documentService.getDocumentById(mockApplicationId, mockDocumentId, mockUserId)
            ).rejects.toThrow(new ApiError(httpStatus.NOT_FOUND, 'Document not found'));
        });
    });

    describe('deleteDocument', () => {
        it('should successfully delete document', async () => {
            mockStorage.deleteFile.mockResolvedValue(undefined);

            const result = await documentService.deleteDocument(
                mockApplicationId,
                mockDocumentId,
                mockUserId
            );

            expect(result).toEqual(mockDocument);
            expect(mockStorage.deleteFile).toHaveBeenCalled();
            expect(prisma.document.delete).toHaveBeenCalledWith({
                where: { id: mockDocumentId }
            });
        });

        it('should throw error if application not found', async () => {
            vi.spyOn(prisma.application, 'findFirst').mockResolvedValueOnce(null);

            await expect(
                documentService.deleteDocument(mockApplicationId, mockDocumentId, mockUserId)
            ).rejects.toThrow(new ApiError(httpStatus.NOT_FOUND, 'Application not found'));
        });

        it('should throw error if document not found', async () => {
            vi.spyOn(prisma.document, 'findFirst').mockResolvedValueOnce(null);

            await expect(
                documentService.deleteDocument(mockApplicationId, mockDocumentId, mockUserId)
            ).rejects.toThrow(new ApiError(httpStatus.NOT_FOUND, 'Document not found'));
        });
    });

    describe('validateFile', () => {
        it('should validate a valid file', () => {
            const result = documentService.validateFile(mockFile);

            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should reject file that is too large', () => {
            const largeFile = { ...mockFile, size: 11 * 1024 * 1024 };

            const result = documentService.validateFile(largeFile);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('File size exceeds 10MB limit');
        });

        it('should reject invalid MIME type', () => {
            const invalidFile = { ...mockFile, mimetype: 'text/plain' };

            const result = documentService.validateFile(invalidFile);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Invalid file type. Allowed types: application/pdf, image/jpeg, image/png');
        });

        it('should handle null file', () => {
            const result = documentService.validateFile(null as any);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('No file provided');
        });
    });

    describe('validateDocumentType', () => {
        it('should validate valid document types', () => {
            expect(documentService.validateDocumentType('drivers_license')).toBe(true);
            expect(documentService.validateDocumentType('passport')).toBe(true);
            expect(documentService.validateDocumentType('utility_bill')).toBe(true);
            expect(documentService.validateDocumentType('bank_statement')).toBe(true);
            expect(documentService.validateDocumentType('tax_document')).toBe(true);
            expect(documentService.validateDocumentType('other')).toBe(true);
        });

        it('should reject invalid document types', () => {
            expect(documentService.validateDocumentType('invalid_type')).toBe(false);
            expect(documentService.validateDocumentType('')).toBe(false);
        });
    });
});