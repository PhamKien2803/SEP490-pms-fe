import axios, { AxiosError } from 'axios';
import { notification } from 'antd';
import { CookieUtils } from '../utils/cookies';
import { constants } from '../constants';
import { messages } from '../constants/message';


const axiosAuth = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach token dynamically using interceptors
axiosAuth.interceptors.request.use(
    config => {
        const token = CookieUtils.getCookie(constants.TOKEN); // Get token from cookies
        if (token) {
            config.headers.Authorization = `${constants.BEARER} ${token}`;
        }
        return config;
    },
    error => {
        // Handle the request error
        notification.error({
            message: messages.AN_UNKNOWN_ERROR_OCCURRED,
        });
        return Promise.reject(error);
    }
);

// Handle response errors using an interceptor
axiosAuth.interceptors.response.use(
    response => response,
    error => {
        const status = error.response ? error.response.status : null;
        /** Redirect to Login page if response status is 401
         * Note: Don't redirect on api request from apiEndPoint.CURRENT_USER because that the first request when app load,
         * which will make infinite loop of redirecting.
         */
        if (status === 401) {
            if (error instanceof AxiosError && window.location.pathname !== '/auth/login') {
                window.location.pathname = '/auth/login';
            }
        }
        let errorMessage = messages.AN_UNKNOWN_ERROR_OCCURRED;
        if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
            error.message = errorMessage;
        } else {
            switch (status) {
                case 401:
                    errorMessage = messages.MSG_ERROR_CODE_401;
                    break;

                case 403:
                    errorMessage = messages.MSG_ERROR_CODE_403;
                    break;

                case 404:
                    errorMessage = messages.MSG_ERROR_CODE_404;
                    break;

                case 500:
                    errorMessage = messages.MSG_ERROR_CODE_500;
                    break;

                case 503:
                    errorMessage = messages.MSG_ERROR_CODE_503;
                    break;

                default:
                    if (error.response?.data?.message) {
                        errorMessage = error.response.data?.message ?? messages.AN_UNKNOWN_ERROR_OCCURRED;
                    }
            }
        }

        // Only toast errors when there is no silent attr or slient is false
        if (!error?.response?.data?.silent) {
            // Show notification error
            notification.error({
                key: errorMessage,
                message: constants.REQUEST_FAILED,
                description: errorMessage,
            });
        }

        return Promise.reject(error);
    }
);

export default axiosAuth;
