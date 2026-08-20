import { apiFetch } from '../services/api';

export async function initializeProfile(
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