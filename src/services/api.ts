import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    if (config.data instanceof FormData) {
        // Let browser/axios set multipart boundary (with boundary) automatically.
        if (config.headers) {
            delete (config.headers as Record<string, unknown>)['Content-Type'];
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const isAdminArea = window.location.pathname.startsWith('/admin');
            window.location.href = isAdminArea ? '/admin-login' : '/login';
        }

        return Promise.reject(error);
    }
);

export default api;
