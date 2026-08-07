import pool from '../db/pool.ts';
import "dotenv/config";

export async function likeUser(
    userId: number,
    targetUserId: number // assuming controller checks userId != targetUserId
) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const targetUser = await client.query('SELECT 1 FROM users WHERE id = $1', [targetUserId]);
        if (targetUser.rowCount === 0) {
            await client.query('ROLLBACK');
            return {
                status: 403,
                data: { error: "Invalid target user Id." }
            }
        }

        const insert = await client.query(`
            INSERT INTO likes (liker_id, liked_id) 
            VALUES ($1, $2)
            ON CONFLICT (liker_id, liked_id)
            DO NOTHING
            RETURNING 1
            `, [userId, targetUserId]);

        if (insert.rowCount === 0) {
            await client.query('ROLLBACK');
            return {
                status: 200,
                data: { message: "User already liked." }
            }
        }

        // check for a reciprocal like from the other user
        const mutualLike = await client.query('SELECT 1 FROM likes WHERE liker_id = $1 AND liked_id = $2', [targetUserId, userId]);
        if (mutualLike.rows.length === 0) {
            await client.query('COMMIT');
            return {
                status: 201,
                data: {
                    message: `Successfully liked user ${targetUserId}`,
                    matched: false
                }
            }
        }
        
        // both users like each other, create a new match
        const result = await client.query(`
            INSERT INTO matches (user_low, user_high) 
            VALUES (LEAST($1, $2)::bigint, GREATEST($1, $2)::bigint)
            ON CONFLICT DO NOTHING
            RETURNING id, is_active
            `, [userId, targetUserId]);

        if (result.rowCount === 0) {
            // match already exists, return existing details
            const fetchResult = await client.query(`
                SELECT id, is_active
                FROM matches
                WHERE user_low = LEAST($1, $2)::bigint
                AND user_high = GREATEST($1, $2)::bigint;
                `, [userId, targetUserId]);
            const matchData = fetchResult.rows[0];

            await client.query('COMMIT');

            return {
                status: 201,
                data: {
                    message: `Successfully liked user ${targetUserId}. Match created!`,
                    matchId: matchData.id,
                    matchStatus: matchData.is_active
                }
            };
        };

        const matchData = result.rows[0];

        await client.query('COMMIT');

        return {
            status: 201,
            data: {
                matchId: matchData.id,
                matchStatus: matchData.is_active
            }
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

export async function unlikeUser(
    userId: number,
    targetUserId: number
) {
    try {
        const result = await pool.query(`
            DELETE FROM likes
            WHERE liker_id = $1 AND liked_id = $2
            RETURNING 1
            `, [userId, targetUserId]);

        if (result.rowCount === 0) { // repeat dislike or target user doesn't exist
            return {
                status: 403,
                data: { error: "Already disliked user, or invalid target user Id." }
            }
        };

        return {
            status: 200,
            data: { message: `Successfully unliked user ${targetUserId}` }
        };
    } catch (err) {
        console.log(err);
        return {
            status: 500,
            data: { error: err instanceof Error ? err.message : String(err) }
        };
    }
}

export async function showLikes(
    userId: number
) {
    try {
        const likerResult = await pool.query('SELECT liked_id FROM likes WHERE liker_id = $1', [userId]);
        if (likerResult.rowCount === 0) {
            return {
                status: 200,
                data: { message: "No likes found" }
            }
        }
        const likerIds = likerResult.rows[0];
        const likerData = await pool.query('SELECT * FROM ')
    } catch (err) {
        console.log(err);
        return {
            status: 500,
            data: { error: err instanceof Error ? err.message : String(err) }
        };
    }
}