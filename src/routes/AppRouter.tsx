import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Layout wrappers
import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';

// Pages
import LoginPage from '@/pages/login/Login';
import ForgotPasswordPage from '@/pages/forgot-password/ForgotPassword';
import PMSHome from '@/pages/homepage/PMShome';
import HomePage from '@/pages/homepage/PMShome';
import NotFound from '@/pages/not-found/NotFound';

const router = createBrowserRouter([
    //Public Landing Page (khách truy cập)
    {
        path: '/',
        element: <PMSHome />,
    },
    {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
    },
    //Public routes (chưa login)
    // {
    //     element: <PublicRoute />,
    //     children: [
    //         {
    //             path: '/login',
    //             element: <LoginPage />,
    //         },
    //         {
    //             path: '/forgot-password',
    //             element: <ForgotPasswordPage />,
    //         },
    //     ],
    // },

    //Private routes (sau khi login)
    {
        element: <PrivateRoute />,
        children: [
            {
                path: '/home',
                element: <HomePage />,
            },
        ],
    },

    //404 fallback
    {
        path: '*',
        element: <NotFound />,
    },
]);

const AppRouter = () => <RouterProvider router={router} />;
export default AppRouter;
