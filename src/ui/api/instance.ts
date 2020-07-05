import axios from 'axios';

const instance = axios.create({
    baseURL: '/',
});

instance.interceptors.request.use((config) => {
    config.headers = {
        ...config.headers,
        Authorization: gapi.auth2
            .getAuthInstance()
            .currentUser.get()
            .getAuthResponse().id_token,
    } as unknown;
    return config;
});

export default instance;
