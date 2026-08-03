import { type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
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

export async function login(req: Request, res: Response) {
    try {
        const { email, password } = req.body;

        const result = await authService.login(email, password);
        res.status(result.status).json(result.data);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function refresh(req: Request, res: Response) {
    try {
        const incomingToken = req.body.refreshToken;

        const result = await authService.refresh(incomingToken);
        res.status(result.status).json(result.data);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function logout(req: Request, res: Response) {
    try {
        const incomingToken = req.body.refreshToken;

        const result = await authService.logout(incomingToken);
        res.status(result.status).json(result.data);
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function me(req: Request, res: Response) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // splits "Bearer" from token
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // verify token and extract userId from it
        jwt.verify(token, process.env.JWT_SECRET as string, async (err, decodedPayload) => {
            if (err) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            const userId = (decodedPayload as { id: number }).id;
            const result = await authService.me(userId);

            res.status(result.status).json(result.data);
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}