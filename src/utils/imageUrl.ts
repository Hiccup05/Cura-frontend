

const isActionEndpoint = (url: string): boolean => {
    const normalized = url.toLowerCase();
    if (normalized.includes('/user/profile/picture')) return true;
    if (normalized.includes('/api/')) return true;
    return false;
};



export const resolveImageUrl = (rawUrl?: string | null): string | null => {
    if (!rawUrl || typeof rawUrl !== 'string') return null;

    const value = rawUrl.trim();
    if (!value) return null;


    const isAbsolute =
        /^https?:\/\//i.test(value) ||
        value.startsWith('data:') ||
        value.startsWith('blob:');

    if (!isAbsolute) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('[resolveImageUrl] Blocked non-absolute profilePictureUrl:', value);
        }
        return null;
    }

    if (isActionEndpoint(value)) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('[resolveImageUrl] Blocked API endpoint used as image URL:', value);
        }
        return null;
    }

    return value;
};
