import { personalInfoService } from '../services/index.ts';
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

// Personal info schema for output
const personalInfoSchema = z.object({
    firstName: z.string(),
    middleName: z.string().nullable(),
    lastName: z.string(),
    suffix: z.string().nullable(),
    dateOfBirth: z.string(),
    ssn: z.string(),
    phone: z.string(),
    email: z.string(),
    employmentStatus: z.string(),
    occupation: z.string().nullable(),
    employer: z.string().nullable(),
    workPhone: z.string().nullable(),
    mailingAddress: addressSchema,
    physicalAddress: addressSchema.nullable()
});

const createOrUpdatePersonalInfoTool: MCPTool = {
    id: 'personal_info_create_or_update',
    name: 'Create or Update Personal Information',
    description: 'Create or update personal information for an account opening application',
    inputSchema: z.object({
        applicationId: z.string(),
        userId: z.number().int(),
        personalData: z.object({
            firstName: z.string().max(100).trim(),
            middleName: z.string().max(100).trim().optional(),
            lastName: z.string().max(100).trim(),
            suffix: z.string().max(10).trim().optional(),
            dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
            ssn: z.string().regex(/^\d{3}-\d{2}-\d{4}$/),
            phone: z.string(),
            email: z.string().email().max(255).toLowerCase().trim(),
            employmentStatus: z.enum(['employed', 'self_employed', 'unemployed', 'retired', 'student']),
            occupation: z.string().max(100).trim().optional(),
            employer: z.string().max(255).trim().optional(),
            workPhone: z.string().optional(),
            mailingAddress: addressSchema,
            physicalAddress: addressSchema.optional()
        })
    }),
    outputSchema: personalInfoSchema,
    fn: async (inputs: {
        applicationId: string;
        userId: number;
        personalData: {
            firstName: string;
            middleName?: string;
            lastName: string;
            suffix?: string;
            dateOfBirth: string;
            ssn: string;
            phone: string;
            email: string;
            employmentStatus: 'employed' | 'self_employed' | 'unemployed' | 'retired' | 'student';
            occupation?: string;
            employer?: string;
            workPhone?: string;
            mailingAddress: {
                street: string;
                city: string;
                state: string;
                zipCode: string;
                country: string;
                apartment?: string;
            };
            physicalAddress?: {
                street: string;
                city: string;
                state: string;
                zipCode: string;
                country: string;
                apartment?: string;
            };
        };
    }) => {
        const personalInfo = await personalInfoService.createOrUpdatePersonalInfo(
            inputs.applicationId,
            inputs.userId,
            inputs.personalData
        );

        return {
            firstName: personalInfo.firstName,
            middleName: personalInfo.middleName,
            lastName: personalInfo.lastName,
            suffix: personalInfo.suffix,
            dateOfBirth: personalInfo.dateOfBirth,
            ssn: personalInfo.ssn,
            phone: personalInfo.phone,
            email: personalInfo.email,
            employmentStatus: personalInfo.employmentStatus,
            occupation: personalInfo.occupation,
            employer: personalInfo.employer,
            workPhone: personalInfo.workPhone,
            mailingAddress: {
                street: personalInfo.mailingStreet,
                city: personalInfo.mailingCity,
                state: personalInfo.mailingState,
                zipCode: personalInfo.mailingZipCode,
                country: personalInfo.mailingCountry,
                apartment: personalInfo.mailingApartment
            },
            physicalAddress: personalInfo.physicalStreet ? {
                street: personalInfo.physicalStreet,
                city: personalInfo.physicalCity!,
                state: personalInfo.physicalState!,
                zipCode: personalInfo.physicalZipCode!,
                country: personalInfo.physicalCountry!,
                apartment: personalInfo.physicalApartment
            } : null
        };
    }
};

