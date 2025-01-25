import { faker } from '@faker-js/faker';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';

import { NotesService } from '@/notes/notes.service';
import { Note, NoteDocument } from '@/notes/schemas/note.schema';

describe('NotesService', () => {
  let notesService: NotesService;
  let noteModel: Model<NoteDocument>;

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
    noteModel = module.get<Model<NoteDocument>>(getModelToken(Note.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllByUserId', () => {
    it('should return all notes for a user', async () => {
      const creatorId = new Types.ObjectId().toString();
      const foundNotes = [generateNote({ creatorId })];

      jest.spyOn(noteModel, 'find').mockReturnValue({
        sort: jest.fn().mockResolvedValue(foundNotes),
      } as any);

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

      jest.spyOn(noteModel, 'create').mockResolvedValue(createdNote as any);

      const result = await notesService.create({ title, content }, creatorId);

      expect(result).toEqual(createdNote);
      expect(noteModel.create).toHaveBeenCalledWith({
        title,
        content,
        creatorId,
      });
    });
  });

  describe('update', () => {
    it('should update an existing note', async () => {
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

      jest.spyOn(noteModel, 'findOneAndUpdate').mockResolvedValue(updatedNote);

      const result = await notesService.update(
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

    it('should throw a NotFoundException if note is not found', async () => {
      const noteId = new Types.ObjectId().toString();
      const creatorId = new Types.ObjectId().toString();
      const title = faker.lorem.words();
      const content = faker.lorem.words();

      jest.spyOn(noteModel, 'findOneAndUpdate').mockResolvedValue(null);

      await expect(
        notesService.update(noteId, { title, content }, creatorId),
      ).rejects.toThrow(new NotFoundException('Note not found'));

      expect(noteModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: noteId, creatorId },
        { title, content },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should remove a note', async () => {
      const noteId = new Types.ObjectId().toString();
      const creatorId = new Types.ObjectId().toString();
      const deletedNote = generateNote({ _id: noteId, creatorId });

      jest.spyOn(noteModel, 'findOneAndDelete').mockResolvedValue(deletedNote);

      const result = await notesService.remove(noteId, creatorId);

      expect(result).toEqual(deletedNote);
      expect(noteModel.findOneAndDelete).toHaveBeenCalledWith({
        _id: noteId,
        creatorId,
      });
    });

    it('should throw a NotFoundException if note is not found', async () => {
      const noteId = new Types.ObjectId().toString();
      const creatorId = new Types.ObjectId().toString();

      jest.spyOn(noteModel, 'findOneAndDelete').mockResolvedValue(null);

      await expect(notesService.remove(noteId, creatorId)).rejects.toThrow(
        new NotFoundException('Note not found'),
      );

      expect(noteModel.findOneAndDelete).toHaveBeenCalledWith({
        _id: noteId,
        creatorId,
      });
    });
  });
});
