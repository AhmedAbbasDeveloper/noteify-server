import { hash, verify } from "argon2"
import { IsEmail } from "class-validator"
import { Arg, Field, InputType, Mutation, Resolver } from "type-graphql"
import { User } from "../entity/User"

@InputType()
class UserCredentials {
  @Field()
  @IsEmail()
  email!: string

  @Field()
  password!: string
}

@Resolver(() => User)
export class UserResolver {
  @Mutation(() => User)
  async register(
    @Arg("credentials") credentials: UserCredentials
  ): Promise<User> {
    const lowerCaseEmail = credentials.email.toLowerCase()

    const existingUser = await User.findOne({ email: lowerCaseEmail })
    if (existingUser) {
      throw new Error(`A user already exists with email: ${lowerCaseEmail}`)
    }

    const hashedPassword = await hash(credentials.password)

    return User.create({ email: lowerCaseEmail, password: hashedPassword }).save()
  }

  @Mutation(() => User)
  async login(
    @Arg("credentials") credentials: UserCredentials
  ): Promise<User> {
    const lowerCaseEmail = credentials.email.toLowerCase()

    const user = await User.findOne({ email: lowerCaseEmail })
    if (!user) {
      throw new Error("Invalid login credentials")
    }

    const valid = await verify(user.password, credentials.password)
    if (!valid) {
      throw new Error("Invalid login credentials")
    }

    return user
  }
}
