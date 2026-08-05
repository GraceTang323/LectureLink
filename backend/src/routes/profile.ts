import { Router, type Request, type Response } from 'express';
import * as profileController from '../controllers/profileController.ts';
import { profile } from 'node:console';

const router = Router();

router.get('/me', async (req: Request, res: Response) => {
    await profileController.getMe(req, res);
});

// router.get('/:<userId>', async (req: Request, res: Response) => {
    // await profileController.getUser(req, res);
// });

router.put('/me', async (req: Request, res: Response) => {
    await profileController.putMe(req, res);
});

router.put('/me/photo', async (req: Request, res: Response) => {
    await profileController.putMePhoto(req, res);
});

router.put('/me/availability', async (req: Request, res: Response) => {
    await profileController.putMeAvailability(req, res);
});

router.put('/me/interests', async (req: Request, res: Response) => {
    await profileController.putMeInterests(req, res);
});

router.put('/me/courses', async (req: Request, res: Response) => {
    await profileController.putMeCourses(req, res);
});

export default router;