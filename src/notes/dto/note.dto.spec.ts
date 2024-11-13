import { faker } from '@faker-js/faker';
import { validate } from 'class-validator';

import { NoteDto } from '@/notes/dto/note.dto';

describe('NoteDto', () => {
  const createNoteDto = (overrides = {}): NoteDto =>
    Object.assign(new NoteDto(), overrides);

  it('should pass validation if both title and content are provided', async () => {
    const noteDto = createNoteDto({
      title: faker.lorem.words(),
      content: faker.lorem.words(),
    });

    const errors = await validate(noteDto);

    expect(errors.length).toBe(0);
  });

  it('should pass validation if content is empty', async () => {
    const noteDto = createNoteDto({ title: faker.lorem.words(), content: '' });

    const errors = await validate(noteDto);

    expect(errors.length).toBe(0);
  });

  it('should pass validation if title is empty', async () => {
    const noteDto = createNoteDto({ title: '', content: faker.lorem.words() });

    const errors = await validate(noteDto);

    expect(errors.length).toBe(0);
  });

  it('should fail validation if content is missing', async () => {
    const noteDto = createNoteDto({ content: faker.lorem.words() });

    const errors = await validate(noteDto);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('title');
    expect(errors[0].constraints.isDefined).toBe('Title must be provided');
  });

  it('should fail validation if title is missing', async () => {
    const noteDto = createNoteDto({ title: faker.lorem.words() });

    const errors = await validate(noteDto);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('content');
    expect(errors[0].constraints.isDefined).toBe('Content must be provided');
  });

  it('should fail validation if both title and content are empty', async () => {
    const noteDto = createNoteDto({ title: '', content: '' });

    const errors = await validate(noteDto);

    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty('AtLeastOneNonEmpty');
    expect(errors[0].constraints.AtLeastOneNonEmpty).toBe(
      'Please add a title or content to your note.',
    );
  });

  it('should fail validation if title content is missing', async () => {
    const noteDto = createNoteDto();

    const errors = await validate(noteDto);

    expect(errors.length).toBe(3);
    expect(errors[0].property).toBe('title');
    expect(errors[0].constraints.isDefined).toBe('Title must be provided');
    expect(errors[1].property).toBe('content');
    expect(errors[1].constraints.isDefined).toBe('Content must be provided');
    expect(errors[2].constraints).toHaveProperty('AtLeastOneNonEmpty');
    expect(errors[2].constraints.AtLeastOneNonEmpty).toBe(
      'Please add a title or content to your note.',
    );
  });
});
