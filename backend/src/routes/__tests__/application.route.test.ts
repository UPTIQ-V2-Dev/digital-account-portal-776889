import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import applicationRoute from '../v1/application.route.ts';
import { applicationService } from '../../services/index.ts';

// Mock the application service
vi.mock('../../services/index.ts', () => ({
    applicationService: {
        createApplication: vi.fn(),
        queryApplications: vi.fn(),
        getApplicationById: vi.fn(),
        getApplicationSummary: vi.fn(),
        updateApplicationById: vi.fn(),
        submitApplication: vi.fn(),
        deleteApplicationById: vi.fn(),
    },
}));

// Mock auth middleware
vi.mock('../../middlewares/auth.ts', () => ({
    default: () => (req: any, res: any, next: any) => {
        req.user = { id: 1, role: 'USER' };
        next();
    },
}));

// Mock validate middleware
vi.mock('../../middlewares/validate.ts', () => ({
    default: () => (req: any, res: any, next: any) => {
        req.validatedQuery = req.query;
        next();
    },
}));

const app = express();
app.use(express.json());
app.use('/account-opening/applications', applicationRoute);

const mockApplicationService = applicationService as any;

describe('Application Routes', () => {
    const mockApplication = {
        id: 'app_test_123',
        status: 'draft',
        currentStep: 'account_type',
        accountType: 'consumer',
        customerType: 'new',
        applicantId: 'applicant_ABC123DEF',
        submittedAt: null,
        completedAt: null,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
        userAgent: 'Mozilla/5.0',
        ipAddress: '127.0.0.1',
        sessionId: 'session_123',
        startedAt: new Date('2023-01-01T00:00:00Z'),
        lastActivity: new Date('2023-01-01T00:00:00Z'),
        source: 'web_portal',
        userId: 1,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /account-opening/applications', () => {
        it('should create a new application', async () => {
            mockApplicationService.createApplication.mockResolvedValue(mockApplication);

            const response = await request(app)
                .post('/account-opening/applications')
                .send({ accountType: 'consumer' })
                .expect(201);

            expect(response.body).toMatchObject({
                id: 'app_test_123',
                status: 'draft',
                currentStep: 'account_type',
                accountType: 'consumer',
                customerType: 'new',
                applicantId: 'applicant_ABC123DEF',
                metadata: expect.any(Object),
            });
        });

        it('should return 400 for invalid account type', async () => {
            await request(app)
                .post('/account-opening/applications')
                .send({ accountType: 'invalid' })
                .expect(400);
        });
    });

    describe('GET /account-opening/applications', () => {
        it('should get all applications', async () => {
            const mockApplications = [mockApplication];
            mockApplicationService.queryApplications.mockResolvedValue(mockApplications);

            const response = await request(app)
                .get('/account-opening/applications')
                .expect(200);

            expect(response.body).toEqual(mockApplications);
        });

        it('should filter applications by status', async () => {
            mockApplicationService.queryApplications.mockResolvedValue([]);

            await request(app)
                .get('/account-opening/applications?status=draft')
                .expect(200);

            expect(mockApplicationService.queryApplications).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'draft' }),
                expect.any(Object)
            );
        });

        it('should paginate applications', async () => {
            mockApplicationService.queryApplications.mockResolvedValue([]);

            await request(app)
                .get('/account-opening/applications?page=2&limit=5')
                .expect(200);

            expect(mockApplicationService.queryApplications).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining({ page: '2', limit: '5' })
            );
        });
    });

    describe('GET /account-opening/applications/:applicationId', () => {
        it('should get application by ID', async () => {
            mockApplicationService.getApplicationById.mockResolvedValue(mockApplication);

            const response = await request(app)
                .get('/account-opening/applications/app_test_123')
                .expect(200);

            expect(response.body).toMatchObject({
                id: 'app_test_123',
                status: 'draft',
                accountType: 'consumer',
                metadata: expect.any(Object),
            });
        });

        it('should return 404 if application not found', async () => {
            mockApplicationService.getApplicationById.mockResolvedValue(null);

            await request(app)
                .get('/account-opening/applications/nonexistent')
                .expect(404);
        });
    });

    describe('PUT /account-opening/applications/:applicationId', () => {
        it('should update application', async () => {
            const updatedApplication = { ...mockApplication, status: 'in_progress' };
            mockApplicationService.updateApplicationById.mockResolvedValue(updatedApplication);

            const response = await request(app)
                .put('/account-opening/applications/app_test_123')
                .send({ status: 'in_progress', currentStep: 'personal_info' })
                .expect(200);

            expect(response.body.status).toBe('in_progress');
            expect(mockApplicationService.updateApplicationById).toHaveBeenCalledWith(
                'app_test_123',
                1,
                { status: 'in_progress', currentStep: 'personal_info' }
            );
        });

        it('should return 400 for invalid status', async () => {
            await request(app)
                .put('/account-opening/applications/app_test_123')
                .send({ status: 'invalid_status' })
                .expect(400);
        });
    });

    describe('DELETE /account-opening/applications/:applicationId', () => {
        it('should delete application', async () => {
            mockApplicationService.deleteApplicationById.mockResolvedValue(mockApplication);

            await request(app)
                .delete('/account-opening/applications/app_test_123')
                .expect(204);

            expect(mockApplicationService.deleteApplicationById).toHaveBeenCalledWith(
                'app_test_123',
                1
            );
        });
    });

    describe('POST /account-opening/applications/submit', () => {
        it('should submit application', async () => {
            const submitResult = {
                submitted: true,
                applicationId: 'app_test_123',
                message: 'Application submitted successfully',
            };
            mockApplicationService.submitApplication.mockResolvedValue(submitResult);

            const response = await request(app)
                .post('/account-opening/applications/submit')
                .send({
                    applicationId: 'app_test_123',
                    finalReview: true,
                    electronicConsent: true,
                })
                .expect(200);

            expect(response.body).toEqual(submitResult);
        });

        it('should return 400 if finalReview is false', async () => {
            await request(app)
                .post('/account-opening/applications/submit')
                .send({
                    applicationId: 'app_test_123',
                    finalReview: false,
                    electronicConsent: true,
                })
                .expect(400);
        });

        it('should return 400 if electronicConsent is false', async () => {
            await request(app)
                .post('/account-opening/applications/submit')
                .send({
                    applicationId: 'app_test_123',
                    finalReview: true,
                    electronicConsent: false,
                })
                .expect(400);
        });
    });

    describe('GET /account-opening/applications/:applicationId/summary', () => {
        it('should get application summary', async () => {
            const mockSummary = {
                application: {
                    id: 'app_test_123',
                    status: 'draft',
                    currentStep: 'account_type',
                    accountType: 'consumer',
                    customerType: 'new',
                    applicantId: 'applicant_ABC123DEF',
                    submittedAt: null,
                    completedAt: null,
                    createdAt: '2023-01-01T00:00:00.000Z',
                    updatedAt: '2023-01-01T00:00:00.000Z',
                },
                personalInfo: null,
                businessProfile: null,
                financialProfile: null,
                productSelections: [],
                documents: [],
                kycVerification: null,
                additionalSigners: [],
                riskAssessment: null,
                agreements: [],
                signatures: [],
                fundingSetup: null,
            };
            mockApplicationService.getApplicationSummary.mockResolvedValue(mockSummary);

            const response = await request(app)
                .get('/account-opening/applications/app_test_123/summary')
                .expect(200);

            expect(response.body).toEqual(mockSummary);
        });

        it('should return 404 if application summary not found', async () => {
            mockApplicationService.getApplicationSummary.mockResolvedValue(null);

            await request(app)
                .get('/account-opening/applications/nonexistent/summary')
                .expect(404);
        });
    });
});