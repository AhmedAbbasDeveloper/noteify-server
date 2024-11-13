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

  it('should pass validation if title is provided', async () => {
    const noteDto = createNoteDto({ title: faker.lorem.words() });

    const errors = await validate(noteDto);

    expect(errors.length).toBe(0);
  });

  it('should pass validation if content is provided', async () => {
    const noteDto = createNoteDto({ content: faker.lorem.words() });

    const errors = await validate(noteDto);

    expect(errors.length).toBe(0);
  });

  it('should fail validation if both title and content are empty', async () => {
    const noteDto = createNoteDto();

    const errors = await validate(noteDto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('AtLeastOneProvided');
    expect(errors[0].constraints.AtLeastOneProvided).toBe(
      'Please add a title or content to your note.',
    );
  });
});
