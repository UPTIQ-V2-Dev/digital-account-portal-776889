import Joi from 'joi';

// Valid document types as per API specification
const validDocumentTypes = [
    'drivers_license',
    'passport',
    'utility_bill',
    'bank_statement',
    'tax_document',
    'other'
];

// Valid MIME types for document uploads
const validMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
];

const uploadDocument = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    }),
    body: Joi.object().keys({
        type: Joi.string()
            .required()
            .valid(...validDocumentTypes)
            .messages({
                'any.only': `Document type must be one of: ${validDocumentTypes.join(', ')}`
            }),
        signerId: Joi.string().optional().allow('').trim()
    })
};

const getDocuments = {
    params: Joi.object().keys({
        applicationId: Joi.string().required()
    })
};

const getDocument = {
    params: Joi.object().keys({
        applicationId: Joi.string().required(),
        documentId: Joi.string().required()
    }),
    query: Joi.object().keys({
        download: Joi.boolean().optional().default(false)
    })
};

const deleteDocument = {
    params: Joi.object().keys({
        applicationId: Joi.string().required(),
        documentId: Joi.string().required()
    })
};

// Custom validation middleware for file uploads (to be used with multer)
const validateUploadedFile = (req: any, res: any, next: any) => {
    const file = req.file;
    
    if (!file) {
        return res.status(400).json({
            code: 400,
            message: 'No file uploaded'
        });
    }

    // Validate file size (10MB max)
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxFileSize) {
        return res.status(413).json({
            code: 413,
            message: 'File too large. Maximum size is 10MB'
        });
    }

    // Validate MIME type
    if (!validMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({
            code: 400,
            message: `Invalid file type. Allowed types: ${validMimeTypes.join(', ')}`
        });
    }

    // Validate file extension matches MIME type
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    const expectedExtensions: { [key: string]: string[] } = {
        'application/pdf': ['pdf'],
        'image/jpeg': ['jpg', 'jpeg'],
        'image/jpg': ['jpg', 'jpeg'],
        'image/png': ['png']
    };

    const allowedExtensions = expectedExtensions[file.mimetype];
    if (allowedExtensions && fileExtension && !allowedExtensions.includes(fileExtension)) {
        return res.status(400).json({
            code: 400,
            message: `File extension ${fileExtension} does not match MIME type ${file.mimetype}`
        });
    }

    next();
};

export default {
    uploadDocument,
    getDocuments,
    getDocument,
    deleteDocument,
    validateUploadedFile,
    validDocumentTypes,
    validMimeTypes
};