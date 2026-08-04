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
    try {
        await pool.query('UPDATE profiles SET major = $1, bio = $2, graduation_year = $3 WHERE user_id = $4',
            [major, bio, graduation_year, userId]
        );
    } catch (err) {
        console.log(err);
        return {
            status: 500,
            data: { error: err instanceof Error ? err.message : String(err) }
        };
    }
}

export async function updateProfilePhoto(
    userId: number, 
    photoUrl: string
) { 
    try {
        await pool.query('UPDATE users SET photo_url = $1 WHERE id = $2', [photoUrl, userId]);
    } catch (err) {
        console.log(err);
        return {
            status: 500,
            data: { error: err instanceof Error ? err.message : String(err) }
        };
    }
}

export async function updateInterests(
    userId: number, 
    interests: string[] // assuming controller ensures length <= 5
) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM user_interests WHERE user_id = $1', [userId]);

        // Get the interest IDs for the provided interest names
        const result = await client.query('SELECT id FROM interests WHERE name = ANY($1)', [interests]);
        const interestIds: number[] = result.rows.map((row) => row.id);

        interestIds.forEach(async (interestId: number) => {
            await client.query('INSERT INTO user_interests (user_id, interest_id) VALUES ($1, $2)', [userId, interestId]);
        });

        await client.query('COMMIT');

        return {
            status: 201,
            data: { message: 'Interests updated successfully' }
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

export async function updateCourses(
    userId: number,
    courses: string[] // assuming controller ensures length <= 5
) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM user_courses WHERE user_id = $1', [userId]);

        const result = await client.query('SELECT id FROM courses WHERE course_code = ANY($1)', [courses]);
        const courseIds: number[] = result.rows.map((row) => row.id);

        courseIds.forEach(async (courseId: number) => {
            await client.query('INSERT INTO user_courses (user_id, course_id) VALUES ($1, $2)', [userId, courseId]);
        });

        await client.query('COMMIT');

        return {
            status: 201,
            data: { message: 'Courses updated successfully' }
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