import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';
import NotFound from '../pages/not-found/NotFound';
import { routes } from './role/routes';
import PMSHome from '../pages/homepage/PMShome';
import Login from '../pages/login/Login';
import ForgotPassword from '../pages/forgot-password/ForgotPassword';
import UnauthorizedPage from '../pages/not-found/UnauthorizedPage';
import Enrollment from '../pages/enrollment/Enrollment';

const router = createBrowserRouter([
    {
        element: <PublicRoute />,
        children: [
            { path: '/', element: <PMSHome /> },
            { path: '/login', element: <Login /> },
            { path: '/forgot-password', element: <ForgotPassword /> },
            { path: '/enrollment', element: <Enrollment /> }
        ],
    },
    {
        element: <PrivateRoute />,
        children: [
            ...routes,
        ],
    },
    {
        path: '/unauthorized',
        element: <UnauthorizedPage />,
    },
    {
        path: '*',
        element: <NotFound />,
    },
]);

export const AppRouter = () => <RouterProvider router={router} />;