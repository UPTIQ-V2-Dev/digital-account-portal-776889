// API-related types for the Digital Account Opening Portal

export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

export interface ApiError {
    message: string;
    code?: string;
    details?: Record<string, any>;
    field?: string;
}

export interface PaginatedResponse<T> {
    results: T[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
}

export interface ApiErrorResponse {
    error: {
        message: string;
        code?: string;
        field?: string;
        details?: Record<string, any>;
    };
    success: false;
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Query parameters for filtering and sorting
export interface QueryParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    search?: string;
    [key: string]: any;
}

// File upload response
export interface FileUploadResponse {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
    url?: string;
}

// Validation response
export interface ValidationResponse {
    isValid: boolean;
    errors: ValidationError[];
    warnings?: ValidationWarning[];
}

export interface ValidationError {
    field: string;
    message: string;
    code: string;
}

export interface ValidationWarning {
    field: string;
    message: string;
    suggestion?: string;
}

// Status response for operations
export interface StatusResponse {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    message?: string;
    progress?: number;
    details?: Record<string, any>;
}

// Common response types for specific operations
export interface SubmitResponse {
    submitted: boolean;
    applicationId?: string;
    message?: string;
}

export interface VerificationResponse {
    verified: boolean;
    confidence?: number;
    provider?: string;
    verificationId?: string;
    message?: string;
}

// Admin-specific response types
export interface AdminApplicationsResponse extends PaginatedResponse<AdminApplicationSummary> {
    filters?: {
        status: string[];
        accountType: string[];
        riskLevel: string[];
        dateRange: {
            from?: string;
            to?: string;
        };
    };
}

export interface AdminApplicationSummary {
    id: string;
    applicantName: string;
    accountType: string;
    status: string;
    currentStep: string;
    riskLevel: string;
    submittedAt?: string;
    lastActivity: string;
    assignedTo?: string;
}

// Audit trail types
export interface AuditTrailEntry {
    id: string;
    applicationId: string;
    action: string;
    description: string;
    performedBy: string;
    performedAt: string;
    ipAddress: string;
    userAgent: string;
    changes?: AuditChange;
}

export interface AuditChange {
    field: string;
    from: any;
    to: any;
}

// Request/Response pairs for common operations
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: {
        id: number;
        email: string;
        name: string;
        role: string;
        isEmailVerified: boolean;
        createdAt: string;
        updatedAt: string;
    };
    tokens: {
        access: {
            token: string;
            expires: string;
        };
        refresh: {
            token: string;
            expires: string;
        };
    };
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    access: {
        token: string;
        expires: string;
    };
    refresh: {
        token: string;
        expires: string;
    };
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface RegisterResponse {
    user: {
        id: number;
        email: string;
        name: string;
        role: string;
        isEmailVerified: boolean;
        createdAt: string;
        updatedAt: string;
    };
    tokens: {
        access: {
            token: string;
            expires: string;
        };
        refresh: {
            token: string;
            expires: string;
        };
    };
}

// API Client configuration
export interface ApiConfig {
    baseURL: string;
    timeout: number;
    withCredentials: boolean;
    headers: Record<string, string>;
}

// Error handling types
export interface NetworkError extends Error {
    code: 'NETWORK_ERROR';
    originalError: Error;
}

export interface HttpError extends Error {
    code: 'HTTP_ERROR';
    status: number;
    statusText: string;
    data?: any;
}

export interface TimeoutError extends Error {
    code: 'TIMEOUT_ERROR';
    timeout: number;
}

export type ApiClientError = NetworkError | HttpError | TimeoutError;

// Request interceptor types
export interface RequestInterceptor {
    onRequest?: (config: any) => any | Promise<any>;
    onRequestError?: (error: Error) => any | Promise<any>;
}

export interface ResponseInterceptor {
    onResponse?: (response: any) => any | Promise<any>;
    onResponseError?: (error: any) => any | Promise<any>;
}
