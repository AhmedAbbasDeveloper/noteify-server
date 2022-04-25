import { Field, ObjectType } from "type-graphql"
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { User } from "./User"

@ObjectType()
@Entity()
export class Note extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  readonly id!: string

  @Field()
  @Column({ name: "user_id", type: "uuid" })
  userId?: string

  @Field()
  @Column("text")
  title!: string

  @Field()
  @Column("text")
  content!: string

  @CreateDateColumn({ name: "created_at", type: "timestamp with time zone" })
  createdAt!: Date

  @UpdateDateColumn({ name: "updated_at", type: "timestamp with time zone" })
  updatedAt!: Date

  @Field(() => User)
  @ManyToOne(() => User, user => user.notes, { onUpdate: "NO ACTION", onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: Promise<User>
}
