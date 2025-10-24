import { describe, it, expect, beforeEach, vi } from 'vitest';
import { personalInfoTools } from '../personalInfo.tool.ts';
import { personalInfoService } from '../../services/index.ts';
import ApiError from '../../utils/ApiError.ts';
import httpStatus from 'http-status';

// Mock the service
vi.mock('../../services/index.ts', () => ({
    personalInfoService: {
        createOrUpdatePersonalInfo: vi.fn(),
        getPersonalInfoByApplicationId: vi.fn(),
        deletePersonalInfoByApplicationId: vi.fn(),
        validateSSN: vi.fn(),
        validateEmploymentStatus: vi.fn(),
        validateDateOfBirth: vi.fn(),
    },
}));

const mockPersonalInfoService = personalInfoService as any;

describe('Personal Info Tools', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockPersonalData = {
        firstName: 'John',
        middleName: 'Michael',
        lastName: 'Doe',
        suffix: 'Jr.',
        dateOfBirth: '1990-01-15',
        ssn: '123-45-6789',
        phone: '555-123-4567',
        email: 'john@example.com',
        employmentStatus: 'employed' as const,
        occupation: 'Software Engineer',
        employer: 'Tech Corp',
        workPhone: '555-999-8888',
        mailingAddress: {
            street: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zipCode: '12345',
            country: 'US',
            apartment: 'Apt 2B'
        },
        physicalAddress: {
            street: '456 Oak Ave',
            city: 'Other City',
            state: 'NY',
            zipCode: '54321',
            country: 'US'
        }
    };

    const mockPersonalInfoResponse = {
        id: 'pi_test_123',
        applicationId: 'app_test_123',
        firstName: 'John',
        middleName: 'Michael',
        lastName: 'Doe',
        suffix: 'Jr.',
        dateOfBirth: '1990-01-15',
        ssn: '123-45-6789',
        phone: '555-123-4567',
        email: 'john@example.com',
        employmentStatus: 'employed',
        occupation: 'Software Engineer',
        employer: 'Tech Corp',
        workPhone: '555-999-8888',
        mailingStreet: '123 Main St',
        mailingCity: 'Anytown',
        mailingState: 'CA',
        mailingZipCode: '12345',
        mailingCountry: 'US',
        mailingApartment: 'Apt 2B',
        physicalStreet: '456 Oak Ave',
        physicalCity: 'Other City',
        physicalState: 'NY',
        physicalZipCode: '54321',
        physicalCountry: 'US',
        physicalApartment: null
    };

    describe('createOrUpdatePersonalInfoTool', () => {
        const [createOrUpdateTool] = personalInfoTools;

        it('should have correct metadata', () => {
            expect(createOrUpdateTool.id).toBe('personal_info_create_or_update');
            expect(createOrUpdateTool.name).toBe('Create or Update Personal Information');
            expect(createOrUpdateTool.description).toBe('Create or update personal information for an account opening application');
        });

        it('should create personal info successfully', async () => {
            mockPersonalInfoService.createOrUpdatePersonalInfo.mockResolvedValue(mockPersonalInfoResponse);

            const result = await createOrUpdateTool.fn({
                applicationId: 'app_test_123',
                userId: 1,
                personalData: mockPersonalData
            });

            expect(result).toEqual({
                firstName: 'John',
                middleName: 'Michael',
                lastName: 'Doe',
                suffix: 'Jr.',
                dateOfBirth: '1990-01-15',
                ssn: '123-45-6789',
                phone: '555-123-4567',
                email: 'john@example.com',
                employmentStatus: 'employed',
                occupation: 'Software Engineer',
                employer: 'Tech Corp',
                workPhone: '555-999-8888',
                mailingAddress: {
                    street: '123 Main St',
                    city: 'Anytown',
                    state: 'CA',
                    zipCode: '12345',
                    country: 'US',
                    apartment: 'Apt 2B'
                },
                physicalAddress: {
                    street: '456 Oak Ave',
                    city: 'Other City',
                    state: 'NY',
                    zipCode: '54321',
                    country: 'US',
                    apartment: null
                }
            });

            expect(mockPersonalInfoService.createOrUpdatePersonalInfo).toHaveBeenCalledWith(
                'app_test_123',
                1,
                mockPersonalData
            );
        });

        it('should format response correctly without physical address', async () => {
            const responseWithoutPhysical = { ...mockPersonalInfoResponse };
            (responseWithoutPhysical as any).physicalStreet = null;
            (responseWithoutPhysical as any).physicalCity = null;
            (responseWithoutPhysical as any).physicalState = null;
            (responseWithoutPhysical as any).physicalZipCode = null;
            (responseWithoutPhysical as any).physicalCountry = null;

            mockPersonalInfoService.createOrUpdatePersonalInfo.mockResolvedValue(responseWithoutPhysical);

            const result = await createOrUpdateTool.fn({
                applicationId: 'app_test_123',
                userId: 1,
                personalData: mockPersonalData
            });

            expect(result.physicalAddress).toBeNull();
        });

        it('should handle service errors', async () => {
            const error = new ApiError(httpStatus.BAD_REQUEST, 'Invalid SSN format');
            mockPersonalInfoService.createOrUpdatePersonalInfo.mockRejectedValue(error);

            await expect(createOrUpdateTool.fn({
                applicationId: 'app_test_123',
                userId: 1,
                personalData: mockPersonalData
            })).rejects.toThrow(error);
        });
    });

    describe('getPersonalInfoTool', () => {
        const getPersonalInfoTool = personalInfoTools.find(tool => tool.id === 'personal_info_get')!;

        it('should have correct metadata', () => {
            expect(getPersonalInfoTool.id).toBe('personal_info_get');
            expect(getPersonalInfoTool.name).toBe('Get Personal Information');
            expect(getPersonalInfoTool.description).toBe('Get personal information for a specific application');
        });

        it('should get personal info successfully', async () => {
            mockPersonalInfoService.getPersonalInfoByApplicationId.mockResolvedValue(mockPersonalInfoResponse);

            const result = await getPersonalInfoTool.fn({
                applicationId: 'app_test_123',
                userId: 1
            });

            expect(result).toEqual({
                firstName: 'John',
                middleName: 'Michael',
                lastName: 'Doe',
                suffix: 'Jr.',
                dateOfBirth: '1990-01-15',
                ssn: '123-45-6789',
                phone: '555-123-4567',
                email: 'john@example.com',
                employmentStatus: 'employed',
                occupation: 'Software Engineer',
                employer: 'Tech Corp',
                workPhone: '555-999-8888',
                mailingAddress: {
                    street: '123 Main St',
                    city: 'Anytown',
                    state: 'CA',
                    zipCode: '12345',
                    country: 'US',
                    apartment: 'Apt 2B'
                },
                physicalAddress: {
                    street: '456 Oak Ave',
                    city: 'Other City',
                    state: 'NY',
                    zipCode: '54321',
                    country: 'US',
                    apartment: null
                }
            });

            expect(mockPersonalInfoService.getPersonalInfoByApplicationId).toHaveBeenCalledWith(
                'app_test_123',
                1
            );
        });

        it('should return null when personal info not found', async () => {
            mockPersonalInfoService.getPersonalInfoByApplicationId.mockResolvedValue(null);

            const result = await getPersonalInfoTool.fn({
                applicationId: 'app_test_123',
                userId: 1
            });

            expect(result).toBeNull();
        });

        it('should handle service errors', async () => {
            const error = new ApiError(httpStatus.NOT_FOUND, 'Application not found');
            mockPersonalInfoService.getPersonalInfoByApplicationId.mockRejectedValue(error);

            await expect(getPersonalInfoTool.fn({
                applicationId: 'app_test_123',
                userId: 1
            })).rejects.toThrow(error);
        });
    });

    describe('deletePersonalInfoTool', () => {
        const deletePersonalInfoTool = personalInfoTools.find(tool => tool.id === 'personal_info_delete')!;

        it('should have correct metadata', () => {
            expect(deletePersonalInfoTool.id).toBe('personal_info_delete');
            expect(deletePersonalInfoTool.name).toBe('Delete Personal Information');
            expect(deletePersonalInfoTool.description).toBe('Delete personal information for a specific application');
        });

        it('should delete personal info successfully', async () => {
            mockPersonalInfoService.deletePersonalInfoByApplicationId.mockResolvedValue(mockPersonalInfoResponse);

            const result = await deletePersonalInfoTool.fn({
                applicationId: 'app_test_123',
                userId: 1
            });

            expect(result).toEqual({
                success: true,
                message: 'Personal information deleted successfully'
            });

            expect(mockPersonalInfoService.deletePersonalInfoByApplicationId).toHaveBeenCalledWith(
                'app_test_123',
                1
            );
        });

        it('should handle service errors', async () => {
            const error = new ApiError(httpStatus.NOT_FOUND, 'Personal information not found');
            mockPersonalInfoService.deletePersonalInfoByApplicationId.mockRejectedValue(error);

            await expect(deletePersonalInfoTool.fn({
                applicationId: 'app_test_123',
                userId: 1
            })).rejects.toThrow(error);
        });
    });

    describe('validateSSNTool', () => {
        const validateSSNTool = personalInfoTools.find(tool => tool.id === 'personal_info_validate_ssn')!;

        it('should have correct metadata', () => {
            expect(validateSSNTool.id).toBe('personal_info_validate_ssn');
            expect(validateSSNTool.name).toBe('Validate SSN');
            expect(validateSSNTool.description).toBe('Validate Social Security Number format');
        });

        it('should validate correct SSN format', async () => {
            mockPersonalInfoService.validateSSN.mockReturnValue(true);

            const result = await validateSSNTool.fn({ ssn: '123-45-6789' });

            expect(result).toEqual({
                isValid: true,
                message: 'SSN format is valid'
            });

            expect(mockPersonalInfoService.validateSSN).toHaveBeenCalledWith('123-45-6789');
        });

        it('should validate incorrect SSN format', async () => {
            mockPersonalInfoService.validateSSN.mockReturnValue(false);

            const result = await validateSSNTool.fn({ ssn: '123456789' });

            expect(result).toEqual({
                isValid: false,
                message: 'Invalid SSN format. Expected format: XXX-XX-XXXX'
            });
        });
    });

    describe('validateEmploymentStatusTool', () => {
        const validateEmploymentStatusTool = personalInfoTools.find(tool => tool.id === 'personal_info_validate_employment_status')!;

        it('should have correct metadata', () => {
            expect(validateEmploymentStatusTool.id).toBe('personal_info_validate_employment_status');
            expect(validateEmploymentStatusTool.name).toBe('Validate Employment Status');
            expect(validateEmploymentStatusTool.description).toBe('Validate employment status');
        });

        it('should validate correct employment status', async () => {
            mockPersonalInfoService.validateEmploymentStatus.mockReturnValue(true);

            const result = await validateEmploymentStatusTool.fn({ employmentStatus: 'employed' });

            expect(result).toEqual({
                isValid: true,
                message: 'Employment status is valid',
                validStatuses: ['employed', 'self_employed', 'unemployed', 'retired', 'student']
            });

            expect(mockPersonalInfoService.validateEmploymentStatus).toHaveBeenCalledWith('employed');
        });

        it('should validate incorrect employment status', async () => {
            mockPersonalInfoService.validateEmploymentStatus.mockReturnValue(false);

            const result = await validateEmploymentStatusTool.fn({ employmentStatus: 'invalid' });

            expect(result).toEqual({
                isValid: false,
                message: 'Invalid employment status. Must be one of: employed, self_employed, unemployed, retired, student',
                validStatuses: ['employed', 'self_employed', 'unemployed', 'retired', 'student']
            });
        });
    });

    describe('validateDateOfBirthTool', () => {
        const validateDateOfBirthTool = personalInfoTools.find(tool => tool.id === 'personal_info_validate_date_of_birth')!;

        it('should have correct metadata', () => {
            expect(validateDateOfBirthTool.id).toBe('personal_info_validate_date_of_birth');
            expect(validateDateOfBirthTool.name).toBe('Validate Date of Birth');
            expect(validateDateOfBirthTool.description).toBe('Validate date of birth format and age requirement');
        });

        it('should validate correct date of birth', async () => {
            mockPersonalInfoService.validateDateOfBirth.mockReturnValue({ isValid: true });

            const result = await validateDateOfBirthTool.fn({ dateOfBirth: '1990-01-15' });

            expect(result).toEqual({
                isValid: true,
                message: 'Date of birth is valid'
            });

            expect(mockPersonalInfoService.validateDateOfBirth).toHaveBeenCalledWith('1990-01-15');
        });

        it('should validate incorrect date of birth format', async () => {
            mockPersonalInfoService.validateDateOfBirth.mockReturnValue({
                isValid: false,
                message: 'Invalid date format. Expected format: YYYY-MM-DD'
            });

            const result = await validateDateOfBirthTool.fn({ dateOfBirth: '01/15/1990' });

            expect(result).toEqual({
                isValid: false,
                message: 'Invalid date format. Expected format: YYYY-MM-DD'
            });
        });

        it('should validate date of birth for under 18', async () => {
            mockPersonalInfoService.validateDateOfBirth.mockReturnValue({
                isValid: false,
                message: 'Applicant must be at least 18 years old'
            });

            const today = new Date();
            const underAgeDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
            const underAgeDateStr = underAgeDate.toISOString().split('T')[0];

            const result = await validateDateOfBirthTool.fn({ dateOfBirth: underAgeDateStr });

            expect(result).toEqual({
                isValid: false,
                message: 'Applicant must be at least 18 years old'
            });
        });
    });

    describe('Tool Structure', () => {
        it('should export all expected tools', () => {
            expect(personalInfoTools).toHaveLength(6);
            
            const toolIds = personalInfoTools.map(tool => tool.id);
            expect(toolIds).toContain('personal_info_create_or_update');
            expect(toolIds).toContain('personal_info_get');
            expect(toolIds).toContain('personal_info_delete');
            expect(toolIds).toContain('personal_info_validate_ssn');
            expect(toolIds).toContain('personal_info_validate_employment_status');
            expect(toolIds).toContain('personal_info_validate_date_of_birth');
        });

        it('should have input schemas for all tools', () => {
            personalInfoTools.forEach(tool => {
                expect(tool.inputSchema).toBeDefined();
                expect(tool.fn).toBeDefined();
            });
        });

        it('should have output schemas where specified', () => {
            const toolsWithOutputSchema = ['personal_info_create_or_update', 'personal_info_delete', 'personal_info_validate_ssn', 'personal_info_validate_employment_status', 'personal_info_validate_date_of_birth'];
            
            personalInfoTools.forEach(tool => {
                if (toolsWithOutputSchema.includes(tool.id)) {
                    expect(tool.outputSchema).toBeDefined();
                }
            });
        });
    });
});