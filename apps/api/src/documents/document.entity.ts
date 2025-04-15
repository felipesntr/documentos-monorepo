import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Block } from './block.entity';

@Entity()
export class Document {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column('nvarchar', { length: 255 })
    title!: string;

    @OneToMany(() => Block, block => block.document, { cascade: true })
    blocks!: Block[];
}
