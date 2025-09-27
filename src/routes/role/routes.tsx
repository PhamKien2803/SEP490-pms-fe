import { RouteObject } from 'react-router-dom';
import PrivateRoute from '../PrivateRoute';
import Dashboard from '../../pages/dash-board/Dashboard';
import UserManagement from '../../pages/user-management/UserManagement';

export const routes: RouteObject[] = [
    {
        path: "/pms",
        element: <PrivateRoute requireFunction="/pms" requireAction="view" />,
        children: [
            {
                path: "",
                element: <Dashboard />,
                children: [
                    {
                        index: true,
                        element: <div>Trang chủ PMS</div>,
                    },
                    {
                        path: "accounts",
                        element: (
                            <PrivateRoute
                                requireFunction="/pms/accounts"
                                requireAction="view"
                            />
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
        ],
    },
];

