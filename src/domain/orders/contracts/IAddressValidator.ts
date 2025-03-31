export interface IAddressValidator {
    validate(address: string, expectedCity: string): Promise<boolean>;
}
