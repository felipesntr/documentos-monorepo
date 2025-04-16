import { z } from 'zod';
import type { Request, Response } from 'express';
import { RouteRegistry } from 'infra/router';
import { es } from 'infra/elastic';
import { SearchHit } from '@elastic/elasticsearch/lib/api/types';
import { vectorizeText } from 'infra/vectorize';

export interface SearchCommand {
    query: string;
    k: number;
}

export const SearchCommandSchema = z.object({
    query: z.string().min(1),
    k: z.number().int().positive().max(100).default(10)
});

export interface SearchDocumentSource {
    docId: number;
    title: string;
    blockIndex: number;
    text: string;
    metadata: Record<string, string>;
}

export class SearchDocuments {
    static async validate(body: unknown): Promise<
        { success: true; data: SearchCommand } | { success: false; errors: any }
    > {
        const result = SearchCommandSchema.safeParse(body);
        if (!result.success) {
            return { success: false, errors: result.error.format() };
        }
        return { success: true, data: result.data };
    }

    static async handle(command: SearchCommand): Promise<Array<SearchDocumentSource & { score: number }>> {
        const vector: number[] = await vectorizeText(command.query);

        const response = await es.knnSearch({
            index: 'documentos',
            knn: {
                field: 'embedding',
                query_vector: vector,
                k: command.k,
                num_candidates: 1000
            },
            _source: ['docId', 'title', 'blockIndex', 'text', 'metadata']
        });

        const hits = response.hits.hits
            .filter((hit): hit is SearchHit<SearchDocumentSource> & { _id: string } => hit._id !== undefined)
            .map(hit => ({
                ...hit._source,
                docId: hit._source?.docId ?? 0,
                title: hit._source?.title ?? '',
                blockIndex: hit._source?.blockIndex ?? 0,
                text: hit._source?.text ?? '',
                metadata: hit._source?.metadata ?? {},
                score: hit._score ?? 0,
                _id: hit._id
            }));

        return hits;
    }

    @RouteRegistry.post('/documentos/search')
    //@RouteRegistry.authorize()
    static async route({ req, res }: { req: Request; res: Response }): Promise<Response> {
        const validation = await SearchDocuments.validate(req.body);
        if (!validation.success) {
            return res.status(400).json({ errors: validation.errors });
        }

        const result = await SearchDocuments.handle(validation.data);
        return res.json(result);
    }
}
