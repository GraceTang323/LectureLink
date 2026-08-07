import { type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';

export async function authorizeRequest(req: Request, res: Response): Promise<number | null> {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'Unauthorized' });
        return null;
    }

    try {
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };
        const userId = decodedPayload.id;

        if (!userId) {
            res.status(403).json({ error: 'Forbidden' });
            return null;
        }
        return userId;

    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(401).json({ error: 'Unauthorized' });
        return null;
    }
}