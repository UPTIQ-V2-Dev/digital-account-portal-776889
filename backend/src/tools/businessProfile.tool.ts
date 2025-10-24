import { businessProfileService } from '../services/index.ts';
import { MCPTool } from '../types/mcp.ts';
import { z } from 'zod';

// Address schema for validation
const addressSchema = z.object({
    street: z.string().max(255),
    city: z.string().max(100),
    state: z.string().length(2),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
    country: z.string().default('US'),
    apartment: z.string().max(50).optional()
});

// Business profile schema for output
const businessProfileSchema = z.object({
    businessName: z.string(),
    dbaName: z.string().nullable(),
    ein: z.string(),
    entityType: z.string(),
    industryType: z.string(),
    dateEstablished: z.string(),
    businessPhone: z.string(),
    businessEmail: z.string(),
    website: z.string().nullable(),
    description: z.string(),
    isCashIntensive: z.boolean(),
    monthlyTransactionVolume: z.number(),
    monthlyTransactionCount: z.number(),
    expectedBalance: z.number(),
    businessAddress: addressSchema,
    mailingAddress: addressSchema.nullable()
});

const createOrUpdateBusinessProfileTool: MCPTool = {
    id: 'business_profile_create_or_update',
    name: 'Create or Update Business Profile',
    description: 'Create or update business profile information for a commercial account opening application',
    inputSchema: z.object({
        applicationId: z.string(),
        userId: z.number().int(),
        businessData: z.object({
            businessName: z.string().max(255).trim(),
            dbaName: z.string().max(255).trim().optional(),
            ein: z.string().regex(/^\d{2}-\d{7}$/),
            entityType: z.enum(['corporation', 'llc', 'partnership', 'sole_proprietorship']),
            industryType: z.string().max(100).trim(),
            dateEstablished: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
            businessPhone: z.string(),
            businessEmail: z.string().email().max(255).toLowerCase().trim(),
            website: z.string().url().max(255).optional(),
            description: z.string().max(1000).trim(),
            isCashIntensive: z.boolean(),
            monthlyTransactionVolume: z.number().min(0).max(999999999),
            monthlyTransactionCount: z.number().int().min(0).max(999999),
            expectedBalance: z.number().min(0).max(999999999),
            businessAddress: addressSchema,
            mailingAddress: addressSchema.optional()
        })
    }),
    outputSchema: businessProfileSchema,
    fn: async (inputs: {
        applicationId: string;
        userId: number;
        businessData: {
            businessName: string;
            dbaName?: string;
            ein: string;
            entityType: 'corporation' | 'llc' | 'partnership' | 'sole_proprietorship';
            industryType: string;
            dateEstablished: string;
            businessPhone: string;
            businessEmail: string;
            website?: string;
            description: string;
            isCashIntensive: boolean;
            monthlyTransactionVolume: number;
            monthlyTransactionCount: number;
            expectedBalance: number;
            businessAddress: {
                street: string;
                city: string;
                state: string;
                zipCode: string;
                country: string;
                apartment?: string;
            };
            mailingAddress?: {
                street: string;
                city: string;
                state: string;
                zipCode: string;
                country: string;
                apartment?: string;
            };
        };
    }) => {
        const businessProfile = await businessProfileService.createOrUpdateBusinessProfile(
            inputs.applicationId,
            inputs.userId,
            inputs.businessData
        );

        return {
            businessName: businessProfile.businessName,
            dbaName: businessProfile.dbaName,
            ein: businessProfile.ein,
            entityType: businessProfile.entityType,
            industryType: businessProfile.industryType,
            dateEstablished: businessProfile.dateEstablished,
            businessPhone: businessProfile.businessPhone,
            businessEmail: businessProfile.businessEmail,
            website: businessProfile.website,
            description: businessProfile.description,
            isCashIntensive: businessProfile.isCashIntensive,
            monthlyTransactionVolume: businessProfile.monthlyTransactionVolume,
            monthlyTransactionCount: businessProfile.monthlyTransactionCount,
            expectedBalance: businessProfile.expectedBalance,
            businessAddress: {
                street: businessProfile.businessStreet,
                city: businessProfile.businessCity,
                state: businessProfile.businessState,
                zipCode: businessProfile.businessZipCode,
                country: businessProfile.businessCountry,
                apartment: businessProfile.businessApartment
            },
            mailingAddress: businessProfile.mailingStreet ? {
                street: businessProfile.mailingStreet,
                city: businessProfile.mailingCity!,
                state: businessProfile.mailingState!,
                zipCode: businessProfile.mailingZipCode!,
                country: businessProfile.mailingCountry!,
                apartment: businessProfile.mailingApartment
            } : null
        };
    }
};

