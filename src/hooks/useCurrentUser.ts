import { useAuth } from '@/context/AuthContext';

export function useCurrentUser() {
    const { user } = useAuth();
    if (!user) {
        throw new Error('useCurrentUser must be used when user is authenticated');
    }
    return user;
}
