import { RouteObject } from 'react-router-dom';
import PrivateRoute from '../PrivateRoute';
import AdminDashboard from '../../pages/dash-board/AdminDashboard';
import UserManagement from '../../pages/user-management/UserManagement';


export const routesAdmin: RouteObject[] = [
    {
        path: '/admin',
        element: (
            <PrivateRoute requireFunction="/admin" requireAction="view" />
        ),
        children: [
            {
                index: true,
                element: <AdminDashboard />,
            },
            {
                path: 'users',
                element: (
                    <PrivateRoute requireFunction="/accounts" requireAction="view" />
                ),
                children: [
                    {
                        index: true,
                        element: <UserManagement />,
                    },
                ],
            },
        ],
    },
];
