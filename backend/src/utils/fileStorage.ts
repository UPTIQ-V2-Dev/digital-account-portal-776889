import ApiError from './ApiError.ts';
import fs from 'fs';
import httpStatus from 'http-status';
import multer from 'multer';
import path from 'path';

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_FILES: 1 // Only allow 1 file per upload
};

// Allowed document types
export const ALLOWED_DOCUMENT_TYPES = [
    'drivers_license',
    'passport',
    'utility_bill',
    'bank_statement',
    'tax_return',
    'social_security_card',
    'birth_certificate',
    'government_id',
    'proof_of_address',
    'business_license',
    'articles_of_incorporation',
    'other'
];

// Allowed MIME types
export const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/tiff',
    'image/bmp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads', 'documents');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp_applicationId_documentType_originalName
        const timestamp = Date.now();
        const applicationId = req.body.applicationId || 'unknown';
        const documentType = req.body.documentType || 'unknown';
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext);
        const cleanBasename = basename.replace(/[^a-zA-Z0-9]/g, '_');

        const filename = `${timestamp}_${applicationId}_${documentType}_${cleanBasename}${ext}`;
        cb(null, filename);
    }
});

// File filter to validate file types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(new ApiError(httpStatus.BAD_REQUEST, `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`));
        return;
    }

    // Check document type
    const documentType = req.body.documentType;
    if (!documentType || !ALLOWED_DOCUMENT_TYPES.includes(documentType)) {
        cb(
            new ApiError(
                httpStatus.BAD_REQUEST,
                `Invalid document type. Allowed types: ${ALLOWED_DOCUMENT_TYPES.join(', ')}`
            )
        );
        return;
    }

    cb(null, true);
};

// Configure multer upload
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: FILE_SIZE_LIMITS.MAX_FILE_SIZE,
        files: FILE_SIZE_LIMITS.MAX_FILES
    }
});

// Mock document verification service
export interface VerificationResult {
    provider: string;
    confidence: number;
    extractedData: Record<string, any>;
    verificationId: string;
    verifiedAt: Date;
    status: 'verified' | 'rejected' | 'needs_review';
    issues?: string[];
}

export const mockDocumentVerification = async (
    _filePath: string,
    documentType: string
): Promise<VerificationResult> => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock verification logic based on document type
    const baseResult = {
        provider: 'Mock Provider',
        verificationId: `verify_${Date.now()}`,
        verifiedAt: new Date()
    };

    // Simulate different verification outcomes
    const random = Math.random();

    if (random < 0.8) {
        // 80% chance of successful verification
        return {
            ...baseResult,
            status: 'verified' as const,
            confidence: 0.85 + Math.random() * 0.15, // 0.85 - 1.0
            extractedData: getMockExtractedData(documentType)
        };
    } else if (random < 0.95) {
        // 15% chance of needs review
        return {
            ...baseResult,
            status: 'needs_review' as const,
            confidence: 0.5 + Math.random() * 0.3, // 0.5 - 0.8
            extractedData: getMockExtractedData(documentType),
            issues: ['Image quality could be improved', 'Some text partially obscured']
        };
    } else {
        // 5% chance of rejection
        return {
            ...baseResult,
            status: 'rejected' as const,
            confidence: 0.1 + Math.random() * 0.4, // 0.1 - 0.5
            extractedData: {},
            issues: ['Document appears to be invalid', 'Unable to verify authenticity']
        };
    }
};

const getMockExtractedData = (documentType: string): Record<string, any> => {
    switch (documentType) {
        case 'drivers_license':
            return {
                name: 'John Doe',
                license_number: `D${Math.floor(Math.random() * 900000000 + 100000000)}`,
                date_of_birth: '1990-01-15',
                address: '123 Main St, Anytown, CA 12345',
                expiration_date: '2028-01-15',
                state: 'CA'
            };
        case 'passport':
            return {
                name: 'John Doe',
                passport_number: `P${Math.floor(Math.random() * 90000000 + 10000000)}`,
                date_of_birth: '1990-01-15',
                nationality: 'USA',
                expiration_date: '2032-01-15',
                issue_date: '2022-01-15'
            };
        case 'utility_bill':
            return {
                account_holder: 'John Doe',
                service_address: '123 Main St, Anytown, CA 12345',
                bill_date: new Date().toISOString().split('T')[0],
                amount_due: '$125.50',
                utility_company: 'City Electric & Gas'
            };
        case 'bank_statement':
            return {
                account_holder: 'John Doe',
                account_number: `****${Math.floor(Math.random() * 9000 + 1000)}`,
                statement_date: new Date().toISOString().split('T')[0],
                balance: `$${(Math.random() * 50000 + 5000).toFixed(2)}`,
                bank_name: 'First National Bank'
            };
        default:
            return {
                document_type: documentType,
                processed: true,
                extracted_text: 'Sample extracted text content'
            };
    }
};

// Helper function to delete file
export const deleteFile = (filePath: string): void => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        // Don't throw error for file deletion failures
    }
};

// Helper function to get file path
export const getDocumentPath = (fileName: string): string => {
    return path.join(uploadsDir, fileName);
};

// Validate file size
export const validateFileSize = (fileSize: number): void => {
    if (fileSize > FILE_SIZE_LIMITS.MAX_FILE_SIZE) {
        throw new ApiError(httpStatus.REQUEST_ENTITY_TOO_LARGE, 'File too large');
    }
};
