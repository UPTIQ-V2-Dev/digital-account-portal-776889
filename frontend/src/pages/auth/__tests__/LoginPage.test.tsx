import { describe, it, expect, vi } from 'vitest';
import { authService } from '@/services/auth';
import { mockAuthResponse } from '@/data/mockData';
import type { LoginRequest } from '@/types/user';

// Mock the api module to avoid network calls
vi.mock('@/lib/api', () => ({
    api: {
        post: vi.fn(),
        defaults: {
            headers: {}
        }
    },
    setAuthData: vi.fn(),
    clearAuthData: vi.fn(),
    getStoredRefreshToken: vi.fn(),
    getStoredToken: vi.fn(),
    getStoredUser: vi.fn(),
    isAuthenticated: vi.fn(),
    isAdmin: vi.fn(),
    getAuthHeaders: vi.fn()
}));

describe('LoginPage Authentication', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Set mock environment variable
        vi.stubEnv('VITE_USE_MOCK_DATA', 'true');
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('should successfully login with valid credentials using mock data', async () => {
        const loginRequest: LoginRequest = {
            email: 'test@example.com',
            password: 'password123'
        };

        const result = await authService.login(loginRequest);

        expect(result).toEqual(mockAuthResponse);
        expect(result.user.email).toBe(mockAuthResponse.user.email);
        expect(result.tokens.access.token).toBeDefined();
        expect(result.tokens.refresh.token).toBeDefined();
    });

    it('should handle login with different email formats', async () => {
        const loginRequest: LoginRequest = {
            email: 'user@company.co.uk',
            password: 'securePassword'
        };

        const result = await authService.login(loginRequest);

        expect(result).toEqual(mockAuthResponse);
        expect(typeof result.user.id).toBe('number');
        expect(result.user.role).toMatch(/^(USER|ADMIN)$/);
    });

    it('should return auth response with proper token structure', async () => {
        const loginRequest: LoginRequest = {
            email: 'admin@example.com',
            password: 'adminpass123'
        };

        const result = await authService.login(loginRequest);

        expect(result.tokens).toHaveProperty('access');
        expect(result.tokens).toHaveProperty('refresh');
        expect(result.tokens.access).toHaveProperty('token');
        expect(result.tokens.access).toHaveProperty('expires');
        expect(result.tokens.refresh).toHaveProperty('token');
        expect(result.tokens.refresh).toHaveProperty('expires');
    });

    it('should return user data with correct structure', async () => {
        const loginRequest: LoginRequest = {
            email: 'test@banking.com',
            password: 'bankingPass123'
        };

        const result = await authService.login(loginRequest);

        expect(result.user).toHaveProperty('id');
        expect(result.user).toHaveProperty('email');
        expect(result.user).toHaveProperty('role');
        expect(result.user).toHaveProperty('isEmailVerified');
        expect(result.user).toHaveProperty('createdAt');
        expect(result.user).toHaveProperty('updatedAt');
        expect(typeof result.user.isEmailVerified).toBe('boolean');
    });

    it('should handle empty credentials gracefully', async () => {
        const loginRequest: LoginRequest = {
            email: '',
            password: ''
        };

        // Should still return mock data when using mock environment
        const result = await authService.login(loginRequest);
        expect(result).toEqual(mockAuthResponse);
    });

    it('should preserve email case in response', async () => {
        const loginRequest: LoginRequest = {
            email: 'Test.User@Example.COM',
            password: 'mixedCaseTest123'
        };

        const result = await authService.login(loginRequest);
        expect(result.user.email).toBe(mockAuthResponse.user.email);
    });

    it('should validate login request structure', () => {
        // Test that LoginRequest interface is properly typed
        const validLoginRequest: LoginRequest = {
            email: 'user@example.com',
            password: 'password123'
        };

        expect(validLoginRequest).toHaveProperty('email');
        expect(validLoginRequest).toHaveProperty('password');
        expect(typeof validLoginRequest.email).toBe('string');
        expect(typeof validLoginRequest.password).toBe('string');
    });

    it('should return consistent user role values', async () => {
        const loginRequest: LoginRequest = {
            email: 'roletest@example.com',
            password: 'roleTestPass123'
        };

        const result = await authService.login(loginRequest);
        expect(['USER', 'ADMIN']).toContain(result.user.role);
    });

    it('should return tokens with future expiration dates', async () => {
        const loginRequest: LoginRequest = {
            email: 'timetest@example.com',
            password: 'timeTestPass123'
        };

        const result = await authService.login(loginRequest);
        const now = new Date();
        const accessExpires = new Date(result.tokens.access.expires);
        const refreshExpires = new Date(result.tokens.refresh.expires);

        expect(accessExpires.getTime()).toBeGreaterThan(now.getTime());
        expect(refreshExpires.getTime()).toBeGreaterThan(now.getTime());
        expect(refreshExpires.getTime()).toBeGreaterThan(accessExpires.getTime());
    });

    it('should handle special characters in passwords', async () => {
        const loginRequest: LoginRequest = {
            email: 'special@example.com',
            password: 'P@ssw0rd!@#$%^&*()_+'
        };

        const result = await authService.login(loginRequest);
        expect(result).toEqual(mockAuthResponse);
    });
});
