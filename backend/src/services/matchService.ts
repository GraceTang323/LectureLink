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
        // join on the liked user to get the corresponding user's info
        // left join to ensure users with incomplete profiles are still included
        const result = await pool.query(`
            SELECT l.created_at, u.display_name, u.photo_url, p.major, p.graduation_year
            FROM likes l
            JOIN users u ON l.liked_id = u.id
            LEFT JOIN profiles p ON p.user_id = u.id
            WHERE l.liker_id = $1
            ORDER BY l.created_at DESC
            `, [userId]);
        if (result.rowCount === 0) {
            return {
                status: 200,
                data: { likes: [] }
            }
        }
        
        return {
            status: 200,
            data: { likes: result.rows }
        };
    } catch (err) {
        console.log(err);
        return {
            status: 500,
            data: { error: err instanceof Error ? err.message : String(err) }
        };
    }
}

export async function showMatches(
    userId: number
) {
    try {
        // check that userId is either user_low or user_high
        const result = await pool.query(`
            SELECT m.id, m.matched_at, m.is_active, u.display_name
            FROM matches m
            JOIN users u
            ON u.id = CASE
                WHEN m.user_low = $1 THEN m.user_high
                ELSE m.user_low
            END
            WHERE $1 IN (m.user_low, m.user_high)
            ORDER BY m.matched_at DESC
            `, [userId]);

        if (result.rowCount === 0) {
            return {
                status: 200,
                data: { matches: [] }
            }
        }
        return {
            status: 200,
            data: { matches: result.rows }
        };
    } catch (err) {
        console.log(err);
        return {
            status: 500,
            data: { error: err instanceof Error ? err.message : String(err) }
        };
    }
}

export async function showOneMatch(
    userId: number,
    targetMatchId: number
) {
    try {
        const result = await pool.query(`
            SELECT m.id, m.matched_at, m.is_active, u.display_name
            FROM matches m
            JOIN users u
            ON u.id = CASE
                WHEN m.user_low = $1 THEN m.user_high
                ELSE m.user_low
            END
            WHERE $1 IN (m.user_low, m.user_high) AND m.id = $2
            `, [userId, targetMatchId]);
            
        if (result.rowCount === 0) {
            return {
                status: 404,
                data: { error: "Match not found." }
            }
        }
        const data = result.rows[0];
        return {
            status: 200,
            data: { match: data }
        };
    } catch (err) {
        console.log(err);
        return {
            status: 500,
            data: { error: err instanceof Error ? err.message : String(err) }
        };
    }
}

export async function deleteMatch(
    userId: number,
    targetMatchId: number
) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // delete the match
        // checking userId ensures the user actually owns the match being deleted
        const result = await client.query(`
            DELETE FROM matches
            WHERE $1 IN (user_low, user_high) AND id = $2
            RETURNING user_low, user_high
            `, [userId, targetMatchId]);
            
        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return {
                status: 404,
                data: { error: "Match not found." }
            }
        }
        const { user_low, user_high } = result.rows[0];
        const targetUserId = user_low === userId ? user_high : user_low;

        // delete any subsequent likes as well
        await client.query(`
            DELETE FROM likes
            WHERE (liker_id = $1 AND liked_id = $2)
                OR (liker_id = $2 AND liked_id = $1)
            `, [userId, targetUserId]);
        
        await client.query('COMMIT');
        return {
            status: 200,
            data: { message: `Successfully deleted match ${targetMatchId} between users ${userId} and ${targetUserId}` }
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