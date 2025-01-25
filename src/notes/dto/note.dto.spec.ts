import { faker } from '@faker-js/faker';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { NoteDto } from '@/notes/dto/note.dto';

describe('NoteDto', () => {
  it('should pass validation with both title and content', async () => {
    const noteDto = plainToInstance(NoteDto, {
      title: faker.lorem.words(),
      content: faker.lorem.words(),
    });

    const errors = await validate(noteDto);

    expect(errors).toHaveLength(0);
  });

  it('should pass validation with only title', async () => {
    const noteDto = plainToInstance(NoteDto, {
      title: faker.lorem.words(),
      content: '',
    });

    const errors = await validate(noteDto);

    expect(errors).toHaveLength(0);
  });

  it('should pass validation with only content', async () => {
    const noteDto = plainToInstance(NoteDto, {
      title: '',
      content: faker.lorem.words(),
    });

    const errors = await validate(noteDto);

    expect(errors).toHaveLength(0);
  });

  it('should fail validation when both title and content are empty', async () => {
    const noteDto = plainToInstance(NoteDto, {
      title: '',
      content: '',
    });

    const errors = await validate(noteDto);

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.AtLeastOneNonEmpty).toBe(
      'Please add a title or content to your note.',
    );
  });

  it('should fail validation when title and content are missing', async () => {
    const noteDto = plainToInstance(NoteDto, {});

    const errors = await validate(noteDto);

    expect(errors).toHaveLength(3);
    expect(errors[0].constraints?.isDefined).toBe('Title must be provided');
    expect(errors[1].constraints?.isDefined).toBe('Content must be provided');
    expect(errors[2].constraints?.AtLeastOneNonEmpty).toBe(
      'Please add a title or content to your note.',
    );
  });
});
