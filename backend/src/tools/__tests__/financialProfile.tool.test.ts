import { describe, it, expect, beforeEach, vi } from 'vitest';
import { financialProfileTools } from '../financialProfile.tool.ts';
import { financialProfileService } from '../../services/index.ts';
import ApiError from '../../utils/ApiError.ts';
import httpStatus from 'http-status';

// Mock the service
vi.mock('../../services/financialProfile.service.ts', () => ({
    default: {
        createOrUpdateFinancialProfile: vi.fn(),
        getFinancialProfileByApplicationId: vi.fn(),
        deleteFinancialProfileByApplicationId: vi.fn(),
        validateIncomeSources: vi.fn(),
        validateBankingRelationship: vi.fn(),
        validateAccountActivity: vi.fn(),
        validateFinancialAmounts: vi.fn(),
    }
}));

describe('Financial Profile MCP Tools', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

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

    const mockFinancialProfile = {
        id: 'fp_test_123',
        applicationId: 'app_test_123',
        ...mockFinancialData,
        bankingRelationships: mockFinancialData.bankingRelationships.map((br, i) => ({
            ...br,
            id: `br_test_${i}`,
            financialProfileId: 'fp_test_123'
        })),
        accountActivities: mockFinancialData.accountActivities.map((aa, i) => ({
            ...aa,
            id: `aa_test_${i}`,
            financialProfileId: 'fp_test_123'
        }))
    };

    describe('financial_profile_create_or_update tool', () => {
        it('should create or update financial profile successfully', async () => {
            const tool = financialProfileTools.find(t => t.id === 'financial_profile_create_or_update');
            expect(tool).toBeDefined();

            (financialProfileService.createOrUpdateFinancialProfile as any).mockResolvedValue(mockFinancialProfile);

            const result = await tool!.fn({
                applicationId: 'app_test_123',
                userId: 1,
                financialData: mockFinancialData
            });

            expect(financialProfileService.createOrUpdateFinancialProfile).toHaveBeenCalledWith(
                'app_test_123',
                1,
                mockFinancialData
            );

            expect(result).toEqual({
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
            const tool = financialProfileTools.find(t => t.id === 'financial_profile_create_or_update');
            (financialProfileService.createOrUpdateFinancialProfile as any).mockRejectedValue(
                new ApiError(httpStatus.NOT_FOUND, 'Application not found')
            );

            await expect(tool!.fn({
                applicationId: 'app_test_123',
                userId: 1,
                financialData: mockFinancialData
            })).rejects.toThrow('Application not found');
        });
    });

    describe('financial_profile_get tool', () => {
        it('should get financial profile successfully', async () => {
            const tool = financialProfileTools.find(t => t.id === 'financial_profile_get');
            expect(tool).toBeDefined();

            (financialProfileService.getFinancialProfileByApplicationId as any).mockResolvedValue(mockFinancialProfile);

            const result = await tool!.fn({
                applicationId: 'app_test_123',
                userId: 1
            });

            expect(financialProfileService.getFinancialProfileByApplicationId).toHaveBeenCalledWith(
                'app_test_123',
                1
            );

            expect(result).toEqual({
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

        it('should return null if financial profile not found', async () => {
            const tool = financialProfileTools.find(t => t.id === 'financial_profile_get');
            (financialProfileService.getFinancialProfileByApplicationId as any).mockResolvedValue(null);

            const result = await tool!.fn({
                applicationId: 'app_test_123',
                userId: 1
            });

            expect(result).toBeNull();
        });
    });

    describe('financial_profile_delete tool', () => {
        it('should delete financial profile successfully', async () => {
            const tool = financialProfileTools.find(t => t.id === 'financial_profile_delete');
            expect(tool).toBeDefined();

            (financialProfileService.deleteFinancialProfileByApplicationId as any).mockResolvedValue(mockFinancialProfile);

            const result = await tool!.fn({
                applicationId: 'app_test_123',
                userId: 1
            });

            expect(financialProfileService.deleteFinancialProfileByApplicationId).toHaveBeenCalledWith(
                'app_test_123',
                1
            );

            expect(result).toEqual({
                success: true,
                message: 'Financial profile deleted successfully'
            });
        });

        it('should handle service errors', async () => {
            const tool = financialProfileTools.find(t => t.id === 'financial_profile_delete');
            (financialProfileService.deleteFinancialProfileByApplicationId as any).mockRejectedValue(
                new ApiError(httpStatus.NOT_FOUND, 'Financial profile not found')
            );

            await expect(tool!.fn({
                applicationId: 'app_test_123',
                userId: 1
            })).rejects.toThrow('Financial profile not found');
        });
    });

    describe('financial_profile_validate_income_sources tool', () => {
        it('should validate valid income sources', async () => {
            const tool = financialProfileTools.find(t => t.id === 'financial_profile_validate_income_sources');
            expect(tool).toBeDefined();

            (financialProfileService.validateIncomeSources as any).mockReturnValue(true);

            const result = await tool!.fn({
                incomeSources: ['employment', 'investment']
            });

            expect(financialProfileService.validateIncomeSources).toHaveBeenCalledWith(['employment', 'investment']);

            expect(result).toEqual({
                isValid: true,
                message: 'Income sources are valid',
                validSources: [
                    'employment',
                    'self-employment',
                    'business',
                    'investment',
                    'retirement',
                    'disability',
                    'social_security',
                    'other'
                ]
            });
        });

        it('should validate invalid income sources', async () => {
            const tool = financialProfileTools.find(t => t.id === 'financial_profile_validate_income_sources');
            (financialProfileService.validateIncomeSources as any).mockReturnValue(false);

            const result = await tool!.fn({
                incomeSources: ['invalid_source']
            });

            expect(result.isValid).toBe(false);
            expect(result.message).toContain('Invalid income sources');
        });
    });

    describe('financial_profile_validate_banking_relationship tool', () => {
        it('should validate valid banking relationship', async () => {
            const tool = financialProfileTools.find(t => t.id === 'financial_profile_validate_banking_relationship');
            expect(tool).toBeDefined();

            (financialProfileService.validateBankingRelationship as any).mockReturnValue(true);

            const relationship = {
                bankName: 'Test Bank',
                accountTypes: ['checking'],
                yearsWithBank: 5
            };

            const result = await tool!.fn({ relationship });

            expect(financialProfileService.validateBankingRelationship).toHaveBeenCalledWith(relationship);

            expect(result).toEqual({
                isValid: true,
                message: 'Banking relationship is valid'
            });
        });

        it('should validate invalid banking relationship', async () => {
            const tool = financialProfileTools.find(t => t.id === 'financial_profile_validate_banking_relationship');
            (financialProfileService.validateBankingRelationship as any).mockReturnValue(false);

            const relationship = {
                bankName: '',
                accountTypes: [],
                yearsWithBank: -1
            };

            const result = await tool!.fn({ relationship });

            expect(result.isValid).toBe(false);
            expect(result.message).toContain('Invalid banking relationship');
        });
    });

    describe('financial_profile_validate_account_activity tool', () => {
        it('should validate valid account activity', async () => {
            const tool = financialProfileTools.find(t => t.id === 'financial_profile_validate_account_activity');
            expect(tool).toBeDefined();

            (financialProfileService.validateAccountActivity as any).mockReturnValue(true);

            const activity = {
                activity: 'Direct Deposit',
                frequency: 'monthly',
                amount: 1000
            };

            const result = await tool!.fn({ activity });

            expect(financialProfileService.validateAccountActivity).toHaveBeenCalledWith(activity);

            expect(result).toEqual({
                isValid: true,
                message: 'Account activity is valid',
                validFrequencies: ['daily', 'weekly', 'monthly', 'quarterly', 'annually', 'as_needed']
            });
        });

        it('should validate invalid account activity', async () => {
            const tool = financialProfileTools.find(t => t.id === 'financial_profile_validate_account_activity');
            (financialProfileService.validateAccountActivity as any).mockReturnValue(false);

            const activity = {
                activity: '',
                frequency: 'invalid',
                amount: -100
            };

            const result = await tool!.fn({ activity });

            expect(result.isValid).toBe(false);
            expect(result.message).toContain('Invalid account activity');
        });
    });

    describe('financial_profile_validate_amounts tool', () => {
        it('should validate valid financial amounts', async () => {
            const tool = financialProfileTools.find(t => t.id === 'financial_profile_validate_amounts');
            expect(tool).toBeDefined();

            (financialProfileService.validateFinancialAmounts as any).mockReturnValue(true);

            const amounts = {
                annualIncome: 75000,
                assets: 50000,
                liabilities: 15000
            };

            const result = await tool!.fn({ amounts });

            expect(financialProfileService.validateFinancialAmounts).toHaveBeenCalledWith(amounts);

            expect(result).toEqual({
                isValid: true,
                message: 'Financial amounts are within valid ranges',
                limits: {
                    annualIncome: { min: 0, max: 10000000 },
                    assets: { min: 0, max: 100000000 },
                    liabilities: { min: 0, max: 100000000 }
                }
            });
        });

        it('should validate invalid financial amounts', async () => {
            const tool = financialProfileTools.find(t => t.id === 'financial_profile_validate_amounts');
            (financialProfileService.validateFinancialAmounts as any).mockReturnValue(false);

            const amounts = {
                annualIncome: -1000,
                assets: 50000,
                liabilities: 15000
            };

            const result = await tool!.fn({ amounts });

            expect(result.isValid).toBe(false);
            expect(result.message).toContain('Invalid financial amounts');
        });
    });

    describe('tool metadata', () => {
        it('should have correct tool count', () => {
            expect(financialProfileTools).toHaveLength(7);
        });

        it('should have unique tool IDs', () => {
            const ids = financialProfileTools.map(tool => tool.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });

        it('should have proper input schemas', () => {
            financialProfileTools.forEach(tool => {
                expect(tool.inputSchema).toBeDefined();
                expect(tool.name).toBeDefined();
                expect(tool.description).toBeDefined();
                expect(typeof tool.fn).toBe('function');
            });
        });
    });
});