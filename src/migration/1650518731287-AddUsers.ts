import { MigrationInterface, QueryRunner } from "typeorm"

export class AddUsers1650518731287 implements MigrationInterface {
  name = "AddUsers1650518731287"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
        "email" text NOT NULL UNIQUE,
        "password" text NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )
    `)

    await queryRunner.query(`
      ALTER TABLE "note"
        ADD "user_id" uuid NOT NULL,
        ADD FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "user_id"`)
    await queryRunner.query(`DROP TABLE "user"`)
  }
}
