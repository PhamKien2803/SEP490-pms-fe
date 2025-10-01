export const apiEndPoint = {
    LOGIN: 'pms/auth/login',
    LOGOUT: 'pms/auth/logout',
    CURRENT_USER: 'pms/auth/getCurrentUser',
    GET_FUNCTION: 'pms/functions/list',
    CREATE_FUNTION: 'pms/functions/create',
    UPDATE_FUNCTION: (id: string) => `pms/functions/update/${id}`,
    DELETE_FUNCTION: (id: string) => `pms/functions/delete/${id}`,
};
