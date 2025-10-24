import { describe, it, expect, beforeEach, vi } from 'vitest';
import { businessProfileTools } from '../businessProfile.tool.ts';
import { businessProfileService } from '../../services/index.ts';

// Mock services
vi.mock('../../services/index.ts', () => ({
    businessProfileService: {
        createOrUpdateBusinessProfile: vi.fn(),
        getBusinessProfileByApplicationId: vi.fn(),
        deleteBusinessProfileByApplicationId: vi.fn(),
        validateEIN: vi.fn(),
        validateEntityType: vi.fn(),
    },
}));

const mockBusinessProfileService = businessProfileService as any;

describe('Business Profile Tools', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

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

    const expectedToolResponse = {
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

    describe('createOrUpdateBusinessProfileTool', () => {
        it('should have correct metadata', () => {
            const tool = businessProfileTools.find(t => t.id === 'business_profile_create_or_update');
            expect(tool).toBeDefined();
            expect(tool?.name).toBe('Create or Update Business Profile');
            expect(tool?.description).toBe('Create or update business profile information for a commercial account opening application');
        });

        it('should create or update business profile successfully', async () => {
            const tool = businessProfileTools.find(t => t.id === 'business_profile_create_or_update')!;
            mockBusinessProfileService.createOrUpdateBusinessProfile.mockResolvedValue(mockBusinessProfile);

            const result = await tool.fn({
                applicationId: 'app_test_123',
                userId: 1,
                businessData: validBusinessData
            });

            expect(mockBusinessProfileService.createOrUpdateBusinessProfile).toHaveBeenCalledWith(
                'app_test_123',
                1,
                validBusinessData
            );
            expect(result).toEqual(expectedToolResponse);
        });

        it('should handle business profile without mailing address', async () => {
            const tool = businessProfileTools.find(t => t.id === 'business_profile_create_or_update')!;
            const profileWithoutMailing = { ...mockBusinessProfile, mailingStreet: null };
            const expectedWithoutMailing = { ...expectedToolResponse, mailingAddress: null };

            mockBusinessProfileService.createOrUpdateBusinessProfile.mockResolvedValue(profileWithoutMailing);

            const result = await tool.fn({
                applicationId: 'app_test_123',
                userId: 1,
                businessData: validBusinessData
            });

            expect(result).toEqual(expectedWithoutMailing);
        });
    });

    describe('getBusinessProfileTool', () => {
        it('should have correct metadata', () => {
            const tool = businessProfileTools.find(t => t.id === 'business_profile_get');
            expect(tool).toBeDefined();
            expect(tool?.name).toBe('Get Business Profile');
            expect(tool?.description).toBe('Get business profile information for a specific application');
        });

        it('should get business profile successfully', async () => {
            const tool = businessProfileTools.find(t => t.id === 'business_profile_get')!;
            mockBusinessProfileService.getBusinessProfileByApplicationId.mockResolvedValue(mockBusinessProfile);

            const result = await tool.fn({
                applicationId: 'app_test_123',
                userId: 1
            });

            expect(mockBusinessProfileService.getBusinessProfileByApplicationId).toHaveBeenCalledWith(
                'app_test_123',
                1
            );
            expect(result).toEqual(expectedToolResponse);
        });

        it('should return null when business profile not found', async () => {
            const tool = businessProfileTools.find(t => t.id === 'business_profile_get')!;
            mockBusinessProfileService.getBusinessProfileByApplicationId.mockResolvedValue(null);

            const result = await tool.fn({
                applicationId: 'app_test_123',
                userId: 1
            });

            expect(result).toBeNull();
        });

        it('should handle business profile without mailing address', async () => {
            const tool = businessProfileTools.find(t => t.id === 'business_profile_get')!;
            const profileWithoutMailing = { ...mockBusinessProfile, mailingStreet: null };
            const expectedWithoutMailing = { ...expectedToolResponse, mailingAddress: null };

            mockBusinessProfileService.getBusinessProfileByApplicationId.mockResolvedValue(profileWithoutMailing);

            const result = await tool.fn({
                applicationId: 'app_test_123',
                userId: 1
            });

            expect(result).toEqual(expectedWithoutMailing);
        });
    });

    describe('deleteBusinessProfileTool', () => {
        it('should have correct metadata', () => {
            const tool = businessProfileTools.find(t => t.id === 'business_profile_delete');
            expect(tool).toBeDefined();
            expect(tool?.name).toBe('Delete Business Profile');
            expect(tool?.description).toBe('Delete business profile for a specific application');
        });

        it('should delete business profile successfully', async () => {
            const tool = businessProfileTools.find(t => t.id === 'business_profile_delete')!;
            mockBusinessProfileService.deleteBusinessProfileByApplicationId.mockResolvedValue(mockBusinessProfile);

            const result = await tool.fn({
                applicationId: 'app_test_123',
                userId: 1
            });

            expect(mockBusinessProfileService.deleteBusinessProfileByApplicationId).toHaveBeenCalledWith(
                'app_test_123',
                1
            );
            expect(result).toEqual({
                success: true,
                message: 'Business profile deleted successfully'
            });
        });
    });

    describe('validateEINTool', () => {
        it('should have correct metadata', () => {
            const tool = businessProfileTools.find(t => t.id === 'business_profile_validate_ein');
            expect(tool).toBeDefined();
            expect(tool?.name).toBe('Validate EIN');
            expect(tool?.description).toBe('Validate Employer Identification Number format');
        });

        it('should validate valid EIN', async () => {
            const tool = businessProfileTools.find(t => t.id === 'business_profile_validate_ein')!;
            mockBusinessProfileService.validateEIN.mockReturnValue(true);

            const result = await tool.fn({ ein: '12-3456789' });

            expect(mockBusinessProfileService.validateEIN).toHaveBeenCalledWith('12-3456789');
            expect(result).toEqual({
                isValid: true,
                message: 'EIN format is valid'
            });
        });

        it('should validate invalid EIN', async () => {
            const tool = businessProfileTools.find(t => t.id === 'business_profile_validate_ein')!;
            mockBusinessProfileService.validateEIN.mockReturnValue(false);

            const result = await tool.fn({ ein: '123456789' });

            expect(mockBusinessProfileService.validateEIN).toHaveBeenCalledWith('123456789');
            expect(result).toEqual({
                isValid: false,
                message: 'Invalid EIN format. Expected format: XX-XXXXXXX'
            });
        });
    });

    describe('validateEntityTypeTool', () => {
        it('should have correct metadata', () => {
            const tool = businessProfileTools.find(t => t.id === 'business_profile_validate_entity_type');
            expect(tool).toBeDefined();
            expect(tool?.name).toBe('Validate Entity Type');
            expect(tool?.description).toBe('Validate business entity type');
        });

        it('should validate valid entity type', async () => {
            const tool = businessProfileTools.find(t => t.id === 'business_profile_validate_entity_type')!;
            mockBusinessProfileService.validateEntityType.mockReturnValue(true);

            const result = await tool.fn({ entityType: 'corporation' });

            expect(mockBusinessProfileService.validateEntityType).toHaveBeenCalledWith('corporation');
            expect(result).toEqual({
                isValid: true,
                message: 'Entity type is valid',
                validTypes: ['corporation', 'llc', 'partnership', 'sole_proprietorship']
            });
        });

        it('should validate invalid entity type', async () => {
            const tool = businessProfileTools.find(t => t.id === 'business_profile_validate_entity_type')!;
            mockBusinessProfileService.validateEntityType.mockReturnValue(false);

            const result = await tool.fn({ entityType: 'invalid' });

            expect(mockBusinessProfileService.validateEntityType).toHaveBeenCalledWith('invalid');
            expect(result).toEqual({
                isValid: false,
                message: 'Invalid entity type. Must be one of: corporation, llc, partnership, sole_proprietorship',
                validTypes: ['corporation', 'llc', 'partnership', 'sole_proprietorship']
            });
        });
    });

    describe('tool count and structure', () => {
        it('should have all expected tools', () => {
            expect(businessProfileTools).toHaveLength(5);
            
            const toolIds = businessProfileTools.map(t => t.id);
            expect(toolIds).toContain('business_profile_create_or_update');
            expect(toolIds).toContain('business_profile_get');
            expect(toolIds).toContain('business_profile_delete');
            expect(toolIds).toContain('business_profile_validate_ein');
            expect(toolIds).toContain('business_profile_validate_entity_type');
        });

        it('should have valid tool structure', () => {
            businessProfileTools.forEach(tool => {
                expect(tool).toHaveProperty('id');
                expect(tool).toHaveProperty('name');
                expect(tool).toHaveProperty('description');
                expect(tool).toHaveProperty('inputSchema');
                expect(tool).toHaveProperty('fn');
                expect(typeof tool.fn).toBe('function');
                // outputSchema is optional for some tools
            });
        });
    });
});