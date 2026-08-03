import jwt from 'jsonwebtoken';
import pool from '../db/pool.ts';
import type { PoolClient } from 'pg';
import "dotenv/config";

export async function getMe(
    userId: number
) {
    try {
        const result = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
        if (result.rows.length === 0) {
            return {
                status: 404,
                data: { error: 'Profile not found'}
            }
        }
        const profile = result.rows[0];
        return {
            status: 201,
            data: { profile }
        };

    } catch (err) {
        console.log(err);
        return {
            status: 500,
            data: { error: err instanceof Error ? err.message : String(err) }
        };
    }
}

export async function updateProfile(
    userId: number, 
    major: string, 
    bio: string, 
    graduation_year: number
) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        await client.query('UPDATE profiles SET major = $1, bio = $2, graduation_year = $3 WHERE user_id = $4',
            [major, bio, graduation_year, userId]
        );

        await client.query('COMMIT');

    } catch (err) {
        console.log(err);
        await client.query('ROLLBACK');
        return {
            status: 500,
            data: { error: err instanceof Error ? err.message : String(err) }
        };
    } finally {
        client.release();
    }
}