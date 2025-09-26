import { useEffect, useState } from 'react';
import { LocalStorageKey } from '@/types/local-storage';

export const useLocalStorage = <T>(
    key: LocalStorageKey,
    initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState<T>(() => {
        try {
            const localStorageValue = localStorage.getItem(key);
            if (typeof localStorageValue !== 'string') {
                localStorage.setItem(key, JSON.stringify(initialValue));
                return initialValue;
            } else {
                return JSON.parse(localStorageValue);
            }
        } catch {
            // If user is in private mode or has storage restriction
            // localStorage can throw. JSON.parse and JSON.stringify
            // can throw, too.
            return initialValue;
        }
    });

    // Save state to localStorage
    useEffect(() => {
        try {
            const serializedState = JSON.stringify(state);
            localStorage.setItem(key, serializedState);
        } catch {
            // If user is in private mode or has storage restriction
            // localStorage can throw. Also JSON.stringify can throw.
        }
    }, [state, key]);

    return [state, setState];
};
