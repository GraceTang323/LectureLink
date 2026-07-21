import jwt from 'jsonwebtoken';
import pool from '../db/pool.ts';
import bcrypt from 'bcrypt';
import "dotenv/config";

export async function register(
    email: string, 
    password: string, 
    displayName: string
) {
    if (!email || !password || !displayName) {
        return {
            status: 400,
            data: { error: 'Missing required fields' }
        };
    }
    // Check if email has already been used to register a user
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
        return {
            status: 400,
            data: { error: 'Email already registered' }
        };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const result = await pool.query(
        'INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name;',
        [email, hashedPassword, displayName]
    );

    const newUser = result.rows[0];
    const payload = { id: newUser.id, email: newUser.email }
    const secretKey = process.env.JWT_SECRET;

    // Generate JWT token
    const token = jwt.sign(payload, secretKey as string, { expiresIn: '30m' });

    return {
        status: 201,
        data: { user: newUser, token }
    };
}
