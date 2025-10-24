import { describe, it, expect, beforeEach, vi } from 'vitest';
import financialProfileController from '../financialProfile.controller.ts';
import { financialProfileService } from '../../services/index.ts';
import ApiError from '../../utils/ApiError.ts';
import httpStatus from 'http-status';

// Mock services
vi.mock('../../services/index.ts', () => ({
    financialProfileService: {
        createOrUpdateFinancialProfile: vi.fn(),
        getFinancialProfileByApplicationId: vi.fn(),
        deleteFinancialProfileByApplicationId: vi.fn(),
    }
}));

describe('Financial Profile Controller', () => {
    const mockUser = { id: 1, email: 'test@example.com', role: 'USER' };
    const next = vi.fn() as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockFinancialProfileData = {
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

    const mockFinancialProfileResponse = {
        id: 'fp_test_123',
        applicationId: 'app_test_123',
        ...mockFinancialProfileData,
        bankingRelationships: mockFinancialProfileData.bankingRelationships,
        accountActivities: mockFinancialProfileData.accountActivities
    };

    describe('createOrUpdateFinancialProfile', () => {
        it('should create financial profile successfully', async () => {
            const req = {
                params: { applicationId: 'app_test_123' },
                user: mockUser,
                body: mockFinancialProfileData
            } as any;

            const res = {
                status: vi.fn().mockReturnThis(),
                send: vi.fn()
            } as any;

            (financialProfileService.createOrUpdateFinancialProfile as any).mockResolvedValue(
                mockFinancialProfileResponse
            );

            await financialProfileController.createOrUpdateFinancialProfile(req, res, next);

            expect(financialProfileService.createOrUpdateFinancialProfile).toHaveBeenCalledWith(
                'app_test_123',
                1,
                mockFinancialProfileData
            );

            expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
            expect(res.send).toHaveBeenCalledWith({
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
            });
        });

        it('should handle service errors', async () => {
            const req = {
                params: { applicationId: 'app_test_123' },
                user: mockUser,
                body: mockFinancialProfileData
            } as any;

            const res = {
                status: vi.fn().mockReturnThis(),
                send: vi.fn()
            } as any;

            const error = new ApiError(httpStatus.NOT_FOUND, 'Application not found');
            (financialProfileService.createOrUpdateFinancialProfile as any).mockRejectedValue(error);

            await expect(
                financialProfileController.createOrUpdateFinancialProfile(req, res, next)
            ).rejects.toThrow(error);
        });
    });

    describe('getFinancialProfile', () => {
        it('should get financial profile successfully', async () => {
            const req = {
                params: { applicationId: 'app_test_123' },
                user: mockUser
            } as any;

            const res = {
                status: vi.fn().mockReturnThis(),
                send: vi.fn()
            } as any;

            (financialProfileService.getFinancialProfileByApplicationId as any).mockResolvedValue(
                mockFinancialProfileResponse
            );

            await financialProfileController.getFinancialProfile(req, res, next);

            expect(financialProfileService.getFinancialProfileByApplicationId).toHaveBeenCalledWith(
                'app_test_123',
                1
            );

            expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
            expect(res.send).toHaveBeenCalledWith({
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
            });
        });

        it('should return 404 if financial profile not found', async () => {
            const req = {
                params: { applicationId: 'app_test_123' },
                user: mockUser
            } as any;

            const res = {
                status: vi.fn().mockReturnThis(),
                send: vi.fn()
            } as any;

            (financialProfileService.getFinancialProfileByApplicationId as any).mockResolvedValue(null);

            await expect(
                financialProfileController.getFinancialProfile(req, res, next)
            ).rejects.toThrow(new ApiError(httpStatus.NOT_FOUND, 'Financial profile not found'));
        });

        it('should handle service errors', async () => {
            const req = {
                params: { applicationId: 'app_test_123' },
                user: mockUser
            } as any;

            const res = {
                status: vi.fn().mockReturnThis(),
                send: vi.fn()
            } as any;

            const error = new ApiError(httpStatus.NOT_FOUND, 'Application not found');
            (financialProfileService.getFinancialProfileByApplicationId as any).mockRejectedValue(error);

            await expect(
                financialProfileController.getFinancialProfile(req, res, next)
            ).rejects.toThrow(error);
        });
    });

    describe('deleteFinancialProfile', () => {
        it('should delete financial profile successfully', async () => {
            const req = {
                params: { applicationId: 'app_test_123' },
                user: mockUser
            } as any;

            const res = {
                status: vi.fn().mockReturnThis(),
                send: vi.fn()
            } as any;

            (financialProfileService.deleteFinancialProfileByApplicationId as any).mockResolvedValue(
                mockFinancialProfileResponse
            );

            await financialProfileController.deleteFinancialProfile(req, res, next);

            expect(financialProfileService.deleteFinancialProfileByApplicationId).toHaveBeenCalledWith(
                'app_test_123',
                1
            );

            expect(res.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
            expect(res.send).toHaveBeenCalled();
        });

        it('should handle service errors', async () => {
            const req = {
                params: { applicationId: 'app_test_123' },
                user: mockUser
            } as any;

            const res = {
                status: vi.fn().mockReturnThis(),
                send: vi.fn()
            } as any;

            const error = new ApiError(httpStatus.NOT_FOUND, 'Financial profile not found');
            (financialProfileService.deleteFinancialProfileByApplicationId as any).mockRejectedValue(error);

            await expect(
                financialProfileController.deleteFinancialProfile(req, res, next)
            ).rejects.toThrow(error);
        });
    });
});