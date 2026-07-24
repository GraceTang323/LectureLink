import jwt from 'jsonwebtoken';
import pool from '../db/pool.ts';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import "dotenv/config";

function hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

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
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Insert the new user into the database
        const result = await client.query(
            'INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name;',
            [email, hashedPassword, displayName]
        );

        const newUser = result.rows[0];
        const payload = { id: newUser.id, email: newUser.email }
        const secretKey = process.env.JWT_SECRET;

        // Generate refresh token
        const refreshToken = crypto.randomBytes(64).toString('hex');
        const tokenHash = hashToken(refreshToken);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 14); // expires in 14 days

        // Insert the JWT token into database
        await client.query(
            'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3);',
            [newUser.id, tokenHash, expiresAt]
        );

        await client.query('COMMIT');

        // Generate JWT token
        const accessToken = jwt.sign(payload, secretKey as string, { expiresIn: '30m' });

        return {
            status: 201,
            data: { user: newUser, accessToken, refreshToken }
        };
    } catch (err) {
        await client.query('ROLLBACK');
        return {
            status: 500,
            data: { error: err }
        };
    } finally {
        client.release();
    }
}

export async function login(
    email: string,
    password: string
) {
    // validate input
    if (!email || !password) {
        return {
            status: 500,
            data: { error: 'Missing required fields' }
        }
    }

    try {
        // fetch user by email
        const result = await pool.query('SELECT * from users WHERE email = ($1);', [email]);
        if (result.rowCount === 0) {
            return {
                status: 401,
                data: { error: 'Invalid email' }
            };
        }

        const user = result.rows[0]
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            return {
                status: 401,
                data: { error: 'Invalid password' }
            };
        }

        // login successful
        return {
            status: 201,
            data: { user: user }
        }
    } catch (err) {
        console.log(err)
        return {
            status: 500,
            data: { error: err }
        }
    }
    
}