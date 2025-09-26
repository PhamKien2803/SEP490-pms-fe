import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry(failureCount, error: Error | AxiosError) {
                if (
                    failureCount > 1 ||
                    [401, 403].some(
                        code =>
                            error.message.includes(code.toString()) ||
                            (error instanceof AxiosError && !!error.status && code == error.status)
                    )
                )
                    return false;
                return true;
            },
            retryDelay: 3000,
            refetchOnWindowFocus: false,
        },
    },
});
