import { Transform } from 'class-transformer';
import {
  IsDefined,
  IsString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'AtLeastOneNonEmpty', async: false })
class AtLeastOneNonEmptyConstraint implements ValidatorConstraintInterface {
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
  @IsDefined({ message: 'Title must be provided' })
  @IsString()
  title: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsDefined({ message: 'Content must be provided' })
  @IsString()
  content: string;

  @Validate(AtLeastOneNonEmptyConstraint)
  atLeastOne?: boolean;
}
