export const apiEndPoint = {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    CURRENT_USER: '/auth/getCurrentUser',
    GET_FUNCTION: '/functions/list',
    CREATE_FUNTION: '/functions/create',
    UPDATE_FUNCTION: (id: string) => `/functions/update/${id}`,
    DELETE_FUNCTION: (id: string) => `/functions/delete/${id}`,
};
