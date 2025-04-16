import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1744765818620 implements MigrationInterface {
    name = 'InitialMigration1744765818620'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "document" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_e57d3357f83f3cdc0acffc3d777" DEFAULT NEWSEQUENTIALID(), "title" nvarchar(255) NOT NULL, CONSTRAINT "PK_e57d3357f83f3cdc0acffc3d777" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "block" ("id" int NOT NULL IDENTITY(1,1), "blockIndex" int NOT NULL, "text" nvarchar(MAX) NOT NULL, "metadata" nvarchar(MAX) NOT NULL, "documentId" uniqueidentifier NOT NULL, "embedding" ntext, CONSTRAINT "PK_d0925763efb591c2e2ffb267572" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_cace4a159ff9f2512dd42373760" DEFAULT NEWSEQUENTIALID(), "username" nvarchar(255) NOT NULL, "password" nvarchar(255) NOT NULL, "email" nvarchar(255) NOT NULL, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "block" ADD CONSTRAINT "FK_e7b6ab28fc5c34c4f585303c54b" FOREIGN KEY ("documentId") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "block" DROP CONSTRAINT "FK_e7b6ab28fc5c34c4f585303c54b"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "block"`);
        await queryRunner.query(`DROP TABLE "document"`);
    }

}
