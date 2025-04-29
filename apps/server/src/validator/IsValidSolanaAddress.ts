import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { isValidSolanaAddress } from "../utils/blockchain";

@ValidatorConstraint({ name: "IsValidSolanaAddress", async: false })
export class IsValidSolanaAddress implements ValidatorConstraintInterface {
  validate(value: string) {
    return isValidSolanaAddress(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.value} is not a valid Solana address.`;
  }
}
