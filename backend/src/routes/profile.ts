import { Router, type Request, type Response } from 'express';
import * as profileController from '../controllers/profileController.ts';
import { profile } from 'node:console';

const router = Router();

router.get('/me', async (req: Request, res: Response) => {
    await profileController.getMe(req, res);
});

router.put('/me', async (req: Request, res: Response) => {
    await profileController.putMe(req, res);
});

router.post('/me/photo', async (req: Request, res: Response) => {
    res.send('POST User photo endpoint');
});

router.put('/me/availability', async (req: Request, res: Response) => {
    res.send('PUT User availability endpoint');
});

router.put('/me/interests', async (req: Request, res: Response) => {
    res.send('PUT User interests endpoint');
});

router.put('/me/classes', async (req: Request, res: Response) => {
    res.send('PUT User classes endpoint');
});

export default router;

//   PUT    /api/profiles/me          {major, bio, graduation_year}
//   POST   /api/profiles/me/photo    (multipart .png/.jpg)
//   PUT    /api/profiles/me/availability
//   PUT    /api/profiles/me/interests
//   PUT    /api/profiles/me/classes
