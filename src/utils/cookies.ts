import { SessionStorageKey } from '../types/session-storage';

interface CookieUtilsType {
    setCookie: (name: string, value: string, days?: number) => void;
    getCookie: (name: string) => string | null;
    deleteCookie: (name: string) => void;
}

export const CookieUtils: CookieUtilsType = {
    setCookie: (name: string, value: string, days?: number): void => {
        let expires = '';
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/';
    },

    getCookie: (name: string): string | null => {
        const nameEQ = name + '=';
        const cookies = document.cookie.split('; ');
        for (const cookie of cookies) {
            if (cookie.indexOf(nameEQ) === 0) {
                return decodeURIComponent(cookie.substring(nameEQ.length));
            }
        }
        return null;
    },

    deleteCookie: (name: string): void => {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    },
};

export const clearCreateProjectSessionStorage = () => {
    sessionStorage.removeItem(SessionStorageKey.USER_TOKEN);
};
