import * as SecureStore from 'expo-secure-store';

// Change this to http://10.0.2.2:3000 if running in Android Studio
export const backendURL = "http://localhost:3000"

/**
 * Makes a fetch request with locally stored authorization tokens.
 * 
 * Updates locally stored authorization tokens automatically if the `Set-Session-Tokens` header is included in the response
 * @param input url to make the fetch request to
 * @param init data included in the fetch request
 * @param useSession Whether or not session tokens should be fetched from SecureStore prior to making the request
 * @returns Response of the fetch request
 */
export async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit, useSession: boolean = true) {
    // Define init and get headers
    // console.log(input);
    if (init === undefined){
        init = {};
    }
    const headers = new Headers(init.headers);

    // Get tokens
    var [ accessToken, refreshToken ] = useSession ? await Promise.all([SecureStore.getItemAsync('accessToken'), SecureStore.getItemAsync('refreshToken')]) : [ null, null ];

    if (accessToken !== null && refreshToken !== null){
        headers.set('Authorization', `Bearer ${accessToken} ${refreshToken}`)
    }

    // Update headers with tokens
    init.headers = headers;

    // Make fetch request
    const response = await fetch(input, init);

    // Update locally stored session tokens
    const tokens = response.headers.get("Set-Session-Tokens")

    if (tokens){
        [ accessToken, refreshToken ] = tokens.split(' ')
        await Promise.all([SecureStore.setItemAsync('accessToken', accessToken), SecureStore.setItemAsync('refreshToken', refreshToken)]);
    }

    return response;
}

/**
 * Makes a fetch to the server backend and manages session tokens
 * 
 * Updates locally stored authorization tokens automatically if the `Set-Session-Tokens` header is included in the response
 * @param input url to make the fetch request to
 * @param init data included in the fetch request
 * @param useSession Whether or not session tokens should be fetched from SecureStore prior to making the request
 * @returns Response of the fetch request
 */
export async function fetchFromBackend(input: string, init?: RequestInit, useSession: boolean = true) {
    return fetchWithAuth(new URL(input, backendURL), init, useSession)
}

export async function isSignedIn(){
    // Get tokens
    var [ accessToken, refreshToken ] = await Promise.all([SecureStore.getItemAsync('accessToken'), SecureStore.getItemAsync('refreshToken')]);
    return accessToken !== null && refreshToken !== null;
}
