import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';
import NotFound from '../pages/not-found/NotFound';
import { routes } from './role/routes';
import PMSHome from '../pages/homepage/PMShome';
import Login from '../pages/login/Login';
import ForgotPassword from '../pages/forgot-password/ForgotPassword';

const router = createBrowserRouter([
    {
        element: <PublicRoute />,
        children: [
            { path: '/', element: <PMSHome /> },
            { path: '/login', element: <Login /> },
            { path: '/forgot-password', element: <ForgotPassword /> },
        ],
    },
    {
        element: <PrivateRoute />,
        children: [
            ...routes,
        ],
    },
    {
        path: '*',
        element: <NotFound />,
    },
]);

export const AppRouter = () => <RouterProvider router={router} />;