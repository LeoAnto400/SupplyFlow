export interface TokenClaims {
  userId: string;
  organizationId: string;
  role: string;
}

export interface TokenService {
  signAccessToken(claims: TokenClaims): string;
  signRefreshToken(claims: TokenClaims): string;
  verifyAccessToken(token: string): TokenClaims;
  verifyRefreshToken(token: string): TokenClaims;
}
