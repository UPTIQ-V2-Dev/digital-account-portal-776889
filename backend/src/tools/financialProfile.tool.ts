import { financialProfileService } from '../services/index.ts';
import { MCPTool } from '../types/mcp.ts';
import { z } from 'zod';

// Banking relationship schema for validation
const bankingRelationshipSchema = z.object({
    bankName: z.string().max(255).trim(),
    accountTypes: z.array(z.enum([
        'checking',
        'savings',
        'money_market',
        'certificate_deposit',
        'credit_card',
        'loan',
        'mortgage',
        'investment',
        'retirement',
        'other'
    ])).min(1),
    yearsWithBank: z.number().int().min(0).max(100)
});

// Account activity schema for validation
const accountActivitySchema = z.object({
    activity: z.string().max(255).trim(),
    frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'annually', 'as_needed']),
    amount: z.number().min(0).max(10000000)
});

// Financial profile schema for output
const financialProfileSchema = z.object({
    annualIncome: z.number(),
    incomeSource: z.array(z.string()),
    employmentInfo: z.any().nullable(),
    assets: z.number(),
    liabilities: z.number(),
    bankingRelationships: z.array(bankingRelationshipSchema),
    accountActivities: z.array(accountActivitySchema)
});

const createOrUpdateFinancialProfileTool: MCPTool = {
    id: 'financial_profile_create_or_update',
    name: 'Create or Update Financial Profile',
    description: 'Create or update financial profile information for an account opening application including income, assets, liabilities, banking relationships, and account activities',
    inputSchema: z.object({
        applicationId: z.string(),
        userId: z.number().int(),
        financialData: z.object({
            annualIncome: z.number().min(0).max(10000000),
            incomeSource: z.array(z.enum([
                'employment',
                'self-employment',
                'business',
                'investment',
                'retirement',
                'disability',
                'social_security',
                'other'
            ])).min(1),
            employmentInfo: z.any().optional(),
            assets: z.number().min(0).max(100000000),
            liabilities: z.number().min(0).max(100000000),
            bankingRelationships: z.array(bankingRelationshipSchema).min(1).max(10),
            accountActivities: z.array(accountActivitySchema).min(1).max(20)
        })
    }),
    outputSchema: financialProfileSchema,
    fn: async (inputs: {
        applicationId: string;
        userId: number;
        financialData: {
            annualIncome: number;
            incomeSource: string[];
            employmentInfo?: any;
            assets: number;
            liabilities: number;
            bankingRelationships: Array<{
                bankName: string;
                accountTypes: string[];
                yearsWithBank: number;
            }>;
            accountActivities: Array<{
                activity: string;
                frequency: string;
                amount: number;
            }>;
        };
    }) => {
        const financialProfile = await financialProfileService.createOrUpdateFinancialProfile(
            inputs.applicationId,
            inputs.userId,
            inputs.financialData
        );

        return {
            annualIncome: financialProfile.annualIncome,
            incomeSource: financialProfile.incomeSource,
            employmentInfo: financialProfile.employmentInfo,
            assets: financialProfile.assets,
            liabilities: financialProfile.liabilities,
            bankingRelationships: financialProfile.bankingRelationships.map(br => ({
                bankName: br.bankName,
                accountTypes: br.accountTypes,
                yearsWithBank: br.yearsWithBank
            })),
            accountActivities: financialProfile.accountActivities.map(aa => ({
                activity: aa.activity,
                frequency: aa.frequency,
                amount: aa.amount
            }))
        };
    }
};

const getFinancialProfileTool: MCPTool = {
    id: 'financial_profile_get',
    name: 'Get Financial Profile',
    description: 'Get financial profile information for a specific application',
    inputSchema: z.object({
        applicationId: z.string(),
        userId: z.number().int()
    }),
    fn: async (inputs: { applicationId: string; userId: number }) => {
        const financialProfile = await financialProfileService.getFinancialProfileByApplicationId(
            inputs.applicationId,
            inputs.userId
        );

        if (!financialProfile) {
            return null;
        }

        return {
            annualIncome: financialProfile.annualIncome,
            incomeSource: financialProfile.incomeSource,
            employmentInfo: financialProfile.employmentInfo,
            assets: financialProfile.assets,
            liabilities: financialProfile.liabilities,
            bankingRelationships: financialProfile.bankingRelationships.map(br => ({
                bankName: br.bankName,
                accountTypes: br.accountTypes,
                yearsWithBank: br.yearsWithBank
            })),
            accountActivities: financialProfile.accountActivities.map(aa => ({
                activity: aa.activity,
                frequency: aa.frequency,
                amount: aa.amount
            }))
        };
    }
};

