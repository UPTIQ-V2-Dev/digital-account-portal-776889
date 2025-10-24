import { documentService } from '../services/index.ts';
import ApiError from '../utils/ApiError.ts';
import catchAsyncWithAuth from '../utils/catchAsyncWithAuth.ts';
import httpStatus from 'http-status';

const uploadDocument = catchAsyncWithAuth(async (req, res) => {
    const { applicationId } = req.params;
    const userId = req.user.id;
    const documentData = req.body;
    const file = req.file;

    if (!file) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded');
    }

    const document = await documentService.uploadDocument(
        applicationId,
        userId,
        documentData,
        file
    );

    // Format response to match API specification
    const response = {
        id: document.id,
        applicationId: document.applicationId,
        type: document.type,
        fileName: document.fileName,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
        uploadedAt: document.uploadedAt.toISOString(),
        verificationStatus: document.verificationStatus
    };

    res.status(httpStatus.CREATED).send(response);
});

const getDocuments = catchAsyncWithAuth(async (req, res) => {
    const { applicationId } = req.params;
    const userId = req.user.id;

    const documents = await documentService.getDocumentsByApplicationId(
        applicationId,
        userId
    );

    // Format response to match API specification
    const response = documents.map(doc => ({
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
    }));

    res.send(response);
});

const getDocument = catchAsyncWithAuth(async (req, res) => {
    const { applicationId, documentId } = req.params;
    const userId = req.user.id;
    const { download } = req.validatedQuery || { download: false };

    const document = await documentService.getDocumentById(
        applicationId,
        documentId,
        userId,
        Boolean(download)
    );

    // Extract verification details from extractedData if available
    let verificationDetails = null;
    if (document.extractedData && typeof document.extractedData === 'object') {
        const extractedData = document.extractedData as any;
        if (extractedData.verification) {
            verificationDetails = {
                provider: extractedData.verification.provider,
                confidence: extractedData.verification.confidence,
                extractedData: extractedData.verification.extractedData
            };
        }
    }

    // Format response to match API specification
    const response = {
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
    };

    // If download is requested and URL is available, redirect
    if (download && (document as any).downloadUrl) {
        return res.redirect((document as any).downloadUrl);
    }

    res.send(response);
});

const deleteDocument = catchAsyncWithAuth(async (req, res) => {
    const { applicationId, documentId } = req.params;
    const userId = req.user.id;

    await documentService.deleteDocument(applicationId, documentId, userId);
    
    res.status(httpStatus.NO_CONTENT).send();
});

export default {
    uploadDocument,
    getDocuments,
    getDocument,
    deleteDocument
};