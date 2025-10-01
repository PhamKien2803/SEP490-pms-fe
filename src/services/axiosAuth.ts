import axios, { AxiosError } from 'axios';
import { notification } from 'antd';
import { constants } from '../constants';
import { messages } from '../constants/message';

const axiosAuth = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosAuth.interceptors.request.use(
    config => {
        const token = sessionStorage.getItem(constants.TOKEN);
        if (token) {
            config.headers.Authorization = `${constants.BEARER} ${token}`;
        }
        return config;
    },
    error => {
        notification.error({
            message: messages.AN_UNKNOWN_ERROR_OCCURRED,
        });
        return Promise.reject(error);
    }
);

axiosAuth.interceptors.response.use(
    response => response,
    error => {
        const status = error.response ? error.response.status : null;

        if (status === 401) {
            if (
                error instanceof AxiosError &&
                window.location.pathname !== '/auth/login'
            ) {
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
            }
        }

        if (!error?.response?.data?.silent) {
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
