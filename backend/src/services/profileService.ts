import pool from '../db/pool.ts';
import "dotenv/config";

export async function getUser(
    userId: number
) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const [profileResult, interestsResult, coursesResult, availabilityResult] = await Promise.all([
            // Get core user and profile data on one row
            client.query(`
                SELECT p.*, u.email, u.display_name, u.photo_url
                FROM profiles p
                INNER JOIN users u ON p.user_id = u.id
                WHERE p.user_id = $1
                `, [userId]),
            // Get interests, courses, and availability on separate rows
            client.query(`
                SELECT interest_id FROM user_interests WHERE user_id = $1`, [userId]),
            client.query(`
                SELECT course_id FROM user_courses WHERE user_id = $1`, [userId]),
            client.query(`
                SELECT * FROM availability WHERE user_id = $1`, [userId])
        ]);

        if (profileResult.rows.length === 0) {
            await client.query('COMMIT');
            return {
                status: 404,
                data: { error: 'Profile not found'}
            }
        }

        const profileData = profileResult.rows[0];
        const interestsIds = interestsResult.rows.map(row => row.interest_id);
        const coursesIds = coursesResult.rows.map(row => row.course_id);

        // get the interest names, course names/codes, and weekdays for the IDs
        const [interestsNamesResult, coursesNamesResult, weekdaysResult] = await Promise.all([
            client.query('SELECT name FROM interests WHERE id = ANY($1)', [interestsIds]),
            client.query('SELECT course_name,course_code FROM courses WHERE id = ANY($1)', [coursesIds]),
            client.query('SELECT weekday FROM weekdays')
        ]);

        const interestsNames = interestsNamesResult.rows.map(row => row.name);
        const weekdays = weekdaysResult.rows.map(row => row.weekday);

        await client.query('COMMIT');
        return {
            status: 201,
            data: {
                user: {
                    id: profileData.user_id,
                    email: profileData.email,
                    display_name: profileData.display_name,
                    photo_url: profileData.photo_url
                },
                profile: {
                    major: profileData.major,
                    bio: profileData.bio,
                    graduation_year: profileData.graduation_year
                },
                courses: coursesNamesResult.rows.map(row => ({
                    course_name: row.course_name,
                    course_code: row.course_code
                })),
                interests: interestsNames,
                availability: availabilityResult.rows.map(row => ({
                    id: row.id,
                    weekday: weekdays[row.user_weekday],
                    start_time: row.start_time,
                    end_time: row.end_time
                }))
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

export async function updateProfile(
    userId: number, 
    display_name: string,
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
        await client.query('UPDATE users SET display_name = $1 WHERE id = $2', [display_name, userId]);
        await client.query('COMMIT');
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

export async function updateAvailability(
    userId: number,
    weekDay: number, // assuming valid weekdays (0-6)
    startTime: string, // assuming valid time format (HH:MI:SS)
    endTime: string
) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM availability WHERE user_id = $1 AND user_weekday = $2', [userId, weekDay]);

        await client.query('INSERT INTO availability (user_id, user_weekday, start_time, end_time) VALUES ($1, $2, $3, $4)', [userId, weekDay, startTime, endTime]);

        await client.query('COMMIT');

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

export async function deleteAvailability(
    userId: number,
    weekDay: number // assuming valid weekdays (0-6)
) {
    try {
        await pool.query('DELETE FROM availability WHERE user_id = $1 AND user_weekday = $2', [userId, weekDay]);
        return {
            status: 201,
            data: { message: 'Availability deleted successfully' }
        };
    } catch (err) {
        console.log(err);
        return {
            status: 500,
            data: { error: err instanceof Error ? err.message : String(err) }
        };
    }
}