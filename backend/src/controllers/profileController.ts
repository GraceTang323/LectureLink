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

export async function putMePhoto(req: Request, res: Response) {
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

export async function putMeAvailability(req: Request, res: Response) {
    try {
        const userId = await authorizeRequest(req, res);
        if (!userId) return;

        const { weekDay, startTime, endTime } = req.body;
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/; // Matches HH:MM:SS format

        if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
            return res.status(401).json({ error: 'Invalid time format. Use HH:MM:SS format.' });
        }

        if (startTime >= endTime) {
            return res.status(402).json({ error: 'Start time must be before end time.' });
        }

        if (weekDay < 0 || weekDay > 6) {
            return res.status(403).json({ error: 'Invalid week day. Use 0 for Sunday through 6 for Saturday.' });
        }

        await profileService.updateAvailability(userId, weekDay, startTime, endTime);
        res.status(201).json({ message: 'Availability updated successfully' });

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