import { Arg, Mutation, Query, Resolver } from "type-graphql"
import { Note } from "../entity/Note"

@Resolver(() => Note)
export class NoteResolver {
  @Query(() => [Note])
  async notes(): Promise<Note[]> {
    return Note.find()
  }

  @Mutation(() => Note)
  async createNote(
    @Arg("title") title: string,
    @Arg("content") content: string
  ): Promise<Note> {
    return Note.create({ title, content }).save()
  }

  @Mutation(() => String)
  async deleteNote(
    @Arg("id") id: string
  ): Promise<string> {
    const note = await Note.findOne({ id })
    if (!note) {
      throw new Error(`Unable to find note with id: ${id}`)
    }

    await note.remove()
    return id
  }
}
