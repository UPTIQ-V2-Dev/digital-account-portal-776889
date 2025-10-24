import { describe, it, expect, beforeEach, vi } from 'vitest';
import personalInfoService from '../personalInfo.service.ts';
import prisma from '../../client.ts';
import ApiError from '../../utils/ApiError.ts';
import httpStatus from 'http-status';

// Mock Prisma client
vi.mock('../../client.ts', () => ({
    default: {
        application: {
            findFirst: vi.fn(),
        },
        personalInfo: {
            findFirst: vi.fn(),
            findUnique: vi.fn(),
            upsert: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

const mockPrisma = prisma as any;

describe('Personal Info Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockApplication = {
        id: 'app_test_123',
        userId: 1,
        status: 'draft',
        accountType: 'consumer'
    };

    const mockPersonalInfo = {
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

    const mockPersonalData = {
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
            country: 'US'
        }
    };

    describe('createOrUpdatePersonalInfo', () => {
        it('should create personal info successfully', async () => {
            mockPrisma.application.findFirst.mockResolvedValueOnce(mockApplication);
            mockPrisma.personalInfo.findFirst.mockResolvedValueOnce(null);
            mockPrisma.personalInfo.upsert.mockResolvedValueOnce(mockPersonalInfo);

            const result = await personalInfoService.createOrUpdatePersonalInfo(
                'app_test_123',
                1,
                mockPersonalData
            );

            expect(result).toEqual(mockPersonalInfo);
            expect(mockPrisma.application.findFirst).toHaveBeenCalledWith({
                where: { id: 'app_test_123', userId: 1 }
            });
            expect(mockPrisma.personalInfo.upsert).toHaveBeenCalled();
        });

        it('should update existing personal info successfully', async () => {
            const existingPersonalInfo = { ...mockPersonalInfo };
            mockPrisma.application.findFirst.mockResolvedValueOnce(mockApplication);
            mockPrisma.personalInfo.findFirst.mockResolvedValueOnce(null);
            mockPrisma.personalInfo.upsert.mockResolvedValueOnce({
                ...existingPersonalInfo,
                firstName: 'Jane'
            });

            const updatedData = { ...mockPersonalData, firstName: 'Jane' };
            const result = await personalInfoService.createOrUpdatePersonalInfo(
                'app_test_123',
                1,
                updatedData
            );

            expect(result.firstName).toBe('Jane');
            expect(mockPrisma.personalInfo.upsert).toHaveBeenCalled();
        });

        it('should throw error if application not found', async () => {
            mockPrisma.application.findFirst.mockResolvedValueOnce(null);

            await expect(
                personalInfoService.createOrUpdatePersonalInfo('app_test_123', 1, mockPersonalData)
            ).rejects.toThrow(new ApiError(httpStatus.NOT_FOUND, 'Application not found'));
        });

        it('should throw error for invalid employment status', async () => {
            mockPrisma.application.findFirst.mockResolvedValueOnce(mockApplication);

            const invalidData = { ...mockPersonalData, employmentStatus: 'invalid' };

            await expect(
                personalInfoService.createOrUpdatePersonalInfo('app_test_123', 1, invalidData)
            ).rejects.toThrow(new ApiError(httpStatus.BAD_REQUEST, 'Invalid employment status'));
        });

        it('should throw error for invalid date of birth format', async () => {
            mockPrisma.application.findFirst.mockResolvedValueOnce(mockApplication);

            const invalidData = { ...mockPersonalData, dateOfBirth: '01/15/1990' };

            await expect(
                personalInfoService.createOrUpdatePersonalInfo('app_test_123', 1, invalidData)
            ).rejects.toThrow(new ApiError(httpStatus.BAD_REQUEST, 'Invalid date of birth format. Expected format: YYYY-MM-DD'));
        });

        it('should throw error for applicant under 18', async () => {
            mockPrisma.application.findFirst.mockResolvedValueOnce(mockApplication);

            // Set date of birth to less than 18 years ago
            const today = new Date();
            const underAgeDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
            const invalidData = { 
                ...mockPersonalData, 
                dateOfBirth: underAgeDate.toISOString().split('T')[0] 
            };

            await expect(
                personalInfoService.createOrUpdatePersonalInfo('app_test_123', 1, invalidData)
            ).rejects.toThrow(new ApiError(httpStatus.BAD_REQUEST, 'Applicant must be at least 18 years old'));
        });

        it('should throw error for future date of birth', async () => {
            mockPrisma.application.findFirst.mockResolvedValueOnce(mockApplication);

            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);
            const invalidData = { 
                ...mockPersonalData, 
                dateOfBirth: futureDate.toISOString().split('T')[0] 
            };

            await expect(
                personalInfoService.createOrUpdatePersonalInfo('app_test_123', 1, invalidData)
            ).rejects.toThrow(new ApiError(httpStatus.BAD_REQUEST, 'Date of birth cannot be in the future'));
        });

        it('should throw error for invalid SSN format', async () => {
            mockPrisma.application.findFirst.mockResolvedValueOnce(mockApplication);

            const invalidData = { ...mockPersonalData, ssn: '123456789' };

            await expect(
                personalInfoService.createOrUpdatePersonalInfo('app_test_123', 1, invalidData)
            ).rejects.toThrow(new ApiError(httpStatus.BAD_REQUEST, 'Invalid SSN format. Expected format: XXX-XX-XXXX'));
        });

        it('should throw error for duplicate SSN', async () => {
            mockPrisma.application.findFirst.mockResolvedValueOnce(mockApplication);
            mockPrisma.personalInfo.findFirst.mockResolvedValueOnce({
                id: 'pi_other_123',
                applicationId: 'app_other_123',
                ssn: '123-45-6789'
            });

            await expect(
                personalInfoService.createOrUpdatePersonalInfo('app_test_123', 1, mockPersonalData)
            ).rejects.toThrow(new ApiError(httpStatus.BAD_REQUEST, 'SSN is already in use by another application'));
        });

        it('should handle Prisma unique constraint error', async () => {
            mockPrisma.application.findFirst.mockResolvedValueOnce(mockApplication);
            mockPrisma.personalInfo.findFirst.mockResolvedValueOnce(null);
            mockPrisma.personalInfo.upsert.mockRejectedValueOnce({
                code: 'P2002',
                meta: { target: ['ssn'] }
            });

            await expect(
                personalInfoService.createOrUpdatePersonalInfo('app_test_123', 1, mockPersonalData)
            ).rejects.toThrow(new ApiError(httpStatus.BAD_REQUEST, 'SSN is already in use by another application'));
        });

        it('should handle general database errors', async () => {
            mockPrisma.application.findFirst.mockResolvedValueOnce(mockApplication);
            mockPrisma.personalInfo.findFirst.mockResolvedValueOnce(null);
            mockPrisma.personalInfo.upsert.mockRejectedValueOnce(new Error('Database error'));

            await expect(
                personalInfoService.createOrUpdatePersonalInfo('app_test_123', 1, mockPersonalData)
            ).rejects.toThrow(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to save personal information'));
        });

        it('should create personal info without physical address', async () => {
            mockPrisma.application.findFirst.mockResolvedValueOnce(mockApplication);
            mockPrisma.personalInfo.findFirst.mockResolvedValueOnce(null);
            
            const profileWithoutPhysical = { ...mockPersonalInfo };
            (profileWithoutPhysical as any).physicalStreet = null;
            (profileWithoutPhysical as any).physicalCity = null;
            (profileWithoutPhysical as any).physicalState = null;
            (profileWithoutPhysical as any).physicalZipCode = null;
            (profileWithoutPhysical as any).physicalCountry = null;
            profileWithoutPhysical.physicalApartment = null;

            mockPrisma.personalInfo.upsert.mockResolvedValueOnce(profileWithoutPhysical);

            const dataWithoutPhysical = { ...mockPersonalData };
            delete (dataWithoutPhysical as any).physicalAddress;

            const result = await personalInfoService.createOrUpdatePersonalInfo(
                'app_test_123',
                1,
                dataWithoutPhysical
            );

            expect(result.physicalStreet).toBeNull();
            expect(mockPrisma.personalInfo.upsert).toHaveBeenCalled();
        });
    });

    describe('getPersonalInfoByApplicationId', () => {
        it('should get personal info successfully', async () => {
            mockPrisma.application.findFirst.mockResolvedValueOnce(mockApplication);
            mockPrisma.personalInfo.findUnique.mockResolvedValueOnce(mockPersonalInfo);

            const result = await personalInfoService.getPersonalInfoByApplicationId('app_test_123', 1);

            expect(result).toEqual(mockPersonalInfo);
            expect(mockPrisma.application.findFirst).toHaveBeenCalledWith({
                where: { id: 'app_test_123', userId: 1 }
            });
            expect(mockPrisma.personalInfo.findUnique).toHaveBeenCalledWith({
                where: { applicationId: 'app_test_123' }
            });
        });

        it('should return null if personal info not found', async () => {
            mockPrisma.application.findFirst.mockResolvedValueOnce(mockApplication);
            mockPrisma.personalInfo.findUnique.mockResolvedValueOnce(null);

            const result = await personalInfoService.getPersonalInfoByApplicationId('app_test_123', 1);

            expect(result).toBeNull();
        });

        it('should throw error if application not found', async () => {
            mockPrisma.application.findFirst.mockResolvedValueOnce(null);

            await expect(
                personalInfoService.getPersonalInfoByApplicationId('app_test_123', 1)
            ).rejects.toThrow(new ApiError(httpStatus.NOT_FOUND, 'Application not found'));
        });
    });

    describe('deletePersonalInfoByApplicationId', () => {
        it('should delete personal info successfully', async () => {
            mockPrisma.application.findFirst.mockResolvedValueOnce(mockApplication);
            mockPrisma.personalInfo.findUnique.mockResolvedValueOnce(mockPersonalInfo);
            mockPrisma.personalInfo.delete.mockResolvedValueOnce(mockPersonalInfo);

            const result = await personalInfoService.deletePersonalInfoByApplicationId('app_test_123', 1);

            expect(result).toEqual(mockPersonalInfo);
            expect(mockPrisma.personalInfo.delete).toHaveBeenCalledWith({
                where: { applicationId: 'app_test_123' }
            });
        });

        it('should throw error if application not found', async () => {
            mockPrisma.application.findFirst.mockResolvedValueOnce(null);

            await expect(
                personalInfoService.deletePersonalInfoByApplicationId('app_test_123', 1)
            ).rejects.toThrow(new ApiError(httpStatus.NOT_FOUND, 'Application not found'));
        });

        it('should throw error if personal info not found', async () => {
            mockPrisma.application.findFirst.mockResolvedValueOnce(mockApplication);
            mockPrisma.personalInfo.findUnique.mockResolvedValueOnce(null);

            await expect(
                personalInfoService.deletePersonalInfoByApplicationId('app_test_123', 1)
            ).rejects.toThrow(new ApiError(httpStatus.NOT_FOUND, 'Personal information not found'));
        });
    });

    describe('validation methods', () => {
        describe('validateSSN', () => {
            it('should validate correct SSN format', () => {
                expect(personalInfoService.validateSSN('123-45-6789')).toBe(true);
            });

            it('should reject incorrect SSN formats', () => {
                expect(personalInfoService.validateSSN('123456789')).toBe(false);
                expect(personalInfoService.validateSSN('123-456-789')).toBe(false);
                expect(personalInfoService.validateSSN('12-45-6789')).toBe(false);
                expect(personalInfoService.validateSSN('123-45-67890')).toBe(false);
                expect(personalInfoService.validateSSN('')).toBe(false);
            });
        });

        describe('validateEmploymentStatus', () => {
            it('should validate correct employment statuses', () => {
                expect(personalInfoService.validateEmploymentStatus('employed')).toBe(true);
                expect(personalInfoService.validateEmploymentStatus('self_employed')).toBe(true);
                expect(personalInfoService.validateEmploymentStatus('unemployed')).toBe(true);
                expect(personalInfoService.validateEmploymentStatus('retired')).toBe(true);
                expect(personalInfoService.validateEmploymentStatus('student')).toBe(true);
            });

            it('should reject incorrect employment statuses', () => {
                expect(personalInfoService.validateEmploymentStatus('invalid')).toBe(false);
                expect(personalInfoService.validateEmploymentStatus('')).toBe(false);
                expect(personalInfoService.validateEmploymentStatus('EMPLOYED')).toBe(false);
            });
        });

        describe('validateDateOfBirth', () => {
            it('should validate correct date format and age', () => {
                const validDate = '1990-01-15'; // Over 18 years old
                const result = personalInfoService.validateDateOfBirth(validDate);
                expect(result.isValid).toBe(true);
            });

            it('should reject incorrect date formats', () => {
                const result = personalInfoService.validateDateOfBirth('01/15/1990');
                expect(result.isValid).toBe(false);
                expect(result.message).toBe('Invalid date format. Expected format: YYYY-MM-DD');
            });

            it('should reject future dates', () => {
                const futureDate = new Date();
                futureDate.setDate(futureDate.getDate() + 1);
                const futureDateStr = futureDate.toISOString().split('T')[0];
                
                const result = personalInfoService.validateDateOfBirth(futureDateStr);
                expect(result.isValid).toBe(false);
                expect(result.message).toBe('Date of birth cannot be in the future');
            });

            it('should reject dates for applicants under 18', () => {
                const today = new Date();
                const underAgeDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
                const underAgeDateStr = underAgeDate.toISOString().split('T')[0];
                
                const result = personalInfoService.validateDateOfBirth(underAgeDateStr);
                expect(result.isValid).toBe(false);
                expect(result.message).toBe('Applicant must be at least 18 years old');
            });
        });
    });
});