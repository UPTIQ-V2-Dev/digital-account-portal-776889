import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import financialProfileRoute from '../v1/financialProfile.route.ts';
import { financialProfileService } from '../../services/index.ts';
import httpStatus from 'http-status';

// Mock middlewares first
vi.mock('../../middlewares/auth.ts', () => ({
    default: vi.fn(() => (req: any, res: any, next: any) => {
        req.user = { id: 1, role: 'USER' };
        next();
    })
}));

vi.mock('../../middlewares/validate.ts', () => ({
    default: vi.fn(() => (req: any, res: any, next: any) => {
        req.validatedQuery = req.query;
        next();
    })
}));

// Mock services
vi.mock('../../services/index.ts', () => ({
    financialProfileService: {
        createOrUpdateFinancialProfile: vi.fn(),
        getFinancialProfileByApplicationId: vi.fn(),
        deleteFinancialProfileByApplicationId: vi.fn(),
    }
}));

describe('Financial Profile Routes Integration Tests', () => {
    let app: express.Application;
    const applicationId = 'app_test_123';

    beforeEach(() => {
        vi.clearAllMocks();
        app = express();
        app.use(express.json());
        // Mount the route with the applicationId parameter
        app.use('/:applicationId/financial-profile', (req, res, next) => {
            req.params.applicationId = req.params.applicationId;
            next();
        }, financialProfileRoute);
    });

    const validFinancialData = {
        annualIncome: 75000,
        incomeSource: ['employment'],
        employmentInfo: { employer: 'Tech Corp', position: 'Software Engineer' },
        assets: 50000,
        liabilities: 15000,
        bankingRelationships: [
            {
                bankName: 'First National Bank',
                accountTypes: ['checking', 'savings'],
                yearsWithBank: 5
            }
        ],
        accountActivities: [
            {
                activity: 'Direct Deposit',
                frequency: 'monthly',
                amount: 6250
            }
        ]
    };

    const mockServiceResponse = {
        id: 'fp_test_123',
        applicationId,
        ...validFinancialData,
        bankingRelationships: validFinancialData.bankingRelationships.map((br, i) => ({
            ...br,
            id: `br_${i}`,
            financialProfileId: 'fp_test_123'
        })),
        accountActivities: validFinancialData.accountActivities.map((aa, i) => ({
            ...aa,
            id: `aa_${i}`,
            financialProfileId: 'fp_test_123'
        }))
    };

    describe('PUT /:applicationId/financial-profile', () => {
        const endpoint = `/${applicationId}/financial-profile`;

        it('should create financial profile with valid data', async () => {
            (financialProfileService.createOrUpdateFinancialProfile as any).mockResolvedValue(mockServiceResponse);

            const response = await request(app)
                .put(endpoint)
                .send(validFinancialData);

            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toMatchObject({
                annualIncome: 75000,
                incomeSource: ['employment'],
                bankingRelationships: validFinancialData.bankingRelationships,
                accountActivities: validFinancialData.accountActivities
            });

            expect(financialProfileService.createOrUpdateFinancialProfile).toHaveBeenCalledWith(
                applicationId,
                1,
                validFinancialData
            );
        });

        it('should handle service errors correctly', async () => {
            const error = new Error('Application not found');
            (financialProfileService.createOrUpdateFinancialProfile as any).mockRejectedValue(error);

            await request(app)
                .put(endpoint)
                .send(validFinancialData);

            // The route should handle the error (status will depend on error handling middleware)
            expect(financialProfileService.createOrUpdateFinancialProfile).toHaveBeenCalledWith(
                applicationId,
                1,
                validFinancialData
            );
        });
    });

    describe('GET /:applicationId/financial-profile', () => {
        const endpoint = `/${applicationId}/financial-profile`;

        it('should get financial profile successfully', async () => {
            (financialProfileService.getFinancialProfileByApplicationId as any).mockResolvedValue(mockServiceResponse);

            const response = await request(app)
                .get(endpoint);

            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toMatchObject({
                annualIncome: 75000,
                incomeSource: ['employment'],
                bankingRelationships: validFinancialData.bankingRelationships,
                accountActivities: validFinancialData.accountActivities
            });

            expect(financialProfileService.getFinancialProfileByApplicationId).toHaveBeenCalledWith(
                applicationId,
                1
            );
        });

        it('should handle when financial profile not found', async () => {
            (financialProfileService.getFinancialProfileByApplicationId as any).mockResolvedValue(null);

            await request(app)
                .get(endpoint);

            // Should throw a 404 error in the controller
            expect(financialProfileService.getFinancialProfileByApplicationId).toHaveBeenCalledWith(
                applicationId,
                1
            );
        });
    });

    describe('DELETE /:applicationId/financial-profile', () => {
        const endpoint = `/${applicationId}/financial-profile`;

        it('should delete financial profile successfully', async () => {
            (financialProfileService.deleteFinancialProfileByApplicationId as any).mockResolvedValue(mockServiceResponse);

            const response = await request(app)
                .delete(endpoint);

            expect(response.status).toBe(httpStatus.NO_CONTENT);

            expect(financialProfileService.deleteFinancialProfileByApplicationId).toHaveBeenCalledWith(
                applicationId,
                1
            );
        });

        it('should handle service errors', async () => {
            const error = new Error('Financial profile not found');
            (financialProfileService.deleteFinancialProfileByApplicationId as any).mockRejectedValue(error);

            await request(app)
                .delete(endpoint);

            expect(financialProfileService.deleteFinancialProfileByApplicationId).toHaveBeenCalledWith(
                applicationId,
                1
            );
        });
    });

    describe('Route middleware integration', () => {
        it('should call authentication middleware', async () => {
            (financialProfileService.getFinancialProfileByApplicationId as any).mockResolvedValue(mockServiceResponse);

            await request(app)
                .get(`/${applicationId}/financial-profile`);

            // If auth middleware wasn't called, req.user wouldn't be set and service would fail
            expect(financialProfileService.getFinancialProfileByApplicationId).toHaveBeenCalledWith(
                applicationId,
                1 // This comes from the mocked auth middleware setting req.user.id
            );
        });

        it('should call validation middleware', async () => {
            (financialProfileService.createOrUpdateFinancialProfile as any).mockResolvedValue(mockServiceResponse);

            await request(app)
                .put(`/${applicationId}/financial-profile`)
                .send(validFinancialData);

            // The validation middleware should have processed the request
            expect(financialProfileService.createOrUpdateFinancialProfile).toHaveBeenCalled();
        });
    });
});