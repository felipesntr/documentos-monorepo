import { RouteRegistry } from '../infra/router';
import { z } from 'zod';
import { generateToken } from '../infra/jwt';
import { User } from '../users/user.entity';
import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { AppDataSource } from 'infra/relational/data-source';

export class Auth {
    static LoginSchema = z.object({
        username: z.string(),
        password: z.string()
    });

    static async validate(input: unknown) {
        const result = Auth.LoginSchema.safeParse(input);
        if (!result.success) {
            return { success: false, errors: result.error.format() };
        }
        return { success: true, data: result.data };
    }

    static async handle({ username, password }: { username: string; password: string }) {
        const repo = AppDataSource.getRepository(User);
        const user = await repo.findOne({ where: { username } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error('Invalid credentials');
        }

        const token = generateToken({ sub: user.id });
        return { token };
    }

    @RouteRegistry.post('/auth/login')
    static async route({ req, res }: { req: Request; res: Response }) {
        const data = req.body;
        const valid = await Auth.validate(data);

        if (!valid.success) {
            return res.status(400).json({ errors: valid.errors });
        }

        try {
            const result = await Auth.handle(valid.data!);
            return res.json(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            return res.status(401).json({ error: errorMessage });
        }
    }
}
