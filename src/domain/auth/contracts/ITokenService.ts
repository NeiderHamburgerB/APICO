export interface ITokenService {
    generateToken(payload: object): string;
    verifyToken(token: string): any;
}
