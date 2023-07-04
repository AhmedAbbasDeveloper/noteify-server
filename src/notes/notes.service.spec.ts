import { faker } from '@faker-js/faker';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { Note } from './note.schema';
import { NotesService } from './notes.service';

describe('NotesService', () => {
  let noteService: NotesService;

  const noteModel = {
    find: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: getModelToken(Note.name),
          useValue: noteModel,
        },
      ],
    }).compile();

    noteService = module.get<NotesService>(NotesService);
  });

  describe('findAllByUser', () => {
    it('finds all notes by user', async () => {
      const userId = faker.string.uuid();

      jest.spyOn(noteModel, 'find').mockResolvedValueOnce([]);

      await noteService.findAllByUser(userId);

      expect(noteModel.find).toHaveBeenCalledWith({ userId }, null, {
        sort: { createdAt: 1 },
      });
    });
  });

  describe('create', () => {
    it('throws error when title and content are missing', async () => {
      const createNoteInput = { title: '', content: '' };
      const userId = faker.string.uuid();

      expect(noteService.create(createNoteInput, userId)).rejects.toThrowError(
        'Please add a title or content to your note.',
      );
    });

    it('creates note when title is present', async () => {
      const createNoteInput = { title: faker.string.alpha(), content: '' };
      const userId = faker.string.uuid();

      await noteService.create(createNoteInput, userId);

      expect(noteModel.create).toHaveBeenCalledWith({
        ...createNoteInput,
        userId,
      });
    });

    it('creates note when content is present', async () => {
      const createNoteInput = { title: '', content: faker.string.alpha() };
      const userId = faker.string.uuid();

      await noteService.create(createNoteInput, userId);

      expect(noteModel.create).toHaveBeenCalledWith({
        ...createNoteInput,
        userId,
      });
    });

    it('creates note when title and content are present', async () => {
      const createNoteInput = {
        title: faker.string.alpha(),
        content: faker.string.alpha(),
      };
      const userId = faker.string.uuid();

      await noteService.create(createNoteInput, userId);

      expect(noteModel.create).toHaveBeenCalledWith({
        ...createNoteInput,
        userId,
      });
    });
  });

  describe('update', () => {
    it('throws error when title and content are missing', async () => {
      const noteId = faker.string.uuid();
      const updateNoteInput = { title: '', content: '' };
      const userId = faker.string.uuid();

      expect(
        noteService.update(noteId, updateNoteInput, userId),
      ).rejects.toThrowError('Please add a title or content to your note.');
    });

    it('updates note when title is present', async () => {
      const noteId = faker.string.uuid();
      const updateNoteInput = { title: faker.string.alpha(), content: '' };
      const userId = faker.string.uuid();

      await noteService.update(noteId, updateNoteInput, userId);

      expect(noteModel.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: noteId,
          userId,
        },
        updateNoteInput,
        { new: true },
      );
    });

    it('updates note when content is present', async () => {
      const noteId = faker.string.uuid();
      const updateNoteInput = { title: '', content: faker.string.alpha() };
      const userId = faker.string.uuid();

      await noteService.update(noteId, updateNoteInput, userId);

      expect(noteModel.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: noteId,
          userId,
        },
        updateNoteInput,
        { new: true },
      );
    });

    it('updates note when title and content are present', async () => {
      const noteId = faker.string.uuid();
      const updateNoteInput = {
        title: faker.string.alpha(),
        content: faker.string.alpha(),
      };
      const userId = faker.string.uuid();

      await noteService.update(noteId, updateNoteInput, userId);

      expect(noteModel.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: noteId,
          userId,
        },
        updateNoteInput,
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('removes note', async () => {
      const id = faker.string.uuid();
      const userId = faker.string.uuid();

      await noteService.remove(id, userId);

      expect(noteModel.findOneAndDelete).toHaveBeenCalledWith({
        _id: id,
        userId,
      });
    });
  });
});
