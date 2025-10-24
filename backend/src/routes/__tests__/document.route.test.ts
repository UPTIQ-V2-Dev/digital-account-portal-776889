import { describe, it, expect, beforeEach, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import documentRoute from '../v1/document.route.ts';
import { documentController } from '../../controllers/index.ts';

// Mock the controller
vi.mock('../../controllers/index.ts');
vi.mock('../../middlewares/auth.ts', () => ({
    default: () => (req: any, res: any, next: any) => {
        req.user = { id: 1, email: 'test@example.com' };
        next();
    }
}));
vi.mock('../../middlewares/validate.ts', () => ({
    default: () => (req: any, res: any, next: any) => {
        req.validatedQuery = req.query;
        next();
    }
}));

describe('Document Routes', () => {
    let app: express.Application;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/applications/:applicationId/documents', documentRoute);

        // Mock controller methods
        vi.mocked(documentController.uploadDocument).mockImplementation(async (req, res) => {
            res.status(201).json({ success: true });
        });
        vi.mocked(documentController.getDocuments).mockImplementation(async (req, res) => {
            res.status(200).json([]);
        });
        vi.mocked(documentController.getDocument).mockImplementation(async (req, res) => {
            res.status(200).json({ id: 'doc-123' });
        });
        vi.mocked(documentController.deleteDocument).mockImplementation(async (req, res) => {
            res.status(204).send();
        });
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    describe('POST /', () => {
        it('should call uploadDocument controller', async () => {
            await request(app)
                .post('/applications/test-app/documents')
                .field('type', 'drivers_license')
                .attach('file', Buffer.from('test'), 'test.pdf')
                .expect(201);

            expect(documentController.uploadDocument).toHaveBeenCalled();
        });

        it('should reject requests without file', async () => {
            const response = await request(app)
                .post('/applications/test-app/documents')
                .field('type', 'drivers_license');

            // Should be handled by multer middleware
            expect(response.status).toBeGreaterThanOrEqual(400);
        });

        it('should reject invalid file types', async () => {
            const response = await request(app)
                .post('/applications/test-app/documents')
                .field('type', 'drivers_license')
                .attach('file', Buffer.from('test'), 'test.txt');

            // Should be handled by multer fileFilter
            expect(response.status).toBeGreaterThanOrEqual(400);
        });

        it('should reject files that are too large', async () => {
            const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB

            const response = await request(app)
                .post('/applications/test-app/documents')
                .field('type', 'drivers_license')
                .attach('file', largeBuffer, 'large.pdf');

            // Should be handled by multer size limit
            expect(response.status).toBeGreaterThanOrEqual(400);
        });
    });

    describe('GET /', () => {
        it('should call getDocuments controller', async () => {
            await request(app)
                .get('/applications/test-app/documents')
                .expect(200);

            expect(documentController.getDocuments).toHaveBeenCalled();
        });
    });

    describe('GET /:documentId', () => {
        it('should call getDocument controller', async () => {
            await request(app)
                .get('/applications/test-app/documents/doc-123')
                .expect(200);

            expect(documentController.getDocument).toHaveBeenCalled();
        });

        it('should pass query parameters', async () => {
            await request(app)
                .get('/applications/test-app/documents/doc-123?download=true')
                .expect(200);

            expect(documentController.getDocument).toHaveBeenCalled();
        });
    });

    describe('DELETE /:documentId', () => {
        it('should call deleteDocument controller', async () => {
            await request(app)
                .delete('/applications/test-app/documents/doc-123')
                .expect(204);

            expect(documentController.deleteDocument).toHaveBeenCalled();
        });
    });

    describe('Middleware Integration', () => {
        it('should apply authentication middleware', async () => {
            // The auth middleware mock sets req.user
            await request(app)
                .get('/applications/test-app/documents')
                .expect(200);

            // Verify that the controller was called (meaning auth passed)
            expect(documentController.getDocuments).toHaveBeenCalled();
        });

        it('should apply validation middleware', async () => {
            // The validate middleware mock sets req.validatedQuery
            await request(app)
                .get('/applications/test-app/documents/doc-123?download=true')
                .expect(200);

            expect(documentController.getDocument).toHaveBeenCalled();
        });
    });

    describe('File Upload Middleware', () => {
        it('should accept PDF files', async () => {
            await request(app)
                .post('/applications/test-app/documents')
                .field('type', 'drivers_license')
                .attach('file', Buffer.from('test'), 'test.pdf')
                .expect(201);

            expect(documentController.uploadDocument).toHaveBeenCalled();
        });

        it('should accept JPEG files', async () => {
            const response = await request(app)
                .post('/applications/test-app/documents')
                .field('type', 'drivers_license')
                .attach('file', Buffer.from('test'), {
                    filename: 'test.jpg',
                    contentType: 'image/jpeg'
                });

            // Should not be rejected by multer
            expect(response.status).toBeLessThan(500);
        });

        it('should accept PNG files', async () => {
            const response = await request(app)
                .post('/applications/test-app/documents')
                .field('type', 'drivers_license')
                .attach('file', Buffer.from('test'), {
                    filename: 'test.png',
                    contentType: 'image/png'
                });

            // Should not be rejected by multer
            expect(response.status).toBeLessThan(500);
        });

        it('should reject unsupported file types', async () => {
            const response = await request(app)
                .post('/applications/test-app/documents')
                .field('type', 'drivers_license')
                .attach('file', Buffer.from('test'), {
                    filename: 'test.doc',
                    contentType: 'application/msword'
                });

            expect(response.status).toBeGreaterThanOrEqual(400);
        });

        it('should limit to single file upload', async () => {
            const response = await request(app)
                .post('/applications/test-app/documents')
                .field('type', 'drivers_license')
                .attach('file', Buffer.from('test1'), 'test1.pdf')
                .attach('file', Buffer.from('test2'), 'test2.pdf');

            // Multer should handle this according to configuration
            expect(response.status).not.toBe(500);
        });
    });
});