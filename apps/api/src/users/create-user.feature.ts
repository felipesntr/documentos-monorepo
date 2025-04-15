import { z } from 'zod';
import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { AppDataSource } from 'infra/relational/data-source';
import { User } from './user.entity';
import { RouteRegistry } from 'infra/router';

export class CreateUser {
    static Schema = z.object({
        username: z.string().min(3),
        password: z.string().min(6)
    });

    static async validate(input: unknown) {
        const parsed = this.Schema.safeParse(input);
        if (!parsed.success) return { success: false, errors: parsed.error.format() };
        return { success: true, data: parsed.data };
    }

    static async handle(data: z.infer<typeof this.Schema>) {
        const repo = AppDataSource.getRepository(User);

        const exists = await repo.findOne({ where: { username: data.username } });
        if (exists) {
            throw new Error('Username already exists');
        }

        const hash = await bcrypt.hash(data.password, 10);
        const user = repo.create({ username: data.username, password: hash });

        await repo.save(user);
        return { id: user.id, username: user.username };
    }

    @RouteRegistry.post('/auth/register')
    static async route({ req, res }: { req: Request; res: Response }) {
        const validation = await this.validate(req.body);

        if (!validation.success) {
            return res.status(400).json({ errors: validation.errors });
        }

        try {
            const result = await this.handle(validation.data!);
            return res.status(201).json(result);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            return res.status(400).json({ error: msg });
        }
    }
}
