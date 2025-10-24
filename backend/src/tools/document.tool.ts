import { zodToJsonSchema } from 'zod-to-json-schema';
import { documentService } from '../services/index.ts';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import ApiError from '../utils/ApiError.ts';
import { z } from 'zod';

// Zod schemas for tool parameters
const uploadDocumentSchema = z.object({
    applicationId: z.string().describe('Application ID to upload document to'),
    type: z.enum(['drivers_license', 'passport', 'utility_bill', 'bank_statement', 'tax_document', 'other']).describe('Type of document being uploaded'),
    fileName: z.string().describe('Original file name'),
    fileSize: z.number().positive().describe('File size in bytes'),
    mimeType: z.enum(['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']).describe('MIME type of the file'),
    fileContent: z.string().describe('Base64 encoded file content'),
    signerId: z.string().optional().describe('Optional signer ID for multi-signer applications')
});

const getDocumentsSchema = z.object({
    applicationId: z.string().describe('Application ID to get documents for')
});

const getDocumentSchema = z.object({
    applicationId: z.string().describe('Application ID'),
    documentId: z.string().describe('Document ID to retrieve'),
    includeDownloadUrl: z.boolean().optional().default(false).describe('Whether to include download URL in response')
});

const deleteDocumentSchema = z.object({
    applicationId: z.string().describe('Application ID'),
    documentId: z.string().describe('Document ID to delete')
});

const verifyDocumentSchema = z.object({
    documentId: z.string().describe('Document ID to verify'),
    skipMockDelay: z.boolean().optional().default(false).describe('Skip mock verification delay for testing')
});

// Mock user ID for MCP operations (in real implementation, this would come from authentication)
const MOCK_USER_ID = 1;

export const documentTools: Tool[] = [
    {
        name: 'upload_document',
        description: 'Upload a document for an account opening application with automatic verification',
        inputSchema: zodToJsonSchema(uploadDocumentSchema) as any
    },
    {
        name: 'get_application_documents',
        description: 'Get all documents for a specific application',
        inputSchema: zodToJsonSchema(getDocumentsSchema) as any
    },
    {
        name: 'get_document_details',
        description: 'Get detailed information about a specific document including verification results',
        inputSchema: zodToJsonSchema(getDocumentSchema) as any
    },
    {
        name: 'delete_document',
        description: 'Delete a document from an application (removes from storage and database)',
        inputSchema: zodToJsonSchema(deleteDocumentSchema) as any
    },
    {
        name: 'check_document_verification_status',
        description: 'Check the verification status and results for a document',
        inputSchema: zodToJsonSchema(verifyDocumentSchema) as any
    }
];

