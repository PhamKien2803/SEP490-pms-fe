import { useEffect, useState } from 'react';
import { SessionStorageKey } from '@/types/session-storage';

export const useSessionStorage = <T>(
    key: SessionStorageKey,
    initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState<T>(() => {
        try {
            const sessionStorageValue = sessionStorage.getItem(key);
            if (typeof sessionStorageValue !== 'string') {
                sessionStorage.setItem(key, JSON.stringify(initialValue));
                return initialValue;
            } else {
                const parsedValue = JSON.parse(sessionStorageValue);
                // Handle the case where the stored value is null
                if (parsedValue === null) {
                    sessionStorage.setItem(key, JSON.stringify(initialValue));
                    return initialValue;
                }
                return parsedValue;
            }
        } catch {
            // If user is in private mode or has storage restriction
            // sessionStorage can throw. JSON.parse and JSON.stringify
            // can throw, too.
            return initialValue;
        }
    });

    // Save state to sessionStorage
    useEffect(() => {
        try {
            const serializedState = JSON.stringify(state);
            sessionStorage.setItem(key, serializedState);
        } catch {
            // If user is in private mode or has storage restriction
            // sessionStorage can throw. Also JSON.stringify can throw.
        }
    }, [state, key]);

    return [state, setState];
};
