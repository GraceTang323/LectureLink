import { type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import * as profileService from '../services/profileService.ts';

export async function getMe(req: Request, res: Response) {
    try {
        const userId = await authorizeRequest(req, res);
        if (!userId) return;

        const result = await profileService.getMe(userId);
        res.status(result.status).json(result.data);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function putMe(req: Request, res: Response) {
    try {
        const userId = await authorizeRequest(req, res);
        if (!userId) return;

        const { major, bio, graduation_year } = req.body;
        await profileService.updateProfile(userId, major, bio, graduation_year);
        res.status(201).json({ message: 'Profile updated successfully' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function postMePhoto(req: Request, res: Response) {
    try {
        const userId = await authorizeRequest(req, res);
        if (!userId) return;

        const { photoUrl } = req.body;
        await profileService.updateProfilePhoto(userId, photoUrl);
        res.status(201).json({ message: 'Profile photo updated successfully' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function putMeInterests(req: Request, res: Response) {
    try {
        const userId = await authorizeRequest(req, res);
        if (!userId) return;

        const { interests } = req.body;
        if (interests.length > 5) {
            return res.status(401).json({ error: 'You can select a maximum of 5 interests' });
        }
        await profileService.updateInterests(userId, interests);
        res.status(201).json({ message: 'Interests updated successfully' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function putMeCourses(req: Request, res: Response) {
    try {
        const userId = await authorizeRequest(req, res);
        if (!userId) return;

        const { courses } = req.body;
        if (courses.length > 5) {
            return res.status(401).json({ error: 'You can select a maximum of 5 courses' });
        }
        await profileService.updateCourses(userId, courses);
        res.status(201).json({ message: 'Courses updated successfully' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function authorizeRequest(req: Request, res: Response): Promise<number | null> {
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