import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import httpStatus from 'http-status';
import express from 'express';
import documentController from '../document.controller.ts';
import { documentService } from '../../services/index.ts';
import ApiError from '../../utils/ApiError.ts';
import multer from 'multer';

// Mock the service
vi.mock('../../services/index.ts', () => ({
    documentService: {
        uploadDocument: vi.fn(),
        getDocumentsByApplicationId: vi.fn(),
        getDocumentById: vi.fn(),
        deleteDocument: vi.fn(),
    },
}));

const mockDocumentService = documentService as any;

// Create express app for testing
const app = express();
app.use(express.json());

// Mock auth middleware - adds user to req
const mockAuth = (req: any, res: any, next: any) => {
    req.user = { id: 1, email: 'test@example.com' };
    next();
};

// Mock validate middleware
const mockValidate = (req: any, res: any, next: any) => {
    req.validatedQuery = req.query;
    next();
};

// Setup multer for testing
const upload = multer({ storage: multer.memoryStorage() });

app.use(mockAuth);

// Set up routes
app.post('/applications/:applicationId/documents', 
    upload.single('file'),
    mockValidate,
    documentController.uploadDocument
);

app.get('/applications/:applicationId/documents', 
    mockValidate,
    documentController.getDocuments
);

app.get('/applications/:applicationId/documents/:documentId', 
    mockValidate,
    documentController.getDocument
);

app.delete('/applications/:applicationId/documents/:documentId', 
    mockValidate,
    documentController.deleteDocument
);

