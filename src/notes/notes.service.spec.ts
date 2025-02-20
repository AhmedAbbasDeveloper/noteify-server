import { faker } from '@faker-js/faker';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';

import { NotesService } from '@/notes/notes.service';
import { Note, NoteDocument } from '@/notes/schemas/note.schema';

describe('NotesService', () => {
  let notesService: NotesService;
  let noteModel: jest.Mocked<Model<NoteDocument>>;

  const mockNoteModel = {
    find: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
  };

  const generateNote = (overrides = {}) => ({
    _id: new Types.ObjectId(),
    title: faker.lorem.words(),
    content: faker.lorem.words(),
    creatorId: new Types.ObjectId().toString(),
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        { provide: getModelToken(Note.name), useValue: mockNoteModel },
      ],
    }).compile();

    notesService = module.get<NotesService>(NotesService);
    noteModel = module.get<jest.Mocked<Model<NoteDocument>>>(
      getModelToken(Note.name),
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('findAllByUserId', () => {
    it('should return all notes for a user', async () => {
      const creatorId = new Types.ObjectId().toString();
      const foundNotes = [generateNote({ creatorId })];

      jest.spyOn(noteModel, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(foundNotes),
        }),
      } as unknown as ReturnType<typeof noteModel.find>);

      const result = await notesService.findAllByUserId(creatorId);

      expect(result).toEqual(foundNotes);
      expect(noteModel.find).toHaveBeenCalledWith({ creatorId });
    });
  });

  describe('create', () => {
    it('should create a new note', async () => {
      const creatorId = new Types.ObjectId().toString();
      const title = faker.lorem.words();
      const content = faker.lorem.words();
      const createdNote = generateNote({ title, content, creatorId });

      jest
        .spyOn(noteModel, 'create')
        .mockResolvedValue(
          createdNote as unknown as ReturnType<typeof noteModel.create>,
        );

      const result = await notesService.create({ title, content }, creatorId);

      expect(result).toEqual(createdNote);
      expect(noteModel.create).toHaveBeenCalledWith({
        title,
        content,
        creatorId,
      });
    });
  });

  describe('findOneAndUpdate', () => {
    it('should update a note', async () => {
      const noteId = new Types.ObjectId().toString();
      const creatorId = new Types.ObjectId().toString();
      const title = faker.lorem.words();
      const content = faker.lorem.words();
      const updatedNote = generateNote({
        _id: noteId,
        title,
        content,
        creatorId,
      });

      jest.spyOn(noteModel, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedNote),
      } as unknown as ReturnType<typeof noteModel.findOneAndUpdate>);

      const result = await notesService.findOneAndUpdate(
        noteId,
        { title, content },
        creatorId,
      );

      expect(result).toEqual(updatedNote);
      expect(noteModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: noteId, creatorId },
        { title, content },
        { new: true },
      );
    });

    it('should return null if note not found', async () => {
      const noteId = new Types.ObjectId().toString();
      const creatorId = new Types.ObjectId().toString();
      const title = faker.lorem.words();
      const content = faker.lorem.words();

      jest.spyOn(noteModel, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as unknown as ReturnType<typeof noteModel.findOneAndUpdate>);

      const result = await notesService.findOneAndUpdate(
        noteId,
        { title, content },
        creatorId,
      );

      expect(result).toBeNull();
      expect(noteModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: noteId, creatorId },
        { title, content },
        { new: true },
      );
    });
  });

  describe('findOneAndDelete', () => {
    it('should remove a note', async () => {
      const noteId = new Types.ObjectId().toString();
      const creatorId = new Types.ObjectId().toString();
      const deletedNote = generateNote({ _id: noteId, creatorId });

      jest.spyOn(noteModel, 'findOneAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(deletedNote),
      } as unknown as ReturnType<typeof noteModel.findOneAndDelete>);

      const result = await notesService.findOneAndDelete(noteId, creatorId);

      expect(result).toEqual(deletedNote);
      expect(noteModel.findOneAndDelete).toHaveBeenCalledWith({
        _id: noteId,
        creatorId,
      });
    });

    it('should return null if note not found', async () => {
      const noteId = new Types.ObjectId().toString();
      const creatorId = new Types.ObjectId().toString();

      jest.spyOn(noteModel, 'findOneAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as unknown as ReturnType<typeof noteModel.findOneAndDelete>);

      const result = await notesService.findOneAndDelete(noteId, creatorId);

      expect(result).toBeNull();
      expect(noteModel.findOneAndDelete).toHaveBeenCalledWith({
        _id: noteId,
        creatorId,
      });
    });
  });
});
