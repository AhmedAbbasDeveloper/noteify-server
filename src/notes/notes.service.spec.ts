import { faker } from '@faker-js/faker';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';

import { NoteDto } from './dto';
import { NotesService } from './notes.service';
import { Note, NoteDocument } from './schemas/note.schema';

const mockNoteModel: Partial<Model<NoteDocument>> = {
  find: jest.fn(),
  create: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
};

const generateMockNote = (overrides = {}) => ({
  _id: new Types.ObjectId(),
  title: faker.lorem.sentence(),
  content: faker.lorem.sentence(),
  creatorId: new Types.ObjectId().toString(),
  ...overrides,
});

describe('NotesService', () => {
  let notesService: NotesService;
  let noteModel: Model<NoteDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: getModelToken(Note.name),
          useValue: mockNoteModel,
        },
      ],
    }).compile();

    notesService = module.get<NotesService>(NotesService);
    noteModel = module.get<Model<NoteDocument>>(getModelToken(Note.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllByUserId', () => {
    it('should return an array of notes for a given creator ID', async () => {
      const creatorId = new Types.ObjectId().toString();
      const foundNotes = [generateMockNote({ creatorId })];

      jest.spyOn(noteModel, 'find').mockReturnValue({
        sort: jest.fn().mockResolvedValue(foundNotes),
      } as any);

      const result = await notesService.findAllByUserId(creatorId);

      expect(result).toEqual(foundNotes);
      expect(noteModel.find).toHaveBeenCalledWith({ creatorId });
    });
  });

  describe('create', () => {
    it('should create a note with both title and content', async () => {
      const creatorId = new Types.ObjectId().toString();
      const createNoteInput: NoteDto = {
        title: faker.lorem.sentence(),
        content: faker.lorem.sentence(),
      };
      const createdNote = { ...createNoteInput, creatorId };

      jest.spyOn(noteModel, 'create').mockResolvedValueOnce(createdNote as any);

      const result = await notesService.create(createNoteInput, creatorId);

      expect(result).toEqual(createdNote);
      expect(noteModel.create).toHaveBeenCalledWith(createdNote);
    });

    it('should create a note with only title', async () => {
      const creatorId = new Types.ObjectId().toString();
      const createNoteInput: NoteDto = { title: faker.lorem.sentence() };
      const createdNote = { ...createNoteInput, creatorId };

      jest.spyOn(noteModel, 'create').mockResolvedValueOnce(createdNote as any);

      const result = await notesService.create(createNoteInput, creatorId);

      expect(result).toEqual(createdNote);
      expect(noteModel.create).toHaveBeenCalledWith(createdNote);
    });

    it('should create a note with only content', async () => {
      const creatorId = new Types.ObjectId().toString();
      const createNoteInput: NoteDto = { content: faker.lorem.sentence() };
      const createdNote = { ...createNoteInput, creatorId };

      jest.spyOn(noteModel, 'create').mockResolvedValueOnce(createdNote as any);

      const result = await notesService.create(createNoteInput, creatorId);

      expect(result).toEqual(createdNote);
      expect(noteModel.create).toHaveBeenCalledWith(createdNote);
    });
  });

  describe('update', () => {
    describe('valid ID scenarios', () => {
      it('should update a note with both title and content', async () => {
        const noteId = new Types.ObjectId().toString();
        const creatorId = new Types.ObjectId().toString();
        const updateNoteInput: NoteDto = {
          title: faker.lorem.sentence(),
          content: faker.lorem.sentence(),
        };
        const updatedNote = generateMockNote({
          ...updateNoteInput,
          creatorId,
          _id: noteId,
        });

        jest
          .spyOn(noteModel, 'findOneAndUpdate')
          .mockResolvedValueOnce(updatedNote);

        const result = await notesService.update(
          noteId,
          updateNoteInput,
          creatorId,
        );

        expect(result).toEqual(updatedNote);
        expect(noteModel.findOneAndUpdate).toHaveBeenCalledWith(
          { _id: noteId, creatorId },
          updateNoteInput,
          { new: true },
        );
      });

      it('should update a note with only a title', async () => {
        const noteId = new Types.ObjectId().toString();
        const creatorId = new Types.ObjectId().toString();
        const updateNoteInput: NoteDto = { title: faker.lorem.sentence() };
        const updatedNote = generateMockNote({
          ...updateNoteInput,
          creatorId,
          _id: noteId,
        });

        jest
          .spyOn(noteModel, 'findOneAndUpdate')
          .mockResolvedValueOnce(updatedNote);

        const result = await notesService.update(
          noteId,
          updateNoteInput,
          creatorId,
        );

        expect(result).toEqual(updatedNote);
        expect(noteModel.findOneAndUpdate).toHaveBeenCalledWith(
          { _id: noteId, creatorId },
          { ...updateNoteInput, $unset: { content: '' } },
          { new: true },
        );
      });

      it('should update a note with only content', async () => {
        const noteId = new Types.ObjectId().toString();
        const creatorId = new Types.ObjectId().toString();
        const updateNoteInput: NoteDto = { content: faker.lorem.sentence() };
        const updatedNote = generateMockNote({
          ...updateNoteInput,
          creatorId,
          _id: noteId,
        });

        jest
          .spyOn(noteModel, 'findOneAndUpdate')
          .mockResolvedValueOnce(updatedNote);

        const result = await notesService.update(
          noteId,
          updateNoteInput,
          creatorId,
        );

        expect(result).toEqual(updatedNote);
        expect(noteModel.findOneAndUpdate).toHaveBeenCalledWith(
          { _id: noteId, creatorId },
          { ...updateNoteInput, $unset: { title: '' } },
          { new: true },
        );
      });
    });

    it('should throw an error if ID is invalid', async () => {
      const noteId = faker.string.alphanumeric();
      const creatorId = new Types.ObjectId().toString();
      const updateNoteInput: NoteDto = {
        title: faker.lorem.sentence(),
        content: faker.lorem.sentence(),
      };

      await expect(
        notesService.update(noteId, updateNoteInput, creatorId),
      ).rejects.toThrow('Invalid note ID format');
    });

    it('should throw an error if note not found', async () => {
      const noteId = new Types.ObjectId().toString();
      const creatorId = new Types.ObjectId().toString();
      const updateNoteInput: NoteDto = {
        title: faker.lorem.sentence(),
        content: faker.lorem.sentence(),
      };

      jest.spyOn(noteModel, 'findOneAndUpdate').mockResolvedValueOnce(null);

      await expect(
        notesService.update(noteId, updateNoteInput, creatorId),
      ).rejects.toThrow('Note not found');
    });
  });

  describe('remove', () => {
    it('should remove a note by ID', async () => {
      const noteId = new Types.ObjectId().toString();
      const creatorId = new Types.ObjectId().toString();
      const deletedNote = generateMockNote({ _id: noteId, creatorId });

      jest
        .spyOn(noteModel, 'findOneAndDelete')
        .mockResolvedValueOnce(deletedNote);

      const result = await notesService.remove(noteId, creatorId);

      expect(result).toEqual(deletedNote);
      expect(noteModel.findOneAndDelete).toHaveBeenCalledWith({
        _id: noteId,
        creatorId,
      });
    });

    it('should throw an error if ID is invalid', async () => {
      const noteId = faker.string.alphanumeric();
      const creatorId = new Types.ObjectId().toString();

      await expect(notesService.remove(noteId, creatorId)).rejects.toThrow(
        'Invalid note ID format',
      );
    });

    it('should throw an error if note not found', async () => {
      const noteId = new Types.ObjectId().toString();
      const creatorId = new Types.ObjectId().toString();

      jest.spyOn(noteModel, 'findOneAndDelete').mockResolvedValueOnce(null);

      await expect(notesService.remove(noteId, creatorId)).rejects.toThrow(
        'Note not found',
      );
    });
  });
});
