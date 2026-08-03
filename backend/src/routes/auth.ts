// Defines the API routes for user authentication
// Maps HTTP URLs to controller functions that handle logic
import { Router, type Request, type Response } from 'express';
import * as authController from '../controllers/authController.ts';

// Create a new router instance instead of using the main app instance
const router = Router();

router.post('/register', async (req: Request, res: Response) => {
    await authController.register(req, res);
});

router.post('/login', async (req: Request, res: Response) => {
    await authController.login(req, res);
});

router.post('/refresh', async (req: Request, res: Response) => {
    await authController.refresh(req, res);
})

router.post('/logout', async (req: Request, res: Response) => {
    await authController.logout(req, res);
})

router.get('/me', async (req: Request, res: Response) => {
    await authController.me(req, res);
})

// Export the router to be used in the main server file
export default router; 