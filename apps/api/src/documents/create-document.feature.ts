import { z } from 'zod';

import { Document } from '../documents/document.entity';

import type { Request, Response } from 'express';
import { AppDataSource } from 'infra/relational/data-source';
import { RouteRegistry } from 'infra/router';
import { es } from 'infra/elastic';

export class CreateDocument {
    static CommandSchema = z.object({
        title: z.string().min(1),
        blocks: z
            .array(
                z.object({
                    text: z.string().min(1),
                    metadata: z.record(z.string(), z.string())
                })
            )
            .min(1)
    });

    static async validate(input: unknown) {
        const result = this.CommandSchema.safeParse(input);
        if (!result.success) {
            return { success: false, errors: result.error.format() };
        }

        return { success: true, data: result.data };
    }

    static async handle(command: z.infer<typeof this.CommandSchema>) {
        const documentRepository = AppDataSource.getRepository(Document);

        // Cria o documento com blocos
        const document = documentRepository.create({
            title: command.title,
            blocks: command.blocks.map((block, idx) => ({
                blockIndex: idx,
                text: block.text,
                metadata: JSON.stringify(block.metadata)
            }))
        });

        // Salva no SQL Server
        const savedDocument = await documentRepository.save(document);

        // Indexa no Elasticsearch
        const body = savedDocument.blocks.map((block, idx) => [
            { index: { _index: 'documentos', _id: `${savedDocument.id}::${idx}` } },
            {
                docId: savedDocument.id,
                title: savedDocument.title,
                blockIndex: block.blockIndex,
                text: block.text,
                metadata: JSON.parse(block.metadata)
            }
        ]).flat();

        await es.bulk({ refresh: true, body });

        return { id: savedDocument.id, blocksCount: savedDocument.blocks.length };
    }

    @RouteRegistry.post('/documentos')
    @RouteRegistry.authorize()
    static async route({ req, res }: { req: Request; res: Response }) {
        const validation = await this.validate(req.body);

        if (!validation.success) {
            return res.status(400).json({ errors: validation.errors });
        }

        const result = await this.handle(validation.data!);
        return res.json(result);
    }
}
