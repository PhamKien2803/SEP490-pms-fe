import axios from 'axios';
import { CookieUtils } from '../utils/cookies';
import { constants } from '../constants';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach token dynamically using interceptors
axiosInstance.interceptors.request.use(
    config => {
        const token = CookieUtils.getCookie(constants.TOKEN); // Get token from cookies
        if (token) {
            config.headers.Authorization = `${constants.BEARER} ${token}`;
        }
        return config;
    },
    error => {
        // Handle the request error
        return Promise.reject(error);
    }
);

export default axiosInstance;