export const handleDocumentToolCall = async (toolName: string, args: any) => {
    try {
        switch (toolName) {
            case 'upload_document': {
                const params = uploadDocumentSchema.parse(args);
                
                // Convert base64 to buffer and create mock file object
                const fileBuffer = Buffer.from(params.fileContent, 'base64');
                const mockFile = {
                    originalname: params.fileName,
                    size: params.fileSize,
                    mimetype: params.mimeType,
                    buffer: fileBuffer,
                    fieldname: 'file',
                    encoding: '7bit'
                } as Express.Multer.File;

                // Validate file size and type
                const validation = documentService.validateFile(mockFile);
                if (!validation.isValid) {
                    return {
                        success: false,
                        error: `File validation failed: ${validation.errors.join(', ')}`
                    };
                }

                const document = await documentService.uploadDocument(
                    params.applicationId,
                    MOCK_USER_ID,
                    {
                        type: params.type,
                        signerId: params.signerId
                    },
                    mockFile
                );

                return {
                    success: true,
                    document: {
                        id: document.id,
                        applicationId: document.applicationId,
                        type: document.type,
                        fileName: document.fileName,
                        fileSize: document.fileSize,
                        mimeType: document.mimeType,
                        uploadedAt: document.uploadedAt.toISOString(),
                        verificationStatus: document.verificationStatus,
                        signerId: document.signerId
                    }
                };
            }

            case 'get_application_documents': {
                const params = getDocumentsSchema.parse(args);
                
                const documents = await documentService.getDocumentsByApplicationId(
                    params.applicationId,
                    MOCK_USER_ID
                );

                return {
                    success: true,
                    documents: documents.map(doc => ({
                        id: doc.id,
                        applicationId: doc.applicationId,
                        type: doc.type,
                        fileName: doc.fileName,
                        fileSize: doc.fileSize,
                        mimeType: doc.mimeType,
                        uploadedAt: doc.uploadedAt.toISOString(),
                        verificationStatus: doc.verificationStatus,
                        verificationProvider: doc.verificationProvider,
                        verificationConfidence: doc.verificationConfidence,
                        verifiedAt: doc.verifiedAt?.toISOString() || null,
                        signerId: doc.signerId
                    })),
                    totalCount: documents.length
                };
            }

            case 'get_document_details': {
                const params = getDocumentSchema.parse(args);
                
                const document = await documentService.getDocumentById(
                    params.applicationId,
                    params.documentId,
                    MOCK_USER_ID,
                    params.includeDownloadUrl
                );

                // Extract verification details
                let verificationDetails = null;
                if (document.extractedData && typeof document.extractedData === 'object') {
                    const extractedData = document.extractedData as any;
                    if (extractedData.verification) {
                        verificationDetails = extractedData.verification;
                    }
                }

                return {
                    success: true,
                    document: {
                        id: document.id,
                        applicationId: document.applicationId,
                        type: document.type,
                        fileName: document.fileName,
                        fileSize: document.fileSize,
                        mimeType: document.mimeType,
                        uploadedAt: document.uploadedAt.toISOString(),
                        verificationStatus: document.verificationStatus,
                        verificationProvider: document.verificationProvider,
                        verificationConfidence: document.verificationConfidence,
                        verifiedAt: document.verifiedAt?.toISOString() || null,
                        signerId: document.signerId,
                        verificationDetails,
                        downloadUrl: (document as any).downloadUrl
                    }
                };
            }

            case 'delete_document': {
                const params = deleteDocumentSchema.parse(args);
                
                const deletedDocument = await documentService.deleteDocument(
                    params.applicationId,
                    params.documentId,
                    MOCK_USER_ID
                );

                return {
                    success: true,
                    message: `Document ${deletedDocument.fileName} deleted successfully`,
                    deletedDocument: {
                        id: deletedDocument.id,
                        fileName: deletedDocument.fileName,
                        type: deletedDocument.type
                    }
                };
            }

            case 'check_document_verification_status': {
                const params = verifyDocumentSchema.parse(args);
                
                // Get document by ID (we need applicationId, so we'll need to find it first)
                const document = await documentService.getDocumentById(
                    '', // We'll need to handle this differently in a real implementation
                    params.documentId,
                    MOCK_USER_ID
                );

                // Extract verification details
                let verificationDetails = null;
                if (document.extractedData && typeof document.extractedData === 'object') {
                    const extractedData = document.extractedData as any;
                    if (extractedData.verification) {
                        verificationDetails = extractedData.verification;
                    }
                }

                return {
                    success: true,
                    verification: {
                        documentId: document.id,
                        status: document.verificationStatus,
                        provider: document.verificationProvider,
                        confidence: document.verificationConfidence,
                        verifiedAt: document.verifiedAt?.toISOString() || null,
                        details: verificationDetails
                    }
                };
            }

            default:
                throw new ApiError(400, `Unknown tool: ${toolName}`);
        }
    } catch (error) {
        if (error instanceof ApiError) {
            return {
                success: false,
                error: error.message,
                code: error.statusCode
            };
        }
        
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: 'Invalid parameters',
                details: error.errors
            };
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

export default {
    tools: documentTools,
    handler: handleDocumentToolCall
};