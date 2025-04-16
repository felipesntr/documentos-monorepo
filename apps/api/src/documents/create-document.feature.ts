import { z } from 'zod';

import { Document } from '../documents/document.entity';

import type { Request, Response } from 'express';
import { AppDataSource } from 'infra/relational/data-source';
import { RouteRegistry } from 'infra/router';
import { es } from 'infra/elastic';
import { vectorizeText } from 'infra/vectorize';

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
        const result = CreateDocument.CommandSchema.safeParse(input);
        if (!result.success) {
            return { success: false, errors: result.error.format() };
        }

        return { success: true, data: result.data };
    }

    static async handle(command: z.infer<typeof CreateDocument.CommandSchema>) {
        const documentRepository = AppDataSource.getRepository(Document);

        const blocksWithVectors = await Promise.all(
            command.blocks.map(async (block, idx) => {
                const embedding = await vectorizeText(block.text);
                return {
                    blockIndex: idx,
                    text: block.text,
                    metadata: JSON.stringify(block.metadata),
                    embedding
                };
            })
        );

        const document = documentRepository.create({
            title: command.title,
            blocks: blocksWithVectors
        });

        const savedDocument = await documentRepository.save(document);

        const body = blocksWithVectors.map((block, idx) => [
            { index: { _index: 'documentos', _id: `${savedDocument.id}::${idx}` } },
            {
                docId: savedDocument.id,
                title: savedDocument.title,
                blockIndex: block.blockIndex,
                text: block.text,
                metadata: JSON.parse(block.metadata),
                embedding: block.embedding
            }
        ]).flat();

        await es.bulk({ refresh: true, body });

        return { id: savedDocument.id, blocksCount: savedDocument.blocks.length };
    }

    @RouteRegistry.post('/documentos')
    @RouteRegistry.authorize()
    static async route({ req, res }: { req: Request; res: Response }) {
        const validation = await CreateDocument.validate(req.body);

        if (!validation.success) {
            return res.status(400).json({ errors: validation.errors });
        }

        const result = await CreateDocument.handle(validation.data!);
        return res.json(result);
    }
}
