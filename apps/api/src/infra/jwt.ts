import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

export function generateToken(payload: object): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

export function verifyToken(token: string): object | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return typeof decoded === 'object' && decoded !== null ? decoded : null;
    } catch {
        return null;
    }
}
