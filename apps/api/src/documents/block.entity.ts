import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Document } from './document.entity';

@Entity()
export class Block {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('int')
    blockIndex!: number;

    @Column('nvarchar', { length: 'MAX' })
    text!: string;

    @Column('nvarchar', { length: 'MAX' })
    metadata!: string;

    @ManyToOne(() => Document, document => document.blocks, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'documentId' })
    document!: Document;

    @Column('uuid')
    documentId!: string;
}
