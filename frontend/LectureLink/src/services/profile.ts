import { apiFetch } from '../services/api';

export async function getMyProfile(
    accessToken: string,
) {
    return apiFetch(
        "/profile/me",
        { method: "GET",},
        accessToken,
    );
}

export async function getCourses(
    accessToken: string,
) {
    return apiFetch(
        "/profile/courses",
        { method: "GET" },
        accessToken,
    );
}

export async function getInterests(
    accessToken: string,
) {
    return apiFetch(
        "/profile/interests",
        { method: "GET" },
        accessToken,
    );
}

export async function updateProfile(
    displayName: string,
    major: string,
    gradDate: number,
    accessToken: string | null,
    bio: string = '',
) {
    return apiFetch(
        "/profile/me",
        {
            method: "PUT",
            body: JSON.stringify({
                display_name: displayName,
                major: major,
                graduation_year: gradDate,
                bio: bio,
            }),
        },
        accessToken ? accessToken : '',
    );
}

export async function putMeProfileComplete(
    accessToken: string
) {
    return apiFetch(
        "/profile/me/complete",
        {
            method: "PUT",
        },
        accessToken,
    );
}

export async function putMePhoto(
    photoUrl: string,
    accessToken: string,
) {
    return apiFetch(
        "/profile/me/photo",
        {
            method: "PUT",
            body: JSON.stringify({
                photoUrl: photoUrl,
            })
        },
        accessToken,
    );
}

export async function updateCourses(
    courses: number[],
    accessToken: string,
) {
    return apiFetch(
        "/profile/me/courses",
        {
            method: "PUT",
            body: JSON.stringify({
                courses: courses,
            })
        },
        accessToken,
    );
}

export async function updateInterests(
    interests: number[],
    accessToken: string,
) {
    return apiFetch(
        "/profile/me/interests",
        {
            method: "PUT",
            body: JSON.stringify({
                interests: interests,
            })
        },
        accessToken,
    );
}

export async function deleteAccount(
    accessToken: string | null,
) {
    return apiFetch(
        "/profile/me",
        {
            method: "DELETE",
        },
        accessToken ? accessToken : "",
    );
}