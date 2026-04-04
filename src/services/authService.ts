import api from './api';
import { LoginRequest, LoginResponse } from '../types/auth';

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
};

export const logout = async () => {
    await api.post('/auth/logout')
    window.location.href = '/login'
}