describe('Document Controller', () => {
    const mockUserId = 1;
    const mockApplicationId = 'test-app-id';
    const mockDocumentId = 'test-doc-id';

    const mockDocument = {
        id: mockDocumentId,
        applicationId: mockApplicationId,
        type: 'drivers_license',
        fileName: 'license.pdf',
        fileSize: 1024576,
        mimeType: 'application/pdf',
        uploadedAt: new Date('2023-09-13T14:30:45Z'),
        verificationStatus: 'verified',
        verificationProvider: 'Mock Provider',
        verificationConfidence: 0.95,
        verifiedAt: new Date('2023-09-13T14:32:45Z'),
        signerId: null
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /applications/:applicationId/documents', () => {
        it('should upload document successfully', async () => {
            mockDocumentService.uploadDocument.mockResolvedValue(mockDocument);

            const response = await request(app)
                .post(`/applications/${mockApplicationId}/documents`)
                .field('type', 'drivers_license')
                .attach('file', Buffer.from('test file content'), 'test-document.pdf')
                .expect(httpStatus.CREATED);

            expect(response.body).toEqual({
                id: mockDocumentId,
                applicationId: mockApplicationId,
                type: 'drivers_license',
                fileName: 'license.pdf',
                fileSize: 1024576,
                mimeType: 'application/pdf',
                uploadedAt: '2023-09-13T14:30:45.000Z',
                verificationStatus: 'verified'
            });

            expect(mockDocumentService.uploadDocument).toHaveBeenCalledWith(
                mockApplicationId,
                mockUserId,
                { type: 'drivers_license' },
                expect.any(Object)
            );
        });

        it('should return 400 if no file is uploaded', async () => {
            const response = await request(app)
                .post(`/applications/${mockApplicationId}/documents`)
                .field('type', 'drivers_license')
                .expect(httpStatus.BAD_REQUEST);

            // Should have error message (exact format may vary depending on middleware)
            expect(response.body).toHaveProperty('message');
        });

        it('should handle service errors', async () => {
            mockDocumentService.uploadDocument.mockRejectedValue(
                new ApiError(httpStatus.BAD_REQUEST, 'Invalid document type')
            );

            await request(app)
                .post(`/applications/${mockApplicationId}/documents`)
                .field('type', 'drivers_license')
                .attach('file', Buffer.from('test file content'), 'test-document.pdf')
                .expect(httpStatus.BAD_REQUEST);
        });
    });

    describe('GET /applications/:applicationId/documents', () => {
        it('should get all documents for application', async () => {
            mockDocumentService.getDocumentsByApplicationId.mockResolvedValue([mockDocument]);

            const response = await request(app)
                .get(`/applications/${mockApplicationId}/documents`)
                .expect(httpStatus.OK);

            expect(response.body).toEqual([{
                id: mockDocumentId,
                applicationId: mockApplicationId,
                type: 'drivers_license',
                fileName: 'license.pdf',
                fileSize: 1024576,
                mimeType: 'application/pdf',
                uploadedAt: '2023-09-13T14:30:45.000Z',
                verificationStatus: 'verified',
                verificationProvider: 'Mock Provider',
                verificationConfidence: 0.95,
                verifiedAt: '2023-09-13T14:32:45.000Z',
                signerId: null
            }]);

            expect(mockDocumentService.getDocumentsByApplicationId).toHaveBeenCalledWith(
                mockApplicationId,
                mockUserId
            );
        });

        it('should return empty array if no documents', async () => {
            mockDocumentService.getDocumentsByApplicationId.mockResolvedValue([]);

            const response = await request(app)
                .get(`/applications/${mockApplicationId}/documents`)
                .expect(httpStatus.OK);

            expect(response.body).toEqual([]);
        });

        it('should handle service errors', async () => {
            mockDocumentService.getDocumentsByApplicationId.mockRejectedValue(
                new ApiError(httpStatus.NOT_FOUND, 'Application not found')
            );

            await request(app)
                .get(`/applications/${mockApplicationId}/documents`)
                .expect(httpStatus.NOT_FOUND);
        });
    });

    describe('GET /applications/:applicationId/documents/:documentId', () => {
        it('should get document details', async () => {
            const documentWithDetails = {
                ...mockDocument,
                verificationDetails: {
                    provider: 'Mock Document Verification Provider',
                    confidence: 0.95,
                    extractedData: {
                        name: 'John Doe',
                        documentNumber: 'DOC123456',
                        issueDate: '2020-01-15',
                        expirationDate: '2025-01-15'
                    }
                }
            };

            mockDocumentService.getDocumentById.mockResolvedValue(documentWithDetails);

            const response = await request(app)
                .get(`/applications/${mockApplicationId}/documents/${mockDocumentId}`)
                .expect(httpStatus.OK);

            expect(response.body.id).toBe(mockDocumentId);
            expect(response.body.verificationDetails).toBeDefined();

            expect(mockDocumentService.getDocumentById).toHaveBeenCalledWith(
                mockApplicationId,
                mockDocumentId,
                mockUserId,
                false
            );
        });

        it('should redirect for download when download=true', async () => {
            const downloadUrl = 'https://example.com/download/test';
            const documentWithUrl = { ...mockDocument, downloadUrl };

            mockDocumentService.getDocumentById.mockResolvedValue(documentWithUrl);

            const response = await request(app)
                .get(`/applications/${mockApplicationId}/documents/${mockDocumentId}?download=true`)
                .expect(httpStatus.FOUND);

            expect(response.headers.location).toBe(downloadUrl);

            expect(mockDocumentService.getDocumentById).toHaveBeenCalledWith(
                mockApplicationId,
                mockDocumentId,
                mockUserId,
                true
            );
        });

        it('should handle service errors', async () => {
            mockDocumentService.getDocumentById.mockRejectedValue(
                new ApiError(httpStatus.NOT_FOUND, 'Document not found')
            );

            await request(app)
                .get(`/applications/${mockApplicationId}/documents/${mockDocumentId}`)
                .expect(httpStatus.NOT_FOUND);
        });
    });

    describe('DELETE /applications/:applicationId/documents/:documentId', () => {
        it('should delete document successfully', async () => {
            mockDocumentService.deleteDocument.mockResolvedValue(mockDocument);

            await request(app)
                .delete(`/applications/${mockApplicationId}/documents/${mockDocumentId}`)
                .expect(httpStatus.NO_CONTENT);

            expect(mockDocumentService.deleteDocument).toHaveBeenCalledWith(
                mockApplicationId,
                mockDocumentId,
                mockUserId
            );
        });

        it('should handle service errors', async () => {
            mockDocumentService.deleteDocument.mockRejectedValue(
                new ApiError(httpStatus.NOT_FOUND, 'Document not found')
            );

            await request(app)
                .delete(`/applications/${mockApplicationId}/documents/${mockDocumentId}`)
                .expect(httpStatus.NOT_FOUND);
        });
    });
});