import api from './api';

export const login = async (credentials: any) => {
    const params = new URLSearchParams();
    params.append('username', credentials.username);
    params.append('password', credentials.password);

    const response = await api.post('/api/auth/login', params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    return response.data;
};

export const register = async (userData: any) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
};