const getBusinessProfileTool: MCPTool = {
    id: 'business_profile_get',
    name: 'Get Business Profile',
    description: 'Get business profile information for a specific application',
    inputSchema: z.object({
        applicationId: z.string(),
        userId: z.number().int()
    }),
    // Make outputSchema optional for tools that can return null
    fn: async (inputs: { applicationId: string; userId: number }) => {
        const businessProfile = await businessProfileService.getBusinessProfileByApplicationId(
            inputs.applicationId,
            inputs.userId
        );

        if (!businessProfile) {
            return null;
        }

        return {
            businessName: businessProfile.businessName,
            dbaName: businessProfile.dbaName,
            ein: businessProfile.ein,
            entityType: businessProfile.entityType,
            industryType: businessProfile.industryType,
            dateEstablished: businessProfile.dateEstablished,
            businessPhone: businessProfile.businessPhone,
            businessEmail: businessProfile.businessEmail,
            website: businessProfile.website,
            description: businessProfile.description,
            isCashIntensive: businessProfile.isCashIntensive,
            monthlyTransactionVolume: businessProfile.monthlyTransactionVolume,
            monthlyTransactionCount: businessProfile.monthlyTransactionCount,
            expectedBalance: businessProfile.expectedBalance,
            businessAddress: {
                street: businessProfile.businessStreet,
                city: businessProfile.businessCity,
                state: businessProfile.businessState,
                zipCode: businessProfile.businessZipCode,
                country: businessProfile.businessCountry,
                apartment: businessProfile.businessApartment
            },
            mailingAddress: businessProfile.mailingStreet ? {
                street: businessProfile.mailingStreet,
                city: businessProfile.mailingCity!,
                state: businessProfile.mailingState!,
                zipCode: businessProfile.mailingZipCode!,
                country: businessProfile.mailingCountry!,
                apartment: businessProfile.mailingApartment
            } : null
        };
    }
};

const deleteBusinessProfileTool: MCPTool = {
    id: 'business_profile_delete',
    name: 'Delete Business Profile',
    description: 'Delete business profile for a specific application',
    inputSchema: z.object({
        applicationId: z.string(),
        userId: z.number().int()
    }),
    outputSchema: z.object({
        success: z.boolean(),
        message: z.string()
    }),
    fn: async (inputs: { applicationId: string; userId: number }) => {
        await businessProfileService.deleteBusinessProfileByApplicationId(
            inputs.applicationId,
            inputs.userId
        );

        return {
            success: true,
            message: 'Business profile deleted successfully'
        };
    }
};

const validateEINTool: MCPTool = {
    id: 'business_profile_validate_ein',
    name: 'Validate EIN',
    description: 'Validate Employer Identification Number format',
    inputSchema: z.object({
        ein: z.string()
    }),
    outputSchema: z.object({
        isValid: z.boolean(),
        message: z.string()
    }),
    fn: async (inputs: { ein: string }) => {
        const isValid = businessProfileService.validateEIN(inputs.ein);
        
        return {
            isValid,
            message: isValid ? 'EIN format is valid' : 'Invalid EIN format. Expected format: XX-XXXXXXX'
        };
    }
};

const validateEntityTypeTool: MCPTool = {
    id: 'business_profile_validate_entity_type',
    name: 'Validate Entity Type',
    description: 'Validate business entity type',
    inputSchema: z.object({
        entityType: z.string()
    }),
    outputSchema: z.object({
        isValid: z.boolean(),
        message: z.string(),
        validTypes: z.array(z.string())
    }),
    fn: async (inputs: { entityType: string }) => {
        const isValid = businessProfileService.validateEntityType(inputs.entityType);
        const validTypes = ['corporation', 'llc', 'partnership', 'sole_proprietorship'];
        
        return {
            isValid,
            message: isValid 
                ? 'Entity type is valid' 
                : `Invalid entity type. Must be one of: ${validTypes.join(', ')}`,
            validTypes
        };
    }
};

export const businessProfileTools: MCPTool[] = [
    createOrUpdateBusinessProfileTool,
    getBusinessProfileTool,
    deleteBusinessProfileTool,
    validateEINTool,
    validateEntityTypeTool
];