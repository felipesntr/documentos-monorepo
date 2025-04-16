
import { DataSource } from 'typeorm';
import { Block } from 'documents/block.entity';
import { Document } from 'documents/document.entity';
import { User } from 'users/user.entity';

export const AppDataSource = new DataSource({
    type: 'mssql',
    host: process.env.SQLSERVER_HOST || 'localhost',
    port: 1433,
    username: process.env.SQLSERVER_USER || 'sa',
    password: process.env.SQLSERVER_PASSWORD || 'Your_password123',
    database: process.env.SQLSERVER_DB || 'master',
    entities: [Document, Block, User],
    migrations: ['src/infra/relational/migrations/*.ts'],
    synchronize: false,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
});
