import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Validate,
} from 'class-validator';
import {
  PasswordValidation,
  PasswordValidationRequirement,
} from 'class-validator-password-check';

const passwordRequirement: PasswordValidationRequirement = {
  mustContainLowerLetter: true,
  mustContainUpperLetter: true,
  mustContainNumber: true,
  mustContainSpecialCharacter: true,
};

export class CreateUserDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  )
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Validate(PasswordValidation, [passwordRequirement])
  @Length(8)
  @IsString()
  @IsNotEmpty()
  password: string;
}
