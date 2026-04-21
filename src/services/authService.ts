import api from './api';

export const login = async (data: { username: string; password: string }) => {
    await api.post('/auth/login', data);
};

export const logout = async () => {
    await api.post('/auth/logout');
    const isAdminArea = window.location.pathname.startsWith('/admin');
    window.location.href = isAdminArea ? '/admin-login' : '/login';
};