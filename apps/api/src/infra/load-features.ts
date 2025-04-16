import { readdirSync } from 'fs';
import { join } from 'path';

export function loadFeatures() {
    const basePath = join(__dirname, '');

    for (const file of readdirSync(basePath)) {
        if (file.endsWith('.feature.ts') || file.endsWith('.feature.js')) {
            require(join(basePath, file));
        }
    }
}