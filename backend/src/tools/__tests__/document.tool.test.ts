import { describe, it, expect, beforeEach, vi, beforeAll, afterAll } from 'vitest';
import { documentTools, handleDocumentToolCall } from '../document.tool.ts';
import { documentService } from '../../services/index.ts';
import ApiError from '../../utils/ApiError.ts';

// Mock the document service
vi.mock('../../services/document.service.ts');

describe('Document Tools', () => {
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
        signerId: null,
        extractedData: {
            storageKey: 'test-key',
            bucketName: 'test-bucket',
            verification: {
                provider: 'Mock Document Verification Provider',
                confidence: 0.95,
                extractedData: {
                    name: 'John Doe',
                    documentNumber: 'DOC123456',
                    issueDate: '2020-01-15',
                    expirationDate: '2025-01-15'
                }
            }
        }
    };

    beforeAll(() => {
        vi.mocked(documentService.validateFile).mockReturnValue({
            isValid: true,
            errors: []
        });
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    describe('documentTools structure', () => {
        it('should export correct tool definitions', () => {
            expect(documentTools).toHaveLength(5);
            
            const toolNames = documentTools.map(tool => tool.name);
            expect(toolNames).toContain('upload_document');
            expect(toolNames).toContain('get_application_documents');
            expect(toolNames).toContain('get_document_details');
            expect(toolNames).toContain('delete_document');
            expect(toolNames).toContain('check_document_verification_status');
        });

        it('should have proper schema definitions for each tool', () => {
            documentTools.forEach(tool => {
                expect(tool.name).toBeDefined();
                expect(tool.description).toBeDefined();
                expect(tool.inputSchema).toBeDefined();
                expect(tool.inputSchema.type).toBe('object');
                expect(tool.inputSchema.properties).toBeDefined();
            });
        });
    });

    describe('handleDocumentToolCall', () => {
        describe('upload_document', () => {
            it('should upload document successfully', async () => {
                vi.mocked(documentService.uploadDocument).mockResolvedValue(mockDocument as any);

                const args = {
                    applicationId: mockApplicationId,
                    type: 'drivers_license',
                    fileName: 'license.pdf',
                    fileSize: 1024576,
                    mimeType: 'application/pdf',
                    fileContent: Buffer.from('test content').toString('base64')
                };

                const result = await handleDocumentToolCall('upload_document', args);

                expect(result.success).toBe(true);
                expect(result.document).toEqual({
                    id: mockDocumentId,
                    applicationId: mockApplicationId,
                    type: 'drivers_license',
                    fileName: 'license.pdf',
                    fileSize: 1024576,
                    mimeType: 'application/pdf',
                    uploadedAt: '2023-09-13T14:30:45.000Z',
                    verificationStatus: 'verified',
                    signerId: null
                });

                expect(documentService.uploadDocument).toHaveBeenCalled();
            });

            it('should handle file validation errors', async () => {
                vi.mocked(documentService.validateFile).mockReturnValue({
                    isValid: false,
                    errors: ['File size exceeds 10MB limit']
                });

                const args = {
                    applicationId: mockApplicationId,
                    type: 'drivers_license',
                    fileName: 'large-file.pdf',
                    fileSize: 11 * 1024 * 1024,
                    mimeType: 'application/pdf',
                    fileContent: Buffer.from('test content').toString('base64')
                };

                const result = await handleDocumentToolCall('upload_document', args);

                expect(result.success).toBe(false);
                expect(result.error).toContain('File validation failed');
            });

            it('should handle invalid parameters', async () => {
                const args = {
                    applicationId: mockApplicationId,
                    type: 'invalid_type', // Invalid document type
                    fileName: 'license.pdf',
                    fileSize: 1024576,
                    mimeType: 'application/pdf',
                    fileContent: 'invalid-base64'
                };

                const result = await handleDocumentToolCall('upload_document', args);

                expect(result.success).toBe(false);
                expect(result.error).toBeDefined();
            });
        });

        describe('get_application_documents', () => {
            it('should get documents for application', async () => {
                vi.mocked(documentService.getDocumentsByApplicationId).mockResolvedValue([mockDocument as any]);

                const args = {
                    applicationId: mockApplicationId
                };

                const result = await handleDocumentToolCall('get_application_documents', args);

                expect(result.success).toBe(true);
                expect(result.documents).toBeDefined();
                expect(result.documents!).toHaveLength(1);
                expect(result.documents![0]).toEqual({
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
                });
                expect(result.totalCount).toBe(1);
            });

            it('should handle empty results', async () => {
                vi.mocked(documentService.getDocumentsByApplicationId).mockResolvedValue([]);

                const args = {
                    applicationId: mockApplicationId
                };

                const result = await handleDocumentToolCall('get_application_documents', args);

                expect(result.success).toBe(true);
                expect(result.documents).toBeDefined();
                expect(result.documents!).toEqual([]);
                expect(result.totalCount).toBe(0);
            });
        });

        describe('get_document_details', () => {
            it('should get document details', async () => {
                vi.mocked(documentService.getDocumentById).mockResolvedValue(mockDocument as any);

                const args = {
                    applicationId: mockApplicationId,
                    documentId: mockDocumentId,
                    includeDownloadUrl: false
                };

                const result = await handleDocumentToolCall('get_document_details', args);

                expect(result.success).toBe(true);
                expect(result.document).toBeDefined();
                expect(result.document!.id).toBe(mockDocumentId);
                expect(result.document!.verificationDetails).toEqual(mockDocument.extractedData.verification);
            });

            it('should include download URL when requested', async () => {
                const documentWithUrl = { ...mockDocument, downloadUrl: 'https://example.com/download' };
                vi.mocked(documentService.getDocumentById).mockResolvedValue(documentWithUrl as any);

                const args = {
                    applicationId: mockApplicationId,
                    documentId: mockDocumentId,
                    includeDownloadUrl: true
                };

                const result = await handleDocumentToolCall('get_document_details', args);

                expect(result.success).toBe(true);
                expect(result.document).toBeDefined();
                expect(result.document!.downloadUrl).toBe('https://example.com/download');
            });
        });

        describe('delete_document', () => {
            it('should delete document successfully', async () => {
                vi.mocked(documentService.deleteDocument).mockResolvedValue(mockDocument as any);

                const args = {
                    applicationId: mockApplicationId,
                    documentId: mockDocumentId
                };

                const result = await handleDocumentToolCall('delete_document', args);

                expect(result.success).toBe(true);
                expect(result.message).toContain('deleted successfully');
                expect(result.deletedDocument).toEqual({
                    id: mockDocumentId,
                    fileName: 'license.pdf',
                    type: 'drivers_license'
                });
            });
        });

        describe('check_document_verification_status', () => {
            it('should return verification status', async () => {
                vi.mocked(documentService.getDocumentById).mockResolvedValue(mockDocument as any);

                const args = {
                    documentId: mockDocumentId
                };

                const result = await handleDocumentToolCall('check_document_verification_status', args);

                expect(result.success).toBe(true);
                expect(result.verification).toEqual({
                    documentId: mockDocumentId,
                    status: 'verified',
                    provider: 'Mock Provider',
                    confidence: 0.95,
                    verifiedAt: '2023-09-13T14:32:45.000Z',
                    details: mockDocument.extractedData.verification
                });
            });
        });

        describe('Error handling', () => {
            it('should handle ApiError', async () => {
                vi.mocked(documentService.getDocumentById).mockRejectedValue(
                    new ApiError(404, 'Document not found')
                );

                const args = {
                    applicationId: mockApplicationId,
                    documentId: mockDocumentId
                };

                const result = await handleDocumentToolCall('get_document_details', args);

                expect(result.success).toBe(false);
                expect(result.error).toBe('Document not found');
                expect(result.code).toBe(404);
            });

            it('should handle validation errors', async () => {
                const args = {
                    // Missing required applicationId
                    documentId: mockDocumentId
                };

                const result = await handleDocumentToolCall('get_document_details', args);

                expect(result.success).toBe(false);
                expect(result.error).toBe('Invalid parameters');
                expect(result.details).toBeDefined();
            });

            it('should handle unknown tool', async () => {
                const result = await handleDocumentToolCall('unknown_tool', {});

                expect(result.success).toBe(false);
                expect(result.error).toContain('Unknown tool');
            });

            it('should handle generic errors', async () => {
                vi.mocked(documentService.getDocumentById).mockRejectedValue(
                    new Error('Database connection failed')
                );

                const args = {
                    applicationId: mockApplicationId,
                    documentId: mockDocumentId
                };

                const result = await handleDocumentToolCall('get_document_details', args);

                expect(result.success).toBe(false);
                expect(result.error).toBe('Database connection failed');
            });
        });

        describe('Parameter validation', () => {
            it('should validate required parameters for upload_document', async () => {
                const args = {
                    // Missing required fields
                    type: 'drivers_license'
                };

                const result = await handleDocumentToolCall('upload_document', args);

                expect(result.success).toBe(false);
                expect(result.error).toBe('Invalid parameters');
            });

            it('should validate enum values', async () => {
                const args = {
                    applicationId: mockApplicationId,
                    type: 'invalid_document_type',
                    fileName: 'test.pdf',
                    fileSize: 1024,
                    mimeType: 'application/pdf',
                    fileContent: 'dGVzdA=='
                };

                const result = await handleDocumentToolCall('upload_document', args);

                expect(result.success).toBe(false);
                expect(result.error).toBe('Invalid parameters');
            });

            it('should validate MIME types', async () => {
                const args = {
                    applicationId: mockApplicationId,
                    type: 'drivers_license',
                    fileName: 'test.txt',
                    fileSize: 1024,
                    mimeType: 'text/plain',
                    fileContent: 'dGVzdA=='
                };

                const result = await handleDocumentToolCall('upload_document', args);

                expect(result.success).toBe(false);
                expect(result.error).toBe('Invalid parameters');
            });
        });
    });
});