import client from './client';

const login = (username, password) => client.post('auth/login/', { username, password });

export default {
    login,
}