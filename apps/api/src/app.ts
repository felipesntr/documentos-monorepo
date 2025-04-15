import 'reflect-metadata';

import express from 'express';
import { RouteRegistry } from './infra/router';
import { verifyToken } from './infra/jwt';

import './documents/create-document.feature';
import './auth/auth.feature';

import { AppDataSource } from 'infra/relational/data-source';

AppDataSource.initialize()
    .then(() => {
        console.log('Data Source has been initialized!');
    })
    .catch((err) => {
        console.error('Error during Data Source initialization', err);
    });

const app = express();
app.use(express.json());

for (const route of RouteRegistry.routes) {
    const { method, path, handler, authRequired } = route;

    const wrapper = async (req: express.Request, res: express.Response) => {
        if (authRequired) {
            const authHeader = req.headers['authorization'];
            const token = authHeader?.replace('Bearer ', '');
            const payload = token ? verifyToken(token) : null;

            if (!payload) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
        }

        return handler({ req, res });
    };

    app[method](path, wrapper);
}

app.listen(3000, () => console.log('API running at http://localhost:3000'));
