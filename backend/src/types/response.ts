export interface TokenResponse {
    token: string;
    expires: string;
}

export interface AuthTokensResponse {
    access: TokenResponse;
    refresh: TokenResponse;
}
