import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'AtLeastOneProvided', async: false })
class AtLeastOneConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments): boolean {
    const { title, content } = args.object as NoteDto;
    return Boolean(title || content);
  }

  defaultMessage(): string {
    return 'Please add a title or content to your note.';
  }
}

export class NoteDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  title?: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  content?: string;

  @Validate(AtLeastOneConstraint)
  atLeastOne?: boolean;
}
