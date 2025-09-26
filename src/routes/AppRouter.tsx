import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';
import NotFound from '../pages/not-found/NotFound';
import { routesAdmin } from './role/admin.routes';
import { routesTeacher } from './role/teacher.routes';
import { routesParent } from './role/parent.routes';
import { routesStaff } from './role/staff.routes';
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
            ...routesAdmin,
            ...routesTeacher,
            ...routesParent,
            ...routesStaff,
        ],
    },
    {
        path: '*',
        element: <NotFound />,
    },
]);

export const AppRouter = () => <RouterProvider router={router} />;
