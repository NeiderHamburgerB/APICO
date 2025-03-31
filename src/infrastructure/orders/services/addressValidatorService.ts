import { IAddressValidator } from '../../../domain/orders/contracts/IAddressValidator';
import { validateAddress } from '../../../shared/utils/addressValidator'; 

export class AddressValidatorService implements IAddressValidator {
  async validate(address: string, expectedCity: string): Promise<boolean> {
    return validateAddress(address, expectedCity); 
  }
}
