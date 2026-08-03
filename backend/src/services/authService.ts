import jwt from 'jsonwebtoken';
import pool from '../db/pool.ts';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import type { PoolClient } from 'pg';
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
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Insert the new user into the database
        const result = await client.query(
            'INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name;',
            [email, hashedPassword, displayName]
        );

        const newUser = result.rows[0];

        // Insert a new profile into the database
        await client.query('INSERT INTO profiles (user_id) VALUES ($1);', [newUser.id]);

        const { accessToken, refreshToken } = await createSession(client, newUser);
        await client.query('COMMIT');

        return {
            status: 201,
            data: { user: newUser, accessToken, refreshToken }
        };
    } catch (err) {
        await client.query('ROLLBACK');
        console.log(err);
        return {
            status: 500,
            data: { error: err instanceof Error ? err.message : String(err) }
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
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        // fetch user by email
        const result = await client.query('SELECT * from users WHERE email = ($1);', [email]);
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
        const { accessToken, refreshToken } = await createSession(client, user);
        await client.query('COMMIT');

        // login successful
        return {
            status: 201,
            data: { user: user, accessToken, refreshToken }
        }
    } catch (err) {
        await client.query('ROLLBACK');
        console.log(err)
        return {
            status: 500,
            data: { error: err instanceof Error ? err.message : String(err) }
        }
    } finally {
        client.release();
    }
    
}

export async function refresh(
    incomingRefreshToken: string
) {
    if (!incomingRefreshToken) {
        return {
            status: 401,
            data: { error: 'Refresh token required' }
        };
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // get refresh token hash
        const refreshHash = hashToken(incomingRefreshToken);

        const result = await client.query(
            'SELECT * FROM refresh_tokens WHERE token_hash = $1;', 
            [refreshHash]
        );
        // check token exists in database
        if (result.rowCount === 0) {
            return {
                status: 401,
                data: { error: 'Invalid refresh token' }
            };
        }
        const storedToken = result.rows[0];
        // check token is not expired and not revoked
        if (storedToken.expires_at < new Date() || storedToken.revoked_at !== null) {
            return {
                status: 401,
                data: { error: 'Expired or Revoked refresh token' }
            };
        }
        // rotate token --> revoke the used token
        await client.query(
            'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1;',
            [refreshHash]
        );
        // get user
        const getUserResult = await client.query(
            'SELECT * FROM users WHERE id = $1;',
            [storedToken.user_id]
        );
        const user = getUserResult.rows[0];

        // generate new access and refresh tokens
        const session = await createSession(client, user);
        
        await client.query('COMMIT');

        return {
            status: 201,
            data: { 
                accessToken: session.accessToken, 
                refreshToken: session.refreshToken
            }
        };
    } catch (err) {
        await client.query('ROLLBACK');
        console.log(err);
        return {
            status: 500,
            data: { error: err instanceof Error ? err.message : String(err) }
        }
    } finally {
        client.release();
    }
}

export async function logout(
    incomingRefreshToken: string
) {
    // get hashed refresh token
    const tokenHash = hashToken(incomingRefreshToken);

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // revoke refresh token
        await client.query(
            'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1;',
            [tokenHash]
        );

        await client.query('COMMIT');

        return {
            status: 204,
            data: {}
        };
    } catch (err) {
        await client.query('ROLLBACK');
        console.log(err);
        return {
            status: 500,
            data: { error: err instanceof Error ? err.message : String(err) }
        };
    } finally {
        client.release();
    }
}

export async function me(
    userId: number
) {
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1;', [userId]);
        const user = result.rows[0];

        return {
            status: 200,
            data: {
                id: user.id,
                email: user.email,
                name: user.display_name
            }
        };

    } catch (err) {
        console.log(err);
        return {
            status: 500,
            data: { error: err instanceof Error ? err.message : String(err) }
        };
    }
}

function hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

async function createSession(
    client: PoolClient,
    user: any
) {
    // generate refresh token
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14); // expires in 14 days

    // Insert the refresh token into database
    await client.query(
        'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3);',
        [user.id, tokenHash, expiresAt]
    );

    // generate access token
    const payload = { id: user.id, email: user.email };
    const secretKey = process.env.JWT_SECRET;
    const accessToken = jwt.sign(payload, secretKey as string, { expiresIn: '30m' });

    return { refreshToken, accessToken };
}