// Defines the API routes for user authentication
// Maps URLs to controller functions that handle logic
import { Router, type Request, type Response } from 'express';
import { login, register } from '../controllers/authController.ts';

// Create a new router instance instead of using the main app instance
const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  // Call the register controller
  await register(req, res);
});

router.post('/login', async (req: Request, res: Response) => {
  await login(req, res);
});

router.post('/refresh', async (req: Request, res: Response) => {
    res.send('Refresh token endpoint');
})

router.post('/me', async (req: Request, res: Response) => {
    res.send('User info endpoint');
})

// Export the router to be used in the main server file
export default router; 