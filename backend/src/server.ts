import express, { type Express, type Request, type Response } from 'express';
import pool from './db/pool.ts';

const app: Express = express();
const port = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.get('/hi', (req: Request, res: Response) => {
  res.send('HIIIIiiiiIII!');
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error querying database:', error);
    res.status(500).json({ error: 'Database Error' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});