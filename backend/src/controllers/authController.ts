import { type Request, type Response } from 'express';
import * as authService from '../services/authService.ts';

export async function register(req: Request, res: Response) {
    try {
        const { email, password, displayName } = req.body;
    
        const result = await authService.register(
            email, password, displayName
        );
        res.status(result.status).json(result.data);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
    
}