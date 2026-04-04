import api from './api';

export const login = async (data: { username: string; password: string }) => {
    await api.post('/auth/login', data);
};

export const logout = async () => {
    await api.post('/auth/logout');
    window.location.href = '/login';
};