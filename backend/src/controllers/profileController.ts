import { type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import * as profileService from '../services/profileService.ts';

export async function getMe(req: Request, res: Response) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userId = await verifyToken(token);
        if (!userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const result = await profileService.getMe(userId);
        res.status(result.status).json(result.data);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function putMe(req: Request, res: Response) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userId = await verifyToken(token);
        if (!userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const { major, bio, graduation_year } = req.body;
        await profileService.updateProfile(userId, major, bio, graduation_year);
        res.status(201).json({ message: 'Profile updated successfully' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function verifyToken(token: string): Promise<number | null> {
    try {
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };
        return decodedPayload.id;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}