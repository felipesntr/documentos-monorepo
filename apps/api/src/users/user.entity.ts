import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column("nvarchar", { length: 255, unique: true })
    username!: string;

    @Column("nvarchar", { length: 255 })
    password!: string;

    @Column("nvarchar", { length: 255 })
    email!: string;
}
