import { type Request, type Response } from 'express';
import { authorizeRequest } from '../util/authorize.ts';
import * as matchService from '../services/matchService.ts'

export async function likeUser(req: Request, res: Response) {
    try {
        const targetUserId = Number(req.params.userId);
        if (!targetUserId) {
            return res.status(400).json({ error: 'Missing userId in request body' });
        }

        const userId = await authorizeRequest(req, res);
        if (!userId) return;

        if (Number(userId) === targetUserId) {
            return res.status(401).json({ error: 'User cannot like themselves' });
        }

        const result = await matchService.likeUser(userId, targetUserId);
        res.status(result.status).json(result.data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function showAllLikes(req: Request, res: Response) {
    try {
        const userId = await authorizeRequest(req, res);
        if (!userId) return;

        // const result = await matchService.showLikes(userId);
        // res.status(result.status).json(result.data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function unlikeUser(req: Request, res: Response) {
    try {
        const targetUserId = Number(req.params.userId);
        if (!targetUserId) {
            return res.status(400).json({ error: 'Missing userId in request body' });
        }

        const userId = await authorizeRequest(req, res);
        if (!userId) return;

        if (Number(userId) === targetUserId) {
            return res.status(401).json({ error: 'User cannot unlike themselves' });
        }

        const result = await matchService.unlikeUser(userId, targetUserId);
        res.status(result.status).json(result.data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function showAllMatches(req: Request, res: Response) {

}

export async function showMatch(req: Request, res: Response) {

}

export async function deleteMatch(req: Request, res: Response) {

}