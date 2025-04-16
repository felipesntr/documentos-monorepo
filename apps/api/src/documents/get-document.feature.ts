import { z } from 'zod';
import { Document } from '../documents/document.entity';
import type { Request, Response } from 'express';
import { AppDataSource } from 'infra/relational/data-source';
import { RouteRegistry } from 'infra/router';

export class GetDocument {
    static ParamsSchema = z.object({
        id: z.string().min(1)
    });

    static async validate(params: unknown) {
        const result = GetDocument.ParamsSchema.safeParse(params);
        if (!result.success) {
            return { success: false, errors: result.error.format() };
        }

        return { success: true, data: result.data };
    }

    static async handle(params: z.infer<typeof GetDocument.ParamsSchema>) {
        const documentRepository = AppDataSource.getRepository(Document);

        const document = await documentRepository.findOne({
            where: { id: params.id.toString() },
            relations: ['blocks']
        });

        if (!document) {
            return { notFound: true };
        }

        return {
            id: document.id,
            title: document.title,
            blocks: document.blocks.map(block => ({
                index: block.blockIndex,
                text: block.text,
                metadata: JSON.parse(block.metadata),
                //embedding: block.embedding ?? null
            }))
        };
    }


    @RouteRegistry.get('/documentos/:id')
    @RouteRegistry.authorize()
    static async route({ req, res }: { req: Request; res: Response }) {
        const validation = await GetDocument.validate(req.params);
        if (!validation.success) {
            return res.status(400).json({ errors: validation.errors });
        }

        const result = await GetDocument.handle(validation.data!);

        if ('notFound' in result) {
            return res.status(404).json({ error: 'Document not found' });
        }

        return res.json(result);
    }
}
