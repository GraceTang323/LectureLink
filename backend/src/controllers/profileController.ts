import { type Request, type Response } from 'express';
import * as profileService from '../services/profileService.ts';
import { authorizeRequest } from '../util/authorize.ts';

export async function getMyProfile(req: Request, res: Response) {
    try {
        const userId = await authorizeRequest(req, res);
        if (!userId) return;

        const result = await profileService.getUser(userId);
        res.status(result.status).json(result.data);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getOtherProfile(req: Request, res: Response) {
    try {
        const requesterId = await authorizeRequest(req, res);
        if (!requesterId) return;
        
        const userId = Number(req.params.userId);
        if (!userId) {
            return res.status(400).json({ error: 'Missing userId in request body' });
        }

        const result = await profileService.getUser(userId);
        res.status(result.status).json(result.data);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getCourses(req: Request, res: Response) {
    try {
        await authorizeRequest(req, res);
        
        const result = await profileService.getCourses();
        res.status(result.status).json(result.data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getInterests(req: Request, res: Response) {
    try {
        await authorizeRequest(req, res);
        
        const result = await profileService.getInterests();
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

        const { display_name, major, bio, graduation_year } = req.body;
        const result = await profileService.updateProfile(userId, display_name, major, bio, graduation_year);
        res.status(result.status).json(result.data);

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
        const result = await profileService.updateInterests(userId, interests);
        res.status(result.status).json(result.data);

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
        const result = await profileService.updateCourses(userId, courses);
        res.status(result.status).json(result.data);

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

export async function deleteMeAvailability(req: Request, res: Response) {
    try {
        const userId = await authorizeRequest(req, res);
        if (!userId) return;

        const { weekDay } = req.body;
        if (weekDay < 0 || weekDay > 6) {
            return res.status(401).json({ error: 'Invalid week day. Use 0 for Sunday through 6 for Saturday.' });
        }

        await profileService.deleteAvailability(userId, weekDay);
        res.status(201).json({ message: 'Availability deleted successfully' });
        
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}