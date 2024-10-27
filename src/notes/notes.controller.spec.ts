import { faker } from '@faker-js/faker';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';

import { NoteDto } from './dto/note.dto';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';

describe('NotesController', () => {
  let notesController: NotesController;
  let notesService: NotesService;

  const mockNotesService = {
    findAllByUserId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockCurrentUser = {
    id: new Types.ObjectId().toString(),
    email: faker.internet.email(),
  };

  const generateMockNote = (overrides = {}) => ({
    _id: new Types.ObjectId(),
    title: faker.lorem.words(),
    content: faker.lorem.words(),
    creatorId: mockCurrentUser.id,
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [
        {
          provide: NotesService,
          useValue: mockNotesService,
        },
      ],
    }).compile();

    notesController = module.get<NotesController>(NotesController);
    notesService = module.get<NotesService>(NotesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllByUser', () => {
    it('should return an array of notes for the current user', async () => {
      const foundNotes = [generateMockNote()];

      jest
        .spyOn(notesService, 'findAllByUserId')
        .mockResolvedValue(foundNotes as any);

      const result = await notesController.findAllByUser(mockCurrentUser);

      expect(result).toEqual(foundNotes);
      expect(mockNotesService.findAllByUserId).toHaveBeenCalledWith(
        mockCurrentUser.id,
      );
    });
  });

  describe('create', () => {
    it('should create a note and return it', async () => {
      const createNoteInput: NoteDto = {
        title: faker.lorem.words(),
        content: faker.lorem.words(),
      };
      const createdNote = { ...createNoteInput, creatorId: mockCurrentUser.id };

      jest.spyOn(notesService, 'create').mockResolvedValue(createdNote as any);

      const result = await notesController.create(
        mockCurrentUser,
        createNoteInput,
      );

      expect(result).toEqual(createdNote);
      expect(mockNotesService.create).toHaveBeenCalledWith(
        createNoteInput,
        mockCurrentUser.id,
      );
    });
  });

  describe('update', () => {
    it('should update a note and return it', async () => {
      const noteId = new Types.ObjectId().toString();
      const updateNoteInput: NoteDto = {
        title: faker.lorem.words(),
        content: faker.lorem.words(),
      };
      const updatedNote = generateMockNote({ ...updateNoteInput, _id: noteId });

      jest.spyOn(notesService, 'update').mockResolvedValue(updatedNote as any);

      const result = await notesController.update(
        mockCurrentUser,
        noteId,
        updateNoteInput,
      );

      expect(result).toEqual(updatedNote);
      expect(mockNotesService.update).toHaveBeenCalledWith(
        noteId,
        updateNoteInput,
        mockCurrentUser.id,
      );
    });

    it('should throw an error if ID is invalid', async () => {
      const noteId = faker.string.alphanumeric(10);
      const updateNoteInput: NoteDto = {
        title: faker.lorem.words(),
        content: faker.lorem.words(),
      };

      jest
        .spyOn(notesService, 'update')
        .mockRejectedValue(new BadRequestException('Invalid note ID format'));

      await expect(
        notesController.update(mockCurrentUser, noteId, updateNoteInput),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if note not found', async () => {
      const noteId = new Types.ObjectId().toString();
      const updateNoteInput: NoteDto = {
        title: faker.lorem.words(),
        content: faker.lorem.words(),
      };

      jest
        .spyOn(notesService, 'update')
        .mockRejectedValue(new NotFoundException('Note not found'));

      await expect(
        notesController.update(mockCurrentUser, noteId, updateNoteInput),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a note and return it', async () => {
      const noteId = new Types.ObjectId().toString();
      const deletedNote = generateMockNote({ _id: noteId });

      jest.spyOn(notesService, 'remove').mockResolvedValue(deletedNote as any);

      const result = await notesController.remove(mockCurrentUser, noteId);

      expect(result).toEqual(deletedNote);
      expect(mockNotesService.remove).toHaveBeenCalledWith(
        noteId,
        mockCurrentUser.id,
      );
    });

    it('should throw an error if ID is invalid', async () => {
      const noteId = faker.string.alphanumeric(10);

      jest
        .spyOn(notesService, 'remove')
        .mockRejectedValue(new BadRequestException('Invalid note ID format'));

      await expect(
        notesController.remove(mockCurrentUser, noteId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if note not found', async () => {
      const noteId = new Types.ObjectId().toString();

      jest
        .spyOn(notesService, 'remove')
        .mockRejectedValue(new NotFoundException('Note not found'));

      await expect(
        notesController.remove(mockCurrentUser, noteId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
