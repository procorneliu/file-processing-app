type JWTPayload = {
  sub: string;
  email?: string;
  exp: number;
  [key: string]: unknown;
};

export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    // Fix base64 padding
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }

    const decoded = atob(base64);
    return JSON.parse(decoded) as JWTPayload;
  } catch {
    return null;
  }
}