const deleteFinancialProfileTool: MCPTool = {
    id: 'financial_profile_delete',
    name: 'Delete Financial Profile',
    description: 'Delete financial profile for a specific application',
    inputSchema: z.object({
        applicationId: z.string(),
        userId: z.number().int()
    }),
    outputSchema: z.object({
        success: z.boolean(),
        message: z.string()
    }),
    fn: async (inputs: { applicationId: string; userId: number }) => {
        await financialProfileService.deleteFinancialProfileByApplicationId(
            inputs.applicationId,
            inputs.userId
        );

        return {
            success: true,
            message: 'Financial profile deleted successfully'
        };
    }
};

const validateIncomeSourcesTool: MCPTool = {
    id: 'financial_profile_validate_income_sources',
    name: 'Validate Income Sources',
    description: 'Validate income source values',
    inputSchema: z.object({
        incomeSources: z.array(z.string())
    }),
    outputSchema: z.object({
        isValid: z.boolean(),
        message: z.string(),
        validSources: z.array(z.string())
    }),
    fn: async (inputs: { incomeSources: string[] }) => {
        const isValid = financialProfileService.validateIncomeSources(inputs.incomeSources);
        const validSources = [
            'employment',
            'self-employment',
            'business',
            'investment',
            'retirement',
            'disability',
            'social_security',
            'other'
        ];
        
        return {
            isValid,
            message: isValid 
                ? 'Income sources are valid' 
                : `Invalid income sources. Must be one or more of: ${validSources.join(', ')}`,
            validSources
        };
    }
};

const validateBankingRelationshipTool: MCPTool = {
    id: 'financial_profile_validate_banking_relationship',
    name: 'Validate Banking Relationship',
    description: 'Validate a banking relationship object',
    inputSchema: z.object({
        relationship: bankingRelationshipSchema
    }),
    outputSchema: z.object({
        isValid: z.boolean(),
        message: z.string()
    }),
    fn: async (inputs: { relationship: { bankName: string; accountTypes: string[]; yearsWithBank: number } }) => {
        const isValid = financialProfileService.validateBankingRelationship(inputs.relationship);
        
        return {
            isValid,
            message: isValid 
                ? 'Banking relationship is valid' 
                : 'Invalid banking relationship. Check bank name, account types, and years with bank.'
        };
    }
};

const validateAccountActivityTool: MCPTool = {
    id: 'financial_profile_validate_account_activity',
    name: 'Validate Account Activity',
    description: 'Validate an account activity object',
    inputSchema: z.object({
        activity: accountActivitySchema
    }),
    outputSchema: z.object({
        isValid: z.boolean(),
        message: z.string(),
        validFrequencies: z.array(z.string())
    }),
    fn: async (inputs: { activity: { activity: string; frequency: string; amount: number } }) => {
        const isValid = financialProfileService.validateAccountActivity(inputs.activity);
        const validFrequencies = ['daily', 'weekly', 'monthly', 'quarterly', 'annually', 'as_needed'];
        
        return {
            isValid,
            message: isValid 
                ? 'Account activity is valid' 
                : `Invalid account activity. Check activity description, frequency, and amount.`,
            validFrequencies
        };
    }
};

const validateFinancialAmountsTool: MCPTool = {
    id: 'financial_profile_validate_amounts',
    name: 'Validate Financial Amounts',
    description: 'Validate financial amounts (income, assets, liabilities) for reasonable ranges',
    inputSchema: z.object({
        amounts: z.object({
            annualIncome: z.number(),
            assets: z.number(),
            liabilities: z.number()
        })
    }),
    outputSchema: z.object({
        isValid: z.boolean(),
        message: z.string(),
        limits: z.object({
            annualIncome: z.object({
                min: z.number(),
                max: z.number()
            }),
            assets: z.object({
                min: z.number(),
                max: z.number()
            }),
            liabilities: z.object({
                min: z.number(),
                max: z.number()
            })
        })
    }),
    fn: async (inputs: { amounts: { annualIncome: number; assets: number; liabilities: number } }) => {
        const isValid = financialProfileService.validateFinancialAmounts(inputs.amounts);
        const limits = {
            annualIncome: { min: 0, max: 10000000 },
            assets: { min: 0, max: 100000000 },
            liabilities: { min: 0, max: 100000000 }
        };
        
        return {
            isValid,
            message: isValid 
                ? 'Financial amounts are within valid ranges' 
                : 'Invalid financial amounts. Check that all amounts are non-negative and within reasonable limits.',
            limits
        };
    }
};

export const financialProfileTools: MCPTool[] = [
    createOrUpdateFinancialProfileTool,
    getFinancialProfileTool,
    deleteFinancialProfileTool,
    validateIncomeSourcesTool,
    validateBankingRelationshipTool,
    validateAccountActivityTool,
    validateFinancialAmountsTool
];