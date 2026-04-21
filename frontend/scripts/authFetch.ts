import * as SecureStore from 'expo-secure-store';

/**
 * Makes a fetch request with locally stored authorization tokens.
 * 
 * Updates locally stored authorization tokens automatically if the `Set-Session-Tokens` header
 * @param input url to make the fetch request to
 * @param init data included in the fetch request
 * @returns Response of the fetch request
 */
export async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit) {
    // Define init and get headers
    if (init === undefined){
        init = {};
    }
    const headers = new Headers(init.headers);

    // Get tokens
    var [ accessToken, refreshToken ] = await Promise.all([SecureStore.getItemAsync('accessToken'), SecureStore.getItemAsync('refreshToken')]);

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