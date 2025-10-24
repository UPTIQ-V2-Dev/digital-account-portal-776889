import { describe, it, expect, beforeEach, vi } from 'vitest';
import financialProfileService from '../financialProfile.service.ts';
import prisma from '../../client.ts';
import ApiError from '../../utils/ApiError.ts';
import httpStatus from 'http-status';

// Mock Prisma client
vi.mock('../../client.ts', () => ({
    default: {
        application: {
            findFirst: vi.fn(),
        },
        financialProfile: {
            findUnique: vi.fn(),
            upsert: vi.fn(),
            delete: vi.fn(),
        },
        bankingRelationship: {
            deleteMany: vi.fn(),
            create: vi.fn(),
        },
        accountActivity: {
            deleteMany: vi.fn(),
            create: vi.fn(),
        },
        $transaction: vi.fn(),
    },
}));

const mockPrisma = prisma as any;

describe('Financial Profile Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockApplication = {
        id: 'app_test_123',
        userId: 1,
        status: 'draft',
        accountType: 'consumer'
    };

    const mockFinancialProfile = {
        id: 'fp_test_123',
        applicationId: 'app_test_123',
        annualIncome: 75000,
        incomeSource: ['employment'],
        employmentInfo: { employer: 'Tech Corp', position: 'Software Engineer' },
        assets: 50000,
        liabilities: 15000,
        bankingRelationships: [
            {
                id: 'br_test_123',
                bankName: 'First National Bank',
                accountTypes: ['checking', 'savings'],
                yearsWithBank: 5,
                financialProfileId: 'fp_test_123'
            }
        ],
        accountActivities: [
            {
                id: 'aa_test_123',
                activity: 'Direct Deposit',
                frequency: 'monthly',
                amount: 6250,
                financialProfileId: 'fp_test_123'
            }
        ]
    };

    const mockFinancialData = {
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

    describe('createOrUpdateFinancialProfile', () => {
        it('should create a new financial profile successfully', async () => {
            // Mock application exists
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
            
            // Mock transaction
            const mockCreatedProfile = { ...mockFinancialProfile };
            const mockBankingRelationships = [mockFinancialProfile.bankingRelationships[0]];
            const mockAccountActivities = [mockFinancialProfile.accountActivities[0]];
            
            mockPrisma.$transaction.mockImplementation(async (callback: any) => {
                return callback({
                    financialProfile: {
                        upsert: vi.fn().mockResolvedValue(mockCreatedProfile)
                    },
                    bankingRelationship: {
                        deleteMany: vi.fn().mockResolvedValue({}),
                        create: vi.fn().mockResolvedValue(mockBankingRelationships[0])
                    },
                    accountActivity: {
                        deleteMany: vi.fn().mockResolvedValue({}),
                        create: vi.fn().mockResolvedValue(mockAccountActivities[0])
                    }
                });
            });

            const result = await financialProfileService.createOrUpdateFinancialProfile(
                'app_test_123',
                1,
                mockFinancialData
            );

            expect(mockPrisma.application.findFirst).toHaveBeenCalledWith({
                where: { id: 'app_test_123', userId: 1 }
            });
            
            expect(result).toBeDefined();
            expect(result.annualIncome).toBe(75000);
            expect(result.incomeSource).toEqual(['employment']);
        });

        it('should throw error if application not found', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(null);

            await expect(
                financialProfileService.createOrUpdateFinancialProfile(
                    'app_test_123',
                    1,
                    mockFinancialData
                )
            ).rejects.toThrow(new ApiError(httpStatus.NOT_FOUND, 'Application not found'));
        });

        it('should throw error for negative annual income', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);

            const invalidData = {
                ...mockFinancialData,
                annualIncome: -1000
            };

            await expect(
                financialProfileService.createOrUpdateFinancialProfile(
                    'app_test_123',
                    1,
                    invalidData
                )
            ).rejects.toThrow(new ApiError(httpStatus.BAD_REQUEST, 'Annual income must be non-negative'));
        });

        it('should throw error for negative assets', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);

            const invalidData = {
                ...mockFinancialData,
                assets: -5000
            };

            await expect(
                financialProfileService.createOrUpdateFinancialProfile(
                    'app_test_123',
                    1,
                    invalidData
                )
            ).rejects.toThrow(new ApiError(httpStatus.BAD_REQUEST, 'Assets must be non-negative'));
        });

        it('should throw error for negative liabilities', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);

            const invalidData = {
                ...mockFinancialData,
                liabilities: -2000
            };

            await expect(
                financialProfileService.createOrUpdateFinancialProfile(
                    'app_test_123',
                    1,
                    invalidData
                )
            ).rejects.toThrow(new ApiError(httpStatus.BAD_REQUEST, 'Liabilities must be non-negative'));
        });

        it('should throw error for empty income sources', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);

            const invalidData = {
                ...mockFinancialData,
                incomeSource: []
            };

            await expect(
                financialProfileService.createOrUpdateFinancialProfile(
                    'app_test_123',
                    1,
                    invalidData
                )
            ).rejects.toThrow(new ApiError(httpStatus.BAD_REQUEST, 'At least one income source is required'));
        });

        it('should throw error for invalid income sources', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);

            const invalidData = {
                ...mockFinancialData,
                incomeSource: ['invalid_source']
            };

            await expect(
                financialProfileService.createOrUpdateFinancialProfile(
                    'app_test_123',
                    1,
                    invalidData
                )
            ).rejects.toThrow(new ApiError(httpStatus.BAD_REQUEST, 'Invalid income sources: invalid_source'));
        });

        it('should throw error for empty banking relationships', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);

            const invalidData = {
                ...mockFinancialData,
                bankingRelationships: []
            };

            await expect(
                financialProfileService.createOrUpdateFinancialProfile(
                    'app_test_123',
                    1,
                    invalidData
                )
            ).rejects.toThrow(new ApiError(httpStatus.BAD_REQUEST, 'At least one banking relationship is required'));
        });

        it('should throw error for empty account activities', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);

            const invalidData = {
                ...mockFinancialData,
                accountActivities: []
            };

            await expect(
                financialProfileService.createOrUpdateFinancialProfile(
                    'app_test_123',
                    1,
                    invalidData
                )
            ).rejects.toThrow(new ApiError(httpStatus.BAD_REQUEST, 'At least one account activity is required'));
        });

        it('should throw error for excessive annual income', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);

            const invalidData = {
                ...mockFinancialData,
                annualIncome: 20000000 // Over $10M limit
            };

            await expect(
                financialProfileService.createOrUpdateFinancialProfile(
                    'app_test_123',
                    1,
                    invalidData
                )
            ).rejects.toThrow(new ApiError(httpStatus.BAD_REQUEST, 'Annual income exceeds reasonable limit'));
        });
    });

    describe('getFinancialProfileByApplicationId', () => {
        it('should return financial profile for valid application', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
            mockPrisma.financialProfile.findUnique.mockResolvedValue(mockFinancialProfile);

            const result = await financialProfileService.getFinancialProfileByApplicationId(
                'app_test_123',
                1
            );

            expect(mockPrisma.application.findFirst).toHaveBeenCalledWith({
                where: { id: 'app_test_123', userId: 1 }
            });
            
            expect(mockPrisma.financialProfile.findUnique).toHaveBeenCalledWith({
                where: { applicationId: 'app_test_123' },
                include: {
                    bankingRelationships: true,
                    accountActivities: true
                }
            });

            expect(result).toEqual(mockFinancialProfile);
        });

        it('should return null if financial profile not found', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
            mockPrisma.financialProfile.findUnique.mockResolvedValue(null);

            const result = await financialProfileService.getFinancialProfileByApplicationId(
                'app_test_123',
                1
            );

            expect(result).toBeNull();
        });

        it('should throw error if application not found', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(null);

            await expect(
                financialProfileService.getFinancialProfileByApplicationId(
                    'app_test_123',
                    1
                )
            ).rejects.toThrow(new ApiError(httpStatus.NOT_FOUND, 'Application not found'));
        });
    });

    describe('deleteFinancialProfileByApplicationId', () => {
        it('should delete financial profile successfully', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
            mockPrisma.financialProfile.findUnique.mockResolvedValue(mockFinancialProfile);
            mockPrisma.financialProfile.delete.mockResolvedValue(mockFinancialProfile);

            const result = await financialProfileService.deleteFinancialProfileByApplicationId(
                'app_test_123',
                1
            );

            expect(mockPrisma.financialProfile.delete).toHaveBeenCalledWith({
                where: { applicationId: 'app_test_123' }
            });

            expect(result).toEqual(mockFinancialProfile);
        });

        it('should throw error if application not found', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(null);

            await expect(
                financialProfileService.deleteFinancialProfileByApplicationId(
                    'app_test_123',
                    1
                )
            ).rejects.toThrow(new ApiError(httpStatus.NOT_FOUND, 'Application not found'));
        });

        it('should throw error if financial profile not found', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
            mockPrisma.financialProfile.findUnique.mockResolvedValue(null);

            await expect(
                financialProfileService.deleteFinancialProfileByApplicationId(
                    'app_test_123',
                    1
                )
            ).rejects.toThrow(new ApiError(httpStatus.NOT_FOUND, 'Financial profile not found'));
        });
    });

    describe('validation helper functions', () => {
        describe('validateIncomeSources', () => {
            it('should return true for valid income sources', () => {
                const result = financialProfileService.validateIncomeSources(['employment', 'investment']);
                expect(result).toBe(true);
            });

            it('should return false for empty array', () => {
                const result = financialProfileService.validateIncomeSources([]);
                expect(result).toBe(false);
            });

            it('should return false for invalid income sources', () => {
                const result = financialProfileService.validateIncomeSources(['invalid_source']);
                expect(result).toBe(false);
            });
        });

        describe('validateBankingRelationship', () => {
            it('should return true for valid banking relationship', () => {
                const relationship = {
                    bankName: 'Test Bank',
                    accountTypes: ['checking'],
                    yearsWithBank: 5
                };

                const result = financialProfileService.validateBankingRelationship(relationship);
                expect(result).toBe(true);
            });

            it('should return false for empty bank name', () => {
                const relationship = {
                    bankName: '',
                    accountTypes: ['checking'],
                    yearsWithBank: 5
                };

                const result = financialProfileService.validateBankingRelationship(relationship);
                expect(result).toBe(false);
            });

            it('should return false for empty account types', () => {
                const relationship = {
                    bankName: 'Test Bank',
                    accountTypes: [],
                    yearsWithBank: 5
                };

                const result = financialProfileService.validateBankingRelationship(relationship);
                expect(result).toBe(false);
            });

            it('should return false for invalid years with bank', () => {
                const relationship = {
                    bankName: 'Test Bank',
                    accountTypes: ['checking'],
                    yearsWithBank: -1
                };

                const result = financialProfileService.validateBankingRelationship(relationship);
                expect(result).toBe(false);
            });
        });

        describe('validateAccountActivity', () => {
            it('should return true for valid account activity', () => {
                const activity = {
                    activity: 'Direct Deposit',
                    frequency: 'monthly',
                    amount: 1000
                };

                const result = financialProfileService.validateAccountActivity(activity);
                expect(result).toBe(true);
            });

            it('should return false for empty activity description', () => {
                const activity = {
                    activity: '',
                    frequency: 'monthly',
                    amount: 1000
                };

                const result = financialProfileService.validateAccountActivity(activity);
                expect(result).toBe(false);
            });

            it('should return false for invalid frequency', () => {
                const activity = {
                    activity: 'Direct Deposit',
                    frequency: 'invalid',
                    amount: 1000
                };

                const result = financialProfileService.validateAccountActivity(activity);
                expect(result).toBe(false);
            });

            it('should return false for negative amount', () => {
                const activity = {
                    activity: 'Direct Deposit',
                    frequency: 'monthly',
                    amount: -100
                };

                const result = financialProfileService.validateAccountActivity(activity);
                expect(result).toBe(false);
            });
        });

        describe('validateFinancialAmounts', () => {
            it('should return true for valid financial amounts', () => {
                const amounts = {
                    annualIncome: 75000,
                    assets: 50000,
                    liabilities: 15000
                };

                const result = financialProfileService.validateFinancialAmounts(amounts);
                expect(result).toBe(true);
            });

            it('should return false for negative annual income', () => {
                const amounts = {
                    annualIncome: -1000,
                    assets: 50000,
                    liabilities: 15000
                };

                const result = financialProfileService.validateFinancialAmounts(amounts);
                expect(result).toBe(false);
            });

            it('should return false for excessive amounts', () => {
                const amounts = {
                    annualIncome: 20000000, // Over limit
                    assets: 50000,
                    liabilities: 15000
                };

                const result = financialProfileService.validateFinancialAmounts(amounts);
                expect(result).toBe(false);
            });
        });
    });
});