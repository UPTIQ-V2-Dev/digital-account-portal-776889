import { describe, it, expect, beforeEach, vi } from 'vitest';
import businessProfileService from '../businessProfile.service.ts';
import prisma from '../../client.ts';
import ApiError from '../../utils/ApiError.ts';
import httpStatus from 'http-status';

// Mock Prisma client
vi.mock('../../client.ts', () => ({
    default: {
        application: {
            findFirst: vi.fn(),
        },
        businessProfile: {
            findFirst: vi.fn(),
            findUnique: vi.fn(),
            upsert: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

const mockPrisma = prisma as any;

describe('Business Profile Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockApplication = {
        id: 'app_test_123',
        userId: 1,
        status: 'draft',
        accountType: 'business'
    };

    const mockBusinessProfile = {
        id: 'bp_test_123',
        applicationId: 'app_test_123',
        businessName: 'Test Corp',
        dbaName: 'Test Solutions',
        ein: '12-3456789',
        entityType: 'corporation',
        industryType: 'Technology',
        dateEstablished: '2020-01-01',
        businessPhone: '555-987-6543',
        businessEmail: 'info@testcorp.com',
        website: 'https://testcorp.com',
        description: 'Technology consulting services',
        isCashIntensive: false,
        monthlyTransactionVolume: 50000,
        monthlyTransactionCount: 100,
        expectedBalance: 25000,
        businessStreet: '456 Business Blvd',
        businessCity: 'Business City',
        businessState: 'CA',
        businessZipCode: '54321',
        businessCountry: 'US',
        businessApartment: 'Suite 100',
        mailingStreet: '789 Mail St',
        mailingCity: 'Mail City',
        mailingState: 'NY',
        mailingZipCode: '12345',
        mailingCountry: 'US',
        mailingApartment: 'Box 1'
    };

    const validBusinessData = {
        businessName: 'Test Corp',
        dbaName: 'Test Solutions',
        ein: '12-3456789',
        entityType: 'corporation' as const,
        industryType: 'Technology',
        dateEstablished: '2020-01-01',
        businessPhone: '555-987-6543',
        businessEmail: 'info@testcorp.com',
        website: 'https://testcorp.com',
        description: 'Technology consulting services',
        isCashIntensive: false,
        monthlyTransactionVolume: 50000,
        monthlyTransactionCount: 100,
        expectedBalance: 25000,
        businessAddress: {
            street: '456 Business Blvd',
            city: 'Business City',
            state: 'CA',
            zipCode: '54321',
            country: 'US',
            apartment: 'Suite 100'
        },
        mailingAddress: {
            street: '789 Mail St',
            city: 'Mail City',
            state: 'NY',
            zipCode: '12345',
            country: 'US',
            apartment: 'Box 1'
        }
    };

    describe('createOrUpdateBusinessProfile', () => {
        it('should create a new business profile successfully', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
            mockPrisma.businessProfile.findFirst.mockResolvedValue(null);
            mockPrisma.businessProfile.upsert.mockResolvedValue(mockBusinessProfile);

            const result = await businessProfileService.createOrUpdateBusinessProfile(
                'app_test_123',
                1,
                validBusinessData
            );

            expect(mockPrisma.application.findFirst).toHaveBeenCalledWith({
                where: { id: 'app_test_123', userId: 1 }
            });
            expect(result).toEqual(mockBusinessProfile);
        });

        it('should update existing business profile successfully', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
            mockPrisma.businessProfile.findFirst.mockResolvedValue(null);
            mockPrisma.businessProfile.upsert.mockResolvedValue(mockBusinessProfile);

            const result = await businessProfileService.createOrUpdateBusinessProfile(
                'app_test_123',
                1,
                validBusinessData
            );

            expect(result).toEqual(mockBusinessProfile);
            expect(mockPrisma.businessProfile.upsert).toHaveBeenCalled();
        });

        it('should throw error when application not found', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(null);

            await expect(
                businessProfileService.createOrUpdateBusinessProfile(
                    'nonexistent_app',
                    1,
                    validBusinessData
                )
            ).rejects.toThrow(new ApiError(httpStatus.NOT_FOUND, 'Application not found'));
        });

        it('should throw error for invalid entity type', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);

            const invalidData = {
                ...validBusinessData,
                entityType: 'invalid_type' as any
            };

            await expect(
                businessProfileService.createOrUpdateBusinessProfile(
                    'app_test_123',
                    1,
                    invalidData
                )
            ).rejects.toThrow(new ApiError(httpStatus.BAD_REQUEST, 'Invalid entity type'));
        });

        it('should throw error for invalid EIN format', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);

            const invalidData = {
                ...validBusinessData,
                ein: '123456789' // Invalid format
            };

            await expect(
                businessProfileService.createOrUpdateBusinessProfile(
                    'app_test_123',
                    1,
                    invalidData
                )
            ).rejects.toThrow(new ApiError(httpStatus.BAD_REQUEST, 'Invalid EIN format. Expected format: XX-XXXXXXX'));
        });

        it('should throw error when EIN already in use by another application', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
            mockPrisma.businessProfile.findFirst.mockResolvedValue({
                ...mockBusinessProfile,
                applicationId: 'different_app'
            });

            await expect(
                businessProfileService.createOrUpdateBusinessProfile(
                    'app_test_123',
                    1,
                    validBusinessData
                )
            ).rejects.toThrow(new ApiError(httpStatus.BAD_REQUEST, 'EIN is already in use by another application'));
        });

        it('should handle database unique constraint error', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
            mockPrisma.businessProfile.findFirst.mockResolvedValue(null);
            
            const dbError = new Error('Database error');
            (dbError as any).code = 'P2002';
            (dbError as any).meta = { target: ['ein'] };
            
            mockPrisma.businessProfile.upsert.mockRejectedValue(dbError);

            await expect(
                businessProfileService.createOrUpdateBusinessProfile(
                    'app_test_123',
                    1,
                    validBusinessData
                )
            ).rejects.toThrow(new ApiError(httpStatus.BAD_REQUEST, 'EIN is already in use by another application'));
        });

        it('should handle other database errors', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
            mockPrisma.businessProfile.findFirst.mockResolvedValue(null);
            mockPrisma.businessProfile.upsert.mockRejectedValue(new Error('Database error'));

            await expect(
                businessProfileService.createOrUpdateBusinessProfile(
                    'app_test_123',
                    1,
                    validBusinessData
                )
            ).rejects.toThrow(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to save business profile'));
        });
    });

    describe('getBusinessProfileByApplicationId', () => {
        it('should get business profile successfully', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
            mockPrisma.businessProfile.findUnique.mockResolvedValue(mockBusinessProfile);

            const result = await businessProfileService.getBusinessProfileByApplicationId('app_test_123', 1);

            expect(mockPrisma.application.findFirst).toHaveBeenCalledWith({
                where: { id: 'app_test_123', userId: 1 }
            });
            expect(mockPrisma.businessProfile.findUnique).toHaveBeenCalledWith({
                where: { applicationId: 'app_test_123' }
            });
            expect(result).toEqual(mockBusinessProfile);
        });

        it('should return null when business profile not found', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
            mockPrisma.businessProfile.findUnique.mockResolvedValue(null);

            const result = await businessProfileService.getBusinessProfileByApplicationId('app_test_123', 1);

            expect(result).toBeNull();
        });

        it('should throw error when application not found', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(null);

            await expect(
                businessProfileService.getBusinessProfileByApplicationId('nonexistent_app', 1)
            ).rejects.toThrow(new ApiError(httpStatus.NOT_FOUND, 'Application not found'));
        });
    });

    describe('deleteBusinessProfileByApplicationId', () => {
        it('should delete business profile successfully', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
            mockPrisma.businessProfile.findUnique.mockResolvedValue(mockBusinessProfile);
            mockPrisma.businessProfile.delete.mockResolvedValue(mockBusinessProfile);

            const result = await businessProfileService.deleteBusinessProfileByApplicationId('app_test_123', 1);

            expect(mockPrisma.application.findFirst).toHaveBeenCalledWith({
                where: { id: 'app_test_123', userId: 1 }
            });
            expect(mockPrisma.businessProfile.delete).toHaveBeenCalledWith({
                where: { applicationId: 'app_test_123' }
            });
            expect(result).toEqual(mockBusinessProfile);
        });

        it('should throw error when application not found', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(null);

            await expect(
                businessProfileService.deleteBusinessProfileByApplicationId('nonexistent_app', 1)
            ).rejects.toThrow(new ApiError(httpStatus.NOT_FOUND, 'Application not found'));
        });

        it('should throw error when business profile not found', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
            mockPrisma.businessProfile.findUnique.mockResolvedValue(null);

            await expect(
                businessProfileService.deleteBusinessProfileByApplicationId('app_test_123', 1)
            ).rejects.toThrow(new ApiError(httpStatus.NOT_FOUND, 'Business profile not found'));
        });
    });

    describe('validateEIN', () => {
        it('should validate correct EIN format', () => {
            expect(businessProfileService.validateEIN('12-3456789')).toBe(true);
            expect(businessProfileService.validateEIN('00-0000000')).toBe(true);
            expect(businessProfileService.validateEIN('99-9999999')).toBe(true);
        });

        it('should reject invalid EIN formats', () => {
            expect(businessProfileService.validateEIN('123456789')).toBe(false);
            expect(businessProfileService.validateEIN('12-345678')).toBe(false);
            expect(businessProfileService.validateEIN('12-34567890')).toBe(false);
            expect(businessProfileService.validateEIN('1-3456789')).toBe(false);
            expect(businessProfileService.validateEIN('12-34567a9')).toBe(false);
            expect(businessProfileService.validateEIN('ab-3456789')).toBe(false);
            expect(businessProfileService.validateEIN('')).toBe(false);
        });
    });

    describe('validateEntityType', () => {
        it('should validate correct entity types', () => {
            expect(businessProfileService.validateEntityType('corporation')).toBe(true);
            expect(businessProfileService.validateEntityType('llc')).toBe(true);
            expect(businessProfileService.validateEntityType('partnership')).toBe(true);
            expect(businessProfileService.validateEntityType('sole_proprietorship')).toBe(true);
        });

        it('should reject invalid entity types', () => {
            expect(businessProfileService.validateEntityType('invalid')).toBe(false);
            expect(businessProfileService.validateEntityType('Corporation')).toBe(false); // Case sensitive
            expect(businessProfileService.validateEntityType('LLC')).toBe(false); // Case sensitive
            expect(businessProfileService.validateEntityType('')).toBe(false);
            expect(businessProfileService.validateEntityType('nonprofit')).toBe(false);
        });
    });
});