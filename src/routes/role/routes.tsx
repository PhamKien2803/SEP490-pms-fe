import { RouteObject } from 'react-router-dom';
import PrivateRoute from '../PrivateRoute';
import Dashboard from '../../pages/dash-board/Dashboard';
import UserManagement from '../../pages/user-management/UserManagement';
import { constants } from '../../constants';
import RolePermission from '../../pages/role-permission/RolePermission';

export const routes: RouteObject[] = [
    {
        path: constants.APP_PREFIX,
        element: <PrivateRoute requireFunction={constants.APP_PREFIX} requireAction="view" />,
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
                                requireFunction={`${constants.APP_PREFIX}/accounts`}
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
                    {
                        path: "roles",
                        element: (
                            <PrivateRoute
                                requireFunction={`${constants.APP_PREFIX}/roles`}
                                requireAction="view"
                            />
                        ),
                        children: [
                            {
                                index: true,
                                element: <RolePermission />,
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

