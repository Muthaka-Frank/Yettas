// Utility function to decode JWT payload (not for validation!)
export const decodeJwt = (token) => {
    if (!token) return null;
    try {
        // JWTs have three parts: Header.Payload.Signature
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;

        // Convert Base64Url to Base64, then decode
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join('')
        );

        // The 'exp' (expiration) property is included here for the AuthProvider
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Failed to decode JWT:", error);
        return null;
    }
};