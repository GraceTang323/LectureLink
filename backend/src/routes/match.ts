import { Router, type Request, type Response } from 'express';
import * as matchController from '../controllers/matchController.ts';

const router = Router();

router.post('/:userId', async (req: Request, res: Response) => {
    await matchController.likeUser(req, res);
});

router.get('/me', async (req: Request, res: Response) => {
    await matchController.showAllLikes(req, res);
});

router.delete('/:userId', async (req: Request, res: Response) => {
    await matchController.unlikeUser(req, res);
});

router.get('/me', async (req: Request, res: Response) => {
    await matchController.showAllMatches(req, res); // check userId == either user_low or user_high
});

router.get('/me/:matchId', async (req: Request, res: Response) => {
    await matchController.showMatch(req, res);
});

router.delete('/me/:matchId', async (req: Request, res: Response) => {
    await matchController.deleteMatch(req, res);
});

export default router;