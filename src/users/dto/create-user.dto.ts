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
  @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @Transform(({ value }: { value: string }) => value.trim())
  @Validate(PasswordValidation, [passwordRequirement])
  @Length(8)
  @IsString()
  @IsNotEmpty()
  password: string;
}
