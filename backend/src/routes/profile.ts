import { Router, type Request, type Response } from 'express';
import * as profileController from '../controllers/profileController.ts';

const router = Router();

router.get('/me', async (req: Request, res: Response) => {
    await profileController.getMyProfile(req, res);
});

router.get('/courses', async (req: Request, res: Response) => {
    await profileController.getCourses(req, res);
});

router.get('/interests', async (req: Request, res: Response) => {
    await profileController.getInterests(req, res);
});

router.get('/:userId', async (req: Request, res: Response) => {
    await profileController.getOtherProfile(req, res);
});

router.put('/me', async (req: Request, res: Response) => {
    await profileController.putMe(req, res);
});

router.put('/me/complete', async (req: Request, res: Response) => {
    await profileController.putMeProfileComplete(req, res);
});

router.put('/me/photo', async (req: Request, res: Response) => {
    await profileController.putMePhoto(req, res);
});

router.put('/me/availability', async (req: Request, res: Response) => {
    await profileController.putMeAvailability(req, res);
});

router.delete('/me/availability', async (req: Request, res: Response) => {
    await profileController.deleteMeAvailability(req, res);
});

router.delete('/me', async (req: Request, res: Response) => {
    await profileController.deleteMe(req, res);
})

router.put('/me/interests', async (req: Request, res: Response) => {
    await profileController.putMeInterests(req, res);
});

router.put('/me/courses', async (req: Request, res: Response) => {
    await profileController.putMeCourses(req, res);
});

export default router;