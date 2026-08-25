import { apiFetch } from '../services/api';

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

export async function getMyProfile(
    accessToken: string,
) {
    return apiFetch(
        "/profile/me",
        { method: "GET",},
        accessToken,
    );
}