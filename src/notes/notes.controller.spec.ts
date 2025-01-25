import { faker } from '@faker-js/faker';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';

import { NotesController } from '@/notes/notes.controller';
import { NotesService } from '@/notes/notes.service';

describe('NotesController', () => {
  let notesController: NotesController;
  let notesService: NotesService;

  const mockNotesService = {
    findAllByUserId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const generateCurrentUser = () => ({
    id: new Types.ObjectId().toString(),
    email: faker.internet.email(),
  });

  const generateNote = (overrides = {}) => ({
    _id: new Types.ObjectId(),
    title: faker.lorem.words(),
    content: faker.lorem.words(),
    creatorId: new Types.ObjectId().toString(),
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [{ provide: NotesService, useValue: mockNotesService }],
    }).compile();

    notesController = module.get<NotesController>(NotesController);
    notesService = module.get<NotesService>(NotesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllByUser', () => {
    it('should return an array of notes', async () => {
      const currentUser = generateCurrentUser();
      const foundNotes = [generateNote()];
      jest
        .spyOn(notesService, 'findAllByUserId')
        .mockResolvedValue(foundNotes as any);

      const result = await notesController.findAllByUser(currentUser);

      expect(result).toEqual(foundNotes);
      expect(notesService.findAllByUserId).toHaveBeenCalledWith(currentUser.id);
    });
  });

  describe('create', () => {
    it('should create a new note', async () => {
      const currentUser = generateCurrentUser();
      const title = faker.lorem.words();
      const content = faker.lorem.words();
      const createdNote = generateNote({
        title,
        content,
        creatorId: currentUser.id,
      });

      jest.spyOn(notesService, 'create').mockResolvedValue(createdNote as any);

      const result = await notesController.create(currentUser, {
        title,
        content,
      });

      expect(result).toEqual(createdNote);
      expect(notesService.create).toHaveBeenCalledWith(
        { title, content },
        currentUser.id,
      );
    });
  });

  describe('update', () => {
    it('should update an existing note', async () => {
      const currentUser = generateCurrentUser();
      const noteId = new Types.ObjectId().toString();
      const title = faker.lorem.words();
      const content = faker.lorem.words();
      const updatedNote = generateNote({
        _id: noteId,
        title,
        content,
      });

      jest.spyOn(notesService, 'update').mockResolvedValue(updatedNote as any);

      const result = await notesController.update(currentUser, noteId, {
        title,
        content,
      });

      expect(result).toEqual(updatedNote);
      expect(notesService.update).toHaveBeenCalledWith(
        noteId,
        { title, content },
        currentUser.id,
      );
    });

    it('should throw a NotFoundException if note not found', async () => {
      const currentUser = generateCurrentUser();
      const noteId = new Types.ObjectId().toString();
      const title = faker.lorem.words();
      const content = faker.lorem.words();

      jest
        .spyOn(notesService, 'update')
        .mockRejectedValue(new NotFoundException('Note not found'));

      await expect(
        notesController.update(currentUser, noteId, { title, content }),
      ).rejects.toThrow(new NotFoundException('Note not found'));
      expect(notesService.update).toHaveBeenCalledWith(
        noteId,
        { title, content },
        currentUser.id,
      );
    });
  });

  describe('remove', () => {
    it('should remove a note', async () => {
      const currentUser = generateCurrentUser();
      const noteId = new Types.ObjectId().toString();
      const deletedNote = generateNote({ _id: noteId });

      jest.spyOn(notesService, 'remove').mockResolvedValue(deletedNote as any);

      const result = await notesController.remove(currentUser, noteId);

      expect(result).toEqual(deletedNote);
      expect(notesService.remove).toHaveBeenCalledWith(noteId, currentUser.id);
    });

    it('should throw a NotFoundException if note is not found', async () => {
      const currentUser = generateCurrentUser();
      const noteId = new Types.ObjectId().toString();

      jest
        .spyOn(notesService, 'remove')
        .mockRejectedValue(new NotFoundException('Note not found'));

      await expect(notesController.remove(currentUser, noteId)).rejects.toThrow(
        new NotFoundException('Note not found'),
      );
      expect(notesService.remove).toHaveBeenCalledWith(noteId, currentUser.id);
    });
  });
});