const getPersonalInfoTool: MCPTool = {
    id: 'personal_info_get',
    name: 'Get Personal Information',
    description: 'Get personal information for a specific application',
    inputSchema: z.object({
        applicationId: z.string(),
        userId: z.number().int()
    }),
    // Make outputSchema optional for tools that can return null
    fn: async (inputs: { applicationId: string; userId: number }) => {
        const personalInfo = await personalInfoService.getPersonalInfoByApplicationId(
            inputs.applicationId,
            inputs.userId
        );

        if (!personalInfo) {
            return null;
        }

        return {
            firstName: personalInfo.firstName,
            middleName: personalInfo.middleName,
            lastName: personalInfo.lastName,
            suffix: personalInfo.suffix,
            dateOfBirth: personalInfo.dateOfBirth,
            ssn: personalInfo.ssn,
            phone: personalInfo.phone,
            email: personalInfo.email,
            employmentStatus: personalInfo.employmentStatus,
            occupation: personalInfo.occupation,
            employer: personalInfo.employer,
            workPhone: personalInfo.workPhone,
            mailingAddress: {
                street: personalInfo.mailingStreet,
                city: personalInfo.mailingCity,
                state: personalInfo.mailingState,
                zipCode: personalInfo.mailingZipCode,
                country: personalInfo.mailingCountry,
                apartment: personalInfo.mailingApartment
            },
            physicalAddress: personalInfo.physicalStreet ? {
                street: personalInfo.physicalStreet,
                city: personalInfo.physicalCity!,
                state: personalInfo.physicalState!,
                zipCode: personalInfo.physicalZipCode!,
                country: personalInfo.physicalCountry!,
                apartment: personalInfo.physicalApartment
            } : null
        };
    }
};

const deletePersonalInfoTool: MCPTool = {
    id: 'personal_info_delete',
    name: 'Delete Personal Information',
    description: 'Delete personal information for a specific application',
    inputSchema: z.object({
        applicationId: z.string(),
        userId: z.number().int()
    }),
    outputSchema: z.object({
        success: z.boolean(),
        message: z.string()
    }),
    fn: async (inputs: { applicationId: string; userId: number }) => {
        await personalInfoService.deletePersonalInfoByApplicationId(
            inputs.applicationId,
            inputs.userId
        );

        return {
            success: true,
            message: 'Personal information deleted successfully'
        };
    }
};

const validateSSNTool: MCPTool = {
    id: 'personal_info_validate_ssn',
    name: 'Validate SSN',
    description: 'Validate Social Security Number format',
    inputSchema: z.object({
        ssn: z.string()
    }),
    outputSchema: z.object({
        isValid: z.boolean(),
        message: z.string()
    }),
    fn: async (inputs: { ssn: string }) => {
        const isValid = personalInfoService.validateSSN(inputs.ssn);
        
        return {
            isValid,
            message: isValid ? 'SSN format is valid' : 'Invalid SSN format. Expected format: XXX-XX-XXXX'
        };
    }
};

const validateEmploymentStatusTool: MCPTool = {
    id: 'personal_info_validate_employment_status',
    name: 'Validate Employment Status',
    description: 'Validate employment status',
    inputSchema: z.object({
        employmentStatus: z.string()
    }),
    outputSchema: z.object({
        isValid: z.boolean(),
        message: z.string(),
        validStatuses: z.array(z.string())
    }),
    fn: async (inputs: { employmentStatus: string }) => {
        const isValid = personalInfoService.validateEmploymentStatus(inputs.employmentStatus);
        const validStatuses = ['employed', 'self_employed', 'unemployed', 'retired', 'student'];
        
        return {
            isValid,
            message: isValid 
                ? 'Employment status is valid' 
                : `Invalid employment status. Must be one of: ${validStatuses.join(', ')}`,
            validStatuses
        };
    }
};

const validateDateOfBirthTool: MCPTool = {
    id: 'personal_info_validate_date_of_birth',
    name: 'Validate Date of Birth',
    description: 'Validate date of birth format and age requirement',
    inputSchema: z.object({
        dateOfBirth: z.string()
    }),
    outputSchema: z.object({
        isValid: z.boolean(),
        message: z.string()
    }),
    fn: async (inputs: { dateOfBirth: string }) => {
        const validation = personalInfoService.validateDateOfBirth(inputs.dateOfBirth);
        
        return {
            isValid: validation.isValid,
            message: validation.isValid ? 'Date of birth is valid' : validation.message!
        };
    }
};

export const personalInfoTools: MCPTool[] = [
    createOrUpdatePersonalInfoTool,
    getPersonalInfoTool,
    deletePersonalInfoTool,
    validateSSNTool,
    validateEmploymentStatusTool,
    validateDateOfBirthTool
];